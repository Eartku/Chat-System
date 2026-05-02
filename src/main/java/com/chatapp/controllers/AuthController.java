package com.chatapp.controllers;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chatapp.dto.auth.LoginRequest;
import com.chatapp.dto.auth.LoginResponse;
import com.chatapp.dto.auth.RegisterRequest;
import com.chatapp.dto.user.UserResponse;
import com.chatapp.services.auth.AuthService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/register")
    public LoginResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // JWT stateless → client tự xóa token
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(){
        return authService.getCurrentUser();
    }
    // @PostMapping("/refresh-token")
    // public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
    //     
    //     return null;
    // }
}