"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CreditCard,
  PlusCircle,
  CheckCircle2,
  Clock,
  User,
  Search,
} from "lucide-react";

import type { SalaryAdvanceWithEmployee } from "@/lib/types/salary";
import type { Employee } from "@/lib/types/employee";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AdvanceFormModal } from "./AdvanceFormModal";

interface AdvancesListProps {
  advances: SalaryAdvanceWithEmployee[];
  employees: Employee[];
  locale: string;
}

export function AdvancesList({
  advances,
  employees,
}: AdvancesListProps) {
  const t = useTranslations("salary");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "settled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Aggregate totals
  let totalAdvances = 0;
  let totalSettled = 0;
  advances.forEach((a) => {
    totalAdvances += Number(a.amount || 0);
    totalSettled += Number(a.settled_amount || 0);
  });
  const outstandingBalance = Math.max(0, totalAdvances - totalSettled);

  // Filter advances
  const filteredAdvances = advances.filter((adv) => {
    if (employeeFilter !== "all" && adv.employee_id !== employeeFilter) return false;
    if (statusFilter === "active" && adv.is_settled) return false;
    if (statusFilter === "settled" && !adv.is_settled) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmp = adv.employee?.full_name?.toLowerCase().includes(q) || adv.employee?.employee_code?.toLowerCase().includes(q);
      const matchReason = adv.reason?.toLowerCase().includes(q) || adv.reference_number?.toLowerCase().includes(q);
      if (!matchEmp && !matchReason) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/salary"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 mb-1 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("nav_salary_dashboard")}</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t("advances_title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t("advances_subtitle")}
          </p>
        </div>

        <div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            <span>{t("action_add_advance")}</span>
          </Button>
        </div>
      </div>

      {/* Aggregate Balance Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <CreditCard className="h-4 w-4 text-slate-600" />
            <span>{t("adv_total_issued")}</span>
          </div>
          <div className="mt-1.5 text-xl font-bold font-mono text-slate-900">
            ₹{totalAdvances.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{t("adv_total_settled")}</span>
          </div>
          <div className="mt-1.5 text-xl font-bold font-mono text-emerald-700">
            ₹{totalSettled.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-medium">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>{t("adv_outstanding_balance")}</span>
          </div>
          <div className="mt-1.5 text-xl font-bold font-mono text-amber-700">
            ₹{outstandingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("adv_search_placeholder")}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 w-48 sm:w-56"
            />
          </div>

          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 max-w-[200px]"
          >
            <option value="all">{t("filter_all_employees")}</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.employee_code})
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "settled")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">{t("filter_all_status")}</option>
            <option value="active">{t("adv_status_active")}</option>
            <option value="settled">{t("adv_status_settled")}</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          {filteredAdvances.length} {filteredAdvances.length === 1 ? "advance" : "advances"}
        </div>
      </div>

      {/* Listing Content */}
      {filteredAdvances.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 sm:p-12 text-center border border-slate-200 space-y-3">
          <CreditCard className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">
            {t("adv_no_records_title")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {t("adv_no_records_desc")}
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              <span>{t("action_add_advance")}</span>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3.5 px-4">{t("advances_date")}</th>
                  <th className="py-3.5 px-4">{t("col_employee")}</th>
                  <th className="py-3.5 px-3 text-right">{t("advances_amount")}</th>
                  <th className="py-3.5 px-3">{t("field_payment_method")}</th>
                  <th className="py-3.5 px-3">{t("advances_reason")}</th>
                  <th className="py-3.5 px-3 text-center">{t("col_status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredAdvances.map((adv) => (
                  <tr key={adv.id} className="hover:bg-slate-50/75">
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {adv.advance_date}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {adv.employee?.full_name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {adv.employee?.employee_code}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{Number(adv.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 capitalize text-slate-700">
                      {adv.payment_method}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {adv.reason || "-"}
                      {adv.reference_number && (
                        <span className="block text-xs text-slate-400 font-mono">
                          Ref: {adv.reference_number}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {adv.is_settled ? (
                        <Badge variant="success">{t("adv_status_settled")}</Badge>
                      ) : (
                        <Badge variant="warning">{t("adv_status_active")}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredAdvances.map((adv) => (
              <div
                key={adv.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 text-sm leading-tight">
                        {adv.employee?.full_name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {adv.employee?.employee_code} • {adv.advance_date}
                      </div>
                    </div>
                  </div>
                  <div>
                    {adv.is_settled ? (
                      <Badge variant="success">{t("adv_status_settled")}</Badge>
                    ) : (
                      <Badge variant="warning">{t("adv_status_active")}</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">{t("advances_amount")}:</span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    ₹{Number(adv.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {adv.reason && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {t("advances_reason")}
                    </span>
                    <span>{adv.reason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Advance Modal */}
      <AdvanceFormModal
        employees={employees}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
