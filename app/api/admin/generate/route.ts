import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/auth";
import { getParticipants } from "@/lib/data-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const items = getParticipants().filter((p) => p.status === "VALIDO").map((p) => ({ codigo: p.codigo, nome: p.nome }));
    return NextResponse.json({ ok: true, count: items.length, items });
  } catch (error) {
    console.error("Erro ao preparar certificados:", error);
    return NextResponse.json({ error: "Não foi possível carregar os certificados." }, { status: 500 });
  }
}
