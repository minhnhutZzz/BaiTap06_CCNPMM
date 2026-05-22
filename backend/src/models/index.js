const User = require('./User');
const Profile = require('./Profile');
const OTP = require('./OTP');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Define Associations
User.hasOne(Profile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(OTP, { foreignKey: 'user_id', onDelete: 'CASCADE' });
OTP.belongsTo(User, { foreignKey: 'user_id' });

Category.hasMany(Product, { foreignKey: 'category_id', onDelete: 'RESTRICT' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

// Quan hệ Giỏ hàng (CartItem)
User.hasMany(CartItem, { foreignKey: 'user_id', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(CartItem, { foreignKey: 'product_id', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'product_id' });

// Quan hệ Đơn hàng (Order)
User.hasMany(Order, { foreignKey: 'user_id', onDelete: 'RESTRICT' });
Order.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id', onDelete: 'RESTRICT' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = {
  User,
  Profile,
  OTP,
  Category,
  Product,
  ProductImage,
  CartItem,
  Order,
  OrderItem
};
