const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticateToken } = require('../middlewares/auth');

// Bắt buộc đăng nhập mới được đặt hàng
router.use(authenticateToken);

// POST /api/orders : Tạo đơn hàng mới (Thanh toán COD)
router.post('/', orderController.createOrder);

module.exports = router;
