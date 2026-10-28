package com.alvescrm.ai.tools;

import com.alvescrm.conversation.model.ConversationAiMode;
import com.alvescrm.conversation.service.ConversationService;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class HumanHandoffTool implements AiTool {
  private final ConversationService conversationService;

  public HumanHandoffTool(ConversationService conversationService) {
    this.conversationService = conversationService;
  }

  @Override
  public String name() {
    return "handoff_to_human";
  }

  @Override
  public Map<String, Object> definition() {
    return Map.of("type", "function", "function", Map.of(
        "name", name(), "description",
        "Transfere a conversa para atendimento humano quando solicitado ou quando não houver segurança para responder.",
        "parameters", Map.of("type", "object", "properties", Map.of(
            "reason", Map.of("type", "string")), "required", java.util.List.of("reason"),
            "additionalProperties", false)));
  }

  @Override
  public Object execute(JsonNode arguments, long conversationId, String phone) {
    conversationService.updateAiMode(conversationId, ConversationAiMode.HUMAN);
    return Map.of("transferred", true, "reason", arguments.path("reason").asText("Solicitação de atendimento humano"));
  }
}