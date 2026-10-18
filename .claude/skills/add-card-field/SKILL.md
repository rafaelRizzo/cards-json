---
name: add-card-field
description: Adiciona ou altera um campo da tabela cards de ponta a ponta (SQL, zod, hook, formulário, prévia, exportação/importação). Use quando o usuário pedir um campo novo no card (tag, fixado, categoria...) ou mudar limites de title/content.
argument-hint: "<campo> <tipo> <limite/regras>"
---

# add-card-field

Um campo de card atravessa várias camadas. Esquecer uma delas gera dado quebrado ou tela divergente do banco. **Nunca
execute SQL**: escreva o arquivo e diga ao usuário o que rodar.

## Camadas (nessa ordem)

1. **Banco** — `supabase/`
   - Coluna nova: crie um arquivo de migração novo (ex.: `supabase/<AAAAMMDDHHMMSS>_<campo>.sql`, timestamp de `date +%Y%m%d%H%M%S`) com `alter table public.cards add column ...`
     e `CHECK` de formato/limite. Mantenha o `20261012153500_schema.sql` coerente para quem criar o banco do zero.
   - Grants por coluna: inclua o campo em `grant insert (...)` / `grant update (...)` (hoje `revoke update` + `grant update (...)`).
   - Não use `grant all`. Não mexa em `user_id`/`id`.
2. **Schema do front** — `src/hooks/use-cards.ts`
   - `cardFormSchema` (limite e mensagem pt-BR iguais ao `CHECK`), `COLUMNS`, `cardRowSchema` (snake_case → camelCase),
     tipo `Card`/`CardForm`.
   - Se for exibido/ordenado na lista: confira `fetchCardsPage` e a query key.
3. **Formulário** — `src/components/Cards/card-form-dialog.tsx`
   - Campo com limite usa `FieldFooter`. Valores padrão do `defaultValues`. Prévia ao vivo em `card-live-preview.tsx`.
4. **Exibição** — `Dashboard/card-row.tsx` e `Dashboard/card-preview.tsx`.
5. **Exportar/importar** — `src/lib/cards-file.ts` e `fetchAllForExport`/`importMutation` em `use-cards.ts`. O arquivo
   exportado **não** leva `id`; arquivos antigos (sem o campo novo) precisam continuar importando (campo opcional/default).
6. **Compartilhamento** — se o campo deve aparecer no link, atualize `get_shared_card` (SQL) e `useSharedCard`.
7. **Docs** — atualize `docs/database.md` (modelo) se o schema mudou.

## Fechamento

- Rode a skill `check`.
- Rode o agente `db-reviewer` no SQL novo.
- Entregue com: arquivos alterados, **o SQL que o usuário precisa rodar (e a ordem)** e o que é preciso fazer com dados
  já existentes.
