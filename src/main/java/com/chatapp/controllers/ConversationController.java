package com.chatapp.controllers;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.chatapp.dto.conversation.ConversationCreateRequest;
import com.chatapp.dto.conversation.ConversationResponse;
import com.chatapp.dto.conversation.ConversationSummaryResponse;
import com.chatapp.dto.conversation.ConversationUpdateRequest;
import com.chatapp.services.conversation.ConversationService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService){
        this.conversationService = conversationService;
    }

    @GetMapping
    public List<ConversationSummaryResponse> getAllConversations() {
        return conversationService.getAllConversation();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ConversationResponse createConversation(@Valid @RequestBody ConversationCreateRequest request) {
        return conversationService.createConversation(request);
    }

    @GetMapping("/{id}")
    public ConversationResponse getConversationById(@PathVariable Long id) {
        return conversationService.getConversationById(id);
    }

    @PutMapping("/{id}")
    public ConversationResponse updateConversationById(@PathVariable Long id, @Valid @RequestBody ConversationUpdateRequest request) {
        return conversationService.updateConversationById(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteConversationById(@PathVariable Long id) {
        conversationService.deleteConversationById(id);
    }
}
