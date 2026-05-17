package com.chatapp.services.auth;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestBody;

import com.chatapp.dto.auth.LoginRequest;
import com.chatapp.dto.auth.LoginResponse;
import com.chatapp.dto.auth.RegisterRequest;
import com.chatapp.dto.user.UserResponse;
import com.chatapp.exceptions.ResourceNotFoundException;
import com.chatapp.models.User;
import com.chatapp.repositories.UserRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@Service
@Validated
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authManager;

    @Transactional
    public LoginResponse register(@Valid @RequestBody RegisterRequest request) {
        String username = normalizeRequiredText(request.username());
        String password = normalizeRequiredText(request.password());
        String email = normalizeRequiredText(request.email());

        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
            throw new RuntimeException("Username or Email is existed");
        }

        User user = new User(username, passwordEncoder.encode(password), email);
        user.setDisplayName(normalizeOptionalText(request.displayName()));
        if (user.getDisplayName() == null) {
            user.setDisplayName(username);
        }
        user.setAvatarUrl(normalizeOptionalText(request.avatarUrl()));
        markUserOnline(user);
        userRepository.save(user);

        String token = jwtService.generateToken(username);

        return new LoginResponse(
            user.getUserId(),
            user.getUsername(),
            user.getDisplayName(),
            user.getEmail(),
            user.getAvatarUrl(),
            token,
            user.getRole()
        );
    }

    @Transactional
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        String username = normalizeRequiredText(request.username());
        String password = normalizeRequiredText(request.password());
        authManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        markUserOnline(user);
        userRepository.save(user);

        String token = jwtService.generateToken(username);
        return new LoginResponse(
            user.getUserId(),
            user.getUsername(),
            user.getDisplayName(),
            user.getEmail(),
            user.getAvatarUrl(),
            token,
            user.getRole()
        );
    }

    @Transactional
    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return;
        }

        String username = authentication.getName();
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) {
            return;
        }

        userRepository.findByUsername(username).ifPresent(user -> {
            user.setOnline(false);
            user.setLastSeenAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    @Transactional
    public UserResponse getCurrentUser() {
        User user = getCurrentUserEntity();
        if (!user.isOnline()) {
            markUserOnline(user);
            userRepository.save(user);
        }

        return new UserResponse(
            user.getUserId(),
            user.getUsername(),
            user.getEmail(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.isOnline(),
            user.getLastSeenAt(),
            user.getCreatedAt(),
            user.getRole().name(),
            user.isActive()
        );
    }

    @Transactional
    public User getCurrentUserEntity() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));
    }

    private void markUserOnline(User user) {
        user.setOnline(true);
        user.setLastSeenAt(null);
    }

    private String normalizeRequiredText(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
