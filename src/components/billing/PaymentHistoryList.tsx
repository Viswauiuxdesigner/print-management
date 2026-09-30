"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  Search,
  ArrowRight,
  Receipt,
} from "lucide-react";

import type {
  ClientPaymentWithDetails,
  PaymentMethod,
} from "@/lib/types/billing";
import type { Client } from "@/lib/types/client";
import { Button } from "@/components/ui/Button";

interface PaymentHistoryListProps {
  payments: ClientPaymentWithDetails[];
  clients: Client[];
  locale: string;
}

export function PaymentHistoryList({
  payments,
  clients,
}: PaymentHistoryListProps) {
  const t = useTranslations("billing");
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");

  const filtered = payments.filter((p) => {
    if (methodFilter !== "all" && p.payment_method !== methodFilter) return false;
    if (clientFilter !== "all" && p.client_id !== clientFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchBill = p.bill?.bill_number?.toLowerCase().includes(q);
      const matchClient = p.client?.name?.toLowerCase().includes(q) || p.client?.client_code?.toLowerCase().includes(q);
      const matchRef = p.reference_number?.toLowerCase().includes(q);
      const matchNotes = p.notes?.toLowerCase().includes(q);
      if (!matchBill && !matchClient && !matchRef && !matchNotes) return false;
    }
    return true;
  });

  const totalCollectedSum = filtered.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_payments_placeholder")}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 w-52 sm:w-60"
            />
          </div>

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

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | "all")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">{t("filter_all_methods")}</option>
            <option value="bank">{t("payment_bank")}</option>
            <option value="upi">{t("payment_upi")}</option>
            <option value="cash">{t("payment_cash")}</option>
            <option value="other">{t("payment_other")}</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-3">
          <span>
            {filtered.length} {filtered.length === 1 ? "payment" : "payments"}
          </span>
          <span>•</span>
          <span className="font-bold text-emerald-700">
            Total: ₹{totalCollectedSum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center border border-slate-200 space-y-2">
          <CreditCard className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">
            {t("no_payments_found_title")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("no_payments_found_desc")}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3.5 px-4">{t("field_payment_date")}</th>
                  <th className="py-3.5 px-3">{t("bill_number")}</th>
                  <th className="py-3.5 px-3">{t("col_client")}</th>
                  <th className="py-3.5 px-3 text-right">{t("col_amount")}</th>
                  <th className="py-3.5 px-3">{t("field_payment_method")}</th>
                  <th className="py-3.5 px-3">{t("field_reference")}</th>
                  <th className="py-3.5 px-4 text-right">{t("col_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {p.payment_date}
                    </td>

                    <td className="py-3 px-3">
                      <Link
                        href={`/billing/${p.bill_id}`}
                        className="font-mono font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>{p.bill?.bill_number || "Bill"}</span>
                      </Link>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {p.client?.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {p.client?.client_code}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 capitalize text-slate-700">
                      {p.payment_method}
                    </td>

                    <td className="py-3 px-3 font-mono text-xs text-slate-600">
                      {p.reference_number || "-"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link href={`/billing/${p.bill_id}`}>
                        <Button variant="secondary" size="sm">
                          <span>{t("view_bill")}</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm leading-tight">
                      {p.client?.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {p.payment_date} • {p.bill?.bill_number}
                    </div>
                  </div>

                  <span className="font-bold font-mono text-emerald-700 text-sm">
                    ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="capitalize">{t("method")}: {p.payment_method}</span>
                  {p.reference_number && (
                    <span className="font-mono text-slate-400">Ref: {p.reference_number}</span>
                  )}
                </div>

                <div className="flex items-center justify-end pt-1 border-t border-slate-100">
                  <Link href={`/billing/${p.bill_id}`}>
                    <Button variant="secondary" size="sm">
                      <span>{t("view_bill")}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
