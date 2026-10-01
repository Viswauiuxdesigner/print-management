import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getExpenseById, getExpenseCategories } from "@/lib/actions/expenses";
import { AppHeader } from "@/components/layout/AppHeader";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";

interface EditExpensePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: EditExpensePageProps): Promise<Metadata> {
  const { expense } = await getExpenseById(params.id);
  const t = await getTranslations("expenses");
  return {
    title: expense
      ? `${t("edit_expense")} — ₹${expense.amount}`
      : t("edit_expense"),
  };
}

export const dynamic = "force-dynamic";

export default async function EditExpensePage({
  params,
}: EditExpensePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const t = await getTranslations("expenses");
  const { expense } = await getExpenseById(params.id);

  if (!expense || expense.is_void) {
    notFound();
  }

  const { categories = [] } = await getExpenseCategories(false);

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 lg:ml-64 lg:max-w-[calc(100%-16rem)] max-w-7xl w-full mx-auto">
        <div className="mb-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("edit_expense")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-mono">
            ₹{expense.amount} — {expense.category?.name_en}
          </p>
        </div>

        <ExpenseForm
          mode="edit"
          initialData={expense}
          categories={categories}
          locale={locale}
        />
      </main>
    </div>
  );
}
