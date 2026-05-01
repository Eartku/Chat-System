package com.chatapp.dto.conversation;
import java.util.List;

import com.chatapp.models.ConversationType;

public record ConversationCreateRequest(
    ConversationType type,
    String name,
    String imgUrl,
    List<Long> memberIds
) {}
