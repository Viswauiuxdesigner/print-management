import type { ClientBillWithDetails } from "@/lib/types/billing";
import type { PdfImagePage } from "./pdfDocBuilder";

/**
 * Format currency in Indian standard format (₹ 1,23,456.78)
 */
function formatCurrency(amount: number | null | undefined): string {
  const num = Number(amount) || 0;
  return "₹" + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Formats date to DD/MM/YYYY or YYYY-MM-DD
 */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return dateStr;
}

/**
 * Helper to wrap text into multiple lines within a max width
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Helper to convert HTML5 canvas to JPEG Uint8Array
 */
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
 * Renders a Client Bill into high-resolution A4 image pages for PDF generation.
 */
export async function renderBillToPdfPages(
  bill: ClientBillWithDetails,
  options: {
    locale?: string;
    companyName?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyAddress?: string;
    companyGst?: string;
  } = {}
): Promise<PdfImagePage[]> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("PDF rendering is only supported in browser environment");
  }

  const isTamil = options.locale === "ta";
  const companyName = options.companyName || (isTamil ? "பிரிண்டிங் மேனேஜ்மென்ட்" : "PRINT MANAGEMENT");
  const companyPhone = options.companyPhone || "+91 98765 43210";
  const companyEmail = options.companyEmail || "billing@printmanagement.com";
  const companyAddress = options.companyAddress || "124, Industrial Estate, Textile Park, Erode - 638001";
  const companyGst = options.companyGst || "33AAAAA0000A1Z5";

  // Standard A4 at 150 DPI: 1240 x 1754 px
  const CANVAS_WIDTH = 1240;
  const CANVAS_HEIGHT = 1754;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    throw new Error("Could not acquire 2D canvas context");
  }

  // Smooth font rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Fill White Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // System font stack with Tamil unicode font fallbacks
  const fontSans = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Mukta Malar", "Noto Sans Tamil", "Latha", Arial, sans-serif';
  const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

  const marginX = 60;
  let cursorY = 55;

  // 1. Top Decorative Brand Bar
  ctx.fillStyle = "#1e3a8a"; // Deep Indigo / Brand Navy
  ctx.fillRect(0, 0, CANVAS_WIDTH, 12);

  // 2. Company Header & Invoice Badge
  // Company Logo Icon Box
  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  ctx.roundRect(marginX, cursorY, 52, 52, 10);
  ctx.fill();

  // Draw simple print icon lines on logo box
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(marginX + 14, cursorY + 14, 24, 6);
  ctx.fillRect(marginX + 14, cursorY + 24, 24, 14);
  ctx.fillStyle = "#93c5fd";
  ctx.fillRect(marginX + 18, cursorY + 30, 16, 4);

  // Company Name & Subtitle
  ctx.fillStyle = "#0f172a";
  ctx.font = `bold 26px ${fontSans}`;
  ctx.textAlign = "left";
  ctx.fillText(companyName, marginX + 66, cursorY + 26);

  ctx.fillStyle = "#64748b";
  ctx.font = `12px ${fontSans}`;
  ctx.fillText("Specialized Textile Printing & Processing Services", marginX + 66, cursorY + 44);

  // Invoice Title & Status Badge (Right aligned)
  ctx.textAlign = "right";
  ctx.fillStyle = "#1e293b";
  ctx.font = `bold 24px ${fontSans}`;
  ctx.fillText(isTamil ? "வரி விலைப்பட்டியல் / பில்" : "TAX INVOICE / BILL", CANVAS_WIDTH - marginX, cursorY + 24);

  // Status Badge
  const status = bill.status || "unpaid";
  let badgeBg = "#f1f5f9";
  let badgeText = "#475569";
  let badgeBorder = "#cbd5e1";
  let statusLabel = isTamil ? "செலுத்தப்படவில்லை" : "UNPAID";

  if (status === "paid") {
    badgeBg = "#ecfdf5";
    badgeText = "#047857";
    badgeBorder = "#6ee7b7";
    statusLabel = isTamil ? "முழுதும் பெறப்பட்டது (PAID)" : "PAID";
  } else if (status === "partially_paid") {
    badgeBg = "#fffbeb";
    badgeText = "#b45309";
    badgeBorder = "#fcd34d";
    statusLabel = isTamil ? "பகுதி பெறப்பட்டது (PARTIAL)" : "PARTIALLY PAID";
  } else if (status === "cancelled") {
    badgeBg = "#fef2f2";
    badgeText = "#b91c1c";
    badgeBorder = "#fca5a5";
    statusLabel = isTamil ? "ரத்து செய்யப்பட்டது (CANCELLED)" : "CANCELLED";
  }

  const badgeWidth = 150;
  const badgeHeight = 26;
  const badgeX = CANVAS_WIDTH - marginX - badgeWidth;
  const badgeY = cursorY + 34;

  ctx.fillStyle = badgeBg;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6);
  ctx.fill();
  ctx.strokeStyle = badgeBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = badgeText;
  ctx.font = `bold 11px ${fontSans}`;
  ctx.textAlign = "center";
  ctx.fillText(statusLabel, badgeX + badgeWidth / 2, badgeY + 17);

  cursorY += 80;

  // Company Address Details Line
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX, cursorY);
  ctx.lineTo(CANVAS_WIDTH - marginX, cursorY);
  ctx.stroke();

  cursorY += 16;
  ctx.textAlign = "left";
  ctx.fillStyle = "#64748b";
  ctx.font = `11px ${fontSans}`;
  ctx.fillText(`${companyAddress}  •  Phone: ${companyPhone}  •  Email: ${companyEmail}  •  GSTIN: ${companyGst}`, marginX, cursorY);

  cursorY += 25;

  // 3. Dual Card Section: (Left: Bill To / Client, Right: Invoice Meta / Order Reference)
  const cardWidth = (CANVAS_WIDTH - marginX * 2 - 20) / 2;
  const cardHeight = 175;
  const leftCardX = marginX;
  const rightCardX = marginX + cardWidth + 20;

  // Left Card: Billed To / Client Details
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.roundRect(leftCardX, cursorY, cardWidth, cardHeight, 10);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.stroke();

  // Left Card Header
  ctx.fillStyle = "#2563eb";
  ctx.fillRect(leftCardX, cursorY, 4, cardHeight);
  ctx.fillStyle = "#1e293b";
  ctx.font = `bold 12px ${fontSans}`;
  ctx.fillText(isTamil ? "வாடிக்கையாளர் விவரம் (BILLED TO)" : "BILLED TO (CLIENT DETAILS)", leftCardX + 16, cursorY + 24);

  // Client Details Content
  const client = bill.client;
  ctx.fillStyle = "#0f172a";
  ctx.font = `bold 16px ${fontSans}`;
  ctx.fillText(client?.name || "Client Name", leftCardX + 16, cursorY + 50);

  let clientLineY = cursorY + 72;
  ctx.fillStyle = "#334155";
  ctx.font = `12px ${fontSans}`;

  if (client?.company_name) {
    ctx.fillText(client.company_name, leftCardX + 16, clientLineY);
    clientLineY += 20;
  }

  ctx.fillStyle = "#64748b";
  ctx.font = `11px ${fontSans}`;
  ctx.fillText(`Client Code: ${client?.client_code || "-"}   |   Phone: ${client?.phone || "No Phone"}`, leftCardX + 16, clientLineY);
  clientLineY += 18;

  if (client?.alternate_phone) {
    ctx.fillText(`Alt Phone: ${client.alternate_phone}`, leftCardX + 16, clientLineY);
    clientLineY += 18;
  }

  if (client?.email || client?.city || client?.address) {
    const addrParts = [client?.address, client?.city, client?.email].filter(Boolean).join(", ");
    const lines = wrapText(ctx, addrParts, cardWidth - 32);
    for (const l of lines.slice(0, 2)) {
      ctx.fillText(l, leftCardX + 16, clientLineY);
      clientLineY += 16;
    }
  }

  // Right Card: Invoice Metadata & Linked Order
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.roundRect(rightCardX, cursorY, cardWidth, cardHeight, 10);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.stroke();

  ctx.fillStyle = "#2563eb";
  ctx.fillRect(rightCardX, cursorY, 4, cardHeight);
  ctx.fillStyle = "#1e293b";
  ctx.font = `bold 12px ${fontSans}`;
  ctx.fillText(isTamil ? "பில் & ஆர்டர் விவரங்கள்" : "INVOICE & ORDER DETAILS", rightCardX + 16, cursorY + 24);

  let metaY = cursorY + 50;

  const drawMetaRow = (label: string, value: string, isMono = false) => {
    ctx.fillStyle = "#64748b";
    ctx.font = `11px ${fontSans}`;
    ctx.textAlign = "left";
    ctx.fillText(label, rightCardX + 16, metaY);

    ctx.fillStyle = "#0f172a";
    ctx.font = isMono ? `bold 12px ${fontMono}` : `bold 12px ${fontSans}`;
    ctx.textAlign = "right";
    ctx.fillText(value, rightCardX + cardWidth - 16, metaY);

    metaY += 23;
  };

  drawMetaRow(isTamil ? "பில் எண் (Bill #):" : "Invoice Number:", bill.bill_number, true);
  drawMetaRow(isTamil ? "பில் தேதி (Date):" : "Invoice Date:", formatDate(bill.bill_date), true);

  if (bill.order) {
    drawMetaRow(
      isTamil ? "ஆர்டர் எண் (Order #):" : "Linked Order:",
      `${bill.order.order_number} (${formatDate(bill.order.order_date)})`,
      true
    );
    if (bill.order.received_weight_kg) {
      drawMetaRow(
        isTamil ? "ஆர்டர் எடை:" : "Order Received Wt:",
        `${Number(bill.order.received_weight_kg).toFixed(2)} kg`
      );
    }
  } else {
    drawMetaRow(
      isTamil ? "இணைக்கப்பட்ட ஆர்டர்:" : "Linked Order:",
      isTamil ? "நேரடி பில்லிங்" : "Direct Invoicing (None)"
    );
  }

  const pricingLabel =
    bill.billing_type === "kg"
      ? (isTamil ? "கிலோ விகிதம் (Per KG)" : "Weight Based (Per KG)")
      : bill.billing_type === "fixed"
      ? (isTamil ? "நிலையான தொகை (Fixed Rate)" : "Fixed Contract Rate")
      : (isTamil ? "கலப்பு முறை (Mixed Rate)" : "Mixed Pricing");

  drawMetaRow(isTamil ? "விலை நிர்ணய முறை:" : "Pricing Model:", pricingLabel);

  cursorY += cardHeight + 25;

  // 4. Line Items Table
  const tableWidth = CANVAS_WIDTH - marginX * 2;
  const colDescX = marginX + 16;
  const colWeightX = marginX + tableWidth * 0.48;
  const colRateX = marginX + tableWidth * 0.70;
  const colTotalX = marginX + tableWidth - 16;

  // Table Header
  const headerHeight = 36;
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.roundRect(marginX, cursorY, tableWidth, headerHeight, 6);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 11px ${fontSans}`;
  ctx.textAlign = "left";
  ctx.fillText(isTamil ? "விவரம் / சேவை" : "DESCRIPTION / SERVICES", colDescX, cursorY + 22);

  ctx.textAlign = "right";
  ctx.fillText(isTamil ? "எடை / அளவு" : "WEIGHT / QTY", colWeightX, cursorY + 22);
  ctx.fillText(isTamil ? "விகிதம் / கட்டணம்" : "RATE / UNIT", colRateX, cursorY + 22);
  ctx.fillText(isTamil ? "மொத்த தொகை" : "AMOUNT", colTotalX, cursorY + 22);

  cursorY += headerHeight;

  // Rows
  const drawTableRow = (desc: string, subDesc: string, weight: string, rate: string, amount: string, isAlt = false) => {
    const rowHeight = 44;
    ctx.fillStyle = isAlt ? "#f8fafc" : "#ffffff";
    ctx.fillRect(marginX, cursorY, tableWidth, rowHeight);

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginX, cursorY + rowHeight);
    ctx.lineTo(marginX + tableWidth, cursorY + rowHeight);
    ctx.stroke();

    // Desc
    ctx.fillStyle = "#0f172a";
    ctx.font = `bold 12px ${fontSans}`;
    ctx.textAlign = "left";
    ctx.fillText(desc, colDescX, cursorY + 20);

    if (subDesc) {
      ctx.fillStyle = "#64748b";
      ctx.font = `10px ${fontSans}`;
      ctx.fillText(subDesc, colDescX, cursorY + 34);
    }

    // Weight
    ctx.fillStyle = "#334155";
    ctx.font = `12px ${fontMono}`;
    ctx.textAlign = "right";
    ctx.fillText(weight, colWeightX, cursorY + 24);

    // Rate
    ctx.fillText(rate, colRateX, cursorY + 24);

    // Total Amount
    ctx.fillStyle = "#0f172a";
    ctx.font = `bold 12px ${fontMono}`;
    ctx.fillText(amount, colTotalX, cursorY + 24);

    cursorY += rowHeight;
  };

  if (bill.billing_type === "kg") {
    const w = Number(bill.billable_weight_kg || 0).toFixed(2);
    const r = formatCurrency(bill.rate_per_kg);
    const gross = formatCurrency(bill.gross_amount);
    drawTableRow(
      isTamil ? "துணி பிரிண்டிங் & செயலாக்கக் கட்டணம்" : "Printing & Fabric Processing Charges",
      isTamil ? `பில் செய்யத்தக்க எடை: ${w} kg` : `Billable Weight: ${w} kg @ ${r} / kg`,
      `${w} kg`,
      `${r}/kg`,
      gross
    );
  } else if (bill.billing_type === "fixed") {
    const fixed = formatCurrency(bill.fixed_amount);
    drawTableRow(
      isTamil ? "ஒப்பந்த நிலையான கட்டணம்" : "Fixed Contract Printing Job",
      isTamil ? "ஒப்புக்கொள்ளப்பட்ட முழு கட்டணம்" : "Agreed fixed lumpsum printing charges",
      "1 Job",
      fixed,
      fixed
    );
  } else if (bill.billing_type === "mixed") {
    const w = Number(bill.billable_weight_kg || 0).toFixed(2);
    const r = formatCurrency(bill.rate_per_kg);
    const weightTotal = formatCurrency((Number(bill.billable_weight_kg) || 0) * (Number(bill.rate_per_kg) || 0));

    drawTableRow(
      isTamil ? "துணி பிரிண்டிங் (எடை அடிப்படையில்)" : "Fabric Printing (Weight Based)",
      `${w} kg @ ${r} / kg`,
      `${w} kg`,
      `${r}/kg`,
      weightTotal
    );

    if (Number(bill.additional_amount || 0) > 0) {
      drawTableRow(
        isTamil ? "கூடுதல் சேவைக் கட்டணம்" : "Additional Special Charges",
        isTamil ? "வடிவமைப்பு / அவசர சேவை / கூடுதல் செயலாக்கம்" : "Design, screen prep or extra processing",
        "-",
        "-",
        formatCurrency(bill.additional_amount),
        true
      );
    }
  }

  cursorY += 15;

  // 5. Financial Breakdown Card (Right aligned) & Notes/Bank Info (Left)
  const summaryBoxWidth = 400;
  const summaryBoxX = CANVAS_WIDTH - marginX - summaryBoxWidth;
  const notesBoxWidth = CANVAS_WIDTH - marginX * 2 - summaryBoxWidth - 30;
  const summaryBoxY = cursorY;

  // Financial Summary Box
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.roundRect(summaryBoxX, summaryBoxY, summaryBoxWidth, 230, 8);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.stroke();

  let sumY = summaryBoxY + 28;

  const drawSummaryLine = (
    label: string,
    amountStr: string,
    opts: { isBold?: boolean; isLarge?: boolean; color?: string; bgColor?: string } = {}
  ) => {
    if (opts.bgColor) {
      ctx.fillStyle = opts.bgColor;
      ctx.fillRect(summaryBoxX + 1, sumY - 20, summaryBoxWidth - 2, 32);
    }

    ctx.fillStyle = opts.color || (opts.isBold ? "#0f172a" : "#475569");
    ctx.font = opts.isLarge
      ? `bold 16px ${fontSans}`
      : opts.isBold
      ? `bold 12px ${fontSans}`
      : `12px ${fontSans}`;
    ctx.textAlign = "left";
    ctx.fillText(label, summaryBoxX + 16, sumY);

    ctx.font = opts.isLarge
      ? `bold 16px ${fontMono}`
      : opts.isBold
      ? `bold 12px ${fontMono}`
      : `12px ${fontMono}`;
    ctx.textAlign = "right";
    ctx.fillText(amountStr, summaryBoxX + summaryBoxWidth - 16, sumY);

    sumY += opts.isLarge ? 34 : 26;
  };

  drawSummaryLine(isTamil ? "மொத்த தொகை (Gross):" : "Gross Amount:", formatCurrency(bill.gross_amount));

  if (Number(bill.discount_amount || 0) > 0) {
    drawSummaryLine(
      isTamil ? "தள்ளுபடி (Discount):" : "Discount Applied:",
      "-" + formatCurrency(bill.discount_amount),
      { color: "#059669", isBold: true }
    );
  }

  // Net Amount Box Highlight
  drawSummaryLine(
    isTamil ? "நிகர தொகை (Net Total):" : "Net Total Payable:",
    formatCurrency(bill.net_amount),
    { isBold: true, isLarge: true, color: "#1e3a8a", bgColor: "#eff6ff" }
  );

  drawSummaryLine(
    isTamil ? "பெறப்பட்ட தொகை (Paid):" : "Total Amount Paid:",
    formatCurrency(bill.paid_amount),
    { color: "#059669", isBold: true }
  );

  drawSummaryLine(
    isTamil ? "நிலுவைத் தொகை (Balance Due):" : "Balance Due / Pending:",
    formatCurrency(bill.pending_amount),
    {
      color: Number(bill.pending_amount || 0) > 0 ? "#d97706" : "#059669",
      isBold: true,
      isLarge: true,
      bgColor: Number(bill.pending_amount || 0) > 0 ? "#fffbeb" : "#ecfdf5",
    }
  );

  // Left Notes & Payment Info Card
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(marginX, summaryBoxY, notesBoxWidth, 230, 8);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.stroke();

  ctx.fillStyle = "#1e293b";
  ctx.font = `bold 12px ${fontSans}`;
  ctx.textAlign = "left";
  ctx.fillText(isTamil ? "வங்கி விவரங்கள் & குறிப்புகள்" : "BANK DETAILS & INSTRUCTIONS", marginX + 16, summaryBoxY + 26);

  ctx.fillStyle = "#475569";
  ctx.font = `11px ${fontSans}`;
  let notesY = summaryBoxY + 50;

  ctx.fillText("Bank Name: State Bank of India", marginX + 16, notesY);
  notesY += 18;
  ctx.fillText("A/C Name: Print Management Solutions", marginX + 16, notesY);
  notesY += 18;
  ctx.fillText("A/C No: 409988776655  |  IFSC: SBIN0001234", marginX + 16, notesY);
  notesY += 18;
  ctx.fillText("UPI ID: printmanagement@sbi", marginX + 16, notesY);
  notesY += 25;

  if (bill.notes) {
    ctx.fillStyle = "#1e293b";
    ctx.font = `bold 11px ${fontSans}`;
    ctx.fillText(isTamil ? "குறிப்புகள் (Notes):" : "Bill Notes / Remarks:", marginX + 16, notesY);
    notesY += 18;
    ctx.fillStyle = "#64748b";
    ctx.font = `11px ${fontSans}`;
    const noteLines = wrapText(ctx, bill.notes, notesBoxWidth - 32);
    for (const nl of noteLines.slice(0, 3)) {
      ctx.fillText(nl, marginX + 16, notesY);
      notesY += 16;
    }
  }

  cursorY += 250;

  // 6. Payment History Ledger (If payments exist)
  if (bill.payments && bill.payments.length > 0) {
    ctx.fillStyle = "#1e293b";
    ctx.font = `bold 12px ${fontSans}`;
    ctx.textAlign = "left";
    ctx.fillText(isTamil ? "பெறப்பட்ட கொடுப்பனவு வரலாறு" : "RECORDED PAYMENT RECEIPTS", marginX, cursorY);
    cursorY += 12;

    const payTableW = CANVAS_WIDTH - marginX * 2;
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(marginX, cursorY, payTableW, 26);

    ctx.fillStyle = "#475569";
    ctx.font = `bold 10px ${fontSans}`;
    ctx.fillText(isTamil ? "தேதி" : "DATE", marginX + 12, cursorY + 17);
    ctx.fillText(isTamil ? "கட்டண முறை" : "METHOD", marginX + 140, cursorY + 17);
    ctx.fillText(isTamil ? "குறிப்பு / UTR #" : "REF / UTR #", marginX + 280, cursorY + 17);
    ctx.textAlign = "right";
    ctx.fillText(isTamil ? "பெறப்பட்ட தொகை" : "AMOUNT PAID", marginX + payTableW - 12, cursorY + 17);

    cursorY += 26;

    for (const p of bill.payments.slice(0, 4)) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(marginX, cursorY, payTableW, 24);
      ctx.strokeStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.moveTo(marginX, cursorY + 24);
      ctx.lineTo(marginX + payTableW, cursorY + 24);
      ctx.stroke();

      ctx.fillStyle = "#334155";
      ctx.font = `10px ${fontMono}`;
      ctx.textAlign = "left";
      ctx.fillText(formatDate(p.payment_date), marginX + 12, cursorY + 16);

      ctx.font = `10px ${fontSans}`;
      ctx.fillText(p.payment_method.toUpperCase(), marginX + 140, cursorY + 16);

      ctx.fillStyle = "#64748b";
      ctx.fillText(p.reference_number || "-", marginX + 280, cursorY + 16);

      ctx.fillStyle = "#059669";
      ctx.font = `bold 10px ${fontMono}`;
      ctx.textAlign = "right";
      ctx.fillText(formatCurrency(p.amount), marginX + payTableW - 12, cursorY + 16);

      cursorY += 24;
    }
    cursorY += 15;
  }

  // 7. Footer: Terms & Authorized Signatory (Pinned to bottom)
  const footerY = CANVAS_HEIGHT - 130;

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX, footerY);
  ctx.lineTo(CANVAS_WIDTH - marginX, footerY);
  ctx.stroke();

  // Left: Terms
  ctx.fillStyle = "#64748b";
  ctx.font = `10px ${fontSans}`;
  ctx.textAlign = "left";
  ctx.fillText("Terms & Conditions:", marginX, footerY + 22);
  ctx.fillText("1. Goods received once cannot be returned without prior authorization.", marginX, footerY + 38);
  ctx.fillText("2. All payments must be cleared against the referenced bill number.", marginX, footerY + 54);
  ctx.fillText("3. This is a computer generated document.", marginX, footerY + 70);

  // Right: Signature
  ctx.textAlign = "right";
  ctx.fillStyle = "#0f172a";
  ctx.font = `bold 11px ${fontSans}`;
  ctx.fillText(`For ${companyName}`, CANVAS_WIDTH - marginX, footerY + 22);

  ctx.strokeStyle = "#94a3b8";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - marginX - 180, footerY + 74);
  ctx.lineTo(CANVAS_WIDTH - marginX, footerY + 74);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#64748b";
  ctx.font = `10px ${fontSans}`;
  ctx.fillText("Authorized Signatory", CANVAS_WIDTH - marginX, footerY + 90);

  // Bottom brand bar
  ctx.fillStyle = "#1e3a8a";
  ctx.fillRect(0, CANVAS_HEIGHT - 8, CANVAS_WIDTH, 8);

  const jpegBytes = await canvasToJpegBytes(canvas);

  return [
    {
      jpegBytes,
      widthPx: CANVAS_WIDTH,
      heightPx: CANVAS_HEIGHT,
    },
  ];
}
