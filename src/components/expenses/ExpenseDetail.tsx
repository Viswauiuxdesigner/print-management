"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Edit2,
  Ban,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import type { ExpenseWithCategory, ExpensePaymentMethod } from "@/lib/types/expense";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VoidExpenseDialog } from "@/components/expenses/VoidExpenseDialog";

interface ExpenseDetailProps {
  expense: ExpenseWithCategory;
  locale: string;
}

export function ExpenseDetail({ expense, locale }: ExpenseDetailProps) {
  const t = useTranslations("expenses");
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);

  const formattedDate = new Date(expense.expense_date).toLocaleDateString(
    locale === "ta" ? "ta-IN" : "en-IN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const formattedCreatedAt = new Date(expense.created_at).toLocaleDateString(
    locale === "ta" ? "ta-IN" : "en-IN",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const formattedUpdatedAt = new Date(expense.updated_at).toLocaleDateString(
    locale === "ta" ? "ta-IN" : "en-IN",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const categoryName =
    locale === "ta"
      ? expense.category?.name_ta || expense.category?.name_en
      : expense.category?.name_en || expense.category?.name_ta;

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top back navigation */}
      <div>
        <Link
          href="/expenses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("action_back")}
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-semibold text-xs px-3 py-1 rounded-md bg-slate-100 text-slate-800">
                {categoryName}
              </span>
              <Badge
                variant={expense.is_void ? "danger" : "success"}
                size="md"
              >
                {expense.is_void ? t("status_void") : t("status_active")}
              </Badge>
            </div>

            <div className="pt-1">
              <h1 className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 tracking-tight">
                <span className={expense.is_void ? "line-through text-slate-400" : ""}>
                  ₹{expense.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </h1>
            </div>

            <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{formattedDate}</span>
            </p>
          </div>

          {/* Action buttons: Edit & Void (only if active) */}
          {!expense.is_void && (
            <div className="flex items-center gap-2.5 w-full sm:w-auto pt-2 sm:pt-0">
              <Link href={`/expenses/${expense.id}/edit`} className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto justify-center whitespace-nowrap"
                >
                  <Edit2 className="h-4 w-4 mr-1.5 shrink-0" />
                  <span>{t("action_edit")}</span>
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsVoidModalOpen(true)}
                className="w-full sm:w-auto justify-center whitespace-nowrap"
              >
                <Ban className="h-4 w-4 mr-1.5 shrink-0" />
                <span>{t("action_void")}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Voided Notice Banner if Voided */}
      {expense.is_void && (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{t("void_badge_notice")}</span>
          </div>
          {expense.void_reason && (
            <p className="text-sm text-red-800 bg-white/70 p-3 rounded-xl border border-red-100 mt-2">
              <strong className="font-semibold text-red-900">Reason:</strong> {expense.void_reason}
            </p>
          )}
        </div>
      )}

      {/* Expense Information Grid */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
        {/* Payment & Category Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-600 shrink-0" />
            <span>Payment & Category</span>
          </h2>

          <dl className="space-y-3.5 text-sm">
            <div>
              <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {t("field_category")}
              </dt>
              <dd className="mt-1 font-semibold text-slate-900">{categoryName}</dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {t("field_payment_method")}
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {getPaymentMethodLabel(expense.payment_method)}
              </dd>
            </div>

            {expense.reference_number && (
              <div>
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t("field_reference")}
                </dt>
                <dd className="mt-1 font-mono text-sm text-slate-800">
                  {expense.reference_number}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Description & Item Remarks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-brand-600 shrink-0" />
            <span>{t("field_description")}</span>
          </h2>

          <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed break-words">
            {expense.description ? (
              expense.description
            ) : (
              <span className="text-slate-400 italic">No description provided</span>
            )}
          </div>
        </div>
      </div>

      {/* Notes Card (if present) */}
      {expense.notes && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-3">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600 shrink-0" />
            <span>{t("field_notes")}</span>
          </h2>
          <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed break-words">
            {expense.notes}
          </div>
        </div>
      )}

      {/* Audit & Timestamps Footer */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            {t("detail_created_on")}:{" "}
            <strong className="text-slate-800 font-semibold">{formattedCreatedAt}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            {t("detail_last_updated")}:{" "}
            <strong className="text-slate-800 font-semibold">{formattedUpdatedAt}</strong>
          </span>
        </div>
      </div>

      {/* Void Dialog Modal */}
      {isVoidModalOpen && (
        <VoidExpenseDialog
          isOpen={isVoidModalOpen}
          onClose={() => setIsVoidModalOpen(false)}
          expenseId={expense.id}
          expenseAmount={expense.amount}
        />
      )}
    </div>
  );
}
