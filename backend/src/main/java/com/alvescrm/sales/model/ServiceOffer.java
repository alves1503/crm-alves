package com.alvescrm.sales.model;

import java.math.BigDecimal;

public record ServiceOffer(long id, String name, String summary, String description,
    BigDecimal priceFrom, BigDecimal priceTo, String deliveryEstimate, boolean active) {
}