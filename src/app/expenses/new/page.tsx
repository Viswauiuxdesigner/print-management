import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getExpenseCategories } from "@/lib/actions/expenses";
import { AppHeader } from "@/components/layout/AppHeader";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("expenses");
  return {
    title: t("new_expense"),
  };
}

export const dynamic = "force-dynamic";

export default async function NewExpensePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const t = await getTranslations("expenses");
  const { categories = [] } = await getExpenseCategories(true);

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 lg:ml-64 lg:max-w-[calc(100%-16rem)] max-w-7xl w-full mx-auto">
        <div className="mb-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("new_expense")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("new_expense_subtitle")}
          </p>
        </div>

        <ExpenseForm
          mode="create"
          categories={categories}
          locale={locale}
        />
      </main>
    </div>
  );
}
