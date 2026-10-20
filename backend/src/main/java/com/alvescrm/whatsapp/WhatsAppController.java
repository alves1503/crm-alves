package com.alvescrm.whatsapp;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/whatsapp")
@Tag(name = "WhatsApp")
public class WhatsAppController {

    private final EvolutionClient evolutionClient;

    public WhatsAppController(EvolutionClient evolutionClient) {
        this.evolutionClient = evolutionClient;
    }

    @GetMapping("/status")
    @Operation(summary = "Consultar conexão WhatsApp", security = @SecurityRequirement(name = "bearerAuth"))
    public WhatsAppStatus status() {
        return evolutionClient.getStatus();
    }

    @GetMapping("/qr")
    @Operation(summary = "Consultar QR Code do WhatsApp", security = @SecurityRequirement(name = "bearerAuth"))
    public WhatsAppQrCode qrCode() {
        return evolutionClient.getQrCode();
    }
}
