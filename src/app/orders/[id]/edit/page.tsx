import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/actions/orders";
import { getClients } from "@/lib/actions/clients";
import { AppHeader } from "@/components/layout/AppHeader";
import { OrderForm } from "@/components/orders/OrderForm";

interface EditOrderPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: EditOrderPageProps): Promise<Metadata> {
  const { order } = await getOrderById(params.id);
  const t = await getTranslations("orders");
  return {
    title: order
      ? `${t("action_edit")} — ${order.order_number}`
      : t("action_edit"),
  };
}

export const dynamic = "force-dynamic";

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const t = await getTranslations("orders");
  const { order } = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  // Get active clients (or current client if inactive)
  const { clients } = await getClients();
  const selectableClients = clients.filter(
    (c) => c.is_active || c.id === order.client_id
  );

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 lg:ml-64 lg:max-w-[calc(100%-16rem)] max-w-7xl w-full mx-auto">
        <div className="mb-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("edit_order")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-mono">
            {order.order_number} — {order.client?.name}
          </p>
        </div>

        <OrderForm
          mode="edit"
          initialData={order}
          activeClients={selectableClients}
        />
      </main>
    </div>
  );
}
