"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  X,
  Download,
  Share2,
  Printer,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  FileText,
} from "lucide-react";
import type { ClientBillWithDetails } from "@/lib/types/billing";
import { Button } from "@/components/ui/Button";
import {
  generateBillPdfBlob,
  downloadPdfBlob,
  sharePdfBlob,
  sanitizePdfFilename,
  printPdfBlob,
} from "@/lib/billing/pdf";

interface BillPdfModalProps {
  bill: ClientBillWithDetails;
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export function BillPdfModal({ bill, isOpen, onClose, locale }: BillPdfModalProps) {
  const t = useTranslations("billing");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [zoom, setZoom] = useState(100);

  const clientName = bill.client?.name || "Client";
  const filename = `${bill.bill_number}-${sanitizePdfFilename(clientName)}.pdf`;

  const generatePdf = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setShareNotice(null);

    try {
      const blob = await generateBillPdfBlob(bill, { locale });
      setPdfBlob(blob);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("[BillPdfModal] PDF Generation error:", err);
      setError("Failed to generate PDF invoice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [bill, locale]);

  useEffect(() => {
    if (isOpen) {
      generatePdf();
    } else {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      setPdfBlob(null);
      setZoom(100);
      setShareNotice(null);
    }
  }, [isOpen, generatePdf]);

  // Clean up URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

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
        `Invoice ${bill.bill_number} - ${clientName}`,
        `Invoice ${bill.bill_number} for ₹${bill.net_amount} from Print Management`
      );

      if (res.fallbackToDownload) {
        setShareNotice(
          locale === "ta"
            ? "உங்கள் உலாவியில் நேரடி கோப்பு பகிர்வு ஆதரிக்கப்படவில்லை. PDF கோப்பு பதிவிறக்கம் செய்யப்பட்டது."
            : "Direct file sharing is not supported by your browser. The PDF file has been downloaded instead."
        );
      }
    } catch (err) {
      console.error("[BillPdfModal] Share error:", err);
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
      <div className="flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-100 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                <span>{bill.bill_number}</span>
                <span className="text-xs font-normal font-sans text-slate-500 hidden sm:inline">
                  • {clientName}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {locale === "ta" ? "PDF விலைப்பட்டியல் முன்னோட்டம்" : "PDF Invoice Preview & Actions"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom controls for desktop */}
            <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 mr-2 text-xs">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                className="p-1 text-slate-600 hover:text-slate-900 rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1 text-slate-600 w-10 text-center">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(150, z + 15))}
                className="p-1 text-slate-600 hover:text-slate-900 rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
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
        </div>

        {/* Share Fallback or Error Notification */}
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

        {/* Preview Content Body */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 bg-slate-100/70 flex items-center justify-center min-h-[360px] sm:min-h-[500px]">
          {isLoading ? (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 text-brand-600 animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                {locale === "ta" ? "PDF விலைப்பட்டியல் உருவாகிறது..." : "Generating PDF invoice..."}
              </p>
            </div>
          ) : pdfUrl ? (
            <div
              className="transition-all duration-150 origin-top shadow-md rounded-lg overflow-hidden bg-white max-w-full"
              style={{
                width: `${(zoom / 100) * 100}%`,
                maxWidth: "750px",
              }}
            >
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                title="Bill PDF Preview"
                className="w-full h-[520px] sm:h-[620px] border-0 rounded-lg bg-white"
              />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs sm:text-sm">
              {locale === "ta" ? "PDF முன்னோட்டம் கிடைக்கவில்லை" : "No preview available"}
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
              <span>{locale === "ta" ? "அச்சிடு" : "Print"}</span>
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
              <span>{locale === "ta" ? "பகிர்க (Share)" : "Share"}</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              disabled={isLoading || !pdfBlob}
              className="flex-1 sm:flex-initial"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>{locale === "ta" ? "PDF பதிவிறக்கு" : "Download PDF"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
