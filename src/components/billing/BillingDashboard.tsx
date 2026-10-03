"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Receipt,
  PlusCircle,
  DollarSign,
  Clock,
  CheckCircle2,
  Search,
  ArrowRight,
  Users,
  History,
  FileSpreadsheet,
} from "lucide-react";

import type {
  ClientBillWithDetails,
  BillingSummary,
  OutstandingClient,
  ClientPaymentWithDetails,
  BillStatus,
  BillingType,
} from "@/lib/types/billing";
import type { Client } from "@/lib/types/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ClientPaymentModal } from "./ClientPaymentModal";
import { OutstandingClientsList } from "./OutstandingClientsList";
import { PaymentHistoryList } from "./PaymentHistoryList";
import { BillingStatementPdfModal } from "./BillingStatementPdfModal";

interface BillingDashboardProps {
  initialSummary: BillingSummary;
  initialBills: ClientBillWithDetails[];
  outstandingClients: OutstandingClient[];
  paymentsHistory: ClientPaymentWithDetails[];
  clients: Client[];
  initialTab?: string;
  locale: string;
}

export function BillingDashboard({
  initialSummary,
  initialBills,
  outstandingClients,
  paymentsHistory,
  clients,
  initialTab = "bills",
  locale,
}: BillingDashboardProps) {
  const t = useTranslations("billing");

  const [activeTab, setActiveTab] = useState<"bills" | "outstanding" | "history">(
    initialTab === "outstanding"
      ? "outstanding"
      : initialTab === "history"
      ? "history"
      : "bills"
  );

  // Filters for Bills Tab
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<BillingType | "all">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");

  // Payment Modal State
  const [paymentBill, setPaymentBill] = useState<ClientBillWithDetails | null>(null);

  // Statement PDF Modal State
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  // Filter bills
  const filteredBills = initialBills.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (typeFilter !== "all" && b.billing_type !== typeFilter) return false;
    if (clientFilter !== "all" && b.client_id !== clientFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchBill = b.bill_number?.toLowerCase().includes(q);
      const matchClient =
        b.client?.name?.toLowerCase().includes(q) ||
        b.client?.client_code?.toLowerCase().includes(q) ||
        b.client?.company_name?.toLowerCase().includes(q);
      const matchOrder = b.order?.order_number?.toLowerCase().includes(q);
      if (!matchBill && !matchClient && !matchOrder) return false;
    }
    return true;
  });

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

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsStatementModalOpen(true)}
            className="text-slate-700 bg-white shadow-2xs hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5 text-brand-600" />
            <span>{locale === "ta" ? "அறிக்கை PDF" : "Export Statement PDF"}</span>
          </Button>

          <Link href="/billing/new">
            <Button variant="primary" size="sm">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              <span>{t("action_new_bill")}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4-Metric Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Receipt className="h-4 w-4 text-slate-600" />
            <span>{t("summary_total_billed")}</span>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-slate-900">
            ₹{initialSummary.total_billed_amount.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {initialSummary.total_bills_count} {t("bills_issued")}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{t("summary_total_paid")}</span>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-emerald-700">
            ₹{initialSummary.total_paid_amount.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">
            {initialSummary.paid_bills_count} {t("status_paid")}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-medium">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>{t("summary_total_outstanding")}</span>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-amber-700">
            ₹{initialSummary.total_outstanding_amount.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">
            {initialSummary.unpaid_bills_count + initialSummary.partially_paid_bills_count} {t("bills_pending")}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-800 text-xs font-medium">
            <Users className="h-4 w-4 text-indigo-600" />
            <span>{t("summary_pending_clients")}</span>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-indigo-900">
            {outstandingClients.length}
          </div>
          <div className="text-[11px] text-indigo-600/80 mt-0.5">
            {t("clients_with_dues")}
          </div>
        </div>
      </div>

      {/* Internal Tabs Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/80 border border-slate-200 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("bills")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "bills"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>{t("tab_all_bills")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("outstanding")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "outstanding"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{t("tab_outstanding")}</span>
          {outstandingClients.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              {outstandingClients.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <History className="h-4 w-4" />
          <span>{t("tab_payment_history")}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "outstanding" && (
        <OutstandingClientsList clients={outstandingClients} locale={locale} />
      )}

      {activeTab === "history" && (
        <PaymentHistoryList payments={paymentsHistory} clients={clients} locale={locale} />
      )}

      {activeTab === "bills" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search_bills_placeholder")}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 w-52 sm:w-60"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BillStatus | "all")}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">{t("filter_all_status")}</option>
                <option value="unpaid">{t("status_unpaid")}</option>
                <option value="partially_paid">{t("status_partially_paid")}</option>
                <option value="paid">{t("status_paid")}</option>
                <option value="cancelled">{t("status_cancelled")}</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as BillingType | "all")}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">{t("filter_all_types")}</option>
                <option value="kg">{t("type_kg")}</option>
                <option value="fixed">{t("type_fixed")}</option>
                <option value="mixed">{t("type_mixed")}</option>
              </select>

              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 max-w-[180px]"
              >
                <option value="all">{t("filter_all_clients")}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.client_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500">
              {filteredBills.length} {filteredBills.length === 1 ? "bill" : "bills"}
            </div>
          </div>

          {/* Bills List / Table */}
          {filteredBills.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 sm:p-12 text-center border border-slate-200 space-y-3">
              <Receipt className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-semibold text-slate-800">
                {t("no_bills_title")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {t("no_bills_desc")}
              </p>
              <div className="pt-2">
                <Link href="/billing/new">
                  <Button variant="primary" size="sm">
                    <PlusCircle className="h-4 w-4 mr-1.5" />
                    <span>{t("action_new_bill")}</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="py-3.5 px-4">{t("bill_number")}</th>
                      <th className="py-3.5 px-3">{t("col_client")}</th>
                      <th className="py-3.5 px-3">{t("col_billing_type")}</th>
                      <th className="py-3.5 px-3 text-right">{t("col_net")}</th>
                      <th className="py-3.5 px-3 text-right">{t("col_paid")}</th>
                      <th className="py-3.5 px-3 text-right">{t("col_pending")}</th>
                      <th className="py-3.5 px-3 text-center">{t("col_status")}</th>
                      <th className="py-3.5 px-4 text-right">{t("col_actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {filteredBills.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            href={`/billing/${b.id}`}
                            className="font-mono font-bold text-slate-900 hover:text-brand-600"
                          >
                            {b.bill_number}
                          </Link>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            {b.bill_date} {b.order ? `• ${b.order.order_number}` : ""}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 leading-tight">
                            {b.client?.name}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            {b.client?.client_code} {b.client?.company_name ? `• ${b.client.company_name}` : ""}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="capitalize text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {b.billing_type === "kg"
                              ? t("type_kg")
                              : b.billing_type === "fixed"
                              ? t("type_fixed")
                              : t("type_mixed")}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{Number(b.net_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-emerald-700">
                          ₹{Number(b.paid_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                          ₹{Number(b.pending_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {getStatusBadge(b.status)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.status !== "cancelled" && b.pending_amount > 0 && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setPaymentBill(b)}
                              >
                                <DollarSign className="h-3.5 w-3.5 mr-0.5" />
                                <span>{t("action_pay")}</span>
                              </Button>
                            )}

                            <Link href={`/billing/${b.id}`}>
                              <Button variant="secondary" size="sm">
                                <span>{t("action_details")}</span>
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {filteredBills.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="font-bold font-mono text-slate-900 text-sm leading-tight">
                          {b.bill_number}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {b.client?.name} • <span className="font-mono">{b.bill_date}</span>
                        </div>
                      </div>
                      <div>{getStatusBadge(b.status)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-500 block">{t("col_net")}</span>
                        <span className="font-bold font-mono text-slate-900">
                          ₹{Number(b.net_amount).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-amber-50/75">
                        <span className="text-amber-800 block">{t("col_pending")}</span>
                        <span className="font-bold font-mono text-amber-700">
                          ₹{Number(b.pending_amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <Link href={`/billing/${b.id}`} className="w-full">
                        <Button variant="secondary" size="sm" className="w-full">
                          <span>{t("action_details")}</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>

                      {b.status !== "cancelled" && b.pending_amount > 0 && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => setPaymentBill(b)}
                        >
                          <DollarSign className="h-3.5 w-3.5 mr-1" />
                          <span>{t("action_pay")}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {paymentBill && (
        <ClientPaymentModal
          bill={paymentBill}
          isOpen={!!paymentBill}
          onClose={() => setPaymentBill(null)}
        />
      )}

      {/* Statement PDF Export Modal */}
      {isStatementModalOpen && (
        <BillingStatementPdfModal
          bills={initialBills}
          clients={clients}
          isOpen={isStatementModalOpen}
          onClose={() => setIsStatementModalOpen(false)}
          locale={locale}
        />
      )}
    </div>
  );
}
