-- Fans Of · paso 4 del PLAN-CUENTAS.md: «Borrar mi cuenta y mis datos» desde Opciones (RGPD).
-- Pegar en Supabase > SQL Editor > Run. (El conector de Claude no deja crear funciones que borran: hay que hacerlo a mano.)
create or replace function public.borrar_mi_cuenta() returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sin sesion'; end if;
  delete from auth.users where id = auth.uid();   -- sus partidas se borran solas (on delete cascade)
end $$;
revoke all on function public.borrar_mi_cuenta() from public, anon;
grant execute on function public.borrar_mi_cuenta() to authenticated;
