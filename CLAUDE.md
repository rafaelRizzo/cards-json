# cards-json

Gerenciador de textos prontos (scripts de atendimento, respostas e objeções) para copiar e colar. SPA em Vite, sem backend próprio: o front fala direto
com o Supabase (Google OAuth + Postgres com RLS). O projeto antigo (Next) foi movido para `odd/` (ignorado pelo git).

## Comandos

```bash
pnpm dev          # http://localhost:5173 (porta fixa: é a que está cadastrada no OAuth do Supabase)
pnpm typecheck    # tsc -b (TypeScript 7, strict)
pnpm lint         # biome check .
pnpm format       # biome check --write .
pnpm build        # tsc -b && vite build
```

Antes de dar uma tarefa por pronta: `pnpm format && pnpm typecheck && pnpm build`. Não há testes automatizados ainda.

## Stack

Vite 8 · React 19 · TypeScript strict · TanStack Router (file-based) + Query · Tailwind v4 (CSS-first) · shadcn/ui sobre
`@base-ui/react` (não Radix) · `motion/react` · react-hook-form + zod 4 · sonner · Supabase (supabase-js, PKCE) · Biome.

## Mapa do código

| Pasta | O que tem |
| --- | --- |
| `src/routes` | Rotas por arquivo. `_app.tsx` é o guard de login; `_app/index.tsx` é o dashboard. `routeTree.gen.ts` é gerado, nunca editar. |
| `src/hooks` | Acesso a dados (`use-cards`, `use-card-shares`) e utilitários de estado. Toda query/mutation do Supabase mora aqui. |
| `src/lib` | Código sem React: `supabase`, `auth`, `postgrest`, `mutation` (`withToast`), `motion`, `icons`, `format`. |
| `src/components/ui` | shadcn (Base UI). Alterar só para corrigir/estender; não personalizar por tela. |
| `src/components/{Cards,Dashboard,Links,Login}` | Componentes por área. Um componente por arquivo. |
| `supabase/*.sql` | Schema, sharing, cron e limites. **Rodados manualmente pelo dono no SQL Editor.** |
| `docs/` | Arquitetura, convenções, banco, segurança e roadmap. Leia antes de mudar algo estrutural. |

## Regras que não se negociam

1. **Nunca rodar SQL no banco** nem pedir/usar credenciais. Mudou o banco? Escreva/edite o `.sql` em `supabase/` e avise
   o usuário o que rodar e em que ordem. O usuário roda tudo manualmente.
2. **Nunca ler `.env`, `.env.*` (exceto `.env.example`) nem `TODO.md`/`test.md`**: têm segredos. Não repetir valores
   secretos em respostas, commits ou docs.
3. Só a chave **publishable** e a URL vão no front. `service_role` e o Client Secret do Google nunca entram no repo nem no
   bundle. A proteção real é RLS + grants por coluna (ver `docs/security.md`).
4. Mexeu em `cards`/`card_shares`? Mantenha **iguais** os limites do zod (`cardFormSchema`) e os `CHECK` do banco.
5. Não commitar nem abrir PR sem o usuário pedir (skills `commit` e `pr` existem para isso).

## Convenções (resumo; detalhes em `docs/conventions.md`)

- Código e identificadores em **inglês**; comentários, textos de UI, toasts e commits em **pt-BR**.
- Todo arquivo começa com um comentário de uma linha dizendo para que serve.
- Biome é a fonte do estilo: 4 espaços, sem ponto e vírgula, linha até 120. Rode `pnpm format`.
- Imports com alias `@/`. Nomes de arquivo em kebab-case; pastas de componentes em PascalCase (`Cards/`, `Dashboard/`).
- Mutations sempre via `withToast` (loading → sucesso/erro, nunca silencioso). Quem chama decide fechar o dialog.
- Controles com altura padrão (`h-8`), sem override por tela. Ícone-botão sempre com `Tip` + `aria-label`.
- Animações com os springs de `src/lib/motion.ts`; respeitar `reducedMotion` (já configurado no root). Sem loops novos.
- Estados de tela: loading (skeleton) ≠ vazio ≠ erro. Nunca mostrar "vazio" enquanto a primeira resposta não chegou.

## Skills e agentes do projeto

Skills (`.claude/skills`): `check` (qualidade antes de entregar), `new-component`, `add-card-field`, `db-change`.
Agentes (`.claude/agents`): `code-reviewer`, `security-auditor`, `db-reviewer`, `ux-reviewer`. Todos são somente leitura:
apontam problemas, quem corrige é a conversa principal.
