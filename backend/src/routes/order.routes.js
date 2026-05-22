const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticateToken } = require('../middlewares/auth');

// Bắt buộc đăng nhập mới được đặt hàng
router.use(authenticateToken);

// GET /api/orders : Lấy danh sách lịch sử đơn hàng
router.get('/', orderController.getUserOrders);

// POST /api/orders : Tạo đơn hàng mới (Thanh toán COD)
router.post('/', orderController.createOrder);

// POST /api/orders/:id/cancel : Hủy đơn hàng
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;
