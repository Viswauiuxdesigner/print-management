export interface Client {
  id: string;
  client_code: string;
  name: string;
  company_name: string | null;
  phone: string | null;
  alternate_phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ClientInsert = Omit<
  Client,
  "id" | "client_code" | "created_at" | "updated_at" | "created_by" | "updated_by"
> & {
  client_code?: string;
};

export type ClientUpdate = Partial<ClientInsert> & {
  is_active?: boolean;
};

export type ClientStatusFilter = "all" | "active" | "inactive";

export interface ClientFilters {
  query?: string;
  status?: ClientStatusFilter;
  sortBy?: "name" | "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
}

export interface ClientActivity {
  id: string;
  type: "created" | "updated" | "deactivated" | "activated";
  timestamp: string;
  performed_by?: string;
  details?: string;
}
