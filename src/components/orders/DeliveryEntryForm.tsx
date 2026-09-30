"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Truck, X, Calendar, User, AlertCircle } from "lucide-react";
import type { DeliveryEntry } from "@/lib/types/order";
import {
  deliveryEntrySchema,
  type DeliveryEntryFormValues,
} from "@/lib/validators/order";
import { createDeliveryEntryAction } from "@/lib/actions/orders";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface DeliveryEntrySectionProps {
  orderId: string;
  entries: DeliveryEntry[];
  remainingWeight: number;
}

export function DeliveryEntrySection({
  orderId,
  entries,
  remainingWeight,
}: DeliveryEntrySectionProps) {
  const t = useTranslations("orders");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryEntryFormValues>({
    resolver: zodResolver(deliveryEntrySchema),
    defaultValues: {
      order_id: orderId,
      delivery_date: today,
      delivered_weight_kg: remainingWeight > 0 ? remainingWeight : 0,
      received_by: "",
      delivery_notes: "",
    },
  });

  function openModal() {
    setGlobalError(null);
    reset({
      order_id: orderId,
      delivery_date: today,
      delivered_weight_kg: remainingWeight > 0 ? remainingWeight : 0,
      received_by: "",
      delivery_notes: "",
    });
    setIsModalOpen(true);
  }

  async function onSubmit(values: DeliveryEntryFormValues) {
    setGlobalError(null);

    try {
      const res = await createDeliveryEntryAction(values);
      if (!res.success) {
        setGlobalError(res.error || tErr("unexpected_error"));
        return;
      }

      setIsModalOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setGlobalError(tErr("network_error"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{t("delivery_section_title")} ({entries.length})</span>
        </h2>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={openModal}
          className="whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-1.5 shrink-0" />
          <span>{t("add_delivery")}</span>
        </Button>
      </div>

      {/* Entries Log */}
      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
          <p>{t("empty_delivery")}</p>
          <div className="pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={openModal}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {t("add_delivery")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{entry.delivery_date}</span>
                  </span>

                  {entry.received_by && (
                    <span className="flex items-center gap-1 text-xs text-slate-700 font-medium">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{entry.received_by}</span>
                    </span>
                  )}
                </div>

                {entry.delivery_notes && (
                  <p className="text-xs text-slate-600 italic">
                    &ldquo;{entry.delivery_notes}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-slate-400 font-medium">
                  {t("field_delivered_weight")}:
                </span>
                <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  {Number(entry.delivered_weight_kg).toFixed(1)} kg
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Delivery Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {t("add_delivery")}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {globalError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <span>{globalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                id="delivery_date"
                type="date"
                label={t("field_delivery_date")}
                required
                error={errors.delivery_date?.message}
                {...register("delivery_date")}
              />

              <Input
                id="delivered_weight_kg"
                type="number"
                step="0.1"
                min="0.1"
                label={t("field_delivered_weight")}
                placeholder={t("field_delivered_weight_placeholder")}
                required
                error={errors.delivered_weight_kg?.message}
                {...register("delivered_weight_kg")}
              />

              <Input
                id="received_by"
                label={t("field_received_by")}
                placeholder={t("field_received_by_placeholder")}
                {...register("received_by")}
              />

              <div>
                <label
                  htmlFor="delivery_notes"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  {t("field_delivery_notes")}
                </label>
                <textarea
                  id="delivery_notes"
                  rows={3}
                  placeholder={t("field_delivery_notes_placeholder")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  {...register("delivery_notes")}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  {t("action_cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {t("action_save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
