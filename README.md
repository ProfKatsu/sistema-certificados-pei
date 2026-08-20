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

Na **Área administrativa**, use **Adicionar participante** para cadastrar uma pessoa por vez informando apenas nome completo e CPF.

Por segurança e por uma limitação da Vercel, o servidor não grava permanentemente no sistema de arquivos durante a execução. Ao concluir o cadastro, o painel baixa um novo `participants.data.json` criptografado contendo **todos os participantes atuais + o novo participante**.

Substitua somente `data/participants.data.json` no GitHub e faça um novo deploy. A base anterior não é descartada: o arquivo baixado já contém os registros existentes preservados.

O sistema também impede o cadastro de CPF duplicado.

## Segurança

A chave `CERTIFICATE_DATA_KEY` nunca deve ser colocada no GitHub. O arquivo de dados no repositório contém somente o conteúdo criptografado.
