package com.chatapp.controllers;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.chatapp.dto.message.MessageCreateRequest;
import com.chatapp.dto.message.MessageResponse;
import com.chatapp.services.message.MessageService;

@Controller
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(MessageService messageService, SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/conversations/{conversationId}/send")
    public void sendMessage(@DestinationVariable Long conversationId,
                            @Payload MessageCreateRequest request) {

        MessageResponse saved = messageService.sendMessage(conversationId, request);

        // Broadcast tới tất cả client đang subscribe conversation này
        messagingTemplate.convertAndSend(
            "/topic/conversations/" + conversationId,
            saved
        );
    }
}