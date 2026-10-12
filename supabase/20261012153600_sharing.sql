-- Compartilhamento de cards por link: só para pessoas LOGADAS e sempre com validade. Rodar UMA vez, DEPOIS do 20261012153500_schema.sql.
-- Um link ativo por card. O token é um segredo: uuid v4 (aleatório), NUNCA o id do card (v7 começa com o horário).
-- O cliente não escreve nem lê tokens de outros: criar, apagar e abrir passam por funções que conferem dono e validade.

create table public.card_shares (
    card_id uuid primary key references public.cards (id) on delete cascade,
    token uuid not null unique default gen_random_uuid(),
    expires_at timestamptz not null,
    created_at timestamptz not null default now(),
    check (expires_at > created_at)
);

alter table public.card_shares enable row level security;

-- O dono só LÊ (para mostrar o link e a validade). Insert, update e delete só pelas funções abaixo.
revoke all on public.card_shares from anon;
grant select on public.card_shares to authenticated;

create policy "card_shares_select_own" on public.card_shares
    for select to authenticated
    using (
        exists (
            select 1 from public.cards c
            where c.id = card_id and c.user_id = (select auth.uid())
        )
    );

-- Cria o link (ou gera um NOVO, invalidando o anterior). Validade de 1 a 90 dias; só o dono do card consegue.
create function public.share_card(p_card_id uuid, p_days integer default 7)
returns public.card_shares
language plpgsql
security definer
set search_path = ''
as $$
declare
    result public.card_shares;
begin
    if p_days is null or p_days not between 1 and 90 then
        raise exception 'Validade inválida (use de 1 a 90 dias)' using errcode = '22023';
    end if;

    if not exists (
        select 1 from public.cards c
        where c.id = p_card_id and c.user_id = (select auth.uid())
    ) then
        raise exception 'Card não encontrado' using errcode = '42501';
    end if;

    insert into public.card_shares as s (card_id, expires_at)
    values (p_card_id, now() + make_interval(days => p_days))
    on conflict (card_id) do update
        set token = gen_random_uuid(), expires_at = excluded.expires_at, created_at = now()
    returning s.* into result;

    return result;
end;
$$;

-- Desativa o link. Só afeta cards do próprio usuário (os de outros simplesmente não casam no join).
create function public.unshare_card(p_card_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
    delete from public.card_shares s
    using public.cards c
    where s.card_id = c.id and c.id = p_card_id and c.user_id = (select auth.uid());
$$;

-- Abre um card pelo token: devolve só o conteúdo (nunca o user_id), apenas para quem está logado e com o link válido.
create function public.get_shared_card(p_token uuid)
returns table (title text, content text, icon text, color text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
    select c.title, c.content, c.icon, c.color, s.expires_at
    from public.card_shares s
    join public.cards c on c.id = s.card_id
    where (select auth.uid()) is not null
      and s.token = p_token
      and s.expires_at > now();
$$;

-- Funções nascem executáveis por PUBLIC: tira de todos e libera só para usuário logado (anon não chama nenhuma).
revoke execute on function public.share_card(uuid, integer) from public, anon;
revoke execute on function public.unshare_card(uuid) from public, anon;
revoke execute on function public.get_shared_card(uuid) from public, anon;
grant execute on function public.share_card(uuid, integer) to authenticated;
grant execute on function public.unshare_card(uuid) to authenticated;
grant execute on function public.get_shared_card(uuid) to authenticated;

-- Conferência depois de rodar (a chamada sem login deve falhar com permission denied):
--   select proname, proacl from pg_proc where proname in ('share_card', 'unshare_card', 'get_shared_card');
--   select policyname, cmd from pg_policies where tablename = 'card_shares';

-- A limpeza automática dos links vencidos (pg_cron) fica em supabase/20261012153700_cron.sql, num arquivo à parte: se a extensão
-- falhar por permissão, isso não desfaz a criação das tabelas e funções acima.
