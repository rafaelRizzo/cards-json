---
name: new-component
description: Cria um componente React seguindo o padrão do projeto (Base UI/shadcn, um por arquivo, comentário de cabeçalho, tooltip, motion, estados de tela). Use quando o usuário pedir um componente, dialog, painel ou tela nova.
argument-hint: "<nome> <descrição curta>"
---

# new-component

Antes de escrever, leia `docs/conventions.md` e **um componente parecido já existente** em `src/components` para copiar o
jeito (por exemplo `Dashboard/card-row.tsx`, `Cards/share-card-dialog.tsx`, `confirm-action-dialog.tsx`).

## Onde colocar

- Área do dashboard → `src/components/Dashboard/`, cards → `Cards/`, links → `Links/`, login → `Login/`.
- Reutilizável em várias áreas → `src/components/` (raiz).
- Primitivo de UI → `src/components/ui/` (só se for do shadcn; prefira `pnpm dlx shadcn@latest add` com o registry base-nova).
- Arquivo em kebab-case, componente em PascalCase, **um componente por arquivo**.

## Checklist

1. Primeira linha: comentário em pt-BR dizendo para que serve o componente.
2. Código e props em inglês; textos de UI em pt-BR; imports com `@/`.
3. Props tipadas com `type Props = {...}`; nada de `any`.
4. Composição com `ui/*`; cores e espaços por tokens do tema; altura de controle `h-8` sem override.
5. Botão só com ícone → `Tip` + `aria-label`.
6. Dialog com 3 partes (`DialogHeader`, `DialogBody`, `DialogFooter`). Ação destrutiva → `ConfirmDeleteDialog` ou
   `ConfirmActionDialog`.
7. Se busca dados: usa um hook de `src/hooks`, nunca `supabase` direto. Trate **carregando** (skeleton com o formato do
   conteúdo), **vazio** (só depois de carregar) e **erro**.
8. Animação com os springs de `src/lib/motion.ts`; sem loops novos; cuidado com `overflow` em containers que animam `x/y`.
9. Acessibilidade: foco visível, rótulos, `role="status"` em skeletons, teclado funciona.
10. Rode a skill `check`.

## Entrega

Diga qual arquivo criou, onde foi usado e o que não foi verificado visualmente.
