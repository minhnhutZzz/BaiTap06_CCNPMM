import React, { useEffect, useState } from 'react';
import adminService from '../../../services/admin.service';
import { useSelector } from 'react-redux';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useSelector(state => state.auth);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách user:', error);
      alert('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const actionName = currentStatus === 1 ? 'Khóa' : 'Mở khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản này?`)) return;

    try {
      const res = await adminService.toggleUserStatus(userId);
      if (res.success) {
        // Cập nhật state trực tiếp
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: res.data.is_active } : u));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Người dùng</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">ID</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Tên người dùng</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Email</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Vai trò</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-600">#{u.id}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{u.name}</td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.is_active === 1 ? (
                    <span className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
                      <span className="w-2 h-2 rounded-full bg-green-600"></span> Đang hoạt động
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-600 font-medium text-xs">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span> Đã bị khóa
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {/* Không hiện nút khóa nếu tài khoản đó là của chính mình */}
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => handleToggleStatus(u.id, u.is_active)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        u.is_active === 1 
                          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                          : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {u.is_active === 1 ? 'Khóa TK' : 'Mở khóa'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
