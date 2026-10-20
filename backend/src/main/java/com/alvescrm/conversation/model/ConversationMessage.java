package com.alvescrm.conversation.model;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

public record ConversationMessage(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Long id,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Long conversationId,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = {"INBOUND", "OUTBOUND"}) String direction,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String body,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Instant createdAt
) {
}
