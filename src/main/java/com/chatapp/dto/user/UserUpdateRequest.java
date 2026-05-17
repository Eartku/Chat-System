package com.chatapp.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
    String username,
    @Size(min = 6, message = "Password must be at least 6 characters")
    String password,
    @Email(message = "Invalid email format")
    String email,
    String displayName,   // bỏ @NotBlank
    @Size(max = 100000, message = "Avatar URL quá dài")
    String avatarUrl
) {}