"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clientSchema, type ClientFormValues } from "@/lib/validators/client";
import type { Client, ClientFilters } from "@/lib/types/client";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Fetch list of clients with optional search, status filtering and sorting
 */
export async function getClients(
  filters: ClientFilters = {}
): Promise<{ clients: Client[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { clients: [], error: "unauthorized" };
    }

    let query = supabase.from("clients").select("*");

    // Status filter
    if (filters.status === "active") {
      query = query.eq("is_active", true);
    } else if (filters.status === "inactive") {
      query = query.eq("is_active", false);
    }

    // Search query across name, company_name, phone, client_code
    if (filters.query && filters.query.trim() !== "") {
      const q = filters.query.trim();
      // PostgREST ilike search across multiple fields
      query = query.or(
        `name.ilike.%${q}%,company_name.ilike.%${q}%,phone.ilike.%${q}%,client_code.ilike.%${q}%`
      );
    }

    // Sorting
    const sortBy = filters.sortBy ?? "created_at";
    const sortOrder = filters.sortOrder ?? "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching clients:", error.message);
      return { clients: [], error: error.message };
    }

    return { clients: (data as Client[]) ?? [] };
  } catch (err) {
    console.error("Unexpected error in getClients:", err);
    return { clients: [], error: "unexpected_error" };
  }
}

/**
 * Fetch a single client by ID
 */
export async function getClientById(
  id: string
): Promise<{ client: Client | null; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { client: null, error: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { client: null, error: error.message };
    }

    return { client: data as Client };
  } catch (err) {
    console.error("Error in getClientById:", err);
    return { client: null, error: "unexpected_error" };
  }
}

/**
 * Create a new client record
 */
export async function createClientAction(
  values: ClientFormValues
): Promise<ActionResult<Client>> {
  try {
    const validated = clientSchema.safeParse(values);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message ?? "validation_error",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "unauthorized" };
    }

    const newClientPayload = {
      name: validated.data.name.trim(),
      company_name: validated.data.company_name?.trim() || null,
      phone: validated.data.phone?.trim() || null,
      alternate_phone: validated.data.alternate_phone?.trim() || null,
      email: validated.data.email?.trim() || null,
      address: validated.data.address?.trim() || null,
      city: validated.data.city?.trim() || null,
      notes: validated.data.notes?.trim() || null,
      is_active: true,
      created_by: user.id,
      updated_by: user.id,
    };

    const { data, error } = await supabase
      .from("clients")
      .insert(newClientPayload)
      .select()
      .single();

    if (error) {
      console.error("Failed to insert client:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/clients");
    revalidatePath("/dashboard");

    return { success: true, data: data as Client };
  } catch (err) {
    console.error("Unexpected error in createClientAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}

/**
 * Update an existing client record
 */
export async function updateClientAction(
  id: string,
  values: ClientFormValues
): Promise<ActionResult<Client>> {
  try {
    const validated = clientSchema.safeParse(values);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message ?? "validation_error",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "unauthorized" };
    }

    const updatePayload = {
      name: validated.data.name.trim(),
      company_name: validated.data.company_name?.trim() || null,
      phone: validated.data.phone?.trim() || null,
      alternate_phone: validated.data.alternate_phone?.trim() || null,
      email: validated.data.email?.trim() || null,
      address: validated.data.address?.trim() || null,
      city: validated.data.city?.trim() || null,
      notes: validated.data.notes?.trim() || null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("clients")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update client:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    revalidatePath(`/clients/${id}/edit`);

    return { success: true, data: data as Client };
  } catch (err) {
    console.error("Unexpected error in updateClientAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}

/**
 * Soft-deactivate or reactivate a client record (never hard delete)
 */
export async function toggleClientStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "unauthorized" };
    }

    const { error } = await supabase
      .from("clients")
      .update({
        is_active: isActive,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Failed to update client status:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    revalidatePath(`/clients/${id}/edit`);

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in toggleClientStatusAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}
