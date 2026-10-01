"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2, ArrowUpRight } from "lucide-react";
import type { DashboardRecentPayment } from "@/lib/types/dashboard";

interface RecentPaymentsProps {
  payments: DashboardRecentPayment[];
  locale?: string;
}

export function RecentPayments({ payments, locale = "en" }: RecentPaymentsProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t("recent_payments_title")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("recent_payments_sub")}
            </p>
          </div>
        </div>

        <Link
          href="/billing?tab=history"
          className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-0.5"
        >
          <span>{t("view_all")}</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          {t("no_recent_payments")}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {payments.map((p) => (
            <div
              key={p.payment_id}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {p.client_name}
                  </span>
                  <Link
                    href={`/billing/${p.bill_id}`}
                    className="text-[11px] font-mono text-brand-600 hover:underline shrink-0"
                  >
                    ({p.bill_number})
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>
                    {new Date(p.payment_date).toLocaleDateString(
                      locale === "ta" ? "ta-IN" : "en-US",
                      { day: "2-digit", month: "short" }
                    )}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{p.payment_method}</span>
                  {p.reference_number && (
                    <>
                      <span>•</span>
                      <span className="font-mono truncate max-w-[120px]">
                        Ref: {p.reference_number}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs sm:text-sm font-bold font-mono text-emerald-700">
                  +₹{p.amount.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
