"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  ArrowUpRight,
  Inbox,
  Layers,
} from "lucide-react";
import type { PaymentReportRow } from "@/lib/types/reports";

interface PaymentsReportProps {
  rows: PaymentReportRow[];
  locale: string;
}

export function PaymentsReport({ rows, locale }: PaymentsReportProps) {
  const t = useTranslations("reports");

  const totalPayments = rows.length;
  const totalCollected = rows.reduce((s, r) => s + r.amount, 0);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          {t("no_payments_data")}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Layers className="h-4 w-4 text-slate-600" />
            <span>{t("metric_total_payments_count")}</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {totalPayments}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {t("payment_receipts_recorded")}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{t("metric_total_collected")}</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-emerald-700">
            ₹{totalCollected.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {t("funds_received_period")}
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
                {t("col_bill_number")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_client")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_payment_method")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_reference")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_notes")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_amount")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
            {rows.map((row) => (
              <tr key={row.payment_id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-600">
                  {new Date(row.payment_date).toLocaleDateString(
                    locale === "ta" ? "ta-IN" : "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold">
                  <Link
                    href={`/billing/${row.bill_id}`}
                    className="flex items-center gap-1 text-brand-600 hover:text-brand-800 hover:underline"
                  >
                    <span>{row.bill_number}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/clients/${row.client_id}`}
                    className="flex items-center gap-1 font-medium text-slate-800 hover:text-brand-600 hover:underline"
                  >
                    <span>{row.client_name}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                  {row.client_code && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      {row.client_code}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap capitalize text-slate-600">
                  {row.payment_method}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-500">
                  {row.reference_number || "—"}
                </td>
                <td className="px-4 py-3 max-w-xs truncate text-slate-500">
                  {row.notes || "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-emerald-700">
                  ₹{row.amount.toLocaleString("en-IN")}
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
            key={row.payment_id}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/billing/${row.bill_id}`}
                  className="text-sm font-bold text-brand-600 flex items-center gap-1 hover:underline"
                >
                  <span>{row.bill_number}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <div className="text-xs font-medium text-slate-800 mt-0.5">
                  {row.client_name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {new Date(row.payment_date).toLocaleDateString(
                    locale === "ta" ? "ta-IN" : "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-emerald-700">
                  ₹{row.amount.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-500 block capitalize">
                  {row.payment_method}
                </span>
              </div>
            </div>

            {row.reference_number && (
              <div className="text-xs font-mono text-slate-600 bg-slate-50 p-1.5 rounded-lg">
                Ref: {row.reference_number}
              </div>
            )}

            {row.notes && (
              <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
                {row.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
