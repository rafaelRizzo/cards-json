-- Limpeza automática dos links de compartilhamento vencidos (pg_cron). Rodar DEPOIS do 20261012153600_sharing.sql, em separado.
-- Se este arquivo falhar, nada do 20261012153600_sharing.sql é afetado: os links continuam funcionando e vencidos continuam sendo
-- recusados na leitura; só as linhas velhas ficam no banco até o job rodar.

-- Limpeza automática (pg_cron). Links vencidos já são recusados na leitura; isto só tira as linhas velhas do banco.
-- Roda todo dia às 03:00 UTC (00:00 em Brasília) e apaga links vencidos há mais de 7 dias; a folga deixa o dono
-- ainda ver "link expirado" na tela antes de sumir. O job roda como o dono do banco, então ignora o RLS (é o esperado).
-- Se o CREATE EXTENSION der erro de permissão, ative pelo painel (Database > Extensions > pg_cron) e rode só o schedule.
create extension if not exists pg_cron with schema pg_catalog;

-- Agendar com o mesmo nome de novo apenas atualiza o job, não duplica.
select cron.schedule(
    'limpar-links-vencidos',
    '0 3 * * *',
    $$delete from public.card_shares where expires_at < now() - interval '7 days'$$
);

-- Conferir o job e o histórico das execuções; para remover: select cron.unschedule('limpar-links-vencidos');
--   select jobname, schedule, active from cron.job;
--   select status, return_message, start_time from cron.job_run_details order by start_time desc limit 5;
