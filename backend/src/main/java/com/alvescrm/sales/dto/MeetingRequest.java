package com.alvescrm.sales.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record MeetingRequest(
    @NotNull Long leadId,
    Long conversationId,
    @NotNull @Future Instant startsAt,
    @Min(15) @Max(240) int durationMinutes,
    @Size(max = 500) String notes) {
}