package com.chatapp.controllers;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.chatapp.services.conversation.ConversationService;
import jakarta.validation.Valid;
import com.chatapp.dto.conversation.*;


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
    public void deleteConversationById(@PathVariable Long id) {
        conversationService.deleteConversationById(id);
    }
}
