package com.alvescrm.ai.tools;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class AiToolRegistry {
  private final Map<String, AiTool> tools;

  public AiToolRegistry(List<AiTool> tools) {
    this.tools = tools.stream().collect(Collectors.toUnmodifiableMap(AiTool::name, Function.identity()));
  }

  public List<Map<String, Object>> definitions() {
    return tools.values().stream().map(AiTool::definition).toList();
  }

  public Object execute(String name, JsonNode arguments, long conversationId, String phone) {
    AiTool tool = tools.get(name);
    if (tool == null)
      return Map.of("error", "Ferramenta não disponível.");
    return tool.execute(arguments, conversationId, phone);
  }
}