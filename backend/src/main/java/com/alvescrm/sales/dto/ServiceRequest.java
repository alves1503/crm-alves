package com.alvescrm.sales.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ServiceRequest(
    Long id,
    @NotBlank @Size(max = 140) String name,
    @NotBlank @Size(max = 300) String summary,
    @NotBlank @Size(max = 5000) String description,
    @DecimalMin(value = "0.0") BigDecimal priceFrom,
    @DecimalMin(value = "0.0") BigDecimal priceTo,
    @Size(max = 120) String deliveryEstimate,
    boolean active) {
}