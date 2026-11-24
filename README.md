# TBT 360 — React + TypeScript + ASP.NET Core + PostgreSQL

Bộ mã nguồn nền tảng TBT 360 được dựng mới từ dự án V4 (HTML/Python/SQLite).
**Đây là starter độc lập có trang quản trị**, chưa tự động nhập dữ liệu SQLite cũ
và chưa phải bản triển khai production.

## Công nghệ

| Thành phần | Công nghệ | Mục đích |
| --- | --- | --- |
| Frontend | React 19, TypeScript, Vite 7 | UI, trang công khai, Admin |
| Backend | ASP.NET Core 10 Minimal API | REST API, phân quyền |
| Database | PostgreSQL 17 + Entity Framework Core 10 (Npgsql) | Dữ liệu chính |
| Xác thực | OAuth 2.0 + OpenID Connect | Authorization Code + PKCE |
| Identity Provider local | Keycloak 26.4 | Cấp token, quản lý người dùng |
| Git | Git repo với nhánh `main` | Phát triển và đồng bộ |

Sử dụng **OAuth 2.0 Authorization Code + PKCE** ở React, OIDC cho đăng nhập
và bearer JWT ở API. Backend kiểm tra chữ ký JWT (qua issuer/JWKS), issuer,
audience `tbt-api`, thời hạn, và realm role `admin`. Không tự cấp access token.
Không lưu client secret trong frontend. Keycloak ở đây chỉ dùng để chạy local,
có thể thay bằng nhà cung cấp OIDC chuẩn khác khi cấu hình lại.

## Yêu cầu trên Mac hoặc Windows

- Node.js >= 20.19 hoặc >= 22.12, npm.
- .NET SDK 10.
- Docker Desktop (cho PostgreSQL + Keycloak).
- Visual Studio Code.

**Không sử dụng Go Live/Live Server của VS Code** cho dự án React này.
Vite chạy ở cổng 5173, ASP.NET Core ở cổng 5080, Keycloak cổng 8080,
PostgreSQL cổng 5432.

## Chạy local từ đầu (macOS Terminal / VS Code)

1. Mở thư mục gốc `tbt-360-react-dotnet` trong VS Code.
2. Sao chép cấu hình local:

   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```

3. Khởi động PostgreSQL và Keycloak:

   ```bash
   docker compose up -d
   ```

   Keycloak khởi động lần đầu có thể mất một lúc. Truy cập
   `http://localhost:8080/admin` bằng tài khoản bootstrap ghi trong `.env`.
   Chọn realm `tbt-360` (đã import từ JSON).

4. Trong Keycloak, tạo tài khoản người dùng tại **Users → Add user** và
   đặt mật khẩu ở tab **Credentials**. Người dùng cũng có thể tự đăng ký
   qua màn hình đăng nhập Keycloak (đã bật cho môi trường local). Để vào Admin TBT 360, gán realm role
   `admin` tại **Role mapping** (đây là role phía Keycloak, không phải chỉ
   là trạng thái hiển thị trên React).

5. Khởi động API ở Terminal 1 (từ thư mục gốc):

   ```bash
   ./scripts/run-api-mac.sh
   ```

   Test `http://localhost:5080/api/health` trả về
   `{ "status": "healthy" }`.

6. Terminal 2 (từ thư mục gốc):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. Mở `http://localhost:5173`, bấm **Đăng nhập**, đăng nhập qua Keycloak.
   Với người dùng có realm role `admin`, menu **Quản trị** sẽ xuất hiện.

**Lưu ý tài khoản local:** mật khẩu ví dụ trong `.env.example` chỉ dùng để
thử nghiệm. `scripts/run-api-mac.sh` đọc file `.env` và đưa connection string
qua biến môi trường; không commit `.env` hoặc mật khẩu thật.

## Dùng Admin

- `#admin` → Tổng quan, Sản phẩm, Bài viết, Banner, Đơn hàng, Liên hệ,
  Cài đặt màu sắc.
- Banner mới được đưa vào mặc định trong dữ liệu seed (3 ảnh gốc trong
  `frontend/public/banners`).
- Admin có thể đổi URL hình, thứ tự, trạng thái hiển thị.
- Màu chủ đạo cập nhật trực tiếp qua `Cài đặt → Màu chủ đạo`.
- Sau khi lưu, website đọc dữ liệu từ PostgreSQL, không sửa cứng HTML.

## Bảo mật và phạm vi

- Bearer JWT phải có chữ ký hợp lệ, issuer và audience chính xác.
- API quản trị yêu cầu role `admin` từ token đã được backend kiểm tra.
- CORS chỉ cho frontend cục bộ theo cấu hình, không mở wildcard.
- Đầu vào được kiểm tra bằng DataAnnotations; EF Core dùng truy vấn tham số.
- Giới hạn tần suất POST dữ liệu; liên hệ và đặt hàng bắt buộc đăng nhập.
- Nội dung bài viết hiển thị dạng text, không thực thi HTML tùy ý.
- URL ảnh và URL banner kiểm tra tránh `javascript:`.
- Session frontend lưu trong `sessionStorage` của trình duyệt, không lưu
  mật khẩu. Đây là kiến trúc SPA OAuth trực tiếp, nên cần CSP, XSS review và
  threat modeling trước production. Mô hình BFF có thể an toàn hơn nhưng
  **không được mở rộng trong phạm vi starter này**.
- **Chưa có** email thật, thanh toán, tải file, migrations production,
  backup, audit trail đầy đủ, monitoring, hardening và pentest.
- `EnsureCreated` chỉ chạy khi `ASPNETCORE_ENVIRONMENT=Development`.
  Trước khi vận hành thật, cần tạo migrations EF Core, đảm bảo schema,
  TLS/HTTPS, secret manager, quản lý backup, cập nhật mật khẩu và cấu hình
  nhà cung cấp OIDC production.
- Không dùng `start-dev` Keycloak cho production.

## PostgreSQL

Dữ liệu chính nằm trong các bảng:

- `Products`: danh sách sản phẩm.
- `Articles`: bài viết.
- `Banners`: banner.
- `Orders`: đơn hàng.
- `Contacts`: thông tin liên hệ.
- `SiteSettings`: tên, email, màu chủ đạo.

**Tài khoản và mật khẩu do Keycloak quản lý**, không lưu trong database ứng
 dụng. Chỉ lưu `sub` người tạo đơn hàng/liên hệ để liên kết dữ liệu.

## Git / GitHub

Mã nguồn đã được khởi tạo Git cục bộ. Remote dự kiến:

```
https://github.com/longcode111/tbt-360.git
```

Để đẩy lên GitHub, cần quyền ghi với tài khoản GitHub `longcode111`:

```bash
git remote -v
git push -u origin main
```

Việc thiết lập remote **không chứng minh đã push thành công**.
Kiểm tra `.gitignore` để tránh đưa `.env`, dữ liệu khách hàng và secret lên Git.

## Tài liệu

- `docs/ARCHITECTURE.md`: tổng quan và luồng đăng nhập.
- `docs/API.md`: danh mục API.
- `docs/SECURITY.md`: phạm vi kiểm soát bảo mật.
- `docs/MIGRATION_FROM_V4.md`: những gì giữ lại và chưa chuyển từ V4.

## Quy tắc code

- TypeScript: mỗi statement một dòng, dấu `;`, thụt lề 2 spaces,
  `singleQuote`, tối đa khoảng 80 ký tự.
- `if`, `for`, `function`: dấu `{` đặt trên dòng riêng theo yêu cầu dự án.
  **Chú ý:** Prettier mặc định lại đặt dấu `{` cùng dòng; muốn giữ cách này
  cần dùng cấu hình formatter khác hoặc không chạy Prettier ghi đè vào
  những file đã tuân theo quy tắc đặc biệt.
- Dùng camelCase rõ nghĩa, không viết tắt biến thành 1–2 ký tự.
- C#: 4 spaces cho style C# tiêu chuẩn, không gộp statement.

Trên Windows PowerShell, sau khi tạo `.env`, có thể chạy
`scripts/run-api-windows.ps1` để khởi động API.
