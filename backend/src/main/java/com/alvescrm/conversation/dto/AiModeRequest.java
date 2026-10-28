package com.alvescrm.conversation.dto;

import com.alvescrm.conversation.model.ConversationAiMode;
import jakarta.validation.constraints.NotNull;

public record AiModeRequest(@NotNull ConversationAiMode mode) {
}