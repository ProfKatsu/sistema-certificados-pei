import { NextResponse } from "next/server";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
import { verifyParticipantToken } from "@/lib/access-token";
import { findByCode } from "@/lib/data-store";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo: rawCodigo } = await params;
  const codigo = decodeURIComponent(rawCodigo).trim().toUpperCase();
  const token = new URL(req.url).searchParams.get("token") || "";

  if (!verifyParticipantToken(codigo, token)) {
    return new NextResponse("Acesso ao certificado expirado ou não autorizado", { status: 403 });
  }

  try {
    const data = findByCode(codigo);
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
    console.error("Erro ao gerar certificado:", error);
    return NextResponse.json({ error: "Não foi possível gerar o certificado." }, { status: 500 });
  }
}
