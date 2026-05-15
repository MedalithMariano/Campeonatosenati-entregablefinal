const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";
const TOKEN_KEY = "auth_token";

export type UserRole = "ADMIN" | "USER";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
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

export type DocumentType = "DNI" | "CE" | "PASAPORTE" | "RUC";
export type PlayerPosition = "GK" | "DEF" | "MID" | "FWD";
export type PreferredFoot = "LEFT" | "RIGHT" | "BOTH";

export interface Team {
  id: string;
  name: string;
  shortName: string | null;
  city: string | null;
  foundedYear: number | null;
  primaryColor: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  position: PlayerPosition;
  preferredFoot: PreferredFoot | null;
  nationality: string | null;
  photoUrl: string | null;
  photoPublicId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export type TournamentFormat = "LEAGUE" | "KNOCKOUT" | "GROUPS_KNOCKOUT";
export type TournamentStatus =
  | "DRAFT"
  | "REGISTRATION"
  | "IN_PROGRESS"
  | "FINISHED";
export type RegistrationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";

export interface Tournament {
  id: string;
  name: string;
  season: string;
  format: TournamentFormat;
  status: TournamentStatus;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  minPlayersPerRoster: number;
  maxPlayersPerRoster: number;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  bannerUrl: string | null;
  bannerPublicId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTournamentPayload {
  name: string;
  season: string;
  format: TournamentFormat;
  status?: TournamentStatus;
  pointsWin?: number;
  pointsDraw?: number;
  pointsLoss?: number;
  minPlayersPerRoster?: number;
  maxPlayersPerRoster?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  bannerUrl?: string;
  bannerPublicId?: string;
}

export type UpdateTournamentPayload = Partial<CreateTournamentPayload>;

export interface TournamentTeam {
  id: string;
  tournamentId: string;
  teamId: string;
  status: RegistrationStatus;
  groupId: string | null;
  registeredAt: string;
  team?: Team;
}

export interface RosterEntry {
  id: string;
  tournamentId: string;
  teamId: string;
  playerId: string;
  shirtNumber: number;
  createdAt: string;
  player?: Player;
}

export interface RosterValidation {
  count: number;
  min: number;
  max: number;
  belowMin: boolean;
  aboveMax: boolean;
}

export interface CreateTeamPayload {
  name: string;
  shortName?: string;
  city?: string;
  foundedYear?: number;
  primaryColor?: string;
  logoUrl?: string;
  logoPublicId?: string;
}

export type UpdateTeamPayload = Partial<CreateTeamPayload>;

export interface CreatePlayerPayload {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  position: PlayerPosition;
  preferredFoot?: PreferredFoot;
  nationality?: string;
  photoUrl?: string;
  photoPublicId?: string;
}

export type UpdatePlayerPayload = Partial<CreatePlayerPayload>;

export class ApiError extends Error {
  constructor(
    public status: number,
    public messages: string[],
  ) {
    super(messages.join(" · "));
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
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

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
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
      headers: authHeader(token),
      body: JSON.stringify(payload),
    });
  },

  // ---- Teams ----
  listTeams() {
    return request<Team[]>("/teams");
  },

  getTeam(id: string) {
    return request<Team>(`/teams/${id}`);
  },

  createTeam(token: string, payload: CreateTeamPayload) {
    return request<Team>("/teams", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(payload),
    });
  },

  updateTeam(token: string, id: string, payload: UpdateTeamPayload) {
    return request<Team>(`/teams/${id}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(payload),
    });
  },

  deleteTeam(token: string, id: string) {
    return request<null>(`/teams/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },

  // ---- Players ----
  listPlayers() {
    return request<Player[]>("/players");
  },

  getPlayer(id: string) {
    return request<Player>(`/players/${id}`);
  },

  createPlayer(token: string, payload: CreatePlayerPayload) {
    return request<Player>("/players", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(payload),
    });
  },

  updatePlayer(token: string, id: string, payload: UpdatePlayerPayload) {
    return request<Player>(`/players/${id}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(payload),
    });
  },

  deletePlayer(token: string, id: string) {
    return request<null>(`/players/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },

  // ---- Uploads ----
  uploadImage(
    token: string,
    file: File,
    folder: "teams" | "players" | "tournaments",
  ) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    return request<UploadedImage>("/uploads/image", {
      method: "POST",
      headers: authHeader(token),
      body: fd,
    });
  },

  // ---- Tournaments ----
  listTournaments() {
    return request<Tournament[]>("/tournaments");
  },

  getTournament(id: string) {
    return request<Tournament>(`/tournaments/${id}`);
  },

  createTournament(token: string, payload: CreateTournamentPayload) {
    return request<Tournament>("/tournaments", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(payload),
    });
  },

  updateTournament(
    token: string,
    id: string,
    payload: UpdateTournamentPayload,
  ) {
    return request<Tournament>(`/tournaments/${id}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(payload),
    });
  },

  deleteTournament(token: string, id: string) {
    return request<null>(`/tournaments/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },

  // ---- Registrations ----
  listRegistrations(tournamentId: string) {
    return request<TournamentTeam[]>(`/tournaments/${tournamentId}/teams`);
  },

  registerTeam(token: string, tournamentId: string, teamId: string) {
    return request<TournamentTeam>(`/tournaments/${tournamentId}/teams`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ teamId }),
    });
  },

  unregisterTeam(token: string, tournamentId: string, teamId: string) {
    return request<null>(`/tournaments/${tournamentId}/teams/${teamId}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },

  // ---- Roster ----
  listRoster(tournamentId: string, teamId: string) {
    return request<RosterEntry[]>(
      `/tournaments/${tournamentId}/teams/${teamId}/roster`,
    );
  },

  validateRoster(tournamentId: string, teamId: string) {
    return request<RosterValidation>(
      `/tournaments/${tournamentId}/teams/${teamId}/roster/validate`,
    );
  },

  addRosterEntry(
    token: string,
    tournamentId: string,
    teamId: string,
    payload: { playerId: string; shirtNumber: number },
  ) {
    return request<RosterEntry>(
      `/tournaments/${tournamentId}/teams/${teamId}/roster`,
      {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify(payload),
      },
    );
  },

  updateRosterEntry(
    token: string,
    tournamentId: string,
    teamId: string,
    playerId: string,
    shirtNumber: number,
  ) {
    return request<RosterEntry>(
      `/tournaments/${tournamentId}/teams/${teamId}/roster/${playerId}`,
      {
        method: "PATCH",
        headers: authHeader(token),
        body: JSON.stringify({ shirtNumber }),
      },
    );
  },

  removeRosterEntry(
    token: string,
    tournamentId: string,
    teamId: string,
    playerId: string,
  ) {
    return request<null>(
      `/tournaments/${tournamentId}/teams/${teamId}/roster/${playerId}`,
      {
        method: "DELETE",
        headers: authHeader(token),
      },
    );
  },
};

interface JwtClaims {
  sub: string;
  email: string;
  role: UserRole;
  exp?: number;
}

function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

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
  getUser(): AuthUser | null {
    const token = this.getToken();
    if (!token) return null;
    const claims = decodeJwt(token);
    if (!claims) return null;
    if (claims.exp && claims.exp * 1000 < Date.now()) {
      this.clearToken();
      return null;
    }
    return { id: claims.sub, email: claims.email, role: claims.role };
  },
  isAdmin(): boolean {
    return this.getUser()?.role === "ADMIN";
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
  requireAdmin(loginPath = "/login", forbiddenPath = "/"): string | null {
    const token = this.requireAuth(loginPath);
    if (!token) return null;
    if (!this.isAdmin()) {
      window.location.href = forbiddenPath;
      return null;
    }
    return token;
  },
};

const CLOUDINARY_BASE = "/upload/";

export function cloudinaryUrl(
  url: string | null | undefined,
  transform: string,
): string | null {
  if (!url) return null;
  const idx = url.indexOf(CLOUDINARY_BASE);
  if (idx === -1) return url;
  const insertAt = idx + CLOUDINARY_BASE.length;
  return `${url.slice(0, insertAt)}${transform}/${url.slice(insertAt)}`;
}
