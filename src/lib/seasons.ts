/**
 * Seasonal awareness for southern hemisphere (Chile/Latin America).
 * Hypothyroid symptoms worsen in winter due to increased metabolic demand
 * and reduced sunlight (vitamin D synthesis).
 *
 * Southern hemisphere seasons (by month):
 * - Summer:  Dec, Jan, Feb
 * - Autumn:  Mar, Apr, May
 * - Winter:  Jun, Jul, Aug
 * - Spring:  Sep, Oct, Nov
 */

export type Season = "summer" | "autumn" | "winter" | "spring";

export interface SeasonInfo {
  season: Season;
  isWinter: boolean;
  month: number;
}

/**
 * Get the current season for the southern hemisphere.
 * Month is 0-indexed (JS Date convention).
 */
export function getSouthernSeason(date?: Date): SeasonInfo {
  const d = date ?? new Date();
  const month = d.getMonth(); // 0 = Jan

  let season: Season;
  if (month <= 1 || month === 11) {
    season = "summer";
  } else if (month <= 4) {
    season = "autumn";
  } else if (month <= 7) {
    season = "winter";
  } else {
    season = "spring";
  }

  return {
    season,
    isWinter: season === "winter",
    month,
  };
}
