import type { components, paths } from "../api/schema";
import { apiClient, requestJson, unwrapApiResponse } from "./api";

export type ConversationStatus = NonNullable<
  components["schemas"]["Conversation"]["status"]
>;
export type ConversationFilters = NonNullable<
  paths["/api/conversations"]["get"]["parameters"]["query"]
>;

export const conversationService = {
  list(filters: ConversationFilters = {}) {
    return unwrapApiResponse(
      apiClient.GET("/api/conversations", {
        params: { query: filters },
      }),
    );
  },
  messages(id: number) {
    return unwrapApiResponse(
      apiClient.GET("/api/conversations/{id}/messages", {
        params: { path: { id } },
      }),
    );
  },
  reply(id: number, body: string) {
    return unwrapApiResponse(
      apiClient.POST("/api/conversations/{id}/messages", {
        params: { path: { id } },
        body: { body },
      }),
    );
  },
  updateStatus(id: number, status: ConversationStatus) {
    return unwrapApiResponse(
      apiClient.PATCH("/api/conversations/{id}/status", {
        params: { path: { id } },
        body: { status },
      }),
    );
  },
  updateAiMode(id: number, mode: "AI" | "HUMAN") {
    return requestJson<components["schemas"]["Conversation"]>(
      `/api/conversations/${id}/ai-mode`,
      {
        method: "PATCH",
        body: JSON.stringify({ mode }),
      },
    );
  },
};
