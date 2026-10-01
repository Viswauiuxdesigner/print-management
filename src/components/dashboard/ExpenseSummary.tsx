"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Receipt, ArrowUpRight } from "lucide-react";
import type { DashboardExpenseCategory } from "@/lib/types/dashboard";

interface ExpenseSummaryProps {
  totalAmount: number;
  categories: DashboardExpenseCategory[];
  locale?: string;
}

export function ExpenseSummary({
  totalAmount,
  categories,
  locale = "en",
}: ExpenseSummaryProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t("expenses_summary_title")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("expenses_summary_sub")}
              </p>
            </div>
          </div>

          <Link
            href="/expenses"
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-0.5"
          >
            <span>{t("view_all")}</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Total Expense Highlight */}
        <div className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">
            {t("total_expenses_in_range")}
          </span>
          <span className="text-lg font-bold font-mono text-rose-700">
            ₹{totalAmount.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Category Breakdown Progress Bars */}
        {categories.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            {t("no_expenses_in_range")}
          </div>
        ) : (
          <div className="space-y-3">
            {categories.slice(0, 5).map((cat) => {
              const categoryLabel =
                locale === "ta" ? cat.name_ta || cat.name_en : cat.name_en;

              return (
                <div key={cat.category_id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {categoryLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        ₹{cat.amount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all"
                      style={{ width: `${Math.max(2, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer link */}
      <Link
        href="/expenses/new"
        className="block text-center py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        + {t("record_expense")}
      </Link>
    </div>
  );
}
