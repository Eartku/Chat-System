package com.chatapp.mappers;
import com.chatapp.dto.conversation.*;
import com.chatapp.models.*;
import java.util.List;

public class ConversationMapper {

    public static ConversationSummaryResponse toSummary(Conversation c) { // trả về thông tin tổng quan (dùng cho GET/api/conversation - findAll)
            return new ConversationSummaryResponse(
                c.getConvId(),
                c.getName(),
                c.getImage(),
                c.getType().name(),
                c.getLastMessage(),
                c.getUpdatedAt()
            );
        }

    public static ConversationResponse toResponse(Conversation c, List<ConversationMember> members /* list lấy từ service*/ ) { //trả vè thông tin đây đủ hơn (dùng cho GET /api/conversation/{id})
        return new ConversationResponse(
            c.getConvId(),
            c.getName(),
            c.getImage(),
            c.getType().name(),
            c.getCreatedAt(),
            c.getUpdatedAt(),
            c.getLastMessage(), 
            MemberMapper.toResponseList(members));
    }

    public static Conversation requestToEntity(ConversationCreateRequest request) { // trả về thực thể (POST /api/conversation)
        Conversation conv = new Conversation();
        conv.setName(request.name());
        conv.setImage(request.imgUrl());
        conv.setType(request.type());
        return conv;
    }
}
