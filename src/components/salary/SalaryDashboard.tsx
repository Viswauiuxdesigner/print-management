"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CreditCard,
  PlusCircle,
  FileText,
  Calendar,
} from "lucide-react";

import type {
  SalaryRecordWithEmployee,
  PayrollSummary,
  SalaryStatus,
} from "@/lib/types/salary";
import type { Employee } from "@/lib/types/employee";
import { generateAllMonthlySalaryRecordsAction } from "@/lib/actions/salary";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SalaryPaymentModal } from "./SalaryPaymentModal";
import { AdvanceFormModal } from "./AdvanceFormModal";

interface SalaryDashboardProps {
  initialSummary: PayrollSummary;
  initialRecords: SalaryRecordWithEmployee[];
  employees: Employee[];
  currentYear: number;
  currentMonth: number;
  locale: string;
}

export function SalaryDashboard({
  initialSummary,
  initialRecords,
  employees,
  currentYear,
  currentMonth,
}: SalaryDashboardProps) {
  const t = useTranslations("salary");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Selected Month formatted as YYYY-MM
  const initialMonthStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(initialMonthStr);
  const [statusFilter, setStatusFilter] = useState<SalaryStatus | "all">("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  // Modals state
  const [paymentRecord, setPaymentRecord] = useState<SalaryRecordWithEmployee | null>(null);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    setSelectedMonth(val);
    const [y, m] = val.split("-").map(Number);
    startTransition(() => {
      router.push(`/salary?year=${y}&month=${m}`);
    });
  };

  const handleGenerateAll = async () => {
    setFeedbackMessage(null);
    const [y, m] = selectedMonth.split("-").map(Number);

    try {
      const res = await generateAllMonthlySalaryRecordsAction(y, m);
      if (res.success) {
        setFeedbackMessage({
          type: "success",
          text: `${t("msg_generated_success")} (${res.data?.count ?? 0} employees)`,
        });
        startTransition(() => {
          router.refresh();
        });
      } else {
        setFeedbackMessage({
          type: "error",
          text: res.error || "Failed to generate payroll.",
        });
      }
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Network error while generating payroll.",
      });
    }
  };

  // Filter records
  const filteredRecords = initialRecords.filter((rec) => {
    if (statusFilter !== "all" && rec.status !== statusFilter) return false;
    if (employeeFilter !== "all" && rec.employee_id !== employeeFilter) return false;
    return true;
  });

  const getStatusBadge = (status: SalaryStatus) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">{t("status_paid")}</Badge>;
      case "partially_paid":
        return <Badge variant="warning">{t("status_partially_paid")}</Badge>;
      case "pending":
      default:
        return <Badge variant="neutral">{t("status_pending")}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href="/salary/advances">
            <Button variant="secondary" size="sm">
              <CreditCard className="h-4 w-4 mr-1.5" />
              <span>{t("advances_title")}</span>
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAdvanceModalOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1.5 text-brand-600" />
            <span>{t("action_add_advance")}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateAll}
            loading={isPending}
            disabled={isPending}
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            <span>{t("action_generate")}</span>
          </Button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`flex items-start gap-2 p-3.5 rounded-xl border text-xs sm:text-sm ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Month Selector & Metrics Cards */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              {t("selected_month")}:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{initialSummary.paid_records_count} {t("status_paid")}</span>
            <span>•</span>
            <span>{initialSummary.pending_records_count} {t("status_pending")}</span>
          </div>
        </div>

        {/* 5-Metric Responsive Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Users className="h-3.5 w-3.5" />
              <span>{t("summary_employees")}</span>
            </div>
            <div className="mt-1.5 text-lg sm:text-xl font-bold font-mono text-slate-900">
              {initialSummary.total_employees}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{t("summary_gross_salary")}</span>
            </div>
            <div className="mt-1.5 text-lg sm:text-xl font-bold font-mono text-slate-900">
              ₹{initialSummary.total_gross_salary.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-medium">
              <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
              <span>{t("summary_advances")}</span>
            </div>
            <div className="mt-1.5 text-lg sm:text-xl font-bold font-mono text-indigo-900">
              ₹{initialSummary.total_advances_amount.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t("summary_paid")}</span>
            </div>
            <div className="mt-1.5 text-lg sm:text-xl font-bold font-mono text-emerald-700">
              ₹{initialSummary.total_paid_amount.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-medium">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>{t("summary_pending")}</span>
            </div>
            <div className="mt-1.5 text-lg sm:text-xl font-bold font-mono text-amber-700">
              ₹{initialSummary.total_pending_amount.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SalaryStatus | "all")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">{t("filter_all_status")}</option>
            <option value="pending">{t("status_pending")}</option>
            <option value="partially_paid">{t("status_partially_paid")}</option>
            <option value="paid">{t("status_paid")}</option>
          </select>

          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 max-w-[200px]"
          >
            <option value="all">{t("filter_all_employees")}</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.employee_code})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          {filteredRecords.length} {filteredRecords.length === 1 ? "record" : "records"}
        </div>
      </div>

      {/* Records Listing */}
      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 sm:p-12 text-center border border-slate-200 space-y-3">
          <FileText className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">
            {t("no_records_title")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {t("no_records_desc")}
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateAll}
              loading={isPending}
              disabled={isPending}
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              <span>{t("action_generate")}</span>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3.5 px-4">{t("col_employee")}</th>
                  <th className="py-3.5 px-3">{t("col_salary_type")}</th>
                  <th className="py-3.5 px-3 text-right">{t("col_payable_days")}</th>
                  <th className="py-3.5 px-3 text-right">{t("col_gross")}</th>
                  <th className="py-3.5 px-3 text-right">{t("col_advance_ded")}</th>
                  <th className="py-3.5 px-3 text-right">{t("col_net")}</th>
                  <th className="py-3.5 px-3 text-right">{t("col_paid")}</th>
                  <th className="py-3.5 px-3 text-right">{t("col_pending")}</th>
                  <th className="py-3.5 px-3 text-center">{t("col_status")}</th>
                  <th className="py-3.5 px-4 text-right">{t("col_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {rec.employee?.full_name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {rec.employee?.employee_code} • {rec.employee?.designation || "Staff"}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="capitalize text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {rec.salary_type === "monthly" ? t("type_monthly") : t("type_daily")}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                      {rec.payable_days} <span className="text-slate-400 text-xs">/ {rec.working_days}</span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      ₹{Number(rec.gross_salary).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-red-600">
                      {rec.advance_deduction > 0 ? `-₹${Number(rec.advance_deduction).toLocaleString("en-IN")}` : "₹0"}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                      ₹{Number(rec.net_salary).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-emerald-700">
                      ₹{Number(rec.paid_amount).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold text-amber-700">
                      ₹{Number(rec.pending_amount).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(rec.status)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rec.pending_amount > 0 && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setPaymentRecord(rec)}
                          >
                            <DollarSign className="h-3.5 w-3.5 mr-0.5" />
                            <span>{t("action_pay")}</span>
                          </Button>
                        )}
                        <Link href={`/salary/${rec.id}`}>
                          <Button variant="secondary" size="sm">
                            <span>{t("action_details")}</span>
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (< md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="font-bold text-slate-900 text-sm leading-tight">
                      {rec.employee?.full_name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {rec.employee?.employee_code} • {rec.salary_type === "monthly" ? t("type_monthly") : t("type_daily")}
                    </div>
                  </div>
                  <div>{getStatusBadge(rec.status)}</div>
                </div>

                {/* Mobile Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-500 block">{t("col_payable_days")}</span>
                    <span className="font-semibold font-mono text-slate-800">
                      {rec.payable_days} <span className="text-slate-400 font-normal">/ {rec.working_days}</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-500 block">{t("col_gross")}</span>
                    <span className="font-semibold font-mono text-slate-800">
                      ₹{Number(rec.gross_salary).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-500 block">{t("col_net")}</span>
                    <span className="font-bold font-mono text-slate-900">
                      ₹{Number(rec.net_salary).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-50/60">
                    <span className="text-amber-800 block">{t("col_pending")}</span>
                    <span className="font-bold font-mono text-amber-700">
                      ₹{Number(rec.pending_amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Mobile Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <Link href={`/salary/${rec.id}`} className="w-full">
                    <Button variant="secondary" size="sm" className="w-full">
                      <span>{t("action_details")}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>

                  {rec.pending_amount > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => setPaymentRecord(rec)}
                    >
                      <DollarSign className="h-3.5 w-3.5 mr-1" />
                      <span>{t("action_pay")}</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Salary Payment Modal */}
      {paymentRecord && (
        <SalaryPaymentModal
          salaryRecord={paymentRecord}
          isOpen={!!paymentRecord}
          onClose={() => setPaymentRecord(null)}
        />
      )}

      {/* Add Advance Modal */}
      <AdvanceFormModal
        employees={employees}
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
      />
    </div>
  );
}
