package com.chatapp.services.conversation;

import org.springframework.stereotype.Service;

import com.chatapp.repositories.ConversationRepository;

@Service
public class ConversationServiceImpl implements ConversationService {
    @SuppressWarnings("unused")
    private final ConversationRepository conversationRepository;

    public ConversationServiceImpl(ConversationRepository conversationRepository){
        this.conversationRepository = conversationRepository;
    }



}
