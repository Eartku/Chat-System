package com.chatapp.dto;

public record UserCreateRequest(
    String username,
    String password) {
}
