"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Printer,
  Users,
  Receipt,
  Clock,
  Wallet,
  CreditCard,
  History,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";

import type {
  ReportOverview,
  ProductionReportRow,
  ClientReportRow,
  ExpenseReportData,
  AttendanceReportRow,
  SalaryReportRow,
  AdvanceReportRow,
  BillingReportRow,
  PaymentReportRow,
  FinancialSummaryData,
  ReportFilterParams,
} from "@/lib/types/reports";

import {
  getReportOverview,
  getProductionReport,
  getClientReport,
  getExpenseReport,
  getAttendanceReport,
  getSalaryReport,
  getAdvanceReport,
  getBillingReport,
  getPaymentReport,
  getFinancialSummary,
  getDefaultDateRange,
} from "@/lib/actions/reports";

import { ReportFilterBar } from "./ReportFilterBar";
import { OverviewReport } from "./OverviewReport";
import { ProductionReport } from "./ProductionReport";
import { ClientsReport } from "./ClientsReport";
import { ExpensesReport } from "./ExpensesReport";
import { AttendanceReport } from "./AttendanceReport";
import { SalaryReport } from "./SalaryReport";
import { AdvancesReport } from "./AdvancesReport";
import { BillingReport } from "./BillingReport";
import { PaymentsReport } from "./PaymentsReport";
import { FinancialSummaryReport } from "./FinancialSummaryReport";

interface DropdownOption {
  value: string;
  label: string;
}

interface ReportsViewProps {
  initialOverview: ReportOverview;
  initialProductionRows: ProductionReportRow[];
  initialClientRows: ClientReportRow[];
  initialExpenseData: ExpenseReportData;
  initialAttendanceRows: AttendanceReportRow[];
  initialSalaryRows: SalaryReportRow[];
  initialAdvanceRows: AdvanceReportRow[];
  initialBillingRows: BillingReportRow[];
  initialPaymentRows: PaymentReportRow[];
  initialFinancialSummary: FinancialSummaryData;
  initialFilters: ReportFilterParams;
  clientOptions: DropdownOption[];
  employeeOptions: DropdownOption[];
  categoryOptions: DropdownOption[];
  locale: string;
}

export function ReportsView({
  initialOverview,
  initialProductionRows,
  initialClientRows,
  initialExpenseData,
  initialAttendanceRows,
  initialSalaryRows,
  initialAdvanceRows,
  initialBillingRows,
  initialPaymentRows,
  initialFinancialSummary,
  initialFilters,
  clientOptions,
  employeeOptions,
  categoryOptions,
  locale,
}: ReportsViewProps) {
  const t = useTranslations("reports");

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [filters, setFilters] = useState<ReportFilterParams>(initialFilters);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active state data
  const [overview, setOverview] = useState<ReportOverview>(initialOverview);
  const [productionRows, setProductionRows] = useState<ProductionReportRow[]>(initialProductionRows);
  const [clientRows, setClientRows] = useState<ClientReportRow[]>(initialClientRows);
  const [expenseData, setExpenseData] = useState<ExpenseReportData>(initialExpenseData);
  const [attendanceRows, setAttendanceRows] = useState<AttendanceReportRow[]>(initialAttendanceRows);
  const [salaryRows, setSalaryRows] = useState<SalaryReportRow[]>(initialSalaryRows);
  const [advanceRows, setAdvanceRows] = useState<AdvanceReportRow[]>(initialAdvanceRows);
  const [billingRows, setBillingRows] = useState<BillingReportRow[]>(initialBillingRows);
  const [paymentRows, setPaymentRows] = useState<PaymentReportRow[]>(initialPaymentRows);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummaryData>(initialFinancialSummary);

  const fetchTabReportData = (tab: string, currentFilters: ReportFilterParams) => {
    startTransition(async () => {
      setErrorMessage(null);
      try {
        if (tab === "overview") {
          const res = await getReportOverview(currentFilters);
          if (res.error) setErrorMessage(res.error);
          else setOverview(res.overview);
        } else if (tab === "production") {
          const res = await getProductionReport(currentFilters);
          if (res.error) setErrorMessage(res.error);
          else setProductionRows(res.rows);
        } else if (tab === "clients") {
          const res = await getClientReport(currentFilters);
          if (res.error) setErrorMessage(res.error);
          else setClientRows(res.rows);
        } else if (tab === "expenses") {
          const res = await getExpenseReport(currentFilters);
          if (res.error) setErrorMessage(res.error);
          else setExpenseData(res.data);
        } else if (tab === "attendance") {
          const res = await getAttendanceReport(currentFilters);
          if (res.error) setErrorMessage(res.error);
          else setAttendanceRows(res.rows);
        } else if (tab === "salary") {
          const res = await getSalaryReport(currentFilters);
          if (res.error) setErrorMessage(res.error);
          else setSalaryRows(res.rows);
        } else if (tab === "advances") {
          const res = await getAdvanceReport(currentFilters);
          if (res.error) setErrorMessage(res.error);
          else setAdvanceRows(res.rows);
        } else if (tab === "billing") {
          const res = await getBillingReport(currentFilters);
          if (res.error) setErrorMessage(res.error);
          else setBillingRows(res.rows);
        } else if (tab === "payments") {
          const res = await getPaymentReport(currentFilters);
          if (res.error) setErrorMessage(res.error);
          else setPaymentRows(res.rows);
        } else if (tab === "financial_summary") {
          const res = await getFinancialSummary(currentFilters);
          if (res.error) setErrorMessage(res.error);
          else setFinancialSummary(res.summary);
        }
      } catch (err) {
        console.error("Failed to load report data:", err);
        setErrorMessage("Failed to load report data");
      }
    });
  };

  const handleApplyFilters = (newFilters: ReportFilterParams) => {
    setFilters(newFilters);
    fetchTabReportData(activeTab, newFilters);
  };

  const handleResetFilters = () => {
    const defaultRange = getDefaultDateRange();
    const reset = {
      startDate: defaultRange.startDate,
      endDate: defaultRange.endDate,
    };
    setFilters(reset);
    fetchTabReportData(activeTab, reset);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchTabReportData(tab, filters);
  };

  const tabs = [
    { id: "overview", label: t("tab_overview"), icon: LayoutDashboard },
    { id: "production", label: t("tab_production"), icon: Printer },
    { id: "clients", label: t("tab_clients"), icon: Users },
    { id: "expenses", label: t("tab_expenses"), icon: Receipt },
    { id: "attendance", label: t("tab_attendance"), icon: Clock },
    { id: "salary", label: t("tab_salary"), icon: Wallet },
    { id: "advances", label: t("tab_advances"), icon: Wallet },
    { id: "billing", label: t("tab_billing"), icon: CreditCard },
    { id: "payments", label: t("tab_payments"), icon: History },
    { id: "financial_summary", label: t("tab_financial_summary"), icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Global Filter Bar */}
      <ReportFilterBar
        currentFilters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        activeTab={activeTab}
        clients={clientOptions}
        employees={employeeOptions}
        categories={categoryOptions}
        showStatusFilter={["production", "salary", "billing"].includes(activeTab)}
        statusOptions={
          activeTab === "production"
            ? [
                { value: "received", label: t("status_received") },
                { value: "in_production", label: t("status_in_production") },
                { value: "completed", label: t("status_completed") },
                { value: "delivered", label: t("status_delivered") },
              ]
            : activeTab === "salary"
            ? [
                { value: "draft", label: t("status_draft") },
                { value: "pending", label: t("status_pending") },
                { value: "partially_paid", label: t("status_partially_paid") },
                { value: "paid", label: t("status_paid") },
              ]
            : activeTab === "billing"
            ? [
                { value: "unpaid", label: t("status_unpaid") },
                { value: "partially_paid", label: t("status_partially_paid") },
                { value: "paid", label: t("status_paid") },
                { value: "cancelled", label: t("status_cancelled") },
              ]
            : []
        }
        showBillingTypeFilter={activeTab === "billing"}
        showPaymentMethodFilter={["expenses", "payments"].includes(activeTab)}
        isLoading={isPending}
      />

      {/* Responsive Tab Bar Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-200 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-brand-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading Overlay or Tab Content */}
      <div className="relative min-h-[300px]">
        {isPending && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-2xs z-10 flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
              <span>{t("loading_report")}</span>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <OverviewReport overview={overview} onSelectTab={handleTabChange} />
        )}

        {activeTab === "production" && (
          <ProductionReport rows={productionRows} locale={locale} />
        )}

        {activeTab === "clients" && (
          <ClientsReport rows={clientRows} locale={locale} />
        )}

        {activeTab === "expenses" && (
          <ExpensesReport data={expenseData} locale={locale} />
        )}

        {activeTab === "attendance" && (
          <AttendanceReport rows={attendanceRows} locale={locale} />
        )}

        {activeTab === "salary" && (
          <SalaryReport rows={salaryRows} locale={locale} />
        )}

        {activeTab === "advances" && (
          <AdvancesReport rows={advanceRows} locale={locale} />
        )}

        {activeTab === "billing" && (
          <BillingReport rows={billingRows} locale={locale} />
        )}

        {activeTab === "payments" && (
          <PaymentsReport rows={paymentRows} locale={locale} />
        )}

        {activeTab === "financial_summary" && (
          <FinancialSummaryReport summary={financialSummary} locale={locale} />
        )}
      </div>
    </div>
  );
}
