package com.alvescrm.sales.controller;

import com.alvescrm.sales.dto.LeadRequest;
import com.alvescrm.sales.dto.MeetingRequest;
import com.alvescrm.sales.dto.ServiceRequest;
import com.alvescrm.sales.model.Lead;
import com.alvescrm.sales.model.SalesMeeting;
import com.alvescrm.sales.model.ServiceOffer;
import com.alvescrm.sales.service.SalesService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales")
public class SalesController {

  private final SalesService service;

  public SalesController(SalesService service) {
    this.service = service;
  }

  @GetMapping("/leads")
  public List<Lead> leads() {
    return service.leads();
  }

  @PostMapping("/leads")
  public Lead saveLead(@Valid @RequestBody LeadRequest request) {
    return service.saveLead(request);
  }

  @GetMapping("/meetings")
  public List<SalesMeeting> meetings() {
    return service.meetings();
  }

  @PostMapping("/meetings")
  public SalesMeeting bookMeeting(@Valid @RequestBody MeetingRequest request) {
    return service.bookMeeting(request);
  }

  @GetMapping("/services")
  public List<ServiceOffer> services(@RequestParam(defaultValue = "false") boolean activeOnly) {
    return service.services(activeOnly);
  }

  @PostMapping("/services")
  public ServiceOffer saveService(@Valid @RequestBody ServiceRequest request) {
    return service.saveService(request);
  }

  @PutMapping("/services")
  public ServiceOffer updateService(@Valid @RequestBody ServiceRequest request) {
    return service.saveService(request);
  }
}