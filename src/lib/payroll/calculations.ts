import type { SalaryType } from "@/lib/types/employee";

export interface AttendanceCounts {
  present: number;
  half_day: number;
  absent: number;
  leave: number;
}

export interface SalaryCalculationInput {
  salaryType: SalaryType;
  baseSalary: number;
  year: number;
  month: number; // 1 - 12
  attendance: AttendanceCounts;
  advanceDeduction?: number;
  otherDeduction?: number;
}

export interface SalaryCalculationResult {
  workingDays: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  leaveDays: number;
  payableDays: number;
  grossSalary: number;
  attendanceDeduction: number;
  advanceDeduction: number;
  otherDeduction: number;
  netSalary: number;
}

/**
 * Precision-safe currency rounding to 2 decimal places
 */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Returns total days in a given calendar month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Core Isolated Payroll Calculation Engine
 */
export function calculatePayroll(
  input: SalaryCalculationInput
): SalaryCalculationResult {
  const {
    salaryType,
    baseSalary,
    year,
    month,
    attendance,
    advanceDeduction = 0,
    otherDeduction = 0,
  } = input;

  const totalMonthDays = getDaysInMonth(year, month);
  const presentDays = roundCurrency(attendance.present);
  const halfDays = roundCurrency(attendance.half_day);
  const absentDays = roundCurrency(attendance.absent);
  const leaveDays = roundCurrency(attendance.leave);

  // Payable days: 1 day per full present + 0.5 day per half-day
  const payableDays = roundCurrency(presentDays + halfDays * 0.5);

  let grossSalary = 0;
  let attendanceDeduction = 0;

  if (salaryType === "daily") {
    // Daily wage employee: Earnings directly scaled by payable days
    grossSalary = roundCurrency(baseSalary * payableDays);
    attendanceDeduction = 0;
  } else {
    // Monthly fixed salary employee
    grossSalary = roundCurrency(baseSalary);

    // Calculate per-day rate based on calendar days in month
    const dailyRate = roundCurrency(baseSalary / totalMonthDays);
    const unpaidDays = roundCurrency(absentDays + halfDays * 0.5);

    // Deduct only unworked/absent days if attendance has been logged
    const totalRecordedDays = presentDays + halfDays + absentDays + leaveDays;
    if (totalRecordedDays > 0) {
      attendanceDeduction = roundCurrency(dailyRate * unpaidDays);
      // Guarantee deduction does not exceed base salary
      attendanceDeduction = Math.min(grossSalary, attendanceDeduction);
    } else {
      attendanceDeduction = 0;
    }
  }

  // Calculate earnings after attendance adjustments
  const adjustedGross = Math.max(0, grossSalary - attendanceDeduction);

  // Cap advance deduction so net salary cannot become negative
  const safeAdvanceDeduction = Math.min(
    adjustedGross,
    Math.max(0, roundCurrency(advanceDeduction))
  );

  const safeOtherDeduction = Math.min(
    Math.max(0, adjustedGross - safeAdvanceDeduction),
    Math.max(0, roundCurrency(otherDeduction))
  );

  const netSalary = Math.max(
    0,
    roundCurrency(adjustedGross - safeAdvanceDeduction - safeOtherDeduction)
  );

  return {
    workingDays: totalMonthDays,
    presentDays,
    halfDays,
    absentDays,
    leaveDays,
    payableDays,
    grossSalary,
    attendanceDeduction,
    advanceDeduction: safeAdvanceDeduction,
    otherDeduction: safeOtherDeduction,
    netSalary,
  };
}
