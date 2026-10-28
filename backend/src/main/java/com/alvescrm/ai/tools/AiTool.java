package com.alvescrm.ai.tools;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;

public interface AiTool {
  String name();

  Map<String, Object> definition();

  Object execute(JsonNode arguments, long conversationId, String phone);
}