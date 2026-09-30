"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Calendar,
  CalendarCheck,
} from "lucide-react";

import type {
  AttendanceWithEmployee,
  Employee,
  AttendanceStatus,
  AttendanceFilters,
} from "@/lib/types/employee";
import { Badge } from "@/components/ui/Badge";

interface AttendanceHistoryProps {
  initialRecords: AttendanceWithEmployee[];
  employees: Employee[];
  initialFilters: AttendanceFilters;
  locale: string;
}

export function AttendanceHistory({
  initialRecords,
  employees,
  initialFilters,
}: AttendanceHistoryProps) {
  const t = useTranslations("attendance");
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [selectedMonth, setSelectedMonth] = useState(
    initialFilters.month || new Date().toISOString().slice(0, 7)
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    initialFilters.employee_id || "all"
  );
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | "all">(
    initialFilters.status || "all"
  );

  const applyFilters = (month: string, empId: string, status: AttendanceStatus | "all") => {
    const params = new URLSearchParams();
    params.set("view", "history");
    if (month) params.set("month", month);
    if (empId && empId !== "all") params.set("employee_id", empId);
    if (status && status !== "all") params.set("status", status);

    startTransition(() => {
      router.push(`/attendance?${params.toString()}`);
    });
  };

  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="success" size="sm">{t("status_present")}</Badge>;
      case "absent":
        return <Badge variant="danger" size="sm">{t("status_absent")}</Badge>;
      case "half_day":
        return <Badge variant="warning" size="sm">{t("status_half_day")}</Badge>;
      case "leave":
        return <Badge variant="brand" size="sm">{t("status_leave")}</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Filters Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              applyFilters(e.target.value, selectedEmployeeId, selectedStatus);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 cursor-pointer"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Employee filter */}
          <select
            value={selectedEmployeeId}
            onChange={(e) => {
              setSelectedEmployeeId(e.target.value);
              applyFilters(selectedMonth, e.target.value, selectedStatus);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="all">{t("filter_employee")}</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.employee_code})
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              const val = e.target.value as AttendanceStatus | "all";
              setSelectedStatus(val);
              applyFilters(selectedMonth, selectedEmployeeId, val);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="all">{t("filter_status")}</option>
            <option value="present">{t("status_present")}</option>
            <option value="absent">{t("status_absent")}</option>
            <option value="half_day">{t("status_half_day")}</option>
            <option value="leave">{t("status_leave")}</option>
          </select>
        </div>
      </div>

      {/* ── Attendance Records ── */}
      {initialRecords.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-2xs">
          <CalendarCheck className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            {t("empty_history_title")}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {t("empty_history_desc")}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table (>= 768px) */}
          <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-6">
                    {t("col_date")}
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    {t("col_employee")}
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    {t("col_designation")}
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    {t("col_status")}
                  </th>
                  <th scope="col" className="py-3.5 pl-3 pr-4 sm:pr-6">
                    {t("col_notes")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {initialRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-mono font-bold text-slate-900 sm:pl-6">
                      {rec.attendance_date}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <div className="font-semibold text-slate-900">
                        {rec.employee?.full_name || "Unknown"}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {rec.employee?.employee_code}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-xs text-slate-600">
                      {rec.employee?.designation || "—"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      {getAttendanceStatusBadge(rec.status)}
                    </td>

                    <td className="py-4 pl-3 pr-4 text-xs text-slate-500 sm:pr-6 max-w-xs truncate">
                      {rec.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (< 768px) */}
          <div className="md:hidden space-y-3">
            {initialRecords.map((rec) => (
              <div
                key={rec.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {rec.attendance_date}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 break-words pt-1">
                      {rec.employee?.full_name}
                    </h4>
                    {rec.employee?.designation && (
                      <p className="text-xs text-slate-500">
                        {rec.employee.designation}
                      </p>
                    )}
                  </div>

                  {getAttendanceStatusBadge(rec.status)}
                </div>

                {rec.notes && (
                  <p className="text-xs text-slate-600 italic pt-1 border-t border-slate-100">
                    &ldquo;{rec.notes}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
