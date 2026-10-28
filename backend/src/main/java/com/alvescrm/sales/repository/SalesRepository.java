package com.alvescrm.sales.repository;

import com.alvescrm.sales.model.Lead;
import com.alvescrm.sales.model.SalesMeeting;
import com.alvescrm.sales.model.ServiceOffer;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class SalesRepository {

  private final JdbcTemplate jdbc;
  private static final RowMapper<Lead> LEAD_MAPPER = SalesRepository::mapLead;
  private static final RowMapper<ServiceOffer> SERVICE_MAPPER = (rs, row) -> new ServiceOffer(
      rs.getLong("id"), rs.getString("name"), rs.getString("summary"), rs.getString("description"),
      rs.getBigDecimal("price_from"), rs.getBigDecimal("price_to"), rs.getString("delivery_estimate"),
      rs.getBoolean("active"));

  public SalesRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public List<Lead> findLeads() {
    return jdbc.query("SELECT * FROM leads ORDER BY updated_at DESC", LEAD_MAPPER);
  }

  public Optional<Lead> findLeadByPhone(String phone) {
    return jdbc.query("SELECT * FROM leads WHERE phone = ?", LEAD_MAPPER, phone).stream().findFirst();
  }

  public Lead saveLead(Long conversationId, String phone, String name, String email, String company,
      String interest, String notes) {
    jdbc.update("INSERT INTO leads (conversation_id, phone, full_name, email, company, interest, notes) "
        + "VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE "
        + "conversation_id = COALESCE(VALUES(conversation_id), conversation_id), "
        + "full_name = COALESCE(VALUES(full_name), full_name), email = COALESCE(VALUES(email), email), "
        + "company = COALESCE(VALUES(company), company), interest = COALESCE(VALUES(interest), interest), "
        + "notes = COALESCE(VALUES(notes), notes)", conversationId, phone, name, email, company, interest, notes);
    return findLeadByPhone(phone).orElseThrow();
  }

  public void updateLeadStage(long id, String stage) {
    jdbc.update("UPDATE leads SET stage = ? WHERE id = ?", stage, id);
  }

  public List<ServiceOffer> findServices(boolean activeOnly) {
    String sql = "SELECT * FROM service_catalog" + (activeOnly ? " WHERE active = TRUE" : "") + " ORDER BY name";
    return jdbc.query(sql, SERVICE_MAPPER);
  }

  public ServiceOffer saveService(Long id, String name, String summary, String description,
      java.math.BigDecimal priceFrom, java.math.BigDecimal priceTo, String deliveryEstimate, boolean active) {
    if (id == null) {
      jdbc.update(
          "INSERT INTO service_catalog (name, summary, description, price_from, price_to, delivery_estimate, active) "
              + "VALUES (?, ?, ?, ?, ?, ?, ?)",
          name, summary, description, priceFrom, priceTo, deliveryEstimate, active);
      id = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    } else {
      jdbc.update("UPDATE service_catalog SET name = ?, summary = ?, description = ?, price_from = ?, price_to = ?, "
          + "delivery_estimate = ?, active = ? WHERE id = ?", name, summary, description, priceFrom, priceTo,
          deliveryEstimate, active, id);
    }
    long serviceId = id;
    return findServices(false).stream().filter(service -> service.id() == serviceId).findFirst().orElseThrow();
  }

  public List<SalesMeeting> findMeetings() {
    return jdbc.query("SELECT m.id, m.lead_id, m.conversation_id, l.full_name, l.phone, m.starts_at, "
        + "m.duration_minutes, m.status, m.notes FROM meetings m JOIN leads l ON l.id = m.lead_id "
        + "ORDER BY m.starts_at DESC",
        (rs, row) -> new SalesMeeting(rs.getLong("id"), rs.getLong("lead_id"),
            (Long) rs.getObject("conversation_id"), rs.getString("full_name"), rs.getString("phone"),
            rs.getTimestamp("starts_at").toInstant(), rs.getInt("duration_minutes"),
            rs.getString("status"), rs.getString("notes")));
  }

  public SalesMeeting saveMeeting(long leadId, Long conversationId, java.time.Instant startsAt,
      int durationMinutes, String notes) {
    Integer overlaps = jdbc.queryForObject(
        "SELECT COUNT(*) FROM meetings WHERE status = 'SCHEDULED' "
            + "AND starts_at < DATE_ADD(?, INTERVAL ? MINUTE) "
            + "AND DATE_ADD(starts_at, INTERVAL duration_minutes MINUTE) > ?",
        Integer.class, Timestamp.from(startsAt), durationMinutes, Timestamp.from(startsAt));
    if (overlaps != null && overlaps > 0)
      throw new com.alvescrm.shared.ApiException(org.springframework.http.HttpStatus.CONFLICT,
          "Esse horário já está ocupado. Escolha outro horário para a reunião.");
    jdbc.update(
        "INSERT INTO meetings (lead_id, conversation_id, starts_at, duration_minutes, notes) VALUES (?, ?, ?, ?, ?)",
        leadId, conversationId, Timestamp.from(startsAt), durationMinutes, notes);
    long id = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    return findMeetings().stream().filter(meeting -> meeting.id() == id).findFirst().orElseThrow();
  }

  private static Lead mapLead(ResultSet rs, int row) throws SQLException {
    return new Lead(rs.getLong("id"), (Long) rs.getObject("conversation_id"), rs.getString("phone"),
        rs.getString("full_name"), rs.getString("email"), rs.getString("company"),
        rs.getString("interest"), rs.getString("notes"), rs.getString("stage"),
        rs.getTimestamp("created_at").toInstant(), rs.getTimestamp("updated_at").toInstant());
  }
}