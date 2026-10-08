# Pendiente

Lo que queda por hacer y no hay que olvidar. Detalle de cada punto en PLAN-CUENTAS.md.

## Misiones nuevas de Rumble: probadas en el servidor (8-10-2026)
Rumble 0.9.71 (8-10-2026): 7 semanales (la fija + 6) y cupo propio para cambiarlas con anuncio, 6 a la semana («swapw», reclamos 'adw:<lunes>:…'). Aplicados en Supabase la 19 (cupo-semanal-de-anuncios) y los datos v17; probado en el servidor: 6 cambios sí, el 7.º no, el cupo diario no se toca.
Con un invitado de prueba: «Empleado del día» da 150 / 25, no se cobra dos veces; «Empleado del mes» da 600 / 80; una misión inventada se rechaza; 6 diarias cobradas bien. Sin probar: la 7.ª diaria, las 5 semanales y los logros de Fácil (w1f…, st_f).

## Publicar en Google Play (pendiente, 7-10-2026)
- [ ] **Página de privacidad** (ES/EN): obligatoria ya (la partida va a la nube) y Google Play pide su enlace. Es el punto de «Cuentas» de abajo.
- [ ] **App de Android con Capacitor**: envolver el juego web en una app.
- [ ] **Ficha de la tienda**: capturas, imagen de cabecera 1024×500, descripción ES/EN, repaso del icono.
- [ ] **Modo pruebas solo para el equipo** (Daniel, 8-10-2026): antes de sacar el juego, el botón de Opciones solo lo ven administradores, creadores y jugadores de la beta; los demás no.
- [ ] **Modo pruebas con cuenta**: la copia para volver solo está en el navegador donde se activó, pero el modo pruebas se sincroniza a todos los aparatos; en los demás sale «ACTIVADO» y no se puede quitar. Guardar la copia también en la nube (o poder quitarlo desde cualquier aparato). Y lo cobrado en modo pruebas (misiones, logros) queda apuntado en el servidor y al volver ya no se puede cobrar.
- [ ] **Cuenta de desarrollador de Google Play** (pago único), a nombre de uno de los dos. ¿Quién?
- [ ] **12 probadores durante 14 días seguidos**: obligatorio en cuentas personales nuevas antes de poder publicar. Es lo que más tarda: buscarlos ya (amigos y familia con Android).
- [ ] **Formularios de Google**: el de edades (IARC) y el de seguridad de datos (qué guarda la app).
- [x] **Nube**: plantillas de correo ya en Supabase (8-10-2026, confirmado por Rafael). Falta solo la dirección de la app en las Redirect URLs si aún no está.
- [ ] **Nombre de recambio**: Google revisa a mano y podría rechazarlo por parecerse a Blizzard/Warcraft Rumble. Tener uno pensado.
- No hace falta para la primera versión: PvP online, tienda con dinero real ni el botón de Google.

## Cuentas (publicado el 6-10-2026: Rumble 0.9.30, TD 0.13.0)
- [x] Páginas de privacidad y condiciones (ES/EN) en /privacidad/ y /condiciones/, enlazadas desde Opciones y la biblioteca.  Contacto: fansofmicroblizz@gmail.com.
- [x] Botón de Google: activo desde el 8-10-2026 (Google y manual linking en Supabase); probado de principio a fin.
- [x] Correos de Supabase en español: plantillas aplicadas en el panel el 8-10-2026 (fuente: servidor/correos/).
- [ ] Correo: Gmail vale para empezar (~500 al día). Con muchos jugadores, pasar a un dominio propio (por ejemplo con Resend).
- [ ] Herramientas en el panel DEV: estado de la nube, forzar subida/bajada, simular sin conexión.
- [x] Limpieza de invitados: aplicada el 8-10-2026 (servidor/16-limpiar-invitados.sql, diaria 03:30 UTC, 60 días). Sin cuentas que borrar todavía. El usuario de prueba con la partida «prueba» se borra a mano.
- [ ] App de Android (Capacitor): añadir su dirección a las Redirect URLs de Supabase para que funcione el enlace del email.
- [ ] Probar el modo sin conexión con la cuenta (python herramientas/servidor.py --con-sw).

## Recursos en la nube (hecho el 7-10-2026; ver PLAN-CUENTAS.md, puntos 15.x)
Oro, gemas, entradas, objetos, gashapón, mejoras, premios de campaña, misiones, racha, pase, logros, horas extra y anuncios ya los valida el servidor en Rumble y TD.
- [ ] **21-10-2026**: se cierra sola la subida de partidas antiguas a la cuenta (15.12). Antes, comprobar que los jugadores activos han abierto el juego con conexión; si hace falta, mover la fecha (`ajustes_servidor`).
- [ ] Antes de abrir la tienda: quitar de los topes los motivos de prueba (`compra`, `compra-pase`, `pruebas`), borrar las funciones `migrar_abierta` y `conciliar_abierta`, y cobrar solo por webhook del proveedor de pago.
- [ ] Anuncios de verdad: hoy el anuncio es de prueba. Ojo: AdMob no sirve en web (solo apps). Para web: Google Ad Manager/AdSense «H5 Games Ads» (anuncios con premio, requiere aprobación) y NO ofrece verificación en servidor; lo que sí se puede es pedir un permiso al servidor al empezar el anuncio y exigir un mínimo de segundos antes de cobrar. Decidir proveedor antes de construir.
- [ ] Afinar los topes con lo que se vea con jugadores reales (los recortes quedan anotados en el servidor). Hoy solo hay ~4 cuentas de prueba (7-10-2026): sin datos que valgan. Revisar con la consulta privada `consulta-topes.sql` cuando haya unas decenas de jugadores activos.
- [ ] Condiciones de uso: que podemos limitar, aislar o cerrar cuentas que hagan trampa, sin detallar cómo.
- [ ] Misiones y logros: hoy el servidor limita cuántos y cuánto se cobra, pero no comprueba que se hayan cumplido (se podrían cobrar las diarias sin jugar). Que el servidor lleve el progreso real (partidas ganadas, bajas…) y solo deje cobrar lo cumplido. Vale la pena antes de abrir la tienda o tener muchos jugadores.
- [ ] La experiencia de las cartas sigue contándola el aparato (decidido dejarlo: subir cartas gasta oro del servidor). Revisar si hiciera falta.
- [ ] PvP: usar el inventario y las cartas del servidor (no el guardado local) y partidas repetibles para poder comprobarlas.
- [x] Modo sin conexión (service worker): probado el 7-10-2026 en Chromium, Rumble 0.9.55 y TD 0.13.22 cargan sin red tras una primera visita, sin errores.
- [ ] Probar con jugadores reales el aviso «Necesitas conexión» y la corrección del saldo cuando el servidor recorta algo.

## Después
- [ ] Modo ahorro y contador de FPS también en el TD (en el Rumble desde 0.9.39). Hacerlo común en core para que los dos juegos usen el mismo código. Ahora se prioriza el Rumble.
- [ ] PvP online (Rumble primero, luego TD): Rumble determinista (aleatorio con semilla y paso fijo), emparejamiento, modos Estándar y Salvaje.
- [ ] Tienda con dinero real: recursos, gachapón e inventario en el servidor; cobro con Paddle o Lemon Squeezy; probabilidades visibles. Plan y borradores inactivos: PLAN-TIENDA.md, servidor/16-tienda-real.sql, servidor/funciones/pagos/.
- [ ] Antes de cobrar: darse de alta (autónomo o sociedad) y condiciones de venta.
