# Segurança

## O que é público de propósito

O bundle do front carrega `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Qualquer pessoa as vê no navegador e
**isso é esperado**: a chave publishable só identifica o projeto. O que protege os dados é:

1. **RLS** em todas as tabelas, por `user_id`.
2. **Grants por coluna** (o cliente não escreve `user_id`/`id`).
3. **Funções `security definer`** para o que não pode ser livre (compartilhar, abrir link).
4. Login obrigatório: `anon` não tem acesso a nada.

## O que nunca pode aparecer no front ou no repo

- `service_role` / secret key do Supabase.
- Client Secret do Google (vive só no painel do Supabase, em Auth → Providers → Google).
- Arquivos `.env` reais, `TODO.md`, `test.md` (estão no `.gitignore`; confira antes de cada commit com `git status`).

Se um segredo foi parar em arquivo local, mantenha ignorado e, se houver qualquer chance de ter sido compartilhado,
**gere outro** no painel do provedor.

## Checklist para qualquer mudança

- [ ] Tabela/coluna nova tem RLS e grant mínimo (sem `grant all`)?
- [ ] Função `security definer` tem `set search_path = ''` e confere `auth.uid()` dentro?
- [ ] Entrada do usuário vai para filtro PostgREST? Usa `containsAnyOf`, não concatenação.
- [ ] Texto do usuário é renderizado como texto (React escapa), sem `dangerouslySetInnerHTML`?
- [ ] URL vinda de fora (`redirect`, avatar) passa por validação (`safeRedirect`, só `https`)?
- [ ] Limites do zod e do banco batem?
- [ ] Cache e query keys incluem `userId`, e o cache é limpo no logout?
- [ ] Nada sensível em `localStorage`, URL, `console.log` ou toast.
- [ ] Links externos usam `rel="noreferrer"`; imagens de terceiros usam `referrerPolicy`.

## Compartilhamento por link

- Só usuários logados abrem; sempre com validade (1–90 dias, teto também em `CHECK`).
- Um link por card; gerar de novo invalida o anterior.
- Só o dono cria e desativa. Links vencidos são apagados pelo `pg_cron`.
- O link expõe o **conteúdo** do card para quem estiver logado e tiver o token: avise isso na tela de compartilhar.

## Autenticação

- PKCE; `redirectTo` calculado a partir de caminho interno validado.
- Sessão fica no storage do supabase-js (padrão da biblioteca). Dados de cards ficam só na memória do Query.
- Logout limpa o cache do Query.
