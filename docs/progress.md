# Hoàn thiện dự án

Giữ CommonJS và Route → Controller → Service → Repository; SQL tham số hóa, không ORM.
Mỗi chức năng: phân tích → thực hiện → test → xem phản hồi/log → commit/push.

## Phạm vi

- Khách: xem/tìm/lọc truyện, BXH theo lượt đọc, chi tiết, đọc chữ và tranh.
- Tài khoản: đăng ký/đăng nhập hiện có, Google qua backend, refresh, đăng xuất, hồ sơ.
- Cá nhân: tủ sách, lịch sử đọc theo tài khoản.
- Giao diện trắng/hồng, GetX; không để màn hình hứa hẹn chức năng chưa làm.
- Chức năng đăng truyện hiện có ở API được giữ; UI đăng truyện/cộng đồng/thanh toán không thuộc bản này.

## Tiêu chí hoàn thành

- API trả dữ liệu đủ cho app, chương nháp không công khai.
- Một truyện mở đúng chi tiết và từng chương; ảnh/chữ đều có trạng thái lỗi.
- Lọc/tìm/BXH có dữ liệu thật và xử lý rỗng.
- Đăng nhập lưu phiên an toàn; đăng xuất xóa phiên; hồ sơ/tủ sách/lịch sử đúng người.
- Có schema, seed, hướng dẫn chạy điện thoại/giả lập, test và build Android.
- Google cần OAuth client thực để nghiệm thu với tài khoản thật.

## Tiến độ

- Nền API/database: đang thực hiện.
- Auth/Google: chờ triển khai, OAuth client chưa có.
- App/API, đọc, hồ sơ, tủ sách/lịch sử: chờ triển khai.

Log HTTP dùng morgan; lỗi server chỉ ghi loại lỗi, không ghi token hoặc mật khẩu.
Lượt xem là số lần API đọc chương được tải, chưa chống đếm trùng.
