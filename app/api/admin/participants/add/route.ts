import { NextResponse } from "next/server";
import crypto from "crypto";
import { checkAdmin } from "@/lib/auth";
import { encryptParticipants, getParticipants, normalizeCpf, normalizeName, type Participant } from "@/lib/data-store";

export const runtime = "nodejs";

function isValidCpf(cpf: string) {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  return digit === Number(cpf[10]);
}

function createCode(existing: Set<string>) {
  let code = "";
  do {
    code = `PEI-2026-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  } while (existing.has(code));
  return code;
}

export async function POST(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const nome = String(body?.nome || "").trim().replace(/\s+/g, " ");
    const cpf = normalizeCpf(String(body?.cpf || ""));

    if (nome.length < 5) {
      return NextResponse.json({ error: "Informe o nome completo do participante." }, { status: 400 });
    }
    if (!isValidCpf(cpf)) {
      return NextResponse.json({ error: "Informe um CPF válido com 11 dígitos." }, { status: 400 });
    }

    const participants = getParticipants();
    if (participants.some((p) => normalizeCpf(p.cpf) === cpf)) {
      return NextResponse.json({ error: "Este CPF já está cadastrado na base de participantes." }, { status: 409 });
    }

    const reference = participants.find((p) => p.status === "VALIDO") || participants[0];
    if (!reference) {
      return NextResponse.json({ error: "A base atual de participantes está vazia." }, { status: 500 });
    }

    const code = createCode(new Set(participants.map((p) => p.codigo.toUpperCase())));
    const participant: Participant = {
      codigo: code,
      nome,
      nomeBusca: normalizeName(nome),
      cpf,
      email: null,
      cargo: null,
      ure: reference.ure || null,
      evento: reference.evento,
      data_evento: reference.data_evento,
      local: reference.local,
      hora: reference.hora,
      status: "VALIDO"
    };

    const updated = [...participants, participant];
    const encrypted = encryptParticipants(updated);

    return new NextResponse(JSON.stringify(encrypted, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="participants.data.json"`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    console.error("Erro ao adicionar participante:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível adicionar o participante." }, { status: 500 });
  }
}
