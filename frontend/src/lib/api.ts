export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  formData?: FormData;
}

type ApiEnvelope<T> = { success: true; data: T } | { success: false; message: string; details?: unknown };

/**
 * Calls the API through the same-origin /api proxy (see next.config.ts), so the
 * httpOnly session cookie is sent automatically. Unwraps `{ success, data }`.
 */
export async function api<T>(path: string, { method = "GET", body, formData }: RequestOptions = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    if (response.status === 401 && !path.startsWith("/auth/") && typeof window !== "undefined") {
      // Full reload on purpose: drops all cached client state of the expired session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
    const failure = payload && !payload.success ? payload : null;
    throw new ApiClientError(
      failure?.message ?? "Something went wrong. Please try again.",
      response.status,
      failure?.details,
    );
  }

  return payload.data;
}

export const fetcher = <T>(path: string) => api<T>(path);

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
