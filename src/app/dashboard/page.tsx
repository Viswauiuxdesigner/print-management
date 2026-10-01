import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/layout/AppHeader";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { getDashboardData } from "@/lib/actions/dashboard";
import { getDefaultDateRange } from "@/lib/reports/date-utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return {
    title: t("title"),
  };
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const initialRange = getDefaultDateRange();
  const dashboardRes = await getDashboardData(initialRange);

  const fallbackData = {
    kpis: {
      total_billed_amount: 0,
      total_collected_amount: 0,
      total_outstanding_amount: 0,
      total_expenses_amount: 0,
      salary_payable_amount: 0,
      production_printed_weight_kg: 0,
      production_delivered_weight_kg: 0,
      active_orders_count: 0,
      active_clients_count: 0,
    },
    chart: [],
    expenses: {
      total_amount: 0,
      categories: [],
    },
    production: {
      received_weight_kg: 0,
      printed_weight_kg: 0,
      delivered_weight_kg: 0,
      remaining_weight_kg: 0,
      active_orders_count: 0,
      completed_orders_count: 0,
    },
    outstanding_clients: [],
    recent_payments: [],
    recent_activities: [],
  };

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 lg:ml-64 lg:max-w-[calc(100%-16rem)] max-w-7xl w-full mx-auto">
        <DashboardView
          initialData={dashboardRes.data || fallbackData}
          initialRange={initialRange}
          initialPreset="this_month"
          locale={locale}
        />
      </main>
    </div>
  );
}
