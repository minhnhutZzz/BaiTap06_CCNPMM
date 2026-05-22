import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cartService from '../services/cart.service';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu giỏ hàng khi mở trang
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.success) {
        setCartItems(res.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng (+ / -)
  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.Product.stock) {
      alert('Số lượng vượt quá hàng tồn kho!');
      return;
    }

    try {
      const res = await cartService.updateCartItem(item.id, newQuantity);
      if (res.success) {
        // Cập nhật lại giao diện ngay lập tức mà không cần gọi API fetchCart()
        setCartItems(prev =>
          prev.map(i => (i.id === item.id ? { ...i, quantity: newQuantity } : i))
        );
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật số lượng');
    }
  };

  // Xóa món hàng
  const handleRemove = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa món này khỏi giỏ hàng?')) return;
    
    try {
      const res = await cartService.removeCartItem(id);
      if (res.success) {
        // Xóa món đó khỏi mảng giao diện
        setCartItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa món hàng');
    }
  };

  // Tính tổng tiền
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.Product.discount_price || item.Product.price;
      return total + price * item.quantity;
    }, 0);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ Hàng Của Bạn</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Hãy quay lại trang chủ để chọn món trà sữa yêu thích nhé!</p>
          <Link to="/user" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-xl transition-colors">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Danh sách món hàng (Bên trái) */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {cartItems.map((item) => {
                const product = item.Product;
                const price = product.discount_price || product.price;

                return (
                  <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    {/* Hình ảnh */}
                    <img 
                      src={product.thumbnail || 'https://via.placeholder.com/100'} 
                      alt={product.name} 
                      className="w-24 h-24 object-cover rounded-lg shadow-sm"
                    />

                    {/* Thông tin */}
                    <div className="flex-1 text-center sm:text-left">
                      <Link to={`/user/products/${product.id}`} className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                        {product.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">Danh mục: {product.Category?.name}</p>
                      <p className="text-indigo-600 font-bold mt-2">{Number(price).toLocaleString('vi-VN')} đ</p>
                    </div>

                    {/* Nút Số lượng */}
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                      <button onClick={() => handleQuantityChange(item, item.quantity - 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg font-bold">-</button>
                      <span className="px-4 py-1 border-x border-gray-300 font-semibold">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item, item.quantity + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg font-bold">+</button>
                    </div>

                    {/* Tổng giá 1 món & Nút Xóa */}
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-bold text-gray-900">{(price * item.quantity).toLocaleString('vi-VN')} đ</p>
                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        Xóa bỏ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tóm tắt đơn hàng (Bên phải) */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Tóm tắt đơn hàng</h2>
              
              <div className="flex justify-between text-gray-600 mb-4">
                <span>Tạm tính ({cartItems.length} món)</span>
                <span>{calculateTotal().toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-6">
                <span>Phí giao hàng</span>
                <span className="text-green-600">Miễn phí</span>
              </div>

              <div className="flex justify-between text-gray-900 font-bold text-xl mb-8 pt-4 border-t border-gray-100">
                <span>Tổng cộng</span>
                <span className="text-indigo-600">{calculateTotal().toLocaleString('vi-VN')} đ</span>
              </div>

              <Link 
                to="/user/checkout"
                className="block text-center w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:-translate-y-1"
              >
                Tiến Hành Thanh Toán
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
