"use client";
import { useEffect, useState } from "react";

type Item = { codigo: string; nome: string; cpf: string | null; email: string | null; cargo: string | null; ure: string | null };

export default function Admin() {
  const [pw, setPw] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("pei-admin-password");
    if (saved) {
      setPw(saved);
      loadCertificates(saved);
    }
  }, []);

  async function loadCertificates(password = pw) {
    if (!password) return;
    setLoading(true);
    const res = await fetch("/api/admin/list", { headers: { Authorization: `Bearer ${password}` }, cache: "no-store" });
    const data = await res.json();
    if (!res.ok) setMsg(data.error || "Não foi possível carregar os participantes.");
    else { setItems(data.items || []); setMsg(""); }
    setLoading(false);
  }

  async function authenticate() {
    if (!pw) return setMsg("Informe a senha administrativa.");
    sessionStorage.setItem("pei-admin-password", pw);
    await loadCertificates(pw);
  }

  async function openAdminPdf(codigo: string) {
    const res = await fetch(`/api/admin/certificados/${encodeURIComponent(codigo)}/pdf`, { headers: { Authorization: `Bearer ${pw}` } });
    if (!res.ok) return setMsg("Não foi possível abrir o certificado.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  return (
    <main className="wrap">
      <div className="admin-header">
        <div><p className="eyebrow">ÁREA RESTRITA</p><h1>Painel administrativo</h1><p className="lead">Consulta e emissão dos certificados cadastrados para esta formação.</p></div>
        <a className="btn secondary" href="/">Área do participante</a>
      </div>

      <div className="card">
        <label>Senha administrativa</label>
        <input className="input" type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => { if (e.key === "Enter") authenticate(); }} placeholder="Senha definida na Vercel" />
        <div className="actions"><button className="btn" onClick={authenticate} disabled={loading}>{loading ? "Carregando…" : "Acessar dados"}</button><button className="btn secondary" onClick={() => loadCertificates()} disabled={loading}>Atualizar</button></div>
        {msg && <div className="notice">{msg}</div>}
        <p className="small">Os dados desta formação são armazenados no próprio projeto. Não é utilizado banco de dados externo.</p>
      </div>

      <div className="card">
        <div className="section-head"><div><h2>Certificados cadastrados</h2><p className="small">{items.length ? `${items.length} registro(s) disponível(is).` : "Informe a senha administrativa para visualizar os registros."}</p></div></div>
        {items.length > 0 && <div className="table-scroll"><table><thead><tr><th>Participante</th><th>Código</th><th>CPF</th><th>URE</th><th>Ação</th></tr></thead><tbody>{items.map(item => <tr key={item.codigo}><td>{item.nome}</td><td><code>{item.codigo}</code></td><td>{item.cpf || "—"}</td><td>{item.ure || "—"}</td><td><button className="link-button" onClick={() => openAdminPdf(item.codigo)}>Abrir PDF</button></td></tr>)}</tbody></table></div>}
      </div>
    </main>
  );
}
