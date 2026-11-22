import 'server-only';

import {
  checkPNRStatus,
  configure,
  fareLookup,
  getAvailability,
  getTrainInfo,
  liveAtStation,
  searchTrainBetweenStations,
  stationByCode,
  stationsByName,
  trackTrain,
} from 'railkit';

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const key = process.env.RAILKIT_API_KEY?.trim();
  if (!key) {
    throw new RailkitConfigError('Train service is not configured');
  }
  configure(key);
  configured = true;
}

export class RailkitConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RailkitConfigError';
  }
}

/** Convert YYYY-MM-DD → DD-MM-YYYY for RailKit. */
export function toRailDate(isoOrRail: string): string {
  const value = isoOrRail.trim();
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) return value;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return value;
}

export async function railSearch(from: string, to: string, date?: string) {
  ensureConfigured();
  return searchTrainBetweenStations(from.toUpperCase(), to.toUpperCase(), date ? toRailDate(date) : undefined);
}

export async function railAvailability(
  trainNo: string,
  from: string,
  to: string,
  date: string,
  coach: string,
  quota = 'GN',
) {
  ensureConfigured();
  return getAvailability(trainNo, from.toUpperCase(), to.toUpperCase(), toRailDate(date), coach, quota);
}

export async function railFare(
  trainNo: string,
  from: string,
  to: string,
  date: string,
  coach: string,
  quota = 'GN',
) {
  ensureConfigured();
  return fareLookup(trainNo, from.toUpperCase(), to.toUpperCase(), toRailDate(date), coach, quota);
}

export async function railPnr(pnr: string) {
  ensureConfigured();
  return checkPNRStatus(pnr.replace(/\D/g, ''));
}

export async function railTrainInfo(trainNumber: string) {
  ensureConfigured();
  return getTrainInfo(trainNumber.replace(/\D/g, ''));
}

export async function railTrack(trainNumber: string, date: string) {
  ensureConfigured();
  return trackTrain(trainNumber.replace(/\D/g, ''), toRailDate(date));
}

export async function railLiveStation(code: string, hours: 2 | 4 | 8 = 2) {
  ensureConfigured();
  return liveAtStation(code.toUpperCase(), hours);
}

export async function railStationsByName(name: string) {
  ensureConfigured();
  return stationsByName(name.trim());
}

export async function railStationByCode(code: string) {
  ensureConfigured();
  return stationByCode(code.toUpperCase());
}
