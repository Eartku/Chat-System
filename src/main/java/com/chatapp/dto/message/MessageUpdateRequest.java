package com.chatapp.dto.message;

import jakarta.validation.constraints.NotBlank;

public record MessageUpdateRequest(
    @NotBlank(message = "Message content is required")
    String content
) {}