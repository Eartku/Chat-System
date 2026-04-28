package com.chatapp.services.user;

import java.util.List;

import com.chatapp.dto.user.UserUpdateRequest;
import com.chatapp.dto.user.UserCreateRequest;
import com.chatapp.dto.user.UserResponse;

public interface UserService {
    List<UserResponse> getAllUsers();

    UserResponse createUser(UserCreateRequest request);

    UserResponse getUserById(Long id);

    UserResponse updateUserById(Long id, UserUpdateRequest request);
    
    void deleteUserById(Long id);
}