# Arquitetura

## Visão geral

```
Navegador (Vite SPA)
  ├─ TanStack Router  → rotas por arquivo, guard de login em _app.tsx
  ├─ TanStack Query   → cache em memória das chamadas ao Supabase
  └─ supabase-js ─────→ Supabase (Auth Google + PostgREST + RPC)
                          └─ Postgres: RLS por user_id, funções security definer, pg_cron
```

Não existe servidor nosso. Tudo que precisa ser garantido (dono do card, validade do link, limites) é garantido **no
banco**; a tela só avisa antes.

## Autenticação (`src/lib/auth.ts`, `src/main.tsx`)

- Login só com Google, fluxo **PKCE** (`flowType: "pkce"` em `src/lib/supabase.ts`). O implícito deixava `/#` na URL.
- `main.tsx` faz `await auth.getSession()` **antes** de criar o router: assim o `?code=` do retorno do Google é trocado
  por sessão antes de o router mexer na URL.
- `auth` expõe `getSession/getSnapshot/subscribe/signInWithGoogle/signOut`; `useSession()` assina via
  `useSyncExternalStore`. A sessão guarda só `{ id, name, email, avatarUrl }`.
- `avatarUrl` vem de `user_metadata.avatar_url ?? picture`, só `https`. O `<img>` usa `referrerPolicy="no-referrer"`
  porque o Google recusa a foto com referer do site.
- No `SIGNED_OUT`, `queryClient.clear()`: nada de um usuário sobra para o próximo.
- `redirect` pós-login passa por `safeRedirect` (só caminhos internos; evita open redirect).

## Rotas (`src/routes`)

| Rota | Arquivo | Notas |
| --- | --- | --- |
| `/login` | `login.tsx` | `validateSearch` aceita `redirect`. |
| `/` | `_app/index.tsx` | Dashboard. Search params: `q` (busca), `view` (`active`/`archived`). |
| `/links` | `_app/links.tsx` | Todos os links compartilhados do usuário; só o dono desativa. |
| `/s/$token` | `_app/s.$token.tsx` | Abre um card compartilhado (exige login). |

`_app.tsx` redireciona para `/login?redirect=<href>` quando não há sessão. Ele também é o **layout**: renderiza o
`AppHeader` uma vez e a página (`Outlet`) numa área que rola abaixo dele. O cabeçalho não pode ser renderizado dentro de cada
página, senão remonta e repete a animação de entrada a cada troca de rota.

## Dados e cache (`src/hooks`)

- Toda leitura/escrita passa por hooks; componentes não importam `supabase` direto.
- **Query keys** sempre com o `userId`: `["cards","list",userId,view,search]`, `["cards","counts",userId]`,
  `["card-shares", userId]`, `["shared-card",userId,token]`. Prefixo `["cards"]` invalida lista e contadores de uma vez.
- Lista: `useInfiniteQuery`, página de 30 (`PAGE_SIZE`), `count: "exact"`, ordenação `created_at desc, id desc`,
  busca no servidor (`.or(containsAnyOf(...))` em `src/lib/postgrest.ts`, que escapa `\ % _` e aspas).
- `placeholderData` mantém a lista anterior **só dentro da mesma aba** (evita piscar entre buscas, mas não mostra
  cards arquivados na aba de ativos).
- `staleTime` de 5 min, `refetchOnWindowFocus`, invalidação após cada mutation. Cache só em memória (sem persistência):
  texto de atendimento (que pode ter dados de clientes) não deve ficar em localStorage.
- Respostas do banco passam por zod (`cardRowSchema`): dado fora do formato vira erro, não tela quebrada.
- Exportação busca tudo em lotes de 1.000 (teto da Data API). Importação **acrescenta** e ignora itens inválidos.

## Compartilhamento

1. `share_card(card_id, days)` (RPC) cria/renova o link: token uuid v4, validade de 1 a 90 dias, só dono.
2. `get_shared_card(token)` (RPC) devolve o conteúdo se o token existe, não expirou e o chamador está logado.
3. `unshare_card(card_id)` (RPC) desativa; só o dono.
4. `pg_cron` apaga links vencidos (`supabase/20261012153700_cron.sql`).

## Interface

- Dashboard em duas colunas: lista (`card-list-pane`) e prévia (`card-preview`). Selecionar é imediato; editar abre o
  `card-form-dialog`.
- Estados da prévia: `PreviewSkeleton` (carregando) → `card-preview` → `EmptyPreview` (só quando a lista carregou vazia).
- Tema oklch em `src/index.css`; fontes Figtree (texto), Bricolage Grotesque (títulos), IBM Plex Mono (código).

## Migração do app antigo

O app anterior (Next, pasta `odd/`) guardava os cards no `localStorage`, chave `cards-storage`, no formato do persist do
zustand (`{ "state": { "cards": [...] }, "version": 0 }`; cada card `{ id, title, content, icon, color }`). Nunca usou
IndexedDB.

- `src/lib/legacy-cards.ts` lê essa chave (`readLegacyCards`), ajusta o card para o schema novo (`coerceLegacyCard`: descarta
  o `id` antigo, troca quebra de linha do título por espaço, usa ícone/cor padrão se não existirem) e guarda por usuário
  se a oferta foi `done` ou `dismissed`.
- `useLegacyImport` abre o `LegacyImportDialog` no primeiro acesso da conta; o item "Importar cards antigos" do menu
  reabre. Importar usa `importCards`, que **acrescenta** e nunca apaga; os dados do navegador ficam intactos.
- `importCards` passa por `coerceLegacyCard` também para arquivos JSON, então o arquivo exportado pelo app antigo importa.
- Só funciona se o app novo estiver na **mesma origem** (protocolo, domínio e porta) do antigo; senão o `localStorage` é
  outro e o caminho é exportar/importar o arquivo.
- Cards acima dos limites (título > 80, texto > 5.000) não são cortados: ficam de fora e o aviso lista os títulos.
