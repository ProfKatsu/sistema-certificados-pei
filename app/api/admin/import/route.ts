import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { checkAdmin } from "@/lib/auth";
import crypto from "crypto";

function normalize(p: any, key: string) { return String(p[key] ?? "").trim(); }

export async function POST(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();
  const participants = Array.isArray(body.participants) ? body.participants : [];
  if (!participants.length) return NextResponse.json({ error: "O CSV não contém participantes." }, { status: 400 });

  const map = new Map<string, any>();
  for (const p of participants) {
    const nome = normalize(p, "nome") || normalize(p, "Nome completo");
    if (!nome) continue;
    const cpf = (normalize(p, "cpf") || normalize(p, "CPF")).replace(/\D/g, "");
    const key = cpf || nome.toLocaleLowerCase("pt-BR");
    map.set(key, p);
  }

  const sb = createClient();
  const rows: any[] = [];
  for (const p of map.values()) {
    const nome = normalize(p, "nome") || normalize(p, "Nome completo");
    const cpfRaw = (normalize(p, "cpf") || normalize(p, "CPF")).replace(/\D/g, "");
    const email = normalize(p, "email") || normalize(p, "E-mail");
    const cargo = normalize(p, "cargo") || normalize(p, "Cargo/Função");
    const ure = normalize(p, "ure") || normalize(p, "URE");
    let existing: any = null;
    if (cpfRaw) {
      const found = await sb.from("certificados").select("codigo").eq("cpf", cpfRaw).maybeSingle();
      existing = found.data;
    } else {
      const found = await sb.from("certificados").select("codigo").ilike("nome", nome).maybeSingle();
      existing = found.data;
    }
    rows.push({
      codigo: existing?.codigo || `PEI-2026-${crypto.randomBytes(2).toString("hex").toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
      nome, cpf: cpfRaw || null, email: email || null, cargo: cargo || null, ure: ure || null,
      evento: "Programa Ensino Integral: Educação Humanizada", data_evento: "15 de agosto de 2026", local: "Mogi das Cruzes – SP", hora: "08H", status: "VALIDO"
    });
  }

  let count = 0;
  const saved: any[] = [];
  for (const row of rows) {
    let existingCode: string | null = null;
    if (row.cpf) {
      const found = await sb.from("certificados").select("codigo").eq("cpf", row.cpf).maybeSingle();
      if (found.data?.codigo) existingCode = found.data.codigo;
    } else {
      const found = await sb.from("certificados").select("codigo").ilike("nome", row.nome).maybeSingle();
      if (found.data?.codigo) existingCode = found.data.codigo;
    }
    const payload = existingCode ? { ...row, codigo: existingCode } : row;
    const result = existingCode
      ? await sb.from("certificados").update(payload).eq("codigo", existingCode).select("codigo,nome").single()
      : await sb.from("certificados").insert(payload).select("codigo,nome").single();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    count += 1;
    saved.push(result.data);
  }
  return NextResponse.json({ ok: true, count, items: saved });
}
