package com.chatapp.mappers;

import java.util.List;

import com.chatapp.dto.conversation.ConversationCreateRequest;
import com.chatapp.dto.conversation.ConversationResponse;
import com.chatapp.dto.conversation.ConversationSummaryResponse;
import com.chatapp.models.Conversation;
import com.chatapp.models.ConversationMember;

public class ConversationMapper {

    public static ConversationSummaryResponse toSummary(
            Conversation conversation,
            List<ConversationMember> members) {
        return new ConversationSummaryResponse(
            conversation.getConvId(),
            conversation.getName(),
            conversation.getImage(),
            conversation.getType().name(),
            conversation.getLastMessage(),
            conversation.getUpdatedAt(),
            MemberMapper.toResponseList(members)
        );
    }

    public static ConversationResponse toResponse(
            Conversation conversation,
            List<ConversationMember> members) {
        return new ConversationResponse(
            conversation.getConvId(),
            conversation.getName(),
            conversation.getImage(),
            conversation.getType().name(),
            conversation.getCreatedAt(),
            conversation.getUpdatedAt(),
            conversation.getLastMessage(),
            MemberMapper.toResponseList(members)
        );
    }

    public static Conversation requestToEntity(ConversationCreateRequest request) {
        Conversation conversation = new Conversation();
        conversation.setName(request.name());
        conversation.setImage(request.imgUrl());
        conversation.setType(request.type());
        return conversation;
    }
}
