import axiosClient from './axiosClient';

const adminService = {
  // Lấy danh sách toàn bộ người dùng
  getAllUsers: async () => {
    const response = await axiosClient.get('/admin/users');
    return response.data;
  },

  // Thay đổi trạng thái tài khoản (khóa/mở khóa)
  toggleUserStatus: async (userId) => {
    const response = await axiosClient.put(`/admin/users/${userId}/status`);
    return response.data;
  }
};

export default adminService;
