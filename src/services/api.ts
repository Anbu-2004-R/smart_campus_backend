import { FacultyProfile, StudentProfile, User, UserRole } from '../types/erp';

export const API_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:8080/api/v1';

const SESSION_KEY = 'smart_campus_session_v1';

export interface AuthSession {
  token: string;
  user: User;
  studentProfile?: StudentProfile;
  facultyProfile?: FacultyProfile;
  expiresAt?: number;
}

interface LoginApiResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  user: User;
  studentProfile?: StudentProfile;
  facultyProfile?: FacultyProfile;
}

interface MeApiResponse {
  user: User;
  studentProfile?: StudentProfile;
  facultyProfile?: FacultyProfile;
  unreadNotifications: number;
}

interface DemoAccountApiResponse {
  role: UserRole;
  roleTitle: string;
  loginId: string;
  passwordHint: string;
  description: string;
  atRisk: boolean;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const sessionListeners = new Set<(session: AuthSession | null) => void>();

const notifySession = (session: AuthSession | null) => {
  sessionListeners.forEach((listener) => listener(session));
};

export const sessionStore = {
  get(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as AuthSession;
      if (!session?.token || !session?.user) return null;
      if (session.expiresAt && session.expiresAt <= Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        notifySession(null);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  set(session: AuthSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    notifySession(session);
  },

  clear() {
    localStorage.removeItem(SESSION_KEY);
    notifySession(null);
  },

  subscribe(listener: (session: AuthSession | null) => void) {
    sessionListeners.add(listener);
    return () => {
      sessionListeners.delete(listener);
    };
  },
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const session = sessionStore.get();
  if (options.auth !== false && session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError('Unable to reach the campus server. Check that the backend is running.', 0);
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // Keep the status-based message when the body is not JSON.
    }
    if (response.status === 401) {
      sessionStore.clear();
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError('The campus server returned an invalid response.', response.status);
  }
}

export const authApi = {
  async login(role: UserRole, loginId: string, password: string): Promise<AuthSession> {
    const response = await apiRequest<LoginApiResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { role, loginId, password },
    });
    const session: AuthSession = {
      token: response.token,
      user: response.user,
      studentProfile: response.studentProfile,
      facultyProfile: response.facultyProfile,
      expiresAt: Date.now() + response.expiresInSeconds * 1000,
    };
    sessionStore.set(session);
    return session;
  },

  async me(): Promise<AuthSession> {
    const current = sessionStore.get();
    if (!current?.token) {
      throw new ApiError('No active session.', 401);
    }
    const response = await apiRequest<MeApiResponse>('/auth/me');
    const session: AuthSession = {
      token: current.token,
      user: response.user,
      studentProfile: response.studentProfile,
      facultyProfile: response.facultyProfile,
      expiresAt: current.expiresAt,
    };
    sessionStore.set(session);
    return session;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<void>('/auth/logout', { method: 'POST' });
    } finally {
      sessionStore.clear();
    }
  },

  async demoAccounts(): Promise<DemoAccountApiResponse[]> {
    return apiRequest<DemoAccountApiResponse[]>('/auth/demo-accounts', { auth: false });
  },

  async activate(token: string, password: string): Promise<User> {
    return apiRequest<User>('/auth/activate', {
      method: 'POST',
      auth: false,
      body: { token, password },
    });
  },
};
