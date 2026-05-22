import axiosClient from './axiosClient';

const cartService = {
  // Lấy toàn bộ sản phẩm trong giỏ hàng
  getCart: async () => {
    const response = await axiosClient.get('/cart');
    return response.data;
  },

  // Thêm một sản phẩm vào giỏ
  addToCart: async (product_id, quantity = 1) => {
    const response = await axiosClient.post('/cart', { product_id, quantity });
    return response.data;
  },

  // Cập nhật số lượng của một món hàng
  updateCartItem: async (cart_item_id, quantity) => {
    const response = await axiosClient.put(`/cart/${cart_item_id}`, { quantity });
    return response.data;
  },

  // Xóa một món hàng khỏi giỏ
  removeCartItem: async (cart_item_id) => {
    const response = await axiosClient.delete(`/cart/${cart_item_id}`);
    return response.data;
  }
};

export default cartService;
