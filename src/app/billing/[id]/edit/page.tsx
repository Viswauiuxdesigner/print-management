import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getBillById } from "@/lib/actions/billing";
import { getClients } from "@/lib/actions/clients";
import { getOrders } from "@/lib/actions/orders";
import { AppHeader } from "@/components/layout/AppHeader";
import { BillForm } from "@/components/billing/BillForm";

interface EditBillPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: EditBillPageProps): Promise<Metadata> {
  const t = await getTranslations("billing");
  const { bill } = await getBillById(params.id);

  if (!bill) {
    return { title: t("edit_bill_title") };
  }

  return {
    title: `${t("edit_bill_title")} - ${bill.bill_number}`,
  };
}

export const dynamic = "force-dynamic";

export default async function EditBillPage({ params }: EditBillPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();

  const [billRes, clientsRes, ordersRes] = await Promise.all([
    getBillById(params.id),
    getClients({ status: "all" }),
    getOrders(),
  ]);

  if (billRes.error || !billRes.bill) {
    notFound();
  }

  if (billRes.bill.status === "cancelled") {
    redirect(`/billing/${params.id}`);
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 lg:ml-64 lg:max-w-[calc(100%-16rem)] max-w-4xl w-full mx-auto space-y-6">
        <BillForm
          initialBill={billRes.bill}
          clients={clientsRes.clients}
          orders={ordersRes.orders}
          locale={locale}
        />
      </main>
    </div>
  );
}
