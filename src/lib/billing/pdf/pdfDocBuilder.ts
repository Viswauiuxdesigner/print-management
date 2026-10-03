/**
 * Pure TypeScript Adobe PDF 1.4 document builder.
 * Takes one or more JPEG image byte buffers and compiles them into a standard,
 * 100% valid A4 PDF document blob without any external dependencies.
 */

export interface PdfImagePage {
  jpegBytes: Uint8Array;
  widthPx: number;
  heightPx: number;
}

/**
 * Encodes text string to ASCII/Latin1 Uint8Array
 */
function strToBytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}

/**
 * Combines multiple Uint8Arrays into a single contiguous Uint8Array
 */
function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Builds a standard A4 PDF document (595.28 x 841.89 points) containing one or more image pages.
 */
export function buildPdfFromJpegPages(pages: PdfImagePage[], title: string = "Invoice"): Blob {
  if (!pages || pages.length === 0) {
    throw new Error("Cannot build PDF with 0 pages");
  }

  // A4 dimensions in PostScript points (1 pt = 1/72 inch)
  const A4_WIDTH_PT = 595.28;
  const A4_HEIGHT_PT = 841.89;

  const chunks: Uint8Array[] = [];
  let currentOffset = 0;

  function write(bytes: Uint8Array) {
    chunks.push(bytes);
    currentOffset += bytes.length;
  }

  function writeStr(str: string) {
    write(strToBytes(str));
  }

  // PDF Header
  writeStr("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  const objectOffsets: number[] = [];
  let currentObjId = 1;

  // Object 1: Catalog
  const catalogObjId = currentObjId++;
  // Object 2: Pages (Parent)
  const pagesObjId = currentObjId++;

  const pageObjIds: number[] = [];
  const contentObjIds: number[] = [];
  const imageObjIds: number[] = [];

  for (let i = 0; i < pages.length; i++) {
    pageObjIds.push(currentObjId++);
    contentObjIds.push(currentObjId++);
    imageObjIds.push(currentObjId++);
  }

  // Write Object 1: Catalog
  objectOffsets[catalogObjId] = currentOffset;
  writeStr(`${catalogObjId} 0 obj\n<< /Type /Catalog /Pages ${pagesObjId} 0 R >>\nendobj\n`);

  // Write Object 2: Pages
  objectOffsets[pagesObjId] = currentOffset;
  const kidsList = pageObjIds.map((id) => `${id} 0 R`).join(" ");
  writeStr(`${pagesObjId} 0 obj\n<< /Type /Pages /Kids [${kidsList}] /Count ${pages.length} >>\nendobj\n`);

  // Write each Page, Content stream, and Image XObject
  for (let i = 0; i < pages.length; i++) {
    const pageObjId = pageObjIds[i];
    const contentObjId = contentObjIds[i];
    const imageObjId = imageObjIds[i];
    const imgData = pages[i];

    // Page object
    objectOffsets[pageObjId] = currentOffset;
    writeStr(
      `${pageObjId} 0 obj\n` +
        `<<\n` +
        `  /Type /Page\n` +
        `  /Parent ${pagesObjId} 0 R\n` +
        `  /MediaBox [0 0 ${A4_WIDTH_PT.toFixed(2)} ${A4_HEIGHT_PT.toFixed(2)}]\n` +
        `  /Contents ${contentObjId} 0 R\n` +
        `  /Resources <<\n` +
        `    /ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n` +
        `    /XObject << /Img1 ${imageObjId} 0 R >>\n` +
        `  >>\n` +
        `>>\n` +
        `endobj\n`
    );

    // Content stream (scales image to full A4 page)
    const contentStreamStr = `q\n${A4_WIDTH_PT.toFixed(2)} 0 0 ${A4_HEIGHT_PT.toFixed(2)} 0 0 cm\n/Img1 Do\nQ\n`;
    const contentStreamBytes = strToBytes(contentStreamStr);

    objectOffsets[contentObjId] = currentOffset;
    writeStr(
      `${contentObjId} 0 obj\n<< /Length ${contentStreamBytes.length} >>\nstream\n`
    );
    write(contentStreamBytes);
    writeStr(`\nendstream\nendobj\n`);

    // Image XObject with JPEG DCTDecode
    objectOffsets[imageObjId] = currentOffset;
    const imgHeader =
      `${imageObjId} 0 obj\n` +
      `<<\n` +
      `  /Type /XObject\n` +
      `  /Subtype /Image\n` +
      `  /Width ${imgData.widthPx}\n` +
      `  /Height ${imgData.heightPx}\n` +
      `  /ColorSpace /DeviceRGB\n` +
      `  /BitsPerComponent 8\n` +
      `  /Filter /DCTDecode\n` +
      `  /Length ${imgData.jpegBytes.length}\n` +
      `>>\n` +
      `stream\n`;

    writeStr(imgHeader);
    write(imgData.jpegBytes);
    writeStr(`\nendstream\nendobj\n`);
  }

  // Cross-reference table
  const startXrefOffset = currentOffset;
  const totalObjs = currentObjId; // from 0 to currentObjId - 1

  writeStr(`xref\n0 ${totalObjs}\n`);
  writeStr("0000000000 65535 f \n");

  for (let id = 1; id < totalObjs; id++) {
    const offset = objectOffsets[id] || 0;
    const offsetPadded = String(offset).padStart(10, "0");
    writeStr(`${offsetPadded} 00000 n \n`);
  }

  // Trailer
  const escapedTitle = title.replace(/[()\\]/g, "\\$&");
  writeStr(
    `trailer\n` +
      `<<\n` +
      `  /Size ${totalObjs}\n` +
      `  /Root ${catalogObjId} 0 R\n` +
      `  /Info << /Title (${escapedTitle}) /Creator (Print Management Billing System) >>\n` +
      `>>\n` +
      `startxref\n` +
      `${startXrefOffset}\n` +
      `%%EOF\n`
  );

  const finalPdfBytes = concatUint8Arrays(chunks);
  return new Blob([finalPdfBytes], { type: "application/pdf" });
}
