export interface Lead {
  id: number;
  conversationId: number | null;
  phone: string;
  fullName: string | null;
  email: string | null;
  company: string | null;
  interest: string | null;
  notes: string | null;
  stage: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOffer {
  id: number;
  name: string;
  summary: string;
  description: string;
  priceFrom: number | null;
  priceTo: number | null;
  deliveryEstimate: string | null;
  active: boolean;
}

export interface SalesMeeting {
  id: number;
  leadId: number;
  conversationId: number | null;
  leadName: string | null;
  phone: string;
  startsAt: string;
  durationMinutes: number;
  status: string;
  notes: string | null;
}

export interface TrainingSource {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
}

export interface TrainingData {
  instructions: string;
  sources: TrainingSource[];
  configured: boolean;
}
