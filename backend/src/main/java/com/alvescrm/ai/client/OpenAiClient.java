package com.alvescrm.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import com.alvescrm.shared.ApiException;

@Component
public class OpenAiClient {

  private final RestClient client;
  private final String chatModel;
  private final String embeddingModel;

  public OpenAiClient(
      RestClient.Builder builder,
      @Value("${app.ai.base-url}") String baseUrl,
      @Value("${app.ai.openai-api-key}") String apiKey,
      @Value("${app.ai.chat-model}") String chatModel,
      @Value("${app.ai.embedding-model}") String embeddingModel) {
    this.client = builder.baseUrl(baseUrl)
        .defaultHeader("Authorization", "Bearer " + apiKey)
        .build();
    this.chatModel = chatModel;
    this.embeddingModel = embeddingModel;
  }

  public JsonNode chat(List<Map<String, Object>> messages, List<Map<String, Object>> tools) {
    Map<String, Object> request = Map.of(
        "model", chatModel,
        "messages", messages,
        "tools", tools,
        "tool_choice", "auto");
    return post("/chat/completions", request);
  }

  public List<Double> embed(String input) {
    JsonNode response = post("/embeddings", Map.of("model", embeddingModel, "input", input));
    JsonNode vector = response.path("data").path(0).path("embedding");
    if (!vector.isArray())
      throw new ApiException(HttpStatus.BAD_GATEWAY, "A IA retornou um embedding inválido.");
    java.util.ArrayList<Double> result = new java.util.ArrayList<>();
    vector.forEach(value -> result.add(value.asDouble()));
    return result;
  }

  private JsonNode post(String path, Map<String, Object> body) {
    try {
      JsonNode result = client.post().uri(path).body(body).retrieve().body(JsonNode.class);
      if (result == null)
        throw new IllegalStateException("Resposta vazia do provedor de IA.");
      return result;
    } catch (Exception exception) {
      throw new ApiException(HttpStatus.BAD_GATEWAY, "Não foi possível consultar o provedor de IA.", exception);
    }
  }
}