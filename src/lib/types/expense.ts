export type ExpensePaymentMethod = "cash" | "bank" | "upi" | "other";

export interface ExpenseCategory {
  id: string;
  name_en: string;
  name_ta: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  expense_date: string;
  category_id: string;
  amount: number;
  description: string | null;
  payment_method: ExpensePaymentMethod;
  reference_number: string | null;
  notes: string | null;
  is_void: boolean;
  void_reason: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseWithCategory extends Expense {
  category: ExpenseCategory;
}

export interface ExpenseFilters {
  query?: string;
  category_id?: string;
  payment_method?: ExpensePaymentMethod | "all";
  status?: "all" | "active" | "void";
  startDate?: string;
  endDate?: string;
  sortBy?: "expense_date" | "amount" | "created_at";
  sortOrder?: "asc" | "desc";
}

export interface CategoryExpenseSummary {
  category_id: string;
  name_en: string;
  name_ta: string;
  total_amount: number;
  count: number;
}

export interface ExpenseSummary {
  total_active_amount: number;
  today_amount: number;
  this_month_amount: number;
  total_count: number;
  active_count: number;
  void_count: number;
  category_breakdown: CategoryExpenseSummary[];
}
