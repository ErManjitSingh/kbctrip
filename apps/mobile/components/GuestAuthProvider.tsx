import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getGuestMe, type GuestProfile } from '../lib/booking-api';
import { clearGuestToken, getGuestToken, setGuestToken } from '../lib/guest-session';

type GuestAuthValue = {
  ready: boolean;
  guest: GuestProfile | null;
  token: string | null;
  signIn: (token: string, guest: GuestProfile) => Promise<void>;
  signOut: () => Promise<void>;
};

const GuestAuthContext = createContext<GuestAuthValue>({
  ready: false,
  guest: null,
  token: null,
  signIn: async () => undefined,
  signOut: async () => undefined,
});

export function GuestAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const stored = await getGuestToken();
      if (!stored) {
        setReady(true);
        return;
      }
      const profile = await getGuestMe(stored);
      if (profile) {
        setToken(stored);
        setGuest(profile);
      } else {
        await clearGuestToken();
      }
      setReady(true);
    })();
  }, []);

  const value = useMemo<GuestAuthValue>(
    () => ({
      ready,
      guest,
      token,
      signIn: async (nextToken, nextGuest) => {
        await setGuestToken(nextToken);
        setToken(nextToken);
        setGuest(nextGuest);
      },
      signOut: async () => {
        await clearGuestToken();
        setToken(null);
        setGuest(null);
      },
    }),
    [guest, ready, token],
  );

  return <GuestAuthContext.Provider value={value}>{children}</GuestAuthContext.Provider>;
}

export const useGuestAuth = () => useContext(GuestAuthContext);
