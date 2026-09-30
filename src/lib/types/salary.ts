import type { Employee, SalaryType } from "./employee";

export type SalaryStatus = "pending" | "partially_paid" | "paid";

export type SalaryPaymentMethod = "cash" | "bank" | "upi" | "other";

export interface SalaryRecord {
  id: string;
  employee_id: string;
  payroll_year: number;
  payroll_month: number;
  salary_type: SalaryType;
  base_salary: number;
  working_days: number;
  present_days: number;
  half_days: number;
  absent_days: number;
  leave_days: number;
  payable_days: number;
  attendance_deduction: number;
  advance_deduction: number;
  other_deduction: number;
  gross_salary: number;
  net_salary: number;
  paid_amount: number;
  pending_amount: number;
  status: SalaryStatus;
  payment_date: string | null;
  payment_method: SalaryPaymentMethod | null;
  payment_reference: string | null;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalaryRecordWithEmployee extends SalaryRecord {
  employee: Employee;
  payments?: SalaryPayment[];
}

export interface SalaryAdvance {
  id: string;
  employee_id: string;
  advance_date: string;
  amount: number;
  reason: string | null;
  payment_method: SalaryPaymentMethod;
  reference_number: string | null;
  notes: string | null;
  is_settled: boolean;
  settled_amount: number;
  settled_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalaryAdvanceWithEmployee extends SalaryAdvance {
  employee: Employee;
}

export interface SalaryPayment {
  id: string;
  salary_record_id: string;
  payment_date: string;
  amount: number;
  payment_method: SalaryPaymentMethod;
  reference_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PayrollSummary {
  payroll_year: number;
  payroll_month: number;
  total_employees: number;
  total_gross_salary: number;
  total_net_salary: number;
  total_paid_amount: number;
  total_pending_amount: number;
  total_advances_amount: number;
  paid_records_count: number;
  pending_records_count: number;
  partially_paid_count: number;
}

export interface SalaryFilters {
  year: number;
  month: number;
  employee_id?: string;
  status?: SalaryStatus | "all";
}

export interface AdvanceFilters {
  employee_id?: string;
  is_settled?: boolean | "all";
  startDate?: string;
  endDate?: string;
}

export interface EmployeeAdvanceSummary {
  total_advances: number;
  settled_advances: number;
  outstanding_balance: number;
  active_advances_count: number;
}
