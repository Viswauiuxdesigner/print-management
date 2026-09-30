import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getBillById } from "@/lib/actions/billing";
import { AppHeader } from "@/components/layout/AppHeader";
import { BillDetail } from "@/components/billing/BillDetail";

interface BillDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: BillDetailPageProps): Promise<Metadata> {
  const t = await getTranslations("billing");
  const { bill } = await getBillById(params.id);

  if (!bill) {
    return { title: t("bill_details_title") };
  }

  return {
    title: `${bill.bill_number} - ${bill.client?.name || "Client"} - ${t("bill_details_title")}`,
  };
}

export const dynamic = "force-dynamic";

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const { bill, error } = await getBillById(params.id);

  if (error || !bill) {
    notFound();
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto space-y-6">
        <BillDetail bill={bill} locale={locale} />
      </main>
    </div>
  );
}
