const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false, // Lưu lại giá tiền TẠI THỜI ĐIỂM MUA (để lỡ sau này đổi giá thì hóa đơn cũ không bị sai)
    }
  },
  {
    tableName: 'order_items',
    timestamps: false, // Không cần thiết lập thời gian cho từng món nhỏ
  }
);

module.exports = OrderItem;
