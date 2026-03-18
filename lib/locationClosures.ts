/**
 * Location-specific closures (early close, special hours, etc.)
 * Wilson Ave closes 3/18/2025 after 3 PM.
 */

export const WILSON_LOCATION_ID = "5PHZ3HJ8ZJCQ0";

type ClosureWindow = {
  date: string; // YYYY-MM-DD
  closedAfterHour: number; // Hour in local time (0-23), e.g. 15 = 3 PM
  closedAfterMinute?: number; // Optional, default 0
};

const CLOSURE_SCHEDULE: Record<string, ClosureWindow[]> = {
  [WILSON_LOCATION_ID]: [
    {
      date: "2025-03-18",
      closedAfterHour: 15, // 3 PM
      closedAfterMinute: 0,
    },
  ],
};

/**
 * Returns true if the location is closed at the given time (default: now).
 * Uses the client's local timezone for the "at" parameter.
 */
export function isLocationClosed(
  locationId: string,
  at: Date = new Date()
): boolean {
  const windows = CLOSURE_SCHEDULE[locationId];
  if (!windows?.length) return false;

  const year = at.getFullYear();
  const month = String(at.getMonth() + 1).padStart(2, "0");
  const day = String(at.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;

  for (const w of windows) {
    if (w.date !== today) continue;

    const closedAfter = new Date(at);
    closedAfter.setHours(w.closedAfterHour, w.closedAfterMinute ?? 0, 0, 0);

    if (at >= closedAfter) return true;
  }

  return false;
}

/**
 * Returns a user-facing message when the location is closed, or null.
 */
export function getLocationClosureMessage(
  locationId: string,
  at: Date = new Date()
): string | null {
  if (!isLocationClosed(locationId, at)) return null;
  return "Wilson Ave is closed today after 3 PM. Please select Solano Ave or order another day.";
}
