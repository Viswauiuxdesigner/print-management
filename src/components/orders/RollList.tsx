"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit2, Trash2, Layers, X, AlertCircle } from "lucide-react";
import type { OrderRoll, RollStatus } from "@/lib/types/order";
import { rollSchema, type RollFormValues } from "@/lib/validators/order";
import {
  createRollAction,
  updateRollAction,
  deleteRollAction,
} from "@/lib/actions/orders";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface RollListProps {
  orderId: string;
  rolls: OrderRoll[];
}

export function RollList({ orderId, rolls }: RollListProps) {
  const t = useTranslations("orders");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoll, setEditingRoll] = useState<OrderRoll | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RollFormValues>({
    resolver: zodResolver(rollSchema),
    defaultValues: {
      roll_number: `R-${String(rolls.length + 1).padStart(2, "0")}`,
      received_weight_kg: 0,
      color: "",
      pattern: "",
      design_info: "",
      screen_number: "",
      notes: "",
      status: "pending",
    },
  });

  function openAddModal() {
    setEditingRoll(null);
    setGlobalError(null);
    reset({
      roll_number: `R-${String(rolls.length + 1).padStart(2, "0")}`,
      received_weight_kg: 0,
      color: "",
      pattern: "",
      design_info: "",
      screen_number: "",
      notes: "",
      status: "pending",
    });
    setIsModalOpen(true);
  }

  function openEditModal(roll: OrderRoll) {
    setEditingRoll(roll);
    setGlobalError(null);
    reset({
      roll_number: roll.roll_number,
      received_weight_kg: roll.received_weight_kg,
      color: roll.color ?? "",
      pattern: roll.pattern ?? "",
      design_info: roll.design_info ?? "",
      screen_number: roll.screen_number ?? "",
      notes: roll.notes ?? "",
      status: roll.status,
    });
    setIsModalOpen(true);
  }

  async function onSubmit(values: RollFormValues) {
    setGlobalError(null);

    try {
      if (editingRoll) {
        const res = await updateRollAction(editingRoll.id, orderId, values);
        if (!res.success) {
          setGlobalError(res.error || tErr("unexpected_error"));
          return;
        }
      } else {
        const res = await createRollAction(orderId, values);
        if (!res.success) {
          setGlobalError(res.error || tErr("unexpected_error"));
          return;
        }
      }

      setIsModalOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setGlobalError(tErr("network_error"));
    }
  }

  async function handleDeleteRoll(rollId: string) {
    if (!confirm("Are you sure you want to remove this roll?")) return;

    setIsDeletingId(rollId);
    try {
      const res = await deleteRollAction(rollId, orderId);
      if (res.success) {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      console.error("Failed to delete roll:", err);
    } finally {
      setIsDeletingId(null);
    }
  }

  function getRollStatusVariant(
    status: RollStatus
  ): "neutral" | "warning" | "success" | "brand" {
    switch (status) {
      case "pending":
        return "neutral";
      case "printing":
        return "warning";
      case "printed":
      case "delivered":
        return "success";
      default:
        return "neutral";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Layers className="h-4 w-4 text-brand-600 shrink-0" />
          <span>{t("rolls_section_title")} ({rolls.length})</span>
        </h2>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={openAddModal}
          className="whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-1.5 shrink-0" />
          <span>{t("add_roll")}</span>
        </Button>
      </div>

      {/* Empty State */}
      {rolls.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
          <p>{t("empty_rolls")}</p>
          <div className="pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {t("add_roll")}
            </Button>
          </div>
        </div>
      ) : (
        /* Rolls Grid / Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rolls.map((roll) => (
            <div
              key={roll.id}
              className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {roll.roll_number}
                  </span>
                  <Badge variant={getRollStatusVariant(roll.status)} size="sm">
                    {t(`roll_status_${roll.status}`)}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(roll)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label={`Edit ${roll.roll_number}`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRoll(roll.id)}
                    disabled={isDeletingId === roll.id}
                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Delete ${roll.roll_number}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-600 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t("field_roll_weight")}:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {roll.received_weight_kg.toFixed(1)} kg
                  </span>
                </div>

                {roll.color && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t("field_color")}:</span>
                    <span className="font-medium text-slate-800">{roll.color}</span>
                  </div>
                )}

                {roll.pattern && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t("field_pattern")}:</span>
                    <span className="truncate max-w-[140px]">{roll.pattern}</span>
                  </div>
                )}

                {roll.screen_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t("field_screen_number")}:</span>
                    <span className="font-mono">{roll.screen_number}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Roll Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoll ? t("edit_roll") : t("add_roll")}
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
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="roll_number"
                  label={t("field_roll_number")}
                  placeholder={t("field_roll_number_placeholder")}
                  required
                  error={errors.roll_number?.message}
                  {...register("roll_number")}
                />

                <Input
                  id="received_weight_kg"
                  type="number"
                  step="0.1"
                  min="0"
                  label={t("field_roll_weight")}
                  placeholder={t("field_roll_weight_placeholder")}
                  required
                  error={errors.received_weight_kg?.message}
                  {...register("received_weight_kg")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="color"
                  label={t("field_color")}
                  placeholder={t("field_color_placeholder")}
                  {...register("color")}
                />

                <Input
                  id="screen_number"
                  label={t("field_screen_number")}
                  placeholder={t("field_screen_number_placeholder")}
                  {...register("screen_number")}
                />
              </div>

              <Input
                id="pattern"
                label={t("field_pattern")}
                placeholder={t("field_pattern_placeholder")}
                {...register("pattern")}
              />

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t("field_roll_status")}
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  {...register("status")}
                >
                  {(["pending", "printing", "printed", "delivered"] as RollStatus[]).map((st) => (
                    <option key={st} value={st}>
                      {t(`roll_status_${st}`)}
                    </option>
                  ))}
                </select>
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
