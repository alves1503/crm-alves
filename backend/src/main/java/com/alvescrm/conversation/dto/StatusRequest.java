package com.alvescrm.conversation.dto;

import com.alvescrm.conversation.model.ConversationStatus;
import jakarta.validation.constraints.NotNull;

public record StatusRequest(@NotNull ConversationStatus status) {
}
