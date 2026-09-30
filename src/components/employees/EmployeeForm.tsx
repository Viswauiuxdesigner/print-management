"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";

import {
  employeeSchema,
  type EmployeeFormValues,
} from "@/lib/validators/employee";
import type { Employee } from "@/lib/types/employee";
import {
  createEmployeeAction,
  updateEmployeeAction,
} from "@/lib/actions/employees";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface EmployeeFormProps {
  initialData?: Employee | null;
  isEditing?: boolean;
}

export function EmployeeForm({ initialData, isEditing = false }: EmployeeFormProps) {
  const t = useTranslations("employees");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: initialData?.full_name ?? "",
      phone: initialData?.phone ?? "",
      alternate_phone: initialData?.alternate_phone ?? "",
      email: initialData?.email ?? "",
      address: initialData?.address ?? "",
      designation: initialData?.designation ?? "",
      joining_date: initialData?.joining_date ?? "",
      salary_type: initialData?.salary_type ?? "monthly",
      salary_amount: initialData?.salary_amount ?? 0,
      notes: initialData?.notes ?? "",
    },
  });

  const onSubmit = async (values: EmployeeFormValues) => {
    setServerError(null);

    try {
      if (isEditing && initialData) {
        const res = await updateEmployeeAction(initialData.id, values);
        if (!res.success) {
          setServerError(res.error || tErr("unexpected_error"));
          return;
        }
        startTransition(() => {
          router.push(`/employees/${initialData.id}`);
          router.refresh();
        });
      } else {
        const res = await createEmployeeAction(values);
        if (!res.success) {
          setServerError(res.error || tErr("unexpected_error"));
          return;
        }
        startTransition(() => {
          router.push(res.data?.id ? `/employees/${res.data.id}` : "/employees");
          router.refresh();
        });
      }
    } catch {
      setServerError(tErr("network_error"));
    }
  };

  const isWorking = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl bg-red-50 p-4 border border-red-200 text-sm text-red-800"
        >
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="font-medium break-words">{serverError}</p>
        </div>
      )}

      {/* ── Section 1: Basic Information ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          {t("detail_contact_info")}
        </h2>

        <div className="space-y-4">
          <Input
            id="full_name"
            label={t("field_full_name")}
            placeholder={t("field_full_name_placeholder")}
            required
            error={errors.full_name?.message ? tErr(errors.full_name.message as Parameters<typeof tErr>[0]) : undefined}
            {...register("full_name")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="phone"
              type="tel"
              label={t("field_phone")}
              placeholder={t("field_phone_placeholder")}
              error={errors.phone?.message ? tErr(errors.phone.message as Parameters<typeof tErr>[0]) : undefined}
              {...register("phone")}
            />

            <Input
              id="alternate_phone"
              type="tel"
              label={t("field_alt_phone")}
              placeholder={t("field_alt_phone_placeholder")}
              error={errors.alternate_phone?.message ? tErr(errors.alternate_phone.message as Parameters<typeof tErr>[0]) : undefined}
              {...register("alternate_phone")}
            />
          </div>

          <Input
            id="email"
            type="email"
            label={t("field_email")}
            placeholder={t("field_email_placeholder")}
            error={errors.email?.message ? tErr(errors.email.message as Parameters<typeof tErr>[0]) : undefined}
            {...register("email")}
          />

          <div>
            <label
              htmlFor="address"
              className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5"
            >
              {t("field_address")}
            </label>
            <textarea
              id="address"
              rows={2}
              placeholder={t("field_address_placeholder")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              {...register("address")}
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Role, Joining Date & Salary ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          {t("detail_employment_info")}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="designation"
              label={t("field_designation")}
              placeholder={t("field_designation_placeholder")}
              error={errors.designation?.message ? tErr(errors.designation.message as Parameters<typeof tErr>[0]) : undefined}
              {...register("designation")}
            />

            <Input
              id="joining_date"
              type="date"
              label={t("field_joining_date")}
              error={errors.joining_date?.message ? tErr(errors.joining_date.message as Parameters<typeof tErr>[0]) : undefined}
              {...register("joining_date")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="salary_type"
                className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5"
              >
                {t("field_salary_type")}
              </label>
              <select
                id="salary_type"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                {...register("salary_type")}
              >
                <option value="monthly">{t("salary_monthly")}</option>
                <option value="daily">{t("salary_daily")}</option>
              </select>
            </div>

            <Input
              id="salary_amount"
              type="number"
              step="1"
              min="0"
              label={t("field_salary_amount")}
              placeholder={t("field_salary_amount_placeholder")}
              error={errors.salary_amount?.message ? tErr(errors.salary_amount.message as Parameters<typeof tErr>[0]) : undefined}
              {...register("salary_amount")}
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5"
            >
              {t("field_notes")}
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder={t("field_notes_placeholder")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              {...register("notes")}
            />
          </div>
        </div>
      </div>

      {/* ── Form Action Buttons ── */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => router.back()}
          disabled={isWorking}
          className="w-full sm:w-auto justify-center"
        >
          {t("action_cancel")}
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isWorking}
          disabled={isWorking}
          className="w-full sm:w-auto justify-center"
        >
          {isEditing
            ? isWorking
              ? t("action_updating")
              : t("action_update")
            : isWorking
            ? t("action_saving")
            : t("action_save")}
        </Button>
      </div>
    </form>
  );
}
