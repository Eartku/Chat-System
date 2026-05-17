package com.chatapp.dto.auth;
import com.chatapp.models.UserRole;

public record LoginResponse(
    Long id,
    String username,
    String displayName,
    String email,
    String avatarUrl,
    String token,
    UserRole role
) {}