// Cấu hình VNPay Sandbox - Dùng để demo/test (không mất tiền thật)
module.exports = {
  vnp_TmnCode: process.env.VNP_TMN_CODE || 'ZIDXRYUM',
  vnp_HashSecret: process.env.VNP_HASH_SECRET || 'MK101YI25Y4XSQOQQUU1JE0AR5PJGET5',
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  // URL VNPay redirect về sau khi thanh toán xong
  vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:5173/payment/vnpay-return',
};
