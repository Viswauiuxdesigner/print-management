import { useTranslations } from "next-intl";
import { DollarSign, Calendar, TrendingUp, Layers } from "lucide-react";
import type { ExpenseSummary as ExpenseSummaryType } from "@/lib/types/expense";

interface ExpenseSummaryProps {
  summary: ExpenseSummaryType;
  locale: string;
}

export function ExpenseSummary({ summary, locale }: ExpenseSummaryProps) {
  const t = useTranslations("expenses");

  return (
    <div className="space-y-4">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Active Expenses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("summary_total_active")}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900">
            ₹{summary.total_active_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {summary.active_count} {t("summary_active_records")}
          </p>
        </div>

        {/* Today's Expenses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
              {t("summary_today")}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold font-mono text-brand-700">
            ₹{summary.today_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {new Date().toLocaleDateString(locale === "ta" ? "ta-IN" : "en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>

        {/* This Month's Expenses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              {t("summary_this_month")}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold font-mono text-amber-700">
            ₹{summary.this_month_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {new Date().toLocaleDateString(locale === "ta" ? "ta-IN" : "en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Category Breakdown Card */}
      {summary.category_breakdown.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Layers className="h-4 w-4 text-brand-600 shrink-0" />
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {t("summary_category_breakdown")}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {summary.category_breakdown.map((cat) => {
              const catName = locale === "ta" ? cat.name_ta : cat.name_en;
              return (
                <div
                  key={cat.category_id}
                  className="rounded-xl bg-slate-50/80 border border-slate-100 p-2.5 space-y-1 hover:bg-slate-100/80 transition-colors"
                >
                  <p className="text-xs font-medium text-slate-600 truncate" title={catName}>
                    {catName}
                  </p>
                  <p className="text-sm sm:text-base font-bold font-mono text-slate-900">
                    ₹{cat.total_amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {cat.count} {cat.count === 1 ? "entry" : "entries"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
