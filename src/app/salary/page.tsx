import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getPayrollSummary, getSalaryRecords } from "@/lib/actions/salary";
import { getEmployees } from "@/lib/actions/employees";
import { AppHeader } from "@/components/layout/AppHeader";
import { SalaryDashboard } from "@/components/salary/SalaryDashboard";
import type { SalaryStatus } from "@/lib/types/salary";

interface SalaryPageProps {
  searchParams: {
    year?: string;
    month?: string;
    employee_id?: string;
    status?: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("salary");
  return {
    title: t("title"),
  };
}

export const dynamic = "force-dynamic";

export default async function SalaryPage({ searchParams }: SalaryPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();

  const now = new Date();
  const year = searchParams.year ? parseInt(searchParams.year, 10) : now.getFullYear();
  const month = searchParams.month ? parseInt(searchParams.month, 10) : now.getMonth() + 1;

  const [summaryRes, recordsRes, employeesRes] = await Promise.all([
    getPayrollSummary(year, month),
    getSalaryRecords({
      year,
      month,
      employee_id: searchParams.employee_id,
      status: searchParams.status as SalaryStatus | "all" | undefined,
    }),
    getEmployees(),
  ]);

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto space-y-6">
        <SalaryDashboard
          initialSummary={summaryRes.summary}
          initialRecords={recordsRes.records}
          employees={employeesRes.employees}
          currentYear={year}
          currentMonth={month}
          locale={locale}
        />
      </main>
    </div>
  );
}
