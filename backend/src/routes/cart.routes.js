const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticateToken } = require('../middlewares/auth');

// Áp dụng middleware kiểm tra đăng nhập cho toàn bộ các route Giỏ hàng
router.use(authenticateToken);

// GET /api/cart : Xem giỏ hàng
router.get('/', cartController.getCart);

// POST /api/cart : Thêm món vào giỏ
router.post('/', cartController.addToCart);

// PUT /api/cart/:id : Cập nhật số lượng
router.put('/:id', cartController.updateCartItem);

// DELETE /api/cart/:id : Xóa món khỏi giỏ
router.delete('/:id', cartController.removeCartItem);

module.exports = router;
