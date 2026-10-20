package com.alvescrm.whatsapp;

import io.swagger.v3.oas.annotations.media.Schema;

public record WhatsAppQrCode(@Schema(requiredMode = Schema.RequiredMode.REQUIRED) String base64) {
}
