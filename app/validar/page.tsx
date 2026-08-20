import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Validar({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const params = await searchParams;
  const codigo = (params.codigo || "").trim().toUpperCase();

  if (codigo) {
    redirect(`/validar/${encodeURIComponent(codigo)}`);
  }

  return (
    <main className="public-page">
      <div className="public-card">
        <p className="eyebrow">AUTENTICIDADE</p>
        <h1>Validar certificado</h1>
        <p className="lead">Digite o código exibido no certificado ou utilize o QR Code.</p>
        <form action="/validar" method="get">
          <label htmlFor="codigo">Código de validação</label>
          <input id="codigo" className="input" name="codigo" placeholder="PEI-2026-AB12-CD34" required />
          <button className="btn btn-large">Verificar autenticidade</button>
        </form>
        <div className="public-footer"><Link href="/">Voltar para consulta do participante</Link></div>
      </div>
    </main>
  );
}
