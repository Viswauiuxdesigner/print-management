"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, X } from "lucide-react";
import { voidExpenseAction } from "@/lib/actions/expenses";
import { Button } from "@/components/ui/Button";

interface VoidExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string;
  expenseAmount: number;
}

export function VoidExpenseDialog({
  isOpen,
  onClose,
  expenseId,
  expenseAmount,
}: VoidExpenseDialogProps) {
  const t = useTranslations("expenses");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  async function handleVoid(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError(tErr("void_reason_required"));
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await voidExpenseAction(expenseId, reason);
      if (!res.success) {
        setError(res.error ? tErr(res.error) : "Failed to void expense");
      } else {
        onClose();
        router.refresh();
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="void-dialog-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100 mt-0.5">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3
                id="void-dialog-title"
                className="text-sm sm:text-base font-semibold text-slate-900 leading-snug break-words"
              >
                {t("void_dialog_title")}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                ₹{expenseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words">
          {t("void_dialog_desc")}
        </p>

        <form onSubmit={handleVoid} className="space-y-4 pt-1">
          <div>
            <label
              htmlFor="void_reason_input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              {t("void_reason_label")}
            </label>
            <textarea
              id="void_reason_input"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t("void_reason_placeholder")}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-colors ${
                error
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/30"
                  : "border-slate-200 focus:border-brand-500 focus:ring-brand-200 bg-white"
              }`}
              disabled={isPending}
              required
            />
            {error && <p className="mt-1 text-xs text-red-600 break-words">{error}</p>}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="w-full sm:w-auto justify-center"
            >
              {t("action_cancel")}
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={isPending}
              disabled={isPending}
              className="w-full sm:w-auto justify-center"
            >
              {t("void_confirm_btn")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
