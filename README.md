# Story App — Backend

REST API cho ứng dụng đọc truyện chữ và truyện tranh, xây dựng bằng Node.js, Express và MySQL. Backend cung cấp dữ liệu truyện, xác thực, hồ sơ, tủ sách và lịch sử đọc cho ứng dụng Flutter.

**Repo liên quan:** [Ứng dụng Flutter](https://github.com/Tung108049/story_app/tree/codex/complete-reading-app)

> Bản đã tích hợp và kiểm thử nằm ở nhánh [`codex/complete-reading-app`](https://github.com/Tung108049/backend_story_app/tree/codex/complete-reading-app). Nhánh `main` hiện giữ mã nguồn nền; chức năng và hướng dẫn dưới đây áp dụng cho nhánh hoàn thiện.

## Chức năng

- Danh sách truyện có phân trang; tìm theo tên, lọc theo loại/thể loại và sắp xếp theo lượt đọc.
- Chi tiết truyện, danh sách chương và nội dung chữ/ảnh; API công khai chỉ trả truyện và chương đủ điều kiện xuất bản.
- Đăng ký, đăng nhập bằng mật khẩu hoặc Google; access token, refresh token và đăng xuất thu hồi phiên.
- Liên kết Google với tài khoản trùng email sau khi xác nhận đúng mật khẩu tài khoản app.
- Xem/cập nhật hồ sơ, upload ảnh đại diện lên Cloudinary.
- Tủ sách và lịch sử chương đọc theo từng tài khoản.
- API quản lý truyện/chương có kiểm tra quyền; frontend hiện tập trung vào phía người đọc.

## Công nghệ và cấu trúc

Node.js, Express, MySQL (`mysql2`), Joi, bcrypt, JWT, Google Auth Library, Multer và Cloudinary.

Luồng xử lý: **Route → Controller → Service → Repository → MySQL**. SQL viết trực tiếp trong repository; module chia theo chức năng.

```text
backend_story_app/
├── server.js             # Khởi tạo Express và gắn routes
├── src/
│   ├── config/           # MySQL, Cloudinary
│   ├── middlewares/      # Xác thực, phân quyền, upload, giới hạn request, lỗi
│   ├── modules/          # auth, users, stories, chapter, genres, tags, library
│   └── utils/            # Tiện ích dùng chung
├── database/             # Schema và migration
├── scripts/              # Setup, migrate, seed và kiểm tra tích hợp
├── test/                 # Kiểm thử API
├── public/demo/          # Ảnh minh họa
└── docs/                 # API, OAuth và tiến độ kiểm thử
```

## Chạy local

### 1. Chuẩn bị

- Node.js 22 trở lên và npm.
- MySQL 8 đang chạy trực tiếp hoặc trong Docker; mặc định cổng `3306`.
- Google OAuth cần cấu hình nếu dùng đăng nhập Google; Cloudinary cần cấu hình nếu dùng upload ảnh.

### 2. Lấy mã nguồn và cấu hình

```bash
git clone --branch codex/complete-reading-app https://github.com/Tung108049/backend_story_app.git
cd backend_story_app
npm ci
```

Copy `.env.example` thành `.env`, rồi điền:

| Biến | Ý nghĩa |
| --- | --- |
| `PORT` | Cổng API, mặc định `3000` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | Kết nối MySQL |
| `DB_NAME` | `story_db` với schema đi kèm |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Hai chuỗi ngẫu nhiên riêng để ký token |
| `GOOGLE_CLIENT_ID` | OAuth client ID loại **Web application** |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cấu hình upload ảnh |

Không commit `.env`, mật khẩu hoặc client secret. Google client ID là thông tin công khai; người chạy bản sao nên tạo OAuth client của mình theo [hướng dẫn Google](https://github.com/Tung108049/backend_story_app/blob/codex/complete-reading-app/docs/google-login.md).

### 3. Khởi tạo dữ liệu

Database mới, chưa có bảng:

```bash
npm run db:setup
npm run db:seed
```

Nếu đã có schema cũ của dự án, dùng migration để thêm tủ sách/lịch sử:

```bash
npm run db:migrate
npm run db:seed
```

Script setup dùng tên database `story_db`. Seed chạy lại không nhân bản dữ liệu mẫu và không xóa dữ liệu cũ.

### 4. Chạy API

```bash
npm start
```

Dùng `npm run dev` để tự khởi động lại khi sửa file. Kiểm tra tại `http://localhost:3000/api/ping`, rồi chạy frontend theo [README Flutter](https://github.com/Tung108049/story_app/blob/codex/complete-reading-app/README.md).

## Dữ liệu demo

- Tài khoản: `reader@example.test` / `HocTruyen123!` — chỉ dùng học tập tại local.
- Hai truyện mẫu: một truyện chữ và một truyện tranh; mỗi truyện có hai chương xuất bản và một chương nháp để kiểm tra quyền truy cập.
- Comic dùng ảnh minh họa có sẵn, không phải nội dung truyện hoàn chỉnh.

## Kiểm thử

```bash
npm test
node scripts/check-schema.js
node scripts/check-upload.js
```

- `npm test`: kiểm thử API với MySQL thật, tạo và dọn bản ghi test riêng. Google token verification được mô phỏng trong test tự động.
- `check-schema.js`: tạo database test riêng, kiểm tra schema và khả năng chạy lại; cần quyền tạo database.
- `check-upload.js`: upload Cloudinary thật rồi dọn ảnh/tài khoản test; cần cấu hình Cloudinary.

Đã kiểm tra đăng nhập Google thật trên Android, bao gồm đăng xuất và đăng nhập lại. Chi tiết nằm trong [tiến độ dự án](https://github.com/Tung108049/backend_story_app/blob/codex/complete-reading-app/docs/progress.md).

## Tài liệu và giới hạn

- [Các endpoint và quy ước API](https://github.com/Tung108049/backend_story_app/blob/codex/complete-reading-app/docs/api.md)
- [Cấu hình Google OAuth không dùng Firebase](https://github.com/Tung108049/backend_story_app/blob/codex/complete-reading-app/docs/google-login.md)
- [Phạm vi, quyết định thiết kế và kiểm thử](https://github.com/Tung108049/backend_story_app/blob/codex/complete-reading-app/docs/progress.md)

Đây là bản học tập chạy local. Mỗi tài khoản hiện có một phiên server; đăng nhập mới làm phiên cũ hết hiệu lực. Lượt đọc tính theo số lần tải chương, chưa chống đếm trùng. Chưa có thanh toán hoặc kiểm duyệt nội dung hoàn chỉnh.

Log HTTP ghi endpoint, status và thời gian phản hồi, không ghi body chứa mật khẩu/token. Khi triển khai công khai cần HTTPS, cấu hình CORS theo client, quản lý secret và bỏ tài khoản demo.
