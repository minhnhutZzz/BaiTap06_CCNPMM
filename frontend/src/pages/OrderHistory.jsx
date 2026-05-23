import React, { useEffect, useState } from 'react';
import orderService from '../services/order.service';

// Hàm helper để hiển thị trạng thái bằng tiếng Việt đẹp mắt
const getStatusDisplay = (status) => {
  const statusMap = {
    'new': { text: 'Đơn hàng mới', color: 'bg-blue-100 text-blue-800' },
    'confirmed': { text: 'Đã xác nhận', color: 'bg-indigo-100 text-indigo-800' },
    'preparing': { text: 'Shop đang chuẩn bị hàng', color: 'bg-yellow-100 text-yellow-800' },
    'delivering': { text: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800' },
    'delivered': { text: 'Đã giao thành công', color: 'bg-green-100 text-green-800' },
    'cancelled': { text: 'Đã hủy', color: 'bg-red-100 text-red-800' },
    'cancel_requested': { text: 'Chờ duyệt hủy đơn', color: 'bg-orange-100 text-orange-800' }
  };
  return statusMap[status] || { text: 'Không xác định', color: 'bg-gray-100 text-gray-800' };
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error('Lỗi lấy đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, currentStatus) => {
    let confirmMsg = 'Bạn có chắc chắn muốn hủy đơn hàng này?';
    if (currentStatus === 'preparing') {
      confirmMsg = 'Shop đang chuẩn bị hàng. Nếu bạn hủy, hệ thống sẽ gửi Yêu cầu hủy đơn cho Shop xem xét. Bạn có chắc chắn?';
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await orderService.cancelOrder(orderId);
      if (res.success) {
        alert(res.message);
        // Cập nhật lại UI ngay lập tức
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: res.new_status } : order
        ));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Lịch sử đơn hàng</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusDisplay(order.status);
            
            // Tính toán thời gian xem có còn được hủy không (trong vòng 30 phút)
            const orderTime = new Date(order.createdAt);
            const now = new Date();
            const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
            const canCancel = diffInMinutes <= 30 && ['new', 'confirmed', 'preparing'].includes(order.status);

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {/* Header của Đơn hàng */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn: <span className="font-bold text-gray-900">#{order.id}</span></p>
                    <p className="text-sm text-gray-500">Ngày đặt: {orderTime.toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                    
                    {/* Nút Hủy Đơn */}
                    {canCancel && (
                      <button 
                        onClick={() => handleCancelOrder(order.id, order.status)}
                        className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>

                {/* Danh sách món hàng */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img 
                          src={item.Product?.thumbnail || 'https://via.placeholder.com/60'} 
                          alt="Product" 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.Product?.name}</h4>
                          <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-600">{Number(item.price).toLocaleString('vi-VN')} đ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer tổng tiền */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex flex-col text-sm text-gray-600">
                    <span>
                      Thanh toán: <span className="font-semibold text-gray-800 uppercase">{order.payment_method}</span>
                    </span>
                    <span className="mt-1">
                      Trạng thái:{' '}
                      <span className={`font-semibold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                        {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600 mr-4">Tổng tiền:</span>
                    <span className="text-xl font-bold text-gray-900">{Number(order.total_price).toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
