import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { CalendarCheck, History } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  getDailyAttendance,
  getAttendanceHistory,
} from "@/lib/actions/attendance";
import { getEmployees } from "@/lib/actions/employees";
import { AppHeader } from "@/components/layout/AppHeader";
import { AttendanceBoard } from "@/components/attendance/AttendanceBoard";
import { AttendanceHistory } from "@/components/attendance/AttendanceHistory";
import type { AttendanceStatus } from "@/lib/types/employee";

interface AttendancePageProps {
  searchParams: {
    date?: string;
    view?: string;
    month?: string;
    employee_id?: string;
    status?: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("attendance");
  return {
    title: t("title"),
  };
}

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  searchParams,
}: AttendancePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const t = await getTranslations("attendance");

  const view = searchParams.view === "history" ? "history" : "board";
  const dateStr = searchParams.date || new Date().toISOString().split("T")[0];

  const [dailyRes, employeesRes, historyRes] = await Promise.all([
    getDailyAttendance(dateStr),
    getEmployees({ status: "active" }),
    view === "history"
      ? getAttendanceHistory({
          month: searchParams.month || new Date().toISOString().slice(0, 7),
          employee_id: searchParams.employee_id,
          status: searchParams.status as AttendanceStatus | "all" | undefined,
        })
      : Promise.resolve({ records: [] }),
  ]);

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Page Title & View Switcher */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              {t("subtitle")}
            </p>
          </div>

          {/* Tab Switcher (Board vs History) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/80 border border-slate-200 w-full sm:w-auto">
            <Link
              href={`/attendance?date=${dateStr}`}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === "board"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarCheck className="h-4 w-4 shrink-0" />
              <span>{t("tab_board")}</span>
            </Link>

            <Link
              href="/attendance?view=history"
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === "history"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="h-4 w-4 shrink-0" />
              <span>{t("tab_history")}</span>
            </Link>
          </div>
        </div>

        {/* Content View */}
        {view === "board" ? (
          <AttendanceBoard
            initialDate={dailyRes.date}
            initialEmployees={dailyRes.employees}
            initialSummary={dailyRes.summary}
            locale={locale}
          />
        ) : (
          <AttendanceHistory
            initialRecords={historyRes.records}
            employees={employeesRes.employees}
            initialFilters={{
              month: searchParams.month,
              employee_id: searchParams.employee_id,
              status: searchParams.status as AttendanceStatus | "all" | undefined,
            }}
            locale={locale}
          />
        )}
      </main>
    </div>
  );
}
