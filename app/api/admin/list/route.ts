import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { checkAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const sb = createClient();
  const { data, error } = await sb.from("certificados").select("codigo,nome,cpf,email,cargo,ure,evento,data_evento,local,hora,status,created_at").order("created_at", { ascending: false }).limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}
