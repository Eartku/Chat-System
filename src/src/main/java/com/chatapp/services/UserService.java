package com.chatapp.services;

import java.util.List;

import com.chatapp.dto.UserCreateRequest;
import com.chatapp.dto.UserResponse;
import com.chatapp.dto.UserUpdateRequest;

public interface UserService {
    List<UserResponse> getAllUsers();

    UserResponse createUser(UserCreateRequest request);

    UserResponse getUserById(Long id);

    UserResponse updateUserById(Long id, UserUpdateRequest request);
    
    void deleteUserById(Long id);
}