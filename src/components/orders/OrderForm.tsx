"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { orderSchema, type OrderFormValues } from "@/lib/validators/order";
import { createOrderAction, updateOrderAction } from "@/lib/actions/orders";
import type { Order, OrderStatus } from "@/lib/types/order";
import type { Client } from "@/lib/types/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface OrderFormProps {
  mode: "create" | "edit";
  initialData?: Order;
  activeClients: Client[];
}

export function OrderForm({ mode, initialData, activeClients }: OrderFormProps) {
  const t = useTranslations("orders");
  const tErr = useTranslations("errors");
  const router = useRouter();

  const [globalError, setGlobalError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      client_id: initialData?.client_id ?? (activeClients[0]?.id || ""),
      order_date: initialData?.order_date ?? today,
      number_of_rolls: initialData?.number_of_rolls ?? 1,
      received_weight_kg: initialData?.received_weight_kg ?? (undefined as any),
      notes: initialData?.notes ?? "",
      status: initialData?.status ?? "received",
    },
  });

  async function onSubmit(values: OrderFormValues) {
    setGlobalError(null);

    try {
      if (mode === "create") {
        const res = await createOrderAction(values);
        if (!res.success) {
          setGlobalError(
            res.error ? (tErr as (k: string) => string)(res.error) || res.error : tErr("unexpected_error")
          );
          return;
        }
        if (res.data) {
          router.push(`/orders/${res.data.id}`);
        } else {
          router.push("/orders");
        }
      } else if (mode === "edit" && initialData) {
        const res = await updateOrderAction(initialData.id, values);
        if (!res.success) {
          setGlobalError(
            res.error ? (tErr as (k: string) => string)(res.error) || res.error : tErr("unexpected_error")
          );
          return;
        }
        router.push(`/orders/${initialData.id}`);
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
      aria-label={mode === "create" ? t("new_order") : t("edit_order")}
    >
      {/* Top action header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <Link
          href={mode === "edit" && initialData ? `/orders/${initialData.id}` : "/orders"}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("action_back")}
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={mode === "edit" && initialData ? `/orders/${initialData.id}` : "/orders"}
          >
            <Button type="button" variant="secondary" size="sm" disabled={isSubmitting}>
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

      {/* Form Fields Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xs space-y-5">
        <div className="space-y-4">
          {/* Client Selection */}
          <div>
            <label
              htmlFor="client_id"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              {t("field_client")} <span className="text-red-500">*</span>
            </label>
            <select
              id="client_id"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              {...register("client_id")}
            >
              {activeClients.length === 0 ? (
                <option value="">No active clients found. Please add a client first.</option>
              ) : (
                activeClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company_name ? `(${client.company_name})` : ""} — {client.client_code}
                  </option>
                ))
              )}
            </select>
            {errors.client_id && (
              <p className="mt-1.5 text-sm text-red-600">
                {getFieldError(errors.client_id.message)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Order Date */}
            <Input
              id="order_date"
              type="date"
              label={t("field_order_date")}
              required
              error={getFieldError(errors.order_date?.message)}
              {...register("order_date")}
            />

            {/* Status (In edit mode) */}
            {mode === "edit" ? (
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  {t("field_status")}
                </label>
                <select
                  id="status"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  {...register("status")}
                >
                  {(
                    ["received", "processing", "printing", "completed", "delivered", "cancelled"] as OrderStatus[]
                  ).map((st) => (
                    <option key={st} value={st}>
                      {t(`status_${st}`)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              /* Number of Rolls in create mode */
              <Input
                id="number_of_rolls"
                type="number"
                min="1"
                step="1"
                label={t("field_num_rolls")}
                placeholder={t("field_num_rolls_placeholder")}
                required
                error={getFieldError(errors.number_of_rolls?.message)}
                {...register("number_of_rolls")}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* If edit mode, show Number of rolls here */}
            {mode === "edit" && (
              <Input
                id="number_of_rolls"
                type="number"
                min="1"
                step="1"
                label={t("field_num_rolls")}
                placeholder={t("field_num_rolls_placeholder")}
                required
                error={getFieldError(errors.number_of_rolls?.message)}
                {...register("number_of_rolls")}
              />
            )}

            {/* Total Received Weight */}
            <div className={mode === "create" ? "sm:col-span-2" : ""}>
              <Input
                id="received_weight_kg"
                type="number"
                step="0.1"
                min="0.1"
                label={t("field_received_weight")}
                placeholder={t("field_received_weight_placeholder")}
                required
                error={getFieldError(errors.received_weight_kg?.message)}
                {...register("received_weight_kg")}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              {t("field_notes")}
            </label>
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

      {/* Bottom Submit Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Link
          href={mode === "edit" && initialData ? `/orders/${initialData.id}` : "/orders"}
        >
          <Button type="button" variant="secondary" size="md" disabled={isSubmitting}>
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
