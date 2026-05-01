package com.chatapp.services.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestBody;

import com.chatapp.dto.auth.LoginRequest;
import com.chatapp.dto.auth.LoginResponse;
import com.chatapp.dto.auth.RegisterRequest;
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
    public LoginResponse register(@Valid @RequestBody RegisterRequest request){ //Cơ bản
        String username = request.username(); 
        String password = request.password();
        String email = request.email();

        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
            throw new RuntimeException("Username hoặc email đã tồn tại");
        }

        User user = new User(username, passwordEncoder.encode(password), email);

        userRepository.save(user);

        String token = jwtService.generateToken(username);

        return new LoginResponse(username, email, token, user.getRole());
    }

    @Transactional
    public LoginResponse login(@Valid @RequestBody LoginRequest request){
        String username = request.username();
        String password = request.password();
        authManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));

        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(username);
        return new LoginResponse(user.getUsername(), user.getEmail(), token, user.getRole());
    }
}
