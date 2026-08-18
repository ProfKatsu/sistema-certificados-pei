"use client";
import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function Admin() {
  const [pw, setPw] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(0);

  useEffect(() => {
    const saved = sessionStorage.getItem("pei-admin-password");
    if (saved) setPw(saved);
  }, []);

  async function loadCertificates(password = pw) {
    if (!password) return;
    const res = await fetch("/api/admin/list", { headers: { Authorization: `Bearer ${password}` }, cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items || []);
  }

  async function upload() {
    if (!file || !pw) return setMsg("Informe a senha administrativa e selecione um CSV.");
    setLoading(true); setMsg("");
    sessionStorage.setItem("pei-admin-password", pw);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (r) => {
        const participants = r.data as any[];
        const res = await fetch("/api/admin/import", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${pw}` }, body: JSON.stringify({ participants }) });
        const j = await res.json();
        setMsg(res.ok ? `Processamento concluído: ${j.count} certificado(s) disponível(is).` : `Erro: ${j.error}`);
        setLoading(false);
        if (res.ok) loadCertificates();
      },
      error: () => { setMsg("Não foi possível ler o CSV."); setLoading(false); }
    });
  }

  async function openAdminPdf(codigo: string) {
    const res = await fetch(`/api/admin/certificados/${encodeURIComponent(codigo)}/pdf`, { headers: { Authorization: `Bearer ${pw}` } });
    if (!res.ok) return setMsg("Não foi possível abrir o certificado.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  async function generateAll() {
    if (!pw) return setMsg("Informe a senha administrativa.");
    setLoading(true); setMsg(""); setGenerated(0);
    const res = await fetch("/api/admin/generate", { method: "POST", headers: { Authorization: `Bearer ${pw}` } });
    const data = await res.json();
    if (!res.ok) { setMsg(`Erro: ${data.error}`); setLoading(false); return; }
    setGenerated(data.count || 0);
    setMsg(`${data.count || 0} certificado(s) pronto(s) para emissão/download.`);
    setLoading(false);
    loadCertificates();
  }

  return (
    <main className="wrap">
      <div className="admin-header"><div><p className="eyebrow">ÁREA RESTRITA</p><h1>Painel administrativo</h1><p className="lead">Somente o administrador pode importar participantes e gerar os certificados.</p></div><a className="btn secondary" href="/">Área do participante</a></div>
      <div className="card">
        <label>Senha administrativa</label>
        <input className="input" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Senha definida na Vercel" />
        <label>Arquivo CSV de participantes</label>
        <input className="input" type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} />
        <div className="actions"><button className="btn" onClick={upload} disabled={loading}>{loading ? "Processando…" : "Importar participantes"}</button><button className="btn gold" onClick={generateAll} disabled={loading}>Gerar certificados</button></div>
        {msg && <div className="notice">{msg}</div>}
        {generated > 0 && <p className="small">Os certificados são gerados individualmente pelo sistema quando o PDF é solicitado. O participante não possui acesso à função de geração.</p>}
        <p className="small">Colunas aceitas: Nome completo, CPF, E-mail, Cargo/Função e URE.</p>
      </div>

      <div className="card">
        <div className="section-head"><div><h2>Certificados cadastrados</h2><p className="small">Consulta administrativa dos registros.</p></div><button className="btn secondary" onClick={() => loadCertificates()}>Atualizar</button></div>
        {items.length === 0 ? <p className="small">Informe a senha e importe uma lista para visualizar os registros.</p> : <div className="table-scroll"><table><thead><tr><th>Participante</th><th>Código</th><th>CPF</th><th>Ação</th></tr></thead><tbody>{items.map(item => <tr key={item.codigo}><td>{item.nome}</td><td><code>{item.codigo}</code></td><td>{item.cpf || "—"}</td><td><button className="link-button" onClick={() => openAdminPdf(item.codigo)}>Abrir PDF</button></td></tr>)}</tbody></table></div>}
      </div>
    </main>
  );
}
