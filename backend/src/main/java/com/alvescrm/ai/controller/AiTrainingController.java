package com.alvescrm.ai.controller;

import com.alvescrm.ai.dto.InstructionsRequest;
import com.alvescrm.ai.dto.TrainingRequest;
import com.alvescrm.ai.rag.AiKnowledgeService;
import com.alvescrm.ai.repository.AiKnowledgeRepository;
import com.alvescrm.ai.service.AiTrainingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@RestController
@RequestMapping("/api/ai/training")
public class AiTrainingController {

  public record TrainingResponse(String instructions, List<AiKnowledgeRepository.Source> sources, boolean configured) {
  }

  private final AiTrainingService trainingService;
  private final AiKnowledgeService knowledgeService;
  private final boolean enabled;
  private final boolean apiKeyConfigured;

  public AiTrainingController(AiTrainingService trainingService, AiKnowledgeService knowledgeService,
      @Value("${app.ai.enabled}") boolean enabled, @Value("${app.ai.openai-api-key}") String apiKey) {
    this.trainingService = trainingService;
    this.knowledgeService = knowledgeService;
    this.enabled = enabled;
    this.apiKeyConfigured = apiKey != null && !apiKey.isBlank();
  }

  @GetMapping
  public TrainingResponse get() {
    return new TrainingResponse(trainingService.instructions(), knowledgeService.sources(),
        enabled && apiKeyConfigured);
  }

  @PutMapping("/instructions")
  public TrainingResponse updateInstructions(@Valid @RequestBody InstructionsRequest request) {
    trainingService.update(request.instructions());
    return get();
  }

  @PostMapping("/sources")
  public AiKnowledgeRepository.Source save(@Valid @RequestBody TrainingRequest request) {
    return knowledgeService.save(request.id(), request.title(), request.content());
  }

  @DeleteMapping("/sources/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long id) {
    knowledgeService.delete(id);
  }
}