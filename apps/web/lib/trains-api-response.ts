import { NextResponse } from 'next/server';
import { RailkitConfigError } from '@/lib/railkit';

export function trainsJsonOk(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function trainsJsonError(error: unknown, status = 502) {
  if (error instanceof RailkitConfigError) {
    return NextResponse.json({ success: false, message: error.message }, { status: 503 });
  }
  const message = error instanceof Error ? error.message : 'Train request failed';
  const code = status === 502 && /required|valid|Enter/i.test(message) ? 400 : status;
  return NextResponse.json({ success: false, message }, { status: code });
}

/** RailKit often returns HTTP 200 with `{ success: false, error }`. */
export function railkitFailureMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const root = payload as Record<string, unknown>;
  if (root.success === false) {
    const msg = root.error ?? root.message;
    return msg != null && String(msg).trim() ? String(msg) : 'Train service unavailable';
  }
  const nested = root.data;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const inner = nested as Record<string, unknown>;
    if (inner.success === false) {
      const msg = inner.error ?? inner.message;
      return msg != null && String(msg).trim() ? String(msg) : 'Train service unavailable';
    }
  }
  return null;
}

/** Unwrap `{ success: true, data }` or throw when RailKit reports failure. */
export function unwrapRailkit<T = unknown>(payload: unknown): T {
  const failure = railkitFailureMessage(payload);
  if (failure) {
    const err = new Error(friendlyRailkitMessage(failure));
    throw err;
  }
  if (
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    'data' in payload &&
    (payload as { success?: boolean }).success !== false
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function friendlyRailkitMessage(raw: string): string {
  if (/usage limit exceeded/i.test(raw)) {
    return 'Train data quota is used up for this month. Please try again after the RailKit plan resets or is upgraded.';
  }
  return raw;
}
