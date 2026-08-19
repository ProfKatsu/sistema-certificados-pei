import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { checkAdmin } from "@/lib/auth";
import { buildCertificatePdf } from "@/lib/certificate-pdf";

export async function GET(req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  if (!checkAdmin(req)) return new NextResponse("Não autorizado", { status: 401 });
  const { codigo } = await params;
  const sb = createClient();
  const { data, error } = await sb.from("certificados").select("*").eq("codigo", codigo).eq("status", "VALIDO").maybeSingle();
  if (error) return NextResponse.json({ error: "Não foi possível consultar o certificado." }, { status: 500 });
  if (!data) return new NextResponse("Certificado não encontrado", { status: 404 });
  const bytes = await buildCertificatePdf(data);
  return new NextResponse(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${data.codigo}.pdf"`, "Cache-Control": "private, no-store" } });
}
