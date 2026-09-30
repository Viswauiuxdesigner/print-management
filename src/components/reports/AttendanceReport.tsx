"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarCheck,
  AlertCircle,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import type { AttendanceReportRow } from "@/lib/types/reports";
import { Badge } from "@/components/ui/Badge";

interface AttendanceReportProps {
  rows: AttendanceReportRow[];
  locale?: string;
}

export function AttendanceReport({ rows }: AttendanceReportProps) {
  const t = useTranslations("reports");
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  const filteredRows = rows.filter((r) => {
    if (activeOnly && !r.is_active) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = r.employee_name.toLowerCase().includes(q);
      const matchCode = r.employee_code.toLowerCase().includes(q);
      const matchDesig = r.designation?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchDesig) return false;
    }
    return true;
  });

  // Summary Totals
  const totalEmployees = filteredRows.length;
  const totalPresent = filteredRows.reduce((s, r) => s + r.present_days, 0);
  const totalHalf = filteredRows.reduce((s, r) => s + r.half_days, 0);
  const totalAbsent = filteredRows.reduce((s, r) => s + r.absent_days, 0);
  const totalLeave = filteredRows.reduce((s, r) => s + r.leave_days, 0);
  const totalMarked = filteredRows.reduce((s, r) => s + r.total_marked_days, 0);
  const totalPayable = totalPresent + totalHalf * 0.5;
  const overallRate = totalMarked > 0 ? Math.round((totalPayable / totalMarked) * 100) : 0;

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          {t("no_attendance_data")}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {t("no_data_date_hint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_employee_placeholder")}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl cursor-pointer shadow-2xs">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
            <span>{t("filter_active_only")}</span>
          </label>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Users className="h-3.5 w-3.5 text-brand-600" />
            <span>{t("metric_total_employees")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-slate-900">
            {totalEmployees}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t("status_present")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-emerald-700">
            {totalPresent} <span className="text-[11px] font-normal text-slate-500">{t("days")}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>{t("status_half_day")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-amber-700">
            {totalHalf} <span className="text-[11px] font-normal text-slate-500">{t("days")}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            <span>{t("status_absent")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-rose-700">
            {totalAbsent} <span className="text-[11px] font-normal text-slate-500">{t("days")}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
            <span>{t("status_leave")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-blue-700">
            {totalLeave} <span className="text-[11px] font-normal text-slate-500">{t("days")}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <CalendarCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>{t("metric_attendance_rate")}</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold font-mono text-indigo-700">
            {overallRate}%
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_employee")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_designation")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_salary_type")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("status_present")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("status_half_day")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("status_absent")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("status_leave")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_marked_days")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("metric_attendance_rate")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t("col_status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
            {filteredRows.map((row) => (
              <tr key={row.employee_id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/employees/${row.employee_id}`}
                    className="flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-800 hover:underline"
                  >
                    <span>{row.employee_name}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {row.employee_code}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {row.designation || "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap capitalize text-slate-600">
                  {row.salary_type}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-semibold text-emerald-700">
                  {row.present_days}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-medium text-amber-700">
                  {row.half_days}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-medium text-rose-700">
                  {row.absent_days}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-medium text-blue-700">
                  {row.leave_days}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-slate-900">
                  {row.total_marked_days}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-indigo-700">
                  {row.attendance_rate}%
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {row.is_active ? (
                    <Badge variant="success">{t("active")}</Badge>
                  ) : (
                    <Badge variant="neutral">{t("inactive")}</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredRows.map((row) => (
          <div
            key={row.employee_id}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/employees/${row.employee_id}`}
                  className="text-sm font-bold text-brand-600 flex items-center gap-1 hover:underline"
                >
                  <span>{row.employee_name}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {row.employee_code} {row.designation ? `• ${row.designation}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700">
                  {row.attendance_rate}%
                </span>
                {row.is_active ? (
                  <Badge variant="success">{t("active")}</Badge>
                ) : (
                  <Badge variant="neutral">{t("inactive")}</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-center text-xs">
              <div className="p-1.5 rounded-lg bg-emerald-50/60">
                <span className="text-[10px] text-emerald-700 block">{t("present_short")}</span>
                <span className="font-bold font-mono text-emerald-800">{row.present_days}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-amber-50/60">
                <span className="text-[10px] text-amber-700 block">{t("half_short")}</span>
                <span className="font-bold font-mono text-amber-800">{row.half_days}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-rose-50/60">
                <span className="text-[10px] text-rose-700 block">{t("absent_short")}</span>
                <span className="font-bold font-mono text-rose-800">{row.absent_days}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-blue-50/60">
                <span className="text-[10px] text-blue-700 block">{t("leave_short")}</span>
                <span className="font-bold font-mono text-blue-800">{row.leave_days}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
