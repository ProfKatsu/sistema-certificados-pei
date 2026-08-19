# Certificados — Programa Ensino Integral

Sistema de certificados preparado para GitHub + Vercel + Supabase.

## Fluxo do sistema

### Participante
A página inicial é o portal do participante. Ele informa **CPF ou nome completo**, consulta um certificado já emitido e pode baixar somente o PDF do registro encontrado.

O participante não tem acesso à importação nem à geração de certificados.

### Administrador
Acesse `/admin` com a senha definida em `ADMIN_PASSWORD`.

O administrador pode:
- importar uma lista CSV;
- consultar os certificados cadastrados;
- gerar/processar os certificados disponíveis;
- abrir os PDFs individualmente.

Não existe funcionalidade de cancelamento no painel.

### Validação por QR Code
Cada PDF possui um QR Code que aponta para `/validar/{codigo}`. Essa página apenas confirma a autenticidade do registro; ela não substitui o portal do participante para localizar o certificado por CPF/nome.

## Supabase
1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute `supabase.sql`.

## Variáveis na Vercel
Configure:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_APP_URL`

**Nunca publique a `SUPABASE_SERVICE_ROLE_KEY` no GitHub.**

## GitHub/Vercel
Suba a pasta `sistema` para um repositório GitHub e importe o repositório na Vercel.

Os QR Codes já gerados neste pacote usam `https://certificados-pei-2026.vercel.app/validar/{codigo}`. Se o domínio final for diferente, defina `NEXT_PUBLIC_APP_URL` com o domínio final antes de gerar novos PDFs.

## CSV
Colunas aceitas: `Nome completo`, `CPF`, `E-mail`, `Cargo/Função` e `URE`.

O sistema deduplica por CPF e mantém o código existente quando o participante já estiver cadastrado.

## Deploy na Vercel

Configure estas variáveis em **Project Settings → Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_APP_URL`

Depois faça um novo deploy. O `SUPABASE_SERVICE_ROLE_KEY` deve permanecer apenas no ambiente da Vercel e nunca ser exposto no navegador.
