import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../services/axiosClient';

// Map mã phản hồi VNPay sang thông tin hiển thị
const RESPONSE_MESSAGES = {
  '00': { status: 'success', title: 'Thanh toán thành công!', desc: 'Giao dịch của bạn đã được VNPay xác nhận.' },
  '07': { status: 'success', title: 'Giao dịch thành công', desc: 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, bất thường).' },
  '09': { status: 'error', title: 'Thẻ/Tài khoản chưa đăng ký', desc: 'Thẻ/Tài khoản của KH chưa đăng ký dịch vụ InternetBanking tại ngân hàng.' },
  '10': { status: 'error', title: 'Xác thực sai quá 3 lần', desc: 'KH đã xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.' },
  '11': { status: 'error', title: 'Hết hạn chờ thanh toán', desc: 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.' },
  '12': { status: 'error', title: 'Thẻ/Tài khoản bị khóa', desc: 'Thẻ/Tài khoản của KH bị khóa.' },
  '13': { status: 'error', title: 'Sai OTP', desc: 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin vui lòng thực hiện lại giao dịch.' },
  '24': { status: 'cancelled', title: 'Bạn đã hủy giao dịch', desc: 'Khách hàng hủy giao dịch.' },
  '51': { status: 'error', title: 'Tài khoản không đủ số dư', desc: 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.' },
  '65': { status: 'error', title: 'Vượt hạn mức giao dịch', desc: 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.' },
  '75': { status: 'error', title: 'Ngân hàng bảo trì', desc: 'Ngân hàng thanh toán đang bảo trì.' },
  '79': { status: 'error', title: 'Nhập sai mật khẩu', desc: 'KH nhập sai mật khẩu thanh toán quá số lần quy định.' },
};

const VnpayReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        // Gửi toàn bộ query params về backend để xác minh chữ ký
        const params = Object.fromEntries(searchParams.entries());
        const res = await axiosClient.get('/payment/vnpay/verify', { params });

        if (res.data.success && res.data.isValid) {
          setResult({
            ...res.data,
            info: RESPONSE_MESSAGES[res.data.responseCode] || {
              status: 'error',
              title: 'Giao dịch không xác định',
              desc: `Mã lỗi: ${res.data.responseCode}`
            }
          });
        } else {
          setResult({ info: { status: 'error', title: 'Chữ ký không hợp lệ', desc: 'Kết quả thanh toán không thể xác minh.' } });
        }
      } catch (error) {
        console.error('Lỗi xác minh VNPay:', error);
        setResult({ info: { status: 'error', title: 'Lỗi kết nối', desc: 'Không thể xác minh kết quả thanh toán.' } });
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-gray-600 font-medium">Đang xác minh kết quả thanh toán...</p>
      </div>
    );
  }

  const { info } = result;

  const iconMap = {
    success: (
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    cancelled: (
      <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
        </svg>
      </div>
    ),
    error: (
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-10 text-center">
        {iconMap[info.status]}

        <h1 className={`text-2xl font-bold mb-2 ${
          info.status === 'success' ? 'text-green-700' :
          info.status === 'cancelled' ? 'text-yellow-700' : 'text-red-700'
        }`}>
          {info.title}
        </h1>
        <p className="text-gray-500 mb-6">{info.desc}</p>

        {/* Thông tin giao dịch */}
        {result.orderId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Mã đơn hàng:</span>
              <span className="font-bold text-gray-900">#{result.orderId}</span>
            </div>
            {result.amount && (
              <div className="flex justify-between">
                <span className="text-gray-500">Số tiền:</span>
                <span className="font-bold text-indigo-600">{Number(result.amount).toLocaleString('vi-VN')} đ</span>
              </div>
            )}
            {result.transactionNo && (
              <div className="flex justify-between">
                <span className="text-gray-500">Mã GD VNPay:</span>
                <span className="font-mono text-gray-700">{result.transactionNo}</span>
              </div>
            )}
            {result.bankCode && (
              <div className="flex justify-between">
                <span className="text-gray-500">Ngân hàng:</span>
                <span className="font-bold text-gray-900">{result.bankCode}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Link
            to="/user/orders"
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
          >
            Xem đơn hàng
          </Link>
          <Link
            to="/user/home"
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VnpayReturn;
