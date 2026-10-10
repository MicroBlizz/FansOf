# Pendiente

Lo que queda por hacer y no hay que olvidar. Detalle de cada punto en PLAN-CUENTAS.md.

## Misiones nuevas de Rumble: probadas en el servidor (8-10-2026)
Rumble 0.9.71 (8-10-2026): 6 semanales (la fija + 5, de una lista de 18 con 7 nuevas), facciones liberadas a nivel 1 y cupo propio para cambiarlas con anuncio, 6 a la semana («swapw», reclamos 'adw:<lunes>:…'). Aplicados en Supabase la 19 (cupo-semanal-de-anuncios) y los datos v18; probado en el servidor: 6 cambios sí, el 7.º no, el cupo diario no se toca.
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
- [ ] Anuncios de verdad (8-10-2026: se va solo a Android): AdMob con verificación en el servidor (SSV); el SQL depende de lo que envíe AdMob. Se hace cuando el hilo «Publicar en Google Play» tenga la app envuelta (Capacitor). Hoy el anuncio es de prueba.
- [ ] Afinar los topes con lo que se vea con jugadores reales (los recortes quedan anotados en el servidor). Esperar a tener unos cuantos beta testers (hoy solo ~4 cuentas de prueba): revisar entonces con la consulta privada `consulta-topes.sql`.
- [ ] Condiciones de uso: que podemos limitar, aislar o cerrar cuentas que hagan trampa, sin detallar cómo.
- [ ] Misiones y logros: hoy el servidor limita cuántos y cuánto se cobra, pero no comprueba que se hayan cumplido (se podrían cobrar las diarias sin jugar). Que el servidor lleve el progreso real (partidas ganadas, bajas…) y solo deje cobrar lo cumplido. Vale la pena antes de abrir la tienda o tener muchos jugadores.
- [ ] XP de las cartas (decidido dejarlo, 8-10-2026): la cuenta el aparato; un tramposo podría declarar más XP y subir cartas gastando solo oro (no puede inventar oro ni gemas). Arreglarlo solo si se detecta abuso: pasar la XP a `recompensa` con tope en el servidor.
- [x] PvP: usar el inventario y las cartas del servidor (no el guardado local) y partidas repetibles para poder comprobarlas (hecho el 8-10-2026: el servidor valida y guarda el equipo; ver la sección «PvP de Rumble»).
- [x] Modo sin conexión (service worker): probado el 7-10-2026 en Chromium, Rumble 0.9.55 y TD 0.13.22 cargan sin red tras una primera visita, sin errores.
- [ ] Probar con jugadores reales el aviso «Necesitas conexión» y la corrección del saldo cuando el servidor recorta algo.

## PvP de Rumble (Estándar abierto como beta, temporada 0; hecho el 8-10-2026)
Rumble determinista, lockstep, equipos validados por el servidor, campo simétrico al azar, selector de facción, rendición y clasificación: ver PLAN-CUENTAS.md, punto 9. Lo que queda, cada punto por separado:
- [ ] **Salvaje** (flag `pvp-salvaje`): jugar una partida real con habilidades y objetos con dos cuentas; si va bien, quitar el flag (del código y de la fila de la tabla `flags`).
- [ ] **Flag `pvp-estandar`**: quitarlo (código y tabla) cuando se dé por estable; mientras tanto sirve de interruptor de cierre.
- [ ] **Navegadores distintos**: abrir `herramientas/pruebas/matematicas.html` en Safari/iPhone y Firefox (debe decir IGUAL, huella 5d1fe14a) y jugar una partida entera entre navegadores distintos. Si sale «las dos copias no coinciden», con `?dev=1` la pantalla final dice qué trozo difiere.
- [ ] **Red mala**: probar con personas cortes y redes lentas; el retardo por defecto es 5 turnos (en `?dev=1` se puede cambiar con `localStorage.setItem('fansof-pvp-d', N)`, igual en los dos jugadores) y el medidor de abajo a la izquierda enseña tiempos y esperas.
- [ ] **Servidor, llamadas a la vez**: `pvp_jugar` falla con «duplicate key … pvp_jugadas_pkey» si el mismo jugador hace dos llamadas a la vez. El cliente manda una sola; con un bloqueo por sala y lado (`pg_advisory_xact_lock`) o un contador atómico se podrían mandar varias y bajarían los tirones con red lenta.
- [ ] **Temporadas**: la 0 se resetea borrando la tabla de puntos cuando esté estable; cada temporada empieza de cero. Falta decidir si basta borrar o hace falta columna de temporada y archivo de la anterior.
- [ ] **Empates y partidas anuladas**: `pvp_cerrar` solo admite ganador `a` o `b`; el cliente no cierra empates ni desincronizaciones. Decidir qué hace el servidor con ellas (sin puntos para nadie).
- [ ] **Capacidad**: ~5 llamadas por segundo por jugador a `pvp_jugar`; revisar con muchas partidas a la vez (turno de 24 ticks reduce a la mitad) o pasar de plan.
- [ ] **Texto**: la nota de novedades de la 0.9.97 dice «ejército» donde el juego dice «facción» (entrada pasada: no se reescribe salvo que se decida).

## Después
- [ ] Modo ahorro y contador de FPS también en el TD (en el Rumble desde 0.9.39). Hacerlo común en core para que los dos juegos usen el mismo código. Ahora se prioriza el Rumble.
- [ ] PvP online en TD (modo VS): hereda de core lo que se pueda; solo falta hacer determinista su simulación y cambiar la IA rival por las jugadas del canal (PLAN-CUENTAS.md, punto 9 y paso 11). El de Rumble está hecho: sección «PvP de Rumble».
- [ ] Tienda con dinero real: recursos, gachapón e inventario en el servidor; cobro con Paddle o Lemon Squeezy; probabilidades visibles. Plan y borradores inactivos: PLAN-TIENDA.md, servidor/16-tienda-real.sql, servidor/funciones/pagos/.
- [ ] Antes de cobrar: darse de alta (autónomo o sociedad) y condiciones de venta.
