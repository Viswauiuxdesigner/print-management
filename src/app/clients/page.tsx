import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getClients } from "@/lib/actions/clients";
import { AppHeader } from "@/components/layout/AppHeader";
import { ClientList } from "@/components/clients/ClientList";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("clients");
  return {
    title: t("title"),
  };
}

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const { clients } = await getClients();

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 lg:ml-64 lg:max-w-[calc(100%-16rem)] max-w-7xl w-full mx-auto">
        <ClientList initialClients={clients} />
      </main>
    </div>
  );
}
