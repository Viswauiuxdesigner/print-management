"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  UserPlus,
  PackagePlus,
  Printer,
  Receipt,
  CalendarCheck,
  CreditCard,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function QuickActions() {
  const t = useTranslations("dashboard");

  const actions = [
    {
      label: t("action_new_order"),
      icon: PackagePlus,
      href: "/orders/new",
      variant: "primary" as const,
    },
    {
      label: t("action_new_bill"),
      icon: CreditCard,
      href: "/billing/new",
      variant: "secondary" as const,
    },
    {
      label: t("action_new_client"),
      icon: UserPlus,
      href: "/clients/new",
      variant: "secondary" as const,
    },
    {
      label: t("action_production_entry"),
      icon: Printer,
      href: "/orders",
      variant: "secondary" as const,
    },
    {
      label: t("action_record_expense"),
      icon: Receipt,
      href: "/expenses/new",
      variant: "secondary" as const,
    },
    {
      label: t("action_mark_attendance"),
      icon: CalendarCheck,
      href: "/attendance",
      variant: "secondary" as const,
    },
    {
      label: t("action_receive_payment"),
      icon: PlusCircle,
      href: "/billing?tab=history",
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {t("quick_actions_title")}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link key={act.label} href={act.href} className="block w-full">
              <Button
                variant={act.variant}
                size="sm"
                className="w-full justify-center text-xs py-2 px-2.5 h-auto truncate"
              >
                <Icon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span className="truncate">{act.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
