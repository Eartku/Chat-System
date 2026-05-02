package com.chatapp.dto.message;

import jakarta.validation.constraints.NotBlank;

public record MessageCreateRequest(

    @NotBlank(message = "Message content is required")
    String content
) {}
