/**
 * Client-side DB fetch utilities.
 * Database is the single source of truth — no localStorage persistence for data.
 */

import type {
  SessionResponse,
  CheckinResponse,
  CycleResponse,
  UserResponse,
} from "./types";

export async function fetchSessionsFromDb(userId?: string): Promise<SessionResponse[] | null> {
  try {
    const url = userId ? `/api/sessions?userId=${userId}` : "/api/sessions";
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchCheckinsFromDb(userId?: string): Promise<CheckinResponse[] | null> {
  try {
    const url = userId ? `/api/checkins?userId=${userId}` : "/api/checkins";
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchCycleFromDb(userId?: string): Promise<CycleResponse | null> {
  try {
    const url = userId ? `/api/cycle?userId=${userId}` : "/api/cycle";
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchUsers(): Promise<UserResponse[] | null> {
  try {
    const res = await fetch("/api/users");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
