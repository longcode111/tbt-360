# Kiến trúc TBT 360

```text
Browser / React 19 + TypeScript + Vite
  |   (OAuth 2.0 Authorization Code + PKCE / OIDC)
  +------------------------------> Keycloak (local provider)
  |                                      |
  | <----------- access token (aud: tbt-api)
  |
  | REST + Authorization: Bearer <JWT>
  v
ASP.NET Core 10 API
  |- Validate JWT issuer, signature, expiration, audience
  |- API Admin kiểm tra realm role `admin`
  |- Models + DataAnnotations / EF Core
  v
PostgreSQL 17
```

- CORS chỉ cho dev frontend `http://localhost:5173`.
- Backend không nhận mật khẩu từ frontend.
- Backend không tin frontend khi frontend nói nó là admin.
- Keycloak `realm_access.roles` được API xác minh sau khi xác thực JWT.
- `tbt-api` phải xuất hiện trong `aud` claim, do audience mapper cấp.
- Không dùng OAuth implicit flow hay password grant.
- Dữ liệu nội dung không chứa các tài khoản SSO.

## Repository

```text
frontend/   React TypeScript, CSS, 3 banner
backend/    ASP.NET Core Minimal API, EF Core
infra/      Keycloak realm JSON
docker-compose.yml   PostgreSQL service (Docker)
```

Các luồng CRUD được thiết kế ngắn gọn, chưa có cache, message queues,
external services hoặc các thành phần mở rộng không được yêu cầu.
