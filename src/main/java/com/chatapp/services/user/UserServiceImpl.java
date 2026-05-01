package com.chatapp.services.user;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chatapp.dto.user.UserCreateRequest;
import com.chatapp.dto.user.UserResponse;
import com.chatapp.dto.user.UserUpdateRequest;
import com.chatapp.exceptions.BadRequestException;
import com.chatapp.exceptions.DuplicateResourceException;
import com.chatapp.exceptions.ResourceNotFoundException;
import com.chatapp.mappers.UserMapper;
import com.chatapp.models.User;
import com.chatapp.repositories.UserRepository;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    @Transactional
    @Override
    public UserResponse createUser(UserCreateRequest request) {
        validateCreateRequest(request);

        String username = normalizeRequiredText(request.username(), "Username");
        String email = normalizeRequiredText(request.email(), "Email");
        String password = normalizeRequiredText(request.password(), "Password");

        ensureUsernameAvailable(username);
        ensureEmailAvailable(email);

        User user = UserMapper.requestToUser(request);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        User saved = userRepository.save(user);
        return UserMapper.toResponse(saved);
    }

    @Override
    public UserResponse getUserById(Long id) {
        return UserMapper.toResponse(findUserOrThrow(id));
    }

    @Transactional
    @Override
    public UserResponse updateUserById(Long id, UserUpdateRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }

        User user = findUserOrThrow(id);

        updateUsername(user, request.username());
        updateEmail(user, request.email());
        updatePassword(user, request.password());

        User saved = userRepository.save(user);
        return UserMapper.toResponse(saved);
    }

    @Transactional
    @Override
    public void deleteUserById(Long id) {
        User user = findUserOrThrow(id);
        userRepository.delete(user);
    }

    private User findUserOrThrow(Long id) {
        if (id == null) {
            throw new BadRequestException("User id is required");
        }

        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    private void validateCreateRequest(UserCreateRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }

        normalizeRequiredText(request.username(), "Username");
        normalizeRequiredText(request.email(), "Email");
        normalizeRequiredText(request.password(), "Password");
    }

    private void updateUsername(User user, String username) {
        if (username == null) {
            return;
        }

        String normalizedUsername = normalizeRequiredText(username, "Username");
        if (!user.getUsername().equals(normalizedUsername)) {
            ensureUsernameAvailable(normalizedUsername);
            user.setUsername(normalizedUsername);
        }
    }

    private void updateEmail(User user, String email) {
        if (email == null) {
            return;
        }

        String normalizedEmail = normalizeRequiredText(email, "Email");
        if (!user.getEmail().equals(normalizedEmail)) {
            ensureEmailAvailable(normalizedEmail);
            user.setEmail(normalizedEmail);
        }
    }

    private void updatePassword(User user, String password) {
        if (password == null) {
            return;
        }

        String normalizedPassword = normalizeRequiredText(password, "Password");
        user.setPassword(passwordEncoder.encode(normalizedPassword));
    }

    private void ensureUsernameAvailable(String username) {
        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username already exists: " + username);
        }
    }

    private void ensureEmailAvailable(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already exists: " + email);
        }
    }

    private String normalizeRequiredText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required");
        }
        return value.trim();
    }
}
