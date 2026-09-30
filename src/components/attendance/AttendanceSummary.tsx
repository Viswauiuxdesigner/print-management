"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, Clock, UserMinus, HelpCircle } from "lucide-react";
import type { DailyAttendanceSummary } from "@/lib/types/employee";

interface AttendanceSummaryProps {
  summary: DailyAttendanceSummary;
}

export function AttendanceSummary({ summary }: AttendanceSummaryProps) {
  const t = useTranslations("attendance");

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
      {/* Present */}
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3 shadow-2xs space-y-1">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider leading-tight truncate">
            {t("summary_present")}
          </span>
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        </div>
        <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-900">
          {summary.present}
        </p>
      </div>

      {/* Absent */}
      <div className="rounded-xl border border-rose-200/80 bg-rose-50/60 p-3 shadow-2xs space-y-1">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider leading-tight truncate">
            {t("summary_absent")}
          </span>
          <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
        </div>
        <p className="text-xl sm:text-2xl font-bold font-mono text-rose-900">
          {summary.absent}
        </p>
      </div>

      {/* Half Day */}
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 shadow-2xs space-y-1">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider leading-tight truncate">
            {t("summary_half_day")}
          </span>
          <Clock className="h-4 w-4 text-amber-600 shrink-0" />
        </div>
        <p className="text-xl sm:text-2xl font-bold font-mono text-amber-900">
          {summary.half_day}
        </p>
      </div>

      {/* Leave */}
      <div className="rounded-xl border border-brand-200/80 bg-brand-50/60 p-3 shadow-2xs space-y-1">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-xs font-semibold text-brand-800 uppercase tracking-wider leading-tight truncate">
            {t("summary_leave")}
          </span>
          <UserMinus className="h-4 w-4 text-brand-600 shrink-0" />
        </div>
        <p className="text-xl sm:text-2xl font-bold font-mono text-brand-900">
          {summary.leave}
        </p>
      </div>

      {/* Unmarked */}
      <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-2xs space-y-1">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider leading-tight truncate">
            {t("summary_unmarked")}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
        </div>
        <p className="text-xl sm:text-2xl font-bold font-mono text-slate-800">
          {summary.unmarked}
        </p>
      </div>
    </div>
  );
}
