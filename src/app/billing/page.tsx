import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import {
  getBillingSummary,
  getBills,
  getOutstandingClients,
} from "@/lib/actions/billing";
import { getPaymentHistory } from "@/lib/actions/client-payments";
import { getClients } from "@/lib/actions/clients";
import { AppHeader } from "@/components/layout/AppHeader";
import { BillingDashboard } from "@/components/billing/BillingDashboard";
import type { BillStatus, BillingType } from "@/lib/types/billing";

interface BillingPageProps {
  searchParams: {
    tab?: string;
    query?: string;
    client_id?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("billing");
  return {
    title: t("title"),
  };
}

export const dynamic = "force-dynamic";

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();

  const [summaryRes, billsRes, outstandingRes, historyRes, clientsRes] =
    await Promise.all([
      getBillingSummary(),
      getBills({
        query: searchParams.query,
        client_id: searchParams.client_id,
        status: searchParams.status as BillStatus | "all" | undefined,
        billing_type: searchParams.type as BillingType | "all" | undefined,
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
      }),
      getOutstandingClients(),
      getPaymentHistory(),
      getClients({ status: "all" }),
    ]);

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 lg:ml-64 lg:max-w-[calc(100%-16rem)] max-w-7xl w-full mx-auto space-y-6">
        <BillingDashboard
          initialSummary={summaryRes.summary}
          initialBills={billsRes.bills}
          outstandingClients={outstandingRes.clients}
          paymentsHistory={historyRes.payments}
          clients={clientsRes.clients}
          initialTab={searchParams.tab}
          locale={locale}
        />
      </main>
    </div>
  );
}
