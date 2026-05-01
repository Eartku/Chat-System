package com.chatapp.dto.auth;
import com.chatapp.models.UserRole;

public record LoginResponse(
    String username,
    String email,
    String token,
    UserRole role        // client biết để hiển thị UI theo quyền
) {}
