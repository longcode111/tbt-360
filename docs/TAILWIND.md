# Giao diện TBT 360 với Tailwind CSS v4

## Phạm vi thay đổi

- Thay `frontend/src/styles.css` (CSS tùy biến cũ) bằng Tailwind CSS.
- React và TypeScript giữ nguyên; API .NET, OAuth/OIDC và PostgreSQL không đổi.
- Không thêm SCSS vì Tailwind v4 đã đóng vai trò xử lý CSS.
- Bố cục responsive, ba banner và trang quản trị dùng chung Tailwind utilities.

## Các file quan trọng

| File | Vai trò |
| --- | --- |
| `frontend/src/tailwind.css` | Nhập Tailwind v4, định nghĩa màu chính, CSS nền rất nhỏ |
| `frontend/src/lib/uiStyles.ts` | Bộ utility Tailwind đặt tên rõ nghĩa, dùng lại giữa các trang |
| `frontend/src/App.tsx` | Trang chủ, `#products`, bài viết, liên hệ |
| `frontend/src/components/AdminPanel.tsx` | Quản trị, biểu mẫu, danh sách |
| `frontend/src/components/BannerCarousel.tsx` | Slideshow banner |
| `frontend/vite.config.ts` | Plugin chính thức `@tailwindcss/vite` |

## Cài đặt và chạy

```bash
cd frontend
npm install
npm run dev
```

Truy cập `http://localhost:5173`. Để nạp dữ liệu thật, cần chạy .NET API,
PostgreSQL và Keycloak theo README gốc. Không dùng Go Live / Live Server.

## Đổi màu giao diện

**Không cần chỉnh mã khi thay màu bằng Admin.** Vào `#admin` → `Cài đặt` →
`Màu chủ đạo`, sau đó chọn màu và lưu. API lưu vào PostgreSQL, React cập
nhật biến CSS `--primary` và các lớp Tailwind dùng `var(--primary)` sẽ đổi màu.

Màu mặc định khi chưa có cấu hình lấy từ `frontend/src/tailwind.css`:

```css
:root {
  --primary: #bd1722;
}
```

Để thay đổi phong cách các nút, menu, cột Admin và thẻ sản phẩm, chỉnh các
mục tương ứng của đối tượng `uiStyles` trong `src/lib/uiStyles.ts`.

Ví dụ React sử dụng các class Tailwind có tên mô tả:

```tsx
<button className={classNames('primaryButton')} type="button">
  Lưu thay đổi
</button>
```

`primaryButton` là tập hợp **các Tailwind utilities**, không phải CSS tùy
biến. Giữ các chuỗi utility ở dạng literal để Tailwind có thể quét mã lúc build.

## Quy tắc bảo trì

- Không thêm lại file CSS dài theo từng selector như bản cũ.
- Ưu tiên utility trong React, dùng `uiStyles` khi nhiều thành phần dùng chung.
- Khi thêm utility động, không ghép các lớp như `bg-${color}-500` vì
  Tailwind có thể không nhận diện; dùng biến CSS hoặc map tên lớp tĩnh.
- Code TypeScript: `singleQuote`, `semi`, 2 spaces, tên camelCase rõ nghĩa.
- `vite.config.ts` dùng Tailwind v4, **không cần** `tailwind.config.js`.
- Đã thay class của `header`, banner, product cards, bài viết và admin form;
  giao diện thực tế có thể tinh chỉnh tiếp tùy kích thước trình duyệt.

## Kiểm tra

```bash
python3 tests/validate_structure.py
python3 -m unittest discover -s tests -v
cd frontend
npm run typecheck
npm run build
```

Các lệnh npm yêu cầu cài packages từ npm registry. Không có kết nối mạng hoặc
chưa có .NET SDK sẽ không thể kiểm tra toàn bộ hệ thống trong môi trường đó.
