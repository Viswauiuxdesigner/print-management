"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Edit2,
  Power,
  Phone,
  Briefcase,
  FileText,
  CalendarCheck,
} from "lucide-react";

import type { Employee, Attendance } from "@/lib/types/employee";
import { toggleEmployeeStatusAction } from "@/lib/actions/employees";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface EmployeeDetailProps {
  employee: Employee;
  recentAttendance: Attendance[];
  locale: string;
}

export function EmployeeDetail({
  employee,
  recentAttendance,
  locale: _locale,
}: EmployeeDetailProps) {
  const t = useTranslations("employees");
  const tAtt = useTranslations("attendance");
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const handleToggleStatus = async () => {
    setDialogError(null);
    try {
      const res = await toggleEmployeeStatusAction(employee.id, !employee.is_active);
      if (!res.success) {
        setDialogError(res.error || "Failed to update employee status");
        return;
      }
      setShowStatusDialog(false);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setDialogError("Network error occurred");
    }
  };

  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="success" size="sm">{tAtt("status_present")}</Badge>;
      case "absent":
        return <Badge variant="danger" size="sm">{tAtt("status_absent")}</Badge>;
      case "half_day":
        return <Badge variant="warning" size="sm">{tAtt("status_half_day")}</Badge>;
      case "leave":
        return <Badge variant="brand" size="sm">{tAtt("status_leave")}</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Back link & Actions ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("action_back")}</span>
        </Link>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href={`/employees/${employee.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit2 className="h-4 w-4 mr-1.5" />
              <span>{t("action_edit")}</span>
            </Button>
          </Link>

          <Button
            variant={employee.is_active ? "danger" : "secondary"}
            size="sm"
            onClick={() => setShowStatusDialog(true)}
          >
            <Power className="h-4 w-4 mr-1.5" />
            <span>{employee.is_active ? t("action_deactivate") : t("action_activate")}</span>
          </Button>
        </div>
      </div>

      {/* ── Profile Header Card ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200/60">
                {employee.employee_code}
              </span>
              <Badge variant={employee.is_active ? "success" : "neutral"} size="sm">
                {employee.is_active ? t("status_active") : t("status_inactive")}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 break-words pt-1">
              {employee.full_name}
            </h1>
            {employee.designation && (
              <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{employee.designation}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── 2-Column Info Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="h-4 w-4 text-brand-600 shrink-0" />
            <span>{t("detail_contact_info")}</span>
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">{t("field_phone")}</span>
              <span className="font-mono font-medium text-slate-800">
                {employee.phone || "—"}
              </span>
            </div>

            {employee.alternate_phone && (
              <div>
                <span className="text-xs text-slate-400 block">{t("field_alt_phone")}</span>
                <span className="font-mono font-medium text-slate-800">
                  {employee.alternate_phone}
                </span>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-400 block">{t("field_email")}</span>
              <span className="font-medium text-slate-800 break-all">
                {employee.email || "—"}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">{t("field_address")}</span>
              <p className="text-slate-800 break-words mt-0.5">
                {employee.address || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Employment & Wage Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-brand-600 shrink-0" />
            <span>{t("detail_employment_info")}</span>
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">{t("field_designation")}</span>
              <span className="font-medium text-slate-800">
                {employee.designation || "—"}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">{t("field_joining_date")}</span>
              <span className="font-medium text-slate-800">
                {employee.joining_date || "—"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-xs text-slate-400 block">{t("field_salary_type")}</span>
                <span className="font-bold text-slate-800 capitalize mt-0.5 block">
                  {t(`salary_${employee.salary_type}`)}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-xs text-slate-400 block">{t("field_salary_amount")}</span>
                <span className="font-mono font-bold text-brand-700 mt-0.5 block">
                  ₹{employee.salary_amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Notes Section (if any) ── */}
      {employee.notes && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-2">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600 shrink-0" />
            <span>{t("detail_notes")}</span>
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-line break-words">
            {employee.notes}
          </p>
        </div>
      )}

      {/* ── Recent Attendance History Section ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-brand-600 shrink-0" />
            <span>{t("detail_attendance_title")}</span>
          </h2>

          <Link href={`/attendance?employee_id=${employee.id}`}>
            <Button variant="ghost" size="sm" className="text-xs">
              <span>{tAtt("tab_history")}</span>
            </Button>
          </Link>
        </div>

        {recentAttendance.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
            {t("detail_attendance_empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-2.5 px-3">
                    {tAtt("col_date")}
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    {tAtt("col_status")}
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    {tAtt("col_notes")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAttendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-xs font-medium text-slate-900 whitespace-nowrap">
                      {att.attendance_date}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getAttendanceStatusBadge(att.status)}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-500 max-w-xs truncate">
                      {att.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Status Toggle Dialog ── */}
      <ConfirmDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onConfirm={handleToggleStatus}
        title={employee.is_active ? t("deactivate_confirm_title") : t("activate_confirm_title")}
        description={
          dialogError ||
          (employee.is_active
            ? t("deactivate_confirm_desc")
            : t("activate_confirm_desc"))
        }
        confirmText={employee.is_active ? t("action_deactivate") : t("action_activate")}
        cancelText={t("action_cancel")}
        variant={employee.is_active ? "danger" : "primary"}
        isLoading={isPending}
      />
    </div>
  );
}
