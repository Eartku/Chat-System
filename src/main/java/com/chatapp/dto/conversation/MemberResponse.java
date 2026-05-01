package com.chatapp.dto.conversation;

public record MemberResponse(
    Long userId,
    String username,
    String displayName,
    String avatarUrl,
    boolean online,
    String conversationRole   // "OWNER", "ADMIN", "MEMBER"
) {}