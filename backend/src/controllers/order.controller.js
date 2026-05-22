const { Order, OrderItem, CartItem, Product } = require('../models');
const sequelize = require('../config/database');

const orderController = {
  // Thực hiện Thanh toán (Tạo đơn hàng từ Giỏ hàng)
  createOrder: async (req, res) => {
    // Sử dụng Transaction: Đảm bảo nếu bị lỗi giữa chừng (VD: đang trừ kho thì sập nguồn) 
    // thì mọi dữ liệu sẽ được phục hồi lại như cũ, không bị mất tiền oan.
    const t = await sequelize.transaction();

    try {
      const user_id = req.user.id;
      const { shipping_address, phone_number, note } = req.body;

      if (!shipping_address || !phone_number) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đủ địa chỉ và số điện thoại' });
      }

      // 1. Lấy toàn bộ giỏ hàng của user
      const cartItems = await CartItem.findAll({
        where: { user_id },
        include: [{ model: Product }]
      });

      if (cartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Giỏ hàng đang trống' });
      }

      // 2. Kiểm tra tồn kho và tính tổng tiền
      let total_price = 0;
      for (const item of cartItems) {
        const product = item.Product;
        if (product.stock < item.quantity) {
          throw new Error(`Sản phẩm ${product.name} chỉ còn ${product.stock} ly, không đủ số lượng.`);
        }
        const priceToCharge = product.discount_price || product.price;
        total_price += priceToCharge * item.quantity;
      }

      // 3. Tạo Hóa đơn (Order)
      const order = await Order.create({
        user_id,
        total_price,
        shipping_address,
        phone_number,
        note,
        payment_method: 'COD' // Bắt buộc là COD theo yêu cầu
      }, { transaction: t });

      // 4. Lập chi tiết hóa đơn (OrderItem) & Trừ tồn kho (Product)
      for (const item of cartItems) {
        const product = item.Product;
        const priceToCharge = product.discount_price || product.price;

        // Tạo chi tiết hóa đơn
        await OrderItem.create({
          order_id: order.id,
          product_id: product.id,
          quantity: item.quantity,
          price: priceToCharge // Chụp hình lại giá tiền ngay lúc này
        }, { transaction: t });

        // Trừ tồn kho, Tăng số lượng đã bán
        product.stock -= item.quantity;
        product.sold += item.quantity;
        await product.save({ transaction: t });
      }

      // 5. Xóa sạch giỏ hàng sau khi đã chốt đơn thành công
      await CartItem.destroy({ where: { user_id }, transaction: t });

      // Nếu mọi thứ từ bước 1 -> 5 trót lọt, tiến hành lưu thật sự vào Database
      await t.commit();

      res.status(201).json({ 
        success: true, 
        message: 'Đặt hàng thành công với phương thức COD', 
        data: order 
      });

    } catch (error) {
      // Nếu có bất kỳ lỗi nào xảy ra, hủy bỏ toàn bộ thao tác nãy giờ (Rollback)
      await t.rollback();
      console.error(error);
      
      // Kiểm tra xem lỗi là do mình chủ động throw (hết hàng) hay lỗi hệ thống
      const isCustomError = error.message.includes('Sản phẩm');
      res.status(isCustomError ? 400 : 500).json({ 
        success: false, 
        message: isCustomError ? error.message : 'Lỗi server khi thanh toán' 
      });
    }
  }
};

module.exports = orderController;
