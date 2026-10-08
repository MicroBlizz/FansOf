# Pendiente

Lo que queda por hacer y no hay que olvidar. Detalle de cada punto en PLAN-CUENTAS.md.

## Para Rafael: repasar y aplicar las misiones nuevas (Rumble 0.9.67 y 0.9.68, Daniel, 8-10-2026)
Rafael: Daniel pidió publicarlo ya (la web tiene la 0.9.68), así que repásalo cuando lo veas. Mientras no se aplique lo del punto 2, con cuenta NO se pueden cobrar las misiones nuevas (sin cuenta, todo funciona).
1. Qué cambia en Rumble:
   - 0.9.67: 6 diarias al día (la fija «Empleado del día: completa 5 misiones diarias», que da 150 oro / 25 gemas / 40 pase, más 5 al azar), 8 diarias nuevas (Arena y otras), la Arena cuenta para misiones y la campaña en Fácil tiene logros de estrellas.
   - 0.9.68: todas las misiones tienen título y descripción; 5 semanales (la fija «Empleado del mes: sé Empleado del día 7 veces», 600 / 80 / 400, más 4 al azar); las semanales normales se pueden cambiar con anuncio (mismo cupo «swap» de 2 al día que las diarias); semanales más largas (unos 5 días jugando ~10 partidas al día, medido con partidas automáticas).
   - Sistema común (core/js/retos.js): RETOS.fijas, fijasSemana, diariasN, semanalesN, trasSemanales, y en cada misión tit, r y alCobrar. Todo opcional: TD y los demás siguen igual.
2. Qué aplicar en Supabase, en este orden:
   a) servidor/18-misiones-premio-propio.sql (solo cambia la rama 'mision' de _evento: si la misión tiene premio propio en premios.mision.r, da ese; si no, lo de siempre).
   b) servidor/datos/rumble.sql (ya regenerado, versión 16: lista de misiones con las fijas, límite 6 diarias y 5 semanales, premios propios y logros de Fácil).
3. Qué probar con una cuenta de prueba:
   - Cobrar «Empleado del día» da 150 oro, 25 gemas y 40 de pase, y no se puede cobrar dos veces.
   - Se pueden cobrar 6 diarias y 5 semanales; la siguiente se rechaza.
   - «Empleado del mes» da 600 oro, 80 gemas y 400 de pase.
   - Una misión inventada se rechaza.
   - Los logros de Fácil (w1f…, st_f) se cobran una sola vez.
4. Para revisar: tocar core sin subir el ?v= de TD, Survivors, Skate y Tácticas fue decisión de Daniel (solo cambia el Rumble; los cambios de core son compatibles).
5. Si algo falla, avisa a Daniel. Para volver atrás la web: python herramientas/desplegar.py --lista y --a <commit>.

## Para Rafael: aplicar en Supabase las rarezas nuevas (Daniel, 8-10-2026)
La web ya está desplegada con Rumble 0.9.63 / TD 0.13.29 / Survivors 0.1.8 (rareza Común gris, clave `basic`). Falta el servidor:
1. Ejecutar `servidor/17-rareza-comun.sql` (las funciones `tirar` y `_rolar_objeto` conocen la rareza Común).
2. Ejecutar `servidor/datos/rumble.sql`, `td.sql` y `survivors.sql` (rarezas y probabilidades nuevas: Común 30 %, Poco común 25 %, Rara 30 %, Épica 12 %, Legendaria 3 %).
- Hasta que se haga, no se rompe nada: con cuenta, el gashapón sigue con las rarezas de antes y las cosas Comunes no salen (sin cuenta ya funciona).
- Vale para las versiones viejas del juego: el aparato saca la rareza de su propio catálogo y no mira la que devuelve el servidor.
- Cuando esté hecho, borra esta sección y la línea de CLAUDE.md que avisa de ella.

## Para Rafael (mensaje de Daniel, 7-10-2026): publicar en Google Play
¡¡Esfínter!! Rafael, repásalo y dile algo a Daniel. Cuando esté hablado, borrad esta sección (y la línea que la anuncia en CLAUDE.md).
- [ ] **Página de privacidad** (ES/EN): obligatoria ya (la partida va a la nube) y Google Play pide su enlace. La hace Claude de Daniel (es el punto de «Cuentas» de abajo).
- [ ] **App de Android con Capacitor**: envolver el juego web en una app. La hace Claude de Daniel.
- [ ] **Ficha de la tienda**: capturas, imagen de cabecera 1024×500, descripción ES/EN, repaso del icono. La hace Claude de Daniel.
- [ ] **Cuenta de desarrollador de Google Play** (pago único), a nombre de uno de los dos. ¿Quién?
- [ ] **12 probadores durante 14 días seguidos**: obligatorio en cuentas personales nuevas antes de poder publicar. Es lo que más tarda: buscarlos ya (amigos y familia con Android).
- [ ] **Formularios de Google**: el de edades (IARC) y el de seguridad de datos (qué guarda la app).
- [ ] **Nube (Rafael)**: pegar las plantillas de servidor/correos/ (LEEME.md) en Supabase y la dirección de la app en las Redirect URLs para que el enlace del email funcione dentro de la app (ya están en «Cuentas»).
- [ ] **Nombre de recambio**: Google revisa a mano y podría rechazarlo por parecerse a Blizzard/Warcraft Rumble. Tener uno pensado.
- No hace falta para la primera versión: PvP online, tienda con dinero real ni el botón de Google.

## Cuentas (publicado el 6-10-2026: Rumble 0.9.30, TD 0.13.0)
- [x] Páginas de privacidad y condiciones (ES/EN) en /privacidad/ y /condiciones/, enlazadas desde Opciones y la biblioteca.  Contacto: fansofmicroblizz@gmail.com.
- [ ] Botón de Google: el código ya está (sale solo cuando Supabase tiene Google activado). Falta que el dueño cree la credencial OAuth en Google Cloud, active Google y «Allow manual linking» en Supabase (pasos en el hilo «Cuenta del jugador»).
- [ ] Correos de Supabase: plantillas listas en servidor/correos/, falta pegarlas en el panel (hoy salen en inglés).
- [ ] Correo: Gmail vale para empezar (~500 al día). Con muchos jugadores, pasar a un dominio propio (por ejemplo con Resend).
- [ ] Herramientas en el panel DEV: estado de la nube, forzar subida/bajada, simular sin conexión.
- [ ] Limpieza de invitados: servidor/16-limpiar-invitados.sql escrito (diaria, 60 días); falta que el dueño lo pegue en el SQL Editor. El usuario de prueba con la partida «prueba» se borra a mano.
- [ ] App de Android (Capacitor): añadir su dirección a las Redirect URLs de Supabase para que funcione el enlace del email.
- [ ] Probar el modo sin conexión con la cuenta (python herramientas/servidor.py --con-sw).

## Recursos en la nube (hecho el 7-10-2026; ver PLAN-CUENTAS.md, puntos 15.x)
Oro, gemas, entradas, objetos, gashapón, mejoras, premios de campaña, misiones, racha, pase, logros, horas extra y anuncios ya los valida el servidor en Rumble y TD.
- [ ] **21-10-2026**: se cierra sola la subida de partidas antiguas a la cuenta (15.12). Antes, comprobar que los jugadores activos han abierto el juego con conexión; si hace falta, mover la fecha (`ajustes_servidor`).
- [ ] Antes de abrir la tienda: quitar de los topes los motivos de prueba (`compra`, `compra-pase`, `pruebas`), borrar las funciones `migrar_abierta` y `conciliar_abierta`, y cobrar solo por webhook del proveedor de pago.
- [ ] Anuncios de verdad: hoy el anuncio es de prueba. Ojo: AdMob no sirve en web (solo apps). Para web: Google Ad Manager/AdSense «H5 Games Ads» (anuncios con premio, requiere aprobación) y NO ofrece verificación en servidor; lo que sí se puede es pedir un permiso al servidor al empezar el anuncio y exigir un mínimo de segundos antes de cobrar. Decidir proveedor antes de construir.
- [ ] Afinar los topes con lo que se vea con jugadores reales (los recortes quedan anotados en el servidor). Hoy solo hay ~4 cuentas de prueba (7-10-2026): sin datos que valgan. Revisar con la consulta privada `consulta-topes.sql` cuando haya unas decenas de jugadores activos.
- [ ] Condiciones de uso: que podemos limitar, aislar o cerrar cuentas que hagan trampa, sin detallar cómo.
- [ ] La experiencia de las cartas sigue contándola el aparato (decidido dejarlo: subir cartas gasta oro del servidor). Revisar si hiciera falta.
- [ ] PvP: usar el inventario y las cartas del servidor (no el guardado local) y partidas repetibles para poder comprobarlas.
- [x] Modo sin conexión (service worker): probado el 7-10-2026 en Chromium, Rumble 0.9.55 y TD 0.13.22 cargan sin red tras una primera visita, sin errores.
- [ ] Probar con jugadores reales el aviso «Necesitas conexión» y la corrección del saldo cuando el servidor recorta algo.

## Después
- [ ] Modo ahorro y contador de FPS también en el TD (en el Rumble desde 0.9.39). Hacerlo común en core para que los dos juegos usen el mismo código. Ahora se prioriza el Rumble.
- [ ] PvP online (Rumble primero, luego TD): Rumble determinista (aleatorio con semilla y paso fijo), emparejamiento, modos Estándar y Salvaje.
- [ ] Tienda con dinero real: recursos, gachapón e inventario en el servidor; cobro con Paddle o Lemon Squeezy; probabilidades visibles. Plan y borradores inactivos: PLAN-TIENDA.md, servidor/16-tienda-real.sql, servidor/funciones/pagos/.
- [ ] Antes de cobrar: darse de alta (autónomo o sociedad) y condiciones de venta.
