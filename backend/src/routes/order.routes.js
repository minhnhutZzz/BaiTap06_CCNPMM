const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');

// Bắt buộc đăng nhập mới được thực hiện các thao tác dưới đây
router.use(authenticateToken);

// =============================================================
// ROUTE DÀNH CHO ADMIN
// =============================================================
// GET /api/orders/admin/all : Admin lấy toàn bộ đơn hàng
router.get('/admin/all', authorizeAdmin, orderController.getAllOrdersAdmin);

// PUT /api/orders/admin/:id/status : Admin cập nhật trạng thái đơn hàng
router.put('/admin/:id/status', authorizeAdmin, orderController.updateOrderStatusAdmin);

// =============================================================
// ROUTE DÀNH CHO USER
// =============================================================

// GET /api/orders : Lấy danh sách lịch sử đơn hàng
router.get('/', orderController.getUserOrders);

// POST /api/orders : Tạo đơn hàng mới (Thanh toán COD)
router.post('/', orderController.createOrder);

// POST /api/orders/:id/cancel : Hủy đơn hàng
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;
