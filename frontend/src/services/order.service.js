import axiosClient from './axiosClient';

const orderService = {
  // Thực hiện đặt hàng (Thanh toán COD)
  // Payload: { shipping_address, phone_number, note }
  createOrder: async (orderData) => {
    const response = await axiosClient.post('/orders', orderData);
    return response.data;
  }
};

export default orderService;
