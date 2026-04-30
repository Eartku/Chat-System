package com.chatapp.repositories;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chatapp.models.ConversationMember;
import com.chatapp.models.ConversationMemberId;

@Repository
public interface ConversationMemberRepository extends JpaRepository<ConversationMember, ConversationMemberId> {

    List<ConversationMember> findByConversation_ConvId(Long convId);

    List<ConversationMember> findByUser_UserIdIn(Collection<Long> userIds);
}
