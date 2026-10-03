import type { ClientBillWithDetails, BillingSummary } from "@/lib/types/billing";
import { buildPdfFromJpegPages } from "./pdfDocBuilder";
import { renderBillToPdfPages } from "./billPdfCanvas";
import { renderStatementToPdfPages } from "./statementPdfCanvas";

/**
 * Sanitizes a string for filesystem-safe and header-safe filename.
 * e.g., "Sri Murugan & Co. / Prints" -> "Sri_Murugan_Co_Prints"
 */
export function sanitizePdfFilename(name: string): string {
  if (!name) return "Client";
  return name
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "") // Remove illegal characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/_+/g, "_"); // Deduplicate underscores
}

/**
 * Generates an A4 PDF Blob for a specific client bill.
 */
export async function generateBillPdfBlob(
  bill: ClientBillWithDetails,
  options: {
    locale?: string;
    companyName?: string;
  } = {}
): Promise<Blob> {
  const pages = await renderBillToPdfPages(bill, options);
  const clientName = bill.client?.name || "Client";
  const title = `Invoice - ${bill.bill_number} - ${clientName}`;
  return buildPdfFromJpegPages(pages, title);
}

/**
 * Generates an A4 PDF Blob for an overall billing statement report.
 */
export async function generateBillingStatementPdfBlob(
  bills: ClientBillWithDetails[],
  summary: BillingSummary,
  periodLabel: string,
  options: {
    locale?: string;
    companyName?: string;
    clientFilterName?: string;
    statusFilterName?: string;
  } = {}
): Promise<Blob> {
  const pages = await renderStatementToPdfPages(bills, summary, periodLabel, options);
  const title = `Billing Statement - ${periodLabel}`;
  return buildPdfFromJpegPages(pages, title);
}

/**
 * Triggers a direct browser download of a PDF Blob with a specified filename.
 */
export function downloadPdfBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up URL object after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Shares a PDF blob using the Web Share API (File sharing) if supported by browser/device.
 * Falls back cleanly to download if direct file sharing is not supported.
 */
export async function sharePdfBlob(
  blob: Blob,
  filename: string,
  title: string = "Billing Invoice",
  text: string = "Please find attached the billing invoice."
): Promise<{ success: boolean; fallbackToDownload?: boolean; error?: string }> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { success: false, error: "Share is not supported in this environment" };
  }

  const safeFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  // Check Web Share API Level 2 (File Sharing) support
  try {
    if (navigator.canShare && typeof File !== "undefined") {
      const file = new File([blob], safeFilename, { type: "application/pdf" });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text,
        });
        return { success: true, fallbackToDownload: false };
      }
    }
  } catch (err: unknown) {
    // If user cancelled the share dialog (AbortError), don't trigger fallback download
    if (err instanceof Error && (err.name === "AbortError" || err.message?.includes("AbortError"))) {
      return { success: false, error: "Share cancelled by user" };
    }
    console.warn("[sharePdfBlob] Web Share API file share failed or not allowed:", err);
  }

  // Fallback: Trigger direct PDF download and notify the caller
  downloadPdfBlob(blob, safeFilename);
  return {
    success: true,
    fallbackToDownload: true,
  };
}

/**
 * Opens a print dialog for the PDF blob
 */
export function printPdfBlob(blob: Blob): void {
  if (typeof window === "undefined") return;

  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = url;

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn("[printPdfBlob] Iframe print failed, opening in new window:", e);
      window.open(url, "_blank");
    }
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 60000);
  };

  document.body.appendChild(iframe);
}
