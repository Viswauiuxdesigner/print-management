"use server";

import { createClient } from "@/lib/supabase/server";
import { roundCurrency } from "@/lib/billing/calculations";
import { getDefaultDateRange } from "@/lib/reports/date-utils";
import type {
  DashboardData,
  DashboardFilterParams,
  RevenueCollectionTrendPoint,
  DashboardExpenseCategory,
  DashboardOutstandingClient,
  DashboardRecentPayment,
  DashboardRecentActivity,
} from "@/lib/types/dashboard";

/**
 * Helper to authorize dashboard access for managerial roles
 */
async function authorizeDashboardAccess() {
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
 * Fetch all Dashboard aggregated data for the selected date range
 */
export async function getDashboardData(
  filters?: Partial<DashboardFilterParams>
): Promise<{ data?: DashboardData; error?: string }> {
  try {
    const { authorized, supabase } = await authorizeDashboardAccess();
    if (!authorized || !supabase) {
      return { error: "unauthorized" };
    }

    const defaultRange = getDefaultDateRange();
    const startDate = filters?.startDate || defaultRange.startDate;
    const endDate = filters?.endDate || defaultRange.endDate;

    // 1. Parallel database queries for fast execution
    const [
      billsRes,
      paymentsRes,
      allBillsRes,
      expensesRes,
      salaryRes,
      ordersRes,
      prodEntriesRes,
      delEntriesRes,
      clientsRes,
      recentPaymentsRes,
      recentOrdersRes,
      recentProdRes,
      recentDelRes,
      recentExpRes,
    ] = await Promise.all([
      // Period Bills
      supabase
        .from("client_bills")
        .select("bill_date, net_amount, status")
        .neq("status", "cancelled")
        .gte("bill_date", startDate)
        .lte("bill_date", endDate),

      // Period Payments
      supabase
        .from("client_payments")
        .select("payment_date, amount")
        .gte("payment_date", startDate)
        .lte("payment_date", endDate),

      // All active bills for outstanding aggregation & client breakdown
      supabase
        .from("client_bills")
        .select(`
          id,
          bill_number,
          client_id,
          net_amount,
          paid_amount,
          pending_amount,
          status,
          client:clients (
            id,
            name,
            client_code,
            company_name,
            phone
          )
        `)
        .neq("status", "cancelled"),

      // Period Expenses with Categories
      supabase
        .from("expenses")
        .select(`
          id,
          amount,
          expense_date,
          description,
          is_void,
          category:expense_categories (
            id,
            name_en,
            name_ta
          )
        `)
        .eq("is_void", false)
        .gte("expense_date", startDate)
        .lte("expense_date", endDate),

      // Salary Records for pending payable amounts
      supabase
        .from("salary_records")
        .select("pending_amount, status")
        .in("status", ["pending", "partially_paid"]),

      // Period Orders
      supabase
        .from("orders")
        .select(`
          id,
          order_number,
          order_date,
          received_weight_kg,
          status,
          production_entries (printed_weight_kg),
          delivery_entries (delivered_weight_kg)
        `)
        .gte("order_date", startDate)
        .lte("order_date", endDate),

      // Period Production Entries
      supabase
        .from("production_entries")
        .select("printed_weight_kg")
        .gte("entry_date", startDate)
        .lte("entry_date", endDate),

      // Period Delivery Entries
      supabase
        .from("delivery_entries")
        .select("delivered_weight_kg")
        .gte("delivery_date", startDate)
        .lte("delivery_date", endDate),

      // Active Clients Count
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),

      // Recent Payments (top 6)
      supabase
        .from("client_payments")
        .select(`
          id,
          amount,
          payment_method,
          payment_date,
          reference_number,
          created_at,
          bill:client_bills (
            id,
            bill_number
          ),
          client:clients (
            id,
            name,
            client_code
          )
        `)
        .order("payment_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6),

      // Recent Orders (top 4)
      supabase
        .from("orders")
        .select(`
          id,
          order_number,
          order_date,
          received_weight_kg,
          created_at,
          client:clients (
            name,
            client_code
          )
        `)
        .order("order_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4),

      // Recent Production Entries (top 4)
      supabase
        .from("production_entries")
        .select(`
          id,
          printed_weight_kg,
          entry_date,
          created_at,
          order:orders (
            order_number,
            client:clients (name)
          )
        `)
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4),

      // Recent Delivery Entries (top 4)
      supabase
        .from("delivery_entries")
        .select(`
          id,
          delivered_weight_kg,
          delivery_date,
          created_at,
          order:orders (
            order_number,
            client:clients (name)
          )
        `)
        .order("delivery_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4),

      // Recent Expenses (top 4)
      supabase
        .from("expenses")
        .select(`
          id,
          amount,
          expense_date,
          description,
          created_at,
          category:expense_categories (
            name_en,
            name_ta
          )
        `)
        .eq("is_void", false)
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

    // 2. Compute KPIs
    const periodBills = billsRes.data || [];
    const totalBilled = periodBills.reduce((s, b) => s + Number(b.net_amount || 0), 0);

    const periodPayments = paymentsRes.data || [];
    const totalCollected = periodPayments.reduce((s, p) => s + Number(p.amount || 0), 0);

    const allBills = allBillsRes.data || [];
    const totalOutstanding = allBills.reduce((s, b) => s + Number(b.pending_amount || 0), 0);

    const periodExpenses = expensesRes.data || [];
    const totalExpenses = periodExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

    const pendingSalaries = salaryRes.data || [];
    const totalSalaryPayable = pendingSalaries.reduce((s, r) => s + Number(r.pending_amount || 0), 0);

    const periodProdEntries = prodEntriesRes.data || [];
    const totalPrintedWeight = periodProdEntries.reduce((s, p) => s + Number(p.printed_weight_kg || 0), 0);

    const periodDelEntries = delEntriesRes.data || [];
    const totalDeliveredWeight = periodDelEntries.reduce((s, d) => s + Number(d.delivered_weight_kg || 0), 0);

    const periodOrders = ordersRes.data || [];
    const activeOrdersCount = periodOrders.filter((o) =>
      ["received", "in_production", "partially_delivered"].includes(o.status)
    ).length;

    const activeClientsCount = clientsRes.count || 0;

    // 3. Compute Revenue vs Collection Trend Points for Chart
    // Build daily/monthly trend data depending on date range duration
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const dayDiff = Math.max(1, Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)));
    const isMonthlyView = dayDiff > 35;

    const trendMap = new Map<string, { billed: number; collected: number }>();

    if (!isMonthlyView) {
      // Initialize each date in range so chart has continuous timeline
      const curr = new Date(startObj);
      while (curr <= endObj) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, "0");
        const d = String(curr.getDate()).padStart(2, "0");
        const key = `${y}-${m}-${d}`;
        trendMap.set(key, { billed: 0, collected: 0 });
        curr.setDate(curr.getDate() + 1);
      }

      periodBills.forEach((b) => {
        const key = b.bill_date;
        const entry = trendMap.get(key) || { billed: 0, collected: 0 };
        entry.billed += Number(b.net_amount || 0);
        trendMap.set(key, entry);
      });

      periodPayments.forEach((p) => {
        const key = p.payment_date;
        const entry = trendMap.get(key) || { billed: 0, collected: 0 };
        entry.collected += Number(p.amount || 0);
        trendMap.set(key, entry);
      });
    } else {
      // Month-by-month aggregation
      periodBills.forEach((b) => {
        const key = b.bill_date ? b.bill_date.substring(0, 7) : "";
        if (key) {
          const entry = trendMap.get(key) || { billed: 0, collected: 0 };
          entry.billed += Number(b.net_amount || 0);
          trendMap.set(key, entry);
        }
      });

      periodPayments.forEach((p) => {
        const key = p.payment_date ? p.payment_date.substring(0, 7) : "";
        if (key) {
          const entry = trendMap.get(key) || { billed: 0, collected: 0 };
          entry.collected += Number(p.amount || 0);
          trendMap.set(key, entry);
        }
      });
    }

    const chart: RevenueCollectionTrendPoint[] = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date_label, val]) => ({
        date_label,
        billed: roundCurrency(val.billed),
        collected: roundCurrency(val.collected),
      }));

    // 4. Compute Expense Category Breakdown
    const catMap = new Map<string, { id: string; name_en: string; name_ta: string; amount: number; count: number }>();
    periodExpenses.forEach((e: unknown) => {
      const exp = e as {
        amount: number;
        category: { id: string; name_en: string; name_ta: string } | null;
      };
      const catId = exp.category?.id || "other";
      const catNameEn = exp.category?.name_en || "Other / Miscellaneous";
      const catNameTa = exp.category?.name_ta || "மற்றவை";
      const existing = catMap.get(catId);
      if (existing) {
        existing.amount += Number(exp.amount || 0);
        existing.count += 1;
      } else {
        catMap.set(catId, {
          id: catId,
          name_en: catNameEn,
          name_ta: catNameTa,
          amount: Number(exp.amount || 0),
          count: 1,
        });
      }
    });

    const expenseCategories: DashboardExpenseCategory[] = Array.from(catMap.values())
      .map((c) => ({
        category_id: c.id,
        name_en: c.name_en,
        name_ta: c.name_ta,
        amount: roundCurrency(c.amount),
        percentage: totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 100) : 0,
        entries_count: c.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 5. Compute Production Summary
    let totalReceivedWeight = 0;
    periodOrders.forEach((o) => {
      totalReceivedWeight += Number(o.received_weight_kg || 0);
    });
    const remainingWeight = Math.max(0, totalReceivedWeight - totalDeliveredWeight);

    // 6. Compute Outstanding Clients
    const clientDueMap = new Map<
      string,
      {
        id: string;
        name: string;
        code: string;
        company: string | null;
        phone: string | null;
        billed: number;
        paid: number;
        due: number;
        bills_count: number;
      }
    >();

    allBills.forEach((b: unknown) => {
      const bill = b as {
        id: string;
        client_id: string;
        net_amount: number;
        paid_amount: number;
        pending_amount: number;
        status: string;
        client: { id: string; name: string; client_code: string; company_name: string | null; phone: string | null } | null;
      };

      const pending = Number(bill.pending_amount || 0);
      if (pending > 0 && bill.client) {
        const cId = bill.client.id;
        const existing = clientDueMap.get(cId);
        if (existing) {
          existing.billed += Number(bill.net_amount || 0);
          existing.paid += Number(bill.paid_amount || 0);
          existing.due += pending;
          existing.bills_count += 1;
        } else {
          clientDueMap.set(cId, {
            id: cId,
            name: bill.client.name,
            code: bill.client.client_code,
            company: bill.client.company_name,
            phone: bill.client.phone,
            billed: Number(bill.net_amount || 0),
            paid: Number(bill.paid_amount || 0),
            due: pending,
            bills_count: 1,
          });
        }
      }
    });

    const outstandingClients: DashboardOutstandingClient[] = Array.from(clientDueMap.values())
      .map((c) => ({
        client_id: c.id,
        client_name: c.name,
        client_code: c.code,
        company_name: c.company,
        phone: c.phone,
        total_billed: roundCurrency(c.billed),
        total_paid: roundCurrency(c.paid),
        outstanding_amount: roundCurrency(c.due),
        bills_count: c.bills_count,
      }))
      .sort((a, b) => b.outstanding_amount - a.outstanding_amount)
      .slice(0, 6);

    // 7. Recent Payments
    const recentPayments: DashboardRecentPayment[] = (recentPaymentsRes.data || []).map((p: unknown) => {
      const pay = p as {
        id: string;
        amount: number;
        payment_method: string;
        payment_date: string;
        reference_number: string | null;
        bill: { id: string; bill_number: string } | null;
        client: { id: string; name: string; client_code: string } | null;
      };
      return {
        payment_id: pay.id,
        bill_id: pay.bill?.id || "",
        bill_number: pay.bill?.bill_number || "Bill",
        client_id: pay.client?.id || "",
        client_name: pay.client?.name || "Client",
        client_code: pay.client?.client_code || "",
        amount: Number(pay.amount || 0),
        payment_method: pay.payment_method,
        payment_date: pay.payment_date,
        reference_number: pay.reference_number,
      };
    });

    // 8. Recent Activities Feed
    const activities: DashboardRecentActivity[] = [];

    // Add recent orders
    (recentOrdersRes.data || []).forEach((o: unknown) => {
      const ord = o as {
        id: string;
        order_number: string;
        order_date: string;
        received_weight_kg: number;
        created_at: string;
        client: { name: string; client_code: string } | null;
      };
      activities.push({
        id: `ord-${ord.id}`,
        type: "order",
        title: ord.order_number,
        subtitle: ord.client?.name || "Order Placed",
        amount_or_weight: `${Number(ord.received_weight_kg || 0).toFixed(1)} kg`,
        timestamp: ord.created_at || ord.order_date,
        link: `/orders/${ord.id}`,
      });
    });

    // Add recent production
    (recentProdRes.data || []).forEach((p: unknown) => {
      const prod = p as {
        id: string;
        printed_weight_kg: number;
        entry_date: string;
        created_at: string;
        order: { order_number: string; client: { name: string } | null } | null;
      };
      activities.push({
        id: `prod-${prod.id}`,
        type: "production",
        title: prod.order?.order_number || "Production Entry",
        subtitle: prod.order?.client?.name || "Printed Roll",
        amount_or_weight: `${Number(prod.printed_weight_kg || 0).toFixed(1)} kg`,
        timestamp: prod.created_at || prod.entry_date,
        link: "/orders",
      });
    });

    // Add recent deliveries
    (recentDelRes.data || []).forEach((d: unknown) => {
      const del = d as {
        id: string;
        delivered_weight_kg: number;
        delivery_date: string;
        created_at: string;
        order: { order_number: string; client: { name: string } | null } | null;
      };
      activities.push({
        id: `del-${del.id}`,
        type: "delivery",
        title: del.order?.order_number || "Delivery",
        subtitle: del.order?.client?.name || "Dispatched",
        amount_or_weight: `${Number(del.delivered_weight_kg || 0).toFixed(1)} kg`,
        timestamp: del.created_at || del.delivery_date,
        link: "/orders",
      });
    });

    // Add recent payments
    (recentPaymentsRes.data || []).forEach((p: unknown) => {
      const pay = p as {
        id: string;
        amount: number;
        payment_date: string;
        created_at: string;
        bill: { id: string; bill_number: string } | null;
        client: { name: string } | null;
      };
      activities.push({
        id: `pay-${pay.id}`,
        type: "payment",
        title: `Payment: ₹${Number(pay.amount || 0).toLocaleString("en-IN")}`,
        subtitle: `${pay.client?.name || "Client"} (${pay.bill?.bill_number || "Bill"})`,
        timestamp: pay.created_at || pay.payment_date,
        link: pay.bill?.id ? `/billing/${pay.bill.id}` : "/billing",
      });
    });

    // Add recent expenses
    (recentExpRes.data || []).forEach((e: unknown) => {
      const exp = e as {
        id: string;
        amount: number;
        description: string;
        expense_date: string;
        created_at: string;
        category: { name_en: string; name_ta: string } | null;
      };
      activities.push({
        id: `exp-${exp.id}`,
        type: "expense",
        title: `Expense: ₹${Number(exp.amount || 0).toLocaleString("en-IN")}`,
        subtitle: exp.category?.name_en || exp.description || "Expense",
        timestamp: exp.created_at || exp.expense_date,
        link: "/expenses",
      });
    });

    // Sort combined activities by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivities = activities.slice(0, 8);

    return {
      data: {
        kpis: {
          total_billed_amount: roundCurrency(totalBilled),
          total_collected_amount: roundCurrency(totalCollected),
          total_outstanding_amount: roundCurrency(totalOutstanding),
          total_expenses_amount: roundCurrency(totalExpenses),
          salary_payable_amount: roundCurrency(totalSalaryPayable),
          production_printed_weight_kg: roundCurrency(totalPrintedWeight),
          production_delivered_weight_kg: roundCurrency(totalDeliveredWeight),
          active_orders_count: activeOrdersCount,
          active_clients_count: activeClientsCount,
        },
        chart,
        expenses: {
          total_amount: roundCurrency(totalExpenses),
          categories: expenseCategories,
        },
        production: {
          received_weight_kg: roundCurrency(totalReceivedWeight),
          printed_weight_kg: roundCurrency(totalPrintedWeight),
          delivered_weight_kg: roundCurrency(totalDeliveredWeight),
          remaining_weight_kg: roundCurrency(remainingWeight),
          active_orders_count: activeOrdersCount,
          completed_orders_count: periodOrders.filter((o) => o.status === "completed" || o.status === "delivered").length,
        },
        outstanding_clients: outstandingClients,
        recent_payments: recentPayments,
        recent_activities: recentActivities,
      },
    };
  } catch (err) {
    console.error("[getDashboardData] Unexpected error:", err);
    return { error: "Failed to load dashboard data" };
  }
}
