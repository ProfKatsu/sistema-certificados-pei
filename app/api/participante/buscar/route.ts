import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { createParticipantToken } from "@/lib/access-token";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tipo = url.searchParams.get("tipo");
  const valor = (url.searchParams.get("valor") || "").trim();
  if (!valor || !["cpf", "nome"].includes(tipo || "")) return NextResponse.json({ error: "Consulta inválida." }, { status: 400 });

  const sb = createClient();
  let query = sb.from("certificados").select("codigo,nome,evento,data_evento,local,hora,status").eq("status", "VALIDO");
  if (tipo === "cpf") {
    const cpf = valor.replace(/\D/g, "");
    if (cpf.length !== 11) return NextResponse.json({ error: "Informe um CPF válido com 11 dígitos." }, { status: 400 });
    query = query.eq("cpf", cpf);
  } else {
    if (valor.length < 4) return NextResponse.json({ error: "Informe o nome completo do participante." }, { status: 400 });
    query = query.ilike("nome", valor);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Erro ao consultar os certificados." }, { status: 500 });
  const items = data || [];
  if (tipo === "nome" && items.length > 1) return NextResponse.json({ error: "Há mais de um certificado cadastrado com esse nome. Por segurança, faça a consulta utilizando o CPF." }, { status: 409 });
  return NextResponse.json({ items: items.map(item => ({ ...item, downloadUrl: `/api/participante/${encodeURIComponent(item.codigo)}/pdf?token=${encodeURIComponent(createParticipantToken(item.codigo))}` })) });
}
