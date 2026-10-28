import { requestJson } from "./api";
import type { TrainingData, TrainingSource } from "../types/sales";

export const aiService = {
  training: () => requestJson<TrainingData>("/api/ai/training"),
  saveInstructions: (instructions: string) =>
    requestJson<TrainingData>("/api/ai/training/instructions", {
      method: "PUT",
      body: JSON.stringify({ instructions }),
    }),
  saveSource: (source: { id?: number; title: string; content: string }) =>
    requestJson<TrainingSource>("/api/ai/training/sources", {
      method: "POST",
      body: JSON.stringify(source),
    }),
  deleteSource: (id: number) =>
    requestJson<void>(`/api/ai/training/sources/${id}`, { method: "DELETE" }),
};
