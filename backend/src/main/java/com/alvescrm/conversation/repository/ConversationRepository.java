package com.alvescrm.conversation.repository;

import com.alvescrm.conversation.model.Conversation;
import com.alvescrm.conversation.model.ConversationAiMode;
import com.alvescrm.conversation.model.ConversationMessage;
import com.alvescrm.conversation.model.ConversationStatus;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class ConversationRepository {

  private static final String CONVERSATION_COLUMNS = "c.id, c.phone, c.contact_name, c.status, c.ai_mode, c.assigned_user_id, "
      + "c.last_message, c.last_message_at, c.created_at";
  private static final RowMapper<Conversation> CONVERSATION_MAPPER = ConversationRepository::mapConversation;
  private static final RowMapper<ConversationMessage> MESSAGE_MAPPER = (rs, row) -> new ConversationMessage(
      rs.getLong("id"),
      rs.getLong("conversation_id"),
      rs.getString("direction"),
      rs.getString("body"),
      rs.getTimestamp("created_at").toInstant());

  private final JdbcTemplate jdbcTemplate;

  public ConversationRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<Conversation> findAll(String search, ConversationStatus status) {
    StringBuilder sql = new StringBuilder("SELECT ")
        .append(CONVERSATION_COLUMNS)
        .append(" FROM conversations c WHERE 1 = 1");
    List<Object> parameters = new ArrayList<>();
    if (status != null) {
      sql.append(" AND c.status = ?");
      parameters.add(status.name());
    }
    if (search != null && !search.isBlank()) {
      sql.append(" AND (LOWER(c.contact_name) LIKE LOWER(?) OR c.phone LIKE ?)");
      String pattern = "%" + search.trim() + "%";
      parameters.add(pattern);
      parameters.add(pattern);
    }
    sql.append(" ORDER BY c.last_message_at DESC, c.id DESC");
    return jdbcTemplate.query(sql.toString(), CONVERSATION_MAPPER, parameters.toArray());
  }

  public Optional<Conversation> findById(Long id) {
    return jdbcTemplate.query(
        "SELECT " + CONVERSATION_COLUMNS + " FROM conversations c WHERE c.id = ?",
        CONVERSATION_MAPPER,
        id)
        .stream()
        .findFirst();
  }

  public Optional<Conversation> findByPhone(String phone) {
    return jdbcTemplate.query(
        "SELECT " + CONVERSATION_COLUMNS + " FROM conversations c WHERE c.phone = ?",
        CONVERSATION_MAPPER,
        phone)
        .stream()
        .findFirst();
  }

  public List<ConversationMessage> findMessages(Long conversationId) {
    return jdbcTemplate.query(
        "SELECT id, conversation_id, direction, body, created_at "
            + "FROM conversation_messages WHERE conversation_id = ? ORDER BY created_at, id",
        MESSAGE_MAPPER,
        conversationId);
  }

  public boolean hasExternalMessage(String externalId) {
    if (externalId == null || externalId.isBlank()) {
      return false;
    }
    Integer count = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM conversation_messages WHERE external_id = ?",
        Integer.class,
        externalId);
    return count != null && count > 0;
  }

  public Long saveIncoming(String phone, String contactName, String externalId, String body) {
    jdbcTemplate.update(
        "INSERT INTO conversations (phone, contact_name) VALUES (?, ?) "
            + "ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)",
        phone,
        contactName);
    Long conversationId = jdbcTemplate.queryForObject(
        "SELECT id FROM conversations WHERE phone = ?", Long.class, phone);
    if (conversationId == null) {
      throw new IllegalStateException("A conversa recebida não foi persistida.");
    }
    int inserted = jdbcTemplate.update(
        "INSERT IGNORE INTO conversation_messages (conversation_id, external_id, direction, body) "
            + "VALUES (?, ?, 'INBOUND', ?)",
        conversationId,
        externalId,
        body);
    if (inserted == 0)
      return null;
    jdbcTemplate.update(
        "UPDATE conversations SET contact_name = IF(? <> phone, ?, contact_name), "
            + "status = IF(status = 'CLOSED', 'OPEN', status), last_message = ?, "
            + "last_message_at = CURRENT_TIMESTAMP(6) WHERE id = ?",
        contactName,
        contactName,
        body,
        conversationId);
    return conversationId;
  }

  public void saveOutgoing(Long conversationId, String body) {
    jdbcTemplate.update(
        "INSERT INTO conversation_messages (conversation_id, direction, body) VALUES (?, 'OUTBOUND', ?)",
        conversationId,
        body);
    jdbcTemplate.update(
        "UPDATE conversations SET last_message = ?, last_message_at = CURRENT_TIMESTAMP(6) WHERE id = ?",
        body,
        conversationId);
  }

  public void updateAiMode(Long conversationId, ConversationAiMode mode) {
    jdbcTemplate.update("UPDATE conversations SET ai_mode = ?, updated_at = CURRENT_TIMESTAMP(6) WHERE id = ?",
        mode.name(), conversationId);
  }

  public void updateStatus(Long conversationId, ConversationStatus status, Long assignedUserId) {
    jdbcTemplate.update(
        "UPDATE conversations SET status = ?, assigned_user_id = ?, "
            + "updated_at = CURRENT_TIMESTAMP(6) WHERE id = ?",
        status.name(),
        assignedUserId,
        conversationId);
  }

  private static Conversation mapConversation(ResultSet rs, int rowNumber) throws SQLException {
    return new Conversation(
        rs.getLong("id"),
        rs.getString("phone"),
        rs.getString("contact_name"),
        ConversationStatus.valueOf(rs.getString("status")),
        ConversationAiMode.valueOf(rs.getString("ai_mode")),
        rs.getObject("assigned_user_id", Long.class),
        rs.getString("last_message"),
        rs.getTimestamp("last_message_at").toInstant(),
        rs.getTimestamp("created_at").toInstant());
  }
}
