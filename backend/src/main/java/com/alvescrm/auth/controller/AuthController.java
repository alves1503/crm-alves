package com.alvescrm.auth.controller;

import com.alvescrm.auth.dto.LoginRequest;
import com.alvescrm.auth.dto.LoginResponse;
import com.alvescrm.auth.dto.UserResponse;
import com.alvescrm.auth.service.AuthService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticação")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Entrar no CRM", description = "Autentica o usuário e retorna um token JWT.")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Consultar usuário autenticado", security = @SecurityRequirement(name = "bearerAuth"))
    public UserResponse currentUser(Authentication authentication) {
        return authService.getCurrentUser(Long.valueOf(authentication.getName()));
    }
}
