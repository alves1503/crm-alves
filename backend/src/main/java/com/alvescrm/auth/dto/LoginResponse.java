package com.alvescrm.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record LoginResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String token,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) long expiresInSeconds,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) UserResponse user
) {
}
