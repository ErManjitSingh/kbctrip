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
