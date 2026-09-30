"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Plus,
  Search,
  X,
  Eye,
  Edit2,
  Ban,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";
import type {
  ExpenseWithCategory,
  ExpenseCategory,
  ExpenseSummary as ExpenseSummaryType,
  ExpensePaymentMethod,
} from "@/lib/types/expense";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { VoidExpenseDialog } from "@/components/expenses/VoidExpenseDialog";

interface ExpenseListProps {
  initialExpenses: ExpenseWithCategory[];
  categories: ExpenseCategory[];
  summary: ExpenseSummaryType;
  locale: string;
}

export function ExpenseList({
  initialExpenses,
  categories,
  summary,
  locale,
}: ExpenseListProps) {
  const t = useTranslations("expenses");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "void">("active");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Void modal state
  const [voidModalExpense, setVoidModalExpense] = useState<{
    id: string;
    amount: number;
  } | null>(null);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return initialExpenses.filter((expense) => {
      // Status filter
      if (statusFilter === "active" && expense.is_void) return false;
      if (statusFilter === "void" && !expense.is_void) return false;

      // Category filter
      if (categoryFilter !== "all" && expense.category_id !== categoryFilter) {
        return false;
      }

      // Payment method filter
      if (paymentFilter !== "all" && expense.payment_method !== paymentFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const desc = (expense.description || "").toLowerCase();
        const ref = (expense.reference_number || "").toLowerCase();
        const notes = (expense.notes || "").toLowerCase();
        const catEn = (expense.category?.name_en || "").toLowerCase();
        const catTa = (expense.category?.name_ta || "").toLowerCase();

        return (
          desc.includes(q) ||
          ref.includes(q) ||
          notes.includes(q) ||
          catEn.includes(q) ||
          catTa.includes(q)
        );
      }

      return true;
    });
  }, [initialExpenses, statusFilter, categoryFilter, paymentFilter, searchQuery]);

  function getPaymentMethodLabel(method: ExpensePaymentMethod) {
    switch (method) {
      case "cash":
        return t("payment_cash");
      case "bank":
        return t("payment_bank");
      case "upi":
        return t("payment_upi");
      case "other":
        return t("payment_other");
      default:
        return method;
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(
      locale === "ta" ? "ta-IN" : "en-IN",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & New Expense Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            {t("subtitle")}
          </p>
        </div>

        <Link href="/expenses/new">
          <Button variant="primary" size="md" className="w-full sm:w-auto shadow-xs">
            <Plus className="h-4 w-4 mr-1.5 shrink-0" aria-hidden="true" />
            <span>{t("add_expense")}</span>
          </Button>
        </Link>
      </div>

      {/* Top Aggregated Summary */}
      <ExpenseSummary summary={summary} locale={locale} />

      {/* Search & Filter Controls */}
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

        {/* Filter Pills & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Status Segmented Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(["active", "all", "void"] as const).map((tab) => (
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
                {t(`tab_${tab}`)}
              </button>
            ))}
          </div>

          {/* Category & Payment Method Dropdowns */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Category Select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto text-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">{t("filter_category")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === "ta" ? cat.name_ta : cat.name_en}
                </option>
              ))}
            </select>

            {/* Payment Method Select */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full sm:w-auto text-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">{t("filter_payment_method")}</option>
              <option value="cash">{t("payment_cash")}</option>
              <option value="bank">{t("payment_bank")}</option>
              <option value="upi">{t("payment_upi")}</option>
              <option value="other">{t("payment_other")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Expenses Content */}
      {filteredExpenses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {initialExpenses.length === 0 ? t("empty_title") : t("empty_search_title")}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {initialExpenses.length === 0 ? t("empty_desc") : t("empty_search_desc")}
          </p>
          {initialExpenses.length === 0 && (
            <div className="mt-6">
              <Link href="/expenses/new">
                <Button variant="primary" size="md">
                  <Plus className="h-4 w-4 mr-1.5" />
                  <span>{t("add_expense")}</span>
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
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    {t("field_date")}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t("field_category")}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t("field_description")}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t("field_payment_method")}
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    {t("field_amount")}
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((expense) => {
                  const catName =
                    locale === "ta"
                      ? expense.category?.name_ta || expense.category?.name_en
                      : expense.category?.name_en || expense.category?.name_ta;

                  return (
                    <tr
                      key={expense.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        expense.is_void ? "bg-slate-50/50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-900 text-xs">
                        {formatDate(expense.expense_date)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">
                          {catName}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="max-w-xs truncate text-xs text-slate-800 font-medium">
                          {expense.description || (
                            <span className="text-slate-400 italic">No description</span>
                          )}
                        </div>
                        {expense.reference_number && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            Ref: {expense.reference_number}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600">
                        {getPaymentMethodLabel(expense.payment_method)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right font-mono font-bold text-sm text-slate-900">
                        <span className={expense.is_void ? "line-through text-slate-400" : ""}>
                          ₹{expense.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <Badge
                          variant={expense.is_void ? "danger" : "success"}
                          size="sm"
                        >
                          {expense.is_void ? t("status_void") : t("status_active")}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/expenses/${expense.id}`}>
                            <button
                              type="button"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title={t("action_view")}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>

                          {!expense.is_void && (
                            <>
                              <Link href={`/expenses/${expense.id}/edit`}>
                                <button
                                  type="button"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title={t("action_edit")}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  setVoidModalExpense({
                                    id: expense.id,
                                    amount: expense.amount,
                                  })
                                }
                                className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                title={t("action_void")}
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< 768px) */}
          <div className="md:hidden space-y-3">
            {filteredExpenses.map((expense) => {
              const catName =
                locale === "ta"
                  ? expense.category?.name_ta || expense.category?.name_en
                  : expense.category?.name_en || expense.category?.name_ta;

              return (
                <div
                  key={expense.id}
                  className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 ${
                    expense.is_void ? "bg-slate-50/50 opacity-80" : ""
                  }`}
                >
                  {/* Card Header: Category badge, Date & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="font-semibold text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">
                        {catName}
                      </span>
                      <p className="flex items-center gap-1 text-xs text-slate-500 pt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDate(expense.expense_date)}</span>
                      </p>
                    </div>

                    <Badge
                      variant={expense.is_void ? "danger" : "success"}
                      size="sm"
                    >
                      {expense.is_void ? t("status_void") : t("status_active")}
                    </Badge>
                  </div>

                  {/* Description & Reference */}
                  <div className="text-sm font-medium text-slate-900 break-words">
                    {expense.description || (
                      <span className="text-slate-400 italic text-xs">No description</span>
                    )}
                  </div>

                  {/* Amount & Payment Method Banner */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                      <span>{getPaymentMethodLabel(expense.payment_method)}</span>
                      {expense.reference_number && (
                        <span className="text-[11px] text-slate-400 font-mono truncate max-w-[100px]">
                          ({expense.reference_number})
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-base font-bold font-mono ${
                        expense.is_void ? "line-through text-slate-400" : "text-slate-900"
                      }`}
                    >
                      ₹{expense.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Void reason notice if voided */}
                  {expense.is_void && expense.void_reason && (
                    <div className="text-xs text-red-700 bg-red-50/70 p-2 rounded-lg border border-red-100">
                      <strong className="font-semibold">Void Reason:</strong> {expense.void_reason}
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <Link href={`/expenses/${expense.id}`} className="flex-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full justify-center text-xs"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span>{t("action_view")}</span>
                      </Button>
                    </Link>

                    {!expense.is_void && (
                      <>
                        <Link href={`/expenses/${expense.id}/edit`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs px-2.5"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            setVoidModalExpense({
                              id: expense.id,
                              amount: expense.amount,
                            })
                          }
                          className="text-xs px-2.5"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Void Dialog Modal */}
      {voidModalExpense && (
        <VoidExpenseDialog
          isOpen={Boolean(voidModalExpense)}
          onClose={() => setVoidModalExpense(null)}
          expenseId={voidModalExpense.id}
          expenseAmount={voidModalExpense.amount}
        />
      )}
    </div>
  );
}
