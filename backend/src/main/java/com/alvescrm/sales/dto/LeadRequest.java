package com.alvescrm.sales.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LeadRequest(
    Long conversationId,
    @NotBlank @Size(max = 30) String phone,
    @Size(max = 160) String fullName,
    @Email @Size(max = 180) String email,
    @Size(max = 180) String company,
    @Size(max = 500) String interest,
    @Size(max = 5000) String notes) {
}