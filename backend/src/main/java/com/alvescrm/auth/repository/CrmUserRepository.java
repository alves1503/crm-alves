package com.alvescrm.auth.repository;

import com.alvescrm.auth.model.CrmUser;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CrmUserRepository {

    private final JdbcTemplate jdbcTemplate;

    public CrmUserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<CrmUser> findByEmail(String email) {
        return jdbcTemplate.query(
                        "SELECT id, email, password_hash, display_name FROM crm_users WHERE email = ?",
                        (resultSet, rowNumber) -> new CrmUser(
                                resultSet.getLong("id"),
                                resultSet.getString("email"),
                                resultSet.getString("password_hash"),
                                resultSet.getString("display_name")),
                        email)
                .stream()
                .findFirst();
    }

    public Optional<CrmUser> findById(Long id) {
        return jdbcTemplate.query(
                        "SELECT id, email, password_hash, display_name FROM crm_users WHERE id = ?",
                        (resultSet, rowNumber) -> new CrmUser(
                                resultSet.getLong("id"),
                                resultSet.getString("email"),
                                resultSet.getString("password_hash"),
                                resultSet.getString("display_name")),
                        id)
                .stream()
                .findFirst();
    }

    public boolean existsByEmail(String email) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM crm_users WHERE email = ?", Integer.class, email);
        return count != null && count > 0;
    }

    public void create(String email, String passwordHash, String displayName) {
        jdbcTemplate.update(
                "INSERT INTO crm_users (email, password_hash, display_name) VALUES (?, ?, ?)",
                email,
                passwordHash,
                displayName);
    }
}
