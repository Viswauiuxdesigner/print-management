"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  expenseSchema,
  voidExpenseSchema,
  type ExpenseFormValues,
} from "@/lib/validators/expense";
import type {
  Expense,
  ExpenseWithCategory,
  ExpenseCategory,
  ExpenseFilters,
  ExpenseSummary,
  CategoryExpenseSummary,
} from "@/lib/types/expense";
import type { ActionResult } from "./clients";

/**
 * Fetch list of expenses with joined categories, search, filters, and sorting
 */
export async function getExpenses(
  filters: ExpenseFilters = {}
): Promise<{ expenses: ExpenseWithCategory[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { expenses: [], error: "unauthorized" };
    }

    let query = supabase
      .from("expenses")
      .select(
        `
        *,
        category:expense_categories (
          id,
          name_en,
          name_ta,
          is_active,
          sort_order,
          created_at,
          updated_at
        )
      `
      );

    // Status filter (active vs void vs all)
    if (filters.status === "active") {
      query = query.eq("is_void", false);
    } else if (filters.status === "void") {
      query = query.eq("is_void", true);
    }

    // Category filter
    if (filters.category_id && filters.category_id !== "all") {
      query = query.eq("category_id", filters.category_id);
    }

    // Payment method filter
    if (filters.payment_method && filters.payment_method !== "all") {
      query = query.eq("payment_method", filters.payment_method);
    }

    // Date range filter
    if (filters.startDate) {
      query = query.gte("expense_date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("expense_date", filters.endDate);
    }

    // Search query
    if (filters.query && filters.query.trim() !== "") {
      const q = filters.query.trim();
      query = query.or(
        `description.ilike.%${q}%,reference_number.ilike.%${q}%,notes.ilike.%${q}%`
      );
    }

    // Sorting
    const sortBy = filters.sortBy ?? "expense_date";
    const sortOrder = filters.sortOrder ?? "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Secondary sort for consistency
    if (sortBy !== "created_at") {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching expenses:", error.message);
      return { expenses: [], error: error.message };
    }

    const items: ExpenseWithCategory[] = (data || []).map((row: any) => ({
      id: row.id,
      expense_date: row.expense_date,
      category_id: row.category_id,
      amount: Number(row.amount),
      description: row.description,
      payment_method: row.payment_method,
      reference_number: row.reference_number,
      notes: row.notes,
      is_void: Boolean(row.is_void),
      void_reason: row.void_reason,
      created_by: row.created_by,
      updated_by: row.updated_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category: row.category,
    }));

    return { expenses: items };
  } catch (err) {
    console.error("Unexpected error in getExpenses:", err);
    return { expenses: [], error: "unexpected_error" };
  }
}

/**
 * Fetch a single expense by ID
 */
export async function getExpenseById(
  id: string
): Promise<{ expense: ExpenseWithCategory | null; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { expense: null, error: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("expenses")
      .select(
        `
        *,
        category:expense_categories (
          id,
          name_en,
          name_ta,
          is_active,
          sort_order,
          created_at,
          updated_at
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching expense by ID:", error.message);
      return { expense: null, error: error.message };
    }

    const raw: any = data;
    const expense: ExpenseWithCategory = {
      id: raw.id,
      expense_date: raw.expense_date,
      category_id: raw.category_id,
      amount: Number(raw.amount),
      description: raw.description,
      payment_method: raw.payment_method,
      reference_number: raw.reference_number,
      notes: raw.notes,
      is_void: Boolean(raw.is_void),
      void_reason: raw.void_reason,
      created_by: raw.created_by,
      updated_by: raw.updated_by,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      category: raw.category,
    };

    return { expense };
  } catch (err) {
    console.error("Unexpected error in getExpenseById:", err);
    return { expense: null, error: "unexpected_error" };
  }
}

/**
 * Fetch active expense categories
 */
export async function getExpenseCategories(
  onlyActive = true
): Promise<{ categories: ExpenseCategory[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { categories: [], error: "unauthorized" };
    }

    let query = supabase
      .from("expense_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (onlyActive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching expense categories:", error.message);
      return { categories: [], error: error.message };
    }

    return { categories: (data || []) as ExpenseCategory[] };
  } catch (err) {
    console.error("Unexpected error in getExpenseCategories:", err);
    return { categories: [], error: "unexpected_error" };
  }
}

/**
 * Fetch aggregated expense summary (Active totals, today, this month, category breakdown)
 */
export async function getExpenseSummary(): Promise<{
  summary: ExpenseSummary;
  error?: string;
}> {
  const defaultSummary: ExpenseSummary = {
    total_active_amount: 0,
    today_amount: 0,
    this_month_amount: 0,
    total_count: 0,
    active_count: 0,
    void_count: 0,
    category_breakdown: [],
  };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { summary: defaultSummary, error: "unauthorized" };
    }

    // Fetch all categories
    const { categories = [] } = await getExpenseCategories(false);

    // Fetch all expenses
    const { data, error } = await supabase
      .from("expenses")
      .select("id, amount, expense_date, category_id, is_void");

    if (error) {
      console.error("Error fetching expense summary:", error.message);
      return { summary: defaultSummary, error: error.message };
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    let totalActive = 0;
    let todayTotal = 0;
    let thisMonthTotal = 0;
    let activeCount = 0;
    let voidCount = 0;

    const categoryMap = new Map<
      string,
      { total_amount: number; count: number }
    >();

    categories.forEach((cat) => {
      categoryMap.set(cat.id, { total_amount: 0, count: 0 });
    });

    (data || []).forEach((row: any) => {
      const amount = Number(row.amount) || 0;
      const isVoid = Boolean(row.is_void);
      const expenseDate = row.expense_date;

      if (isVoid) {
        voidCount += 1;
        return;
      }

      activeCount += 1;
      totalActive += amount;

      if (expenseDate === todayStr) {
        todayTotal += amount;
      }

      const d = new Date(expenseDate);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        thisMonthTotal += amount;
      }

      const existing = categoryMap.get(row.category_id) || {
        total_amount: 0,
        count: 0,
      };
      categoryMap.set(row.category_id, {
        total_amount: existing.total_amount + amount,
        count: existing.count + 1,
      });
    });

    const categoryBreakdown: CategoryExpenseSummary[] = categories
      .map((cat) => {
        const stats = categoryMap.get(cat.id) || { total_amount: 0, count: 0 };
        return {
          category_id: cat.id,
          name_en: cat.name_en,
          name_ta: cat.name_ta,
          total_amount: stats.total_amount,
          count: stats.count,
        };
      })
      .filter((c) => c.total_amount > 0 || c.count > 0)
      .sort((a, b) => b.total_amount - a.total_amount);

    return {
      summary: {
        total_active_amount: totalActive,
        today_amount: todayTotal,
        this_month_amount: thisMonthTotal,
        total_count: (data || []).length,
        active_count: activeCount,
        void_count: voidCount,
        category_breakdown: categoryBreakdown,
      },
    };
  } catch (err) {
    console.error("Unexpected error in getExpenseSummary:", err);
    return { summary: defaultSummary, error: "unexpected_error" };
  }
}

/**
 * Create a new expense record
 */
export async function createExpenseAction(
  values: ExpenseFormValues
): Promise<ActionResult<Expense>> {
  try {
    const validated = expenseSchema.safeParse(values);
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

    // Verify category exists and is active
    const { data: category, error: catErr } = await supabase
      .from("expense_categories")
      .select("id, is_active")
      .eq("id", validated.data.category_id)
      .single();

    if (catErr || !category) {
      return { success: false, error: "category_not_found" };
    }

    if (!category.is_active) {
      return { success: false, error: "category_inactive" };
    }

    const payload = {
      expense_date: validated.data.expense_date,
      category_id: validated.data.category_id,
      amount: validated.data.amount,
      payment_method: validated.data.payment_method,
      description: validated.data.description?.trim() || null,
      reference_number: validated.data.reference_number?.trim() || null,
      notes: validated.data.notes?.trim() || null,
      is_void: false,
      created_by: user.id,
      updated_by: user.id,
    };

    const { data, error } = await supabase
      .from("expenses")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Failed to insert expense:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/expenses");
    revalidatePath("/dashboard");

    return { success: true, data: data as Expense };
  } catch (err) {
    console.error("Unexpected error in createExpenseAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}

/**
 * Update an existing expense record (Cannot edit if voided)
 */
export async function updateExpenseAction(
  id: string,
  values: ExpenseFormValues
): Promise<ActionResult<Expense>> {
  try {
    const validated = expenseSchema.safeParse(values);
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

    // Check if expense exists and is not voided
    const { data: existing, error: existErr } = await supabase
      .from("expenses")
      .select("id, is_void")
      .eq("id", id)
      .single();

    if (existErr || !existing) {
      return { success: false, error: "expense_not_found" };
    }

    if (existing.is_void) {
      return { success: false, error: "cannot_edit_void_expense" };
    }

    const payload = {
      expense_date: validated.data.expense_date,
      category_id: validated.data.category_id,
      amount: validated.data.amount,
      payment_method: validated.data.payment_method,
      description: validated.data.description?.trim() || null,
      reference_number: validated.data.reference_number?.trim() || null,
      notes: validated.data.notes?.trim() || null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("expenses")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update expense:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/expenses");
    revalidatePath(`/expenses/${id}`);
    revalidatePath("/dashboard");

    return { success: true, data: data as Expense };
  } catch (err) {
    console.error("Unexpected error in updateExpenseAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}

/**
 * Void an expense (Soft void with mandatory reason)
 */
export async function voidExpenseAction(
  id: string,
  voidReason: string
): Promise<ActionResult<Expense>> {
  try {
    const validated = voidExpenseSchema.safeParse({ void_reason: voidReason });
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

    const { data, error } = await supabase
      .from("expenses")
      .update({
        is_void: true,
        void_reason: validated.data.void_reason.trim(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to void expense:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/expenses");
    revalidatePath(`/expenses/${id}`);
    revalidatePath("/dashboard");

    return { success: true, data: data as Expense };
  } catch (err) {
    console.error("Unexpected error in voidExpenseAction:", err);
    return { success: false, error: "unexpected_error" };
  }
}
