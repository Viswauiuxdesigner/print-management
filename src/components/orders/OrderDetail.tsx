import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  Edit2,
  Building2,
  Calendar,
  FileText,
  Clock,
  Layers,
  Scale,
  Printer,
  Truck,
  CheckCircle,
} from "lucide-react";
import type { OrderDetailWithRelations } from "@/lib/types/order";
import { Button } from "@/components/ui/Button";
import { OrderStatusUpdater } from "@/components/orders/OrderStatusUpdater";
import { RollList } from "@/components/orders/RollList";
import { ProductionEntrySection } from "@/components/orders/ProductionEntryForm";
import { DeliveryEntrySection } from "@/components/orders/DeliveryEntryForm";

interface OrderDetailProps {
  order: OrderDetailWithRelations;
}

export async function OrderDetail({ order }: OrderDetailProps) {
  const t = await getTranslations("orders");

  // Format dates safely
  const formattedOrderDate = new Date(order.order_date).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const formattedCreatedAt = new Date(order.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const formattedUpdatedAt = new Date(order.updated_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top back navigation */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("action_back")}
        </Link>
      </div>

      {/* Main Order Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-bold px-3 py-1 rounded-md bg-slate-900 text-white tracking-wide">
                {order.order_number}
              </span>
              <OrderStatusUpdater
                orderId={order.id}
                currentStatus={order.status}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight break-words">
              <Link
                href={`/clients/${order.client_id}`}
                className="hover:text-brand-600 hover:underline transition-colors"
              >
                {order.client?.name || "Client"}
              </Link>
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-slate-600">
              {order.client?.company_name && (
                <p className="flex items-center gap-1.5 font-medium text-slate-600 break-words">
                  <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{order.client.company_name}</span>
                </p>
              )}
              <p className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  {t("field_order_date")}: <strong>{formattedOrderDate}</strong>
                </span>
              </p>
            </div>
          </div>

          {/* Header Action: Edit Order */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto pt-2 sm:pt-0">
            <Link href={`/orders/${order.id}/edit`} className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto justify-center whitespace-nowrap"
              >
                <Edit2 className="h-4 w-4 mr-1.5 shrink-0" />
                <span>{t("action_edit")}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4 KEY WEIGHT & ROLL SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Received Weight */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight break-words">
              {t("metric_received")}
            </span>
            <Scale className="h-4 w-4 text-slate-400 shrink-0" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {order.received_weight_kg.toFixed(2)}{" "}
            <span className="text-xs font-sans font-normal text-slate-500">kg</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {order.rolls.length} / {order.number_of_rolls} {t("metric_rolls_recorded")}
            </span>
          </p>
        </div>

        {/* Printed Weight */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider leading-tight break-words">
              {t("metric_printed")}
            </span>
            <Printer className="h-4 w-4 text-amber-500 shrink-0" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold font-mono text-amber-700">
            {order.total_printed_weight.toFixed(2)}{" "}
            <span className="text-xs font-sans font-normal text-amber-600">kg</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500 leading-tight">
            {order.production_entries.length} {t("metric_production_entries")}
          </p>
        </div>

        {/* Delivered Weight */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider leading-tight break-words">
              {t("metric_delivered")}
            </span>
            <Truck className="h-4 w-4 text-emerald-500 shrink-0" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold font-mono text-emerald-700">
            {order.total_delivered_weight.toFixed(2)}{" "}
            <span className="text-xs font-sans font-normal text-emerald-600">kg</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500 leading-tight">
            {order.delivery_entries.length} {t("metric_delivery_entries")}
          </p>
        </div>

        {/* Remaining Weight */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider leading-tight break-words">
              {t("metric_remaining")}
            </span>
            <CheckCircle className="h-4 w-4 text-brand-500 shrink-0" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold font-mono text-brand-700">
            {order.remaining_weight.toFixed(2)}{" "}
            <span className="text-xs font-sans font-normal text-brand-600">kg</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500 leading-tight">
            {order.remaining_weight === 0 && order.total_delivered_weight > 0
              ? t("badge_fully_delivered")
              : t("badge_in_progress")}
          </p>
        </div>
      </div>

      {/* Order Notes (if present) */}
      {order.notes && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-2">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600 shrink-0" />
            <span>{t("field_notes")}</span>
          </h2>
          <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed break-words">
            {order.notes}
          </div>
        </div>
      )}

      {/* ── SECTION: INDIVIDUAL ROLLS BREAKDOWN ── */}
      <RollList orderId={order.id} rolls={order.rolls} />

      {/* ── SECTION: PRODUCTION LOGGING ── */}
      <ProductionEntrySection
        orderId={order.id}
        rolls={order.rolls}
        entries={order.production_entries}
      />

      {/* ── SECTION: DELIVERY TRACKING ── */}
      <DeliveryEntrySection
        orderId={order.id}
        entries={order.delivery_entries}
        remainingWeight={order.remaining_weight}
      />

      {/* Audit & Timestamps Footer */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            {t("detail_created_on")}:{" "}
            <strong className="text-slate-800 font-semibold">
              {formattedCreatedAt}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            {t("detail_last_updated")}:{" "}
            <strong className="text-slate-800 font-semibold">
              {formattedUpdatedAt}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
