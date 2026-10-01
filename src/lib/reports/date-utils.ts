/**
 * Pure synchronous date utilities for reports and dashboard modules
 */

export interface ReportDateRange {
  startDate: string;
  endDate: string;
}

export type DatePreset =
  | "today"
  | "this_week"
  | "this_month"
  | "last_month"
  | "last_30_days"
  | "this_year"
  | "custom";

/**
 * Format Date object to YYYY-MM-DD
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get date range for standard presets
 */
export function getDatePresetRange(preset: DatePreset): ReportDateRange {
  const now = new Date();

  switch (preset) {
    case "today": {
      const todayStr = formatDateToYYYYMMDD(now);
      return { startDate: todayStr, endDate: todayStr };
    }
    case "this_week": {
      const day = now.getDay();
      // Monday as start of week (in JS 0 = Sunday)
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now);
      monday.setDate(diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        startDate: formatDateToYYYYMMDD(monday),
        endDate: formatDateToYYYYMMDD(sunday),
      };
    }
    case "last_month": {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const year = prevMonth.getFullYear();
      const month = String(prevMonth.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(year, prevMonth.getMonth() + 1, 0).getDate();
      return {
        startDate: `${year}-${month}-01`,
        endDate: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
      };
    }
    case "last_30_days": {
      const thirtyDaysAgo = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      return {
        startDate: formatDateToYYYYMMDD(thirtyDaysAgo),
        endDate: formatDateToYYYYMMDD(now),
      };
    }
    case "this_year": {
      const year = now.getFullYear();
      return {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
      };
    }
    case "this_month":
    default: {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      return {
        startDate: `${year}-${month}-01`,
        endDate: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
      };
    }
  }
}

/**
 * Get standard start and end date for the current calendar month
 */
export function getDefaultDateRange(): ReportDateRange {
  return getDatePresetRange("this_month");
}
