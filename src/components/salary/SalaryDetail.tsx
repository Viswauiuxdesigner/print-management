"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  User,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import type {
  SalaryRecordWithEmployee,
  SalaryStatus,
} from "@/lib/types/salary";
import { generateSalaryRecordAction } from "@/lib/actions/salary";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { SalaryPaymentModal } from "./SalaryPaymentModal";

interface SalaryDetailProps {
  record: SalaryRecordWithEmployee;
  locale: string;
}

export function SalaryDetail({ record }: SalaryDetailProps) {
  const t = useTranslations("salary");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdjustingDeductions, setIsAdjustingDeductions] = useState(false);
  const [advanceDeduction, setAdvanceDeduction] = useState(record.advance_deduction || 0);
  const [otherDeduction, setOtherDeduction] = useState(record.other_deduction || 0);
  const [notes, setNotes] = useState(record.notes || "");
  const [actionError, setActionError] = useState<string | null>(null);

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

  const handleRecalculate = async () => {
    setActionError(null);
    try {
      const res = await generateSalaryRecordAction({
        employee_id: record.employee_id,
        payroll_year: record.payroll_year,
        payroll_month: record.payroll_month,
        advance_deduction: Number(advanceDeduction) || 0,
        other_deduction: Number(otherDeduction) || 0,
        notes: notes || undefined,
      });

      if (!res.success) {
        setActionError(res.error || tErr("unexpected_error"));
        return;
      }

      setIsAdjustingDeductions(false);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setActionError(tErr("network_error"));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Back & Header Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/salary?year=${record.payroll_year}&month=${record.payroll_month}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("nav_salary_dashboard")}</span>
        </Link>

        <div className="flex items-center gap-2">
          {record.pending_amount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{t("action_record_payment")}</span>
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 p-3.5 bg-red-50 text-red-800 text-xs sm:text-sm rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg border border-brand-100 shrink-0">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {record.employee?.full_name}
                </h1>
                {getStatusBadge(record.status)}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">
                {record.employee?.employee_code} • {record.employee?.designation || "Staff"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100 self-start sm:self-auto">
            <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
            <div>
              <span className="text-xs text-slate-500 block">{t("col_period")}</span>
              <span className="text-sm font-bold text-slate-800">
                {record.payroll_year} - {String(record.payroll_month).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Attendance Breakdown & Salary Calculation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {t("section_attendance_breakdown")}
              </h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
              {record.salary_type === "monthly" ? t("type_monthly") : t("type_daily")}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">{t("att_working_days")}</span>
              <span className="text-base font-bold font-mono text-slate-900">{record.working_days}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs text-emerald-800 block">{t("att_present_days")}</span>
              <span className="text-base font-bold font-mono text-emerald-700">{record.present_days}</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="text-xs text-blue-800 block">{t("att_half_days")}</span>
              <span className="text-base font-bold font-mono text-blue-700">{record.half_days}</span>
            </div>

            <div className="p-3 rounded-xl bg-red-50/60 border border-red-100">
              <span className="text-xs text-red-800 block">{t("att_absent_days")}</span>
              <span className="text-base font-bold font-mono text-red-700">{record.absent_days}</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
              <span className="text-xs text-amber-800 block">{t("att_leave_days")}</span>
              <span className="text-base font-bold font-mono text-amber-700">{record.leave_days}</span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-xs text-indigo-800 block">{t("att_payable_days")}</span>
              <span className="text-base font-bold font-mono text-indigo-700">{record.payable_days}</span>
            </div>
          </div>
        </div>

        {/* Salary & Deductions Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {t("section_salary_breakdown")}
              </h2>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAdjustingDeductions(!isAdjustingDeductions)}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1 text-brand-600" />
              <span>{isAdjustingDeductions ? t("action_cancel") : t("action_adjust_deductions")}</span>
            </Button>
          </div>

          {isAdjustingDeductions ? (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {t("adjust_deductions_title")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="adv_ded"
                  type="number"
                  step="0.01"
                  min="0"
                  label={t("col_advance_ded")}
                  value={advanceDeduction}
                  onChange={(e) => setAdvanceDeduction(Number(e.target.value))}
                />
                <Input
                  id="oth_ded"
                  type="number"
                  step="0.01"
                  min="0"
                  label={t("col_other_ded")}
                  value={otherDeduction}
                  onChange={(e) => setOtherDeduction(Number(e.target.value))}
                />
              </div>

              <div>
                <label
                  htmlFor="adj_notes"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  {t("field_notes")}
                </label>
                <input
                  id="adj_notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for deduction adjustments..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAdjustingDeductions(false)}
                >
                  {t("action_cancel")}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRecalculate}
                  loading={isPending}
                  disabled={isPending}
                >
                  <span>{t("action_recalculate")}</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-600">{t("col_base_salary")}</span>
                <span className="font-mono font-medium text-slate-900">
                  ₹{Number(record.base_salary).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-600">{t("col_gross")}</span>
                <span className="font-mono font-medium text-slate-900">
                  ₹{Number(record.gross_salary).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {record.attendance_deduction > 0 && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50 text-red-600">
                  <span>{t("col_attendance_ded")}</span>
                  <span className="font-mono font-medium">
                    -₹{Number(record.attendance_deduction).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {record.advance_deduction > 0 && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50 text-red-600">
                  <span>{t("col_advance_ded")}</span>
                  <span className="font-mono font-medium">
                    -₹{Number(record.advance_deduction).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {record.other_deduction > 0 && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50 text-red-600">
                  <span>{t("col_other_ded")}</span>
                  <span className="font-mono font-medium">
                    -₹{Number(record.other_deduction).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-900">{t("col_net")}</span>
                <span className="text-base sm:text-lg font-bold font-mono text-slate-900">
                  ₹{Number(record.net_salary).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Status & History Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t("section_payment_history")}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-xs">{t("col_paid")}</span>
              <span className="font-bold font-mono text-emerald-700">
                ₹{Number(record.paid_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="border-l border-slate-200 pl-4">
              <span className="text-slate-500 block text-xs">{t("col_pending")}</span>
              <span className="font-bold font-mono text-amber-700">
                ₹{Number(record.pending_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Payments Table / Records */}
        {(!record.payments || record.payments.length === 0) ? (
          <div className="text-center py-8 text-slate-500 space-y-2">
            <Clock className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs sm:text-sm">{t("no_payments_yet")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">{t("field_payment_date")}</th>
                  <th className="py-2.5 px-3">{t("field_payment_method")}</th>
                  <th className="py-2.5 px-3">{t("field_reference")}</th>
                  <th className="py-2.5 px-3 text-right">{t("advances_amount")}</th>
                  <th className="py-2.5 px-3">{t("field_notes")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {record.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/75">
                    <td className="py-2.5 px-3 font-medium text-slate-900">{p.payment_date}</td>
                    <td className="py-2.5 px-3 capitalize text-slate-700">{p.payment_method}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{p.reference_number || "-"}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{p.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Payment Modal */}
      {isPaymentModalOpen && (
        <SalaryPaymentModal
          salaryRecord={record}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}
    </div>
  );
}
