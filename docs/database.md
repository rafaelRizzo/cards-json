# Banco de dados (Supabase / Postgres 17)

> **O banco é alterado só pelo dono, manualmente, no SQL Editor do Supabase.** Quem edita código apenas escreve os
> arquivos `.sql` e avisa o que rodar. Nunca executar migration por código nem pedir credenciais.

## Scripts e ordem

Os arquivos levam timestamp no nome (`AAAAMMDDHHMMSS_assunto.sql`): **a ordem alfabética é a ordem de execução** e o
maior número é sempre o mais recente. Mudança nova vira arquivo novo (com o horário de criação); script já aplicado não
é reescrito. Como o banco é alterado à mão, esta tabela é o registro do que já foi aplicado: marque ao rodar.

| Ordem | Aplicado | Arquivo | O que faz |
| --- | --- | --- | --- |
| 1 | [x] | `supabase/20261012153500_schema.sql` | Função `uuid_generate_v7`, tabela `cards`, índice, RLS, grants por coluna. |
| 2 | [ ] | `supabase/20261012153600_sharing.sql` | Tabela `card_shares` e as funções `share_card`, `unshare_card`, `get_shared_card`. |
| 3 | [ ] | `supabase/20261012153700_cron.sql` | Job do `pg_cron` que apaga links vencidos (separado: falhar aqui não desfaz o sharing). |
| 4 | [ ] | `supabase/20261012153800_limits.sql` | `CHECK`s extras (formato, linha única, não-vazio, validade máxima). Rodar uma vez. |
| 5 | [x] | `supabase/20261012153900_pin.sql` | Coluna `pinned_at`, índice parcial, teto de 10 fixados e `updated_at` só em edição de conteúdo. |
| 6 | [ ] | `supabase/20261012154300_pin_hardening.sql` | Incremental do pin: trava a corrida no teto de 10, `pinned_at` com data do banco, erro `53400` e CHECK arquivado × fixado. |

Se o `20261012153500_schema.sql` foi rodado antes de existir `archived_at` (e ainda **não** rodou o `pin.sql`; depois dele,
esse `grant` tiraria o `pinned_at`, então inclua a coluna na lista):

```sql
alter table public.cards add column archived_at timestamptz;
revoke update on public.cards from authenticated;
grant update (title, content, icon, color, archived_at) on public.cards to authenticated;
```

## Modelo

- `cards`: `id` (uuid v7, índice-friendly), `user_id` (default `auth.uid()`), `title` 1–80, `content` 1–5.000,
  `icon`, `color`, `archived_at` (null = ativo), `pinned_at` (null = não fixado; máx. 10 por pessoa; arquivar solta),
  `created_at`, `updated_at` (só muda quando título, texto, ícone ou cor mudam).
- `card_shares`: um link por card (`card_id` PK), `token` uuid v4 único, `expires_at`, `created_at`.
- Status por coluna (`archived_at`), não por tabela: duas abas, uma tabela.

## Segurança do banco

- RLS ligada; políticas `user_id = (select auth.uid())` (o `select` faz o Postgres avaliar uma vez por consulta).
- `anon` sem acesso. `authenticated` com **grants por coluna**: o cliente não consegue trocar `user_id`, `id` ou datas.
- Funções `security definer` sempre com `set search_path = ''` e nomes qualificados (`public.`).
- O token de compartilhamento é segredo: v4 aleatório, nunca o id do card (v7 começa com o horário).
- `card_shares`: o cliente só lê as próprias linhas; criar/apagar/abrir passa pelas funções.

## Como mudar o banco

1. Edite ou crie o `.sql` em `supabase/` (idempotente quando possível; comente a pré-checagem se pode falhar com dados).
2. Atualize o código que depende: `cardFormSchema`, `COLUMNS`/`cardRowSchema` em `use-cards.ts`, tipos, formulário,
   exportação/importação (skill `add-card-field` cobre isso).
3. Passe o agente `db-reviewer` no SQL.
4. Diga ao usuário **o que rodar e em que ordem**, e o que muda para quem já rodou os scripts anteriores (`ALTER`).

## Pontos de atenção conhecidos

- A lista ordena por `pinned_at desc nulls last, created_at desc, id desc` com filtro de `archived_at`, mas o índice
  da listagem é `(user_id, created_at)` (o parcial de `pinned_at` só serve à contagem do teto de fixados). Em contas grandes, trocar por `(user_id, created_at desc, id desc)` evita ordenação extra.
- Busca é `ilike '%termo%'` em `title` e `content`: sem índice e sensível a acento. Passa de alguns milhares de cards?
  Avaliar `pg_trgm` (GIN) e `unaccent`.
- Sem teto de cards por usuário: existe um trigger opcional comentado em `20261012153800_limits.sql`.
- Data API devolve no máximo 1.000 linhas por resposta; qualquer "buscar tudo" precisa de lotes.
