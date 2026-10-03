import type { ClientBillWithDetails, BillingSummary } from "@/lib/types/billing";
import type { PdfImagePage } from "./pdfDocBuilder";

/**
 * Format currency in Indian standard format (₹ 1,23,456.78)
 */
function formatCurrency(amount: number | null | undefined): string {
  const num = Number(amount) || 0;
  return "₹" + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return dateStr;
}

async function canvasToJpegBytes(canvas: HTMLCanvasElement, quality = 0.94): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Failed to render canvas to blob"));
          return;
        }
        try {
          const buffer = await blob.arrayBuffer();
          resolve(new Uint8Array(buffer));
        } catch (err) {
          reject(err);
        }
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * Renders an Overall Billing Statement PDF report with multi-page pagination.
 */
export async function renderStatementToPdfPages(
  bills: ClientBillWithDetails[],
  summary: BillingSummary,
  periodLabel: string,
  options: {
    locale?: string;
    companyName?: string;
    clientFilterName?: string;
    statusFilterName?: string;
  } = {}
): Promise<PdfImagePage[]> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("PDF rendering is only supported in browser environment");
  }

  const isTamil = options.locale === "ta";
  const companyName = options.companyName || (isTamil ? "பிரிண்டிங் மேனேஜ்மென்ட்" : "PRINT MANAGEMENT");

  const CANVAS_WIDTH = 1240;
  const CANVAS_HEIGHT = 1754;
  const marginX = 50;

  const fontSans = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Mukta Malar", "Noto Sans Tamil", "Latha", Arial, sans-serif';
  const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

  // Calculate pages needed (First page holds header + summary boxes + up to 14 rows; subsequent pages hold 22 rows)
  const FIRST_PAGE_MAX_ROWS = 14;
  const SUBSEQUENT_PAGE_MAX_ROWS = 22;

  const totalBills = bills.length;
  let remainingBills = [...bills];
  const pages: PdfImagePage[] = [];

  let pageIndex = 0;
  const totalPages = Math.max(
    1,
    1 + Math.ceil(Math.max(0, totalBills - FIRST_PAGE_MAX_ROWS) / SUBSEQUENT_PAGE_MAX_ROWS)
  );

  while (pageIndex < totalPages) {
    pageIndex++;
    const isFirstPage = pageIndex === 1;
    const maxRowsThisPage = isFirstPage ? FIRST_PAGE_MAX_ROWS : SUBSEQUENT_PAGE_MAX_ROWS;
    const pageBills = remainingBills.splice(0, maxRowsThisPage);

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      throw new Error("Could not acquire 2D canvas context");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Top brand bar
    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, 10);

    let cursorY = 45;

    // Header section
    ctx.fillStyle = "#0f172a";
    ctx.font = `bold 24px ${fontSans}`;
    ctx.textAlign = "left";
    ctx.fillText(companyName, marginX, cursorY + 20);

    ctx.fillStyle = "#64748b";
    ctx.font = `11px ${fontSans}`;
    ctx.fillText("Printing Management • Billing & Accounts Ledger Statement", marginX, cursorY + 38);

    // Report Title
    ctx.textAlign = "right";
    ctx.fillStyle = "#1e293b";
    ctx.font = `bold 20px ${fontSans}`;
    ctx.fillText(isTamil ? "பில்லிங் அறிக்கை" : "BILLING STATEMENT", CANVAS_WIDTH - marginX, cursorY + 20);

    ctx.fillStyle = "#2563eb";
    ctx.font = `bold 12px ${fontSans}`;
    ctx.fillText(periodLabel, CANVAS_WIDTH - marginX, cursorY + 38);

    cursorY += 56;

    // Filter information & Date Generated line
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginX, cursorY);
    ctx.lineTo(CANVAS_WIDTH - marginX, cursorY);
    ctx.stroke();

    cursorY += 16;
    ctx.textAlign = "left";
    ctx.fillStyle = "#475569";
    ctx.font = `10px ${fontSans}`;
    const filterInfo = `Generated: ${new Date().toLocaleDateString("en-IN")}  |  Client: ${options.clientFilterName || "All Clients"}  |  Status: ${options.statusFilterName || "All Statuses"}`;
    ctx.fillText(filterInfo, marginX, cursorY);

    ctx.textAlign = "right";
    ctx.fillText(`Page ${pageIndex} of ${totalPages}`, CANVAS_WIDTH - marginX, cursorY);

    cursorY += 20;

    // First Page Summary Metrics Cards (4 columns)
    if (isFirstPage) {
      const summaryCardW = (CANVAS_WIDTH - marginX * 2 - 30) / 4;
      const summaryCardH = 76;

      const drawMetricCard = (
        x: number,
        title: string,
        value: string,
        sub: string,
        bgColor: string,
        borderColor: string,
        valColor: string
      ) => {
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(x, cursorY, summaryCardW, summaryCardH, 8);
        ctx.fill();
        ctx.strokeStyle = borderColor;
        ctx.stroke();

        ctx.fillStyle = "#475569";
        ctx.font = `bold 10px ${fontSans}`;
        ctx.textAlign = "left";
        ctx.fillText(title, x + 12, cursorY + 20);

        ctx.fillStyle = valColor;
        ctx.font = `bold 16px ${fontMono}`;
        ctx.fillText(value, x + 12, cursorY + 44);

        ctx.fillStyle = "#64748b";
        ctx.font = `9px ${fontSans}`;
        ctx.fillText(sub, x + 12, cursorY + 62);
      };

      let cardX = marginX;
      drawMetricCard(
        cardX,
        isTamil ? "மொத்த பில் தொகை" : "TOTAL BILLED",
        formatCurrency(summary.total_billed_amount),
        `${summary.total_bills_count} bills`,
        "#f8fafc",
        "#e2e8f0",
        "#0f172a"
      );

      cardX += summaryCardW + 10;
      drawMetricCard(
        cardX,
        isTamil ? "பெறப்பட்ட தொகை" : "TOTAL COLLECTED",
        formatCurrency(summary.total_paid_amount),
        `${summary.paid_bills_count} fully paid`,
        "#ecfdf5",
        "#a7f3d0",
        "#047857"
      );

      cardX += summaryCardW + 10;
      drawMetricCard(
        cardX,
        isTamil ? "நிலுவைத் தொகை" : "TOTAL OUTSTANDING",
        formatCurrency(summary.total_outstanding_amount),
        `${summary.unpaid_bills_count + summary.partially_paid_bills_count} pending`,
        "#fffbeb",
        "#fde68a",
        "#b45309"
      );

      cardX += summaryCardW + 10;
      drawMetricCard(
        cardX,
        isTamil ? "அறிக்கை பில்கள்" : "STATEMENT BILLS",
        `${bills.length}`,
        `Matching records`,
        "#eff6ff",
        "#bfdbfe",
        "#1d4ed8"
      );

      cursorY += summaryCardH + 25;
    }

    // Statement Table
    const tableW = CANVAS_WIDTH - marginX * 2;
    const colX_SNo = marginX + 12;
    const colX_Bill = marginX + 45;
    const colX_Date = marginX + 175;
    const colX_Client = marginX + 265;
    const colX_Type = marginX + 530;
    const colX_Gross = marginX + 645;
    const colX_Disc = marginX + 745;
    const colX_Net = marginX + 855;
    const colX_Paid = marginX + 960;
    const colX_Pending = marginX + 1060;
    const colX_Status = marginX + tableW - 12;

    // Header row
    const headerH = 32;
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(marginX, cursorY, tableW, headerH, 6);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 10px ${fontSans}`;
    ctx.textAlign = "left";
    ctx.fillText("#", colX_SNo, cursorY + 20);
    ctx.fillText(isTamil ? "பில் எண்" : "BILL #", colX_Bill, cursorY + 20);
    ctx.fillText(isTamil ? "தேதி" : "DATE", colX_Date, cursorY + 20);
    ctx.fillText(isTamil ? "வாடிக்கையாளர்" : "CLIENT NAME", colX_Client, cursorY + 20);
    ctx.fillText(isTamil ? "முறை" : "TYPE", colX_Type, cursorY + 20);

    ctx.textAlign = "right";
    ctx.fillText(isTamil ? "மொத்தம்" : "GROSS", colX_Gross, cursorY + 20);
    ctx.fillText(isTamil ? "தள்ளுபடி" : "DISC.", colX_Disc, cursorY + 20);
    ctx.fillText(isTamil ? "நிகரம்" : "NET", colX_Net, cursorY + 20);
    ctx.fillText(isTamil ? "பெறப்பட்டது" : "PAID", colX_Paid, cursorY + 20);
    ctx.fillText(isTamil ? "நிலுவை" : "PENDING", colX_Pending, cursorY + 20);
    ctx.fillText(isTamil ? "நிலை" : "STATUS", colX_Status, cursorY + 20);

    cursorY += headerH;

    // Rows
    const rowH = 34;
    pageBills.forEach((b, idx) => {
      const isAlt = idx % 2 === 1;
      ctx.fillStyle = isAlt ? "#f8fafc" : "#ffffff";
      ctx.fillRect(marginX, cursorY, tableW, rowH);

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(marginX, cursorY + rowH);
      ctx.lineTo(marginX + tableW, cursorY + rowH);
      ctx.stroke();

      const itemNum = (pageIndex - 1) * FIRST_PAGE_MAX_ROWS + idx + 1;

      ctx.fillStyle = "#64748b";
      ctx.font = `10px ${fontSans}`;
      ctx.textAlign = "left";
      ctx.fillText(String(itemNum), colX_SNo, cursorY + 21);

      ctx.fillStyle = "#0f172a";
      ctx.font = `bold 10px ${fontMono}`;
      ctx.fillText(b.bill_number, colX_Bill, cursorY + 21);

      ctx.fillStyle = "#475569";
      ctx.font = `10px ${fontMono}`;
      ctx.fillText(formatDate(b.bill_date), colX_Date, cursorY + 21);

      ctx.fillStyle = "#0f172a";
      ctx.font = `bold 10px ${fontSans}`;
      const clientName = b.client?.name || "Client";
      const displayClient = clientName.length > 28 ? clientName.substring(0, 26) + "..." : clientName;
      ctx.fillText(displayClient, colX_Client, cursorY + 21);

      ctx.fillStyle = "#64748b";
      ctx.font = `9px ${fontSans}`;
      ctx.fillText(b.billing_type.toUpperCase(), colX_Type, cursorY + 21);

      // Financials
      ctx.textAlign = "right";
      ctx.fillStyle = "#475569";
      ctx.font = `10px ${fontMono}`;
      ctx.fillText(formatCurrency(b.gross_amount), colX_Gross, cursorY + 21);

      ctx.fillStyle = Number(b.discount_amount) > 0 ? "#059669" : "#94a3b8";
      ctx.fillText(formatCurrency(b.discount_amount), colX_Disc, cursorY + 21);

      ctx.fillStyle = "#0f172a";
      ctx.font = `bold 10px ${fontMono}`;
      ctx.fillText(formatCurrency(b.net_amount), colX_Net, cursorY + 21);

      ctx.fillStyle = "#059669";
      ctx.fillText(formatCurrency(b.paid_amount), colX_Paid, cursorY + 21);

      ctx.fillStyle = Number(b.pending_amount) > 0 ? "#d97706" : "#64748b";
      ctx.fillText(formatCurrency(b.pending_amount), colX_Pending, cursorY + 21);

      // Status text
      const statusText =
        b.status === "paid" ? "PAID" : b.status === "partially_paid" ? "PARTIAL" : b.status === "cancelled" ? "CANCEL" : "UNPAID";
      ctx.fillStyle =
        b.status === "paid" ? "#047857" : b.status === "partially_paid" ? "#b45309" : b.status === "cancelled" ? "#b91c1c" : "#475569";
      ctx.font = `bold 9px ${fontSans}`;
      ctx.fillText(statusText, colX_Status, cursorY + 21);

      cursorY += rowH;
    });

    // If Last Page, draw Statement Totals Row
    if (pageIndex === totalPages) {
      ctx.fillStyle = "#eff6ff";
      ctx.fillRect(marginX, cursorY, tableW, 36);
      ctx.strokeStyle = "#bfdbfe";
      ctx.strokeRect(marginX, cursorY, tableW, 36);

      ctx.fillStyle = "#1e3a8a";
      ctx.font = `bold 11px ${fontSans}`;
      ctx.textAlign = "left";
      ctx.fillText(isTamil ? "மொத்த தொகைகள் (TOTALS)" : "TOTALS SUMMARY", colX_SNo, cursorY + 22);

      const totalGross = bills.reduce((acc, b) => acc + Number(b.gross_amount || 0), 0);
      const totalDisc = bills.reduce((acc, b) => acc + Number(b.discount_amount || 0), 0);
      const totalNet = bills.reduce((acc, b) => acc + Number(b.net_amount || 0), 0);
      const totalPaid = bills.reduce((acc, b) => acc + Number(b.paid_amount || 0), 0);
      const totalPending = bills.reduce((acc, b) => acc + Number(b.pending_amount || 0), 0);

      ctx.textAlign = "right";
      ctx.font = `bold 11px ${fontMono}`;
      ctx.fillText(formatCurrency(totalGross), colX_Gross, cursorY + 22);
      ctx.fillText(formatCurrency(totalDisc), colX_Disc, cursorY + 22);
      ctx.fillText(formatCurrency(totalNet), colX_Net, cursorY + 22);
      ctx.fillText(formatCurrency(totalPaid), colX_Paid, cursorY + 22);
      ctx.fillText(formatCurrency(totalPending), colX_Pending, cursorY + 22);

      cursorY += 36;
    }

    // Page Footer
    const footerY = CANVAS_HEIGHT - 60;
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginX, footerY);
    ctx.lineTo(CANVAS_WIDTH - marginX, footerY);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = `9px ${fontSans}`;
    ctx.textAlign = "left";
    ctx.fillText("Print Management System • Confidential Accounts Statement", marginX, footerY + 20);

    ctx.textAlign = "right";
    ctx.fillText(`Page ${pageIndex} of ${totalPages}`, CANVAS_WIDTH - marginX, footerY + 20);

    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(0, CANVAS_HEIGHT - 6, CANVAS_WIDTH, 6);

    const jpegBytes = await canvasToJpegBytes(canvas);
    pages.push({
      jpegBytes,
      widthPx: CANVAS_WIDTH,
      heightPx: CANVAS_HEIGHT,
    });
  }

  return pages;
}
