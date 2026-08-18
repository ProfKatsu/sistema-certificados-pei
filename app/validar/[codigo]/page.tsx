import { createClient } from "@/lib/supabase";
import Link from "next/link";
export default async function Page({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const sb = createClient();
  const { data } = await sb.from("certificados").select("codigo,nome,evento,data_evento,local,hora,status,created_at").eq("codigo", codigo).maybeSingle();
  return <main className="public-page"><div className={"public-card validation "+(data?.status === "VALIDO" ? "valid" : "invalid")}>
    {data ? <><div className="seal">✓</div><p className="eyebrow">AUTENTICIDADE</p><h1>Certificado válido</h1><p className="lead">O código informado corresponde a um certificado registrado no sistema.</p><div className="certificate-data"><p><b>Participante</b><span>{data.nome}</span></p><p><b>Formação</b><span>{data.evento}</span></p><p><b>Data</b><span>{data.data_evento}</span></p><p><b>Horário</b><span>{data.hora}</span></p><p><b>Local</b><span>{data.local}</span></p><p><b>Código</b><span>{data.codigo}</span></p></div><Link className="btn secondary" href="/">Consultar outro certificado</Link></> : <><div className="seal invalid-seal">×</div><p className="eyebrow">AUTENTICIDADE</p><h1>Certificado não encontrado</h1><p className="lead">O código informado não corresponde a um certificado registrado.</p><Link className="btn" href="/validar">Tentar novamente</Link></>}
  </div></main>;
}
