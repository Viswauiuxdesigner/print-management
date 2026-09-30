import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/layout/AppHeader";
import { ReportsView } from "@/components/reports/ReportsView";
import {
  getDefaultDateRange,
  getReportOverview,
  getProductionReport,
  getClientReport,
  getExpenseReport,
  getAttendanceReport,
  getSalaryReport,
  getAdvanceReport,
  getBillingReport,
  getPaymentReport,
  getFinancialSummary,
} from "@/lib/actions/reports";
import { getClients } from "@/lib/actions/clients";
import { getEmployees } from "@/lib/actions/employees";
import { getExpenseCategories } from "@/lib/actions/expenses";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reports");
  return {
    title: t("title"),
  };
}

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Server-side Role Authorization Check
  const { data: roleData } = await supabase.rpc("get_current_user_role");
  const role = (roleData as string) || "staff";

  if (!["owner", "admin", "manager"].includes(role)) {
    redirect("/dashboard");
  }

  const locale = await getLocale();
  const defaultDates = getDefaultDateRange();
  const initialFilters = {
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
  };

  // Fetch initial report datasets in parallel
  const [
    overviewRes,
    productionRes,
    clientsRes,
    expensesRes,
    attendanceRes,
    salaryRes,
    advancesRes,
    billingRes,
    paymentsRes,
    financialSummaryRes,
    allClientsRes,
    allEmployeesRes,
    categoriesRes,
  ] = await Promise.all([
    getReportOverview(initialFilters),
    getProductionReport(initialFilters),
    getClientReport(initialFilters),
    getExpenseReport(initialFilters),
    getAttendanceReport(initialFilters),
    getSalaryReport(initialFilters),
    getAdvanceReport(initialFilters),
    getBillingReport(initialFilters),
    getPaymentReport(initialFilters),
    getFinancialSummary(initialFilters),
    getClients({ status: "all" }),
    getEmployees({ status: "all" }),
    getExpenseCategories(false),
  ]);

  const clientOptions = (allClientsRes.clients || []).map((c) => ({
    value: c.id,
    label: `${c.name} (${c.client_code})`,
  }));

  const employeeOptions = (allEmployeesRes.employees || []).map((e) => ({
    value: e.id,
    label: `${e.full_name} (${e.employee_code})`,
  }));

  const categoryOptions = (categoriesRes.categories || []).map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        <ReportsView
          initialOverview={overviewRes.overview}
          initialProductionRows={productionRes.rows}
          initialClientRows={clientsRes.rows}
          initialExpenseData={expensesRes.data}
          initialAttendanceRows={attendanceRes.rows}
          initialSalaryRows={salaryRes.rows}
          initialAdvanceRows={advancesRes.rows}
          initialBillingRows={billingRes.rows}
          initialPaymentRows={paymentsRes.rows}
          initialFinancialSummary={financialSummaryRes.summary}
          initialFilters={initialFilters}
          clientOptions={clientOptions}
          employeeOptions={employeeOptions}
          categoryOptions={categoryOptions}
          locale={locale}
        />
      </main>
    </div>
  );
}
