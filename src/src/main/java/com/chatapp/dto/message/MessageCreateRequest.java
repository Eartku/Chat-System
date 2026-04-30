package com.chatapp.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MessageCreateRequest(
    @NotNull(message = "Sender id is required")
    Long senderId,

    @NotBlank(message = "Message content is required")
    String content
) {}
