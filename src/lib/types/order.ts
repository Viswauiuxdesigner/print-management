import type { Client } from "./client";

export type OrderStatus =
  | "received"
  | "processing"
  | "printing"
  | "completed"
  | "delivered"
  | "cancelled";

export type RollStatus = "pending" | "printing" | "printed" | "delivered";

export interface Order {
  id: string;
  client_id: string;
  order_number: string;
  order_date: string;
  number_of_rolls: number;
  received_weight_kg: number;
  notes: string | null;
  status: OrderStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface OrderRoll {
  id: string;
  order_id: string;
  roll_number: string;
  received_weight_kg: number;
  color: string | null;
  pattern: string | null;
  design_info: string | null;
  screen_number: string | null;
  notes: string | null;
  status: RollStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductionEntry {
  id: string;
  order_id: string;
  order_roll_id: string | null;
  entry_date: string;
  printed_weight_kg: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  order_rolls?: OrderRoll | null;
}

export interface DeliveryEntry {
  id: string;
  order_id: string;
  delivery_date: string;
  delivered_weight_kg: number;
  delivery_notes: string | null;
  received_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderDetailWithRelations extends Order {
  client: Client;
  rolls: OrderRoll[];
  production_entries: ProductionEntry[];
  delivery_entries: DeliveryEntry[];
  total_printed_weight: number;
  total_delivered_weight: number;
  remaining_weight: number;
}

export interface OrderListItem extends Order {
  client: Client;
  total_printed_weight: number;
  total_delivered_weight: number;
  remaining_weight: number;
}

export interface OrderFilters {
  query?: string;
  status?: OrderStatus | "all";
  client_id?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "order_date" | "created_at" | "order_number";
  sortOrder?: "asc" | "desc";
}
