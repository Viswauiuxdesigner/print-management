"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Receipt,
  Scale,
  Sparkles,
  AlertCircle,
  Package,
} from "lucide-react";

import {
  createBillSchema,
  type CreateBillFormValues,
} from "@/lib/validators/billing";
import type {
  ClientBillWithDetails,
  BillingType,
} from "@/lib/types/billing";
import type { Client } from "@/lib/types/client";
import type { Order } from "@/lib/types/order";
import { createBillAction, updateBillAction } from "@/lib/actions/billing";
import { calculateBill } from "@/lib/billing/calculations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface BillFormProps {
  initialBill?: ClientBillWithDetails;
  clients: Client[];
  orders: Order[];
  preselectedClientId?: string;
  preselectedOrderId?: string;
  locale: string;
}

export function BillForm({
  initialBill,
  clients,
  orders,
  preselectedClientId,
  preselectedOrderId,
}: BillFormProps) {
  const t = useTranslations("billing");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const isEdit = !!initialBill;
  const todayStr = new Date().toISOString().split("T")[0];
  const activeClients = clients.filter((c) => c.is_active || c.id === initialBill?.client_id);

  const defaultClientId =
    initialBill?.client_id ||
    preselectedClientId ||
    (activeClients[0]?.id ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateBillFormValues>({
    resolver: zodResolver(createBillSchema),
    defaultValues: {
      client_id: defaultClientId,
      order_id: initialBill?.order_id || preselectedOrderId || null,
      bill_date: initialBill?.bill_date || todayStr,
      billing_type: initialBill?.billing_type || "kg",
      billable_weight_kg: initialBill?.billable_weight_kg || undefined,
      rate_per_kg: initialBill?.rate_per_kg || undefined,
      fixed_amount: initialBill?.fixed_amount || undefined,
      additional_amount: initialBill?.additional_amount || 0,
      discount_amount: initialBill?.discount_amount || 0,
      notes: initialBill?.notes || "",
    },
  });

  const selectedClientId = useWatch({ control, name: "client_id" });
  const selectedBillingType = useWatch({ control, name: "billing_type" }) as BillingType;
  const watchWeight = useWatch({ control, name: "billable_weight_kg" });
  const watchRate = useWatch({ control, name: "rate_per_kg" });
  const watchFixed = useWatch({ control, name: "fixed_amount" });
  const watchAdditional = useWatch({ control, name: "additional_amount" });
  const watchDiscount = useWatch({ control, name: "discount_amount" });

  // Filter orders for the chosen client
  const clientOrders = useMemo(() => {
    if (!selectedClientId) return [];
    return orders.filter((o) => o.client_id === selectedClientId);
  }, [orders, selectedClientId]);

  // Handle order selection to auto-fill weight
  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orderId = e.target.value;
    setValue("order_id", orderId ? orderId : null);
    if (orderId) {
      const order = orders.find((o) => o.id === orderId);
      if (order && !watchWeight) {
        setValue("billable_weight_kg", Number(order.received_weight_kg));
      }
    }
  };

  // Live calculation preview
  const preview = useMemo(() => {
    return calculateBill({
      billingType: selectedBillingType,
      billableWeightKg: watchWeight,
      ratePerKg: watchRate,
      fixedAmount: watchFixed,
      additionalAmount: watchAdditional,
      discountAmount: watchDiscount,
      paidAmount: initialBill ? Number(initialBill.paid_amount || 0) : 0,
    });
  }, [
    selectedBillingType,
    watchWeight,
    watchRate,
    watchFixed,
    watchAdditional,
    watchDiscount,
    initialBill,
  ]);

  const onSubmit = async (values: CreateBillFormValues) => {
    setServerError(null);

    try {
      if (isEdit && initialBill) {
        const res = await updateBillAction(initialBill.id, values);
        if (!res.success) {
          setServerError(res.error || tErr("unexpected_error"));
          return;
        }
        startTransition(() => {
          router.push(`/billing/${initialBill.id}`);
          router.refresh();
        });
      } else {
        const res = await createBillAction(values);
        if (!res.success) {
          setServerError(res.error || tErr("unexpected_error"));
          return;
        }
        startTransition(() => {
          router.push(`/billing/${res.data?.id}`);
          router.refresh();
        });
      }
    } catch {
      setServerError(tErr("network_error"));
    }
  };

  const isWorking = isSubmitting || isPending;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={isEdit ? `/billing/${initialBill?.id}` : "/billing"}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("action_back")}</span>
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {isEdit ? t("edit_bill_title") : t("new_bill_title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {isEdit ? `${t("bill_number")}: ${initialBill?.bill_number}` : t("new_bill_desc")}
        </p>
      </div>

      {serverError && (
        <div className="flex items-start gap-2 p-3.5 bg-red-50 text-red-800 text-xs sm:text-sm rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Client & Order Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Receipt className="h-4 w-4 text-brand-600" />
            <span>{t("section_client_order")}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="client_id"
                className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5"
              >
                {t("field_client")} *
              </label>
              <select
                id="client_id"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                {...register("client_id")}
              >
                {activeClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company_name ? `(${c.company_name})` : ""} - {c.client_code}
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <p className="mt-1 text-xs text-red-600">{errors.client_id.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="order_id"
                className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5"
              >
                {t("field_linked_order")} ({t("optional")})
              </label>
              <select
                id="order_id"
                onChange={handleOrderChange}
                defaultValue={initialBill?.order_id || preselectedOrderId || ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              >
                <option value="">{t("select_none")}</option>
                {clientOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.order_number} ({o.order_date}) - {o.received_weight_kg} kg [{o.status}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Input
              id="bill_date"
              type="date"
              label={t("field_bill_date")}
              required
              error={errors.bill_date?.message}
              {...register("bill_date")}
            />
          </div>
        </div>

        {/* Pricing & Billing Type Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Scale className="h-4 w-4 text-brand-600" />
              <span>{t("section_pricing_model")}</span>
            </h2>
          </div>

          {/* Billing Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
              {t("field_billing_type")} *
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(["kg", "fixed", "mixed"] as BillingType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue("billing_type", type)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedBillingType === type
                      ? "border-brand-600 bg-brand-50/75 text-brand-900 ring-2 ring-brand-500/20 font-bold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium"
                  }`}
                >
                  <div className="text-xs sm:text-sm capitalize">
                    {type === "kg"
                      ? t("type_kg")
                      : type === "fixed"
                      ? t("type_fixed")
                      : t("type_mixed")}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">
                    {type === "kg"
                      ? t("type_kg_desc")
                      : type === "fixed"
                      ? t("type_fixed_desc")
                      : t("type_mixed_desc")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {(selectedBillingType === "kg" || selectedBillingType === "mixed") && (
              <>
                <Input
                  id="billable_weight_kg"
                  type="number"
                  step="0.001"
                  min="0"
                  label={t("field_billable_weight")}
                  placeholder="0.000"
                  required
                  error={errors.billable_weight_kg?.message}
                  {...register("billable_weight_kg")}
                />

                <Input
                  id="rate_per_kg"
                  type="number"
                  step="0.01"
                  min="0"
                  label={t("field_rate_per_kg")}
                  placeholder="₹ 0.00"
                  required
                  error={errors.rate_per_kg?.message}
                  {...register("rate_per_kg")}
                />
              </>
            )}

            {selectedBillingType === "fixed" && (
              <Input
                id="fixed_amount"
                type="number"
                step="0.01"
                min="0"
                label={t("field_fixed_amount")}
                placeholder="₹ 0.00"
                required
                error={errors.fixed_amount?.message}
                {...register("fixed_amount")}
              />
            )}

            {selectedBillingType === "mixed" && (
              <Input
                id="additional_amount"
                type="number"
                step="0.01"
                min="0"
                label={t("field_additional_amount")}
                placeholder="₹ 0.00"
                error={errors.additional_amount?.message}
                {...register("additional_amount")}
              />
            )}

            <Input
              id="discount_amount"
              type="number"
              step="0.01"
              min="0"
              label={t("field_discount_amount")}
              placeholder="₹ 0.00"
              error={errors.discount_amount?.message}
              {...register("discount_amount")}
            />
          </div>

          {/* Notes */}
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
              placeholder={t("field_notes_placeholder")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              {...register("notes")}
            />
          </div>
        </div>

        {/* Live Calculation Summary Banner */}
        <div className="rounded-2xl border border-brand-200 bg-linear-to-br from-brand-50/80 to-slate-50 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-brand-100 pb-2">
            <div className="flex items-center gap-2 text-brand-900 font-bold text-xs uppercase tracking-wide">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <span>{t("calculation_summary")}</span>
            </div>
            <span className="text-xs text-brand-700 font-medium">
              {selectedBillingType === "kg"
                ? `${watchWeight || 0} kg × ₹${watchRate || 0}`
                : selectedBillingType === "fixed"
                ? `Fixed: ₹${watchFixed || 0}`
                : `${watchWeight || 0} kg × ₹${watchRate || 0} + ₹${watchAdditional || 0}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-500 block text-xs">{t("col_gross")}</span>
              <span className="font-bold font-mono text-slate-900 text-base">
                ₹{preview.grossAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-500 block text-xs">{t("col_discount")}</span>
              <span className="font-bold font-mono text-emerald-700 text-base">
                -₹{preview.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-500 block text-xs">{t("col_net")}</span>
              <span className="font-bold font-mono text-brand-700 text-base">
                ₹{preview.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-amber-800 block text-xs">{t("col_pending")}</span>
              <span className="font-bold font-mono text-amber-700 text-base">
                ₹{preview.pendingAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={isEdit ? `/billing/${initialBill?.id}` : "/billing"}>
            <Button type="button" variant="secondary" size="md" disabled={isWorking}>
              {t("action_cancel")}
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isWorking}
            disabled={isWorking}
          >
            <Package className="h-4 w-4 mr-1.5" />
            <span>{isWorking ? t("action_saving") : isEdit ? t("action_update_bill") : t("action_create_bill")}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
