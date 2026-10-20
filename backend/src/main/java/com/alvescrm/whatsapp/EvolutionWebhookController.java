package com.alvescrm.whatsapp;

import io.swagger.v3.oas.annotations.Hidden;
import com.fasterxml.jackson.databind.JsonNode;
import com.alvescrm.conversation.service.ConversationService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/webhooks/evolution")
@Hidden
public class EvolutionWebhookController {

    private static final Pattern PHONE_CHARACTERS = Pattern.compile("[^0-9+]");
    private final ConversationService conversationService;
    private final byte[] webhookSecret;

    public EvolutionWebhookController(
            ConversationService conversationService,
            @Value("${app.whatsapp.webhook-secret}") String webhookSecret) {
        this.conversationService = conversationService;
        this.webhookSecret = webhookSecret.getBytes(StandardCharsets.UTF_8);
    }

    @PostMapping
    public void receive(@RequestParam String secret, @RequestBody JsonNode payload) {
        if (!MessageDigest.isEqual(webhookSecret, secret.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Webhook não autorizado.");
        }

        String event = payload.path("event").asText();
        if (!"messages.upsert".equalsIgnoreCase(event) && !"MESSAGES_UPSERT".equalsIgnoreCase(event)) {
            return;
        }
        JsonNode data = payload.path("data");
        JsonNode key = data.path("key");
        if (key.path("fromMe").asBoolean() || !key.hasNonNull("remoteJid")) {
            return;
        }

        String remoteJid = key.path("remoteJid").asText();
        if (remoteJid.endsWith("@g.us") || remoteJid.equals("status@broadcast")) {
            return;
        }
        if (remoteJid.endsWith("@lid") && key.hasNonNull("remoteJidAlt")) {
            remoteJid = key.path("remoteJidAlt").asText();
        }
        String phone = PHONE_CHARACTERS.matcher(remoteJid.substring(0, remoteJid.indexOf('@') >= 0
                ? remoteJid.indexOf('@')
                : remoteJid.length())).replaceAll("");
        if (phone.isBlank()) {
            return;
        }

        String body = messageBody(data.path("message"));
        if (body.isBlank()) {
            return;
        }
        String contactName = data.path("pushName").asText(phone);
        String messageId = key.path("id").asText(null);
        conversationService.receiveMessage(phone, contactName, messageId, body);
    }

    private String messageBody(JsonNode message) {
        String[] candidates = {
            message.path("conversation").asText(),
            message.path("extendedTextMessage").path("text").asText(),
            message.path("imageMessage").path("caption").asText(),
            message.path("videoMessage").path("caption").asText(),
            message.path("documentMessage").path("caption").asText()
        };
        for (String candidate : candidates) {
            if (!candidate.isBlank()) return candidate.trim();
        }
        if (message.has("imageMessage")) return "[Imagem recebida]";
        if (message.has("audioMessage")) return "[Áudio recebido]";
        if (message.has("videoMessage")) return "[Vídeo recebido]";
        if (message.has("documentMessage")) return "[Documento recebido]";
        if (message.has("stickerMessage")) return "[Figurinha recebida]";
        if (message.has("locationMessage")) return "[Localização recebida]";
        return "";
    }
}
