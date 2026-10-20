package com.alvescrm.conversation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MessageRequest(
        @NotBlank(message = "Digite uma mensagem.")
        @Size(max = 4000, message = "A mensagem deve ter no máximo 4000 caracteres.")
        String body
) {
}
