package com.chatapp.services.conversation;

import java.util.List;

import com.chatapp.dto.conversation.*;

public interface ConversationService {
    List<ConversationSummaryResponse> getAllConversation();

    ConversationResponse getConversationById(Long id);

    ConversationResponse createConversation(ConversationCreateRequest request);

    ConversationResponse updateConversationById(Long id, ConversationUpdateRequest request);

    void deleteConversationById(Long id);
}
