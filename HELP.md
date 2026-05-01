# Getting Started

### Reference Documentation
For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/4.0.6/maven-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/4.0.6/maven-plugin/build-image.html)
* [Spring Data JPA](https://docs.spring.io/spring-boot/4.0.6/reference/data/sql.html#data.sql.jpa-and-spring-data)
* [Spring Web](https://docs.spring.io/spring-boot/4.0.6/reference/web/servlet.html)
* [WebSocket](https://docs.spring.io/spring-boot/4.0.6/reference/messaging/websockets.html)

### Guides
The following guides illustrate how to use some features concretely:

* [Accessing Data with JPA](https://spring.io/guides/gs/accessing-data-jpa/)
* [Accessing data with MySQL](https://spring.io/guides/gs/accessing-data-mysql/)
* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)
* [Using WebSocket to build an interactive web application](https://spring.io/guides/gs/messaging-stomp-websocket/)

### Maven Parent overrides

Due to Maven's design, elements are inherited from the parent POM to the project POM.
While most of the inheritance is fine, it also inherits unwanted elements like `<license>` and `<developers>` from the parent.
To prevent this, the project POM contains empty overrides for these elements.
If you manually switch to a different parent and actually want the inheritance, you need to remove those overrides.

## Tham khao
https://viblo.asia/p/entity-domain-model-va-dto-sao-nhieu-qua-vay-YWOZroMPlQ0
https://www.geeksforgeeks.org/java/data-transfer-object-dto-in-spring-mvc-with-example/


# Spring Boot + JPA + Validation Cheat Sheet

## 1. Entity (JPA Mapping)
- `@Entity` → map class ↔ table  
- `@Table(name = "...")` → đặt tên bảng  
- `@Id` → khóa chính  
- `@GeneratedValue(strategy = IDENTITY)` → auto increment  
- `@Column(...)` → config column:
  - `nullable = false`
  - `unique = true`
  - `name = "created_at"`
- `@Enumerated(EnumType.STRING)` → lưu enum dạng string  
- `@PrePersist` → set value trước khi insert (vd: createdAt)  
- `@Embeddable` → dùng cho composite key  

---

## 2. Validation (jakarta.validation)
- `@Valid` → kích hoạt validation (bắt buộc ở Controller)
- `@NotBlank` → không null + không rỗng  
- `@Size(min, max)` → giới hạn độ dài  
- `@Email` → validate email format  
- `message = "..."` → custom error message  

---

## 3. Controller (Spring Web)
- `@PostMapping` / `@GetMapping` / `@PutMapping` / `@DeleteMapping`  
- `@RequestBody` → nhận JSON từ client  
- `@Valid @RequestBody DTO` → validate input  

---

## 4. DTO + Mapper
- DTO:
  - Request → nhận dữ liệu + validation  
  - Response → trả dữ liệu (không chứa password)
- Mapper:
  - convert DTO ↔ Entity  
  - có thể normalize data (trim, lowercase email)  

---

## 5. Service Layer
- xử lý business logic:
  - encode password  
  - check email/username unique  
  - update selective field (tránh null overwrite)  

---

## 6. Response / JSON
- dùng DTO riêng (`UserResponse`)  
- tránh expose field nhạy cảm  
- `@JsonFormat` → format datetime  

---

## 7. Flow chuẩn
Client  
→ DTO (`@Valid`)  
→ Controller  
→ Service  
→ Mapper  
→ Entity  
→ Database  
→ Response DTO  

---

## 8. Lỗi phổ biến (đã gặp)
- thiếu `@Valid` → validation không chạy  
- sai thứ tự constructor → data sai  
- mismatch column (`created_at`) → SQL error  
- enum không khớp DB → crash  
- update overwrite null → mất dữ liệu  

---

## 9. Best Practices
- dùng constructor / builder → tránh nhầm param  
- không xử lý logic trong mapper  
- tách rõ:
  - DTO → input/output  
  - Service → logic  
- validate càng sớm càng tốt (Controller layer)  

---