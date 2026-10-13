# Đăng nhập Google qua backend riêng

Không cần Firebase. Flutter lấy Google ID token; backend dùng google-auth-library
kiểm tra chữ ký, audience, thời hạn, email_verified rồi tìm user_identities theo sub.
Backend trả access/refresh token của app, không dùng Google token làm phiên của app.

## Cấu hình cần chủ tài khoản Google thực hiện

1. Mở https://console.cloud.google.com/ và tạo/chọn project.
2. Trong Google Auth Platform cấu hình Branding, Audience, thông tin liên hệ.
   Với app học, giữ Testing và thêm email Google dùng thử vào Test users.
3. Tạo OAuth client loại Android:
   - Package name: com.tungpham.story_app_pro
   - SHA-1 debug trên máy này:
     8A:05:C7:31:40:EF:82:88:7B:7B:54:BF:0B:99:4D:56:68:4B:22:89
4. Tạo thêm OAuth client loại Web application trong cùng project.
   Client ID loại Web là server client ID, không phải Android client ID.
5. Đặt GOOGLE_CLIENT_ID trong .env backend bằng Web client ID.
6. Chạy Flutter với --dart-define=GOOGLE_SERVER_CLIENT_ID=WEB_CLIENT_ID.

Không cần gửi client secret cho app; không commit .env. Client ID không phải mật khẩu.
Nếu hỗ trợ iOS cần OAuth client iOS, URL scheme và GOOGLE_IOS_CLIENT_ID;
bản này chỉ nghiệm thu Android. Release cần cấu hình SHA-1 của khóa ký release.

## Kiểm tra thật sau khi cấu hình

- Chọn tài khoản thử → thấy hồ sơ đúng; đăng nhập lần hai không tạo user trùng.
- Hủy chọn tài khoản → vẫn sử dụng app được.
- Token không hợp lệ/audience khác bị backend từ chối.
- Email trùng tài khoản local: báo đăng nhập bằng mật khẩu; chưa hỗ trợ liên kết tài khoản.
- Đăng xuất và gọi API hồ sơ bằng token cũ → 401.

Test tự động mock phản hồi thư viện Google để test nghiệp vụ và database.
Điều đó không thay thế kiểm tra OAuth với tài khoản Google thật.

Tài liệu: https://developers.google.com/identity/sign-in/android/backend-auth
và https://pub.dev/packages/google_sign_in_android
