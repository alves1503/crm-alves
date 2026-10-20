package com.alvescrm.conversation.service;

import com.alvescrm.conversation.dto.MessageRequest;
import com.alvescrm.conversation.model.Conversation;
import com.alvescrm.conversation.model.ConversationMessage;
import com.alvescrm.conversation.model.ConversationStatus;
import com.alvescrm.conversation.repository.ConversationRepository;
import com.alvescrm.shared.ApiException;
import com.alvescrm.whatsapp.EvolutionClient;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConversationService {

    private final ConversationRepository repository;
    private final EvolutionClient evolutionClient;
    private final String closedMessage;

    public ConversationService(
            ConversationRepository repository,
            EvolutionClient evolutionClient,
            @Value("${app.whatsapp.closed-message}") String closedMessage) {
        this.repository = repository;
        this.evolutionClient = evolutionClient;
        this.closedMessage = closedMessage;
    }

    @Transactional(readOnly = true)
    public List<Conversation> findAll(String search, ConversationStatus status) {
        return repository.findAll(search, status);
    }

    @Transactional(readOnly = true)
    public Conversation findById(Long id) {
        return getConversation(id);
    }

    @Transactional(readOnly = true)
    public List<ConversationMessage> findMessages(Long id) {
        getConversation(id);
        return repository.findMessages(id);
    }

    @Transactional
    public ConversationMessage reply(Long id, MessageRequest request) {
        Conversation conversation = getConversation(id);
        if (conversation.status() == ConversationStatus.CLOSED) {
            throw new ApiException(HttpStatus.CONFLICT, "Reabra o atendimento antes de enviar uma mensagem.");
        }
        String body = request.body().trim();
        evolutionClient.sendText(conversation.phone(), body);
        repository.saveOutgoing(id, body);
        List<ConversationMessage> messages = repository.findMessages(id);
        return messages.get(messages.size() - 1);
    }

    @Transactional
    public Conversation updateStatus(Long id, ConversationStatus status, Long assignedUserId) {
        Conversation conversation = getConversation(id);
        if (status == ConversationStatus.CLOSED && conversation.status() != ConversationStatus.CLOSED) {
            evolutionClient.sendText(conversation.phone(), closedMessage);
            repository.saveOutgoing(id, closedMessage);
        }
        repository.updateStatus(id, status, assignedUserId);
        return getConversation(id);
    }

    @Transactional
    public void receiveMessage(String phone, String contactName, String externalId, String body) {
        if (externalId != null && repository.hasExternalMessage(externalId)) {
            return;
        }
        repository.saveIncoming(phone, contactName, externalId, body);
    }

    private Conversation getConversation(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Atendimento não encontrado."));
    }
}
