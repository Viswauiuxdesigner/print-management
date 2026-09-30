import type { Client } from "./client";
import type { Order } from "./order";

export type BillingType = "kg" | "fixed" | "mixed";

export type BillStatus = "unpaid" | "partially_paid" | "paid" | "cancelled";

export type PaymentMethod = "cash" | "bank" | "upi" | "other";

export interface ClientBill {
  id: string;
  client_id: string;
  order_id: string | null;
  bill_number: string;
  bill_date: string;
  billing_type: BillingType;
  billable_weight_kg: number | null;
  rate_per_kg: number | null;
  fixed_amount: number | null;
  additional_amount: number;
  gross_amount: number;
  discount_amount: number;
  net_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: BillStatus;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientBillWithDetails extends ClientBill {
  client: Client;
  order?: Order | null;
  payments?: ClientPayment[];
}

export interface ClientPayment {
  id: string;
  bill_id: string;
  client_id: string;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ClientPaymentWithDetails extends ClientPayment {
  client?: Client;
  bill?: ClientBill;
}

export interface BillingSummary {
  total_bills_count: number;
  total_billed_amount: number;
  total_paid_amount: number;
  total_outstanding_amount: number;
  unpaid_bills_count: number;
  partially_paid_bills_count: number;
  paid_bills_count: number;
}

export interface OutstandingClient {
  client_id: string;
  client_code: string;
  client_name: string;
  company_name: string | null;
  phone: string | null;
  total_billed: number;
  total_paid: number;
  outstanding_amount: number;
  bills_count: number;
  latest_bill_date: string | null;
}

export interface BillFilters {
  query?: string;
  client_id?: string;
  status?: BillStatus | "all";
  billing_type?: BillingType | "all";
  startDate?: string;
  endDate?: string;
}

export interface PaymentFilters {
  query?: string;
  client_id?: string;
  bill_id?: string;
  payment_method?: PaymentMethod | "all";
  startDate?: string;
  endDate?: string;
}

export interface ClientBillingSummary {
  total_billed: number;
  total_paid: number;
  outstanding_amount: number;
  total_bills_count: number;
  unpaid_bills_count: number;
}
