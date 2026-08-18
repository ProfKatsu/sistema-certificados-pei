create extension if not exists pgcrypto;

create table if not exists public.certificados (
 id uuid primary key default gen_random_uuid(),
 codigo text unique not null,
 nome text not null,
 cpf text,
 email text,
 cargo text,
 ure text,
 evento text not null,
 data_evento text not null,
 local text not null,
 hora text not null,
 status text not null default 'VALIDO',
 created_at timestamptz not null default now()
);

create index if not exists certificados_codigo_idx on public.certificados(codigo);
create index if not exists certificados_nome_idx on public.certificados(lower(nome));
create unique index if not exists certificados_cpf_unique_idx on public.certificados(cpf) where cpf is not null and cpf <> '';

alter table public.certificados enable row level security;
drop policy if exists "public can validate" on public.certificados;

-- O sistema acessa o banco somente pelo backend com a SERVICE ROLE KEY.
-- Não é necessário expor a tabela diretamente ao navegador.
