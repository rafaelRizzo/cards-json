---
name: db-change
description: Escreve ou altera SQL do Supabase (tabela, policy, função, índice, cron) com segurança, sem aplicar nada. Use quando o usuário pedir mudança no banco, nova tabela, índice, RLS ou função RPC.
argument-hint: "<o que mudar>"
---

# db-change

O usuário roda **todo** SQL manualmente no SQL Editor. Você só escreve arquivos em `supabase/` e explica. Nunca peça
senha/URL de conexão, nunca use CLI/MCP para aplicar, nunca leia `.env`.

## Antes

Leia `docs/database.md`, `docs/security.md` e o `.sql` que você vai tocar. Entenda o que já foi rodado (pergunte se a
mudança depende disso, ex.: se `20261012153600_sharing.sql` já foi aplicado).

## Regras do SQL

- **Nome do arquivo novo**: `supabase/<AAAAMMDDHHMMSS>_<assunto>.sql`, com o horário de agora (`date +%Y%m%d%H%M%S`),
  para a ordem de execução ser a ordem alfabética. Nunca renomeie nem reescreva um script já aplicado: mudança
  nova é arquivo novo (um `alter`). Atualize a tabela "Scripts e ordem" em `docs/database.md`.

- Tabela nova: `enable row level security` + policies por `(select auth.uid())` + `revoke all ... from anon` + `grant`
  **mínimo** (por coluna em insert/update).
- Função `security definer`: `set search_path = ''`, nomes qualificados (`public.`), confere `auth.uid()` dentro, `revoke`
  de `public` e `grant execute` só a `authenticated`.
- Valide no banco o que o zod valida na tela (`CHECK`), com os mesmos limites.
- Índice: justifique pela consulta (`where`/`order by` reais de `use-cards.ts`/`use-card-shares.ts`). `create index` em tabela
  grande bloqueia escrita: sugira `concurrently` quando fizer sentido (fora de transação).
- Erros úteis: `raise exception '...' using errcode = '...'` com mensagem em pt-BR.
- `pg_cron` em arquivo separado (`20261012153700_cron.sql`), para uma falha ali não desfazer o resto.
- Mudança destrutiva (drop/alter type/delete): escreva uma **pré-checagem** (`select` que lista o que seria afetado) no
  topo, comentada, como no `20261012153800_limits.sql`.

## Depois

1. Atualize o código que depende (`use-cards.ts`, `use-card-shares.ts`, tipos, zod).
2. Atualize `docs/database.md` (ordem dos scripts e modelo).
3. Rode o agente `db-reviewer` no SQL.
4. Entregue ao usuário: **qual arquivo rodar, em que ordem, o `ALTER` para quem já rodou a versão anterior, e a
   consulta de conferência** do resultado. Deixe explícito que nada foi aplicado.
