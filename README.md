# WEB2072 Assignment - Sales Manager

Ứng dụng quản lý bán hàng bằng Vue.js + Express + MongoDB.

## Cấu trúc

- `client/` — Frontend Vue 3 (Router, Pinia, Bootstrap, Chart.js)
- `server/` — REST API Express + MongoDB + JWT
- `docs/BaoCao.html` — Báo cáo phân tích và thiết kế (Y3)

## Tài khoản mẫu

- Admin: `admin@fpt.edu.vn` / `123456`
- Staff: `staff@fpt.edu.vn` / `123456`

## Chạy dự án

### 1) Bật MongoDB

Đảm bảo service MongoDB đang chạy (đã cài MongoDB Server).

### 2) Backend

```bash
cd server
npm install
npm run seed
npm run dev
```

API: http://localhost:5000

### 3) Frontend

```bash
cd client
npm install
npm run dev
```

Web: http://localhost:5173

## Phân quyền

- `admin`: toàn quyền (CRUD + xóa)
- `staff`: thêm/sửa sản phẩm, đơn hàng, khách hàng; không xóa

## Module

1. Sản phẩm — danh sách, lọc, phân trang, thêm/sửa/xóa
2. Đơn hàng — theo dõi trạng thái, tạo đơn
3. Khách hàng — quản lý thông tin
4. Thống kê — doanh thu, đơn gần đây, sản phẩm bán chạy
