/**
 * Client-side DB fetch utilities.
 * Database is the single source of truth — no localStorage persistence for data.
 */

import type {
  SessionResponse,
  CheckinResponse,
  CycleResponse,
  CyclePhaseResponse,
  UserResponse,
  PaginatedResponse,
} from "./types";

const PAGE_SIZE = 100;

/**
 * Fetch all pages from a paginated endpoint, accumulating results until
 * the returned page contains fewer items than the limit.
 */
async function fetchAllPages<T>(baseUrl: string): Promise<T[] | null> {
  try {
    const all: T[] = [];
    let offset = 0;

    for (;;) {
      const separator = baseUrl.includes("?") ? "&" : "?";
      const url = `${baseUrl}${separator}limit=${PAGE_SIZE}&offset=${offset}`;
      const res = await fetch(url);
      if (!res.ok) return null;

      const page: PaginatedResponse<T> = await res.json();
      all.push(...page.data);

      if (page.data.length < page.limit || all.length >= page.total) {
        break;
      }
      offset += page.limit;
    }

    return all;
  } catch {
    return null;
  }
}

export async function fetchSessionsFromDb(userId?: string): Promise<SessionResponse[] | null> {
  const url = userId ? `/api/sessions?userId=${userId}` : "/api/sessions";
  return fetchAllPages<SessionResponse>(url);
}

export async function fetchCheckinsFromDb(userId?: string): Promise<CheckinResponse[] | null> {
  const url = userId ? `/api/checkins?userId=${userId}` : "/api/checkins";
  return fetchAllPages<CheckinResponse>(url);
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

export async function fetchCyclePhaseFromDb(userId?: string): Promise<CyclePhaseResponse | null> {
  try {
    const url = userId ? `/api/cycle-phase?userId=${userId}` : "/api/cycle-phase";
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
