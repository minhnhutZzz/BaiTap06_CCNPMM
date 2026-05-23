const { User, Product, ProductImage } = require('../models');

const adminController = {
  // ==========================================
  // QUẢN LÝ NGƯỜI DÙNG (USER MANAGEMENT)
  // ==========================================
  
  // Lấy danh sách toàn bộ người dùng
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] }, // Không bao giờ trả về password
        order: [['created_at', 'DESC']]
      });
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error('Lỗi lấy danh sách user:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách người dùng' });
    }
  },

  // Khóa / Mở khóa tài khoản người dùng
  toggleUserStatus: async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Không cho phép admin tự khóa chính mình
      if (userId == req.user.id) {
        return res.status(400).json({ success: false, message: 'Bạn không thể tự khóa tài khoản của chính mình' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }

      // Đảo ngược trạng thái hiện tại (1 -> 0, 0 -> 1)
      user.is_active = user.is_active === 1 ? 0 : 1;
      await user.save();

      res.status(200).json({ 
        success: true, 
        message: user.is_active ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản thành công',
        data: { id: user.id, is_active: user.is_active }
      });
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái user:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái' });
    }
  },

  // ==========================================
  // QUẢN LÝ SẢN PHẨM (PRODUCT MANAGEMENT)
  // ==========================================
  
  createProduct: async (req, res) => {
    try {
      const { name, description, price, discount_price, stock, thumbnail, is_new, is_promotion, category_id, images } = req.body;
      
      const newProduct = await Product.create({
        name, description, price, discount_price, stock, sold: 0, thumbnail, is_new, is_promotion, category_id
      });

      // Thêm ảnh phụ nếu có
      if (images && Array.isArray(images) && images.length > 0) {
        const productImages = images.map(url => ({
          product_id: newProduct.id,
          image_url: url
        }));
        await ProductImage.bulkCreate(productImages);
      }

      res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', data: newProduct });
    } catch (error) {
      console.error('Lỗi thêm sản phẩm:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi thêm sản phẩm' });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      const { name, description, price, discount_price, stock, thumbnail, is_new, is_promotion, category_id, images } = req.body;

      const product = await Product.findByPk(productId);
      if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });

      await product.update({
        name, description, price, discount_price, stock, thumbnail, is_new, is_promotion, category_id
      });

      // Cập nhật ảnh phụ (Xóa cũ thêm mới cho đơn giản)
      if (images !== undefined) {
        await ProductImage.destroy({ where: { product_id: product.id } });
        if (Array.isArray(images) && images.length > 0) {
          const productImages = images.map(url => ({
            product_id: product.id,
            image_url: url
          }));
          await ProductImage.bulkCreate(productImages);
        }
      }

      res.status(200).json({ success: true, message: 'Cập nhật sản phẩm thành công', data: product });
    } catch (error) {
      console.error('Lỗi cập nhật sản phẩm:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật sản phẩm' });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      
      // Chú ý: Ở hệ thống thực tế thường dùng Soft Delete (ẩn đi) thay vì xóa thật
      // Tuy nhiên ở đây theo yêu cầu bài tập ta dùng Delete (Do đã config CASCADE / SET NULL)
      const product = await Product.findByPk(productId);
      if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });

      await product.destroy();

      res.status(200).json({ success: true, message: 'Xóa sản phẩm thành công' });
    } catch (error) {
      console.error('Lỗi xóa sản phẩm:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi xóa sản phẩm. Có thể do sản phẩm đã nằm trong đơn hàng.' });
    }
  }
};

module.exports = adminController;
