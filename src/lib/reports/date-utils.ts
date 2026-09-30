/**
 * Pure synchronous date utilities for reports module
 */

export interface ReportDateRange {
  startDate: string;
  endDate: string;
}

/**
 * Get standard start and end date for the current calendar month
 */
export function getDefaultDateRange(): ReportDateRange {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return {
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  };
}
