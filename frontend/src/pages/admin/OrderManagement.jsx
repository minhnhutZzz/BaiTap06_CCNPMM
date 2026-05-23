import React, { useEffect, useState } from 'react';
import orderService from '../../../services/order.service';

const getStatusDisplay = (status) => {
  const statusMap = {
    'new': { text: 'Đơn hàng mới', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    'confirmed': { text: 'Đã xác nhận', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    'preparing': { text: 'Shop đang chuẩn bị', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'delivering': { text: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    'delivered': { text: 'Đã giao thành công', color: 'bg-green-100 text-green-800 border-green-200' },
    'cancelled': { text: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200' },
    'cancel_requested': { text: 'Khách xin hủy', color: 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse' }
  };
  return statusMap[status] || { text: 'Không xác định', color: 'bg-gray-100 text-gray-800' };
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrdersAdmin();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await orderService.updateOrderStatusAdmin(orderId, newStatus);
      if (res.success) {
        setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const renderActionButtons = (order) => {
    if (order.status === 'new') {
      return (
        <button onClick={() => handleUpdateStatus(order.id, 'confirmed')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          Xác nhận đơn
        </button>
      );
    }
    if (order.status === 'confirmed') {
      return (
        <button onClick={() => handleUpdateStatus(order.id, 'preparing')} className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600">
          Pha chế (Chuẩn bị)
        </button>
      );
    }
    if (order.status === 'preparing') {
      return (
        <button onClick={() => handleUpdateStatus(order.id, 'delivering')} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
          Giao cho Shipper
        </button>
      );
    }
    if (order.status === 'delivering') {
      return (
        <button onClick={() => handleUpdateStatus(order.id, 'delivered')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
          Hoàn thành (Đã giao)
        </button>
      );
    }
    if (order.status === 'cancel_requested') {
      return (
        <div className="flex gap-2">
          <button onClick={() => handleUpdateStatus(order.id, 'cancelled')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
            Duyệt hủy
          </button>
          <button onClick={() => handleUpdateStatus(order.id, 'preparing')} className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600">
            Từ chối (Pha tiếp)
          </button>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Đơn hàng</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Mã Đơn</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Khách Hàng</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Tổng Tiền</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Trạng Thái</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Ngày Đặt</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => {
              const statusInfo = getStatusDisplay(order.status);
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-indigo-600">#{order.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{order.User?.name}</p>
                    <p className="text-gray-500 text-xs">{order.phone_number}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {Number(order.total_price).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    {renderActionButtons(order)}
                    {/* Luôn cho phép hủy nếu chưa thành công/hủy */}
                    {!['delivered', 'cancelled', 'cancel_requested'].includes(order.status) && (
                      <button 
                        onClick={() => { if(window.confirm('Hủy đơn hàng này?')) handleUpdateStatus(order.id, 'cancelled') }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-red-200"
                      >
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  Chưa có đơn hàng nào trong hệ thống.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
