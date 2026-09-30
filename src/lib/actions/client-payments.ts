"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  clientPaymentSchema,
  type ClientPaymentFormValues,
} from "@/lib/validators/billing";
import type {
  ClientPayment,
  ClientPaymentWithDetails,
  PaymentFilters,
  BillStatus,
} from "@/lib/types/billing";
import { roundCurrency } from "@/lib/billing/calculations";
import type { ActionResult } from "./clients";

/**
 * Record a payment against a client bill
 */
export async function recordClientPaymentAction(
  values: ClientPaymentFormValues
): Promise<ActionResult<{ paymentId: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const validated = clientPaymentSchema.safeParse(values);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message ?? "Invalid payment data";
      return { success: false, error: firstError };
    }

    const {
      bill_id,
      client_id,
      payment_date,
      amount,
      payment_method,
      reference_number,
      notes,
    } = validated.data;

    // 1. Fetch current bill
    const { data: bill, error: billErr } = await supabase
      .from("client_bills")
      .select("id, client_id, net_amount, paid_amount, pending_amount, status")
      .eq("id", bill_id)
      .single();

    if (billErr || !bill) {
      return { success: false, error: "Bill not found." };
    }

    if (bill.status === "cancelled") {
      return { success: false, error: "Cannot record payments against cancelled bills." };
    }

    const currentPaid = Number(bill.paid_amount || 0);
    const netAmount = Number(bill.net_amount || 0);
    const pendingAmount = Number(bill.pending_amount || 0);

    if (amount > pendingAmount) {
      return {
        success: false,
        error: `Payment amount (₹${amount}) exceeds pending balance (₹${pendingAmount}).`,
      };
    }

    // 2. Insert payment record into client_payments
    const { data: paymentRecord, error: payError } = await supabase
      .from("client_payments")
      .insert({
        bill_id,
        client_id,
        payment_date,
        amount,
        payment_method,
        reference_number: reference_number || null,
        notes: notes || null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (payError) {
      console.error("[recordClientPaymentAction] Insert error:", payError.message);
      return { success: false, error: payError.message };
    }

    // 3. Update client_bills summary
    const newPaid = roundCurrency(currentPaid + amount);
    const newPending = Math.max(0, roundCurrency(netAmount - newPaid));
    let newStatus: BillStatus = "partially_paid";
    if (newPending <= 0) {
      newStatus = "paid";
    }

    const { error: updateError } = await supabase
      .from("client_bills")
      .update({
        paid_amount: newPaid,
        pending_amount: newPending,
        status: newStatus,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bill_id);

    if (updateError) {
      console.error("[recordClientPaymentAction] Update bill error:", updateError.message);
    }

    revalidatePath("/billing");
    revalidatePath(`/billing/${bill_id}`);
    revalidatePath(`/clients/${client_id}`);

    return { success: true, data: { paymentId: paymentRecord.id } };
  } catch (err) {
    console.error("[recordClientPaymentAction] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred while saving payment." };
  }
}

/**
 * Fetch payments for a specific bill
 */
export async function getBillPayments(
  billId: string
): Promise<{ payments: ClientPayment[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { payments: [], error: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("client_payments")
      .select("*")
      .eq("bill_id", billId)
      .order("payment_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return { payments: [], error: error.message };
    }

    return { payments: data || [] };
  } catch (err) {
    console.error("[getBillPayments] Unexpected error:", err);
    return { payments: [], error: "Failed to fetch bill payments" };
  }
}

/**
 * Fetch payments ledger / history across all bills and clients
 */
export async function getPaymentHistory(
  filters: PaymentFilters = {}
): Promise<{ payments: ClientPaymentWithDetails[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { payments: [], error: "unauthorized" };
    }

    let query = supabase.from("client_payments").select(`
      *,
      client:clients (
        id,
        client_code,
        name,
        company_name,
        phone
      ),
      bill:client_bills (
        id,
        bill_number,
        bill_date,
        net_amount,
        status
      )
    `);

    if (filters.client_id && filters.client_id !== "all") {
      query = query.eq("client_id", filters.client_id);
    }

    if (filters.bill_id) {
      query = query.eq("bill_id", filters.bill_id);
    }

    if (filters.payment_method && filters.payment_method !== "all") {
      query = query.eq("payment_method", filters.payment_method);
    }

    if (filters.startDate) {
      query = query.gte("payment_date", filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte("payment_date", filters.endDate);
    }

    query = query.order("payment_date", { ascending: false }).order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("[getPaymentHistory] Error:", error.message);
      return { payments: [], error: error.message };
    }

    let records = (data as unknown as ClientPaymentWithDetails[]) || [];

    if (filters.query?.trim()) {
      const q = filters.query.toLowerCase().trim();
      records = records.filter(
        (p) =>
          p.bill?.bill_number?.toLowerCase().includes(q) ||
          p.client?.name?.toLowerCase().includes(q) ||
          p.client?.client_code?.toLowerCase().includes(q) ||
          p.reference_number?.toLowerCase().includes(q)
      );
    }

    return { payments: records };
  } catch (err) {
    console.error("[getPaymentHistory] Unexpected error:", err);
    return { payments: [], error: "Failed to fetch payment history" };
  }
}
