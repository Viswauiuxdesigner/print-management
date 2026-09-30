import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getClients } from "@/lib/actions/clients";
import { getOrders } from "@/lib/actions/orders";
import { AppHeader } from "@/components/layout/AppHeader";
import { BillForm } from "@/components/billing/BillForm";

interface NewBillPageProps {
  searchParams: {
    client_id?: string;
    order_id?: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("billing");
  return {
    title: t("new_bill_title"),
  };
}

export const dynamic = "force-dynamic";

export default async function NewBillPage({ searchParams }: NewBillPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();

  const [clientsRes, ordersRes] = await Promise.all([
    getClients({ status: "active" }),
    getOrders(),
  ]);

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto space-y-6">
        <BillForm
          clients={clientsRes.clients}
          orders={ordersRes.orders}
          preselectedClientId={searchParams.client_id}
          preselectedOrderId={searchParams.order_id}
          locale={locale}
        />
      </main>
    </div>
  );
}
