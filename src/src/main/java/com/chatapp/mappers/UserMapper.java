package com.chatapp.mappers;
import com.chatapp.dto.user.UserCreateRequest;
import com.chatapp.dto.user.UserResponse;
import com.chatapp.models.User;

public class UserMapper {
    public static UserResponse toResponse(User user){
        return new UserResponse(user.getUserId(), 
        user.getUsername() ,
        user.getEmail(), 
        user.getDisplayName(), 
        user.getAvatarUrl(), 
        user.isOnline(), 
        user.getLastSeenAt(),
        user.getCreatedAt(),
        user.getRole().name(),
        user.isActive()
    );}

    public static User requestToUser(UserCreateRequest request){
        User user = new User(
            request.username(),
            request.password(),
            request.email()
        );
        return user;
    }

}
