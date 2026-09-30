"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Receipt,
  Layers,
  TrendingDown,
  Inbox,
  Tag,
} from "lucide-react";
import type { ExpenseReportData } from "@/lib/types/reports";
import { Badge } from "@/components/ui/Badge";

interface ExpensesReportProps {
  data: ExpenseReportData;
  locale: string;
}

export function ExpensesReport({ data, locale }: ExpensesReportProps) {
  const t = useTranslations("reports");
  const tExpenses = useTranslations("expenses");
  const [showVoidedOnly, setShowVoidedOnly] = useState(false);

  const displayedExpenses = data.expenses.filter((e) => {
    if (showVoidedOnly) return e.is_void;
    return true;
  });

  if (data.expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          {t("no_expense_data")}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {t("no_data_date_hint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Receipt className="h-4 w-4 text-rose-600" />
            <span>{t("metric_total_expenses")}</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900">
            ₹{data.total_amount.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {t("active_expenses_only")}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Layers className="h-4 w-4 text-slate-600" />
            <span>{t("metric_expense_entries")}</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {data.entries_count}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {t("recorded_entries")}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <TrendingDown className="h-4 w-4 text-indigo-600" />
            <span>{t("metric_average_expense")}</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-indigo-900">
            ₹{data.average_expense.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {t("per_active_entry")}
          </div>
        </div>
      </div>

      {/* Category Breakdown Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" />
          <span>{t("section_expense_category_breakdown")}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.categories.map((cat) => (
            <div
              key={cat.category_id}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {cat.category_name}
                </span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                  {cat.entries_count} {t("entries_short")}
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-rose-700">
                ₹{cat.total_amount.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>{t("average")}:</span>
                <span className="font-mono font-medium text-slate-700">
                  ₹{cat.average_amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chronological Ledger Section */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t("section_expense_ledger")}
          </h3>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer shadow-2xs">
            <input
              type="checkbox"
              checked={showVoidedOnly}
              onChange={(e) => setShowVoidedOnly(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
            />
            <span>{t("filter_voided_only")}</span>
          </label>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t("col_date")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t("col_category")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t("col_description")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t("col_payment_method")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t("col_reference")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t("col_amount")}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t("col_status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
              {displayedExpenses.map((exp) => (
                <tr
                  key={exp.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    exp.is_void ? "bg-rose-50/30 opacity-70" : ""
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-600">
                    {new Date(exp.expense_date).toLocaleDateString(
                      locale === "ta" ? "ta-IN" : "en-IN",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                    {exp.category_name}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                    {exp.description || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap capitalize text-slate-700 font-medium">
                    {exp.payment_method}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-500">
                    {exp.reference_number || "—"}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-right font-mono font-bold ${
                      exp.is_void ? "line-through text-slate-400" : "text-rose-700"
                    }`}
                  >
                    ₹{exp.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {exp.is_void ? (
                      <Badge variant="danger">{tExpenses("status_voided")}</Badge>
                    ) : (
                      <Badge variant="success">{t("active")}</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {displayedExpenses.map((exp) => (
            <div
              key={exp.id}
              className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 ${
                exp.is_void ? "bg-rose-50/30 opacity-75" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-slate-900">{exp.category_name}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(exp.expense_date).toLocaleDateString(
                      locale === "ta" ? "ta-IN" : "en-IN",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )}
                  </div>
                </div>
                <div>
                  {exp.is_void ? (
                    <Badge variant="danger">{tExpenses("status_voided")}</Badge>
                  ) : (
                    <span
                      className={`text-base font-bold font-mono ${
                        exp.is_void ? "line-through text-slate-400" : "text-rose-700"
                      }`}
                    >
                      ₹{exp.amount.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              {exp.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                  {exp.description}
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="capitalize">{exp.payment_method}</span>
                {exp.reference_number && (
                  <span className="font-mono">{exp.reference_number}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
