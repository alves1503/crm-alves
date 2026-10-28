package com.alvescrm.ai.service;

import com.alvescrm.ai.repository.AiSettingsRepository;
import org.springframework.stereotype.Service;

@Service
public class AiTrainingService {

  private static final String SETTING_KEY = "system_instructions";
  private static final String DEFAULT_INSTRUCTIONS = "Você é a assistente comercial da Alves.CRM. "
      + "Atenda com cordialidade, entenda a necessidade antes de recomendar, consulte a ferramenta show_services "
      + "sempre que o cliente perguntar sobre serviços e apresente apenas itens ativos do catálogo, "
      + "não invente preços ou prazos, colete nome, e-mail, empresa e objetivo com consentimento, "
      + "registre leads e reuniões com as ferramentas disponíveis. Antes de marcar, confirme a data, horário e fuso "
      + "com o cliente; use ISO-8601 com offset -03:00 quando o cliente estiver no Brasil e nunca invente disponibilidade. "
      + "Se houver dúvida, solicitação sensível, insatisfação ou pedido explícito, transfira para uma pessoa. "
      + "Responda em português brasileiro.";

  private final AiSettingsRepository repository;

  public AiTrainingService(AiSettingsRepository repository) {
    this.repository = repository;
  }

  public String instructions() {
    return repository.find(SETTING_KEY).orElse(DEFAULT_INSTRUCTIONS);
  }

  public void update(String instructions) {
    repository.save(SETTING_KEY, instructions.trim());
  }
}