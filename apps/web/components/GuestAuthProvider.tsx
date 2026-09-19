'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getGuestMe, type GuestProfile } from '../lib/booking-api';
import { clearGuestToken, getGuestToken, setGuestToken } from '../lib/guest-session';

type GuestAuthValue = {
  ready: boolean;
  guest: GuestProfile | null;
  token: string | null;
  signIn: (token: string, guest: GuestProfile) => void;
  signOut: () => void;
};

const GuestAuthContext = createContext<GuestAuthValue>({
  ready: false,
  guest: null,
  token: null,
  signIn: () => undefined,
  signOut: () => undefined,
});

export function GuestAuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = getGuestToken();
    if (!stored) {
      setReady(true);
      return;
    }
    void getGuestMe(stored).then((profile) => {
      if (profile) {
        setToken(stored);
        setGuest(profile);
      } else {
        clearGuestToken();
      }
      setReady(true);
    });
  }, []);

  const value = useMemo<GuestAuthValue>(
    () => ({
      ready,
      guest,
      token,
      signIn: (nextToken, nextGuest) => {
        setGuestToken(nextToken);
        setToken(nextToken);
        setGuest(nextGuest);
      },
      signOut: () => {
        clearGuestToken();
        setToken(null);
        setGuest(null);
      },
    }),
    [guest, ready, token]
  );

  return <GuestAuthContext.Provider value={value}>{children}</GuestAuthContext.Provider>;
}

export const useGuestAuth = () => useContext(GuestAuthContext);
