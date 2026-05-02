# GHI CHÚ CHI TIẾT

## Mô hình dữ liệu quan hệ

### Bảng `users`
```
user_id bigint AI PK
avatar_url varchar(255)
created_at datetime(6)
display_name varchar(255)
email varchar(255)
is_active bit(1)
is_online bit(1)
last_seen_at datetime(6)
password varchar(255)
role enum('ADMIN','USER')
username varchar(255)
```

### Bảng `conversations`
```
conv_id bigint AI PK
created_at datetime(6)
image varchar(255)
last_message varchar(255)
name varchar(255)
type enum('GROUP','PRIVATE')
updated_at datetime(6)
```

### Bảng `message`
```
mess_id bigint AI PK
content text
conv_id bigint    (FK)
created_at datetime(6)
deleted bit(1)
edited bit(1)
read_at datetime(6)
sender_id bigint   (FK)
```

### Bảng `conversation_user`
```
joined_at datetime(6)
role enum('ADMIN','MEMBER')
conv_id bigint PK   (FK)
user_id bigint PK   (FK)
```

- Hai trường `conv_id` và `user_id` cùng là khóa chính của bảng trung gian. Điều này đảm bảo mỗi cặp người dùng + cuộc hội thoại chỉ xuất hiện một lần.
- Nếu tách composite key thành một khóa đơn, sẽ gây ra lỗi logic: mỗi user chỉ có thể tham gia một conversation hoặc mỗi conversation chỉ chứa một user.

## 1. Composite key `convId + userId`
- Dùng để đảm bảo mỗi user chỉ tham gia một conversation một lần.
- Mỗi cặp (user, conversation) là duy nhất.
- Giúp nhận diện chính xác quan hệ membership giữa người dùng và cuộc hội thoại.
- Ngăn duplicate trong bảng `conversation_user`.

## 2. DTO trong quản lý request/response
- Không nên dùng trực tiếp Entity trong API.
- DTO giúp kiểm soát dữ liệu vào/ra, tránh lộ thông tin nhạy cảm như password.
- Với request, nên tách thành `CreateRequest` và `UpdateRequest`.
- Với response, dùng `Response` object riêng để trả dữ liệu cho client.
- Trao đổi qua JSON, tách biệt giữa thực thể (Entity) và API contract.

## 3. Exception Handling
- Kiểm soát lỗi hệ thống: thiếu tài nguyên, trùng lặp, bad request, lỗi API.
- Trả về response lỗi thống nhất cho client.
- Tránh lộ stacktrace nội bộ để bảo mật.
- Tách riêng xử lý lỗi khỏi business logic.

## 4. Role
- `Role` ở User: phân biệt vai trò toàn hệ thống (ADMIN/USER).
- `Role` trong Conversation: chỉ định quyền trong cuộc hội thoại (ADMIN/MEMBER).

## 5. Response object
- `ConversationResponse` trả đầy đủ thông tin một cuộc hội thoại, có thể gồm danh sách thành viên.
- `ConversationSummaryResponse` trả thông tin tóm tắt để hiển thị ở trang chính, tránh truy vấn danh sách thành viên nhiều lần.
- `MemberResponse` lưu thông tin thành viên trong cuộc hội thoại, dùng cho thao tác thêm/xóa thành viên.

## 6. API tin nhắn phải dựa trên Conversation
- Tin nhắn luôn thuộc một cuộc hội thoại cụ thể.
- Không nên tách message API ra ngoài context conversation vì lý do bảo mật và logic.

## 7. PUT vs PATCH
- `PUT` dùng để cập nhật toàn bộ tài nguyên.
- `PATCH` dùng để cập nhật một số trường cần thiết.

## 8. JWT
Luồng xác thực JWT:
1. Client gửi `POST /auth/register` để đăng ký. Password được hash và lưu DB.
2. Client gửi `POST /auth/login` để đăng nhập. Hệ thống kiểm tra password, tạo JWT và trả token.
3. Mọi request sau đó gửi header `Authorization: Bearer <token>`.
4. `JwtAuthFilter` kiểm tra token, xác thực người dùng và chuyển request vào controller.

- Token được ký bằng khóa bí mật.
- Filter là nơi kiểm tra token hợp lệ trước khi cho phép truy cập controller.

## 9. UserDetailsService
- `UserDetailsService` là cầu nối để Spring Security lấy thông tin user từ DB.
- Spring Security không biết cách truy vấn User, nên cần implement interface này.
- Luồng:
  - Filter giải mã token lấy username
  - `UserDetailsService.loadUserByUsername(username)` trả về `UserDetails`
  - Spring Security dùng thông tin này để verify, check role và set `SecurityContext`

## 10. AuthenticationManager
- `AuthenticationManager` không được tạo tự động nếu không khai báo.
- Cần khai báo `@Bean` trong `SecurityConfig` để Spring có thể inject vào `AuthService`.

## 11. Không lưu User toàn cục
- Web server xử lý nhiều request đồng thời.
- Nếu lưu User trong field toàn cục hoặc singleton, các request có thể ghi đè nhau.
- Điều này gây lộ dữ liệu giữa người dùng A và B.
