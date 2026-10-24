import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole, StudentProfile, FacultyProfile } from '../types/erp';
import { INITIAL_USERS, INITIAL_STUDENT_PROFILES, INITIAL_FACULTY_PROFILES } from '../services/mockData';
import { ApiError, AuthSession, authApi, sessionStore } from '../services/api';
import { authService } from '../services';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  currentStudentProfile: StudentProfile | null;
  currentFacultyProfile: FacultyProfile | null;
  session: AuthSession | null;
  switchUser: (userId: string) => void;
  login: (loginId: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  availableUsers: User[];
  isDemoMode: boolean;
  isValidatingSession: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'smart_campus_auth_user_id';
const USE_API = import.meta.env.VITE_API_MODE !== 'mock';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => sessionStore.get());
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) || 'unauthenticated';
  });
  const [isValidatingSession, setIsValidatingSession] = useState<boolean>(
    () => USE_API && !!sessionStore.get()
  );

  const currentUser =
    session?.user ||
    (!USE_API && currentUserId !== 'unauthenticated'
      ? INITIAL_USERS.find((u) => u.id === currentUserId) || null
      : null);

  const currentRole: UserRole = currentUser ? currentUser.role : 'STUDENT';

  const currentStudentProfile =
    currentUser?.role === 'STUDENT'
      ? session?.studentProfile ||
        (!USE_API && !session
          ? INITIAL_STUDENT_PROFILES.find((s) => s.userId === currentUser.id) || null
          : null)
      : null;

  const currentFacultyProfile =
    currentUser?.role === 'FACULTY'
      ? session?.facultyProfile ||
        (!USE_API && !session
          ? INITIAL_FACULTY_PROFILES.find((f) => f.userId === currentUser.id) || null
          : null)
      : null;

  useEffect(() => {
    return sessionStore.subscribe((next) => {
      setSession(next);
      if (next) {
        setCurrentUserId(next.user.id);
        localStorage.setItem(AUTH_STORAGE_KEY, next.user.id);
      } else {
        setCurrentUserId('unauthenticated');
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    });
  }, []);

  useEffect(() => {
    if (!USE_API) {
      setIsValidatingSession(false);
      return;
    }

    const stored = sessionStore.get();
    if (!stored) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setCurrentUserId('unauthenticated');
      setIsValidatingSession(false);
      return;
    }

    let active = true;
    setIsValidatingSession(true);
    authApi
      .me()
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          sessionStore.clear();
        }
      })
      .finally(() => {
        if (active) setIsValidatingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const switchUser = (userId: string) => {
    const storedSession = sessionStore.get();
    setSession(storedSession?.user.id === userId ? storedSession : null);
    setCurrentUserId(userId);
    localStorage.setItem(AUTH_STORAGE_KEY, userId);
  };

  const login = (loginId: string, password?: string): { success: boolean; error?: string } => {
    const user = INITIAL_USERS.find(
      (u) =>
        u.loginId.toLowerCase() === loginId.trim().toLowerCase() ||
        u.email.toLowerCase() === loginId.trim().toLowerCase()
    );
    if (!user) {
      return { success: false, error: 'User account not found. Please verify your login ID or select a demo account.' };
    }
    if (user.status === 'INACTIVE') {
      return { success: false, error: 'Account is currently deactivated. Contact the Office of the Registrar.' };
    }

    const expectedPassword =
      user.role === 'ADMIN'
        ? 'admin123'
        : user.role === 'FACULTY'
        ? 'faculty123'
        : 'student123';

    if (password && password.trim() !== '' && password !== expectedPassword && password !== 'demo123') {
      return {
        success: false,
        error: `Invalid password. For this demo persona (${user.loginId}), use password "${expectedPassword}".`,
      };
    }

    switchUser(user.id);
    return { success: true };
  };

  const logout = () => {
    setSession(null);
    setCurrentUserId('unauthenticated');
    localStorage.removeItem(AUTH_STORAGE_KEY);
    void authService.logout().catch(() => {
      sessionStore.clear();
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        currentStudentProfile,
        currentFacultyProfile,
        session,
        switchUser,
        login,
        logout,
        availableUsers: USE_API ? [] : INITIAL_USERS,
        isDemoMode: !USE_API && !session,
        isValidatingSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
