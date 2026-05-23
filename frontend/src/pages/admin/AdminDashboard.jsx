import React, { useEffect, useState } from 'react';
import adminService from '../../../services/admin.service';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.error('Lỗi lấy thống kê:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Thống Kê</h1>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <p className="text-sm font-medium text-gray-500 mb-1">Tổng Doanh Thu</p>
          <p className="text-2xl font-bold text-green-600">
            {Number(stats.totalRevenue).toLocaleString('vi-VN')} đ
          </p>
          <p className="text-xs text-gray-400 mt-2">Chỉ tính đơn đã giao thành công</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <p className="text-sm font-medium text-gray-500 mb-1">Tổng Đơn Hàng</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.totalOrders}</p>
          <Link to="/admin/orders" className="text-xs text-indigo-500 hover:text-indigo-700 mt-2 font-medium">Xem tất cả đơn hàng →</Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <p className="text-sm font-medium text-gray-500 mb-1">Sản Phẩm Khả Dụng</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalProducts}</p>
          <Link to="/admin/products" className="text-xs text-purple-500 hover:text-purple-700 mt-2 font-medium">Quản lý kho →</Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <p className="text-sm font-medium text-gray-500 mb-1">Người Dùng</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
          <Link to="/admin/users" className="text-xs text-blue-500 hover:text-blue-700 mt-2 font-medium">Quản lý tài khoản →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* RECENT ORDERS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">5 Đơn Hàng Mới Nhất</h2>
          <div className="space-y-4">
            {stats.recentOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Mã đơn: #{order.id}</p>
                  <p className="text-sm text-gray-500">{order.User?.name || 'Khách Vô Danh'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">{Number(order.total_price).toLocaleString('vi-VN')} đ</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {stats.recentOrders.length === 0 && <p className="text-gray-500 text-sm">Chưa có đơn hàng nào.</p>}
          </div>
        </div>

        {/* TOP PRODUCTS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Top 5 Bán Chạy Nhất</h2>
          <div className="space-y-4">
            {stats.topProducts.map(product => (
              <div key={product.id} className="flex gap-4 items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <img src={product.thumbnail} alt={product.name} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm font-medium text-indigo-600">{Number(product.price).toLocaleString('vi-VN')} đ</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Đã bán</p>
                  <p className="font-bold text-gray-900">{product.sold}</p>
                </div>
              </div>
            ))}
            {stats.topProducts.length === 0 && <p className="text-gray-500 text-sm">Chưa có sản phẩm nào được bán.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
