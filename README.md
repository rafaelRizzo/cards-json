# Cards

Seus textos prontos de atendimento (scripts, respostas, objeções) a um clique de distância: guarde, busque, clique e cole.

Aplicação web de página única (SPA) em Vite, sem backend próprio. O front fala direto com o
[Supabase](https://supabase.com): login com Google e dados no Postgres, isolados por usuário com RLS.

## Recursos

- Login com Google (OAuth, fluxo PKCE) e foto da conta no avatar.
- Cards com título, texto, ícone e cor; prévia ao vivo no formulário e limites visíveis (80 e 5.000 caracteres).
- Lista paginada com busca no servidor (com debounce), contadores por aba e carregamento com skeletons.
- Arquivar e restaurar; apagar. As duas ações pedem confirmação.
- Copiar com um clique ou com `Enter` na busca.
- Compartilhamento por link: só para quem está logado, com validade (1 a 90 dias) e página para ver e desativar
  todos os seus links.
- Importar e exportar em JSON, inclusive o arquivo exportado pela versão antiga.
- **Migração da versão antiga**: se o navegador ainda tiver cards do app anterior (`localStorage`), o app oferece
  importá-los logo após o login.
- Tema claro e escuro, animações com respeito a `prefers-reduced-motion`.

## Stack

Vite · React 19 · TypeScript (strict) · TanStack Router e Query · Tailwind CSS v4 · shadcn/ui sobre Base UI · Motion ·
react-hook-form + Zod · Supabase · Biome · pnpm.

## Como rodar

Requisitos: Node.js 20+ e [pnpm](https://pnpm.io).

```bash
pnpm install
cp .env.example .env   # preencha as duas variáveis (veja abaixo)
pnpm dev               # http://localhost:5173
```

A porta é fixa (`5173`) porque é a cadastrada nas URLs de redirecionamento do OAuth.

### Variáveis de ambiente

| Variável | Valor |
| --- | --- |
| `VITE_SUPABASE_URL` | URL do projeto, em Project Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave **publishable** (pública por desenho; a proteção é o RLS) |

Nunca coloque `service_role`, a secret key do Supabase ou o Client Secret do Google no front nem no repositório.

### Configurar o Supabase

1. **Auth → Providers → Google**: ative e informe o Client ID e o Client Secret criados no Google Cloud (o secret
   fica só no painel do Supabase). Use como URI de redirecionamento do Google a URL de callback mostrada pelo Supabase.
2. **Auth → URL Configuration**: Site URL `http://localhost:5173` e, em Redirect URLs, `http://localhost:5173/**`
   (acrescente o domínio de produção quando publicar).
3. **SQL Editor**: rode os scripts de `supabase/`, **nesta ordem**, revisando antes de cada um:

   | Ordem | Arquivo | O que faz |
   | --- | --- | --- |
   | 1 | `20261012153500_schema.sql` | Tabela `cards`, índice, RLS e permissões por coluna |
   | 2 | `20261012153600_sharing.sql` | Tabela `card_shares` e as funções de compartilhar, desativar e abrir link |
   | 3 | `20261012153700_cron.sql` | Job do `pg_cron` que apaga links vencidos |
   | 4 | `20261012153800_limits.sql` | Regras extras (formato, linha única, validade máxima) |

   Os scripts são executados manualmente; o app nunca altera o banco.

## Scripts

```bash
pnpm dev         # servidor de desenvolvimento
pnpm build       # tsc -b && vite build
pnpm preview     # serve o build localmente
pnpm typecheck   # tsc -b
pnpm lint        # biome check .
pnpm format      # biome check --write .
```

## Estrutura

```
src/
  routes/        rotas por arquivo (TanStack Router); _app.tsx protege as páginas logadas
  hooks/         acesso a dados (cards, links), sessão, busca com debounce
  lib/           supabase, auth, helpers sem React
  components/    ui/ (shadcn) e componentes por área (Cards, Dashboard, Links, Login)
supabase/        scripts SQL
docs/            arquitetura, convenções, banco, segurança e roadmap
```

## Migrando da versão antiga

A versão anterior (Next.js) guardava os cards no `localStorage` do navegador, na chave `cards-storage`. Ao entrar na
conta, se o app achar esses cards no mesmo navegador e endereço, ele pergunta se você quer importá-los. Eles são
**adicionados** à conta e nada é apagado do navegador. A pergunta aparece uma vez por conta e, se dispensada, o
item **Importar cards antigos** continua no menu da conta.

Se o app novo estiver em outro endereço (ou outro navegador), o `localStorage` antigo não é visível. Nesse caso,
exporte pelo app antigo (menu → Exportar Cards) e use **Importar cards** no menu da conta: o arquivo antigo é aceito.

## Documentação

Detalhes em [`docs/`](docs/README.md). O resumo para quem contribui (ou usa o Claude Code) está em
[`CLAUDE.md`](CLAUDE.md).

## Licença

[MIT](LICENSE) © Rafael Rizzo
