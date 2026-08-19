import { NextResponse } from "next/server";
import { createParticipantToken } from "@/lib/access-token";
import { getParticipants, normalizeCpf, normalizeName } from "@/lib/data-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tipo = url.searchParams.get("tipo");
    const valor = (url.searchParams.get("valor") || "").trim();

    if (!valor || !["cpf", "nome"].includes(tipo || "")) {
      return NextResponse.json({ error: "Consulta inválida." }, { status: 400 });
    }

    const participants = getParticipants().filter((p) => p.status === "VALIDO");
    let items;

    if (tipo === "cpf") {
      const cpf = normalizeCpf(valor);
      if (cpf.length !== 11) return NextResponse.json({ error: "Informe um CPF válido com 11 dígitos." }, { status: 400 });
      items = participants.filter((p) => p.cpf === cpf);
    } else {
      if (valor.length < 4) return NextResponse.json({ error: "Informe o nome completo do participante." }, { status: 400 });
      const name = normalizeName(valor);
      items = participants.filter((p) => p.nomeBusca === name);
    }

    if (tipo === "nome" && items.length > 1) {
      return NextResponse.json({
        error: "Há mais de um certificado cadastrado com esse nome. Por segurança, faça a consulta utilizando o CPF."
      }, { status: 409 });
    }

    return NextResponse.json({
      items: items.map((item) => ({
        codigo: item.codigo,
        nome: item.nome,
        evento: item.evento,
        data_evento: item.data_evento,
        local: item.local,
        hora: item.hora,
        downloadUrl: `/api/participante/${encodeURIComponent(item.codigo)}/pdf?token=${encodeURIComponent(createParticipantToken(item.codigo))}`
      }))
    });
  } catch (error) {
    console.error("Erro na consulta de participantes:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível consultar os dados dos participantes."
    }, { status: 500 });
  }
}
