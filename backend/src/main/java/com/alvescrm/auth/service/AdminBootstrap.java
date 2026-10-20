package com.alvescrm.auth.service;

import com.alvescrm.auth.repository.CrmUserRepository;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {

    private final CrmUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public AdminBootstrap(
            CrmUserRepository repository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email}") String email,
            @Value("${app.admin.password}") String password) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (password.length() < 12) {
            throw new IllegalStateException("CRM_ADMIN_PASSWORD precisa ter pelo menos 12 caracteres.");
        }
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (!repository.existsByEmail(normalizedEmail)) {
            repository.create(normalizedEmail, passwordEncoder.encode(password), "Administrador");
        }
    }
}
