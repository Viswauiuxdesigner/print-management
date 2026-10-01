"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Clock, ArrowUpRight } from "lucide-react";
import type { DashboardOutstandingClient } from "@/lib/types/dashboard";

interface OutstandingClientsProps {
  clients: DashboardOutstandingClient[];
}

export function OutstandingClients({ clients }: OutstandingClientsProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t("outstanding_clients_title")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("outstanding_clients_sub")}
            </p>
          </div>
        </div>

        <Link
          href="/billing?tab=outstanding"
          className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-0.5"
        >
          <span>{t("view_all")}</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Clients List */}
      {clients.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          {t("no_outstanding_clients")}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {clients.map((c) => (
            <div
              key={c.client_id}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <Link
                  href={`/clients/${c.client_id}`}
                  className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-brand-600 truncate block transition-colors"
                >
                  {c.client_name}
                </Link>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="font-mono">{c.client_code}</span>
                  <span>•</span>
                  <span>
                    {c.bills_count} {t("bills_short")}
                  </span>
                  {c.phone && (
                    <>
                      <span>•</span>
                      <span className="hidden sm:inline font-mono">{c.phone}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs sm:text-sm font-bold font-mono text-amber-700">
                  ₹{c.outstanding_amount.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-slate-400">
                  {t("of")} ₹{c.total_billed.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
