import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
import { verifyParticipantToken } from "@/lib/access-token";

export async function GET(req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const token = new URL(req.url).searchParams.get("token") || "";
  if (!verifyParticipantToken(codigo, token)) return new NextResponse("Acesso ao certificado expirado ou não autorizado", { status: 403 });
  const sb = createClient();
  const { data, error } = await sb.from("certificados").select("*").eq("codigo", codigo).eq("status", "VALIDO").maybeSingle();
  if (error) return NextResponse.json({ error: "Não foi possível consultar o certificado." }, { status: 500 });
  if (!data) return new NextResponse("Certificado não encontrado", { status: 404 });
  const bytes = await buildCertificatePdf(data);
  return new NextResponse(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${data.codigo}.pdf"`, "Cache-Control": "private, no-store" } });
}
