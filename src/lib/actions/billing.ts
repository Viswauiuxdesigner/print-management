"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createBillSchema,
  updateBillSchema,
  cancelBillSchema,
  type CreateBillFormValues,
  type UpdateBillFormValues,
  type CancelBillFormValues,
} from "@/lib/validators/billing";
import type {
  ClientBillWithDetails,
  BillingSummary,
  OutstandingClient,
  BillFilters,
  ClientBillingSummary,
  BillStatus,
} from "@/lib/types/billing";
import { calculateBill, roundCurrency } from "@/lib/billing/calculations";
import type { ActionResult } from "./clients";

/**
 * Fetch aggregate billing summary (Billed, Collected, Outstanding)
 */
export async function getBillingSummary(): Promise<{
  summary: BillingSummary;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        summary: {
          total_bills_count: 0,
          total_billed_amount: 0,
          total_paid_amount: 0,
          total_outstanding_amount: 0,
          unpaid_bills_count: 0,
          partially_paid_bills_count: 0,
          paid_bills_count: 0,
        },
        error: "unauthorized",
      };
    }

    const { data: bills, error } = await supabase
      .from("client_bills")
      .select("net_amount, paid_amount, pending_amount, status")
      .neq("status", "cancelled");

    if (error) {
      console.error("[getBillingSummary] Error:", error.message);
    }

    const records = bills || [];
    let totalBilled = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    let unpaidCount = 0;
    let partialCount = 0;
    let paidCount = 0;

    records.forEach((b) => {
      totalBilled += Number(b.net_amount || 0);
      totalPaid += Number(b.paid_amount || 0);
      totalOutstanding += Number(b.pending_amount || 0);

      if (b.status === "paid") paidCount++;
      else if (b.status === "partially_paid") partialCount++;
      else unpaidCount++;
    });

    return {
      summary: {
        total_bills_count: records.length,
        total_billed_amount: roundCurrency(totalBilled),
        total_paid_amount: roundCurrency(totalPaid),
        total_outstanding_amount: roundCurrency(totalOutstanding),
        unpaid_bills_count: unpaidCount,
        partially_paid_bills_count: partialCount,
        paid_bills_count: paidCount,
      },
    };
  } catch (err) {
    console.error("[getBillingSummary] Unexpected error:", err);
    return {
      summary: {
        total_bills_count: 0,
        total_billed_amount: 0,
        total_paid_amount: 0,
        total_outstanding_amount: 0,
        unpaid_bills_count: 0,
        partially_paid_bills_count: 0,
        paid_bills_count: 0,
      },
      error: "Failed to fetch billing summary",
    };
  }
}

/**
 * Fetch client bills with filters and search query
 */
export async function getBills(
  filters: BillFilters = {}
): Promise<{ bills: ClientBillWithDetails[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { bills: [], error: "unauthorized" };
    }

    let query = supabase.from("client_bills").select(`
      *,
      client:clients (
        id,
        client_code,
        name,
        company_name,
        phone,
        city,
        is_active
      ),
      order:orders (
        id,
        order_number,
        order_date,
        received_weight_kg,
        status
      )
    `);

    if (filters.client_id && filters.client_id !== "all") {
      query = query.eq("client_id", filters.client_id);
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.billing_type && filters.billing_type !== "all") {
      query = query.eq("billing_type", filters.billing_type);
    }

    if (filters.startDate) {
      query = query.gte("bill_date", filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte("bill_date", filters.endDate);
    }

    query = query.order("bill_date", { ascending: false }).order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("[getBills] Error:", error.message);
      return { bills: [], error: error.message };
    }

    let records = (data as unknown as ClientBillWithDetails[]) || [];

    if (filters.query?.trim()) {
      const q = filters.query.toLowerCase().trim();
      records = records.filter(
        (b) =>
          b.bill_number?.toLowerCase().includes(q) ||
          b.client?.name?.toLowerCase().includes(q) ||
          b.client?.client_code?.toLowerCase().includes(q) ||
          b.client?.company_name?.toLowerCase().includes(q) ||
          b.order?.order_number?.toLowerCase().includes(q)
      );
    }

    return { bills: records };
  } catch (err) {
    console.error("[getBills] Unexpected error:", err);
    return { bills: [], error: "Failed to fetch bills" };
  }
}

/**
 * Fetch a single bill by ID with client, order, and payment history
 */
export async function getBillById(
  id: string
): Promise<{ bill: ClientBillWithDetails | null; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { bill: null, error: "unauthorized" };
    }

    const { data: billData, error: billError } = await supabase
      .from("client_bills")
      .select(`
        *,
        client:clients (
          id,
          client_code,
          name,
          company_name,
          phone,
          alternate_phone,
          email,
          address,
          city,
          is_active
        ),
        order:orders (
          id,
          order_number,
          order_date,
          received_weight_kg,
          number_of_rolls,
          status,
          notes
        )
      `)
      .eq("id", id)
      .single();

    if (billError || !billData) {
      return { bill: null, error: billError?.message || "Bill not found" };
    }

    // Fetch payments made for this bill
    const { data: paymentsData } = await supabase
      .from("client_payments")
      .select("*")
      .eq("bill_id", id)
      .order("payment_date", { ascending: false })
      .order("created_at", { ascending: false });

    const fullBill: ClientBillWithDetails = {
      ...(billData as unknown as ClientBillWithDetails),
      payments: paymentsData || [],
    };

    return { bill: fullBill };
  } catch (err) {
    console.error("[getBillById] Unexpected error:", err);
    return { bill: null, error: "Failed to fetch bill details" };
  }
}

/**
 * Create a new Client Bill
 */
export async function createBillAction(
  values: CreateBillFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const validated = createBillSchema.safeParse(values);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message ?? "Invalid bill information";
      return { success: false, error: firstError };
    }

    const {
      client_id,
      order_id,
      bill_date,
      billing_type,
      billable_weight_kg,
      rate_per_kg,
      fixed_amount,
      additional_amount,
      discount_amount,
      notes,
    } = validated.data;

    const calc = calculateBill({
      billingType: billing_type,
      billableWeightKg: billable_weight_kg,
      ratePerKg: rate_per_kg,
      fixedAmount: fixed_amount,
      additionalAmount: additional_amount,
      discountAmount: discount_amount,
      paidAmount: 0,
    });

    const { data, error } = await supabase
      .from("client_bills")
      .insert({
        client_id,
        order_id: order_id || null,
        bill_date,
        billing_type,
        billable_weight_kg: billable_weight_kg ?? null,
        rate_per_kg: rate_per_kg ?? null,
        fixed_amount: fixed_amount ?? null,
        additional_amount: calc.discountAmount < 0 ? 0 : additional_amount || 0,
        gross_amount: calc.grossAmount,
        discount_amount: calc.discountAmount,
        net_amount: calc.netAmount,
        paid_amount: 0,
        pending_amount: calc.netAmount,
        status: "unpaid",
        notes: notes || null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[createBillAction] Insert error:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/billing");
    revalidatePath(`/clients/${client_id}`);
    if (order_id) {
      revalidatePath(`/orders/${order_id}`);
    }

    return { success: true, data: { id: data.id } };
  } catch (err) {
    console.error("[createBillAction] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred while creating the bill." };
  }
}

/**
 * Update an existing Client Bill (if not locked by full payment or cancellation)
 */
export async function updateBillAction(
  id: string,
  values: UpdateBillFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const validated = updateBillSchema.safeParse(values);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message ?? "Invalid bill data";
      return { success: false, error: firstError };
    }

    // Fetch existing bill to check paid amount and status
    const { data: existing, error: fetchErr } = await supabase
      .from("client_bills")
      .select("id, client_id, order_id, paid_amount, status")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return { success: false, error: "Bill not found" };
    }

    if (existing.status === "cancelled") {
      return { success: false, error: "Cancelled bills cannot be edited." };
    }

    const currentPaid = Number(existing.paid_amount || 0);

    const calc = calculateBill({
      billingType: validated.data.billing_type,
      billableWeightKg: validated.data.billable_weight_kg,
      ratePerKg: validated.data.rate_per_kg,
      fixedAmount: validated.data.fixed_amount,
      additionalAmount: validated.data.additional_amount,
      discountAmount: validated.data.discount_amount,
      paidAmount: currentPaid,
    });

    if (calc.netAmount < currentPaid) {
      return {
        success: false,
        error: `Net amount (₹${calc.netAmount}) cannot be less than already paid amount (₹${currentPaid}).`,
      };
    }

    let newStatus: BillStatus = "unpaid";
    if (calc.pendingAmount <= 0 && calc.netAmount > 0) {
      newStatus = "paid";
    } else if (currentPaid > 0) {
      newStatus = "partially_paid";
    }

    const { error: updateErr } = await supabase
      .from("client_bills")
      .update({
        client_id: validated.data.client_id,
        order_id: validated.data.order_id || null,
        bill_date: validated.data.bill_date,
        billing_type: validated.data.billing_type,
        billable_weight_kg: validated.data.billable_weight_kg ?? null,
        rate_per_kg: validated.data.rate_per_kg ?? null,
        fixed_amount: validated.data.fixed_amount ?? null,
        additional_amount: validated.data.additional_amount || 0,
        gross_amount: calc.grossAmount,
        discount_amount: calc.discountAmount,
        net_amount: calc.netAmount,
        pending_amount: calc.pendingAmount,
        status: newStatus,
        notes: validated.data.notes || null,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) {
      console.error("[updateBillAction] Update error:", updateErr.message);
      return { success: false, error: updateErr.message };
    }

    revalidatePath("/billing");
    revalidatePath(`/billing/${id}`);
    revalidatePath(`/clients/${validated.data.client_id}`);
    if (existing.client_id !== validated.data.client_id) {
      revalidatePath(`/clients/${existing.client_id}`);
    }

    return { success: true, data: { id } };
  } catch (err) {
    console.error("[updateBillAction] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred while updating the bill." };
  }
}

/**
 * Cancel a bill with a mandatory reason
 */
export async function cancelBillAction(
  values: CancelBillFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const validated = cancelBillSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: "Cancellation reason is required" };
    }

    const { bill_id, reason } = validated.data;

    const { data: bill, error: fetchErr } = await supabase
      .from("client_bills")
      .select("id, client_id, order_id, paid_amount, status, notes")
      .eq("id", bill_id)
      .single();

    if (fetchErr || !bill) {
      return { success: false, error: "Bill not found" };
    }

    if (Number(bill.paid_amount || 0) > 0) {
      return {
        success: false,
        error: "Bills with recorded payments cannot be cancelled directly. Please contact admin.",
      };
    }

    const updatedNotes = bill.notes
      ? `${bill.notes}\n[Cancelled]: ${reason}`
      : `[Cancelled]: ${reason}`;

    const { error: updateErr } = await supabase
      .from("client_bills")
      .update({
        status: "cancelled",
        notes: updatedNotes,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bill_id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath("/billing");
    revalidatePath(`/billing/${bill_id}`);
    revalidatePath(`/clients/${bill.client_id}`);
    if (bill.order_id) {
      revalidatePath(`/orders/${bill.order_id}`);
    }

    return { success: true, data: { id: bill_id } };
  } catch (err) {
    console.error("[cancelBillAction] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred while cancelling the bill." };
  }
}

/**
 * Fetch billing & payment summary for a specific client
 */
export async function getClientBillingSummary(
  clientId: string
): Promise<{ summary: ClientBillingSummary; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        summary: {
          total_billed: 0,
          total_paid: 0,
          outstanding_amount: 0,
          total_bills_count: 0,
          unpaid_bills_count: 0,
        },
        error: "unauthorized",
      };
    }

    const { data: bills, error } = await supabase
      .from("client_bills")
      .select("net_amount, paid_amount, pending_amount, status")
      .eq("client_id", clientId)
      .neq("status", "cancelled");

    if (error) {
      return {
        summary: {
          total_billed: 0,
          total_paid: 0,
          outstanding_amount: 0,
          total_bills_count: 0,
          unpaid_bills_count: 0,
        },
        error: error.message,
      };
    }

    const records = bills || [];
    let totalBilled = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let unpaidCount = 0;

    records.forEach((b) => {
      totalBilled += Number(b.net_amount || 0);
      totalPaid += Number(b.paid_amount || 0);
      totalPending += Number(b.pending_amount || 0);
      if (b.status !== "paid") unpaidCount++;
    });

    return {
      summary: {
        total_billed: roundCurrency(totalBilled),
        total_paid: roundCurrency(totalPaid),
        outstanding_amount: roundCurrency(totalPending),
        total_bills_count: records.length,
        unpaid_bills_count: unpaidCount,
      },
    };
  } catch (err) {
    console.error("[getClientBillingSummary] Unexpected error:", err);
    return {
      summary: {
        total_billed: 0,
        total_paid: 0,
        outstanding_amount: 0,
        total_bills_count: 0,
        unpaid_bills_count: 0,
      },
      error: "Failed to calculate client billing summary",
    };
  }
}

/**
 * Fetch list of clients with outstanding balances
 */
export async function getOutstandingClients(): Promise<{
  clients: OutstandingClient[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { clients: [], error: "unauthorized" };
    }

    const { data: bills, error } = await supabase
      .from("client_bills")
      .select(`
        id,
        client_id,
        bill_date,
        net_amount,
        paid_amount,
        pending_amount,
        status,
        client:clients (
          id,
          client_code,
          name,
          company_name,
          phone
        )
      `)
      .neq("status", "cancelled")
      .gt("pending_amount", 0);

    if (error) {
      console.error("[getOutstandingClients] Error:", error.message);
      return { clients: [], error: error.message };
    }

    const clientMap = new Map<string, OutstandingClient>();

    (bills || []).forEach((b) => {
      const client = b.client as unknown as {
        id: string;
        client_code: string;
        name: string;
        company_name: string | null;
        phone: string | null;
      };
      if (!client) return;

      const existing = clientMap.get(client.id);
      if (existing) {
        existing.total_billed = roundCurrency(existing.total_billed + Number(b.net_amount || 0));
        existing.total_paid = roundCurrency(existing.total_paid + Number(b.paid_amount || 0));
        existing.outstanding_amount = roundCurrency(
          existing.outstanding_amount + Number(b.pending_amount || 0)
        );
        existing.bills_count += 1;
        if (!existing.latest_bill_date || b.bill_date > existing.latest_bill_date) {
          existing.latest_bill_date = b.bill_date;
        }
      } else {
        clientMap.set(client.id, {
          client_id: client.id,
          client_code: client.client_code,
          client_name: client.name,
          company_name: client.company_name,
          phone: client.phone,
          total_billed: roundCurrency(Number(b.net_amount || 0)),
          total_paid: roundCurrency(Number(b.paid_amount || 0)),
          outstanding_amount: roundCurrency(Number(b.pending_amount || 0)),
          bills_count: 1,
          latest_bill_date: b.bill_date,
        });
      }
    });

    const result = Array.from(clientMap.values()).sort(
      (a, b) => b.outstanding_amount - a.outstanding_amount
    );

    return { clients: result };
  } catch (err) {
    console.error("[getOutstandingClients] Unexpected error:", err);
    return { clients: [], error: "Failed to fetch outstanding clients" };
  }
}
