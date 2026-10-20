package com.alvescrm.conversation.controller;

import com.alvescrm.conversation.dto.MessageRequest;
import com.alvescrm.conversation.dto.StatusRequest;
import com.alvescrm.conversation.model.Conversation;
import com.alvescrm.conversation.model.ConversationMessage;
import com.alvescrm.conversation.model.ConversationStatus;
import com.alvescrm.conversation.service.ConversationService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conversations")
@Tag(name = "Conversas")
public class ConversationController {

    private final ConversationService service;

    public ConversationController(ConversationService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar conversas", security = @SecurityRequirement(name = "bearerAuth"))
    public List<Conversation> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ConversationStatus status) {
        return service.findAll(search, status);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar conversa", security = @SecurityRequirement(name = "bearerAuth"))
    public Conversation findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/{id}/messages")
    @Operation(summary = "Listar mensagens da conversa", security = @SecurityRequirement(name = "bearerAuth"))
    public List<ConversationMessage> findMessages(@PathVariable Long id) {
        return service.findMessages(id);
    }

    @PostMapping("/{id}/messages")
    @Operation(summary = "Enviar mensagem na conversa", security = @SecurityRequirement(name = "bearerAuth"))
    public ConversationMessage reply(
            @PathVariable Long id,
            @Valid @RequestBody MessageRequest request) {
        return service.reply(id, request);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status da conversa", security = @SecurityRequirement(name = "bearerAuth"))
    public Conversation updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusRequest request,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return service.updateStatus(id, request.status(), userId);
    }
}
