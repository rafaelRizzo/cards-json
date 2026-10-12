-- Reforço do pino (20261012153900_pin.sql), a partir da revisão do SQL. Script INCREMENTAL: rodar UMA vez, DEPOIS do pin.sql.
-- Não mexe em colunas, grants nem índices; só troca a função do trigger e acrescenta um CHECK.
--
-- O que muda:
--   * corrida no teto de 10: dois cliques/abas ao mesmo tempo contavam 9 fixados cada um e passavam os dois (11).
--     Agora a conferência é serializada por pessoa (advisory lock);
--   * a data do pino passa a ser do banco: ao fixar, pinned_at vira now() seja qual for o valor enviado;
--   * o erro do teto passa de 54000 para 53400, para não se confundir com o teto opcional de cards (limits.sql);
--   * arquivado e fixado ao mesmo tempo vira impossível também por CHECK (o trigger já zerava o pino).
--
-- PRÉ-CHECAGEM: se esta consulta devolver alguma linha, o CHECK falha e nada muda (a transação desfaz tudo):
--   select id, title from public.cards where pinned_at is not null and archived_at is not null;

begin;

create or replace function public.enforce_cards_pin_rules() returns trigger
language plpgsql
set search_path = ''
as $$
begin
    -- Arquivar solta o pino (e arquivado não pode ser fixado).
    if new.archived_at is not null then
        new.pinned_at := null;
        return new;
    end if;

    -- Só confere o teto na hora de fixar (de não fixado para fixado).
    if new.pinned_at is not null and old.pinned_at is null then
        -- Serializa por pessoa: o lock vale até o fim da transação; a segunda espera e conta de novo já enxergando a
        -- primeira. (pg_advisory_xact_lock e hashtext ficam em pg_catalog, então funcionam com search_path vazio.)
        perform pg_advisory_xact_lock(hashtext('cards_pin'), hashtext(new.user_id::text));

        if (select count(*) from public.cards where user_id = new.user_id and pinned_at is not null) >= 10 then
            raise exception 'Limite de 10 cards fixados atingido' using errcode = '53400';
        end if;

        -- A data do pino é do banco (o cliente não escolhe).
        new.pinned_at := now();
    end if;

    return new;
end;
$$;

alter table public.cards
    add constraint cards_pinned_not_archived check (pinned_at is null or archived_at is null);

commit;

-- Conferência depois de rodar:
--   select pg_get_functiondef('public.enforce_cards_pin_rules()'::regprocedure);
--   -- deve conter "pg_advisory_xact_lock" e "53400"
--   select conname from pg_constraint where conrelid = 'public.cards'::regclass and conname = 'cards_pinned_not_archived';
