-- Fans Of · limpieza automática de invitados sin actividad (cuenta del jugador, TODO.md «Limpieza»).
-- SIN APLICAR TODAVÍA. Pegar en Supabase > SQL Editor > Run (el conector de Claude no deja funciones que borran).
-- Borra las cuentas de invitado (anónimas, sin email) que llevan 60 días sin entrar ni guardar; sus partidas y recursos
-- se borran solas (on delete cascade). Las cuentas con email o Google no se tocan nunca. Se ejecuta cada día a las 03:30 UTC.
-- Antes: Database > Extensions > activar pg_cron (o ejecutar la línea de abajo).

create extension if not exists pg_cron;

create or replace function public.limpiar_invitados(dias int default 60) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  with viejos as (
    select u.id from auth.users u
    where u.is_anonymous and u.email is null
      and greatest(u.created_at, u.updated_at, coalesce(u.last_sign_in_at, u.created_at),
                   coalesce((select max(p.cambiado) from public.partidas p where p.usuario = u.id), u.created_at),
                   coalesce((select max(s.updated_at) from auth.sessions s where s.user_id = u.id), u.created_at))
          < now() - make_interval(days => dias)
  ), borrados as (delete from auth.users where id in (select id from viejos) returning 1)
  select count(*) into n from borrados;
  return n;
end $$;
revoke all on function public.limpiar_invitados(int) from public, anon, authenticated;

select cron.unschedule('limpiar-invitados') where exists (select 1 from cron.job where jobname = 'limpiar-invitados');
select cron.schedule('limpiar-invitados', '30 3 * * *', $$select public.limpiar_invitados(60)$$);

-- Para ver cuántos borraría sin borrar nada (opcional):
--   select count(*) from auth.users u where u.is_anonymous and u.email is null and u.last_sign_in_at < now() - interval '60 days';
