package com.chatapp.services.user;

import java.util.List;

import com.chatapp.dto.user.UserCreateRequest;
import com.chatapp.dto.user.UserResponse;
import com.chatapp.dto.user.UserUpdateRequest;

public interface UserService {
    List<UserResponse> getAllUsers();

    UserResponse createUser(UserCreateRequest request);

    UserResponse getUserById(Long id);

    UserResponse updateUserById(Long id, UserUpdateRequest request);
    
    void deleteUserById(Long id);

    List<UserResponse> searchUser(String query);
}