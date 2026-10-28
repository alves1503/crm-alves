package com.alvescrm.conversation.model;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

public record Conversation(
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Long id,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String phone,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String contactName,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ConversationStatus status,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ConversationAiMode aiMode,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) Long assignedUserId,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) String lastMessage,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Instant lastMessageAt,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Instant createdAt) {
}
