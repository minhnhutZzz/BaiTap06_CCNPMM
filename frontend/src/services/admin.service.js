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
  },

  // ==========================================
  // QUẢN LÝ SẢN PHẨM
  // ==========================================
  createProduct: async (productData) => {
    const response = await axiosClient.post('/admin/products', productData);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    const response = await axiosClient.put(`/admin/products/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await axiosClient.delete(`/admin/products/${productId}`);
    return response.data;
  },

  uploadImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await axiosClient.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default adminService;
