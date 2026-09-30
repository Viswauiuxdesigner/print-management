"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import {
  expenseSchema,
  type ExpenseFormValues,
} from "@/lib/validators/expense";
import {
  createExpenseAction,
  updateExpenseAction,
} from "@/lib/actions/expenses";
import type { Expense, ExpenseCategory } from "@/lib/types/expense";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ExpenseFormProps {
  mode: "create" | "edit";
  initialData?: Expense;
  categories: ExpenseCategory[];
  locale: string;
}

export function ExpenseForm({
  mode,
  initialData,
  categories,
  locale,
}: ExpenseFormProps) {
  const t = useTranslations("expenses");
  const tErr = useTranslations("errors");
  const router = useRouter();

  const [globalError, setGlobalError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_date: initialData?.expense_date ?? today,
      category_id: initialData?.category_id ?? (categories[0]?.id || ""),
      amount: initialData?.amount ?? (undefined as any),
      payment_method: initialData?.payment_method ?? "cash",
      description: initialData?.description ?? "",
      reference_number: initialData?.reference_number ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  async function onSubmit(values: ExpenseFormValues) {
    setGlobalError(null);

    try {
      if (mode === "create") {
        const result = await createExpenseAction(values);
        if (!result.success) {
          setGlobalError(
            result.error ? tErr(result.error) : "Failed to record expense"
          );
          return;
        }
        router.push("/expenses");
      } else if (mode === "edit" && initialData) {
        const result = await updateExpenseAction(initialData.id, values);
        if (!result.success) {
          setGlobalError(
            result.error ? tErr(result.error) : "Failed to update expense"
          );
          return;
        }
        router.push(`/expenses/${initialData.id}`);
      }
    } catch {
      setGlobalError(tErr("network_error"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto">
      {/* Top back navigation */}
      <div>
        <Link
          href={mode === "edit" && initialData ? `/expenses/${initialData.id}` : "/expenses"}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("action_back")}
        </Link>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Main Expense Details Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xs space-y-6">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          {mode === "create" ? t("new_expense") : t("edit_expense")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Expense Date */}
          <div>
            <Input
              id="expense_date"
              type="date"
              label={t("field_date")}
              error={errors.expense_date?.message ? tErr(errors.expense_date.message) : undefined}
              required
              {...register("expense_date")}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {t("field_category")} <span className="text-red-500">*</span>
            </label>
            <select
              id="category_id"
              {...register("category_id")}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-colors ${
                errors.category_id
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/30"
                  : "border-slate-200 focus:border-brand-500 focus:ring-brand-200 bg-white"
              }`}
            >
              <option value="" disabled>
                {t("field_select_category")}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === "ta" ? cat.name_ta : cat.name_en}
                </option>
              ))}
            </select>
            {errors.category_id?.message && (
              <p className="mt-1 text-xs text-red-600">
                {tErr(errors.category_id.message)}
              </p>
            )}
          </div>

          {/* Amount (₹) */}
          <div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              label={t("field_amount")}
              placeholder={t("field_amount_placeholder")}
              error={errors.amount?.message ? tErr(errors.amount.message) : undefined}
              required
              {...register("amount")}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label
              htmlFor="payment_method"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {t("field_payment_method")} <span className="text-red-500">*</span>
            </label>
            <select
              id="payment_method"
              {...register("payment_method")}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-colors ${
                errors.payment_method
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/30"
                  : "border-slate-200 focus:border-brand-500 focus:ring-brand-200 bg-white"
              }`}
            >
              <option value="cash">{t("payment_cash")}</option>
              <option value="bank">{t("payment_bank")}</option>
              <option value="upi">{t("payment_upi")}</option>
              <option value="other">{t("payment_other")}</option>
            </select>
            {errors.payment_method?.message && (
              <p className="mt-1 text-xs text-red-600">
                {tErr(errors.payment_method.message)}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <Input
              id="description"
              type="text"
              label={t("field_description")}
              placeholder={t("field_description_placeholder")}
              error={errors.description?.message ? tErr(errors.description.message) : undefined}
              {...register("description")}
            />
          </div>

          {/* Reference Number */}
          <div className="sm:col-span-2">
            <Input
              id="reference_number"
              type="text"
              label={t("field_reference")}
              placeholder={t("field_reference_placeholder")}
              error={errors.reference_number?.message ? tErr(errors.reference_number.message) : undefined}
              {...register("reference_number")}
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {t("field_notes")}
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder={t("field_notes_placeholder")}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-colors ${
                errors.notes
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/30"
                  : "border-slate-200 focus:border-brand-500 focus:ring-brand-200 bg-white"
              }`}
              {...register("notes")}
            />
            {errors.notes?.message && (
              <p className="mt-1 text-xs text-red-600">
                {tErr(errors.notes.message)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href={mode === "edit" && initialData ? `/expenses/${initialData.id}` : "/expenses"}>
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={isSubmitting}
          >
            {t("action_cancel")}
          </Button>
        </Link>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4 mr-1.5" />
          <span>{mode === "create" ? t("action_save") : t("action_update")}</span>
        </Button>
      </div>
    </form>
  );
}
