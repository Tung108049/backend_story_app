# Backend Story App

Node.js + Express + MySQL. Giữ Route → Controller → Service → Repository và SQL trực tiếp.

## Chạy trên máy hiện tại

1. Bật container MySQL story_db (cổng 3306).
2. Chạy npm ci. Nếu chưa có .env, copy .env.example thành .env và điền cấu hình.
3. Database mới: npm run db:setup. Database đã có schema: bỏ qua bước này.
4. Chạy npm run db:migrate để thêm bookshelf/reading_history, rồi npm run db:seed.
5. Chạy npm start hoặc npm run dev (node --watch).
6. Kiểm tra http://localhost:3000/api/ping.

JWT_ACCESS_SECRET và JWT_REFRESH_SECRET phải là hai chuỗi ngẫu nhiên riêng.
Không commit .env; .env.example chỉ là mẫu không có secret. DB_NAME mặc định dự án là story_db.
DB_PORT hỗ trợ cổng MySQL khác 3306. Dùng Node.js 22 trở lên.

## Dữ liệu mẫu

Seed thêm user và hai truyện demo, không xóa dữ liệu cũ, chạy lại không nhân bản.
Email: reader@example.test. Mật khẩu: HocTruyen123! (chỉ dùng local học tập).
Mỗi truyện có 2 chương xuất bản và 1 chương nháp để kiểm tra quyền công khai.
Ảnh comic mẫu là ảnh minh họa có sẵn, không phải bộ truyện thương mại.

## Kiểm tra

- npm test: API + MySQL thật, tạo và dọn các bản ghi test riêng.
- node scripts/check-schema.js: tạo database test riêng, kiểm tra schema/chạy lại, rồi dọn.
- node scripts/check-upload.js: upload Cloudinary thật bằng ảnh/account test rồi dọn.
- npm audit: kiểm tra dependency. Lần kiểm tra gần nhất: 0 vulnerabilities.

MySQL cần quyền tạo database để chạy check-schema. Cloudinary cần cấu hình để chạy check-upload.
Google trong test dùng phản hồi xác minh mô phỏng; cần kiểm tra OAuth thật sau khi cấu hình.

## Tài liệu

- [Phạm vi, quyết định và tiến độ](docs/progress.md)
- [API của app](docs/api.md)
- [Cấu hình Google không dùng Firebase](docs/google-login.md)

Log HTTP có endpoint, status và thời gian phản hồi; không ghi body/password/token.
Không bật trust proxy tùy tiện. App debug dùng HTTP local; triển khai thật cần HTTPS,
khóa ký release riêng, cấu hình CORS theo client và bỏ tài khoản demo.
