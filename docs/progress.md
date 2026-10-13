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

- Nền API/database: đã triển khai; test API trên MySQL và schema mới/chạy lại đã qua.
- Auth/Google: đã triển khai; email/mật khẩu và vòng đời phiên đã test.
  Google đã test nghiệp vụ bằng mock thư viện; backend thật từ chối token giả với 401.
  Lần thử đầu dùng nhầm Android Client ID làm serverClientId. Đã đối chiếu cột Type
  trong Google Cloud và thay đúng Web application Client ID ở Flutter/backend;
  đang kiểm tra lại đăng nhập bằng tài khoản thật.
- App/API, đọc, hồ sơ, tủ sách/lịch sử: đã triển khai; bổ sung test form liên kết Google.
- APK debug: build thành công; integration test Android/API thật đã qua
  (đọc/chuyển chương → đăng nhập → lưu truyện → lịch sử).
- Cloudinary: ping và upload avatar thật đã qua, tài khoản/ảnh test được dọn.

## Các quyết định để code dễ đọc

- Giữ MySQL câu lệnh trực tiếp và module hiện có; thêm library theo cùng cấu trúc.
- GetX cho trạng thái; repository gọi một ApiClient chung để không lặp HTTP/refresh.
- Token lưu bằng flutter_secure_storage; database chỉ lưu bản băm refresh token.
- Một tài khoản có một phiên server: đăng nhập mới làm phiên cũ hết hiệu lực.
- Tủ sách/lịch sử tối đa 100 mục hiển thị; lịch sử nhớ chương, chưa nhớ vị trí cuộn.
- Danh sách truyện có phân trang 30 mục; tìm kiếm theo tên, chưa tìm gần đúng.
- BXH dùng tổng lượt tải chương, chưa có BXH theo ngày/tuần.
- Không tự liên kết Google với tài khoản local trùng email.
  Muốn liên kết phải có cả Google token hợp lệ và mật khẩu local đúng.
- Comic mẫu dùng ảnh minh họa có sẵn để test tải ảnh; không phải nội dung truyện hoàn chỉnh.
- Tên hiển thị hiện là Story App; Android applicationId là com.tungpham.story_app.
  Tên Dart package/thư mục vẫn story_app_pro để giữ import hiện có.

## Những vấn đề test đã phát hiện và sửa

- API thể loại gọi sai tên hàm; tạo genre/tag trả ID undefined.
- Chương nháp xuất hiện qua API công khai; sửa điều kiện xuất bản.
- Model Flutter không đọc được rating DECIMAL/URL tương đối; chuẩn hóa chuyển đổi.
- Rx cập nhật ngay khi dựng LoginView; chuyển thao tác sang sau frame đầu.
- Bìa rỗng gây yêu cầu tới URI không có host; dùng StoryCover và asset ngay.
- Google email trùng tài khoản local: thêm luồng liên kết bằng mật khẩu app;
  sửa middleware không che thông báo nghiệp vụ 409 bằng lỗi SQL chung.
- Kotlin cache khác ổ đĩa; tắt incremental cache cho môi trường này.
- AVD cũ thiếu dung lượng; dùng AVD test riêng 12 GB, không xóa dữ liệu AVD gốc.

## Theo dõi khi chạy thử

Xem log HTTP để kiểm tra endpoint, status và thời gian phản hồi.
Nếu app không kết nối: kiểm tra /api/ping, cổng 3000, địa chỉ API và kết nối thiết bị.
Nếu 401: thử refresh; token bị thu hồi thì app xóa phiên và yêu cầu đăng nhập lại.
Nếu upload lỗi: kiểm tra cấu hình Cloudinary và giới hạn ảnh 10 MB.
Không có monitoring nền hay tự động gửi thông báo; đây là theo dõi trong phiên chạy thử.

Log HTTP dùng morgan; lỗi server chỉ ghi loại lỗi, không ghi token hoặc mật khẩu.
Lượt xem là số lần API đọc chương được tải, chưa chống đếm trùng.
