const { User } = require('../models');

const adminController = {
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
  }
};

module.exports = adminController;
