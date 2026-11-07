'use client';

import { createContext } from 'react';
import type { AuthUser } from '../../common/domain/session';
import type { LoginCredentials, RegisterPayload, SessionEnd } from '../domain/auth';

export interface SessionContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** `true` mientras se rehidrata y valida la sesión guardada (`/auth/me`). */
  isLoading: boolean;
  /** Inverso de `isLoading`: ya se sabe con certeza si hay usuario. */
  isSessionLoaded: boolean;
  /** Motivo por el que terminó la sesión anterior (`null` si nunca hubo cierre). */
  sessionEnd: SessionEnd | null;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);
