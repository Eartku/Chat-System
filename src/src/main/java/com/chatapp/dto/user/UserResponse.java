package com.chatapp.dto.user;

import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String username,
    String email,
    String displayName,
    String avatarUrl,
    boolean online,
    LocalDateTime lastSeenAt,
    LocalDateTime createdAt,
    String role,
    boolean active
) {}