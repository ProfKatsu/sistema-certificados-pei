# Sistema de Certificados — Programa Ensino Integral

Versão sem Supabase. Os dados dos participantes ficam armazenados de forma criptografada dentro do próprio projeto e são descriptografados somente no servidor da Vercel.

## Configuração na Vercel

Crie duas variáveis de ambiente em **Settings → Environment Variables**:

- `CERTIFICATE_DATA_KEY` — chave hexadecimal de 64 caracteres.
- `ADMIN_PASSWORD` — senha da área administrativa.

Depois de salvar, faça um novo deploy.

## Dados desta versão

A base foi gerada a partir da planilha de respostas do Google Forms enviada para o projeto. Foram incorporados 65 participantes únicos (70 respostas na planilha; duplicidades por CPF foram consolidadas, mantendo a resposta mais recente).

A planilha original não é incluída no repositório. Os dados são armazenados em `data/participants.data.json` em formato criptografado.

## Atualização dos participantes

Como a Vercel não mantém alterações permanentes no sistema de arquivos durante a execução, a base deve ser atualizada no arquivo de dados e publicada em um novo deploy. O painel administrativo é somente de consulta/emissão.

## Segurança

A chave `CERTIFICATE_DATA_KEY` nunca deve ser colocada no GitHub. O arquivo de dados no repositório contém somente o conteúdo criptografado.
