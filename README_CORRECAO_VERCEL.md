# Correção do erro de build da Vercel

O projeto foi corrigido para reconhecer os imports no formato `@/lib/...`.

A causa do erro era a ausência do mapeamento de paths no `tsconfig.json`.

Foi adicionada a configuração:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./*"]
}
```

## Publicação no GitHub/Vercel

1. Substitua os arquivos do repositório por estes arquivos.
2. Faça commit e push para a branch `main`.
3. Na Vercel, faça um novo deploy.
4. Configure as variáveis de ambiente descritas em `.env.example`.

O restante da lógica do sistema permanece igual: consulta do participante por CPF/nome, geração restrita ao administrador e validação por QR Code.
