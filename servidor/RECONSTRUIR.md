# Reconstruir Supabase desde cero (sin datos)

Qué hacer si el proyecto de Supabase se borra o se vacía y hay que dejarlo como estaba, sin los datos de los jugadores.

## Qué ya está en el repo
1. **Tablas y funciones**: `servidor/01-…sql` a `servidor/20-…sql`, ejecutados **en orden numérico** en SQL Editor (los que cambian una función, como el 18, sustituyen a la versión anterior). Cada cabecera dice si está aplicada. El `16-tienda-real.sql` es un borrador sin aplicar: no se ejecuta hasta que se abra la tienda.
2. **Cifras de cada juego**: después del 04, ejecutar `servidor/datos/rumble.sql`, `td.sql` y `survivors.sql`. Si cambia un juego: `python herramientas/subir_datos.py` y volver a ejecutar su `.sql`.
3. **Plantillas de correo**: `servidor/correos/` (ver su LEEME.md).
4. **Pagos**: `servidor/funciones/pagos` (borrador, sin desplegar).
5. Los SQL **privados** del proyecto (carpeta de archivos del proyecto, no el repo) también se ejecutan, tras los anteriores.

## Qué NO está en SQL (se hace a mano en el panel o con el token)
- Authentication: *Anonymous sign-ins* y *Email* activados; Site URL = la web publicada; Redirect URLs `https://microblizz.github.io/FansOf/**` y `http://localhost:8765/**`.
- SMTP propio (Gmail con contraseña de aplicación) y remitente «Fans Of».
- Google login (cuando se haga) y la extensión `pg_cron` (la activa el 16-limpiar-invitados).
- Secretos de las Edge Functions.

## Si se crea un proyecto NUEVO (no solo se vacía el actual)
La dirección y la clave pública cambian. Están escritas en `core/js/sistema/cuenta.js` (constantes del servidor), así que hay que cambiarlas y **desplegar** los juegos. Vaciar el proyecto actual conserva dirección y claves.

## Qué se pierde y qué no
- Se pierden cuentas, partidas en la nube, saldos y el historial. Cada jugador conserva su partida local en su navegador y, al entrar, se sube de nuevo, **pero solo hasta el 21-10-2026**: la puerta de migración se cierra sola (08-cerrar-puerta.sql). Después de esa fecha, una cuenta nueva empieza con lo que dé el servidor.
- Por eso, la copia de seguridad de los datos (backup diario del plan de pago o `pg_dump` periódico) importa más que el SQL: el SQL solo rehace la estructura.
