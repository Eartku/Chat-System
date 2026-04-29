package com.chatapp.dto.conversation;

import java.util.List;

public record ConversationUpdateRequest(
    String name,
    String imgUrl,
    List<Long> addMemberIds,
    List<Long> removeMemberIds
) {}

