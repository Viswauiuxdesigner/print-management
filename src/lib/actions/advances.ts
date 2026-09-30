"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  salaryAdvanceSchema,
  type SalaryAdvanceFormValues,
} from "@/lib/validators/salary";
import type {
  SalaryAdvance,
  SalaryAdvanceWithEmployee,
  AdvanceFilters,
  EmployeeAdvanceSummary,
} from "@/lib/types/salary";
import type { ActionResult } from "./clients";

/**
 * Fetch all salary advances with optional employee and settlement status filters
 */
export async function getAdvances(
  filters: AdvanceFilters = {}
): Promise<{ advances: SalaryAdvanceWithEmployee[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { advances: [], error: "unauthorized" };
    }

    let query = supabase.from("salary_advances").select(`
      *,
      employee:employees (
        id,
        employee_code,
        full_name,
        phone,
        designation,
        is_active,
        salary_type,
        salary_amount
      )
    `);

    if (filters.employee_id && filters.employee_id !== "all") {
      query = query.eq("employee_id", filters.employee_id);
    }

    if (filters.is_settled !== undefined && filters.is_settled !== "all") {
      query = query.eq("is_settled", filters.is_settled === true);
    }

    if (filters.startDate) {
      query = query.gte("advance_date", filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte("advance_date", filters.endDate);
    }

    query = query.order("advance_date", { ascending: false }).order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("[getAdvances] Error:", error.message);
      return { advances: [], error: error.message };
    }

    return { advances: (data as SalaryAdvanceWithEmployee[]) || [] };
  } catch (err) {
    console.error("[getAdvances] Unexpected error:", err);
    return { advances: [], error: "Failed to fetch salary advances" };
  }
}

/**
 * Fetch advance summary for an employee (total advances, settled, outstanding balance)
 */
export async function getEmployeeAdvanceSummary(
  employeeId: string
): Promise<{ summary: EmployeeAdvanceSummary; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        summary: {
          total_advances: 0,
          settled_advances: 0,
          outstanding_balance: 0,
          active_advances_count: 0,
        },
        error: "unauthorized",
      };
    }

    const { data, error } = await supabase
      .from("salary_advances")
      .select("amount, is_settled, settled_amount")
      .eq("employee_id", employeeId);

    if (error) {
      console.error("[getEmployeeAdvanceSummary] Error:", error.message);
      return {
        summary: {
          total_advances: 0,
          settled_advances: 0,
          outstanding_balance: 0,
          active_advances_count: 0,
        },
        error: error.message,
      };
    }

    const records = (data as { amount: number; is_settled: boolean; settled_amount: number }[]) || [];
    let totalAdvances = 0;
    let totalSettled = 0;
    let activeCount = 0;

    records.forEach((rec) => {
      const amt = Number(rec.amount || 0);
      const setAmt = Number(rec.settled_amount || 0);
      totalAdvances += amt;
      totalSettled += setAmt;
      if (!rec.is_settled) {
        activeCount++;
      }
    });

    const outstanding = Math.max(0, totalAdvances - totalSettled);

    return {
      summary: {
        total_advances: totalAdvances,
        settled_advances: totalSettled,
        outstanding_balance: outstanding,
        active_advances_count: activeCount,
      },
    };
  } catch (err) {
    console.error("[getEmployeeAdvanceSummary] Unexpected error:", err);
    return {
      summary: {
        total_advances: 0,
        settled_advances: 0,
        outstanding_balance: 0,
        active_advances_count: 0,
      },
      error: "Failed to calculate advance balance",
    };
  }
}

/**
 * Record a new salary advance for an employee
 */
export async function createAdvanceAction(
  values: SalaryAdvanceFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const validated = salaryAdvanceSchema.safeParse(values);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message ?? "Invalid advance input";
      return { success: false, error: firstError };
    }

    const { data, error } = await supabase
      .from("salary_advances")
      .insert({
        employee_id: validated.data.employee_id,
        advance_date: validated.data.advance_date,
        amount: validated.data.amount,
        reason: validated.data.reason,
        payment_method: validated.data.payment_method,
        reference_number: validated.data.reference_number,
        notes: validated.data.notes,
        created_by: user.id,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[createAdvanceAction] Insert error:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/salary");
    revalidatePath("/salary/advances");
    revalidatePath(`/employees/${validated.data.employee_id}`);

    return { success: true, data: { id: data.id } };
  } catch (err) {
    console.error("[createAdvanceAction] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred while saving the advance." };
  }
}
