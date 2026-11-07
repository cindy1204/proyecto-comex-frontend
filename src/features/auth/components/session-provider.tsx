'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { SESSION_EXPIRED_EVENT } from '../../common/config';
import type { AuthUser } from '../../common/domain/session';
import { useIsClient } from '../../common/hooks/use-is-client';
import { tokenStorage } from '../../common/services/token.storage';
import type { AuthResult, SessionEnd } from '../domain/auth';
import { SessionContext, type SessionContextValue } from '../hooks/session-context';
import * as authService from '../services/auth.service';

/**
 * Dueño del estado de sesión. La fuente de verdad es `tokenStorage` (localStorage + cookies):
 * al montar rehidrata el usuario guardado y lo valida contra `/auth/me`.
 */
export function SessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const session = useSyncExternalStore(tokenStorage.subscribe, tokenStorage.getSession, () => null);
  const isClient = useIsClient();
  const [validatedToken, setValidatedToken] = useState<string | null>(null);
  const [sessionEnd, setSessionEnd] = useState<SessionEnd | null>(null);

  const token = session?.token ?? null;

  useEffect(() => {
    const onExpired = () => setSessionEnd('expired');
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  useEffect(() => {
    if (!token || validatedToken === token) return;
    const stored = tokenStorage.getSession();
    if (stored && stored.expiresAt <= Date.now()) {
      tokenStorage.expire();
      return;
    }
    const controller = new AbortController();
    authService
      .getCurrentUser(controller.signal)
      .then((user) => {
        if (controller.signal.aborted) return;
        tokenStorage.updateUser(user);
        setValidatedToken(token);
      })
      .catch(() => {
        // Un 401 ya cerró la sesión en `apiRequest`; ante fallos de red se conserva la sesión local.
        if (!controller.signal.aborted) setValidatedToken(token);
      });
    return () => controller.abort();
  }, [token, validatedToken]);

  const startSession = useCallback(({ token: newToken, user }: AuthResult): AuthUser => {
    tokenStorage.save(newToken, user);
    setValidatedToken(newToken);
    setSessionEnd(null);
    return user;
  }, []);

  const login = useCallback<SessionContextValue['login']>(
    async (credentials) => startSession(await authService.login(credentials)),
    [startSession],
  );

  const register = useCallback<SessionContextValue['register']>(
    async (payload) => startSession(await authService.register(payload)),
    [startSession],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setSessionEnd('logout');
  }, []);

  const isLoading = !isClient || (token !== null && validatedToken !== token);
  const user = session?.user ?? null;

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'admin',
      isLoading,
      isSessionLoaded: !isLoading,
      sessionEnd,
      login,
      register,
      logout,
    }),
    [user, isLoading, sessionEnd, login, register, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
