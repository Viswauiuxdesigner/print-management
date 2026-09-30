"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Wallet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import type { AdvanceReportRow } from "@/lib/types/reports";
import { Badge } from "@/components/ui/Badge";

interface AdvancesReportProps {
  rows: AdvanceReportRow[];
  locale: string;
}

export function AdvancesReport({ rows, locale }: AdvancesReportProps) {
  const t = useTranslations("reports");
  const tSalary = useTranslations("salary");

  const totalAdvances = rows.reduce((s, r) => s + r.amount, 0);
  const totalSettled = rows.reduce((s, r) => s + r.settled_amount, 0);
  const totalOutstanding = rows.reduce((s, r) => s + r.outstanding_amount, 0);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          {t("no_advances_data")}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {t("no_data_date_hint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Wallet className="h-4 w-4 text-slate-600" />
            <span>{t("metric_total_advances")}</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900">
            ₹{totalAdvances.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {rows.length} {t("advances_issued_count")}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{t("metric_settled_advances")}</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-emerald-700">
            ₹{totalSettled.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {t("deducted_via_payroll")}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>{t("metric_outstanding_advances")}</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-amber-700">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {t("remaining_balance_due")}
          </div>
        </div>
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
                {t("col_employee")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_amount")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_settled")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_outstanding")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_payment_method")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_reason")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
            {rows.map((row) => (
              <tr key={row.advance_id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-600">
                  {new Date(row.advance_date).toLocaleDateString(
                    locale === "ta" ? "ta-IN" : "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/employees/${row.employee_id}`}
                    className="flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-800 hover:underline"
                  >
                    <span>{row.employee_name}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {row.employee_code}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                  ₹{row.amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-medium text-emerald-700">
                  ₹{row.settled_amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-amber-700">
                  ₹{row.outstanding_amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap capitalize text-slate-600">
                  {row.payment_method}
                </td>
                <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                  {row.reason || "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {row.is_settled ? (
                    <Badge variant="success">{tSalary("settled")}</Badge>
                  ) : (
                    <Badge variant="warning">{tSalary("active_advance")}</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.advance_id}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/employees/${row.employee_id}`}
                  className="text-sm font-bold text-brand-600 flex items-center gap-1 hover:underline"
                >
                  <span>{row.employee_name}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <div className="text-xs text-slate-500 mt-0.5">
                  {new Date(row.advance_date).toLocaleDateString(
                    locale === "ta" ? "ta-IN" : "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </div>
              </div>
              <div>
                {row.is_settled ? (
                  <Badge variant="success">{tSalary("settled")}</Badge>
                ) : (
                  <Badge variant="warning">{tSalary("active_advance")}</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500 block text-[10px]">{t("col_amount")}</span>
                <span className="font-bold font-mono text-slate-900">
                  ₹{row.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50/60">
                <span className="text-emerald-700 block text-[10px]">{t("col_settled")}</span>
                <span className="font-bold font-mono text-emerald-800">
                  ₹{row.settled_amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50/60">
                <span className="text-amber-700 block text-[10px]">{t("col_outstanding")}</span>
                <span className="font-bold font-mono text-amber-800">
                  ₹{row.outstanding_amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {row.reason && (
              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                {row.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
