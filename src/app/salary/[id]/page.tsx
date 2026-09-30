import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getSalaryRecordById } from "@/lib/actions/salary";
import { AppHeader } from "@/components/layout/AppHeader";
import { SalaryDetail } from "@/components/salary/SalaryDetail";

interface SalaryDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: SalaryDetailPageProps): Promise<Metadata> {
  const t = await getTranslations("salary");
  const { record } = await getSalaryRecordById(params.id);

  if (!record) {
    return { title: t("detail_title") };
  }

  return {
    title: `${record.employee?.full_name || "Employee"} - ${t("detail_title")}`,
  };
}

export const dynamic = "force-dynamic";

export default async function SalaryDetailPage({
  params,
}: SalaryDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const { record, error } = await getSalaryRecordById(params.id);

  if (error || !record) {
    notFound();
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-5xl w-full mx-auto space-y-6">
        <SalaryDetail record={record} locale={locale} />
      </main>
    </div>
  );
}
