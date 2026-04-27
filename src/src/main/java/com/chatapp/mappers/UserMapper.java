package com.chatapp.mappers;
import com.chatapp.models.*;
import com.chatapp.dto.*;

public class UserMapper {
    public static UserResponse toResponse(User user){
        return new UserResponse(user.getId(), user.getUsername());
    }

    public static User requestToUser(UserCreateRequest request){
        User user = new User();
        user.setPassword(request.password());
        user.setUsername(request.username());

        return user;
    }

}
