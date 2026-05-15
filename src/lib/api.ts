const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";
const TOKEN_KEY = "auth_token";

export interface AuthUser {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  documentType: "DNI" | "CE" | "PASAPORTE" | "RUC";
  documentNumber: string;
  phone: string | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeResponse extends AuthUser {
  profile: Profile | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  documentType: Profile["documentType"];
  documentNumber: string;
  phone?: string;
  birthDate?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  birthDate?: string | null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public messages: string[],
  ) {
    super(messages.join(" · "));
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, ["No se pudo conectar al servidor"]);
  }

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const raw = body?.message;
    const messages = Array.isArray(raw)
      ? raw
      : [raw ?? `Error ${response.status}`];
    throw new ApiError(response.status, messages);
  }

  return body as T;
}

export const api = {
  login(payload: LoginPayload) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  register(payload: RegisterPayload) {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  me(token: string) {
    return request<MeResponse>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateMe(token: string, payload: UpdateProfilePayload) {
    return request<MeResponse>("/auth/me", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },
};

export const auth = {
  saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
  redirectIfAuthenticated(target = "/me") {
    if (this.getToken()) window.location.href = target;
  },
  requireAuth(loginPath = "/login"): string | null {
    const token = this.getToken();
    if (!token) {
      window.location.href = loginPath;
      return null;
    }
    return token;
  },
};
