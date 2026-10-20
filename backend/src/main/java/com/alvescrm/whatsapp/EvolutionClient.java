package com.alvescrm.whatsapp;

import com.fasterxml.jackson.databind.JsonNode;
import com.alvescrm.shared.ApiException;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class EvolutionClient {

    private static final Logger logger = LoggerFactory.getLogger(EvolutionClient.class);

    private final RestClient restClient;
    private final String instance;

    public EvolutionClient(
            RestClient.Builder builder,
            @Value("${app.whatsapp.evolution-url}") String baseUrl,
            @Value("${app.whatsapp.evolution-api-key}") String apiKey,
            @Value("${app.whatsapp.instance}") String instance) {
        this.restClient = builder
                .baseUrl(baseUrl)
                .defaultHeader("apikey", apiKey)
                .build();
        this.instance = instance;
    }

    public void sendText(String phone, String text) {
        try {
            restClient.post()
                    .uri("/message/sendText/{instance}", instance)
                    .body(Map.of("number", phone, "text", text, "delay", 500))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException exception) {
            throw gatewayException("enviar mensagem", exception,
                    "Não foi possível enviar a mensagem pelo WhatsApp. Verifique a conexão com o Evolution.");
        }
    }

    public WhatsAppStatus getStatus() {
        try {
            JsonNode response = restClient.get()
                    .uri("/instance/connectionState/{instance}", instance)
                    .retrieve()
                    .body(JsonNode.class);
            String state = response == null
                    ? "unavailable"
                    : response.path("instance").path("state").asText("unavailable");
            return new WhatsAppStatus(instance, "open".equalsIgnoreCase(state), state);
        } catch (RestClientException exception) {
            throw gatewayException(
                    "consultar o estado da conexão",
                    exception,
                    "Não foi possível consultar o estado da conexão WhatsApp.");
        }
    }

    public WhatsAppQrCode getQrCode() {
        try {
            JsonNode response = restClient.get()
                    .uri("/instance/connect/{instance}", instance)
                    .retrieve()
                    .body(JsonNode.class);
            String base64 = response == null ? "" : response.path("base64").asText();
            if (base64.isBlank() && response != null) {
                base64 = response.path("qrcode").path("base64").asText();
            }
            if (base64.isBlank()) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "A Evolution ainda não disponibilizou o QR Code. Tente novamente em alguns segundos.");
            }
            return new WhatsAppQrCode(base64);
        } catch (RestClientException exception) {
            throw gatewayException(
                    "obter o QR Code",
                    exception,
                    "Não foi possível obter o QR Code da Evolution.");
        }
    }

    public void ensureInstance() {
        try {
            JsonNode instances = restClient.get()
                    .uri("/instance/fetchInstances")
                    .retrieve()
                    .body(JsonNode.class);
            boolean exists = false;
            if (instances != null && instances.isArray()) {
                for (JsonNode item : instances) {
                    if (instance.equals(item.path("name").asText())) {
                        exists = true;
                        break;
                    }
                }
            }
            if (!exists) {
                try {
                    restClient.post()
                            .uri("/instance/create")
                            .body(Map.of(
                                    "instanceName", instance,
                                    "integration", "WHATSAPP-BAILEYS",
                                    "qrcode", true))
                            .retrieve()
                            .toBodilessEntity();
                } catch (HttpClientErrorException exception) {
                    String responseBody = exception.getResponseBodyAsString().toLowerCase(Locale.ROOT);
                    if (exception.getStatusCode() != HttpStatus.FORBIDDEN
                            || !responseBody.contains("already in use")
                            || !responseBody.contains(instance.toLowerCase(Locale.ROOT))) {
                        throw exception;
                    }
                }
            }
        } catch (RestClientException exception) {
            logger.error("Falha ao preparar a instância WhatsApp no Evolution.", exception);
            throw new IllegalStateException(
                    "Não foi possível preparar a instância WhatsApp no Evolution.",
                    exception);
        }
    }

    private ApiException gatewayException(String operation, RestClientException cause, String message) {
        logger.warn("Falha ao {} usando a API Evolution.", operation, cause);
        return new ApiException(HttpStatus.BAD_GATEWAY, message, cause);
    }
}
