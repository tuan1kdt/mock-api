const DEFAULT_BACKEND_URL = "https://tuanla.cloud";

const backendBaseUrl = (() => {
    const envUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
    const normalized = (envUrl || DEFAULT_BACKEND_URL).trim();
    return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
})();

export class BackendError extends Error {
    status: number;
    body: unknown;
    url: string;

    constructor(message: string, status: number, body: unknown, url: string) {
        super(message);
        this.status = status;
        this.body = body;
        this.url = url;
    }
}

function toUrl(path: string) {
    return `${backendBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function requestJson<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    const url = toUrl(path);
    const res = await fetch(url, {
        credentials: "include",
        ...init,
        headers: {
            ...(init?.headers || {}),
        },
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await res.json().catch(() => null) : await res.text();

    if (!res.ok) {
        const errorMessage =
            isJson && body && typeof body === "object" && "error" in (body as Record<string, unknown>)
                ? (body as Record<string, unknown>).error as string
                : undefined;
        const message = errorMessage || (typeof body === "string" && body) || `Request failed (${res.status})`;
        throw new BackendError(message, res.status, body, url);
    }

    return body as T;
}

export function getBackendBaseUrl() {
    return backendBaseUrl;
}
