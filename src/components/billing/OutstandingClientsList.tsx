"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Users,
  Search,
  ArrowRight,
  Clock,
  Phone,
} from "lucide-react";

import type { OutstandingClient } from "@/lib/types/billing";
import { Button } from "@/components/ui/Button";

interface OutstandingClientsListProps {
  clients: OutstandingClient[];
  locale: string;
}

export function OutstandingClientsList({
  clients,
}: OutstandingClientsListProps) {
  const t = useTranslations("billing");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"outstanding" | "name" | "bills">("outstanding");

  let filtered = clients.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.client_name?.toLowerCase().includes(q);
      const matchCode = c.client_code?.toLowerCase().includes(q);
      const matchCompany = c.company_name?.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCompany && !matchPhone) return false;
    }
    return true;
  });

  filtered = filtered.sort((a, b) => {
    if (sortBy === "name") return a.client_name.localeCompare(b.client_name);
    if (sortBy === "bills") return b.bills_count - a.bills_count;
    return b.outstanding_amount - a.outstanding_amount;
  });

  const totalOutstandingSum = filtered.reduce((acc, c) => acc + c.outstanding_amount, 0);

  return (
    <div className="space-y-4">
      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_client_placeholder")}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 w-52 sm:w-64"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "outstanding" | "name" | "bills")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            <option value="outstanding">{t("sort_outstanding_desc")}</option>
            <option value="name">{t("sort_name")}</option>
            <option value="bills">{t("sort_bills_count")}</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-3">
          <span>
            {filtered.length} {filtered.length === 1 ? "client" : "clients"}
          </span>
          <span>•</span>
          <span className="font-bold text-amber-700">
            Total: ₹{totalOutstandingSum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center border border-slate-200 space-y-2">
          <Users className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">
            {t("no_outstanding_clients_title")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("no_outstanding_clients_desc")}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3.5 px-4">{t("col_client")}</th>
                  <th className="py-3.5 px-3 text-right">{t("col_total_billed")}</th>
                  <th className="py-3.5 px-3 text-right">{t("col_paid")}</th>
                  <th className="py-3.5 px-3 text-right">{t("col_outstanding")}</th>
                  <th className="py-3.5 px-3 text-center">{t("col_unpaid_bills")}</th>
                  <th className="py-3.5 px-3">{t("col_latest_bill")}</th>
                  <th className="py-3.5 px-4 text-right">{t("col_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filtered.map((c) => (
                  <tr key={c.client_id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {c.client_name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {c.client_code} {c.company_name ? `• ${c.company_name}` : ""}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      ₹{c.total_billed.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-emerald-700">
                      ₹{c.total_paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                      ₹{c.outstanding_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                      {c.bills_count}
                    </td>

                    <td className="py-3 px-3 font-mono text-xs text-slate-500">
                      {c.latest_bill_date || "-"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link href={`/clients/${c.client_id}`}>
                        <Button variant="secondary" size="sm">
                          <span>{t("action_view_client")}</span>
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
            {filtered.map((c) => (
              <div
                key={c.client_id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="font-bold text-slate-900 text-sm leading-tight">
                      {c.client_name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {c.client_code} {c.company_name ? `• ${c.company_name}` : ""}
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                    {c.bills_count} {t("bills")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-500 block">{t("col_total_billed")}</span>
                    <span className="font-semibold font-mono text-slate-800">
                      ₹{c.total_billed.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-50/75">
                    <span className="text-amber-800 block">{t("col_outstanding")}</span>
                    <span className="font-bold font-mono text-amber-700">
                      ₹{c.outstanding_amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  {c.phone ? (
                    <a
                      href={`tel:${c.phone}`}
                      className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{c.phone}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">{t("no_phone")}</span>
                  )}

                  <Link href={`/clients/${c.client_id}`}>
                    <Button variant="secondary" size="sm">
                      <span>{t("action_view_client")}</span>
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
