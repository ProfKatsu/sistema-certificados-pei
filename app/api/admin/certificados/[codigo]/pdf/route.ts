import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/auth";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
import { findByCode } from "@/lib/data-store";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  if (!checkAdmin(req)) return new NextResponse("Não autorizado", { status: 401 });
  const { codigo: rawCodigo } = await params;
  try {
    const data = findByCode(decodeURIComponent(rawCodigo));
    if (!data) return new NextResponse("Certificado não encontrado", { status: 404 });
    const bytes = await buildCertificatePdf(data, new URL(req.url).origin);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${data.codigo}.pdf"`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    console.error("Erro ao gerar PDF administrativo:", error);
    return NextResponse.json({ error: "Não foi possível gerar o certificado." }, { status: 500 });
  }
}
