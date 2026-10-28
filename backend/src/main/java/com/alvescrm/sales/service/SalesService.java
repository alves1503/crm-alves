package com.alvescrm.sales.service;

import com.alvescrm.sales.dto.LeadRequest;
import com.alvescrm.sales.dto.MeetingRequest;
import com.alvescrm.sales.dto.ServiceRequest;
import com.alvescrm.sales.model.Lead;
import com.alvescrm.sales.model.SalesMeeting;
import com.alvescrm.sales.model.ServiceOffer;
import com.alvescrm.sales.repository.SalesRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SalesService {

  private final SalesRepository repository;

  public SalesService(SalesRepository repository) {
    this.repository = repository;
  }

  public List<Lead> leads() {
    return repository.findLeads();
  }

  public List<SalesMeeting> meetings() {
    return repository.findMeetings();
  }

  public List<ServiceOffer> services(boolean activeOnly) {
    return repository.findServices(activeOnly);
  }

  @Transactional
  public Lead saveLead(LeadRequest request) {
    return repository.saveLead(request.conversationId(), request.phone().trim(), request.fullName(),
        request.email(), request.company(), request.interest(), request.notes());
  }

  @Transactional
  public Lead captureLead(Long conversationId, String phone, String name, String email,
      String company, String interest) {
    return repository.saveLead(conversationId, phone, name, email, company, interest, null);
  }

  @Transactional
  public SalesMeeting bookMeeting(MeetingRequest request) {
    if (!request.startsAt().isAfter(java.time.Instant.now()))
      throw new com.alvescrm.shared.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST,
          "A reunião precisa ser marcada para uma data futura.");
    return repository.saveMeeting(request.leadId(), request.conversationId(), request.startsAt(),
        request.durationMinutes() < 1 ? 30 : request.durationMinutes(), request.notes());
  }

  @Transactional
  public SalesMeeting bookMeeting(long leadId, Long conversationId, java.time.Instant startsAt, String notes) {
    if (!startsAt.isAfter(java.time.Instant.now()))
      throw new com.alvescrm.shared.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST,
          "A reunião precisa ser marcada para uma data futura.");
    return repository.saveMeeting(leadId, conversationId, startsAt, 30, notes);
  }

  public Lead leadByPhone(String phone) {
    return repository.findLeadByPhone(phone).orElse(null);
  }

  @Transactional
  public ServiceOffer saveService(ServiceRequest request) {
    if (request.priceFrom() != null && request.priceTo() != null
        && request.priceFrom().compareTo(request.priceTo()) > 0) {
      throw new IllegalArgumentException("O valor inicial não pode ser maior que o valor final.");
    }

    return repository.saveService(request.id(), request.name().trim(), request.summary().trim(),
        request.description().trim(), request.priceFrom(), request.priceTo(),
        request.deliveryEstimate(), request.active());
  }
}