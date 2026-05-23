const crypto = require('crypto');
const vnpayConfig = require('../config/vnpay');

/**
 * sortObject theo đúng chuẩn VNPay:
 * - Encode cả key và value bằng encodeURIComponent
 * - Thay %20 thành + (dấu cách)
 * - Sort alphabetically
 */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[encodeURIComponent(key).replace(/%20/g, '+')] =
      encodeURIComponent(obj[key]).replace(/%20/g, '+');
  }
  return sorted;
}

const paymentController = {
  // Tạo URL thanh toán VNPay Sandbox
  createVnpayUrl: (req, res) => {
    try {
      const { orderId, amount } = req.body;
      if (!orderId || !amount) {
        return res.status(400).json({ success: false, message: 'Thiếu orderId hoặc amount' });
      }

      const ipAddr =
        req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        '127.0.0.1';

      // Format ngày giờ: YYYYMMDDHHmmss
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const createDate = [
        now.getFullYear(),
        pad(now.getMonth() + 1),
        pad(now.getDate()),
        pad(now.getHours()),
        pad(now.getMinutes()),
        pad(now.getSeconds()),
      ].join('');

      // Tham số VNPay (giá trị raw - chưa encode)
      const vnpParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnpayConfig.vnp_TmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: String(orderId),
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      // Sort + encode theo chuẩn VNPay
      const sortedParams = sortObject(vnpParams);

      // Tạo chuỗi để ký (keys và values đã được encode từ sortObject)
      const signData = Object.entries(sortedParams)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');

      // HMAC-SHA512
      const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      // Build URL: dùng sortedParams (đã encode) + thêm hash
      const payUrl =
        vnpayConfig.vnp_Url +
        '?' +
        signData +
        `&vnp_SecureHash=${signed}`;

      return res.json({ success: true, payUrl });
    } catch (error) {
      console.error('Lỗi tạo VNPay URL:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi tạo URL thanh toán' });
    }
  },

  // Xác minh chữ ký trả về từ VNPay
  verifyReturn: async (req, res) => {
    try {
      const params = { ...req.query };
      const secureHash = params.vnp_SecureHash;

      delete params.vnp_SecureHash;
      delete params.vnp_SecureHashType;

      // Sort + encode giống như lúc ký
      const sortedParams = sortObject(params);

      const signData = Object.entries(sortedParams)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');

      const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      const isValid = secureHash === signed;
      const isSuccess = params.vnp_ResponseCode === '00';

      // Nếu hợp lệ và thành công -> Cập nhật trạng thái thanh toán của đơn hàng
      if (isValid && isSuccess) {
        const { Order } = require('../models');
        await Order.update(
          { payment_status: 'paid' },
          { where: { id: params.vnp_TxnRef } }
        );
      }

      return res.json({
        success: true,
        isValid,
        isSuccess,
        responseCode: params.vnp_ResponseCode,
        orderId: params.vnp_TxnRef,
        amount: parseInt(params.vnp_Amount) / 100,
        transactionNo: params.vnp_TransactionNo,
        bankCode: params.vnp_BankCode,
        payDate: params.vnp_PayDate,
      });
    } catch (error) {
      console.error('Lỗi xác minh VNPay:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi xác minh thanh toán' });
    }
  },
};

module.exports = paymentController;
