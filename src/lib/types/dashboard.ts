export interface DashboardKpis {
  total_billed_amount: number;
  total_collected_amount: number;
  total_outstanding_amount: number;
  total_expenses_amount: number;
  salary_payable_amount: number;
  production_printed_weight_kg: number;
  production_delivered_weight_kg: number;
  active_orders_count: number;
  active_clients_count: number;
}

export interface RevenueCollectionTrendPoint {
  date_label: string;
  billed: number;
  collected: number;
}

export interface DashboardExpenseCategory {
  category_id: string;
  name_en: string;
  name_ta: string;
  amount: number;
  percentage: number;
  entries_count: number;
}

export interface DashboardProductionSummary {
  received_weight_kg: number;
  printed_weight_kg: number;
  delivered_weight_kg: number;
  remaining_weight_kg: number;
  active_orders_count: number;
  completed_orders_count: number;
}

export interface DashboardOutstandingClient {
  client_id: string;
  client_name: string;
  client_code: string;
  company_name: string | null;
  phone: string | null;
  total_billed: number;
  total_paid: number;
  outstanding_amount: number;
  bills_count: number;
}

export interface DashboardRecentPayment {
  payment_id: string;
  bill_id: string;
  bill_number: string;
  client_id: string;
  client_name: string;
  client_code: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number: string | null;
}

export type ActivityType = "order" | "production" | "delivery" | "payment" | "expense";

export interface DashboardRecentActivity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  amount_or_weight?: string;
  timestamp: string;
  link?: string;
}

export interface DashboardData {
  kpis: DashboardKpis;
  chart: RevenueCollectionTrendPoint[];
  expenses: {
    total_amount: number;
    categories: DashboardExpenseCategory[];
  };
  production: DashboardProductionSummary;
  outstanding_clients: DashboardOutstandingClient[];
  recent_payments: DashboardRecentPayment[];
  recent_activities: DashboardRecentActivity[];
}

export interface DashboardFilterParams {
  startDate: string;
  endDate: string;
  preset?: string;
}
