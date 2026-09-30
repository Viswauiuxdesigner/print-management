"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AlertCircle, X, PlusCircle } from "lucide-react";

import {
  salaryAdvanceSchema,
  type SalaryAdvanceFormValues,
} from "@/lib/validators/salary";
import type { Employee } from "@/lib/types/employee";
import { createAdvanceAction } from "@/lib/actions/advances";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AdvanceFormModalProps {
  employees: Employee[];
  isOpen: boolean;
  onClose: () => void;
  preselectedEmployeeId?: string;
}

export function AdvanceFormModal({
  employees,
  isOpen,
  onClose,
  preselectedEmployeeId,
}: AdvanceFormModalProps) {
  const t = useTranslations("salary");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const activeEmployees = employees.filter((e) => e.is_active);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SalaryAdvanceFormValues>({
    resolver: zodResolver(salaryAdvanceSchema),
    defaultValues: {
      employee_id: preselectedEmployeeId || (activeEmployees[0]?.id ?? ""),
      advance_date: todayStr,
      amount: 0,
      payment_method: "cash",
      reason: "",
      reference_number: "",
      notes: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (values: SalaryAdvanceFormValues) => {
    setServerError(null);

    try {
      const res = await createAdvanceAction(values);
      if (!res.success) {
        setServerError(res.error || tErr("unexpected_error"));
        return;
      }

      reset();
      onClose();
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setServerError(tErr("network_error"));
    }
  };

  const isWorking = isSubmitting || isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {t("action_add_advance")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t("advances_title")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isWorking}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {serverError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
            <span className="break-words">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="employee_id"
              className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5"
            >
              {t("col_employee")} *
            </label>
            <select
              id="employee_id"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              {...register("employee_id")}
            >
              {activeEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_code}) - {emp.designation || emp.salary_type}
                </option>
              ))}
            </select>
            {errors.employee_id && (
              <p className="mt-1 text-xs text-red-600">
                {tErr("employee_required" as Parameters<typeof tErr>[0])}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="advance_date"
              type="date"
              label={t("advances_date")}
              required
              error={errors.advance_date?.message ? tErr(errors.advance_date.message as Parameters<typeof tErr>[0]) : undefined}
              {...register("advance_date")}
            />

            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              label={t("advances_amount")}
              required
              placeholder="₹ 0.00"
              error={errors.amount?.message ? tErr(errors.amount.message as Parameters<typeof tErr>[0]) : undefined}
              {...register("amount")}
            />
          </div>

          <div>
            <label
              htmlFor="payment_method"
              className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5"
            >
              {t("field_payment_method")} *
            </label>
            <select
              id="payment_method"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              {...register("payment_method")}
            >
              <option value="cash">{t("payment_cash")}</option>
              <option value="bank">{t("payment_bank")}</option>
              <option value="upi">{t("payment_upi")}</option>
              <option value="other">{t("payment_other")}</option>
            </select>
          </div>

          <Input
            id="reason"
            label={t("advances_reason")}
            placeholder="e.g. Festival advance, Medical, Emergency"
            error={errors.reason?.message ? tErr(errors.reason.message as Parameters<typeof tErr>[0]) : undefined}
            {...register("reason")}
          />

          <Input
            id="reference_number"
            label={t("field_reference")}
            placeholder="e.g. UPI Ref ID / Voucher #"
            error={errors.reference_number?.message ? tErr(errors.reference_number.message as Parameters<typeof tErr>[0]) : undefined}
            {...register("reference_number")}
          />

          <div>
            <label
              htmlFor="notes"
              className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5"
            >
              {t("field_notes")}
            </label>
            <textarea
              id="notes"
              rows={2}
              placeholder={t("field_notes")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              {...register("notes")}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isWorking}
            >
              {t("action_cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isWorking}
              disabled={isWorking}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              <span>{isWorking ? t("action_saving") : t("action_save")}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
