package com.alvescrm.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TrainingRequest(
    Long id,
    @NotBlank @Size(max = 180) String title,
    @NotBlank @Size(max = 50000) String content) {
}