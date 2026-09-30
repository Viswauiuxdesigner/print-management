"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Package,
  Scale,
  Printer,
  Truck,
  Receipt,
  CheckCircle2,
  Clock,
  Wallet,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { ReportOverview } from "@/lib/types/reports";

interface OverviewReportProps {
  overview: ReportOverview;
  onSelectTab: (tab: string) => void;
}

export function OverviewReport({ overview, onSelectTab }: OverviewReportProps) {
  const t = useTranslations("reports");

  const metricCards = [
    {
      id: "orders",
      label: t("metric_total_orders"),
      value: overview.total_orders,
      isCurrency: false,
      unit: t("orders_unit"),
      icon: Package,
      tab: "production",
      color: "blue",
    },
    {
      id: "received_wt",
      label: t("metric_received_weight"),
      value: overview.total_received_weight_kg,
      isCurrency: false,
      unit: "kg",
      icon: Scale,
      tab: "production",
      color: "indigo",
    },
    {
      id: "printed_wt",
      label: t("metric_printed_weight"),
      value: overview.total_printed_weight_kg,
      isCurrency: false,
      unit: "kg",
      icon: Printer,
      tab: "production",
      color: "cyan",
    },
    {
      id: "delivered_wt",
      label: t("metric_delivered_weight"),
      value: overview.total_delivered_weight_kg,
      isCurrency: false,
      unit: "kg",
      icon: Truck,
      tab: "production",
      color: "sky",
    },
    {
      id: "billed",
      label: t("metric_total_billed"),
      value: overview.total_billed_amount,
      isCurrency: true,
      unit: "",
      icon: Receipt,
      tab: "billing",
      color: "slate",
    },
    {
      id: "collected",
      label: t("metric_total_collected"),
      value: overview.total_collected_amount,
      isCurrency: true,
      unit: "",
      icon: CheckCircle2,
      tab: "payments",
      color: "emerald",
    },
    {
      id: "outstanding",
      label: t("metric_total_outstanding"),
      value: overview.total_outstanding_amount,
      isCurrency: true,
      unit: "",
      icon: Clock,
      tab: "billing",
      color: "amber",
    },
    {
      id: "expenses",
      label: t("metric_total_expenses"),
      value: overview.total_expenses_amount,
      isCurrency: true,
      unit: "",
      icon: Receipt,
      tab: "expenses",
      color: "rose",
    },
    {
      id: "salary",
      label: t("metric_total_salary_paid"),
      value: overview.total_salary_paid_amount,
      isCurrency: true,
      unit: "",
      icon: Wallet,
      tab: "salary",
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Section: Operational Activities */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {t("section_operations_summary")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metricCards.slice(0, 4).map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onSelectTab(card.tab)}
                className="text-left p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-brand-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <div className="flex items-center gap-1.5 text-xs font-medium truncate">
                    <Icon className="h-4 w-4 text-brand-600 shrink-0" />
                    <span className="truncate">{card.label}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-brand-600 transition-all shrink-0" />
                </div>
                <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-slate-900">
                  {card.value.toLocaleString("en-IN")}{" "}
                  {card.unit && <span className="text-xs font-normal text-slate-500">{card.unit}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Section: Financial Activities */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {t("section_financial_summary")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {metricCards.slice(4).map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onSelectTab(card.tab)}
                className="text-left p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-brand-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <div className="flex items-center gap-1.5 text-xs font-medium truncate">
                    <Icon className="h-4 w-4 text-brand-600 shrink-0" />
                    <span className="truncate">{card.label}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-brand-600 transition-all shrink-0" />
                </div>
                <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-slate-900 truncate">
                  ₹{card.value.toLocaleString("en-IN")}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {t("section_explore_reports")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onSelectTab("production")}
            className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Printer className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                {t("tab_production")}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {t("desc_production_report")}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("clients")}
            className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                {t("tab_clients")}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {t("desc_client_report")}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("expenses")}
            className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                {t("tab_expenses")}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {t("desc_expense_report")}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("attendance")}
            className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                {t("tab_attendance")}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {t("desc_attendance_report")}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("salary")}
            className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                {t("tab_salary")}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {t("desc_salary_report")}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("financial_summary")}
            className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                {t("tab_financial_summary")}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {t("desc_financial_summary")}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
