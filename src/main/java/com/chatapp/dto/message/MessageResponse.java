package com.chatapp.dto.message;

import java.time.LocalDateTime;

public record MessageResponse(
    Long id,
    Long conversationId,
    Long senderId,
    String content,
    LocalDateTime createdAt,
    LocalDateTime readAt,
    boolean deleted,
    boolean edited
) {}
