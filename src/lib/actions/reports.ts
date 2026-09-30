"use server";

import { createClient } from "@/lib/supabase/server";
import { roundCurrency } from "@/lib/billing/calculations";
import { getDefaultDateRange } from "@/lib/reports/date-utils";
import type {
  ReportOverview,
  ProductionReportRow,
  ClientReportRow,
  ExpenseReportData,
  AttendanceReportRow,
  SalaryReportRow,
  AdvanceReportRow,
  BillingReportRow,
  PaymentReportRow,
  FinancialSummaryData,
  ReportFilterParams,
} from "@/lib/types/reports";

/**
 * Helper to enforce server-side role security
 */
async function authorizeReportAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, supabase: null };
  }

  const { data: roleData } = await supabase.rpc("get_current_user_role");
  const role = (roleData as string) || "staff";

  if (!["owner", "admin", "manager"].includes(role)) {
    return { authorized: false, supabase: null };
  }

  return { authorized: true, supabase };
}

/**
 * 1. Fetch High-Level Operational & Financial Report Overview
 */
export async function getReportOverview(
  filters: ReportFilterParams = {}
): Promise<{ overview: ReportOverview; error?: string }> {
  try {
    const { authorized, supabase } = await authorizeReportAccess();
    if (!authorized || !supabase) {
      return {
        overview: {
          total_orders: 0,
          total_received_weight_kg: 0,
          total_printed_weight_kg: 0,
          total_delivered_weight_kg: 0,
          total_expenses_amount: 0,
          total_billed_amount: 0,
          total_collected_amount: 0,
          total_outstanding_amount: 0,
          total_salary_paid_amount: 0,
        },
        error: "unauthorized",
      };
    }

    const { startDate, endDate } = filters.startDate && filters.endDate
      ? { startDate: filters.startDate, endDate: filters.endDate }
      : getDefaultDateRange();

    // 1. Orders
    let orderQuery = supabase
      .from("orders")
      .select("id, received_weight_kg, status")
      .gte("order_date", startDate)
      .lte("order_date", endDate);
    if (filters.client_id && filters.client_id !== "all") {
      orderQuery = orderQuery.eq("client_id", filters.client_id);
    }
    const { data: ordersData } = await orderQuery;
    const orders = ordersData || [];
    const totalOrders = orders.length;
    const totalReceivedWt = orders.reduce((sum, o) => sum + Number(o.received_weight_kg || 0), 0);

    // 2. Production Entries
    const { data: prodData } = await supabase
      .from("production_entries")
      .select("printed_weight_kg")
      .gte("entry_date", startDate)
      .lte("entry_date", endDate);
    const totalPrintedWt = (prodData || []).reduce(
      (sum, p) => sum + Number(p.printed_weight_kg || 0),
      0
    );

    // 3. Delivery Entries
    const { data: delData } = await supabase
      .from("delivery_entries")
      .select("delivered_weight_kg")
      .gte("delivery_date", startDate)
      .lte("delivery_date", endDate);
    const totalDeliveredWt = (delData || []).reduce(
      (sum, d) => sum + Number(d.delivered_weight_kg || 0),
      0
    );

    // 4. Expenses
    const { data: expData } = await supabase
      .from("expenses")
      .select("amount")
      .eq("is_void", false)
      .gte("expense_date", startDate)
      .lte("expense_date", endDate);
    const totalExpenses = (expData || []).reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    // 5. Client Bills & Receipts
    let billQuery = supabase
      .from("client_bills")
      .select("net_amount, paid_amount, pending_amount")
      .neq("status", "cancelled")
      .gte("bill_date", startDate)
      .lte("bill_date", endDate);
    if (filters.client_id && filters.client_id !== "all") {
      billQuery = billQuery.eq("client_id", filters.client_id);
    }
    const { data: billsData } = await billQuery;
    const bills = billsData || [];
    const totalBilled = bills.reduce((sum, b) => sum + Number(b.net_amount || 0), 0);
    const totalOutstanding = bills.reduce((sum, b) => sum + Number(b.pending_amount || 0), 0);

    // 6. Client Payments collected
    let payQuery = supabase
      .from("client_payments")
      .select("amount")
      .gte("payment_date", startDate)
      .lte("payment_date", endDate);
    if (filters.client_id && filters.client_id !== "all") {
      payQuery = payQuery.eq("client_id", filters.client_id);
    }
    const { data: payData } = await payQuery;
    const totalCollected = (payData || []).reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    // 7. Salary Paid
    const { data: salPayData } = await supabase
      .from("salary_payments")
      .select("amount")
      .gte("payment_date", startDate)
      .lte("payment_date", endDate);
    const totalSalaryPaid = (salPayData || []).reduce(
      (sum, s) => sum + Number(s.amount || 0),
      0
    );

    return {
      overview: {
        total_orders: totalOrders,
        total_received_weight_kg: roundCurrency(totalReceivedWt),
        total_printed_weight_kg: roundCurrency(totalPrintedWt),
        total_delivered_weight_kg: roundCurrency(totalDeliveredWt),
        total_expenses_amount: roundCurrency(totalExpenses),
        total_billed_amount: roundCurrency(totalBilled),
        total_collected_amount: roundCurrency(totalCollected),
        total_outstanding_amount: roundCurrency(totalOutstanding),
        total_salary_paid_amount: roundCurrency(totalSalaryPaid),
      },
    };
  } catch (err) {
    console.error("[getReportOverview] Error:", err);
    return {
      overview: {
        total_orders: 0,
        total_received_weight_kg: 0,
        total_printed_weight_kg: 0,
        total_delivered_weight_kg: 0,
        total_expenses_amount: 0,
        total_billed_amount: 0,
        total_collected_amount: 0,
        total_outstanding_amount: 0,
        total_salary_paid_amount: 0,
      },
      error: "Failed to generate report overview",
    };
  }
}

/**
 * 2. Production Report: Orders, Weights (Received, Printed, Delivered, Remaining)
 */
export async function getProductionReport(
  filters: ReportFilterParams = {}
): Promise<{ rows: ProductionReportRow[]; error?: string }> {
  try {
    const { authorized, supabase } = await authorizeReportAccess();
    if (!authorized || !supabase) {
      return { rows: [], error: "unauthorized" };
    }

    const { startDate, endDate } = filters.startDate && filters.endDate
      ? { startDate: filters.startDate, endDate: filters.endDate }
      : getDefaultDateRange();

    let query = supabase
      .from("orders")
      .select(`
        id,
        order_number,
        order_date,
        number_of_rolls,
        received_weight_kg,
        status,
        client:clients (
          name,
          client_code
        ),
        production_entries (
          printed_weight_kg
        ),
        delivery_entries (
          delivered_weight_kg
        )
      `)
      .gte("order_date", startDate)
      .lte("order_date", endDate);

    if (filters.client_id && filters.client_id !== "all") {
      query = query.eq("client_id", filters.client_id);
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    query = query.order("order_date", { ascending: false });

    const { data, error } = await query;
    if (error) {
      return { rows: [], error: error.message };
    }

    const rows: ProductionReportRow[] = (data || []).map((order: unknown) => {
      const o = order as {
        id: string;
        order_number: string;
        order_date: string;
        number_of_rolls: number;
        received_weight_kg: number;
        status: string;
        client: { name: string; client_code: string } | null;
        production_entries: { printed_weight_kg: number }[];
        delivery_entries: { delivered_weight_kg: number }[];
      };

      const printed = (o.production_entries || []).reduce(
        (sum, p) => sum + Number(p.printed_weight_kg || 0),
        0
      );
      const delivered = (o.delivery_entries || []).reduce(
        (sum, d) => sum + Number(d.delivered_weight_kg || 0),
        0
      );
      const received = Number(o.received_weight_kg || 0);
      const remaining = Math.max(0, received - delivered);

      return {
        order_id: o.id,
        order_number: o.order_number,
        order_date: o.order_date,
        client_name: o.client?.name || "Unknown Client",
        client_code: o.client?.client_code || "",
        number_of_rolls: o.number_of_rolls,
        received_weight_kg: roundCurrency(received),
        printed_weight_kg: roundCurrency(printed),
        delivered_weight_kg: roundCurrency(delivered),
        remaining_weight_kg: roundCurrency(remaining),
        status: o.status,
      };
    });

    return { rows };
  } catch (err) {
    console.error("[getProductionReport] Error:", err);
    return { rows: [], error: "Failed to fetch production report" };
  }
}

/**
 * 3. Client Report: Business activity per client
 */
export async function getClientReport(
  filters: ReportFilterParams = {}
): Promise<{ rows: ClientReportRow[]; error?: string }> {
  try {
    const { authorized, supabase } = await authorizeReportAccess();
    if (!authorized || !supabase) {
      return { rows: [], error: "unauthorized" };
    }

    const { startDate, endDate } = filters.startDate && filters.endDate
      ? { startDate: filters.startDate, endDate: filters.endDate }
      : getDefaultDateRange();

    let clientQuery = supabase.from("clients").select(`
      id,
      client_code,
      name,
      company_name,
      phone,
      is_active
    `);

    if (filters.client_id && filters.client_id !== "all") {
      clientQuery = clientQuery.eq("id", filters.client_id);
    }

    clientQuery = clientQuery.order("name", { ascending: true });

    const { data: clients, error: clientErr } = await clientQuery;
    if (clientErr || !clients) {
      return { rows: [], error: clientErr?.message || "Failed to load clients" };
    }

    // Fetch orders within date range
    const { data: orders } = await supabase
      .from("orders")
      .select(`
        client_id,
        received_weight_kg,
        production_entries (printed_weight_kg),
        delivery_entries (delivered_weight_kg)
      `)
      .gte("order_date", startDate)
      .lte("order_date", endDate);

    // Fetch bills within date range
    const { data: bills } = await supabase
      .from("client_bills")
      .select("client_id, net_amount, paid_amount, pending_amount")
      .neq("status", "cancelled")
      .gte("bill_date", startDate)
      .lte("bill_date", endDate);

    const rows: ClientReportRow[] = clients.map((c) => {
      const clientOrders = (orders || []).filter((o) => o.client_id === c.id);
      const clientBills = (bills || []).filter((b) => b.client_id === c.id);

      let recWt = 0;
      let prnWt = 0;
      let delWt = 0;

      clientOrders.forEach((o: unknown) => {
        const ord = o as {
          received_weight_kg: number;
          production_entries: { printed_weight_kg: number }[];
          delivery_entries: { delivered_weight_kg: number }[];
        };
        recWt += Number(ord.received_weight_kg || 0);
        prnWt += (ord.production_entries || []).reduce((s, p) => s + Number(p.printed_weight_kg || 0), 0);
        delWt += (ord.delivery_entries || []).reduce((s, d) => s + Number(d.delivered_weight_kg || 0), 0);
      });

      const billed = clientBills.reduce((s, b) => s + Number(b.net_amount || 0), 0);
      const paid = clientBills.reduce((s, b) => s + Number(b.paid_amount || 0), 0);
      const outstanding = clientBills.reduce((s, b) => s + Number(b.pending_amount || 0), 0);

      return {
        client_id: c.id,
        client_code: c.client_code,
        client_name: c.name,
        company_name: c.company_name,
        phone: c.phone,
        is_active: c.is_active,
        orders_count: clientOrders.length,
        received_weight_kg: roundCurrency(recWt),
        printed_weight_kg: roundCurrency(prnWt),
        delivered_weight_kg: roundCurrency(delWt),
        total_billed: roundCurrency(billed),
        total_paid: roundCurrency(paid),
        outstanding_amount: roundCurrency(outstanding),
      };
    });

    return { rows };
  } catch (err) {
    console.error("[getClientReport] Error:", err);
    return { rows: [], error: "Failed to fetch client report" };
  }
}

/**
 * 4. Expense Report: Category breakdown and chronological ledger
 */
export async function getExpenseReport(
  filters: ReportFilterParams = {}
): Promise<{ data: ExpenseReportData; error?: string }> {
  try {
    const { authorized, supabase } = await authorizeReportAccess();
    if (!authorized || !supabase) {
      return {
        data: {
          total_amount: 0,
          entries_count: 0,
          average_expense: 0,
          categories: [],
          expenses: [],
        },
        error: "unauthorized",
      };
    }

    const { startDate, endDate } = filters.startDate && filters.endDate
      ? { startDate: filters.startDate, endDate: filters.endDate }
      : getDefaultDateRange();

    let query = supabase
      .from("expenses")
      .select(`
        id,
        expense_date,
        amount,
        payment_method,
        description,
        reference_number,
        is_void,
        category:expense_categories (
          id,
          name_en,
          name_ta
        )
      `)
      .gte("expense_date", startDate)
      .lte("expense_date", endDate);

    if (filters.category_id && filters.category_id !== "all") {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters.payment_method && filters.payment_method !== "all") {
      query = query.eq("payment_method", filters.payment_method);
    }

    query = query.order("expense_date", { ascending: false }).order("created_at", { ascending: false });

    const { data: rawExpenses, error } = await query;
    if (error) {
      return {
        data: {
          total_amount: 0,
          entries_count: 0,
          average_expense: 0,
          categories: [],
          expenses: [],
        },
        error: error.message,
      };
    }

    const expensesList: ExpenseReportItem[] = (rawExpenses || []).map((e: unknown) => {
      const exp = e as {
        id: string;
        expense_date: string;
        amount: number;
        payment_method: string;
        description: string;
        reference_number: string | null;
        is_void: boolean;
        category: { id: string; name_en: string; name_ta: string } | null;
      };
      return {
        id: exp.id,
        expense_date: exp.expense_date,
        category_name: exp.category?.name_en || "Uncategorized",
        category_name_ta: exp.category?.name_ta || "Uncategorized",
        amount: Number(exp.amount || 0),
        payment_method: exp.payment_method,
        description: exp.description,
        reference_number: exp.reference_number,
        is_void: exp.is_void,
      };
    });

    const activeExpenses = expensesList.filter((e) => !e.is_void);
    const totalAmount = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
    const entriesCount = activeExpenses.length;
    const avgExpense = entriesCount > 0 ? totalAmount / entriesCount : 0;

    // Category aggregation
    const catMap = new Map<string, { id: string; name: string; name_ta: string; total: number; count: number }>();
    activeExpenses.forEach((e) => {
      const existing = catMap.get(e.category_name);
      if (existing) {
        existing.total += e.amount;
        existing.count += 1;
      } else {
        catMap.set(e.category_name, {
          id: e.category_name,
          name: e.category_name,
          name_ta: e.category_name_ta || e.category_name,
          total: e.amount,
          count: 1,
        });
      }
    });

    const categoriesBreakdown = Array.from(catMap.values())
      .map((c) => ({
        category_id: c.id,
        category_name: c.name,
        category_name_ta: c.name_ta,
        total_amount: roundCurrency(c.total),
        entries_count: c.count,
        average_amount: roundCurrency(c.total / c.count),
      }))
      .sort((a, b) => b.total_amount - a.total_amount);

    return {
      data: {
        total_amount: roundCurrency(totalAmount),
        entries_count: entriesCount,
        average_expense: roundCurrency(avgExpense),
        categories: categoriesBreakdown,
        expenses: expensesList,
      },
    };
  } catch (err) {
    console.error("[getExpenseReport] Error:", err);
    return {
      data: {
        total_amount: 0,
        entries_count: 0,
        average_expense: 0,
        categories: [],
        expenses: [],
      },
      error: "Failed to fetch expense report",
    };
  }
}

/**
 * 5. Employee / Attendance Report: Attendance rate and status breakdown
 */
export async function getAttendanceReport(
  filters: ReportFilterParams = {}
): Promise<{ rows: AttendanceReportRow[]; error?: string }> {
  try {
    const { authorized, supabase } = await authorizeReportAccess();
    if (!authorized || !supabase) {
      return { rows: [], error: "unauthorized" };
    }

    const { startDate, endDate } = filters.startDate && filters.endDate
      ? { startDate: filters.startDate, endDate: filters.endDate }
      : getDefaultDateRange();

    let empQuery = supabase.from("employees").select(`
      id,
      employee_code,
      full_name,
      designation,
      is_active,
      salary_type
    `);

    if (filters.employee_id && filters.employee_id !== "all") {
      empQuery = empQuery.eq("id", filters.employee_id);
    }

    empQuery = empQuery.order("full_name", { ascending: true });

    const { data: employees, error: empErr } = await empQuery;
    if (empErr || !employees) {
      return { rows: [], error: empErr?.message || "Failed to load employees" };
    }

    // Fetch attendance records within date range
    const { data: attendance } = await supabase
      .from("attendance")
      .select("employee_id, status")
      .gte("attendance_date", startDate)
      .lte("attendance_date", endDate);

    const rows: AttendanceReportRow[] = employees.map((emp) => {
      const records = (attendance || []).filter((a) => a.employee_id === emp.id);

      let present = 0;
      let half = 0;
      let absent = 0;
      let leave = 0;

      records.forEach((r) => {
        if (r.status === "present") present++;
        else if (r.status === "half_day") half++;
        else if (r.status === "absent") absent++;
        else if (r.status === "leave") leave++;
      });

      const totalMarked = present + half + absent + leave;
      const payableDays = present + half * 0.5;
      const rate = totalMarked > 0 ? Math.round((payableDays / totalMarked) * 100) : 0;

      return {
        employee_id: emp.id,
        employee_code: emp.employee_code,
        employee_name: emp.full_name,
        designation: emp.designation,
        is_active: emp.is_active,
        salary_type: emp.salary_type,
        present_days: present,
        half_days: half,
        absent_days: absent,
        leave_days: leave,
        total_marked_days: totalMarked,
        attendance_rate: rate,
      };
    });

    return { rows };
  } catch (err) {
    console.error("[getAttendanceReport] Error:", err);
    return { rows: [], error: "Failed to fetch attendance report" };
  }
}

/**
 * 6. Salary Report: Payroll records breakdown
 */
export async function getSalaryReport(
  filters: ReportFilterParams = {}
): Promise<{ rows: SalaryReportRow[]; error?: string }> {
  try {
    const { authorized, supabase } = await authorizeReportAccess();
    if (!authorized || !supabase) {
      return { rows: [], error: "unauthorized" };
    }

    let query = supabase
      .from("salary_records")
      .select(`
        *,
        employee:employees (
          full_name,
          employee_code
        )
      `);

    if (filters.employee_id && filters.employee_id !== "all") {
      query = query.eq("employee_id", filters.employee_id);
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    query = query
      .order("payroll_year", { ascending: false })
      .order("payroll_month", { ascending: false });

    const { data, error } = await query;
    if (error) {
      return { rows: [], error: error.message };
    }

    const rows: SalaryReportRow[] = (data || []).map((r: unknown) => {
      const rec = r as {
        id: string;
        employee_id: string;
        payroll_year: number;
        payroll_month: number;
        salary_type: string;
        base_salary: number;
        gross_salary: number;
        attendance_deduction: number;
        advance_deduction: number;
        other_deduction: number;
        net_salary: number;
        paid_amount: number;
        pending_amount: number;
        status: string;
        employee: { full_name: string; employee_code: string } | null;
      };

      return {
        record_id: rec.id,
        employee_id: rec.employee_id,
        employee_code: rec.employee?.employee_code || "",
        employee_name: rec.employee?.full_name || "Employee",
        payroll_year: rec.payroll_year,
        payroll_month: rec.payroll_month,
        salary_type: rec.salary_type,
        base_salary: Number(rec.base_salary || 0),
        gross_salary: Number(rec.gross_salary || 0),
        attendance_deduction: Number(rec.attendance_deduction || 0),
        advance_deduction: Number(rec.advance_deduction || 0),
        other_deduction: Number(rec.other_deduction || 0),
        net_salary: Number(rec.net_salary || 0),
        paid_amount: Number(rec.paid_amount || 0),
        pending_amount: Number(rec.pending_amount || 0),
        status: rec.status,
      };
    });

    return { rows };
  } catch (err) {
    console.error("[getSalaryReport] Error:", err);
    return { rows: [], error: "Failed to fetch salary report" };
  }
}

/**
 * 7. Advance Report: Employee cash loans and repayments
 */
export async function getAdvanceReport(
  filters: ReportFilterParams = {}
): Promise<{ rows: AdvanceReportRow[]; error?: string }> {
  try {
    const { authorized, supabase } = await authorizeReportAccess();
    if (!authorized || !supabase) {
      return { rows: [], error: "unauthorized" };
    }

    let query = supabase
      .from("salary_advances")
      .select(`
        *,
        employee:employees (
          full_name,
          employee_code
        )
      `);

    if (filters.employee_id && filters.employee_id !== "all") {
      query = query.eq("employee_id", filters.employee_id);
    }

    if (filters.startDate) {
      query = query.gte("advance_date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("advance_date", filters.endDate);
    }

    query = query.order("advance_date", { ascending: false });

    const { data, error } = await query;
    if (error) {
      return { rows: [], error: error.message };
    }

    const rows: AdvanceReportRow[] = (data || []).map((a: unknown) => {
      const adv = a as {
        id: string;
        employee_id: string;
        advance_date: string;
        amount: number;
        settled_amount: number;
        is_settled: boolean;
        payment_method: string;
        reason: string | null;
        employee: { full_name: string; employee_code: string } | null;
      };

      const amt = Number(adv.amount || 0);
      const settled = Number(adv.settled_amount || 0);
      const outstanding = Math.max(0, amt - settled);

      return {
        advance_id: adv.id,
        employee_id: adv.employee_id,
        employee_code: adv.employee?.employee_code || "",
        employee_name: adv.employee?.full_name || "Employee",
        advance_date: adv.advance_date,
        amount: roundCurrency(amt),
        settled_amount: roundCurrency(settled),
        outstanding_amount: roundCurrency(outstanding),
        is_settled: adv.is_settled,
        payment_method: adv.payment_method,
        reason: adv.reason,
      };
    });

    return { rows };
  } catch (err) {
    console.error("[getAdvanceReport] Error:", err);
    return { rows: [], error: "Failed to fetch advances report" };
  }
}

/**
 * 8. Billing Report: Invoices, pricing types, and settlement statuses
 */
export async function getBillingReport(
  filters: ReportFilterParams = {}
): Promise<{ rows: BillingReportRow[]; error?: string }> {
  try {
    const { authorized, supabase } = await authorizeReportAccess();
    if (!authorized || !supabase) {
      return { rows: [], error: "unauthorized" };
    }

    const { startDate, endDate } = filters.startDate && filters.endDate
      ? { startDate: filters.startDate, endDate: filters.endDate }
      : getDefaultDateRange();

    let query = supabase
      .from("client_bills")
      .select(`
        *,
        client:clients (
          name,
          client_code
        ),
        order:orders (
          order_number
        )
      `)
      .gte("bill_date", startDate)
      .lte("bill_date", endDate);

    if (filters.client_id && filters.client_id !== "all") {
      query = query.eq("client_id", filters.client_id);
    }

    if (filters.billing_type && filters.billing_type !== "all") {
      query = query.eq("billing_type", filters.billing_type);
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    query = query.order("bill_date", { ascending: false });

    const { data, error } = await query;
    if (error) {
      return { rows: [], error: error.message };
    }

    const rows: BillingReportRow[] = (data || []).map((b: unknown) => {
      const bill = b as {
        id: string;
        bill_number: string;
        bill_date: string;
        client_id: string;
        billing_type: string;
        gross_amount: number;
        discount_amount: number;
        net_amount: number;
        paid_amount: number;
        pending_amount: number;
        status: string;
        client: { name: string; client_code: string } | null;
        order: { order_number: string } | null;
      };

      return {
        bill_id: bill.id,
        bill_number: bill.bill_number,
        bill_date: bill.bill_date,
        client_id: bill.client_id,
        client_name: bill.client?.name || "Client",
        client_code: bill.client?.client_code || "",
        order_number: bill.order?.order_number || null,
        billing_type: bill.billing_type,
        gross_amount: Number(bill.gross_amount || 0),
        discount_amount: Number(bill.discount_amount || 0),
        net_amount: Number(bill.net_amount || 0),
        paid_amount: Number(bill.paid_amount || 0),
        pending_amount: Number(bill.pending_amount || 0),
        status: bill.status,
      };
    });

    return { rows };
  } catch (err) {
    console.error("[getBillingReport] Error:", err);
    return { rows: [], error: "Failed to fetch billing report" };
  }
}

/**
 * 9. Client Payments Report: Receipts ledger
 */
export async function getPaymentReport(
  filters: ReportFilterParams = {}
): Promise<{ rows: PaymentReportRow[]; error?: string }> {
  try {
    const { authorized, supabase } = await authorizeReportAccess();
    if (!authorized || !supabase) {
      return { rows: [], error: "unauthorized" };
    }

    const { startDate, endDate } = filters.startDate && filters.endDate
      ? { startDate: filters.startDate, endDate: filters.endDate }
      : getDefaultDateRange();

    let query = supabase
      .from("client_payments")
      .select(`
        *,
        client:clients (
          name,
          client_code
        ),
        bill:client_bills (
          bill_number
        )
      `)
      .gte("payment_date", startDate)
      .lte("payment_date", endDate);

    if (filters.client_id && filters.client_id !== "all") {
      query = query.eq("client_id", filters.client_id);
    }

    if (filters.payment_method && filters.payment_method !== "all") {
      query = query.eq("payment_method", filters.payment_method);
    }

    query = query.order("payment_date", { ascending: false });

    const { data, error } = await query;
    if (error) {
      return { rows: [], error: error.message };
    }

    const rows: PaymentReportRow[] = (data || []).map((p: unknown) => {
      const pay = p as {
        id: string;
        payment_date: string;
        bill_id: string;
        client_id: string;
        amount: number;
        payment_method: string;
        reference_number: string | null;
        notes: string | null;
        client: { name: string; client_code: string } | null;
        bill: { bill_number: string } | null;
      };

      return {
        payment_id: pay.id,
        payment_date: pay.payment_date,
        bill_id: pay.bill_id,
        bill_number: pay.bill?.bill_number || "",
        client_id: pay.client_id,
        client_name: pay.client?.name || "Client",
        client_code: pay.client?.client_code || "",
        amount: Number(pay.amount || 0),
        payment_method: pay.payment_method,
        reference_number: pay.reference_number,
        notes: pay.notes,
      };
    });

    return { rows };
  } catch (err) {
    console.error("[getPaymentReport] Error:", err);
    return { rows: [], error: "Failed to fetch payments report" };
  }
}

/**
 * 10. Financial Summary Report
 */
export async function getFinancialSummary(
  filters: ReportFilterParams = {}
): Promise<{ summary: FinancialSummaryData; error?: string }> {
  try {
    const { authorized, supabase } = await authorizeReportAccess();
    if (!authorized || !supabase) {
      return {
        summary: {
          start_date: "",
          end_date: "",
          total_billed: 0,
          total_collected: 0,
          total_outstanding: 0,
          total_expenses: 0,
          total_salary_paid: 0,
          total_advances_issued: 0,
          total_advances_settled: 0,
        },
        error: "unauthorized",
      };
    }

    const { startDate, endDate } = filters.startDate && filters.endDate
      ? { startDate: filters.startDate, endDate: filters.endDate }
      : getDefaultDateRange();

    // 1. Bills
    const { data: bills } = await supabase
      .from("client_bills")
      .select("net_amount, pending_amount")
      .neq("status", "cancelled")
      .gte("bill_date", startDate)
      .lte("bill_date", endDate);
    const totalBilled = (bills || []).reduce((s, b) => s + Number(b.net_amount || 0), 0);
    const totalOutstanding = (bills || []).reduce((s, b) => s + Number(b.pending_amount || 0), 0);

    // 2. Payments Collected
    const { data: payments } = await supabase
      .from("client_payments")
      .select("amount")
      .gte("payment_date", startDate)
      .lte("payment_date", endDate);
    const totalCollected = (payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);

    // 3. Expenses
    const { data: expenses } = await supabase
      .from("expenses")
      .select("amount")
      .eq("is_void", false)
      .gte("expense_date", startDate)
      .lte("expense_date", endDate);
    const totalExpenses = (expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);

    // 4. Salary Paid
    const { data: salaryPayments } = await supabase
      .from("salary_payments")
      .select("amount")
      .gte("payment_date", startDate)
      .lte("payment_date", endDate);
    const totalSalaryPaid = (salaryPayments || []).reduce((s, sp) => s + Number(sp.amount || 0), 0);

    // 5. Advances
    const { data: advances } = await supabase
      .from("salary_advances")
      .select("amount, settled_amount")
      .gte("advance_date", startDate)
      .lte("advance_date", endDate);
    const totalAdvancesIssued = (advances || []).reduce((s, a) => s + Number(a.amount || 0), 0);
    const totalAdvancesSettled = (advances || []).reduce((s, a) => s + Number(a.settled_amount || 0), 0);

    return {
      summary: {
        start_date: startDate,
        end_date: endDate,
        total_billed: roundCurrency(totalBilled),
        total_collected: roundCurrency(totalCollected),
        total_outstanding: roundCurrency(totalOutstanding),
        total_expenses: roundCurrency(totalExpenses),
        total_salary_paid: roundCurrency(totalSalaryPaid),
        total_advances_issued: roundCurrency(totalAdvancesIssued),
        total_advances_settled: roundCurrency(totalAdvancesSettled),
      },
    };
  } catch (err) {
    console.error("[getFinancialSummary] Error:", err);
    return {
      summary: {
        start_date: "",
        end_date: "",
        total_billed: 0,
        total_collected: 0,
        total_outstanding: 0,
        total_expenses: 0,
        total_salary_paid: 0,
        total_advances_issued: 0,
        total_advances_settled: 0,
      },
      error: "Failed to fetch financial summary",
    };
  }
}
