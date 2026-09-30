"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  UserCheck,
  Search,
  Plus,
  Phone,
  Briefcase,
  Eye,
  Edit2,
  X,
} from "lucide-react";

import type { Employee } from "@/lib/types/employee";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface EmployeeListProps {
  initialEmployees: Employee[];
  locale: string;
}

export function EmployeeList({ initialEmployees, locale: _locale }: EmployeeListProps) {
  const t = useTranslations("employees");
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");

  // Client-side search and filtering
  const filteredEmployees = useMemo(() => {
    return initialEmployees.filter((emp) => {
      // Status filter
      if (statusFilter === "active" && !emp.is_active) return false;
      if (statusFilter === "inactive" && emp.is_active) return false;

      // Query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = emp.full_name.toLowerCase().includes(q);
        const codeMatch = emp.employee_code.toLowerCase().includes(q);
        const phoneMatch = emp.phone?.toLowerCase().includes(q) || false;
        const desigMatch = emp.designation?.toLowerCase().includes(q) || false;

        return nameMatch || codeMatch || phoneMatch || desigMatch;
      }

      return true;
    });
  }, [initialEmployees, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            {t("subtitle")}
          </p>
        </div>

        <Link href="/employees/new">
          <Button variant="primary" size="md" className="w-full sm:w-auto shadow-xs">
            <Plus className="h-4 w-4 mr-1.5 shrink-0" aria-hidden="true" />
            <span>{t("add_employee")}</span>
          </Button>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none pt-1 border-t border-slate-100">
          {(["active", "all", "inactive"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab
                  ? "bg-brand-600 text-white shadow-2xs font-semibold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {t(`filter_${tab}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Empty States */}
      {filteredEmployees.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
            <UserCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {initialEmployees.length === 0 ? t("empty_title") : t("empty_search_title")}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {initialEmployees.length === 0 ? t("empty_desc") : t("empty_search_desc")}
          </p>
          {initialEmployees.length === 0 && (
            <div className="mt-6">
              <Link href="/employees/new">
                <Button variant="primary" size="md">
                  <Plus className="h-4 w-4 mr-1.5" />
                  <span>{t("add_employee")}</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-6">
                    {t("col_code")}
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    {t("col_name")}
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    {t("col_designation")}
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    {t("col_phone")}
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    {t("col_salary_type")}
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    {t("col_status")}
                  </th>
                  <th scope="col" className="py-3.5 pl-3 pr-4 text-right sm:pr-6">
                    {t("col_actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/75 transition-colors cursor-pointer"
                    onClick={() => router.push(`/employees/${emp.id}`)}
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-mono font-bold text-brand-600 sm:pl-6">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="hover:underline focus:outline-hidden focus-visible:ring-1 focus-visible:ring-brand-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {emp.employee_code}
                      </Link>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <div className="font-semibold text-slate-900">
                        {emp.full_name}
                      </div>
                      {emp.email && (
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">
                          {emp.email}
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-slate-700 text-xs">
                      {emp.designation ? (
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{emp.designation}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-slate-600 text-xs font-mono">
                      {emp.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{emp.phone}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-slate-600 text-xs">
                      <span className="capitalize font-medium">
                        {t(`salary_${emp.salary_type}`)}
                      </span>
                      {emp.salary_amount > 0 && (
                        <span className="text-slate-400 ml-1 font-mono">
                          (₹{emp.salary_amount.toLocaleString("en-IN")})
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <Badge
                        variant={emp.is_active ? "success" : "neutral"}
                        size="sm"
                      >
                        {emp.is_active ? t("status_active") : t("status_inactive")}
                      </Badge>
                    </td>

                    <td
                      className="whitespace-nowrap py-4 pl-3 pr-4 text-right sm:pr-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title={t("action_view")}
                          aria-label={`${t("action_view")} ${emp.full_name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/employees/${emp.id}/edit`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title={t("action_edit")}
                          aria-label={`${t("action_edit")} ${emp.full_name}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< 768px) */}
          <div className="md:hidden space-y-3">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => router.push(`/employees/${emp.id}`)}
                className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 active:bg-slate-50/80 transition-colors cursor-pointer ${
                  !emp.is_active ? "opacity-75 bg-slate-50/50" : ""
                }`}
              >
                {/* Header: Code & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {emp.employee_code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 break-words pt-1">
                      {emp.full_name}
                    </h3>
                  </div>

                  <Badge
                    variant={emp.is_active ? "success" : "neutral"}
                    size="sm"
                  >
                    {emp.is_active ? t("status_active") : t("status_inactive")}
                  </Badge>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  {emp.designation && (
                    <p className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{emp.designation}</span>
                    </p>
                  )}

                  {emp.phone && (
                    <p className="flex items-center gap-1.5 font-mono">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{emp.phone}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">{t("col_salary_type")}:</span>
                    <span className="font-semibold text-slate-800">
                      {t(`salary_${emp.salary_type}`)}
                      {emp.salary_amount > 0 && ` (₹${emp.salary_amount.toLocaleString("en-IN")})`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={`/employees/${emp.id}`} className="flex-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full justify-center text-xs"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span>{t("action_view")}</span>
                    </Button>
                  </Link>

                  <Link href={`/employees/${emp.id}/edit`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs px-3"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      <span>{t("action_edit")}</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
