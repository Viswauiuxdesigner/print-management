"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Users,
  Search,
  Scale,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Inbox,
  Phone,
} from "lucide-react";
import type { ClientReportRow } from "@/lib/types/reports";
import { Badge } from "@/components/ui/Badge";

interface ClientsReportProps {
  rows: ClientReportRow[];
  locale: string;
}

export function ClientsReport({ rows, locale }: ClientsReportProps) {
  const t = useTranslations("reports");
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  // Filter rows by search and active toggle
  const filteredRows = rows.filter((r) => {
    if (activeOnly && !r.is_active) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = r.client_name.toLowerCase().includes(q);
      const matchCode = r.client_code.toLowerCase().includes(q);
      const matchCompany = r.company_name?.toLowerCase().includes(q);
      const matchPhone = r.phone?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCompany && !matchPhone) return false;
    }
    return true;
  });

  // Summary totals across filtered clients
  const totalClients = filteredRows.length;
  const totalOrders = filteredRows.reduce((s, r) => s + r.orders_count, 0);
  const totalReceived = filteredRows.reduce((s, r) => s + r.received_weight_kg, 0);
  const totalDelivered = filteredRows.reduce((s, r) => s + r.delivered_weight_kg, 0);
  const totalBilled = filteredRows.reduce((s, r) => s + r.total_billed, 0);
  const totalCollected = filteredRows.reduce((s, r) => s + r.total_paid, 0);
  const totalOutstanding = filteredRows.reduce((s, r) => s + r.outstanding_amount, 0);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          {t("no_client_data")}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {t("no_data_date_hint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_client_placeholder")}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl cursor-pointer shadow-2xs">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
            <span>{t("filter_active_only")}</span>
          </label>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Users className="h-3.5 w-3.5 text-brand-600" />
            <span>{t("metric_total_clients")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-slate-900">
            {totalClients}
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
            <Scale className="h-3.5 w-3.5 text-teal-600" />
            <span>{t("metric_delivered_weight")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-teal-700">
            {totalDelivered.toLocaleString("en-IN")}{" "}
            <span className="text-[11px] font-normal text-teal-600">kg</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <CreditCard className="h-3.5 w-3.5 text-slate-600" />
            <span>{t("metric_total_billed")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-slate-900 truncate">
            ₹{totalBilled.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t("metric_total_collected")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-emerald-700 truncate">
            ₹{totalCollected.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>{t("metric_total_outstanding")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-amber-700 truncate">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_client")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_phone")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_orders")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_received_kg")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_delivered_kg")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_total_billed")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_total_paid")}
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
            {filteredRows.map((row) => (
              <tr key={row.client_id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/clients/${row.client_id}`}
                    className="flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-800 hover:underline"
                  >
                    <span>{row.client_name}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                  <div className="text-[11px] text-slate-400">
                    {row.company_name || row.client_code}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-600">
                  {row.phone || "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-medium">
                  {row.orders_count}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-slate-900">
                  {row.received_weight_kg.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-teal-700">
                  {row.delivered_weight_kg.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-semibold text-slate-900">
                  ₹{row.total_billed.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-semibold text-emerald-700">
                  ₹{row.total_paid.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-amber-700">
                  ₹{row.outstanding_amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {row.is_active ? (
                    <Badge variant="success">{t("active")}</Badge>
                  ) : (
                    <Badge variant="neutral">{t("inactive")}</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredRows.map((row) => (
          <div
            key={row.client_id}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/clients/${row.client_id}`}
                  className="text-sm font-bold text-brand-600 flex items-center gap-1 hover:underline"
                >
                  <span>{row.client_name}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                {row.company_name && (
                  <div className="text-xs text-slate-600 mt-0.5">{row.company_name}</div>
                )}
                {row.phone && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" />
                    <span>{row.phone}</span>
                  </div>
                )}
              </div>
              <div>
                {row.is_active ? (
                  <Badge variant="success">{t("active")}</Badge>
                ) : (
                  <Badge variant="neutral">{t("inactive")}</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500 block text-[10px]">{t("col_orders")}</span>
                <span className="font-bold font-mono text-slate-900">{row.orders_count}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {row.received_weight_kg.toFixed(2)} kg {t("received")}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-teal-50/60">
                <span className="text-teal-700 block text-[10px]">{t("col_delivered_kg")}</span>
                <span className="font-bold font-mono text-teal-800">
                  {row.delivered_weight_kg.toFixed(2)} kg
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500 block text-[10px]">{t("col_total_billed")}</span>
                <span className="font-bold font-mono text-slate-900">
                  ₹{row.total_billed.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-amber-50/60">
                <span className="text-amber-700 block text-[10px]">{t("col_outstanding")}</span>
                <span className="font-bold font-mono text-amber-800">
                  ₹{row.outstanding_amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
