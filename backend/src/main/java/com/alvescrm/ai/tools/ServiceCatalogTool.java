package com.alvescrm.ai.tools;

import com.alvescrm.sales.service.SalesService;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ServiceCatalogTool implements AiTool {
  private final SalesService salesService;

  public ServiceCatalogTool(SalesService salesService) {
    this.salesService = salesService;
  }

  @Override
  public String name() {
    return "show_services";
  }

  @Override
  public Map<String, Object> definition() {
    return Map.of("type", "function", "function", Map.of(
        "name", name(), "description",
        "Consulta o catálogo ativo para apresentar serviços, faixas de preço e prazos cadastrados.",
        "parameters", Map.of("type", "object", "properties", Map.of(), "additionalProperties", false)));
  }

  @Override
  public Object execute(JsonNode arguments, long conversationId, String phone) {
    return salesService.services(true);
  }
}