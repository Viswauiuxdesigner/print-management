"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { clientSchema, type ClientFormValues } from "@/lib/validators/client";
import { createClientAction, updateClientAction } from "@/lib/actions/clients";
import type { Client } from "@/lib/types/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ClientFormProps {
  mode: "create" | "edit";
  initialData?: Client;
}

export function ClientForm({ mode, initialData }: ClientFormProps) {
  const t = useTranslations("clients");
  const tErr = useTranslations("errors");
  const router = useRouter();

  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      company_name: initialData?.company_name ?? "",
      phone: initialData?.phone ?? "",
      alternate_phone: initialData?.alternate_phone ?? "",
      email: initialData?.email ?? "",
      address: initialData?.address ?? "",
      city: initialData?.city ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  async function onSubmit(values: ClientFormValues) {
    setGlobalError(null);

    try {
      if (mode === "create") {
        const res = await createClientAction(values);
        if (!res.success) {
          setGlobalError(
            res.error ? (tErr as (k: string) => string)(res.error) || res.error : tErr("unexpected_error")
          );
          return;
        }
        if (res.data) {
          router.push(`/clients/${res.data.id}`);
        } else {
          router.push("/clients");
        }
      } else if (mode === "edit" && initialData) {
        const res = await updateClientAction(initialData.id, values);
        if (!res.success) {
          setGlobalError(
            res.error ? (tErr as (k: string) => string)(res.error) || res.error : tErr("unexpected_error")
          );
          return;
        }
        router.push(`/clients/${initialData.id}`);
      }
      router.refresh();
    } catch {
      setGlobalError(tErr("network_error"));
    }
  }

  function getFieldError(key?: string): string | undefined {
    if (!key) return undefined;
    try {
      return (tErr as (k: string) => string)(key);
    } catch {
      return key;
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6 max-w-3xl mx-auto"
      aria-label={mode === "create" ? t("new_client") : t("edit_client")}
    >
      {/* Top action header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <Link
          href={mode === "edit" && initialData ? `/clients/${initialData.id}` : "/clients"}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("action_back")}
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={mode === "edit" && initialData ? `/clients/${initialData.id}` : "/clients"}
          >
            <Button type="button" variant="outline" size="sm" disabled={isSubmitting}>
              {t("action_cancel")}
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-1.5" />
            {isSubmitting ? t("action_saving") : t("action_save")}
          </Button>
        </div>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Form Cards */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            {t("field_name")} & {t("field_company")}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="name"
              label={t("field_name")}
              placeholder={t("field_name_placeholder")}
              required
              error={getFieldError(errors.name?.message)}
              {...register("name")}
            />

            <Input
              id="company_name"
              label={t("field_company")}
              placeholder={t("field_company_placeholder")}
              error={getFieldError(errors.company_name?.message)}
              {...register("company_name")}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            {t("detail_contact_info")}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="phone"
              type="tel"
              label={t("field_phone")}
              placeholder={t("field_phone_placeholder")}
              inputMode="tel"
              autoComplete="tel"
              error={getFieldError(errors.phone?.message)}
              {...register("phone")}
            />

            <Input
              id="alternate_phone"
              type="tel"
              label={t("field_alt_phone")}
              placeholder={t("field_alt_phone_placeholder")}
              inputMode="tel"
              error={getFieldError(errors.alternate_phone?.message)}
              {...register("alternate_phone")}
            />

            <div className="sm:col-span-2">
              <Input
                id="email"
                type="email"
                label={t("field_email")}
                placeholder={t("field_email_placeholder")}
                inputMode="email"
                autoComplete="email"
                error={getFieldError(errors.email?.message)}
                {...register("email")}
              />
            </div>
          </div>
        </div>

        {/* Location / Address */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            {t("detail_location_info")}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                id="city"
                label={t("field_city")}
                placeholder={t("field_city_placeholder")}
                error={getFieldError(errors.city?.message)}
                {...register("city")}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                {t("field_address")}
              </label>
              <textarea
                id="address"
                rows={3}
                placeholder={t("field_address_placeholder")}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                {...register("address")}
              />
              {errors.address && (
                <p className="mt-1.5 text-sm text-red-600">
                  {getFieldError(errors.address.message)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notes & Preferences */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            {t("field_notes")}
          </h2>

          <div>
            <textarea
              id="notes"
              rows={4}
              placeholder={t("field_notes_placeholder")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              {...register("notes")}
            />
            {errors.notes && (
              <p className="mt-1.5 text-sm text-red-600">
                {getFieldError(errors.notes.message)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom submit action */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Link
          href={mode === "edit" && initialData ? `/clients/${initialData.id}` : "/clients"}
        >
          <Button type="button" variant="outline" size="md" disabled={isSubmitting}>
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
          {isSubmitting ? t("action_saving") : t("action_save")}
        </Button>
      </div>
    </form>
  );
}
