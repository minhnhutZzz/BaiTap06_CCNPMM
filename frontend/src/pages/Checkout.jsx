import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cartService from '../services/cart.service';
import orderService from '../services/order.service';
import axiosClient from '../services/axiosClient';

// Danh sách phương thức thanh toán
const PAYMENT_METHODS = [
  {
    id: 'COD',
    name: 'Tiền mặt khi nhận hàng (COD)',
    icon: '💵',
    description: 'Thanh toán trực tiếp khi shipper giao hàng',
    detail: null
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: '🔴',
    description: 'Thanh toán qua cổng VNPay (ATM/Visa/QR)',
    detail: {
      lines: [
        'ℹ️ Sau khi đặt hàng, bạn sẽ được chuyển đến',
        'cổng thanh toán VNPay để hoàn tất giao dịch.',
        '✅ Hỗ trợ: ATM nội địa, Visa, Mastercard, QR VNPay'
      ]
    }
  }
];

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('COD');

  const [formData, setFormData] = useState({
    phone_number: '',
    shipping_address: '',
    note: ''
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.success) {
        if (res.data.length === 0) {
          alert('Giỏ hàng trống, vui lòng chọn món trước khi thanh toán!');
          navigate('/user/cart');
        } else {
          setCartItems(res.data);
        }
      }
    } catch (error) {
      console.error('Lỗi lấy giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () =>
    cartItems.reduce((total, item) => {
      const price = item.Product.discount_price || item.Product.price;
      return total + price * item.quantity;
    }, 0);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.phone_number || !formData.shipping_address) {
      alert('Vui lòng điền đầy đủ Địa chỉ và Số điện thoại!');
      return;
    }

    try {
      setIsSubmitting(true);

      // Bước 1: Tạo đơn hàng trước
      const res = await orderService.createOrder({
        ...formData,
        payment_method: selectedPayment
      });

      if (!res.success) throw new Error(res.message);

      const orderId = res.data?.id;
      const total = calculateTotal();

      // Bước 2: Nếu chọn VNPay thì gọi API tạo URL thanh toán rồi redirect
      if (selectedPayment === 'vnpay') {
        const vnpRes = await axiosClient.post('/payment/vnpay/create', {
          orderId,
          amount: total
        });
        if (vnpRes.data.success) {
          // Redirect khỏi trang sang cổng VNPay
          window.location.href = vnpRes.data.payUrl;
          return; // Dừng lại, không chạy navigate
        }
      }

      // Các phương thức khác: thông báo thành công
      const method = PAYMENT_METHODS.find(m => m.id === selectedPayment);
      alert(`🎉 Đặt hàng thành công!\nPhương thức: ${method.name}`);
      navigate('/user/orders');
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedPayment);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh Toán</h1>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Cột Trái: Form */}
        <div className="lg:w-2/3 space-y-6">

          {/* Thông tin giao hàng */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Thông tin giao hàng</h2>
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại người nhận (*)</label>
                <input
                  type="tel" name="phone_number" value={formData.phone_number}
                  onChange={handleInputChange} required
                  placeholder="Ví dụ: 0987654321"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ giao hàng (*)</label>
                <input
                  type="text" name="shipping_address" value={formData.shipping_address}
                  onChange={handleInputChange} required
                  placeholder="Ví dụ: Số 1 Võ Văn Ngân, Thủ Đức, TP.HCM"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (Tùy chọn)</label>
                <textarea
                  name="note" value={formData.note} onChange={handleInputChange}
                  placeholder="Ví dụ: Ít đá, nhiều đường, giao giờ hành chính..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </form>
          </div>

          {/* Phương thức thanh toán */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map(method => (
                <label
                  key={method.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === method.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                  <input
                    type="radio" name="payment" value={method.id}
                    checked={selectedPayment === method.id}
                    onChange={() => setSelectedPayment(method.id)}
                    className="mt-1 accent-indigo-600"
                  />
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{method.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{method.description}</p>
                  </div>
                  {selectedPayment === method.id && (
                    <span className="text-indigo-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </label>
              ))}
            </div>

            {/* Hiển thị thông tin chi tiết theo phương thức được chọn */}
            {selectedMethod?.detail && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm font-semibold text-amber-800 mb-2">📋 Thông tin thanh toán:</p>
                {selectedMethod.detail.lines.map((line, i) => (
                  <p key={i} className="text-sm text-amber-700 leading-relaxed">{line}</p>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Cột Phải: Tóm tắt */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Tóm tắt đơn hàng</h2>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600">{item.quantity}x</span>
                    <span className="text-gray-700 truncate max-w-[140px]">{item.Product.name}</span>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {((item.Product.discount_price || item.Product.price) * item.quantity).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{calculateTotal().toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí giao hàng</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Thanh toán</span>
                <span className="font-medium">{selectedMethod?.icon} {selectedMethod?.name.split(' (')[0]}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-xl pt-3 border-t border-gray-100">
                <span>Tổng cộng</span>
                <span className="text-indigo-600">{calculateTotal().toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-bold py-4 rounded-xl shadow-lg transform transition text-white ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1'
                }`}
            >
              {isSubmitting ? 'Đang xử lý...' : `Xác Nhận Đặt Hàng`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
