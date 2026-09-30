"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AlertCircle, X, DollarSign, Sparkles } from "lucide-react";

import {
  salaryPaymentSchema,
  type SalaryPaymentFormValues,
} from "@/lib/validators/salary";
import type { SalaryRecordWithEmployee } from "@/lib/types/salary";
import { recordSalaryPaymentAction } from "@/lib/actions/salary";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SalaryPaymentModalProps {
  salaryRecord: SalaryRecordWithEmployee;
  isOpen: boolean;
  onClose: () => void;
}

export function SalaryPaymentModal({
  salaryRecord,
  isOpen,
  onClose,
}: SalaryPaymentModalProps) {
  const t = useTranslations("salary");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const pendingAmount = Number(salaryRecord.pending_amount || 0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SalaryPaymentFormValues>({
    resolver: zodResolver(salaryPaymentSchema),
    defaultValues: {
      salary_record_id: salaryRecord.id,
      payment_date: todayStr,
      amount: pendingAmount,
      payment_method: "cash",
      reference_number: "",
      notes: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (values: SalaryPaymentFormValues) => {
    setServerError(null);

    try {
      const res = await recordSalaryPaymentAction(values);
      if (!res.success) {
        setServerError(res.error || tErr("unexpected_error"));
        return;
      }

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
              {t("payment_modal_title")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {salaryRecord.employee?.full_name} ({salaryRecord.payroll_year}-
              {String(salaryRecord.payroll_month).padStart(2, "0")})
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

        {/* Pending Summary Box */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">{t("detail_pending_amount")}</span>
            <span className="text-lg font-bold font-mono text-brand-700">
              ₹{pendingAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setValue("amount", pendingAmount)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg border border-brand-200 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pay Full</span>
          </button>
        </div>

        {serverError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
            <span className="break-words">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="payment_date"
            type="date"
            label={t("field_payment_date")}
            required
            error={errors.payment_date?.message ? tErr(errors.payment_date.message as Parameters<typeof tErr>[0]) : undefined}
            {...register("payment_date")}
          />

          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={pendingAmount}
            label={t("field_payment_amount")}
            required
            error={errors.amount?.message ? tErr(errors.amount.message as Parameters<typeof tErr>[0]) : undefined}
            {...register("amount")}
          />

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
            id="reference_number"
            label={t("field_reference")}
            placeholder="e.g. UPI Ref, NEFT ID, Cheque #"
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
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{isWorking ? t("action_saving") : t("action_save")}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
