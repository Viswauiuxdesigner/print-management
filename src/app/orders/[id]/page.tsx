import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/actions/orders";
import { AppHeader } from "@/components/layout/AppHeader";
import { OrderDetail } from "@/components/orders/OrderDetail";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { order } = await getOrderById(params.id);
  return {
    title: order
      ? `${order.order_number} - ${order.client?.name || "Order"}`
      : "Order Details",
  };
}

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const { order } = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 lg:ml-64 lg:max-w-[calc(100%-16rem)] max-w-7xl w-full mx-auto">
        <OrderDetail order={order} />
      </main>
    </div>
  );
}
