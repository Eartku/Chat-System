package com.chatapp.dto.auth;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username từ 3-50 ký tự")
    String username,

    @NotBlank(message = "Password không được để trống")
    @Size(min = 6, message = "Password tối thiểu 6 ký tự")
    String password,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email
) {}