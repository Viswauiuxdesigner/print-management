import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getExpenseById } from "@/lib/actions/expenses";
import { AppHeader } from "@/components/layout/AppHeader";
import { ExpenseDetail } from "@/components/expenses/ExpenseDetail";

interface ExpenseDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ExpenseDetailPageProps): Promise<Metadata> {
  const { expense } = await getExpenseById(params.id);
  return {
    title: expense
      ? `Expense ₹${expense.amount} — ${expense.category?.name_en || "Detail"}`
      : "Expense Details",
  };
}

export const dynamic = "force-dynamic";

export default async function ExpenseDetailPage({
  params,
}: ExpenseDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const { expense } = await getExpenseById(params.id);

  if (!expense) {
    notFound();
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 lg:ml-64 lg:max-w-[calc(100%-16rem)] max-w-7xl w-full mx-auto">
        <ExpenseDetail expense={expense} locale={locale} />
      </main>
    </div>
  );
}
