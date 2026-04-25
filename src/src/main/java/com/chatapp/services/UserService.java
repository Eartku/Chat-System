package com.chatapp.services;

import com.chatapp.models.User;
import java.util.List;

public interface UserService {
    List<User> getAllUsers();

    User saveUser(User user);
}