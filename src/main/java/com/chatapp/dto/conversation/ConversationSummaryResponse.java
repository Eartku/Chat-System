package com.chatapp.dto.conversation;
import java.time.LocalDateTime;

public record ConversationSummaryResponse(
    Long id,
    String name,
    String image,
    String type,
    String lastMessage,
    LocalDateTime updatedAt
) {}
