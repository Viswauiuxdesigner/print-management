"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Wallet,
  Users,
  CheckCircle2,
  Clock,
  TrendingDown,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import type { SalaryReportRow } from "@/lib/types/reports";
import { Badge } from "@/components/ui/Badge";

interface SalaryReportProps {
  rows: SalaryReportRow[];
  locale: string;
}

export function SalaryReport({ rows, locale }: SalaryReportProps) {
  const t = useTranslations("reports");
  const tSalary = useTranslations("salary");

  const totalEmployees = new Set(rows.map((r) => r.employee_id)).size;
  const totalGross = rows.reduce((s, r) => s + r.gross_salary, 0);
  const totalAdvanceDeductions = rows.reduce((s, r) => s + r.advance_deduction, 0);
  const totalNet = rows.reduce((s, r) => s + r.net_salary, 0);
  const totalPaid = rows.reduce((s, r) => s + r.paid_amount, 0);
  const totalPending = rows.reduce((s, r) => s + r.pending_amount, 0);

  const getSalaryStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">{tSalary("status_paid")}</Badge>;
      case "partially_paid":
        return <Badge variant="warning">{tSalary("status_partially_paid")}</Badge>;
      case "draft":
        return <Badge variant="neutral">{tSalary("status_draft")}</Badge>;
      case "pending":
      default:
        return <Badge variant="danger">{tSalary("status_pending")}</Badge>;
    }
  };

  const getMonthName = (month: number) => {
    const date = new Date(2026, month - 1, 1);
    return date.toLocaleString(locale === "ta" ? "ta-IN" : "en-US", { month: "short" });
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          {t("no_salary_data")}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {t("no_data_date_hint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Users className="h-3.5 w-3.5 text-brand-600" />
            <span>{t("metric_total_employees")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-slate-900">
            {totalEmployees}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Wallet className="h-3.5 w-3.5 text-slate-600" />
            <span>{t("col_gross_salary")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-slate-900 truncate">
            ₹{totalGross.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <TrendingDown className="h-3.5 w-3.5 text-amber-600" />
            <span>{t("col_advance_deduction")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-amber-700 truncate">
            ₹{totalAdvanceDeductions.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Wallet className="h-3.5 w-3.5 text-indigo-600" />
            <span>{t("col_net_salary")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-indigo-900 truncate">
            ₹{totalNet.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t("status_paid")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-emerald-700 truncate">
            ₹{totalPaid.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Clock className="h-3.5 w-3.5 text-rose-600" />
            <span>{t("status_pending")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-rose-700 truncate">
            ₹{totalPending.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_period")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_employee")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_salary_type")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_base_salary")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_gross_salary")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_advance_deduction")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_net_salary")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("status_paid")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("status_pending")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
            {rows.map((row) => (
              <tr key={row.record_id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                  {getMonthName(row.payroll_month)} {row.payroll_year}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/salary/${row.record_id}`}
                    className="flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-800 hover:underline"
                  >
                    <span>{row.employee_name}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {row.employee_code}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap capitalize text-slate-600">
                  {row.salary_type}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-slate-600">
                  ₹{row.base_salary.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-medium text-slate-900">
                  ₹{row.gross_salary.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-amber-700">
                  ₹{row.advance_deduction.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-indigo-900">
                  ₹{row.net_salary.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-semibold text-emerald-700">
                  ₹{row.paid_amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-rose-700">
                  ₹{row.pending_amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {getSalaryStatusBadge(row.status)}
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
            key={row.record_id}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/salary/${row.record_id}`}
                  className="text-sm font-bold text-brand-600 flex items-center gap-1 hover:underline"
                >
                  <span>{row.employee_name}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {getMonthName(row.payroll_month)} {row.payroll_year} • {row.salary_type}
                </div>
              </div>
              <div>{getSalaryStatusBadge(row.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500 block text-[10px]">{t("col_net_salary")}</span>
                <span className="font-bold font-mono text-indigo-900">
                  ₹{row.net_salary.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ₹{row.gross_salary.toLocaleString("en-IN")} gross
                </span>
              </div>

              <div className="p-2 rounded-lg bg-emerald-50/60">
                <span className="text-emerald-700 block text-[10px]">{t("status_paid")}</span>
                <span className="font-bold font-mono text-emerald-800">
                  ₹{row.paid_amount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-amber-50/60">
                <span className="text-amber-700 block text-[10px]">{t("col_advance_deduction")}</span>
                <span className="font-bold font-mono text-amber-800">
                  ₹{row.advance_deduction.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-rose-50/60">
                <span className="text-rose-700 block text-[10px]">{t("status_pending")}</span>
                <span className="font-bold font-mono text-rose-800">
                  ₹{row.pending_amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
