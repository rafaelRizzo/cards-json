-- Fixar cards no topo da lista. Rodar UMA vez, DEPOIS do schema, sharing, cron e limits (a ordem é a do nome do arquivo).
-- Não é tabela nova: fixar é atributo do card, que tem um dono só. Uma coluna, como o archived_at:
-- null = não fixado; preenchido = fixado (e já diz quando, para ordenar os fixados pelo mais recente).
--
-- Regras garantidas no banco (a tela só avisa antes):
--   * arquivar um card tira o pino; card arquivado não fica fixado;
--   * no máximo 10 fixados por pessoa (ajuste o número em cards_enforce_pin_rules, abaixo);
--   * fixar ou soltar NÃO conta como edição: updated_at só muda quando título, texto, ícone ou cor mudam.
--
-- Não há pré-checagem: a coluna nasce vazia, então nenhum card existente é afetado.

alter table public.cards add column pinned_at timestamptz;

-- O cliente pode escrever pinned_at (só nos próprios cards, pelo RLS). Refaz o grant de update com a lista completa.
revoke update on public.cards from authenticated;
grant update (title, content, icon, color, archived_at, pinned_at) on public.cards to authenticated;

-- Índice parcial: só entra quem está fixado (poucos por pessoa), então é minúsculo e deixa "meus fixados" barato.
-- A listagem principal continua usando cards_user_id_created_at_idx.
create index cards_user_id_pinned_at_idx on public.cards (user_id, pinned_at desc)
    where pinned_at is not null;

-- Regras do pino. Roda antes do UPDATE e do set_updated_at (triggers disparam em ordem alfabética do nome:
-- "cards_enforce_pin_rules" vem antes de "cards_set_updated_at").
create function public.enforce_cards_pin_rules() returns trigger
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
        if (select count(*) from public.cards where user_id = new.user_id and pinned_at is not null) >= 10 then
            raise exception 'Limite de 10 cards fixados atingido' using errcode = '54000';
        end if;
    end if;

    return new;
end;
$$;

create trigger cards_enforce_pin_rules
before update on public.cards
for each row execute function public.enforce_cards_pin_rules();

-- updated_at passa a refletir só edição de conteúdo. Antes, qualquer update (arquivar, fixar) mexia nele e a tela
-- mostraria "Editado agora" só por fixar. Arquivar também deixa de contar como edição.
create or replace function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if (new.title, new.content, new.icon, new.color) is distinct from (old.title, old.content, old.icon, old.color) then
        new.updated_at = now();
    end if;
    return new;
end;
$$;

-- Conferência depois de rodar:
--   coluna e índice:   select column_name from information_schema.columns
--                      where table_name = 'cards' and column_name = 'pinned_at';
--                      select indexname from pg_indexes where indexname = 'cards_user_id_pinned_at_idx';
--   permissão:         select privilege_type from information_schema.column_privileges
--                      where table_name = 'cards' and column_name = 'pinned_at' and grantee = 'authenticated';
--                      (deve listar UPDATE e SELECT)
--   triggers:          select tgname from pg_trigger where tgrelid = 'public.cards'::regclass and not tgisinternal;
--                      (deve listar cards_enforce_pin_rules e cards_set_updated_at)
