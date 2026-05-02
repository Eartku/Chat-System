package com.chatapp.mappers;

import java.time.LocalDateTime;
import java.util.List;

import com.chatapp.dto.message.MessageCreateRequest;
import com.chatapp.dto.message.MessageResponse;
import com.chatapp.models.Message;

public class MessageMapper {

    public static MessageResponse toResponse(Message message) {
        return new MessageResponse(
            message.getId(),
            message.getConversationId(),
            message.getSenderId(),
            message.getContent(),
            message.getCreatedAt(),
            message.getReadAt(),
            message.isDeleted(),
            message.isEdited()
        );
    }

    public static List<MessageResponse> toResponseList(List<Message> messages) {
        return messages.stream()
            .map(MessageMapper::toResponse)
            .toList();
    }

    public static Message requestToEntity(Long conversationId, Long senderId, MessageCreateRequest request) {
        Message message = new Message();
        message.setConversationId(conversationId);
        message.setSenderId(senderId);
        message.setContent(request.content());
        message.setCreatedAt(LocalDateTime.now());
        return message;
    }
}