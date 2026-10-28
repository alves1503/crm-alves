package com.alvescrm.sales.model;

import java.time.Instant;

public record SalesMeeting(long id, long leadId, Long conversationId, String leadName, String phone,
    Instant startsAt, int durationMinutes, String status, String notes) {
}