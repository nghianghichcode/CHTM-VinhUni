# Cổng Thủ Thuật & Cứu Hộ Máy Tính

Website chia sẻ thủ thuật, cứu hộ máy tính, hỗ trợ Windows/Office/Driver/Mạng/Bảo mật/Tăng tốc/Sửa lỗi.

## Stack

- Node.js >= 18, Express, MongoDB, Mongoose
- SSR EJS, CSS thuần, JS thuần
- Auth: express-session, bcrypt
- Security: helmet, express-rate-limit, sanitize
- Logging: morgan

## Hướng dẫn chạy

### 1. Clone & cài đặt

```bash
git clone <repo-url>
cd cong-thu-thuat-cuu-ho-may-tinh
npm install
```

### 2. Tạo file `.env` từ mẫu

```bash
cp .env.example .env
```
- Sửa `MONGODB_URI` nếu dùng MongoDB Atlas.

### 3. Seed dữ liệu mẫu

```bash
npm run seed
```

### 4. Chạy dev

```bash
npm run dev
```
- Truy cập: http://localhost:3000

### 5. Tài khoản mẫu

- Admin: admin@congthuthuat.vn / admin123
- User: user1@congthuthuat.vn / user123
- User: user2@congthuthuat.vn / user123

## Build/Production

- Chạy: `npm start`
- Dùng PM2 hoặc Docker nếu cần.

## Thư mục chính

- `src/` - code backend, views, public
- `scripts/seed.js` - seed data mẫu

## Ghi chú

- Đã có sitemap.xml, robots.txt, meta SEO động.
- Có rate limit login, rescue.
- Có dark mode, responsive, error page.
- Đầy đủ CRUD admin, bảo vệ route.
- Nếu lỗi kết nối MongoDB, kiểm tra URI và quyền truy cập.

---

**Chúc bạn thành công!**
