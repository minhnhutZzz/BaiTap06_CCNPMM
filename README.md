# 🧋 Bobatea — Ứng dụng Bán Trà Sữa Trực Tuyến

**Thông tin sinh viên:**
- **Họ và tên:** Đào Minh Nhựt
- **MSSV:** 23110282
- **Chuyên ngành:** Công nghệ phần mềm (Software Engineering)
- **Môn học:** Các công nghệ phần mềm mới

---

## 📖 Giới thiệu dự án

**Bobatea** là một ứng dụng web thương mại điện tử full-stack hoàn chỉnh cho một cửa hàng trà sữa, được xây dựng theo mô hình **Client-Server** với kiến trúc RESTful API. Dự án triển khai đầy đủ các chức năng của một trang bán hàng hiện đại: xác thực người dùng bảo mật, trang chủ phân loại sản phẩm, trang chi tiết sản phẩm, giỏ hàng, đặt hàng, thanh toán qua VNPay, quản lý lịch sử đơn hàng, và hệ thống quản trị toàn diện dành cho Admin.

---

## ✨ Các tính năng nổi bật (Key Features)

### 1. 🔑 Xác thực & Bảo mật (Authentication & Security)
- **Đăng ký** tài khoản và xác minh Email qua mã **OTP** trước khi kích hoạt.
- **Đăng nhập** trả về **JWT Access Token** an toàn.
- **Phân quyền** hai vai trò: `user` và `admin`.
- **Rate Limiting** trên các API auth để chống Brute-force và Spam.
- **Quên mật khẩu** qua email với mã OTP.
- **Mã hoá mật khẩu** bằng `bcryptjs`.
- **Validation** dữ liệu đầu vào.

### 2. 🏠 Trang chủ & Khám phá sản phẩm
- **Section Khuyến Mãi & Mới Ra Mắt:** Hiển thị nổi bật.
- **Top Bán Chạy & Top Xem Nhiều:** Tính năng **phân trang ngang (Horizontal Pagination)**.
- **Danh sách sản phẩm:** Tích hợp **Lazy Loading (Infinite Scroll)**.
- **Tìm kiếm & Lọc:** Tìm theo tên, danh mục, khuyến mãi, hàng mới, và sắp xếp đa dạng.

### 3. 📄 Chi tiết sản phẩm
- **Carousel ảnh** mượt mà.
- Tự động tăng **Lượt xem**.
- Hiển thị tồn kho, số lượng đã bán, và **sản phẩm tương tự**.

### 4. 🛒 Giỏ hàng & Thanh toán (Cart, Checkout & Payment)
- **Quản lý Giỏ hàng:** Thêm, sửa số lượng, xoá sản phẩm. Đồng bộ dữ liệu giỏ hàng với Database.
- **Đặt hàng (Checkout):** Cập nhật địa chỉ nhận hàng, tính tổng tiền giỏ hàng.
- **Thanh toán:** Tích hợp cổng thanh toán trực tuyến **VNPay** và hỗ trợ thanh toán tiền mặt (COD).

### 5. 👤 Cá nhân hoá & Đơn hàng (Profile & Orders)
- **Hồ sơ cá nhân:** Quản lý thông tin tài khoản người dùng.
- **Lịch sử đơn hàng:** Theo dõi tình trạng, chi tiết các đơn hàng đã đặt mua.

### 6. 🖼️ Quản lý ảnh với Cloudinary
- Tối ưu tải trang với **Cloudinary CDN** cho hình ảnh sản phẩm. API upload nhiều ảnh đồng thời.

### 7. 👑 Hệ thống quản trị Admin
- **Bảng điều khiển (Dashboard):** Thống kê và báo cáo tổng quan.
- **Quản lý Sản phẩm:** Thêm, sửa, xoá, upload ảnh sản phẩm.
- **Quản lý Đơn hàng:** Theo dõi và cập nhật trạng thái đơn hàng (Đang xử lý, Đang giao, Đã giao,...).
- **Quản lý Người dùng:** Quản trị danh sách khách hàng và phân quyền.

---

## 🛠️ Công nghệ sử dụng

### Backend
| Công nghệ | Mục đích |
|---|---|
| **Node.js + Express.js** | Nền tảng server & RESTful API |
| **Sequelize + MySQL** | ORM & cơ sở dữ liệu quan hệ |
| **jsonwebtoken** | Phát hành & xác minh JWT Token |
| **bcryptjs** | Mã hoá mật khẩu |
| **express-rate-limit** | Giới hạn request chống Brute-force |
| **Cloudinary + Multer** | Upload & lưu trữ ảnh trên CDN |
| **Nodemailer** | Gửi email OTP xác thực |

### Frontend
| Công nghệ | Mục đích |
|---|---|
| **React + Vite** | Framework UI hiện đại, build nhanh |
| **Tailwind CSS** | Styling utility-first, responsive |
| **Redux Toolkit** | Quản lý trạng thái toàn cục |
| **React Router v6** | Điều hướng & Protected Routes |
| **Swiper.js** | Carousel ảnh sản phẩm |
| **Axios** | HTTP client gọi API |

---

## 🗂️ Cấu trúc dự án

```text
BaiTap06_CCNPMM/
├── backend/
│   └── src/
│       ├── config/         # Cấu hình DB, Cloudinary
│       ├── controllers/    # Xử lý logic API
│       ├── middlewares/    # Auth, Rate Limiter, Upload
│       ├── models/         # Sequelize Models
│       ├── routes/         # Định nghĩa API routes (auth, product, cart, order, payment, admin, profile, upload, password)
│       ├── services/       # Business logic
│       ├── utils/          # Utils, Seed data
│       └── validations/    # Kiểm tra dữ liệu
└── frontend/
    └── src/
        ├── components/     # Layout, UI components
        ├── pages/          # Home, Login, Register, ProductDetail, Cart, Checkout, OrderHistory, Profile, VnpayReturn, ...
        │   ├── admin/      # AdminDashboard, AdminUsers, ProductManagement, OrderManagement, AdminProfile
        │   └── user/       # User specific components
        ├── redux/          # Redux slices
        ├── routes/         # Router configuration
        └── services/       # Axios API services
```

---

## 🚀 API Endpoints Chính

| Module | Chức năng chính |
|--------|-----------------|
| **Xác thực (`/api/auth`)** | Đăng nhập, Đăng ký, Xác minh OTP, Quên/Reset mật khẩu |
| **Sản phẩm (`/api/products`)** | Lấy DS sản phẩm (có filter/sort/pagination), Chi tiết, Danh mục, Top bán chạy, Top lượt xem |
| **Giỏ hàng (`/api/cart`)** | Thêm, Xoá, Cập nhật số lượng sản phẩm trong giỏ hàng |
| **Đơn hàng (`/api/orders`)** | Đặt hàng, Xem lịch sử mua hàng, Cập nhật trạng thái đơn hàng (Admin) |
| **Thanh toán (`/api/payment`)** | Tạo URL thanh toán VNPay, Xử lý callback trả về từ VNPay |
| **Admin (`/api/admin`)** | Thống kê Dashboard, Quản lý User, Quản lý Product, Quản lý Order |
| **Hồ sơ (`/api/profile`)** | Lấy thông tin cá nhân, Cập nhật Profile |
| **Upload (`/api/upload`)** | Upload một hoặc nhiều ảnh lên Cloudinary, Xoá ảnh |

---

## ⚙️ Cài đặt & Chạy dự án

### Yêu cầu hệ thống
- Node.js >= 18
- MySQL >= 8

### 1. Clone & cài dependencies
```bash
# Backend
cd backend && npm install
# Frontend
cd frontend && npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` tại thư mục gốc của `backend` với các thông tin: Database, JWT, Email SMTP, Cloudinary, VNPAY,... (xem file mẫu nếu có).

### 3. Khởi động
```bash
# Chạy Backend (port 3000)
cd backend && npm run dev
# Chạy Frontend (port 5173)
cd frontend && npm run dev
```

---

## 1 số hình ảnh UI:
# Login
<img width="1897" height="909" alt="image" src="https://github.com/user-attachments/assets/c466faab-0523-4884-836a-885408b880fd" />
# Role Khách hàng 
<img width="1912" height="911" alt="image" src="https://github.com/user-attachments/assets/7448ecde-49ac-4222-a82d-f93fefaf3a50" />
<img width="1915" height="912" alt="image" src="https://github.com/user-attachments/assets/1d98711f-6dc8-4644-8442-f61a9dcfadc8" />
<img width="1916" height="913" alt="image" src="https://github.com/user-attachments/assets/29289e0d-809e-4b43-bf31-b9b2dfd43f86" />
<img width="1916" height="908" alt="image" src="https://github.com/user-attachments/assets/caafd87e-fe7e-446a-8dd3-f442f633b3a5" />
<img width="1913" height="908" alt="image" src="https://github.com/user-attachments/assets/f546719b-32b7-42cc-9e11-a8720da87d5f" />
<img width="1917" height="911" alt="image" src="https://github.com/user-attachments/assets/a252a146-95ce-480e-86e1-4332bfa3b52e" />
<img width="1915" height="911" alt="image" src="https://github.com/user-attachments/assets/07cb1fc7-7e57-44c7-afbd-d08295749867" />
<img width="1917" height="911" alt="image" src="https://github.com/user-attachments/assets/a8e00934-2c7c-49fb-bf2e-7e0a4d451151" />
# Admin
<img width="1916" height="912" alt="image" src="https://github.com/user-attachments/assets/a02bf3ce-40f0-46bb-bd04-52ad866a5072" />
<img width="1919" height="913" alt="image" src="https://github.com/user-attachments/assets/2a0b51b1-61f6-4175-9b22-04bb3a3901ca" />
<img width="1915" height="911" alt="image" src="https://github.com/user-attachments/assets/dc4e3dbb-65cb-4854-aad0-8651d08d5124" />
<img width="1916" height="910" alt="image" src="https://github.com/user-attachments/assets/393529b9-5fc8-412e-92c5-c558b33e8090" />
<img width="1917" height="911" alt="image" src="https://github.com/user-attachments/assets/14840c2f-3e26-4602-b105-e0bf8b905cfb" />







