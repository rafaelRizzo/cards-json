-- Schema dos cards: uma tabela, isolada por usuário via RLS. Rodar UMA vez no SQL Editor do Supabase (revisar antes).
-- Premissas do projeto: "Automatically expose new tables" DESLIGADO (o GRANT abaixo é manual) e "automatic RLS" LIGADO.

-- UUID v7 em SQL puro: o projeto roda Postgres 17, que não tem uuidv7() nativo (só a partir do 18).
-- Pega um v4 aleatório, troca os 6 primeiros bytes pelo timestamp em milissegundos e marca a versão como 7.
-- Quando o projeto migrar para o Postgres 18, dá para trocar o default da coluna por uuidv7() e apagar esta função.
create function public.uuid_generate_v7() returns uuid
language sql
volatile
set search_path = ''
as $$
    select encode(
        set_bit(
            set_bit(
                overlay(uuid_send(gen_random_uuid())
                    placing substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3)
                    from 1 for 6),
                52, 1),
            53, 1),
        'hex')::uuid
$$;

-- O default da coluna roda com o privilégio de quem faz o INSERT; com o auto-expose desligado não dá para contar com
-- o grant padrão, então fica explícito.
grant execute on function public.uuid_generate_v7() to authenticated;

create table public.cards (
    -- v7: começa com timestamp, então os ids novos caem sempre no fim do índice da chave primária.
    id uuid primary key default public.uuid_generate_v7(),
    -- default auth.uid(): o frontend não precisa (nem consegue) mandar o dono; a policy de INSERT confere de novo.
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    title text not null check (char_length(title) between 1 and 80),
    content text not null check (char_length(content) between 1 and 5000),
    icon text not null default 'FlameIcon' check (char_length(icon) <= 40),
    color text not null default 'red' check (char_length(color) <= 40),
    -- Arquivado: null = ativo; preenchido = arquivado (e já diz quando). Um campo só, sem estado contraditório.
    archived_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Índices: a PK já tem o dela. Toda consulta do app é "meus cards em ordem de criação"
-- (where user_id = X order by created_at), e o RLS acrescenta o mesmo filtro por user_id, então este composto
-- atende a listagem, o RLS e o `on delete cascade` vindo de auth.users (o Postgres não indexa FK sozinho).
-- Ativos e arquivados usam o mesmo índice: filtrar `archived_at is null` depois do filtro por user_id é barato
-- com poucos cards por usuário (índice parcial só compensaria com milhares por usuário).
-- Sem índice de busca por texto: o app filtra no cliente e cada usuário tem poucos cards. Se um dia a busca for
-- para o servidor, aí entra um GIN com pg_trgm.
create index cards_user_id_created_at_idx on public.cards (user_id, created_at);

-- Mantém updated_at correto sem depender do frontend.
create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger cards_set_updated_at
before update on public.cards
for each row execute function public.set_updated_at();

-- RLS: já vem ligado pelo "automatic RLS", mas fica explícito aqui (idempotente).
alter table public.cards enable row level security;

-- Acesso pela Data API: só usuário logado. Visitante anônimo (anon) não recebe nenhum privilégio.
-- Privilégio por COLUNA: o cliente só escreve título, texto, ícone e cor. id, user_id e os timestamps são do banco,
-- então ninguém forja data de criação nem tenta trocar o dono.
revoke all on public.cards from anon;
grant select, delete on public.cards to authenticated;
grant insert (title, content, icon, color) on public.cards to authenticated;
grant update (title, content, icon, color, archived_at) on public.cards to authenticated;

-- Policies: cada usuário só enxerga e altera os próprios cards.
-- (select auth.uid()) em vez de auth.uid() solto: o Postgres avalia uma vez por consulta, não por linha.
create policy "cards_select_own" on public.cards
    for select to authenticated
    using (user_id = (select auth.uid()));

create policy "cards_insert_own" on public.cards
    for insert to authenticated
    with check (user_id = (select auth.uid()));

create policy "cards_update_own" on public.cards
    for update to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

create policy "cards_delete_own" on public.cards
    for delete to authenticated
    using (user_id = (select auth.uid()));

-- Conferência depois de rodar (deve devolver rls_ligado = true e 4 policies):
--   select relrowsecurity as rls_ligado from pg_class where oid = 'public.cards'::regclass;
--   select policyname, cmd from pg_policies where tablename = 'cards';
-- E para confirmar que os ids são v7 (versao = 7, e os dois ids crescem na ordem em que foram gerados):
--   select public.uuid_generate_v7() as a, public.uuid_generate_v7() as b,
--          uuid_extract_version(public.uuid_generate_v7()) as versao;
