package com.chatapp.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.chatapp.dto.message.MessageCreateRequest;
import com.chatapp.dto.message.MessageResponse;
import com.chatapp.dto.message.MessageUpdateRequest;
import com.chatapp.services.message.MessageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public List<MessageResponse> getMessagesByConversationId(@PathVariable Long conversationId) {
        return messageService.getMessageByConversationId(conversationId);
    }

    @PostMapping("/conversations/{conversationId}/messages")
    @ResponseStatus(HttpStatus.CREATED) 
    public MessageResponse sendMessage(@PathVariable Long conversationId, @Valid @RequestBody MessageCreateRequest request) {
        return messageService.sendMessage(conversationId, request);
    }

    @PatchMapping("/messages/{messageId}")
    public MessageResponse updateMessageById(@PathVariable Long messageId, @Valid @RequestBody MessageUpdateRequest request) {
        return messageService.updateMessageById(messageId, request);
    }

    @DeleteMapping("/messages/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMessageById(@PathVariable Long messageId) {
        messageService.deleteMessageById(messageId);
    }

    @PatchMapping("/messages/{messageId}/read")
    public MessageResponse markMessageAsRead(@PathVariable Long messageId) {
        return messageService.markMessageAsRead(messageId);
    }
}
