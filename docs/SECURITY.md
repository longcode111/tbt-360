# Bảo mật MVP

## Đã thiết kế

- Authorization Code + PKCE (S256) cho React public client.
- OIDC chuẩn, sử dụng Keycloak ở môi trường local.
- Backend JWT bearer kiểm tra `iss`, `aud`, `exp`, chữ ký qua JWKS.
- Endpoint admin kiểm tra quyền `admin` trên server.
- PostgreSQL qua EF Core, không ghép SQL từ chuỗi nhập.
- Validation độ dài input, giá trị giá tiền và email.
- Giới hạn tần suất viết dữ liệu.
- Chỉ tin các Origin frontend được liệt kê trong CORS.
- Cấm thực thi HTML trong bài viết, giới hạn URL ảnh/link.

## Chưa được kiểm chứng

- Chưa chạy .NET SDK build hoặc test thực tế trong môi trường tạo file.
- Chưa khởi động Keycloak container thực tế ở đây.
- Chưa được pentest và chưa có đánh giá OWASP ASVS đầy đủ.
- Chưa có migration production, backup và cơ chế khôi phục.
- Chưa có TLS cho local; trước production phải sử dụng HTTPS.
- Không đặt secret trong Git; dùng `.env`, .NET user secrets / secret manager.

Không được coi starter này là sản phẩm đã đạt chứng nhận bảo mật hay đã
đáp ứng mọi nội dung OAuth 2.0 một cách độc lập. Các cấu hình local chỉ là
môi trường phát triển.
