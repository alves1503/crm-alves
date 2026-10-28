package com.alvescrm.ai.tools;

import com.alvescrm.sales.model.Lead;
import com.alvescrm.sales.model.SalesMeeting;
import com.alvescrm.sales.service.SalesService;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class MeetingBookingTool implements AiTool {
  private final SalesService salesService;

  public MeetingBookingTool(SalesService salesService) {
    this.salesService = salesService;
  }

  @Override
  public String name() {
    return "schedule_meeting";
  }

  @Override
  public Map<String, Object> definition() {
    return Map.of("type", "function", "function", Map.of(
        "name", name(), "description",
        "Agenda uma reunião na agenda interna após confirmar data e horário com o cliente.",
        "parameters", Map.of("type", "object", "properties", Map.of(
            "startsAt", Map.of("type", "string", "description", "Data ISO-8601 com fuso horário"),
            "notes", Map.of("type", "string")), "required", java.util.List.of("startsAt"),
            "additionalProperties", false)));
  }

  @Override
  public Object execute(JsonNode args, long conversationId, String phone) {
    Lead lead = salesService.leadByPhone(phone);
    if (lead == null)
      return Map.of("scheduled", false, "reason", "Cadastre os dados do lead antes de marcar a reunião.");
    try {
      Instant start = Instant.parse(args.path("startsAt").asText());
      SalesMeeting meeting = salesService.bookMeeting(lead.id(), conversationId, start,
          args.path("notes").asText("Reunião de apresentação"));
      return Map.of("scheduled", true, "meetingId", meeting.id(), "startsAt", meeting.startsAt().toString());
    } catch (RuntimeException exception) {
      return Map.of("scheduled", false, "reason", "Data inválida ou no passado. Confirme e tente novamente.");
    }
  }
}