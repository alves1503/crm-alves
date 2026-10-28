package com.alvescrm.ai.repository;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AiKnowledgeRepository {

  public record Source(long id, String title, String content, String updatedAt) {
  }

  public record Chunk(long id, String content, String embedding) {
  }

  private final JdbcTemplate jdbcTemplate;

  public AiKnowledgeRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<Source> findSources() {
    return jdbcTemplate.query(
        "SELECT id, title, content, updated_at FROM ai_knowledge_sources ORDER BY updated_at DESC",
        (rs, row) -> new Source(rs.getLong("id"), rs.getString("title"), rs.getString("content"),
            rs.getTimestamp("updated_at").toInstant().toString()));
  }

  public long saveSource(Long id, String title, String content) {
    if (id == null) {
      jdbcTemplate.update("INSERT INTO ai_knowledge_sources (title, content) VALUES (?, ?)", title, content);
      return jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }
    jdbcTemplate.update("UPDATE ai_knowledge_sources SET title = ?, content = ? WHERE id = ?", title, content, id);
    return id;
  }

  public void deleteSource(long id) {
    jdbcTemplate.update("DELETE FROM ai_knowledge_sources WHERE id = ?", id);
  }

  public void replaceChunks(long sourceId, List<String> chunks, List<String> embeddings) {
    jdbcTemplate.update("DELETE FROM ai_knowledge_chunks WHERE source_id = ?", sourceId);
    for (int index = 0; index < chunks.size(); index++) {
      jdbcTemplate.update("INSERT INTO ai_knowledge_chunks (source_id, chunk_index, content, embedding) "
          + "VALUES (?, ?, ?, CAST(? AS JSON))",
          sourceId, index, chunks.get(index), embeddings.get(index));
    }
  }

  public List<Chunk> findChunks() {
    return jdbcTemplate.query("SELECT id, content, CAST(embedding AS CHAR) embedding FROM ai_knowledge_chunks",
        (rs, row) -> new Chunk(rs.getLong("id"), rs.getString("content"), rs.getString("embedding")));
  }
}