"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Receipt,
  Wallet,
  Calendar,
  AlertCircle,
} from "lucide-react";
import type { FinancialSummaryData } from "@/lib/types/reports";

interface FinancialSummaryReportProps {
  summary: FinancialSummaryData;
  locale?: string;
}

export function FinancialSummaryReport({ summary }: FinancialSummaryReportProps) {
  const t = useTranslations("reports");

  const totalCashOutflows = summary.total_expenses + summary.total_salary_paid;

  return (
    <div className="space-y-6">
      {/* Date Header Badge */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-2xs w-fit">
        <Calendar className="h-4 w-4 text-brand-600" />
        <span>
          {t("reporting_period")}:{" "}
          <span className="font-mono text-slate-900">
            {summary.start_date} {t("to")} {summary.end_date}
          </span>
        </span>
      </div>

      {/* 2-Column High-Level Financial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Revenue & Receivables */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t("section_revenue_receivables")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("desc_revenue_receivables")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-xs font-medium text-slate-600">{t("metric_total_billed")}</span>
              <span className="text-base font-bold font-mono text-slate-900">
                ₹{summary.total_billed.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{t("metric_total_collected")}</span>
              </div>
              <span className="text-base font-bold font-mono text-emerald-700">
                ₹{summary.total_collected.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>{t("metric_total_outstanding")}</span>
              </div>
              <span className="text-base font-bold font-mono text-amber-700">
                ₹{summary.total_outstanding.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Operating Outflows */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t("section_operating_outflows")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("desc_operating_outflows")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60">
              <span className="text-xs font-medium text-rose-800">{t("metric_total_expenses")}</span>
              <span className="text-base font-bold font-mono text-rose-700">
                ₹{summary.total_expenses.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60">
              <span className="text-xs font-medium text-purple-800">{t("metric_total_salary_paid")}</span>
              <span className="text-base font-bold font-mono text-purple-700">
                ₹{summary.total_salary_paid.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-xs font-medium text-slate-600">
                {t("total_operating_cash_outflow")}
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                ₹{totalCashOutflows.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Advances and Loans Activity */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t("section_employee_advances_summary")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("desc_employee_advances_summary")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              {t("metric_advances_issued_period")}
            </span>
            <span className="text-base font-bold font-mono text-slate-900">
              ₹{summary.total_advances_issued.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">
              {t("metric_advances_settled_period")}
            </span>
            <span className="text-base font-bold font-mono text-emerald-700">
              ₹{summary.total_advances_settled.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Factual Integrity & Cash-Movement Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <AlertCircle className="h-4 w-4 text-slate-500" />
          <span>{t("factual_statement_title")}</span>
        </div>
        <p className="leading-relaxed">
          {t("factual_statement_desc")}
        </p>
      </div>
    </div>
  );
}
