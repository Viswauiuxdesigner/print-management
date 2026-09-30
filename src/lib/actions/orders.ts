"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  orderSchema,
  rollSchema,
  productionEntrySchema,
  deliveryEntrySchema,
  type OrderFormValues,
  type RollFormValues,
  type ProductionEntryFormValues,
  type DeliveryEntryFormValues,
} from "@/lib/validators/order";
import type {
  Order,
  OrderStatus,
  OrderListItem,
  OrderDetailWithRelations,
  OrderFilters,
  OrderRoll,
  ProductionEntry,
  DeliveryEntry,
} from "@/lib/types/order";
import type { ActionResult } from "./clients";

/**
 * Fetch orders list with client details, search, status filtering, and calculated weights
 */
export async function getOrders(
  filters: OrderFilters = {}
): Promise<{ orders: OrderListItem[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { orders: [], error: "unauthorized" };
    }

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        client:clients (
          id,
          name,
          company_name,
          phone,
          client_code,
          is_active
        ),
        production_entries (
          printed_weight_kg
        ),
        delivery_entries (
          delivered_weight_kg
        )
      `
      );

    // Status filter
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    // Client filter
    if (filters.client_id) {
      query = query.eq("client_id", filters.client_id);
    }

    // Date range filter
    if (filters.startDate) {
      query = query.gte("order_date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("order_date", filters.endDate);
    }

    // Search query
    if (filters.query && filters.query.trim() !== "") {
      const q = filters.query.trim();
      query = query.or(`order_number.ilike.%${q}%,notes.ilike.%${q}%`);
    }

    // Sorting
    const sortBy = filters.sortBy ?? "created_at";
    const sortOrder = filters.sortOrder ?? "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error.message);
      return { orders: [], error: error.message };
    }

    // Calculate aggregated weights and filter client name if searched
    let items: OrderListItem[] = (data || []).map((row: any) => {
      const totalPrinted = (row.production_entries || []).reduce(
        (sum: number, p: any) => sum + Number(p.printed_weight_kg || 0),
        0
      );
      const totalDelivered = (row.delivery_entries || []).reduce(
        (sum: number, d: any) => sum + Number(d.delivered_weight_kg || 0),
        0
      );
      const received = Number(row.received_weight_kg || 0);
      const remaining = Math.max(0, received - totalDelivered);

      return {
        id: row.id,
        client_id: row.client_id,
        order_number: row.order_number,
        order_date: row.order_date,
        number_of_rolls: Number(row.number_of_rolls),
        received_weight_kg: received,
        notes: row.notes,
        status: row.status as OrderStatus,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: row.client,
        total_printed_weight: totalPrinted,
        total_delivered_weight: totalDelivered,
        remaining_weight: remaining,
      };
    });

    // If query matches client name or company name, refine results in memory
    if (filters.query && filters.query.trim() !== "") {
      const q = filters.query.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.order_number.toLowerCase().includes(q) ||
          item.client?.name?.toLowerCase().includes(q) ||
          item.client?.company_name?.toLowerCase().includes(q) ||
          item.client?.client_code?.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q)
      );
    }

    return { orders: items };
  } catch (err) {
    console.error("Unexpected error in getOrders:", err);
    return { orders: [], error: "unexpected_error" };
  }
}

/**
 * Fetch full order detail by ID with rolls, production entries, and delivery entries
 */
export async function getOrderById(
  id: string
): Promise<{ order: OrderDetailWithRelations | null; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { order: null, error: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        client:clients (
          id,
          name,
          company_name,
          phone,
          alternate_phone,
          email,
          city,
          address,
          client_code,
          is_active
        ),
        rolls:order_rolls (
          *
        ),
        production_entries (
          *,
          order_rolls (
            id,
            roll_number,
            color,
            pattern
          )
        ),
        delivery_entries (
          *
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching order by ID:", error.message);
      return { order: null, error: error.message };
    }

    const rawOrder: any = data;
    const rolls: OrderRoll[] = (rawOrder.rolls || []).sort(
      (a: OrderRoll, b: OrderRoll) =>
        a.roll_number.localeCompare(b.roll_number, undefined, { numeric: true })
    );

    const productionEntries: ProductionEntry[] = (
      rawOrder.production_entries || []
    ).sort(
      (a: ProductionEntry, b: ProductionEntry) =>
        new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );

    const deliveryEntries: DeliveryEntry[] = (
      rawOrder.delivery_entries || []
    ).sort(
      (a: DeliveryEntry, b: DeliveryEntry) =>
        new Date(b.delivery_date).getTime() - new Date(a.delivery_date).getTime()
    );

    const totalPrinted = productionEntries.reduce(
      (sum, p) => sum + Number(p.printed_weight_kg || 0),
      0
    );
    const totalDelivered = deliveryEntries.reduce(
      (sum, d) => sum + Number(d.delivered_weight_kg || 0),
      0
    );
    const received = Number(rawOrder.received_weight_kg || 0);
    const remaining = Math.max(0, received - totalDelivered);

    const fullOrder: OrderDetailWithRelations = {
      id: rawOrder.id,
      client_id: rawOrder.client_id,
      order_number: rawOrder.order_number,
      order_date: rawOrder.order_date,
      number_of_rolls: Number(rawOrder.number_of_rolls),
      received_weight_kg: received,
      notes: rawOrder.notes,
      status: rawOrder.status as OrderStatus,
      created_by: rawOrder.created_by,
      created_at: rawOrder.created_at,
      updated_at: rawOrder.updated_at,
      client: rawOrder.client,
      rolls,
      production_entries: productionEntries,
      delivery_entries: deliveryEntries,
      total_printed_weight: totalPrinted,
      total_delivered_weight: totalDelivered,
      remaining_weight: remaining,
    };

    return { order: fullOrder };
  } catch (err) {
    console.error("Unexpected error in getOrderById:", err);
    return { order: null, error: "unexpected_error" };
  }
}

/**
 * Fetch recent orders for a specific client (for Client Detail page)
 */
export async function getOrdersByClientId(
  clientId: string
): Promise<{ orders: OrderListItem[]; error?: string }> {
  return await getOrders({ client_id: clientId });
}

/**
 * Create a new order
 */
export async function createOrderAction(
  values: OrderFormValues
): Promise<ActionResult<Order>> {
  try {
    const validated = orderSchema.safeParse(values);
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

    // Verify client exists and is active
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("id, is_active")
      .eq("id", validated.data.client_id)
      .single();

    if (clientErr || !client) {
      return { success: false, error: "client_not_found" };
    }

    if (!client.is_active) {
      return { success: false, error: "client_inactive_cannot_order" };
    }

    const payload = {
      client_id: validated.data.client_id,
      order_date: validated.data.order_date,
      number_of_rolls: validated.data.number_of_rolls,
      received_weight_kg: validated.data.received_weight_kg,
      notes: validated.data.notes?.trim() || null,
      status: validated.data.status ?? "received",
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Failed to insert order:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/orders");
    revalidatePath(`/clients/${validated.data.client_id}`);
    revalidatePath("/dashboard");

    return { success: true, data: data as Order };
  } catch (err) {
    console.error("Unexpected error in createOrderAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}

/**
 * Update an existing order
 */
export async function updateOrderAction(
  id: string,
  values: OrderFormValues
): Promise<ActionResult<Order>> {
  try {
    const validated = orderSchema.safeParse(values);
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

    const payload = {
      client_id: validated.data.client_id,
      order_date: validated.data.order_date,
      number_of_rolls: validated.data.number_of_rolls,
      received_weight_kg: validated.data.received_weight_kg,
      notes: validated.data.notes?.trim() || null,
      status: validated.data.status,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update order:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);
    revalidatePath(`/clients/${validated.data.client_id}`);

    return { success: true, data: data as Order };
  } catch (err) {
    console.error("Unexpected error in updateOrderAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}

/**
 * Update Order status
 */
export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus
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
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Failed to update order status:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in updateOrderStatusAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}

/**
 * Add a Roll to an Order
 */
export async function createRollAction(
  orderId: string,
  values: RollFormValues
): Promise<ActionResult<OrderRoll>> {
  try {
    const validated = rollSchema.safeParse(values);
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

    const payload = {
      order_id: orderId,
      roll_number: validated.data.roll_number.trim(),
      received_weight_kg: validated.data.received_weight_kg,
      color: validated.data.color?.trim() || null,
      pattern: validated.data.pattern?.trim() || null,
      design_info: validated.data.design_info?.trim() || null,
      screen_number: validated.data.screen_number?.trim() || null,
      notes: validated.data.notes?.trim() || null,
      status: validated.data.status,
    };

    const { data, error } = await supabase
      .from("order_rolls")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Failed to insert roll:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath(`/orders/${orderId}`);

    return { success: true, data: data as OrderRoll };
  } catch (err) {
    console.error("Unexpected error in createRollAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}

/**
 * Update an existing Roll
 */
export async function updateRollAction(
  rollId: string,
  orderId: string,
  values: RollFormValues
): Promise<ActionResult<OrderRoll>> {
  try {
    const validated = rollSchema.safeParse(values);
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

    const payload = {
      roll_number: validated.data.roll_number.trim(),
      received_weight_kg: validated.data.received_weight_kg,
      color: validated.data.color?.trim() || null,
      pattern: validated.data.pattern?.trim() || null,
      design_info: validated.data.design_info?.trim() || null,
      screen_number: validated.data.screen_number?.trim() || null,
      notes: validated.data.notes?.trim() || null,
      status: validated.data.status,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("order_rolls")
      .update(payload)
      .eq("id", rollId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update roll:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath(`/orders/${orderId}`);

    return { success: true, data: data as OrderRoll };
  } catch (err) {
    console.error("Unexpected error in updateRollAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}

/**
 * Delete a Roll
 */
export async function deleteRollAction(
  rollId: string,
  orderId: string
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
      .from("order_rolls")
      .delete()
      .eq("id", rollId);

    if (error) {
      console.error("Failed to delete roll:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath(`/orders/${orderId}`);

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in deleteRollAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}

/**
 * Add a Production Entry (Printed Weight log)
 */
export async function createProductionEntryAction(
  values: ProductionEntryFormValues
): Promise<ActionResult<ProductionEntry>> {
  try {
    const validated = productionEntrySchema.safeParse(values);
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

    const payload = {
      order_id: validated.data.order_id,
      order_roll_id: validated.data.order_roll_id || null,
      entry_date: validated.data.entry_date,
      printed_weight_kg: validated.data.printed_weight_kg,
      notes: validated.data.notes?.trim() || null,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from("production_entries")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Failed to insert production entry:", error.message);
      return { success: false, error: error.message };
    }

    // Automatically update roll status to 'printed' if roll selected
    if (validated.data.order_roll_id) {
      await supabase
        .from("order_rolls")
        .update({ status: "printed", updated_at: new Date().toISOString() })
        .eq("id", validated.data.order_roll_id);
    }

    // Progress order status if currently 'received'
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", validated.data.order_id)
      .single();

    if (currentOrder && (currentOrder.status === "received" || currentOrder.status === "processing")) {
      await supabase
        .from("orders")
        .update({ status: "printing", updated_at: new Date().toISOString() })
        .eq("id", validated.data.order_id);
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${validated.data.order_id}`);

    return { success: true, data: data as ProductionEntry };
  } catch (err) {
    console.error("Unexpected error in createProductionEntryAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}

/**
 * Add a Delivery Entry
 */
export async function createDeliveryEntryAction(
  values: DeliveryEntryFormValues
): Promise<ActionResult<DeliveryEntry>> {
  try {
    const validated = deliveryEntrySchema.safeParse(values);
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

    const payload = {
      order_id: validated.data.order_id,
      delivery_date: validated.data.delivery_date,
      delivered_weight_kg: validated.data.delivered_weight_kg,
      received_by: validated.data.received_by?.trim() || null,
      delivery_notes: validated.data.delivery_notes?.trim() || null,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from("delivery_entries")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Failed to insert delivery entry:", error.message);
      return { success: false, error: error.message };
    }

    // Check total delivered vs received weight to decide if order is fully delivered
    const { data: orderDetails } = await supabase
      .from("orders")
      .select("received_weight_kg, delivery_entries(delivered_weight_kg)")
      .eq("id", validated.data.order_id)
      .single();

    if (orderDetails) {
      const received = Number(orderDetails.received_weight_kg || 0);
      const totalDelivered = (orderDetails.delivery_entries || []).reduce(
        (sum: number, d: any) => sum + Number(d.delivered_weight_kg || 0),
        0
      );

      if (totalDelivered >= received && received > 0) {
        await supabase
          .from("orders")
          .update({ status: "delivered", updated_at: new Date().toISOString() })
          .eq("id", validated.data.order_id);
      }
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${validated.data.order_id}`);

    return { success: true, data: data as DeliveryEntry };
  } catch (err) {
    console.error("Unexpected error in createDeliveryEntryAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}
