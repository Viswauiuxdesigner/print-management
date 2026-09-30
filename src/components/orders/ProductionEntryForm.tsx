"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Printer, X, Calendar, AlertCircle } from "lucide-react";
import type { OrderRoll, ProductionEntry } from "@/lib/types/order";
import {
  productionEntrySchema,
  type ProductionEntryFormValues,
} from "@/lib/validators/order";
import { createProductionEntryAction } from "@/lib/actions/orders";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ProductionEntrySectionProps {
  orderId: string;
  rolls: OrderRoll[];
  entries: ProductionEntry[];
}

export function ProductionEntrySection({
  orderId,
  rolls,
  entries,
}: ProductionEntrySectionProps) {
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
  } = useForm<ProductionEntryFormValues>({
    resolver: zodResolver(productionEntrySchema),
    defaultValues: {
      order_id: orderId,
      order_roll_id: "",
      entry_date: today,
      printed_weight_kg: 0,
      notes: "",
    },
  });

  function openModal() {
    setGlobalError(null);
    reset({
      order_id: orderId,
      order_roll_id: rolls[0]?.id || "",
      entry_date: today,
      printed_weight_kg: 0,
      notes: "",
    });
    setIsModalOpen(true);
  }

  async function onSubmit(values: ProductionEntryFormValues) {
    setGlobalError(null);

    try {
      const res = await createProductionEntryAction(values);
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
          <Printer className="h-4 w-4 text-amber-600 shrink-0" />
          <span>{t("production_section_title")} ({entries.length})</span>
        </h2>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={openModal}
          className="whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-1.5 shrink-0" />
          <span>{t("add_production")}</span>
        </Button>
      </div>

      {/* Entries Log */}
      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
          <p>{t("empty_production")}</p>
          <div className="pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={openModal}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {t("add_production")}
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
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{entry.entry_date}</span>
                  </span>

                  {entry.order_rolls && (
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {entry.order_rolls.roll_number}
                    </span>
                  )}
                </div>

                {entry.notes && (
                  <p className="text-xs text-slate-600 italic">
                    &ldquo;{entry.notes}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-slate-400 font-medium">
                  {t("field_printed_weight")}:
                </span>
                <span className="font-mono text-sm font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  {Number(entry.printed_weight_kg).toFixed(1)} kg
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Production Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {t("add_production")}
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
                id="entry_date"
                type="date"
                label={t("field_entry_date")}
                required
                error={errors.entry_date?.message}
                {...register("entry_date")}
              />

              {rolls.length > 0 && (
                <div>
                  <label
                    htmlFor="order_roll_id"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    {t("field_select_roll")}
                  </label>
                  <select
                    id="order_roll_id"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    {...register("order_roll_id")}
                  >
                    <option value="">-- General Order (No specific roll) --</option>
                    {rolls.map((roll) => (
                      <option key={roll.id} value={roll.id}>
                        {roll.roll_number} — {roll.received_weight_kg.toFixed(1)} kg {roll.color ? `(${roll.color})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Input
                id="printed_weight_kg"
                type="number"
                step="0.1"
                min="0.1"
                label={t("field_printed_weight")}
                placeholder={t("field_printed_weight_placeholder")}
                required
                error={errors.printed_weight_kg?.message}
                {...register("printed_weight_kg")}
              />

              <div>
                <label
                  htmlFor="production_notes"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  {t("field_production_notes")}
                </label>
                <textarea
                  id="production_notes"
                  rows={3}
                  placeholder={t("field_production_notes_placeholder")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  {...register("notes")}
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
