"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Package,
  Printer,
  Truck,
  CheckCircle2,
  Receipt,
  Activity,
} from "lucide-react";
import type { DashboardRecentActivity, ActivityType } from "@/lib/types/dashboard";

interface RecentActivityProps {
  activities: DashboardRecentActivity[];
  locale?: string;
}

export function RecentActivity({ activities, locale = "en" }: RecentActivityProps) {
  const t = useTranslations("dashboard");

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "order":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "production":
        return <Printer className="h-4 w-4 text-teal-600" />;
      case "delivery":
        return <Truck className="h-4 w-4 text-emerald-600" />;
      case "payment":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "expense":
      default:
        return <Receipt className="h-4 w-4 text-rose-600" />;
    }
  };

  const getActivityBg = (type: ActivityType) => {
    switch (type) {
      case "order":
        return "bg-blue-50";
      case "production":
        return "bg-teal-50";
      case "delivery":
        return "bg-emerald-50";
      case "payment":
        return "bg-emerald-50";
      case "expense":
      default:
        return "bg-rose-50";
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t("recent_activity_title")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("recent_activity_sub")}
            </p>
          </div>
        </div>
      </div>

      {/* Activities List */}
      {activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          {t("no_recent_activity")}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activities.map((act) => {
            const Content = (
              <div className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl shrink-0 ${getActivityBg(act.type)}`}>
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                      {act.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {act.subtitle}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {act.amount_or_weight && (
                    <div className="text-xs font-bold font-mono text-slate-800">
                      {act.amount_or_weight}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400">
                    {new Date(act.timestamp).toLocaleDateString(
                      locale === "ta" ? "ta-IN" : "en-US",
                      { day: "2-digit", month: "short" }
                    )}
                  </div>
                </div>
              </div>
            );

            if (act.link) {
              return (
                <Link key={act.id} href={act.link} className="block">
                  {Content}
                </Link>
              );
            }
            return <div key={act.id}>{Content}</div>;
          })}
        </div>
      )}
    </div>
  );
}
