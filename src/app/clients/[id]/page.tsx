import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getClientById } from "@/lib/actions/clients";
import { AppHeader } from "@/components/layout/AppHeader";
import { ClientDetail } from "@/components/clients/ClientDetail";

interface ClientDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ClientDetailPageProps): Promise<Metadata> {
  const { client } = await getClientById(params.id);
  return {
    title: client ? `${client.name} (${client.client_code})` : "Client Details",
  };
}

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const { client } = await getClientById(params.id);

  if (!client) {
    notFound();
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        <ClientDetail client={client} />
      </main>
    </div>
  );
}
