package com.alvescrm.ai.tools;

import com.alvescrm.sales.model.Lead;
import com.alvescrm.sales.service.SalesService;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class LeadCaptureTool implements AiTool {
  private final SalesService salesService;

  public LeadCaptureTool(SalesService salesService) {
    this.salesService = salesService;
  }

  @Override
  public String name() {
    return "save_lead";
  }

  @Override
  public Map<String, Object> definition() {
    return Map.of("type", "function", "function", Map.of(
        "name", name(), "description",
        "Registra ou atualiza um lead depois de obter consentimento e os dados disponíveis.",
        "parameters", Map.of("type", "object", "properties", Map.of(
            "name", Map.of("type", "string"), "email", Map.of("type", "string"),
            "company", Map.of("type", "string"), "interest", Map.of("type", "string")),
            "required", java.util.List.of("interest"), "additionalProperties", false)));
  }

  @Override
  public Object execute(JsonNode args, long conversationId, String phone) {
    Lead lead = salesService.captureLead(conversationId, phone, text(args, "name"), text(args, "email"),
        text(args, "company"), text(args, "interest"));
    return Map.of("saved", true, "leadId", lead.id());
  }

  private String text(JsonNode node, String key) {
    return node.path(key).isTextual() ? node.path(key).asText() : null;
  }
}