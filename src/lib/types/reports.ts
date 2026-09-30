export interface ReportDateRange {
  startDate: string;
  endDate: string;
}

export interface ReportOverview {
  total_orders: number;
  total_received_weight_kg: number;
  total_printed_weight_kg: number;
  total_delivered_weight_kg: number;
  total_expenses_amount: number;
  total_billed_amount: number;
  total_collected_amount: number;
  total_outstanding_amount: number;
  total_salary_paid_amount: number;
}

export interface ProductionReportRow {
  order_id: string;
  order_number: string;
  order_date: string;
  client_name: string;
  client_code: string;
  number_of_rolls: number;
  received_weight_kg: number;
  printed_weight_kg: number;
  delivered_weight_kg: number;
  remaining_weight_kg: number;
  status: string;
}

export interface ClientReportRow {
  client_id: string;
  client_code: string;
  client_name: string;
  company_name: string | null;
  phone: string | null;
  is_active: boolean;
  orders_count: number;
  received_weight_kg: number;
  printed_weight_kg: number;
  delivered_weight_kg: number;
  total_billed: number;
  total_paid: number;
  outstanding_amount: number;
}

export interface ExpenseCategoryBreakdown {
  category_id: string;
  category_name: string;
  total_amount: number;
  entries_count: number;
  average_amount: number;
}

export interface ExpenseReportItem {
  id: string;
  expense_date: string;
  category_name: string;
  amount: number;
  payment_method: string;
  description: string;
  reference_number: string | null;
  is_void: boolean;
}

export interface ExpenseReportData {
  total_amount: number;
  entries_count: number;
  average_expense: number;
  categories: ExpenseCategoryBreakdown[];
  expenses: ExpenseReportItem[];
}

export interface AttendanceReportRow {
  employee_id: string;
  employee_code: string;
  employee_name: string;
  designation: string | null;
  is_active: boolean;
  salary_type: string;
  present_days: number;
  half_days: number;
  absent_days: number;
  leave_days: number;
  total_marked_days: number;
  attendance_rate: number;
}

export interface SalaryReportRow {
  record_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  payroll_year: number;
  payroll_month: number;
  salary_type: string;
  base_salary: number;
  gross_salary: number;
  attendance_deduction: number;
  advance_deduction: number;
  other_deduction: number;
  net_salary: number;
  paid_amount: number;
  pending_amount: number;
  status: string;
}

export interface AdvanceReportRow {
  advance_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  advance_date: string;
  amount: number;
  settled_amount: number;
  outstanding_amount: number;
  is_settled: boolean;
  payment_method: string;
  reason: string | null;
}

export interface BillingReportRow {
  bill_id: string;
  bill_number: string;
  bill_date: string;
  client_id: string;
  client_name: string;
  client_code: string;
  order_number: string | null;
  billing_type: string;
  gross_amount: number;
  discount_amount: number;
  net_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: string;
}

export interface PaymentReportRow {
  payment_id: string;
  payment_date: string;
  bill_id: string;
  bill_number: string;
  client_id: string;
  client_name: string;
  client_code: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
}

export interface FinancialSummaryData {
  start_date: string;
  end_date: string;
  total_billed: number;
  total_collected: number;
  total_outstanding: number;
  total_expenses: number;
  total_salary_paid: number;
  total_advances_issued: number;
  total_advances_settled: number;
}

export interface ReportFilterParams {
  startDate?: string;
  endDate?: string;
  client_id?: string;
  employee_id?: string;
  category_id?: string;
  status?: string;
  billing_type?: string;
  payment_method?: string;
}
