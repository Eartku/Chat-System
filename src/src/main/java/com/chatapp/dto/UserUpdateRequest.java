package com.chatapp.dto;

public record UserUpdateRequest(
    String username,
    String password) {
}
