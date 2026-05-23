const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');

// Bắt buộc đăng nhập và phải là ADMIN mới được truy cập các route này
router.use(authenticateToken, authorizeAdmin);

// ==========================================
// QUẢN LÝ NGƯỜI DÚNG (USER MANAGEMENT)
// ==========================================
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);

// ==========================================
// QUẢN LÝ SẢN PHẨM (PRODUCT MANAGEMENT)
// ==========================================
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

module.exports = router;
