"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { OrderStatus } from "@/lib/types/order";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import { Badge } from "@/components/ui/Badge";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const ALL_STATUSES: OrderStatus[] = [
  "received",
  "processing",
  "printing",
  "completed",
  "delivered",
  "cancelled",
];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: OrderStatusUpdaterProps) {
  const t = useTranslations("orders");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getStatusBadgeVariant(status: OrderStatus): "neutral" | "brand" | "warning" | "success" | "danger" {
    switch (status) {
      case "received":
        return "neutral";
      case "processing":
        return "brand";
      case "printing":
        return "warning";
      case "completed":
        return "success";
      case "delivered":
        return "brand";
      case "cancelled":
        return "danger";
      default:
        return "neutral";
    }
  }

  async function handleStatusChange(newStatus: OrderStatus) {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (!res.success) {
        setError(res.error ? tErr(res.error) : "Failed to update status");
      } else {
        setIsOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 focus:outline-hidden rounded-full ring-offset-2 focus:ring-2 focus:ring-brand-500 transition-opacity disabled:opacity-50 cursor-pointer"
          title="Click to change status"
        >
          <Badge
            variant={getStatusBadgeVariant(currentStatus) as any}
            size="md"
          >
            {t(`status_${currentStatus}`)}
            <span className="ml-1 text-[10px] opacity-70">▼</span>
          </Badge>
        </button>
      </div>

      {error && (
        <p className="absolute left-0 top-full mt-1 text-xs text-red-600 bg-red-50 p-1.5 rounded border border-red-200 z-30 whitespace-nowrap shadow-xs">
          {error}
        </p>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-48 rounded-xl bg-white shadow-xl ring-1 ring-black/5 z-30 py-1 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t("change_status_label")}
            </div>
            <div className="py-1">
              {ALL_STATUSES.map((status) => {
                const isSelected = status === currentStatus;
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors ${
                      isSelected
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{t(`status_${status}`)}</span>
                    {isSelected && (
                      <span className="text-brand-600 font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
