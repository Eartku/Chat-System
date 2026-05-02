# Chat-System

Backend Spring Boot cho dự án chat.

## Yêu cầu

- Java 21
- Maven Wrapper (`mvnw` / `mvnw.cmd`)
- MySQL nếu chạy profile `dev`

## Chạy test

Ứng dụng sử dụng profile `test` với H2 in-memory nên không cần MySQL để chạy test:

```powershell
cd d:\Chat-System
.\mvnw.cmd test
```

## Chạy ứng dụng local

Mặc định ứng dụng sử dụng profile `dev` và đọc cấu hình kết nối MySQL từ biến môi trường:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

Ví dụ:

```powershell
cd d:\Chat-System
$env:DB_URL="jdbc:mysql://localhost:3306/chat_system?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="root"
.\mvnw.cmd spring-boot:run
```

