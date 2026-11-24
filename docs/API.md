# API v1 (route `/api/*`)

| Verb | Route | Quyền |
| --- | --- | --- |
| GET | `/api/health` | Public |
| GET | `/api/products` | Public |
| GET | `/api/articles` | Public |
| GET | `/api/banners` | Public |
| GET | `/api/settings` | Public |
| GET | `/api/me` | OAuth access token |
| POST | `/api/orders` | OAuth access token |
| POST | `/api/contacts` | OAuth access token |
| GET | `/api/admin/dashboard` | `admin` |
| GET, POST | `/api/admin/products` | `admin` |
| PUT, DELETE | `/api/admin/products/{id}` | `admin` |
| GET, POST | `/api/admin/articles` | `admin` |
| PUT, DELETE | `/api/admin/articles/{id}` | `admin` |
| GET, POST | `/api/admin/banners` | `admin` |
| PUT, DELETE | `/api/admin/banners/{id}` | `admin` |
| GET | `/api/admin/orders` | `admin` |
| PATCH | `/api/admin/orders/{id}/status` | `admin` |
| GET | `/api/admin/contacts` | `admin` |
| GET, PUT | `/api/admin/settings` | `admin` |

## Ví dụ POST sản phẩm

```json
{
  "name": "BIM CDE 360",
  "description": "Quản lý dữ liệu và mô hình BIM",
  "price": 0,
  "imageUrl": "/banners/bim-cde-360.png",
  "isPublished": true
}
```

API sẽ từ chối request không có JWT hợp lệ và request admin thiếu
quyền realm `admin`. Frontend truyền Bearer token trong `Authorization`.
