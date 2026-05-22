const { CartItem, Product, Category } = require('../models');

const cartController = {
  // 1. Xem giỏ hàng của user
  getCart: async (req, res) => {
    try {
      const user_id = req.user.id; // Lấy ID user từ token đăng nhập

      // Tìm tất cả các món hàng trong giỏ của user này
      const cartItems = await CartItem.findAll({
        where: { user_id },
        include: [
          {
            model: Product,
            attributes: ['id', 'name', 'price', 'discount_price', 'thumbnail', 'stock'],
            include: [{ model: Category, attributes: ['name'] }]
          }
        ],
        order: [['createdAt', 'DESC']] // Sắp xếp mới nhất lên đầu
      });

      res.status(200).json({ success: true, data: cartItems });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server khi lấy giỏ hàng' });
    }
  },

  // 2. Thêm sản phẩm vào giỏ hàng
  addToCart: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { product_id, quantity } = req.body;

      // Kiểm tra sản phẩm có tồn tại và còn hàng không
      const product = await Product.findByPk(product_id);
      if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
      if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Không đủ hàng trong kho' });

      // Tìm xem món này đã có trong giỏ chưa
      let cartItem = await CartItem.findOne({ where: { user_id, product_id } });

      if (cartItem) {
        // Nếu có rồi thì cộng dồn số lượng
        const newQuantity = cartItem.quantity + quantity;
        if (newQuantity > product.stock) return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho' });
        
        cartItem.quantity = newQuantity;
        await cartItem.save();
      } else {
        // Nếu chưa có thì tạo dòng mới
        cartItem = await CartItem.create({ user_id, product_id, quantity });
      }

      res.status(200).json({ success: true, message: 'Đã thêm vào giỏ hàng', data: cartItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server khi thêm vào giỏ hàng' });
    }
  },

  // 3. Cập nhật số lượng (+ / -)
  updateCartItem: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { id } = req.params; // ID của CartItem
      const { quantity } = req.body;

      const cartItem = await CartItem.findOne({ where: { id, user_id }, include: [Product] });
      if (!cartItem) return res.status(404).json({ success: false, message: 'Không tìm thấy món hàng trong giỏ' });

      if (quantity > cartItem.Product.stock) {
        return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho' });
      }

      cartItem.quantity = quantity;
      await cartItem.save();

      res.status(200).json({ success: true, message: 'Cập nhật số lượng thành công', data: cartItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật giỏ hàng' });
    }
  },

  // 4. Xóa 1 món khỏi giỏ
  removeCartItem: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { id } = req.params;

      const deleted = await CartItem.destroy({ where: { id, user_id } });
      if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy món hàng để xóa' });

      res.status(200).json({ success: true, message: 'Đã xóa khỏi giỏ hàng' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server khi xóa món hàng' });
    }
  }
};

module.exports = cartController;
