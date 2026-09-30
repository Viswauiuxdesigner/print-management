"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  TrendingDown,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import type { BillingReportRow } from "@/lib/types/reports";
import { Badge } from "@/components/ui/Badge";

interface BillingReportProps {
  rows: BillingReportRow[];
  locale: string;
}

export function BillingReport({ rows, locale }: BillingReportProps) {
  const t = useTranslations("reports");
  const tBilling = useTranslations("billing");

  const activeRows = rows.filter((r) => r.status !== "cancelled");
  const totalBills = activeRows.length;
  const totalGross = activeRows.reduce((s, r) => s + r.gross_amount, 0);
  const totalDiscount = activeRows.reduce((s, r) => s + r.discount_amount, 0);
  const totalNet = activeRows.reduce((s, r) => s + r.net_amount, 0);
  const totalPaid = activeRows.reduce((s, r) => s + r.paid_amount, 0);
  const totalPending = activeRows.reduce((s, r) => s + r.pending_amount, 0);

  const getBillStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">{tBilling("status_paid")}</Badge>;
      case "partially_paid":
        return <Badge variant="warning">{tBilling("status_partially_paid")}</Badge>;
      case "cancelled":
        return <Badge variant="danger">{tBilling("status_cancelled")}</Badge>;
      case "unpaid":
      default:
        return <Badge variant="neutral">{tBilling("status_unpaid")}</Badge>;
    }
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          {t("no_billing_data")}
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
            <Receipt className="h-3.5 w-3.5 text-slate-600" />
            <span>{t("metric_total_bills")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-slate-900">
            {totalBills}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <CreditCard className="h-3.5 w-3.5 text-blue-600" />
            <span>{t("col_gross_amount")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-slate-900 truncate">
            ₹{totalGross.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
            <span>{t("col_discount")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-rose-700 truncate">
            ₹{totalDiscount.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <CreditCard className="h-3.5 w-3.5 text-slate-900" />
            <span>{t("col_net_amount")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-slate-900 truncate">
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
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>{t("metric_total_outstanding")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-amber-700 truncate">
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
                {t("col_bill_number")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_date")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_client")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_billing_type")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_gross_amount")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_discount")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_net_amount")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("status_paid")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_outstanding")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
            {rows.map((row) => (
              <tr
                key={row.bill_id}
                className={`hover:bg-slate-50/70 transition-colors ${
                  row.status === "cancelled" ? "bg-rose-50/30 opacity-70" : ""
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap font-semibold">
                  <Link
                    href={`/billing/${row.bill_id}`}
                    className="flex items-center gap-1 text-brand-600 hover:text-brand-800 hover:underline"
                  >
                    <span>{row.bill_number}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                  {new Date(row.bill_date).toLocaleDateString(
                    locale === "ta" ? "ta-IN" : "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium text-slate-800">{row.client_name}</div>
                  {row.client_code && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      {row.client_code}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap capitalize text-slate-600">
                  {row.billing_type}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-slate-600">
                  ₹{row.gross_amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-rose-600">
                  ₹{row.discount_amount.toLocaleString("en-IN")}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap text-right font-mono font-bold ${
                    row.status === "cancelled" ? "line-through text-slate-400" : "text-slate-900"
                  }`}
                >
                  ₹{row.net_amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-semibold text-emerald-700">
                  ₹{row.paid_amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-amber-700">
                  ₹{row.pending_amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {getBillStatusBadge(row.status)}
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
            key={row.bill_id}
            className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 ${
              row.status === "cancelled" ? "bg-rose-50/30 opacity-75" : ""
            }`}
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
                  {new Date(row.bill_date).toLocaleDateString(
                    locale === "ta" ? "ta-IN" : "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )} • {row.billing_type}
                </div>
              </div>
              <div>{getBillStatusBadge(row.status)}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500 block text-[10px]">{t("col_net_amount")}</span>
                <span
                  className={`font-bold font-mono ${
                    row.status === "cancelled" ? "line-through text-slate-400" : "text-slate-900"
                  }`}
                >
                  ₹{row.net_amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50/60">
                <span className="text-emerald-700 block text-[10px]">{t("status_paid")}</span>
                <span className="font-bold font-mono text-emerald-800">
                  ₹{row.paid_amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50/60">
                <span className="text-amber-700 block text-[10px]">{t("col_outstanding")}</span>
                <span className="font-bold font-mono text-amber-800">
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
