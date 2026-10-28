import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "../api/schema";

const TOKEN_KEY = "alves-crm-token";
const USER_KEY = "alves-crm-user";

export async function requestJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  const response = await fetch(path, { ...init, headers });
  if (response.status === 401 && token) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("alvescrm:unauthorized"));
  }
  if (!response.ok) {
    let message = "Não foi possível concluir a solicitação.";
    try {
      const payload = (await response.json()) as ApiErrorPayload;
      message =
        payload.message ?? Object.values(payload.fields ?? {})[0] ?? message;
    } catch {
      /* resposta sem corpo JSON */
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const authenticationMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event("alvescrm:unauthorized"));
    }
    return response;
  },
};

export const apiClient = createClient<paths>({ baseUrl: "" });
apiClient.use(authenticationMiddleware);

interface ApiErrorPayload {
  message?: string;
  fields?: Record<string, string>;
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  if (payload.message !== undefined && typeof payload.message !== "string")
    return false;
  if (payload.fields === undefined) return true;
  if (
    typeof payload.fields !== "object" ||
    payload.fields === null ||
    Array.isArray(payload.fields)
  )
    return false;
  return Object.values(payload.fields).every(
    (field) => typeof field === "string",
  );
}

export async function unwrapApiResponse<T>(
  request: Promise<{ data?: T; error?: unknown; response: Response }>,
  fallback = "Não foi possível concluir a solicitação.",
): Promise<T> {
  const result = await request;
  if (!result.response.ok) {
    const error = isApiErrorPayload(result.error) ? result.error : undefined;
    throw new Error(
      error?.message ?? Object.values(error?.fields ?? {})[0] ?? fallback,
    );
  }
  if (result.data === undefined) {
    throw new Error("A API retornou uma resposta vazia inesperada.");
  }
  return result.data;
}
