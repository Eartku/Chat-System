package com.chatapp.dto.conversation;
import java.util.List;

import java.time.LocalDateTime;
public record ConversationResponse(
    Long id,
    String name,
    String image,
    String type,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    String lastMessage,
    List<MemberResponse> members 
) {}
