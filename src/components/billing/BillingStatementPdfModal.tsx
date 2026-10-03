"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  X,
  Download,
  Share2,
  Printer,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter,
  FileSpreadsheet,
} from "lucide-react";
import type { ClientBillWithDetails, BillStatus } from "@/lib/types/billing";
import type { Client } from "@/lib/types/client";
import { Button } from "@/components/ui/Button";
import {
  generateBillingStatementPdfBlob,
  downloadPdfBlob,
  sharePdfBlob,
  sanitizePdfFilename,
  printPdfBlob,
} from "@/lib/billing/pdf";
import { roundCurrency } from "@/lib/billing/calculations";

interface BillingStatementPdfModalProps {
  bills: ClientBillWithDetails[];
  clients: Client[];
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

type PeriodPreset = "weekly" | "monthly" | "yearly" | "custom";

export function BillingStatementPdfModal({
  bills,
  clients,
  isOpen,
  onClose,
  locale,
}: BillingStatementPdfModalProps) {
  const t = useTranslations("billing");
  const isTamil = locale === "ta";

  // Filter states
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("monthly");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split("T")[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<BillStatus | "all">("all");

  // PDF Preview State
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Compute period start and end dates
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (periodPreset === "weekly") {
      const past7 = new Date();
      past7.setDate(today.getDate() - 7);
      const startStr = past7.toISOString().split("T")[0];
      return {
        startDate: startStr,
        endDate: todayStr,
        periodLabel: isTamil
          ? `வாராந்திர அறிக்கை (${startStr} முதல் ${todayStr})`
          : `Weekly Statement (${startStr} to ${todayStr})`,
      };
    }

    if (periodPreset === "monthly") {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startStr = firstOfMonth.toISOString().split("T")[0];
      const monthName = today.toLocaleString("en-US", { month: "long", year: "numeric" });
      return {
        startDate: startStr,
        endDate: todayStr,
        periodLabel: isTamil
          ? `மாதாந்திர அறிக்கை (${monthName})`
          : `Monthly Statement - ${monthName}`,
      };
    }

    if (periodPreset === "yearly") {
      const firstOfYear = new Date(today.getFullYear(), 0, 1);
      const startStr = firstOfYear.toISOString().split("T")[0];
      return {
        startDate: startStr,
        endDate: todayStr,
        periodLabel: isTamil
          ? `வருடாந்திர அறிக்கை (${today.getFullYear()})`
          : `Annual Statement (${today.getFullYear()})`,
      };
    }

    // Custom
    return {
      startDate: customStartDate,
      endDate: customEndDate,
      periodLabel: isTamil
        ? `தனிப்பயன் அறிக்கை (${customStartDate || "Start"} முதல் ${customEndDate || "End"})`
        : `Statement (${customStartDate || "Start"} to ${customEndDate || "End"})`,
    };
  }, [periodPreset, customStartDate, customEndDate, isTamil]);

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      if (selectedClientId !== "all" && b.client_id !== selectedClientId) return false;
      if (selectedStatus !== "all" && b.status !== selectedStatus) return false;
      if (startDate && b.bill_date < startDate) return false;
      if (endDate && b.bill_date > endDate) return false;
      return true;
    });
  }, [bills, selectedClientId, selectedStatus, startDate, endDate]);

  // Statement summary metrics
  const summary = useMemo(() => {
    let billed = 0;
    let paid = 0;
    let outstanding = 0;
    let unpaidCount = 0;
    let partialCount = 0;
    let paidCount = 0;

    filteredBills.forEach((b) => {
      if (b.status === "cancelled") return;
      billed += Number(b.net_amount || 0);
      paid += Number(b.paid_amount || 0);
      outstanding += Number(b.pending_amount || 0);

      if (b.status === "paid") paidCount++;
      else if (b.status === "partially_paid") partialCount++;
      else unpaidCount++;
    });

    return {
      total_bills_count: filteredBills.length,
      total_billed_amount: roundCurrency(billed),
      total_paid_amount: roundCurrency(paid),
      total_outstanding_amount: roundCurrency(outstanding),
      unpaid_bills_count: unpaidCount,
      partially_paid_bills_count: partialCount,
      paid_bills_count: paidCount,
    };
  }, [filteredBills]);

  const clientName = useMemo(() => {
    if (selectedClientId === "all") return "All_Clients";
    const found = clients.find((c) => c.id === selectedClientId);
    return found?.name || "Client";
  }, [selectedClientId, clients]);

  const filename = `Billing-Statement-${periodPreset}-${sanitizePdfFilename(clientName)}.pdf`;

  const handleGeneratePdf = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setShareNotice(null);

    try {
      const selectedClientObj = clients.find((c) => c.id === selectedClientId);
      const blob = await generateBillingStatementPdfBlob(
        filteredBills,
        summary,
        periodLabel,
        {
          locale,
          clientFilterName: selectedClientObj ? selectedClientObj.name : "All Clients",
          statusFilterName: selectedStatus === "all" ? "All Statuses" : selectedStatus.toUpperCase(),
        }
      );

      setPdfBlob(blob);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("[BillingStatementPdfModal] Statement generation error:", err);
      setError("Failed to generate billing statement PDF.");
    } finally {
      setIsLoading(false);
    }
  }, [filteredBills, summary, periodLabel, locale, selectedClientId, selectedStatus, clients, pdfUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!pdfBlob) return;
    downloadPdfBlob(pdfBlob, filename);
  };

  const handleShare = async () => {
    if (!pdfBlob || isSharing) return;
    setIsSharing(true);
    setShareNotice(null);

    try {
      const res = await sharePdfBlob(
        pdfBlob,
        filename,
        `Billing Statement - ${periodLabel}`,
        `Billing statement report from Print Management (${filteredBills.length} bills).`
      );

      if (res.fallbackToDownload) {
        setShareNotice(
          isTamil
            ? "உங்கள் உலாவியில் நேரடி கோப்பு பகிர்வு ஆதரிக்கப்படவில்லை. PDF கோப்பு பதிவிறக்கம் செய்யப்பட்டது."
            : "Direct file sharing is not supported by your browser. The PDF file has been downloaded instead."
        );
      }
    } catch (err) {
      console.error("[BillingStatementPdfModal] Share error:", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrint = () => {
    if (!pdfBlob) return;
    printPdfBlob(pdfBlob);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex flex-col w-full max-w-5xl max-h-[94vh] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isTamil ? "பில்லிங் அறிக்கை PDF ஏற்றுமதி" : "Export Billing Statement PDF"}
              </h2>
              <p className="text-xs text-slate-500">
                {isTamil
                  ? "வாராந்திர, மாதாந்திர, வருடாந்திர அல்லது தனிப்பயன் கால பில்லிங் அறிக்கை"
                  : "Generate Weekly, Monthly, Yearly or Custom period Billing Statement PDF"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3">
          {/* Period Presets Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{isTamil ? "கால அளவு:" : "Period:"}</span>
            </span>

            <button
              type="button"
              onClick={() => setPeriodPreset("weekly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                periodPreset === "weekly"
                  ? "bg-brand-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isTamil ? "கடந்த 7 நாட்கள் (Weekly)" : "This Week (7 Days)"}
            </button>

            <button
              type="button"
              onClick={() => setPeriodPreset("monthly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                periodPreset === "monthly"
                  ? "bg-brand-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isTamil ? "இந்த மாதம் (Monthly)" : "This Month"}
            </button>

            <button
              type="button"
              onClick={() => setPeriodPreset("yearly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                periodPreset === "yearly"
                  ? "bg-brand-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isTamil ? "இந்த ஆண்டு (Yearly)" : "This Year"}
            </button>

            <button
              type="button"
              onClick={() => setPeriodPreset("custom")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                periodPreset === "custom"
                  ? "bg-brand-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isTamil ? "தனிப்பயன் (Custom)" : "Custom Range"}
            </button>
          </div>

          {/* Secondary Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
            {periodPreset === "custom" && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    {isTamil ? "தொடக்கத் தேதி" : "Start Date"}
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    {isTamil ? "முடிவுத் தேதி" : "End Date"}
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                {isTamil ? "வாடிக்கையாளர்" : "Client Filter"}
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="all">{isTamil ? "அனைத்து வாடிக்கையாளர்கள்" : "All Clients"}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.client_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                {isTamil ? "பில் நிலை" : "Status Filter"}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as BillStatus | "all")}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="all">{isTamil ? "அனைத்து நிலைகள்" : "All Statuses"}</option>
                <option value="unpaid">{isTamil ? "செலுத்தப்படாதவை" : "Unpaid"}</option>
                <option value="partially_paid">{isTamil ? "பகுதி பெறப்பட்டவை" : "Partially Paid"}</option>
                <option value="paid">{isTamil ? "முழுதும் பெறப்பட்டவை" : "Paid"}</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="primary"
                size="sm"
                onClick={handleGeneratePdf}
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <span>{isTamil ? "PDF உருவாக்கு" : "Generate Statement PDF"}</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics Badge Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500">
              {isTamil ? "தேர்ந்தெடுக்கப்பட்ட பில்கள்:" : "Matching Bills:"}
              <strong className="text-slate-900 font-mono ml-1">{filteredBills.length}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              {isTamil ? "மொத்தம்:" : "Total Billed:"}
              <strong className="text-slate-900 font-mono ml-1">₹{summary.total_billed_amount.toLocaleString("en-IN")}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              {isTamil ? "பெறப்பட்டது:" : "Collected:"}
              <strong className="text-emerald-700 font-mono ml-1">₹{summary.total_paid_amount.toLocaleString("en-IN")}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              {isTamil ? "நிலுவை:" : "Outstanding:"}
              <strong className="text-amber-700 font-mono ml-1">₹{summary.total_outstanding_amount.toLocaleString("en-IN")}</strong>
            </span>
          </div>
        </div>

        {/* Share Notice or Error */}
        {shareNotice && (
          <div className="flex items-start gap-2 mx-5 mt-3 p-3 bg-amber-50 text-amber-900 text-xs rounded-xl border border-amber-200 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium">{shareNotice}</p>
            </div>
            <button
              type="button"
              onClick={() => setShareNotice(null)}
              className="text-amber-600 hover:text-amber-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 mx-5 mt-3 p-3 bg-red-50 text-red-900 text-xs rounded-xl border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Statement Preview Body */}
        <div className="flex-1 overflow-auto p-3 sm:p-5 bg-slate-100/70 flex items-center justify-center min-h-[380px] sm:min-h-[480px]">
          {isLoading ? (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 text-brand-600 animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                {isTamil ? "பில்லிங் அறிக்கை உருவாகிறது..." : "Compiling statement PDF..."}
              </p>
            </div>
          ) : pdfUrl ? (
            <div className="w-full max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                title="Statement PDF Preview"
                className="w-full h-[520px] sm:h-[600px] border-0 rounded-lg bg-white"
              />
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <FileSpreadsheet className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
                {isTamil
                  ? "மேலே உள்ள கால அளவு அல்லது வடிகட்டிகளை தேர்வு செய்து 'PDF உருவாக்கு' என்பதை அழுத்தவும்."
                  : "Select your desired period preset or filters above and click 'Generate Statement PDF' to preview and download."}
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 bg-white">
          <div className="text-xs text-slate-500 hidden sm:block">
            <span className="font-mono font-medium text-slate-700">{filename}</span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              disabled={isLoading || !pdfBlob}
              className="flex-1 sm:flex-initial"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              <span>{isTamil ? "அச்சிடு" : "Print"}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              disabled={isLoading || !pdfBlob || isSharing}
              loading={isSharing}
              className="flex-1 sm:flex-initial"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5 text-brand-600" />
              <span>{isTamil ? "பகிர்க (Share)" : "Share"}</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              disabled={isLoading || !pdfBlob}
              className="flex-1 sm:flex-initial"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>{isTamil ? "PDF பதிவிறக்கு" : "Download PDF"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
