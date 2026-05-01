# CHI TIẾT:
## Về cơ sở dữ liệu có mô hình dữ liệu quan hệ sau:
### users
~~~
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
~~~
### conversations
~~~
conv_id bigint AI PK 
created_at datetime(6) 
image varchar(255) 
last_message varchar(255) 
name varchar(255) 
type enum('GROUP','PRIVATE') 
updated_at datetime(6)
~~~
### message
~~~
mess_id bigint AI PK 
content text 
conv_id bigint            (FK)
created_at datetime(6) 
deleted bit(1) 
edited bit(1) 
read_at datetime(6) 
sender_id bigint          (FK)
~~~
### conversation_user
~~~
joined_at datetime(6) 
role enum('ADMIN','MEMBER') 
conv_id bigint PK         (FK)
user_id bigint PK         (FK)
~~~
* lý do 2 khóa ngoại (conv_id, user_id) này kết hợp thành khóa chính: vì mỗi dòng trong bảng luôn được định danh duy nhất bởi conv_id, user_id trong bảng trung gian (sinh ra bởi quan hệ nhiều-nhiều của User và Conversation).
* Khi tách khóa tổng hợp ra thành khóa đơn:

    Nếu chọn user_id: Chỉ có thể có 1 USER duy nhất cho mỗi cuộc hội thoại. Nếu thêm USER thứ hai vào cuộc hội thoại -> trùng khóa.

    Nếu chọn conv_id: Chỉ có thể có 1 cuộc hội thoại duy nhất cho mỗi User. Nếu tạo cuộc hội thoại thứ hai ở User đó -> trùng khóa.

# GHI CHÚ:
## 1. (convId + userId) = PRIMARY KEY của bảng ConversationMember
* Composite key dùng để đảm bảo mỗi user chỉ tham gia một conversation một lần, và định danh duy nhất quan hệ membership đó.
* Mỗi cặp (user, conversation) chỉ tồn tại duy nhất 1 bản ghi
* Định danh duy nhất membership: User A trong Conversation X
* Chống duplicate.

## 2. Dùng DTO trong quản lý yêu cầu phản hồi
* Ý tưởng: Nếu chỉ dùng từ Entity thông thường, dễ lộ thông tin bảo mật của thực thể, cần một phương pháp để truyền dữ liệu vào/ra nhưng đảm bảo không lộ lọt thông tin, kiểm soát field cần thiết trong flow. Đơn giản chỉ cần Requets và Response, nhưng đối với Request thì việc truyền đi trong flow có 2 hành vi là Create(tạo) và Update(Cập nhật) nên Requets lại chia thành: CreateRequest (tạo yêu cầu), UpdateRequest(yêu cầu cập nhật) gửi về phía Backend, còn Resopnse (Phản hôi từ Backend về lại phía Frontend,Client).
* Trao đổi dưới dạng JSON, tách biết giữa Thực thể và API từ client

## 3. Exception Handling (thủ thuật kiểm soát lỗi hệ thống)
* Kiểm soát lỗi xảy ra trong hệ thống (thiếu tài nguyên, trùng lặp, bad request, lỗi do API)
* Trả về response thống nhất cho client
* Tránh lộ stacktrace nội bộ (bảo mật)
* Tách logic xử lý lỗi khỏi business logic

## 4. Role
Role trong User khác với Role trong cuộc hội thoại:
* Role trong User chỉ để phân biệt giữa tất cả người dùng trong hệ thống (ADMIN: người quản trị, USER: người dùng)
* Role trong Conversation là role phân biệt chỉ đối với cuộc hội thoại đó (ADMIN: chủ phòng, MEMBER: thành viên nhóm)

## 5. ConversationResponse và ConversationSummaryResponse, MemberResponse
* ConversationResponse lưu phản hồi đầy đủ của một cuộc hội thoại, gồm cả danh sách các thành viên
* ConversationSummaryResponse chỉ lưu thông tin cơ bản của một cuộc hội thoại để load ở trang chủ (không gồm danh sách thành viên -> tránh query lấy danh sách nhiều lần) tránh N+1 Problem
* MemberResponse lưu thông tin của member trong một cuộc hội thoại - chỉ có yêu cầu thêm hoặc xóa (POST và DELETE trên Bảng trung gian)

## 6. Message API phải dựa theo Conversation
* Vì mỗi cuộc hội thoại có các tin nhắn khác nhau
* Không thể tách riêng để xem riêng vì lý do bảo mật thông tin

## 7. endpoint PUT và PATCH giống nhau: Đều là cập nhật thông tin, khác nhau:
* PUT là cập nhật toàn bộ thông tin
* PATCH là chỉ cập nhật field cần thiết

## 8.JWT
Luồng từ JWT:
Flow:  Tạo token (JWT Service) --> Filter (Nhận tokem và nhận diện currentUser) ---> Đưa vào controller để thao tác tiếp
* Token key được sinh ra: Flow: String → byte[] → Key → dùng để .signWith(...) :
với getSignKey() = tạo khóa, generateToken() = dùng chìa khóa để ký token
* Filter là nơi để kiểm tra token hợp lệ rồi mới cho phép đi vào controller
```
    REGISTER
    Client → POST /auth/register → hash password → lưu DB

    LOGIN
    Client → POST /auth/login → verify password → tạo JWT → trả token

    MỌI REQUEST SAU
    Client → Header: Bearer <token> → JwtAuthFilter → Controller
```
## 9. UserDetailsServive: là cầu nối giúp hệ thống lấy thông tin user từ DB để phục vụ xác thực (authentication).
* SpringSecurity không biết cách lấy User từ hệ thống nên nó giữa chúng cần một nơi để security có thể nhận diện được User truyền vào.
* Spring chỉ định nghĩa interface và phải tự implements các lấy User
* FLow: REQUETS --> Filter với token hợp lệ --(extracted username)--> UserDetailService(username) --(trả về một UserDetail [lấy User từ DB])--> ĐI vào security để verify, checkRole, và set SecurityContext

## 10. 
* AuthenticationManager không tự có nên phải khai báo @Bean trong SecurityConfig để Spring mới inject được vào AuthService.
