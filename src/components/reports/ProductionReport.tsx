"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Package,
  Scale,
  Printer,
  Truck,
  Layers,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import type { ProductionReportRow } from "@/lib/types/reports";
import { Badge } from "@/components/ui/Badge";

interface ProductionReportProps {
  rows: ProductionReportRow[];
  locale: string;
}

export function ProductionReport({ rows, locale }: ProductionReportProps) {
  const t = useTranslations("reports");
  const tOrders = useTranslations("orders");

  // Summary Totals
  const totalOrders = rows.length;
  const totalRolls = rows.reduce((s, r) => s + (r.number_of_rolls || 0), 0);
  const totalReceived = rows.reduce((s, r) => s + r.received_weight_kg, 0);
  const totalPrinted = rows.reduce((s, r) => s + r.printed_weight_kg, 0);
  const totalDelivered = rows.reduce((s, r) => s + r.delivered_weight_kg, 0);
  const totalRemaining = rows.reduce((s, r) => s + r.remaining_weight_kg, 0);

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">{tOrders("status_completed")}</Badge>;
      case "delivered":
        return <Badge variant="success">{tOrders("status_delivered")}</Badge>;
      case "partially_delivered":
        return <Badge variant="warning">{tOrders("status_partially_delivered")}</Badge>;
      case "in_production":
        return <Badge variant="brand">{tOrders("status_in_production")}</Badge>;
      case "received":
      default:
        return <Badge variant="neutral">{tOrders("status_received")}</Badge>;
    }
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          {t("no_production_data")}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {t("no_data_date_hint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Package className="h-3.5 w-3.5 text-blue-600" />
            <span>{t("metric_total_orders")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-slate-900">
            {totalOrders}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Layers className="h-3.5 w-3.5 text-indigo-600" />
            <span>{t("metric_total_rolls")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-slate-900">
            {totalRolls}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Scale className="h-3.5 w-3.5 text-sky-600" />
            <span>{t("metric_received_weight")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-slate-900">
            {totalReceived.toLocaleString("en-IN")}{" "}
            <span className="text-[11px] font-normal text-slate-500">kg</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Printer className="h-3.5 w-3.5 text-teal-600" />
            <span>{t("metric_printed_weight")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-teal-700">
            {totalPrinted.toLocaleString("en-IN")}{" "}
            <span className="text-[11px] font-normal text-teal-600">kg</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Truck className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t("metric_delivered_weight")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-emerald-700">
            {totalDelivered.toLocaleString("en-IN")}{" "}
            <span className="text-[11px] font-normal text-emerald-600">kg</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Scale className="h-3.5 w-3.5 text-amber-600" />
            <span>{t("metric_remaining_weight")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-amber-700">
            {totalRemaining.toLocaleString("en-IN")}{" "}
            <span className="text-[11px] font-normal text-amber-600">kg</span>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_order_date")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_order_number")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_client")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_rolls")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_received_kg")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_printed_kg")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_delivered_kg")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_remaining_kg")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
            {rows.map((row) => (
              <tr key={row.order_id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-600">
                  {new Date(row.order_date).toLocaleDateString(
                    locale === "ta" ? "ta-IN" : "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                  <Link
                    href={`/orders/${row.order_id}`}
                    className="flex items-center gap-1 text-brand-600 hover:text-brand-800 hover:underline"
                  >
                    <span>{row.order_number}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium text-slate-800">{row.client_name}</div>
                  {row.client_code && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      {row.client_code}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono">
                  {row.number_of_rolls}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-medium text-slate-900">
                  {row.received_weight_kg.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-medium text-teal-700">
                  {row.printed_weight_kg.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-medium text-emerald-700">
                  {row.delivered_weight_kg.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-medium text-amber-700">
                  {row.remaining_weight_kg.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {getOrderStatusBadge(row.status)}
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
            key={row.order_id}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/orders/${row.order_id}`}
                  className="text-sm font-bold text-brand-600 flex items-center gap-1 hover:underline"
                >
                  <span>{row.order_number}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <div className="text-xs font-medium text-slate-800 mt-0.5">
                  {row.client_name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {new Date(row.order_date).toLocaleDateString(
                    locale === "ta" ? "ta-IN" : "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </div>
              </div>
              <div>{getOrderStatusBadge(row.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500 block text-[10px]">{t("col_received_kg")}</span>
                <span className="font-bold font-mono text-slate-900">
                  {row.received_weight_kg.toFixed(2)} kg
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {row.number_of_rolls} {t("col_rolls")}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-teal-50/60">
                <span className="text-teal-700 block text-[10px]">{t("col_printed_kg")}</span>
                <span className="font-bold font-mono text-teal-800">
                  {row.printed_weight_kg.toFixed(2)} kg
                </span>
              </div>

              <div className="p-2 rounded-lg bg-emerald-50/60">
                <span className="text-emerald-700 block text-[10px]">{t("col_delivered_kg")}</span>
                <span className="font-bold font-mono text-emerald-800">
                  {row.delivered_weight_kg.toFixed(2)} kg
                </span>
              </div>

              <div className="p-2 rounded-lg bg-amber-50/60">
                <span className="text-amber-700 block text-[10px]">{t("col_remaining_kg")}</span>
                <span className="font-bold font-mono text-amber-800">
                  {row.remaining_weight_kg.toFixed(2)} kg
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
