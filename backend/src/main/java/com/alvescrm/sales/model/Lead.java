package com.alvescrm.sales.model;

import java.time.Instant;

public record Lead(long id, Long conversationId, String phone, String fullName, String email,
    String company, String interest, String notes, String stage, Instant createdAt, Instant updatedAt) {
}