# Chat-System

Backend Spring Boot cho du an chat.

## Yeu cau

- Java 21
- Maven Wrapper (`src/mvnw.cmd`)
- MySQL neu chay profile `dev`

## Chay test

Test dung profile `test` voi H2 in-memory nen khong can MySQL:

```powershell
cd src
.\mvnw.cmd test
```

## Chay ung dung local

Mac dinh app dung profile `dev` va doc cau hinh MySQL tu bien moi truong hoac fallback local:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

Vi du:

```powershell
cd src
$env:DB_URL="jdbc:mysql://localhost:3306/chat_system?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="root"
.\mvnw.cmd spring-boot:run
```

Neu chua co MySQL, ban van co the tiep tuc phat trien phan co ban va chay test truoc.
