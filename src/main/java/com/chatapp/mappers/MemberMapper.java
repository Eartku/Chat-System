package com.chatapp.mappers;
import com.chatapp.models.*;
import com.chatapp.dto.conversation.*;
import java.util.List;

public class MemberMapper {
    
    public static MemberResponse toResponse(ConversationMember member) { // dùng 
        User user = member.getUser();
        return new MemberResponse(
            user.getUserId(),
            user.getUsername(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.isOnline(),
            member.getRole().name()  // enum → String
        );
    }

    public static List<MemberResponse> toResponseList(List<ConversationMember> members) {
        return members.stream()
            .map(MemberMapper::toResponse)
            .toList();
    }
}
