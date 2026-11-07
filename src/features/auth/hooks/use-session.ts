'use client';

import { useContext } from 'react';
import { SessionContext, type SessionContextValue } from './session-context';

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession debe usarse dentro de <SessionProvider>.');
  return value;
}
