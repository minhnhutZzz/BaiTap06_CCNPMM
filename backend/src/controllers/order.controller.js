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
  },

  // -------------------------------------------------------------
  // Lấy danh sách lịch sử đơn hàng của người dùng
  // -------------------------------------------------------------
  getUserOrders: async (req, res) => {
    try {
      const user_id = req.user.id;
      const orders = await Order.findAll({
        where: { user_id },
        order: [['createdAt', 'DESC']], // Đơn mới nhất xếp lên đầu
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Product, attributes: ['id', 'name', 'thumbnail'] }]
          }
        ]
      });

      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      console.error('Lỗi lấy lịch sử đơn hàng:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch sử đơn hàng' });
    }
  },

  // -------------------------------------------------------------
  // Hủy đơn hàng (Logic phức tạp theo yêu cầu)
  // -------------------------------------------------------------
  cancelOrder: async (req, res) => {
    try {
      const user_id = req.user.id;
      const order_id = req.params.id;

      const order = await Order.findOne({ where: { id: order_id, user_id } });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      }

      // Kiểm tra thời gian: Chỉ cho phép hủy trước 30 phút sau khi đặt
      const currentTime = new Date();
      const orderTime = new Date(order.createdAt);
      const diffInMinutes = Math.floor((currentTime - orderTime) / (1000 * 60));

      if (diffInMinutes > 30) {
        return res.status(400).json({ 
          success: false, 
          message: 'Đã quá 30 phút kể từ lúc đặt hàng, không thể hủy đơn!' 
        });
      }

      // Kiểm tra trạng thái hiện tại
      if (order.status === 'delivering' || order.status === 'delivered') {
        return res.status(400).json({ success: false, message: 'Đơn hàng đang giao, không thể hủy!' });
      }

      if (order.status === 'cancelled' || order.status === 'cancel_requested') {
        return res.status(400).json({ success: false, message: 'Đơn hàng đã bị hủy hoặc đang chờ hủy rồi!' });
      }

      // Yêu cầu: Nếu đang ở bước 3 (preparing) thì chuyển sang Gửi Yêu cầu hủy đơn
      if (order.status === 'preparing') {
        order.status = 'cancel_requested';
        await order.save();
        return res.status(200).json({ 
          success: true, 
          message: 'Đã gửi yêu cầu hủy đơn cho Shop (Vì shop đang chuẩn bị hàng)',
          new_status: 'cancel_requested'
        });
      }

      // Các trường hợp còn lại (new, confirmed): Cho phép hủy trực tiếp
      order.status = 'cancelled';
      await order.save();

      // [Tùy chọn] Phục hồi lại số lượng tồn kho nếu hủy thành công
      const items = await OrderItem.findAll({ where: { order_id: order.id } });
      for (const item of items) {
        const product = await Product.findByPk(item.product_id);
        if (product) {
          product.stock += item.quantity;
          product.sold -= item.quantity;
          await product.save();
        }
      }

      res.status(200).json({ 
        success: true, 
        message: 'Hủy đơn hàng thành công',
        new_status: 'cancelled'
      });

    } catch (error) {
      console.error('Lỗi hủy đơn hàng:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi hủy đơn hàng' });
    }
  },

  // =============================================================
  // CHỨC NĂNG DÀNH CHO ADMIN
  // =============================================================

  // Lấy tất cả đơn hàng trong hệ thống (dành cho quản lý)
  getAllOrdersAdmin: async (req, res) => {
    try {
      const orders = await Order.findAll({
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Product, attributes: ['id', 'name', 'thumbnail'] }]
          },
          {
            model: require('../models').User,
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      console.error('Lỗi lấy danh sách đơn hàng cho admin:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách đơn hàng' });
    }
  },

  // Admin cập nhật trạng thái đơn hàng
  updateOrderStatusAdmin: async (req, res) => {
    try {
      const order_id = req.params.id;
      const { status } = req.body;

      const validStatuses = ['new', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled', 'cancel_requested'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
      }

      const order = await Order.findByPk(order_id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      }

      // Xử lý logic hoàn kho nếu đổi trạng thái thành cancelled
      if (status === 'cancelled' && order.status !== 'cancelled') {
        const items = await OrderItem.findAll({ where: { order_id: order.id } });
        for (const item of items) {
          const product = await Product.findByPk(item.product_id);
          if (product) {
            product.stock += item.quantity;
            product.sold -= item.quantity;
            await product.save();
          }
        }
      }

      // Nếu từ cancelled chuyển sang trạng thái khác thì phải trừ kho lại (Nâng cao - có thể bỏ qua để đơn giản)
      if (order.status === 'cancelled' && status !== 'cancelled') {
        const items = await OrderItem.findAll({ where: { order_id: order.id } });
        for (const item of items) {
          const product = await Product.findByPk(item.product_id);
          if (product && product.stock >= item.quantity) {
            product.stock -= item.quantity;
            product.sold += item.quantity;
            await product.save();
          }
        }
      }

      order.status = status;
      await order.save();

      res.status(200).json({ 
        success: true, 
        message: 'Cập nhật trạng thái thành công', 
        data: order 
      });
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái' });
    }
  }
};

module.exports = orderController;
