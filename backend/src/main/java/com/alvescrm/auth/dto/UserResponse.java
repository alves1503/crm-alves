package com.alvescrm.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record UserResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Long id,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String email,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String displayName
) {
}
