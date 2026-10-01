"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Receipt,
  Wallet,
  Scale,
  Package,
  Users,
  ArrowUpRight,
} from "lucide-react";
import type { DashboardKpis } from "@/lib/types/dashboard";

interface DashboardKpiCardsProps {
  kpis: DashboardKpis;
}

export function DashboardKpiCards({ kpis }: DashboardKpiCardsProps) {
  const t = useTranslations("dashboard");

  const cards = [
    {
      id: "revenue",
      label: t("kpi_revenue"),
      value: `₹${kpis.total_billed_amount.toLocaleString("en-IN")}`,
      subtitle: t("kpi_revenue_sub"),
      icon: CreditCard,
      color: "slate",
      href: "/billing",
    },
    {
      id: "collections",
      label: t("kpi_collections"),
      value: `₹${kpis.total_collected_amount.toLocaleString("en-IN")}`,
      subtitle: t("kpi_collections_sub"),
      icon: CheckCircle2,
      color: "emerald",
      href: "/billing?tab=history",
    },
    {
      id: "outstanding",
      label: t("kpi_outstanding"),
      value: `₹${kpis.total_outstanding_amount.toLocaleString("en-IN")}`,
      subtitle: t("kpi_outstanding_sub"),
      icon: Clock,
      color: "amber",
      href: "/billing?tab=outstanding",
    },
    {
      id: "expenses",
      label: t("kpi_expenses"),
      value: `₹${kpis.total_expenses_amount.toLocaleString("en-IN")}`,
      subtitle: t("kpi_expenses_sub"),
      icon: Receipt,
      color: "rose",
      href: "/expenses",
    },
    {
      id: "salary_payable",
      label: t("kpi_salary_payable"),
      value: `₹${kpis.salary_payable_amount.toLocaleString("en-IN")}`,
      subtitle: t("kpi_salary_sub"),
      icon: Wallet,
      color: "purple",
      href: "/salary",
    },
    {
      id: "production",
      label: t("kpi_production_kg"),
      value: `${kpis.production_printed_weight_kg.toLocaleString("en-IN")} kg`,
      subtitle: `${kpis.production_delivered_weight_kg.toLocaleString("en-IN")} kg ${t("delivered_short")}`,
      icon: Scale,
      color: "blue",
      href: "/orders",
    },
    {
      id: "active_orders",
      label: t("kpi_active_orders"),
      value: kpis.active_orders_count.toString(),
      subtitle: t("kpi_active_orders_sub"),
      icon: Package,
      color: "indigo",
      href: "/orders",
    },
    {
      id: "active_clients",
      label: t("kpi_active_clients"),
      value: kpis.active_clients_count.toString(),
      subtitle: t("kpi_active_clients_sub"),
      icon: Users,
      color: "teal",
      href: "/clients",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.id}
            href={card.href}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-brand-300 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500">
                <div className="flex items-center gap-1.5 text-xs font-medium truncate">
                  <Icon className="h-4 w-4 text-brand-600 shrink-0" />
                  <span className="truncate">{card.label}</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-brand-600 transition-all shrink-0" />
              </div>
              <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-slate-900 truncate">
                {card.value}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {card.subtitle}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
