package com.alvescrm.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InstructionsRequest(@NotBlank @Size(max = 10000) String instructions) {
}