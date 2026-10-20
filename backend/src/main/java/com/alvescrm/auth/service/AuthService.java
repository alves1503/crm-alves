package com.alvescrm.auth.service;

import com.alvescrm.auth.dto.LoginRequest;
import com.alvescrm.auth.dto.LoginResponse;
import com.alvescrm.auth.dto.UserResponse;
import com.alvescrm.auth.model.CrmUser;
import com.alvescrm.auth.repository.CrmUserRepository;
import com.alvescrm.shared.ApiException;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final CrmUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(CrmUserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        CrmUser user = repository.findByEmail(email)
                .filter(candidate -> passwordEncoder.matches(request.password(), candidate.passwordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos."));
        return new LoginResponse(
                jwtService.createToken(user),
                jwtService.getExpiresInSeconds(),
                new UserResponse(user.id(), user.email(), user.displayName()));
    }

    public UserResponse getCurrentUser(Long id) {
        CrmUser user = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Sessão inválida."));
        return new UserResponse(user.id(), user.email(), user.displayName());
    }
}
