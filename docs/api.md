# API dùng trong app

Response thành công có `data` (nếu có dữ liệu) và/hoặc `message`.
Lỗi trả status HTTP và `message`; không trả SQL, stack hoặc token trong log.
API cá nhân dùng `Authorization: Bearer ACCESS_TOKEN`.

| Method | Endpoint | Nội dung |
| --- | --- | --- |
| GET | /api/ping | Kiểm tra server |
| GET | /api/genres, /api/tags | Danh mục công khai |
| GET | /api/stories | Danh sách đã xuất bản; keyword, content_type, genre_id, tag_id, sort_by, page, limit |
| GET | /api/stories/:id | Chi tiết và chương đã xuất bản |
| GET | /api/chapters/:id | Nội dung chữ hoặc images, tăng lượt xem |
| POST | /api/auth/register | username, email, password |
| POST | /api/auth/login | identifier, password |
| POST | /api/auth/google | idToken; cần GOOGLE_CLIENT_ID |
| POST | /api/auth/refresh | refreshToken → accessToken mới |
| POST | /api/auth/logout | Thu hồi phiên hiện tại |
| GET | /api/users/me | Hồ sơ tài khoản hiện tại |
| GET | /api/library/bookshelf | Truyện đã lưu, tối đa 100 |
| POST | /api/library/bookshelf | story_id; gọi lại không tạo bản ghi trùng |
| DELETE | /api/library/bookshelf/:id | Bỏ lưu truyện |
| GET | /api/library/history | Chương gần nhất theo truyện, tối đa 100 |
| PUT | /api/library/history | chapter_id; không nhận user_id từ client |
| DELETE | /api/library/history | Xóa lịch sử của chính tài khoản |

API quản lý truyện/chương, avatar và tạo thể loại/thẻ vẫn giữ trong các route hiện có.
Chỉ admin hoặc tác giả được sửa truyện/chương; moderator không mặc định là chủ sở hữu.
