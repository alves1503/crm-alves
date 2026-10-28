package com.alvescrm.ai.rag;

import com.alvescrm.ai.embedding.EmbeddingService;
import com.alvescrm.ai.repository.AiKnowledgeRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiKnowledgeService {

  private static final int CHUNK_SIZE = 900;
  private final AiKnowledgeRepository repository;
  private final EmbeddingService embeddingService;
  private final ObjectMapper objectMapper;

  public AiKnowledgeService(AiKnowledgeRepository repository, EmbeddingService embeddingService,
      ObjectMapper objectMapper) {
    this.repository = repository;
    this.embeddingService = embeddingService;
    this.objectMapper = objectMapper;
  }

  public List<AiKnowledgeRepository.Source> sources() {
    return repository.findSources();
  }

  @Transactional
  public AiKnowledgeRepository.Source save(Long id, String title, String content) {
    String normalized = content.trim();
    long sourceId = repository.saveSource(id, title.trim(), normalized);
    List<String> chunks = split(normalized);
    List<String> vectors = new ArrayList<>();
    for (String chunk : chunks) {
      try {
        vectors.add(objectMapper.writeValueAsString(embeddingService.create(chunk)));
      } catch (Exception exception) {
        throw new IllegalStateException("Não foi possível gerar embeddings para o conteúdo de treinamento.", exception);
      }
    }
    repository.replaceChunks(sourceId, chunks, vectors);
    return repository.findSources().stream().filter(source -> source.id() == sourceId).findFirst().orElseThrow();
  }

  @Transactional
  public void delete(long id) {
    repository.deleteSource(id);
  }

  public String retrieve(String query) {
    if (query == null || query.isBlank())
      return "";
    try {
      List<Double> queryVector = embeddingService.create(query);
      return repository.findChunks().stream()
          .map(chunk -> new ScoredChunk(chunk.content(), cosine(queryVector, parse(chunk.embedding()))))
          .filter(chunk -> chunk.score() > 0.18)
          .sorted(Comparator.comparingDouble(ScoredChunk::score).reversed())
          .limit(4)
          .map(ScoredChunk::content)
          .reduce((first, second) -> first + "\n\n" + second)
          .orElse("");
    } catch (Exception exception) {
      return "";
    }
  }

  private List<String> split(String content) {
    List<String> chunks = new ArrayList<>();
    for (int start = 0; start < content.length(); start += CHUNK_SIZE) {
      int end = Math.min(content.length(), start + CHUNK_SIZE);
      if (end < content.length()) {
        int paragraphEnd = content.lastIndexOf('\n', end);
        if (paragraphEnd > start + CHUNK_SIZE / 2)
          end = paragraphEnd;
      }
      chunks.add(content.substring(start, end).trim());
    }
    return chunks.stream().filter(chunk -> !chunk.isBlank()).toList();
  }

  private List<Double> parse(String json) {
    try {
      return objectMapper.readValue(json, new TypeReference<>() {
      });
    } catch (Exception exception) {
      throw new IllegalStateException("Embedding armazenado inválido.", exception);
    }
  }

  private double cosine(List<Double> left, List<Double> right) {
    if (left.size() != right.size() || left.isEmpty())
      return 0;
    double product = 0;
    double leftMagnitude = 0;
    double rightMagnitude = 0;
    for (int index = 0; index < left.size(); index++) {
      product += left.get(index) * right.get(index);
      leftMagnitude += left.get(index) * left.get(index);
      rightMagnitude += right.get(index) * right.get(index);
    }
    return leftMagnitude == 0 || rightMagnitude == 0 ? 0 : product / Math.sqrt(leftMagnitude * rightMagnitude);
  }

  private record ScoredChunk(String content, double score) {
  }
}