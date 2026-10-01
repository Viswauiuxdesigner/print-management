"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Scale, ArrowUpRight, Printer, Truck, Clock } from "lucide-react";
import type { DashboardProductionSummary } from "@/lib/types/dashboard";

interface ProductionSummaryProps {
  production: DashboardProductionSummary;
}

export function ProductionSummary({ production }: ProductionSummaryProps) {
  const t = useTranslations("dashboard");

  const printRate =
    production.received_weight_kg > 0
      ? Math.min(100, Math.round((production.printed_weight_kg / production.received_weight_kg) * 100))
      : 0;

  const deliveryRate =
    production.received_weight_kg > 0
      ? Math.min(100, Math.round((production.delivered_weight_kg / production.received_weight_kg) * 100))
      : 0;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t("production_summary_title")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("production_summary_sub")}
              </p>
            </div>
          </div>

          <Link
            href="/orders"
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-0.5"
          >
            <span>{t("view_all")}</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* 4-Cell Production Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-[11px] text-slate-500 block">
              {t("metric_received_weight")}
            </span>
            <span className="text-base font-bold font-mono text-slate-900">
              {production.received_weight_kg.toLocaleString("en-IN")} kg
            </span>
          </div>

          <div className="p-3 rounded-xl bg-teal-50/60">
            <span className="text-[11px] text-teal-700 block flex items-center gap-1">
              <Printer className="h-3 w-3" />
              <span>{t("metric_printed_weight")}</span>
            </span>
            <span className="text-base font-bold font-mono text-teal-800">
              {production.printed_weight_kg.toLocaleString("en-IN")} kg
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60">
            <span className="text-[11px] text-emerald-700 block flex items-center gap-1">
              <Truck className="h-3 w-3" />
              <span>{t("metric_delivered_weight")}</span>
            </span>
            <span className="text-base font-bold font-mono text-emerald-800">
              {production.delivered_weight_kg.toLocaleString("en-IN")} kg
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60">
            <span className="text-[11px] text-amber-700 block flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{t("metric_remaining_weight")}</span>
            </span>
            <span className="text-base font-bold font-mono text-amber-800">
              {production.remaining_weight_kg.toLocaleString("en-IN")} kg
            </span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2.5 pt-1">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">{t("printed_progress")}</span>
              <span className="font-mono font-bold text-teal-700">{printRate}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all"
                style={{ width: `${printRate}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">{t("delivered_progress")}</span>
              <span className="font-mono font-bold text-emerald-700">{deliveryRate}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all"
                style={{ width: `${deliveryRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer link */}
      <Link
        href="/orders/new"
        className="block text-center py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        + {t("action_new_order")}
      </Link>
    </div>
  );
}
