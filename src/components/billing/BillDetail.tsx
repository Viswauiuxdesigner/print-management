"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  DollarSign,
  User,
  CreditCard,
  Receipt,
  Scale,
  Clock,
  AlertCircle,
  Package,
  Edit2,
  Ban,
} from "lucide-react";

import type {
  ClientBillWithDetails,
  BillStatus,
} from "@/lib/types/billing";
import { cancelBillAction } from "@/lib/actions/billing";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ClientPaymentModal } from "./ClientPaymentModal";

interface BillDetailProps {
  bill: ClientBillWithDetails;
  locale: string;
}

export function BillDetail({ bill }: BillDetailProps) {
  const t = useTranslations("billing");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const getStatusBadge = (status: BillStatus) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">{t("status_paid")}</Badge>;
      case "partially_paid":
        return <Badge variant="warning">{t("status_partially_paid")}</Badge>;
      case "cancelled":
        return <Badge variant="danger">{t("status_cancelled")}</Badge>;
      case "unpaid":
      default:
        return <Badge variant="neutral">{t("status_unpaid")}</Badge>;
    }
  };

  const handleCancelBill = async () => {
    if (!cancelReason.trim()) return;
    setActionError(null);

    try {
      const res = await cancelBillAction({
        bill_id: bill.id,
        reason: cancelReason.trim(),
      });

      if (!res.success) {
        setActionError(res.error || tErr("unexpected_error"));
        return;
      }

      setIsCancelDialogOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setActionError(tErr("network_error"));
    }
  };

  const isEditable = bill.status !== "cancelled" && bill.status !== "paid";
  const canCancel = bill.status !== "cancelled" && Number(bill.paid_amount || 0) === 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/billing"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("nav_billing_dashboard")}</span>
        </Link>

        <div className="flex items-center gap-2">
          {isEditable && (
            <Link href={`/billing/${bill.id}/edit`}>
              <Button variant="secondary" size="sm">
                <Edit2 className="h-3.5 w-3.5 mr-1 text-slate-600" />
                <span>{t("action_edit")}</span>
              </Button>
            </Link>
          )}

          {canCancel && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCancelDialogOpen(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Ban className="h-3.5 w-3.5 mr-1" />
              <span>{t("action_cancel_bill")}</span>
            </Button>
          )}

          {bill.status !== "cancelled" && bill.pending_amount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{t("action_record_payment")}</span>
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 p-3.5 bg-red-50 text-red-800 text-xs sm:text-sm rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Bill Overview Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg border border-brand-100 shrink-0">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                  {bill.bill_number}
                </h1>
                {getStatusBadge(bill.status)}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {t("bill_date")}: <span className="font-mono font-medium text-slate-700">{bill.bill_date}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <span className="text-xs text-slate-500">{t("col_net")}</span>
            <span className="text-xl font-bold font-mono text-slate-900">
              ₹{Number(bill.net_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Client & Linked Order Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900">{t("client_details")}</h2>
            </div>
            <Link
              href={`/clients/${bill.client_id}`}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800"
            >
              {t("view_client")}
            </Link>
          </div>

          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="font-bold text-slate-900 text-sm">
              {bill.client?.name}
            </div>
            {bill.client?.company_name && (
              <div className="text-slate-600">{bill.client.company_name}</div>
            )}
            <div className="text-slate-500 font-mono text-xs">
              Code: {bill.client?.client_code} • {bill.client?.phone || "No Phone"}
            </div>
            {bill.client?.city && (
              <div className="text-slate-500 text-xs">{bill.client.city}</div>
            )}
          </div>
        </div>

        {/* Linked Order Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900">{t("linked_order")}</h2>
            </div>
            {bill.order && (
              <Link
                href={`/orders/${bill.order_id}`}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                {t("view_order")}
              </Link>
            )}
          </div>

          {bill.order ? (
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="font-bold font-mono text-slate-900 text-sm">
                {bill.order.order_number}
              </div>
              <div className="text-slate-600">
                {t("order_date")}: <span className="font-mono">{bill.order.order_date}</span>
              </div>
              <div className="text-slate-500 text-xs">
                {t("order_received_weight")}: <span className="font-mono font-medium">{bill.order.received_weight_kg} kg</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-3 italic">
              {t("no_linked_order")}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Financial Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {t("section_financial_breakdown")}
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 uppercase">
            {bill.billing_type === "kg"
              ? t("type_kg")
              : bill.billing_type === "fixed"
              ? t("type_fixed")
              : t("type_mixed")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-sm">
          {(bill.billing_type === "kg" || bill.billing_type === "mixed") && (
            <>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-xs">{t("field_billable_weight")}</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {bill.billable_weight_kg} kg
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-xs">{t("field_rate_per_kg")}</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ₹{Number(bill.rate_per_kg).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </>
          )}

          {bill.billing_type === "fixed" && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block text-xs">{t("field_fixed_amount")}</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                ₹{Number(bill.fixed_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {bill.billing_type === "mixed" && bill.additional_amount > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block text-xs">{t("field_additional_amount")}</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                ₹{Number(bill.additional_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-xs">{t("col_gross")}</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              ₹{Number(bill.gross_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-xs">{t("col_discount")}</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              -₹{Number(bill.discount_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/75 border border-emerald-100">
            <span className="text-emerald-800 block text-xs">{t("col_paid")}</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              ₹{Number(bill.paid_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/75 border border-amber-100">
            <span className="text-amber-800 block text-xs">{t("col_pending")}</span>
            <span className="font-mono font-bold text-amber-700 text-sm">
              ₹{Number(bill.pending_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {bill.notes && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
            <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">
              {t("field_notes")}
            </span>
            <span className="whitespace-pre-line">{bill.notes}</span>
          </div>
        )}
      </div>

      {/* Payment History & Ledger Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900">
              {t("section_payment_history")}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-slate-500">{t("col_paid")}:</span>
            <span className="font-bold font-mono text-emerald-700">
              ₹{Number(bill.paid_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {(!bill.payments || bill.payments.length === 0) ? (
          <div className="text-center py-8 text-slate-500 space-y-2">
            <Clock className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs sm:text-sm">{t("no_payments_yet")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">{t("field_payment_date")}</th>
                  <th className="py-2.5 px-3">{t("field_payment_method")}</th>
                  <th className="py-2.5 px-3">{t("field_reference")}</th>
                  <th className="py-2.5 px-3 text-right">{t("col_amount")}</th>
                  <th className="py-2.5 px-3">{t("field_notes")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/75">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{p.payment_date}</td>
                    <td className="py-2.5 px-3 capitalize text-slate-700">{p.payment_method}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{p.reference_number || "-"}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{p.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <ClientPaymentModal
          bill={bill}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}

      {/* Cancel Bill Confirmation Dialog */}
      {isCancelDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {t("cancel_bill_title")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("cancel_bill_desc")}
            </p>

            <div>
              <label
                htmlFor="cancel_reason"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {t("cancel_reason_label")} *
              </label>
              <textarea
                id="cancel_reason"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Order cancelled, Billing error, Re-issuing bill..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCancelDialogOpen(false)}
                disabled={isPending}
              >
                {t("action_cancel")}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancelBill}
                loading={isPending}
                disabled={isPending || !cancelReason.trim()}
              >
                {t("action_confirm_cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
