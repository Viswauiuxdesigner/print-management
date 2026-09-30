import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getAdvances } from "@/lib/actions/advances";
import { getEmployees } from "@/lib/actions/employees";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdvancesList } from "@/components/salary/AdvancesList";

interface AdvancesPageProps {
  searchParams: {
    employee_id?: string;
    is_settled?: string;
    startDate?: string;
    endDate?: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("salary");
  return {
    title: t("advances_title"),
  };
}

export const dynamic = "force-dynamic";

export default async function AdvancesPage({ searchParams }: AdvancesPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();

  const isSettledParam =
    searchParams.is_settled === "true"
      ? true
      : searchParams.is_settled === "false"
      ? false
      : undefined;

  const [advancesRes, employeesRes] = await Promise.all([
    getAdvances({
      employee_id: searchParams.employee_id,
      is_settled: isSettledParam,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    }),
    getEmployees(),
  ]);

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto space-y-6">
        <AdvancesList
          advances={advancesRes.advances}
          employees={employeesRes.employees}
          locale={locale}
        />
      </main>
    </div>
  );
}
