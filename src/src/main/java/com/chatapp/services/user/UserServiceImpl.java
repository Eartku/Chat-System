package com.chatapp.services.user;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.chatapp.dto.user.UserUpdateRequest;
import com.chatapp.dto.user.UserCreateRequest;
import com.chatapp.dto.user.UserResponse;
import com.chatapp.exceptions.BadRequestException;
import com.chatapp.exceptions.DuplicateResourceException;
import com.chatapp.exceptions.ResourceNotFoundException;
import com.chatapp.mappers.UserMapper;
import com.chatapp.models.User;
import com.chatapp.repositories.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<UserResponse> getAllUsers() {
        List<User> list = userRepository.findAll();
        List<UserResponse> responses = new ArrayList<>();
        for(User u: list){
            responses.add(UserMapper.toResponse(u));
        }
        return responses;
    }

    @Override
    public UserResponse createUser(UserCreateRequest request) {
        User user = UserMapper.requestToUser(request);

        String username = user.getUsername();

        if (username == null || username.isBlank()) { // kiểm tra usernamw trống
            throw new BadRequestException("Username is required");
        }

        if (userRepository.existsByUsername(username)) { // Kiểm tra username tồn tại
            throw new DuplicateResourceException("Username already exists: " + username);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        User saved  = userRepository.save(user);
        return UserMapper.toResponse(saved);
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return UserMapper.toResponse(user);
    }

    @Override
    public UserResponse updateUserById(Long id, UserUpdateRequest request) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        String username = request.username();

        if (username == null || username.isBlank()) {
            throw new BadRequestException("Username is required");
        }

        if (!existing.getUsername().equals(username) && userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username already exists: " + username);
        }

        if (request.password() != null && !request.password().isBlank()) {
            existing.setPassword(passwordEncoder.encode(request.password()));
        }

        User saved = userRepository.save(existing);

        return UserMapper.toResponse(saved);
    }

    @Override
    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }
}
