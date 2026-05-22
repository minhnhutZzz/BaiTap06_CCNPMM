import axiosClient from './axiosClient';

const orderService = {
  // Thực hiện đặt hàng (Thanh toán COD)
  // Payload: { shipping_address, phone_number, note }
  createOrder: async (orderData) => {
    const response = await axiosClient.post('/orders', orderData);
    return response.data;
  },

  // Lấy lịch sử đơn hàng
  getOrders: async () => {
    const response = await axiosClient.get('/orders');
    return response.data;
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId) => {
    const response = await axiosClient.post(`/orders/${orderId}/cancel`);
    return response.data;
  }
};

export default orderService;
