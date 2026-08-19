"use client";
import { FormEvent, useState } from "react";

export default function Home() {
  const [tipo, setTipo] = useState<"cpf" | "nome">("cpf");
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function buscar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setResultados([]);
    const termo = valor.trim();
    if (!termo) return setErro("Informe o CPF ou nome para continuar.");
    if (tipo === "cpf" && termo.replace(/\D/g, "").length < 11) {
      return setErro("Informe um CPF válido com 11 dígitos.");
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/participante/buscar?tipo=${tipo}&valor=${encodeURIComponent(termo)}`);
      const data = await res.json();
      if (!res.ok) setErro(data.error || "Não foi possível realizar a consulta.");
      else if (!data.items?.length) setErro("Nenhum certificado foi encontrado para os dados informados.");
      else setResultados(data.items);
    } catch {
      setErro("Não foi possível consultar o sistema. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="public-page">
      <div className="public-card">
        <div className="brand-mark">PEI</div>
        <p className="eyebrow">PROGRAMA ENSINO INTEGRAL</p>
        <h1>Encontre seu certificado</h1>
        <p className="lead">Informe seu CPF ou nome completo para consultar e baixar o certificado da formação.</p>

        <div className="tabs" role="tablist" aria-label="Forma de consulta">
          <button className={tipo === "cpf" ? "tab active" : "tab"} onClick={() => { setTipo("cpf"); setValor(""); setErro(""); }}>CPF</button>
          <button className={tipo === "nome" ? "tab active" : "tab"} onClick={() => { setTipo("nome"); setValor(""); setErro(""); }}>Nome</button>
        </div>

        <form onSubmit={buscar}>
          <label htmlFor="consulta">{tipo === "cpf" ? "CPF do participante" : "Nome completo do participante"}</label>
          <input id="consulta" className="input" value={valor} onChange={(e) => setValor(e.target.value)} placeholder={tipo === "cpf" ? "000.000.000-00" : "Digite seu nome completo"} autoComplete="off" />
          <button className="btn btn-large" disabled={loading}>{loading ? "Consultando…" : "Consultar certificado"}</button>
        </form>

        {erro && <div className="notice error">{erro}</div>}

        {resultados.length > 0 && (
          <div className="results">
            <h2>Certificado encontrado</h2>
            {resultados.map((item) => (
              <div className="result-item" key={item.codigo}>
                <div>
                  <strong>{item.nome}</strong>
                  <span>{item.evento}</span>
                  <small>{item.data_evento} · {item.local}</small>
                </div>
                <a className="btn" href={item.downloadUrl}>Baixar PDF</a>
              </div>
            ))}
          </div>
        )}

        <p className="privacy">Se houver mais de uma pessoa com o mesmo nome, o sistema solicitará a consulta pelo CPF para proteger o acesso ao certificado.</p>
        <div className="public-footer"><a href="/validar">Validar certificado por código</a><span>·</span><a href="/admin">Área administrativa</a></div>
      </div>

      <footer className="site-footer" aria-label="Informações de direitos autorais">
        <span>© 2026 Todos os direitos reservados.</span>
        <span className="site-footer-separator">·</span>
        <span>Desenvolvido por Katsusuke Yamazaki Filho</span>
      </footer>
    </main>
  );
}
