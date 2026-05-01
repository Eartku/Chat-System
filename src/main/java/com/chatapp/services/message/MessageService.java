package com.chatapp.services.message;

import com.chatapp.dto.message.MessageCreateRequest;
import com.chatapp.dto.message.MessageResponse;
import com.chatapp.dto.message.MessageUpdateRequest;

import java.util.List;

public interface MessageService {
    List<MessageResponse> getMessageByConversationId(Long id);

    MessageResponse sendMessage(Long conversationId, MessageCreateRequest request);

    MessageResponse updateMessageById(Long messageId, MessageUpdateRequest request);

    void deleteMessageById(Long messageId);

    MessageResponse markMessageAsRead(Long messageId);
}
