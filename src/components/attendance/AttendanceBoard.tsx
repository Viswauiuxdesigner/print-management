"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  UserMinus,
  Briefcase,
  Sparkles,
  Loader2,
} from "lucide-react";

import type {
  AttendanceStatus,
  DailyAttendanceSummary,
} from "@/lib/types/employee";
import {
  markAttendanceAction,
  type EmployeeWithDailyAttendance,
} from "@/lib/actions/attendance";
import { Button } from "@/components/ui/Button";
import { AttendanceSummary } from "./AttendanceSummary";

interface AttendanceBoardProps {
  initialDate: string;
  initialEmployees: EmployeeWithDailyAttendance[];
  initialSummary: DailyAttendanceSummary;
  locale: string;
}

export function AttendanceBoard({
  initialDate,
  initialEmployees,
  initialSummary,
}: AttendanceBoardProps) {
  const t = useTranslations("attendance");
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [currentDate, setCurrentDate] = useState(initialDate);
  const [employees, setEmployees] = useState(initialEmployees);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isBulkMarking, setIsBulkMarking] = useState(false);

  // Sync state if initial data changes from server
  useMemo(() => {
    setEmployees(initialEmployees);
    setCurrentDate(initialDate);
  }, [initialEmployees, initialDate]);

  // Dynamically compute summary from current state
  const currentSummary = useMemo<DailyAttendanceSummary>(() => {
    let present = 0;
    let absent = 0;
    let half_day = 0;
    let leave = 0;
    let unmarked = 0;

    employees.forEach((emp) => {
      const status = emp.attendanceRecord?.status;
      if (!status) {
        unmarked++;
      } else {
        switch (status) {
          case "present":
            present++;
            break;
          case "absent":
            absent++;
            break;
          case "half_day":
            half_day++;
            break;
          case "leave":
            leave++;
            break;
        }
      }
    });

    return {
      total_active: employees.length,
      present,
      absent,
      half_day,
      leave,
      unmarked,
    };
  }, [employees]);

  // Navigate to a new date
  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
    startTransition(() => {
      router.push(`/attendance?date=${newDate}`);
    });
  };

  const shiftDate = (offsetDays: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offsetDays);
    const newDateStr = d.toISOString().split("T")[0];
    handleDateChange(newDateStr);
  };

  const setToday = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    handleDateChange(todayStr);
  };

  const setYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yestStr = d.toISOString().split("T")[0];
    handleDateChange(yestStr);
  };

  // Mark single employee attendance
  const handleMarkStatus = async (
    employeeId: string,
    status: AttendanceStatus
  ) => {
    // Optimistic UI update
    setUpdatingId(employeeId);
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;
        return {
          ...emp,
          attendanceRecord: {
            id: emp.attendanceRecord?.id || "temp-" + Date.now(),
            employee_id: employeeId,
            attendance_date: currentDate,
            status,
            notes: emp.attendanceRecord?.notes || null,
            created_by: null,
            updated_by: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      })
    );

    try {
      const res = await markAttendanceAction({
        employee_id: employeeId,
        attendance_date: currentDate,
        status,
      });

      if (!res.success) {
        // Revert on error
        setEmployees(initialEmployees);
      }
    } catch {
      setEmployees(initialEmployees);
    } finally {
      setUpdatingId(null);
    }
  };

  // Bulk mark all unmarked employees as Present
  const handleMarkAllRemainingPresent = async () => {
    const unmarkedEmployees = employees.filter((e) => !e.attendanceRecord);
    if (unmarkedEmployees.length === 0) return;

    setIsBulkMarking(true);

    // Optimistically mark all
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.attendanceRecord) return emp;
        return {
          ...emp,
          attendanceRecord: {
            id: "temp-" + Date.now() + "-" + emp.id,
            employee_id: emp.id,
            attendance_date: currentDate,
            status: "present",
            notes: null,
            created_by: null,
            updated_by: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      })
    );

    try {
      await Promise.all(
        unmarkedEmployees.map((emp) =>
          markAttendanceAction({
            employee_id: emp.id,
            attendance_date: currentDate,
            status: "present",
          })
        )
      );
    } catch {
      // Revert if error
      setEmployees(initialEmployees);
    } finally {
      setIsBulkMarking(false);
      startTransition(() => {
        router.refresh();
      });
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = currentDate === todayStr;

  return (
    <div className="space-y-6">
      {/* ── Top Controls: Date Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Date Selector with Prev / Next */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="relative">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-colors cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => shiftDate(1)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Date Shortcuts & Bulk Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={setToday}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isToday
                ? "bg-brand-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {t("shortcut_today")}
          </button>

          <button
            type="button"
            onClick={setYesterday}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {t("shortcut_yesterday")}
          </button>

          {currentSummary.unmarked > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleMarkAllRemainingPresent}
              disabled={isBulkMarking}
              className="text-xs ml-auto sm:ml-0"
            >
              {isBulkMarking ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              )}
              <span>{t("summary_unmarked")} → {t("status_present")} ({currentSummary.unmarked})</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Summary Counters ── */}
      <AttendanceSummary summary={currentSummary} />

      {/* ── Employee Attendance List / Cards ── */}
      {employees.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-2xs">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            {t("empty_board_title")}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {t("empty_board_desc")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => {
            const currentStatus = emp.attendanceRecord?.status;
            const isRowUpdating = updatingId === emp.id;

            return (
              <div
                key={emp.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-colors space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4"
              >
                {/* Employee Info */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {emp.employee_code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 break-words">
                      {emp.full_name}
                    </h3>
                  </div>
                  {emp.designation && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Briefcase className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{emp.designation}</span>
                    </p>
                  )}
                </div>

                {/* 4 Status Buttons (Responsive 2x2 grid on mobile, 4-col inline on tablet/desktop) */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0">
                  {/* Present */}
                  <button
                    type="button"
                    onClick={() => handleMarkStatus(emp.id, "present")}
                    disabled={isRowUpdating}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] sm:min-h-[42px] ${
                      currentStatus === "present"
                        ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600 ring-offset-1"
                        : "bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/80"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{t("status_present")}</span>
                  </button>

                  {/* Absent */}
                  <button
                    type="button"
                    onClick={() => handleMarkStatus(emp.id, "absent")}
                    disabled={isRowUpdating}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] sm:min-h-[42px] ${
                      currentStatus === "absent"
                        ? "bg-rose-600 text-white shadow-xs ring-2 ring-rose-600 ring-offset-1"
                        : "bg-slate-50 text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200/80"
                    }`}
                  >
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span>{t("status_absent")}</span>
                  </button>

                  {/* Half Day */}
                  <button
                    type="button"
                    onClick={() => handleMarkStatus(emp.id, "half_day")}
                    disabled={isRowUpdating}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] sm:min-h-[42px] ${
                      currentStatus === "half_day"
                        ? "bg-amber-500 text-white shadow-xs ring-2 ring-amber-500 ring-offset-1"
                        : "bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/80"
                    }`}
                  >
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{t("status_half_day")}</span>
                  </button>

                  {/* Leave */}
                  <button
                    type="button"
                    onClick={() => handleMarkStatus(emp.id, "leave")}
                    disabled={isRowUpdating}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] sm:min-h-[42px] ${
                      currentStatus === "leave"
                        ? "bg-brand-600 text-white shadow-xs ring-2 ring-brand-600 ring-offset-1"
                        : "bg-slate-50 text-slate-700 hover:bg-brand-50 hover:text-brand-700 border border-slate-200/80"
                    }`}
                  >
                    <UserMinus className="h-4 w-4 shrink-0" />
                    <span>{t("status_leave")}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
