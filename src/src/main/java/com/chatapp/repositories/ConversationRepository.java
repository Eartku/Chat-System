package com.chatapp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chatapp.models.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
}