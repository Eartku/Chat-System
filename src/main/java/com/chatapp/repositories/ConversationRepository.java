package com.chatapp.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.chatapp.models.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query("SELECT c FROM Conversation c JOIN ConversationMember cm ON cm.conversation = c WHERE cm.user.userId = :userId")
    List<Conversation> findByUserId(@Param("userId") Long userId);
}