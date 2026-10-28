package com.alvescrm.ai.repository;

import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AiSettingsRepository {

  private final JdbcTemplate jdbcTemplate;

  public AiSettingsRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public Optional<String> find(String key) {
    return jdbcTemplate.query("SELECT setting_value FROM ai_settings WHERE setting_key = ?",
        (rs, row) -> rs.getString(1), key).stream().findFirst();
  }

  public void save(String key, String value) {
    jdbcTemplate.update("INSERT INTO ai_settings (setting_key, setting_value) VALUES (?, ?) "
        + "ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", key, value);
  }
}