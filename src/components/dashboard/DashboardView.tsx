"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2, AlertCircle } from "lucide-react";
import type { DashboardData } from "@/lib/types/dashboard";
import type { DatePreset, ReportDateRange } from "@/lib/reports/date-utils";
import { getDashboardData } from "@/lib/actions/dashboard";

import { DashboardHeader } from "./DashboardHeader";
import { DashboardKpiCards } from "./DashboardKpiCards";
import { RevenueCollectionChart } from "./RevenueCollectionChart";
import { ExpenseSummary } from "./ExpenseSummary";
import { ProductionSummary } from "./ProductionSummary";
import { OutstandingClients } from "./OutstandingClients";
import { RecentPayments } from "./RecentPayments";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";

interface DashboardViewProps {
  initialData: DashboardData;
  initialRange: ReportDateRange;
  initialPreset: DatePreset;
  locale: string;
}

export function DashboardView({
  initialData,
  initialRange,
  initialPreset,
  locale,
}: DashboardViewProps) {
  const t = useTranslations("dashboard");

  const [dashboardData, setDashboardData] = useState<DashboardData>(initialData);
  const [currentRange, setCurrentRange] = useState<ReportDateRange>(initialRange);
  const [currentPreset, setCurrentPreset] = useState<DatePreset>(initialPreset);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRangeChange = (newRange: ReportDateRange, newPreset: DatePreset) => {
    setCurrentRange(newRange);
    setCurrentPreset(newPreset);

    startTransition(async () => {
      setErrorMessage(null);
      try {
        const res = await getDashboardData({
          startDate: newRange.startDate,
          endDate: newRange.endDate,
        });

        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.data) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error("Dashboard refresh error:", err);
        setErrorMessage("Failed to refresh dashboard data");
      }
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Date Filtering */}
      <DashboardHeader
        currentRange={currentRange}
        currentPreset={currentPreset}
        onRangeChange={handleRangeChange}
        isLoading={isPending}
      />

      {/* Quick Actions Strip */}
      <QuickActions />

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Dashboard Content with Loading Overlay */}
      <div className="relative min-h-[400px] space-y-6">
        {isPending && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-2xs z-10 flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
              <span>{t("loading_dashboard")}</span>
            </div>
          </div>
        )}

        {/* 1. 8-KPI Cards Grid */}
        <DashboardKpiCards kpis={dashboardData.kpis} />

        {/* 2. Revenue vs Collections Chart */}
        <RevenueCollectionChart data={dashboardData.chart} locale={locale} />

        {/* 3. Two-Column Operational & Financial Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Expenses & Payments */}
          <div className="space-y-6 flex flex-col justify-between">
            <ExpenseSummary
              totalAmount={dashboardData.expenses.total_amount}
              categories={dashboardData.expenses.categories}
              locale={locale}
            />
            <RecentPayments
              payments={dashboardData.recent_payments}
              locale={locale}
            />
          </div>

          {/* Right Column: Production & Outstanding Clients */}
          <div className="space-y-6 flex flex-col justify-between">
            <ProductionSummary production={dashboardData.production} />
            <OutstandingClients clients={dashboardData.outstanding_clients} />
          </div>
        </div>

        {/* 4. Recent Activities Feed */}
        <RecentActivity
          activities={dashboardData.recent_activities}
          locale={locale}
        />
      </div>
    </div>
  );
}
