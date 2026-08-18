import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { checkAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const sb = createClient();
  const { data, error } = await sb.from("certificados").select("codigo,nome").eq("status", "VALIDO").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: data?.length || 0, items: data || [] });
}
