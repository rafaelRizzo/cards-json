---
name: check
description: Roda a verificação de qualidade do projeto (Biome, TypeScript e build) e reporta o que falhou. Use antes de dar uma tarefa por pronta, antes de commit/PR, ou quando o usuário pedir "check", "validar", "ver se está tudo ok".
---

# check

Verificação padrão antes de entregar. Não há testes automatizados ainda, então estes três passos são o portão de qualidade.

## Passos

1. `pnpm format` — Biome corrige estilo e organiza imports. Anote o que ele mudou além do que você editou.
2. `pnpm typecheck` — `tsc -b` (TypeScript 7, strict). Corrija erros de verdade; não use `any`/`as`/`// @ts-ignore`.
3. `pnpm build` — `tsc -b && vite build`. Confirma que o bundle gera (inclui o plugin que regenera `routeTree.gen.ts`).

Rode em sequência e pare no primeiro que falhar: corrija e recomece daquele passo.

## Depois

- Se mexeu em `supabase/*.sql`: lembre que **não foi aplicado**; diga ao usuário o que rodar e em que ordem.
- Se mexeu em `cardFormSchema`: confira que os `CHECK` de `supabase/20261012153500_schema.sql`/`20261012153800_limits.sql` continuam iguais.
- Sempre diga o que **não** foi verificado (não há teste visual no navegador nem testes automáticos).

## Relato

Responda curto: passou/falhou por passo, erros com `arquivo:linha`, e o que ficou sem verificar. Nunca diga "tudo ok" se
algum passo foi pulado.
