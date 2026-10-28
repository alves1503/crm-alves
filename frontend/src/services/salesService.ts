import { requestJson } from "./api";
import type { Lead, SalesMeeting, ServiceOffer } from "../types/sales";

export const salesService = {
  leads: () => requestJson<Lead[]>("/api/sales/leads"),
  saveLead: (lead: Partial<Lead> & Pick<Lead, "phone">) =>
    requestJson<Lead>("/api/sales/leads", {
      method: "POST",
      body: JSON.stringify(lead),
    }),
  meetings: () => requestJson<SalesMeeting[]>("/api/sales/meetings"),
  schedule: (meeting: {
    leadId: number;
    startsAt: string;
    durationMinutes: number;
    notes: string;
  }) =>
    requestJson<SalesMeeting>("/api/sales/meetings", {
      method: "POST",
      body: JSON.stringify(meeting),
    }),
  services: (activeOnly = false) =>
    requestJson<ServiceOffer[]>(`/api/sales/services?activeOnly=${activeOnly}`),
  saveService: (
    service: Partial<ServiceOffer> &
      Pick<ServiceOffer, "name" | "summary" | "description">,
  ) =>
    requestJson<ServiceOffer>("/api/sales/services", {
      method: "POST",
      body: JSON.stringify(service),
    }),
};
