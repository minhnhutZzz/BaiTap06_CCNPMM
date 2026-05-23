const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middlewares/auth');

// Tạo URL thanh toán VNPay (phải đăng nhập)
router.post('/vnpay/create', authenticateToken, paymentController.createVnpayUrl);

// Xác minh chữ ký trả về từ VNPay (không cần đăng nhập vì VNPay gọi trực tiếp)
router.get('/vnpay/verify', paymentController.verifyReturn);

module.exports = router;
