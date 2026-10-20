package com.alvescrm.whatsapp;

import io.swagger.v3.oas.annotations.media.Schema;

public record WhatsAppStatus(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String instance,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean connected,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String state
) {
}
