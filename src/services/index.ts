import { INITIAL_USERS } from '../data/mockData';
import { User, UserRole } from '../types/erp';
import { ApiError, AuthSession, authApi, sessionStore } from './api';

export interface DemoAccount {
  role: UserRole;
  roleTitle: string;
  loginId: string;
  passwordHint: string;
  description: string;
  isAtRisk?: boolean;
}

export interface AuthLoginParams {
  role: UserRole;
  loginId: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: AuthSession;
  error?: string;
}

const USE_API = import.meta.env.VITE_API_MODE !== 'mock';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'ADMIN',
    roleTitle: 'Administrator',
    loginId: 'admin',
    passwordHint: 'admin123',
    description: 'Manage students, faculty, academics, results, and announcements.',
  },
  {
    role: 'FACULTY',
    roleTitle: 'Faculty',
    loginId: 'prof.rajesh',
    passwordHint: 'faculty123',
    description: 'Mark attendance, enter marks, and respond to complaints for your sections.',
  },
  {
    role: 'STUDENT',
    roleTitle: 'Student',
    loginId: '21cs101',
    passwordHint: 'student123',
    description: 'View your timetable, attendance, results, and complaints.',
  },
];

export const formatRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'FACULTY':
      return 'Faculty';
    case 'STUDENT':
      return 'Student';
    default:
      return role;
  }
};

/**
 * Single entrypoint for authentication requests with simulated network latency.
 */
export const authService = {
  getDemoAccounts: (): DemoAccount[] => {
    const isDemoTools = import.meta.env.VITE_DEMO_TOOLS === 'true';
    if (isDemoTools) {
      return [
        ...DEMO_ACCOUNTS,
        {
          role: 'STUDENT',
          roleTitle: 'Student (At-risk test)',
          loginId: '21cs104',
          passwordHint: 'student123',
          description: 'At-risk attendance trigger test account (<75%).',
          isAtRisk: true,
        },
      ];
    }
    return DEMO_ACCOUNTS;
  },

  login: async ({ role, loginId, password }: AuthLoginParams): Promise<AuthResponse> => {
    if (USE_API) {
      try {
        const session = await authApi.login(role, loginId.trim(), password || '');
        return { success: true, user: session.user, session };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof ApiError
              ? error.message
              : 'Unable to sign in. Please try again.',
        };
      }
    }

    // Simulated network latency (300-600ms)
    await new Promise((resolve) => setTimeout(resolve, 400));

    const cleanId = loginId.trim().toLowerCase();
    const cleanPw = password?.trim() || '';

    const user = INITIAL_USERS.find(
      (u) =>
        u.loginId.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    if (!user) {
      return {
        success: false,
        error: 'The login ID or password is incorrect.',
      };
    }

    const expectedPassword =
      user.role === 'ADMIN'
        ? 'admin123'
        : user.role === 'FACULTY'
        ? 'faculty123'
        : 'student123';

    if (cleanPw !== expectedPassword && cleanPw !== 'demo123') {
      return {
        success: false,
        error: 'The login ID or password is incorrect.',
      };
    }

    // Role check: If entered credentials belong to a different role than selected
    if (user.role !== role) {
      const actualRoleName = formatRoleLabel(user.role);
      const article = actualRoleName.startsWith('A') ? 'an' : 'a';
      return {
        success: false,
        error: `This account is ${article} ${actualRoleName} account. Select ${actualRoleName} to continue.`,
      };
    }

    return {
      success: true,
      user,
    };
  },

  logout: async (): Promise<void> => {
    if (USE_API) {
      await authApi.logout();
      return;
    }
    sessionStore.clear();
  },
};
