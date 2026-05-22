import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cartService from '../services/cart.service';
import orderService from '../services/order.service';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
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
      alert('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.Product.discount_price || item.Product.price;
      return total + price * item.quantity;
    }, 0);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.phone_number || !formData.shipping_address) {
      alert('Vui lòng điền đầy đủ Địa chỉ và Số điện thoại!');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await orderService.createOrder(formData);
      
      if (res.success) {
        alert('🎉 Đặt hàng thành công! Đơn hàng sẽ được giao và thanh toán bằng tiền mặt (COD).');
        // Đặt hàng xong thì đẩy người dùng về trang chủ
        navigate('/user/home');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh Toán</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Cột Trái: Form điền thông tin */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Thông tin giao hàng</h2>
            
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại người nhận (*)</label>
                <input 
                  type="tel" 
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 0987654321"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ giao hàng (*)</label>
                <input 
                  type="text" 
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Số 1 Võ Văn Ngân, Thủ Đức, TP.HCM"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú cho quán (Tùy chọn)</label>
                <textarea 
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Giao vào giờ hành chính, trà sữa ít đá..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                ></textarea>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
                <div>
                  <h3 className="font-bold text-blue-900">Phương thức thanh toán</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    Theo quy định của cửa hàng, chúng tôi chỉ hỗ trợ thanh toán <strong>Tiền mặt khi nhận hàng (COD)</strong>. Các ví điện tử (Momo, ZaloPay) sẽ được cập nhật trong tương lai.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Cột Phải: Tóm tắt đơn hàng */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600">{item.quantity}x</span>
                    <span className="text-gray-700 truncate max-w-[150px]">{item.Product.name}</span>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {((item.Product.discount_price || item.Product.price) * item.quantity).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Tạm tính</span>
                <span>{calculateTotal().toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Phí giao hàng</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-xl mt-4 pt-4 border-t border-gray-100">
                <span>Tổng cộng</span>
                <span className="text-indigo-600">{calculateTotal().toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <button 
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className={`w-full font-bold py-4 rounded-xl shadow-lg transform transition ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:-translate-y-1'
              }`}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng (COD)'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
