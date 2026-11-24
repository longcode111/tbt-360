# Chuyển từ website V4 hiện có

## Đã chuyển

- 3 banner nguyên ảnh và slideshow.
- Cấu trúc trang chủ, tab Sản phẩm (#products), Bài viết, Liên hệ, Admin.
- Chức năng quản lý sản phẩm, bài viết, banner và cấu hình giao diện.
- Đơn hàng, liên hệ và phân quyền admin.
- Chủ đề phối màu đỏ / xanh; có thể đổi màu chính từ Admin.

## Chưa chuyển

- Database SQLite/Python V4 không tự động nhập vào PostgreSQL.
- Nội dung và hình ảnh sản phẩm chi tiết V4 ngoài ba banner.
- Các quyền, tài khoản và lịch sử đơn hàng cũ.
- File tĩnh tham khảo HTML/Python cũ (không chạy song song).

Nếu sử dụng dữ liệu thật, cần sao lưu SQLite V4 và viết migration
SQLite → PostgreSQL theo schema mới. Không chuyển bảng password hash sang
Keycloak bằng cách copy trực tiếp.
