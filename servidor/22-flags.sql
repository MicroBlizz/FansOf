-- Flags remotos: abrir o cerrar algo de los juegos con una consulta, sin desplegar.
-- Los juegos leen esta tabla al arrancar y cada 5 minutos (core/js/nucleo.js, NUCLEO.flag). Lo que no está aquí vale lo que diga el código.
-- · juego: '*' vale para todos; o el nombre de la carpeta del juego ('rumble', 'td'…). plataforma: '*', 'web' o 'android'. Si hay varias filas aplicables, manda la más concreta (juego pesa más que plataforma).
-- · valor: true/false. porcentaje: 0-100, a qué parte de los jugadores se abre (siempre los mismos). mensaje / mensaje_en: texto para el jugador. dato: texto libre para quien lo necesite.
-- · Dos nombres tienen efecto propio en todos los juegos: 'mantenimiento' (valor true + mensaje: franja de aviso arriba) y 'version-minima' (dato = '0.9.110': los que tengan menos ven un aviso de recargar).
-- Solo lectura para los jugadores; se escribe desde el panel de Supabase o la API de gestión.
-- Compatible con versiones anteriores del juego: las que no leen la tabla siguen con el valor del código.
-- Ejemplos:  update public.flags set valor = false, mensaje = 'PvP cerrado un rato por una avería' where nombre = 'pvp-estandar';
--            insert into public.flags (nombre, juego, valor) values ('mi-flag', 'rumble', true) on conflict (nombre, juego, plataforma) do update set valor = excluded.valor, actualizado = now();
create table if not exists public.flags (
  nombre text not null,
  juego text not null default '*',
  plataforma text not null default '*' check (plataforma in ('*', 'web', 'android')),
  valor boolean not null,
  porcentaje int not null default 100 check (porcentaje between 0 and 100),
  mensaje text,
  mensaje_en text,
  dato text,
  actualizado timestamptz not null default now(),
  primary key (nombre, juego, plataforma)
);
alter table public.flags enable row level security;
create policy "leer flags" on public.flags for select to anon, authenticated using (true);
revoke all on public.flags from anon, authenticated;
grant select on public.flags to anon, authenticated;

-- Para el servidor: ¿está abierto este flag para ese juego? Sin fila, vale p_defecto; el servidor mira solo las filas de todas las plataformas y no aplica el porcentaje. (El cliente solo oculta; lo que protege algo comprueba esto.)
create or replace function public._flag_activo(p_nombre text, p_juego text, p_defecto boolean) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select valor from public.flags where nombre = p_nombre and juego in (p_juego, '*') and plataforma = '*' order by (juego = '*') limit 1), p_defecto);
$$;
revoke all on function public._flag_activo(text, text, boolean) from public, anon, authenticated;
