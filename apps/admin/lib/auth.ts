'use client';

/** Stub — wizard no longer needs Unotrips admin JWT. */
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('kbc_trip_ops_token');
}
