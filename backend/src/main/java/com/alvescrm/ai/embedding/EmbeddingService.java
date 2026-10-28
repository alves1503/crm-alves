package com.alvescrm.ai.embedding;

import com.alvescrm.ai.client.OpenAiClient;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class EmbeddingService {

  private final OpenAiClient client;

  public EmbeddingService(OpenAiClient client) {
    this.client = client;
  }

  public List<Double> create(String text) {
    return client.embed(text);
  }
}