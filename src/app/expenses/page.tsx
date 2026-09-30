import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  getExpenses,
  getExpenseCategories,
  getExpenseSummary,
} from "@/lib/actions/expenses";
import { AppHeader } from "@/components/layout/AppHeader";
import { ExpenseList } from "@/components/expenses/ExpenseList";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("expenses");
  return {
    title: t("title"),
  };
}

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const [expensesRes, categoriesRes, summaryRes] = await Promise.all([
    getExpenses(),
    getExpenseCategories(true),
    getExpenseSummary(),
  ]);

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        <ExpenseList
          initialExpenses={expensesRes.expenses}
          categories={categoriesRes.categories}
          summary={summaryRes.summary}
          locale={locale}
        />
      </main>
    </div>
  );
}
