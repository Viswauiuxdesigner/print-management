"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ReportFilterParams } from "@/lib/types/reports";

interface DropdownOption {
  value: string;
  label: string;
}

interface ReportFilterBarProps {
  currentFilters: ReportFilterParams;
  onApplyFilters: (filters: ReportFilterParams) => void;
  onResetFilters: () => void;
  activeTab: string;
  clients?: DropdownOption[];
  employees?: DropdownOption[];
  categories?: DropdownOption[];
  showStatusFilter?: boolean;
  statusOptions?: DropdownOption[];
  showBillingTypeFilter?: boolean;
  showPaymentMethodFilter?: boolean;
  isLoading?: boolean;
}

export function ReportFilterBar({
  currentFilters,
  onApplyFilters,
  onResetFilters,
  activeTab,
  clients = [],
  employees = [],
  categories = [],
  showStatusFilter = false,
  statusOptions = [],
  showBillingTypeFilter = false,
  showPaymentMethodFilter = false,
  isLoading = false,
}: ReportFilterBarProps) {
  const t = useTranslations("reports");

  const [startDate, setStartDate] = useState(currentFilters.startDate || "");
  const [endDate, setEndDate] = useState(currentFilters.endDate || "");
  const [clientId, setClientId] = useState(currentFilters.client_id || "all");
  const [employeeId, setEmployeeId] = useState(currentFilters.employee_id || "all");
  const [categoryId, setCategoryId] = useState(currentFilters.category_id || "all");
  const [status, setStatus] = useState(currentFilters.status || "all");
  const [billingType, setBillingType] = useState(currentFilters.billing_type || "all");
  const [paymentMethod, setPaymentMethod] = useState(currentFilters.payment_method || "all");
  const [dateError, setDateError] = useState<string | null>(null);

  // Sync state if currentFilters change externally
  React.useEffect(() => {
    if (currentFilters.startDate) setStartDate(currentFilters.startDate);
    if (currentFilters.endDate) setEndDate(currentFilters.endDate);
    if (currentFilters.client_id) setClientId(currentFilters.client_id);
    if (currentFilters.employee_id) setEmployeeId(currentFilters.employee_id);
    if (currentFilters.category_id) setCategoryId(currentFilters.category_id);
    if (currentFilters.status) setStatus(currentFilters.status);
    if (currentFilters.billing_type) setBillingType(currentFilters.billing_type);
    if (currentFilters.payment_method) setPaymentMethod(currentFilters.payment_method);
  }, [currentFilters]);

  // Quick Date Presets
  const setQuickPreset = (preset: "this_month" | "last_month" | "last_30_days" | "this_year") => {
    const now = new Date();
    let start = "";
    let end = "";

    if (preset === "this_month") {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      start = `${year}-${month}-01`;
      end = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    } else if (preset === "last_month") {
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const year = prevMonthDate.getFullYear();
      const month = String(prevMonthDate.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(year, prevMonthDate.getMonth() + 1, 0).getDate();
      start = `${year}-${month}-01`;
      end = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    } else if (preset === "last_30_days") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start = thirtyDaysAgo.toISOString().split("T")[0];
      end = now.toISOString().split("T")[0];
    } else if (preset === "this_year") {
      const year = now.getFullYear();
      start = `${year}-01-01`;
      end = `${year}-12-31`;
    }

    setStartDate(start);
    setEndDate(end);
    setDateError(null);

    onApplyFilters({
      startDate: start,
      endDate: end,
      client_id: clientId !== "all" ? clientId : undefined,
      employee_id: employeeId !== "all" ? employeeId : undefined,
      category_id: categoryId !== "all" ? categoryId : undefined,
      status: status !== "all" ? status : undefined,
      billing_type: billingType !== "all" ? billingType : undefined,
      payment_method: paymentMethod !== "all" ? paymentMethod : undefined,
    });
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();

    if (startDate && endDate && startDate > endDate) {
      setDateError(t("filter_date_error"));
      return;
    }
    setDateError(null);

    onApplyFilters({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      client_id: clientId !== "all" ? clientId : undefined,
      employee_id: employeeId !== "all" ? employeeId : undefined,
      category_id: categoryId !== "all" ? categoryId : undefined,
      status: status !== "all" ? status : undefined,
      billing_type: billingType !== "all" ? billingType : undefined,
      payment_method: paymentMethod !== "all" ? paymentMethod : undefined,
    });
  };

  const handleReset = () => {
    setDateError(null);
    onResetFilters();
  };

  // Determine which contextual dropdowns to show based on active tab
  const showClientSelect =
    ["overview", "production", "clients", "billing", "payments"].includes(activeTab) &&
    clients.length > 0;

  const showEmployeeSelect =
    ["attendance", "salary", "advances"].includes(activeTab) && employees.length > 0;

  const showCategorySelect = ["expenses"].includes(activeTab) && categories.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
      {/* Top Bar: Quick Presets & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-800 text-sm font-semibold">
          <Filter className="h-4 w-4 text-brand-600" />
          <span>{t("filter_title")}</span>
        </div>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setQuickPreset("this_month")}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer"
          >
            {t("preset_this_month")}
          </button>
          <button
            type="button"
            onClick={() => setQuickPreset("last_month")}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer"
          >
            {t("preset_last_month")}
          </button>
          <button
            type="button"
            onClick={() => setQuickPreset("last_30_days")}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer"
          >
            {t("preset_last_30_days")}
          </button>
          <button
            type="button"
            onClick={() => setQuickPreset("this_year")}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer"
          >
            {t("preset_this_year")}
          </button>
        </div>
      </div>

      {/* Filter Controls Form */}
      <form onSubmit={handleApply} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t("filter_date_from")}
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t("filter_date_to")}
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Client Filter (Conditional) */}
          {showClientSelect && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t("filter_client")}
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="all">{t("all_clients")}</option>
                {clients.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Employee Filter (Conditional) */}
          {showEmployeeSelect && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t("filter_employee")}
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="all">{t("all_employees")}</option>
                {employees.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Expense Category Filter (Conditional) */}
          {showCategorySelect && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t("filter_category")}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="all">{t("all_categories")}</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter (Conditional) */}
          {showStatusFilter && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t("filter_status")}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="all">{t("all_statuses")}</option>
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Billing Type Filter (Conditional) */}
          {showBillingTypeFilter && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t("filter_billing_type")}
              </label>
              <select
                value={billingType}
                onChange={(e) => setBillingType(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="all">{t("all_types")}</option>
                <option value="weight">{t("type_weight")}</option>
                <option value="fixed">{t("type_fixed")}</option>
                <option value="mixed">{t("type_mixed")}</option>
              </select>
            </div>
          )}

          {/* Payment Method Filter (Conditional) */}
          {showPaymentMethodFilter && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t("filter_payment_method")}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="all">{t("all_methods")}</option>
                <option value="cash">{t("method_cash")}</option>
                <option value="bank">{t("method_bank")}</option>
                <option value="upi">{t("method_upi")}</option>
                <option value="other">{t("method_other")}</option>
              </select>
            </div>
          )}
        </div>

        {/* Date Validation Error Alert */}
        {dateError && (
          <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
            {dateError}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("action_reset_filters")}</span>
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span>{isLoading ? t("loading") : t("action_apply_filters")}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
