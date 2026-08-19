import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/auth";
import { getParticipants } from "@/lib/data-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const items = getParticipants()
      .filter((p) => p.status === "VALIDO")
      .map(({ nomeBusca, ...p }) => p);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Erro ao listar participantes:", error);
    return NextResponse.json({ error: "Não foi possível carregar os dados." }, { status: 500 });
  }
}
