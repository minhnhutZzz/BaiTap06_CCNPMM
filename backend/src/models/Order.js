const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.INTEGER, // Lưu tổng tiền (đơn vị VNĐ)
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'new',                // 1. Đơn hàng mới
        'confirmed',          // 2. Đã xác nhận
        'preparing',          // 3. Shop đang chuẩn bị
        'delivering',         // 4. Đang giao hàng
        'delivered',          // 5. Đã giao thành công
        'cancelled',          // 6. Hủy đơn hàng
        'cancel_requested'    // Gửi yêu cầu hủy đơn
      ),
      defaultValue: 'new',
    },
    payment_method: {
      type: DataTypes.STRING,
      defaultValue: 'COD', // Bắt buộc theo đề bài là COD (Thanh toán khi nhận hàng)
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM('unpaid', 'paid'),
      defaultValue: 'unpaid',
    },
    shipping_address: {
      type: DataTypes.STRING,
      allowNull: false, // Bắt buộc phải có địa chỉ giao hàng
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false, // Bắt buộc phải có SĐT để shipper gọi
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true, // Ghi chú thêm (VD: Ít đá, nhiều đường...)
    }
  },
  {
    tableName: 'orders',
    timestamps: true, // Lưu lại thời gian đặt hàng (createdAt)
  }
);

module.exports = Order;
