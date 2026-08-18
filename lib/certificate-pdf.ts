import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "path";

export async function buildCertificatePdf(data: any) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([841.89, 595.28]);
  const bg = await fs.readFile(path.join(process.cwd(), "public", "certificado-modelo.jpg"));
  const img = await pdf.embedJpg(bg);
  page.drawImage(img, { x: 0, y: 0, width: 841.89, height: 595.28 });

  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  let size = 24;
  while (bold.widthOfTextAtSize(data.nome, size) > 470 && size > 12) size -= 0.5;
  page.drawText(data.nome, { x: 390 - bold.widthOfTextAtSize(data.nome, size) / 2, y: 336, size, font: bold, color: rgb(0.043, 0.396, 0.373) });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const qr = await QRCode.toDataURL(`${baseUrl}/validar/${data.codigo}`, { margin: 2, width: 200, color: { dark: "#000000", light: "#ffffff" } });
  const b64 = qr.split(",")[1];
  const qri = await pdf.embedPng(Buffer.from(b64, "base64"));
  page.drawImage(qri, { x: 688, y: 145, width: 60, height: 60 });
  page.drawText("VALIDAÇÃO", { x: 702, y: 137, size: 5.5, font: regular, color: rgb(0.043, 0.396, 0.373) });
  page.drawText(data.codigo, { x: 674, y: 126, size: 5.5, font: regular, color: rgb(0.043, 0.396, 0.373) });

  return pdf.save();
}
