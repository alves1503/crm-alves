package com.alvescrm.auth.model;

public record CrmUser(Long id, String email, String passwordHash, String displayName) {
}
