# Convenções

Este projeto segue o padrão do repositório `eco` (Base UI + shadcn, TypeScript estrito, Biome).

## Estilo

- Biome decide: 4 espaços, sem `;`, aspas duplas, linha até 120. `pnpm format` corrige.
- Identificadores em inglês; comentários, mensagens de UI, toasts e commits em pt-BR.
- Comentário no topo de **cada** arquivo (1 linha: o que é e para quê). Comentários internos explicam o **porquê**, não o
  que o código já diz.
- Sem `any`, sem `as` para calar o compilador, sem `!` não justificado. Dado externo entra por zod.
- Um componente por arquivo; arquivo em kebab-case (`card-row.tsx`), componente em PascalCase (`CardRow`).
- Pastas de componentes por área em PascalCase (`Cards/`, `Dashboard/`); `ui/` é o shadcn.

## Componentes

- `ui/*` vem do shadcn sobre Base UI. Prefira compor a editar. Se precisar estender, faça no `ui/` para valer em todo
  lugar, não com `className` por tela.
- Dialog sempre com 3 partes (cabeçalho, corpo, rodapé); ações destrutivas usam `ConfirmDeleteDialog` /
  `ConfirmActionDialog`. Arquivar e apagar **sempre** pedem confirmação.
- Altura de controles: `h-8` (padrão do `Button`/`Input`). Não sobrescrever por tela.
- Botão só com ícone: `Tip` (tooltip) **e** `aria-label`.
- Cores e espaçamentos por tokens do tema (`bg-card`, `text-muted-foreground`...), nunca hex/oklch solto.

## Formulários

- `react-hook-form` + `zodResolver` + o schema de `use-cards.ts` (`cardFormSchema`). Uma fonte de verdade para limites.
- Campo com limite usa `FieldFooter`: dica/erro animados, contador e barra. O limite aparece **antes** de estourar.
- `mode: "onChange"` nos formulários de card para o contador e o erro reagirem enquanto digita.
- Os limites do zod espelham os `CHECK` do banco. Mudou um, mude o outro (`docs/database.md`).

## Dados

- Hooks em `src/hooks`; componentes recebem dados e callbacks por props ou chamam o hook, nunca `supabase` direto.
- Mutation = `useMutation` + `withToast` + `invalidateQueries`. Retorna `null`/`false` em erro, quem chama decide.
- Query key sempre inclui `userId`. Parse da resposta com zod.
- Busca no servidor com `containsAnyOf`; nunca montar filtro PostgREST concatenando texto do usuário.

## Estados de tela

| Estado | Como mostrar |
| --- | --- |
| Carregando a primeira vez | Skeleton com o formato do conteúdo (`PreviewSkeleton`, contadores das abas). |
| Atualizando | Manter o conteúdo anterior + indicador discreto (`fetching`). |
| Vazio | Só depois de a resposta chegar vazia. Texto diferente para "sem cards" e "busca sem resultado". |
| Erro | Toast com mensagem em pt-BR + `console.error` (o `withToast` já faz). |

## Animação (`src/lib/motion.ts`)

- Use os springs prontos (`spring`, `softSpring`, `hoverSpring`, `popIn`, `fadeUp`, `staggerContainer`).
- `hoverSpring` não tem bounce de propósito (evitava "puladinha" no fim do hover).
- Não criar animações em loop; elas só existem na tela de login e no estado vazio.
- `MotionConfig reducedMotion="user"` já respeita a preferência do sistema.
- Cuidado com `y`/`x` iniciais em containers: causam scroll da página; use `overflow-hidden` no contêiner.

## Git

Conventional Commits em pt-BR (`feat:`, `fix:`, `refactor:`, `docs:`...), como no histórico. Use a skill `commit`.
