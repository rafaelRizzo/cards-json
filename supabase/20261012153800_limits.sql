-- Revisão dos limites e formatos das tabelas, igual ao que o formulário (Zod) já valida. Rodar UMA vez, depois do
-- 20261012153500_schema.sql e do 20261012153600_sharing.sql. Só acrescenta regras (CHECK): não apaga nem altera nenhum dado.
--
-- Já existiam no 20261012153500_schema.sql: title 1-80, content 1-5.000, icon e color até 40 caracteres.
-- Aqui entram: formato de icon e color, título em uma linha só, texto/título que não sejam só espaços e a validade
-- máxima do link (90 dias, o mesmo teto da função share_card).
--
-- PRÉ-CHECAGEM: se esta consulta devolver alguma linha, ajuste esses cards antes (senão o ALTER falha e nada muda):
--   select id, title, icon, color from public.cards
--   where icon !~ '^[A-Za-z0-9]+$'
--      or color !~ '^[a-z]+$'
--      or position(chr(10) in title) > 0 or position(chr(13) in title) > 0
--      or title !~ '\S' or content !~ '\S';

alter table public.cards
    -- Nome do ícone e da cor: só letras/números (o catálogo exato é conferido na tela; aqui só barra lixo).
    add constraint cards_icon_format check (icon ~ '^[A-Za-z0-9]+$'),
    add constraint cards_color_format check (color ~ '^[a-z]+$'),
    -- Título é de uma linha só.
    add constraint cards_title_single_line check (position(chr(10) in title) = 0 and position(chr(13) in title) = 0),
    -- Precisa ter pelo menos um caractere que não seja espaço.
    add constraint cards_title_not_blank check (title ~ '\S'),
    add constraint cards_content_not_blank check (content ~ '\S');

-- A função share_card já limita a 90 dias; este CHECK garante o mesmo teto mesmo se alguém mexer na função.
alter table public.card_shares
    add constraint card_shares_max_validity check (expires_at <= created_at + interval '90 days');

-- OPCIONAL (anti-abuso): teto de cards por usuário, para ninguém encher o banco com uma conta. Descomente para ligar;
-- 2.000 é só um exemplo, ajuste ao uso real. Roda antes de cada INSERT e recusa o 2.001º card da pessoa.
--
-- create function public.enforce_cards_per_user() returns trigger
-- language plpgsql
-- set search_path = ''
-- as $$
-- begin
--     if (select count(*) from public.cards where user_id = new.user_id) >= 2000 then
--         raise exception 'Limite de 2000 cards por conta atingido' using errcode = '54000';
--     end if;
--     return new;
-- end;
-- $$;
--
-- create trigger cards_enforce_limit
-- before insert on public.cards
-- for each row execute function public.enforce_cards_per_user();

-- Conferência depois de rodar (deve listar as 5 regras novas de cards e a de card_shares):
--   select conrelid::regclass as tabela, conname from pg_constraint
--   where conrelid in ('public.cards'::regclass, 'public.card_shares'::regclass) and contype = 'c' order by 1, 2;
