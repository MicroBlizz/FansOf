# Plan: cuentas de jugador y servidor gratuito

Estado: propuesta, sin código todavía (6-10-2026). Precios y límites consultados ese día; revisar antes de empezar.

## 1. Qué hay hoy
- Todo es estático en GitHub Pages; no hay servidor.
- La partida vive en localStorage, una por juego: `AJUSTES.guardado` (`for-save-1` en Rumble, `fortd-save` en TD).
- Todo pasa por dos funciones de core: `loadSave()` y `saveGame()` en `core/js/sistema/progreso.js`. Ese es el único punto que hay que tocar para sincronizar.
- TD ya tiene "exportar código" y `#traer=` (`games/td/js/menus.js`): se queda como plan de emergencia.
- Todos los juegos están en el mismo origen (microblizz.github.io), así que una sesión iniciada en la biblioteca vale para todos.

## 2. Objetivo
1. Nadie tiene que registrarse para jugar. Cero pantallas de login al entrar.
2. Una cuenta guarda las partidas de todos los juegos, cada una por separado (sin oro ni cartas compartidos).
3. Se sigue jugando sin conexión; se sincroniza al volver.
4. Lo siguiente es PvP online con emparejamiento simple: la cuenta y el servidor tienen que servir también para eso (punto 9).
5. Habrá tienda con dinero real para monetizar (punto 14): recursos, gachapón e inventario pasan al servidor.
6. Coste 0 € mientras el número de jugadores sea pequeño, y precio conocido si crece.

## 3. Opciones comparadas

| | Supabase (Free) | Firebase (Spark) | Cloudflare Workers + D1 | PocketBase en VPS gratis |
|---|---|---|---|---|
| Base de datos | Postgres 500 MB | Firestore 1 GiB | SQLite 5 GB | SQLite, lo que tenga la máquina |
| Usuarios | 50.000 activos/mes | 50.000 activos/mes | sin login: hay que hacerlo | ilimitado |
| Uso diario | sin tope de lecturas; 5 GB de salida/mes | 50.000 lecturas y 20.000 escrituras/día | 100.000 peticiones/día | lo que aguante |
| Invitado (anónimo) y luego cuenta | Sí, nativo (`signInAnonymously` + `linkIdentity`) | Sí, nativo (`linkWithCredential`) | A mano | Parcial |
| Google / enlace por email | Sí / Sí | Sí / Sí | A mano | Sí / Sí |
| Funciona desde HTML sin compilar | Sí (script desde CDN) | Sí (módulos desde CDN) | Sí | Sí |
| Tiempo real (PvP) | Realtime: 200 conexiones a la vez, 100 mensajes/s | Realtime Database: 100 conexiones a la vez | Durable Objects (de pago) | WebSocket propio |
| Pega | Se pausa tras 7 días sin actividad; 2 proyectos gratis | Cupo de escrituras diario; sin funciones en el plan gratis | Hay que escribir el login y la seguridad | Mantener un servidor (copias, caídas) |
| Si crece | Pro 25 $/mes: 100.000 usuarios, 8 GB | Blaze por uso (~0,18 $ por 100.000 escrituras) | 5 $/mes y por uso | Pagar máquina |

Descartados: Cloudflare y PocketBase obligan a mantener el login y la seguridad nosotros; para dos personas es demasiado. PlayFab/Nakama son más de lo que hace falta y atan a su forma de trabajar.

## 4. Recomendación: Supabase (región UE, Frankfurt)
- Invitado silencioso y paso a cuenta real sin perder nada, igual que Firebase, pero con datos en Postgres normal: si un día nos vamos, se exporta con `pg_dump`.
- Sin cupo diario de lecturas/escrituras: no hay que racionar los guardados como en Firestore.
- Trae tiempo real (canales Broadcast y Presence) en el mismo proyecto y con la misma sesión: sirve para el PvP sin otro servicio.
- Servidores en la UE: más sencillo con el RGPD (estamos en España).
- La pausa por inactividad solo pasa si nadie juega una semana; con jugadores reales no ocurre. Si preocupa, una GitHub Action semanal que haga una consulta la mantiene despierta.
- Plan B si Supabase da problemas: Firebase, con el mismo diseño (cambia solo `cuenta.js`).

## 5. Cómo lo ve el jugador
1. Entra y juega. Por detrás, si hay conexión, se crea una cuenta de invitado y la partida se sube sola. No ve nada.
2. En Opciones (y en la biblioteca) aparece "Cuenta": "Tu progreso está en este dispositivo. Guárdalo para no perderlo y jugar en otros".
3. Dos botones: **Continuar con Google** (un toque) y **Enviarme un enlace por email** (sin contraseña). Ninguna contraseña en ningún sitio.
4. Al vincular, la cuenta de invitado pasa a ser la suya: mismas partidas, nada que copiar.
5. En otro dispositivo: "Ya tengo cuenta" → Google o enlace → se bajan sus partidas.
6. Recordatorio suave, no bloqueante, en momentos buenos (tras un logro, al pasar el mundo 2): "¿Guardas tu progreso?".
7. "Cerrar sesión" y "Borrar mi cuenta y mis datos" en Opciones (obligatorio por RGPD y por las tiendas si un día se publica como app).

Apple: "Iniciar sesión con Apple" exige cuenta de desarrollador (99 $/año). Se deja para cuando haya app de iOS; en el navegador de iPhone Google y el email ya funcionan.

## 6. Datos en el servidor
Una sola tabla:

```sql
create table partidas (
  usuario  uuid references auth.users on delete cascade,
  juego    text not null,            -- 'rumble', 'td', ...
  datos    jsonb not null,           -- el SAVE tal cual
  version  int  not null default 1,  -- sube en cada subida (control de choques)
  aparato  text,                     -- quién subió la última
  cambiado timestamptz default now(),
  primary key (usuario, juego)
);
alter table partidas enable row level security;
create policy "solo lo mío" on partidas for all
  using (auth.uid() = usuario) with check (auth.uid() = usuario);
```

- La clave pública (anon key) va en el código sin problema: la seguridad la pone la política de filas.
- Subida con una función `guardar_partida(juego, datos, version_esperada)` que solo escribe si `version` coincide; si no, devuelve la de la nube (ver 7).
- Tamaño: medir el SAVE real con el panel DEV. Con ~20 KB por partida y 2 juegos, 500 MB dan para unos 12.000 jugadores.
- Limpieza: tarea mensual (pg_cron) que borra invitados sin actividad en 60 días.

## 7. Sin conexión y choques
- `saveGame()` sigue guardando primero en localStorage, siempre. La nube es una copia.
- Junto al SAVE se guarda `nube: { version, pendiente }`.
- Subida: 10 s después del último cambio, al acabar un nivel y al ocultar la pestaña (`visibilitychange`). Sin conexión se marca `pendiente` y se sube con el evento `online`.
- Al arrancar (o al iniciar sesión en otro aparato) se pide la de la nube:
  - nube igual a la local → nada;
  - nube más nueva y local sin cambios pendientes → se usa la de la nube;
  - local con cambios y nube sin cambios → se sube la local;
  - las dos cambiaron → se pregunta: "¿Qué partida quieres? Este dispositivo: ★ 120, oro 5.300 · Nube: ★ 98, oro 7.100". Sin mezclas automáticas (con oro y gacha, mezclar abre trampas).
- El service worker de cada juego guarda en caché la librería de Supabase para que el juego arranque sin red.

## 8. Trampas
- El juego corre entero en el navegador: quien quiera puede editar su partida. Con partidas solo para uno, da igual; no vale la pena luchar contra eso.
- Importa en cuanto haya PvP (lo siguiente) y en clasificaciones o compras reales. Lo del PvP está en el punto 9. Además:
  - clasificaciones: el servidor valida con una Edge Function (límites razonables por nivel y tiempo) y no se acepta el número que manda el cliente sin más;
  - compras reales: ver punto 14. Los recursos, el gachapón y el inventario pasan al servidor.
- Ahora: límite de tamaño del `datos` (p. ej. 200 KB) y de subidas por minuto en la función, y CAPTCHA (Cloudflare Turnstile, gratis) en la creación de invitados si aparecen bots.

## 9. PvP online con emparejamiento simple
Es lo siguiente después de las cuentas, así que el diseño ya lo tiene en cuenta. Irá en los dos juegos: primero Rumble y después el modo VS de TD (decidido 6-10-2026).

**Quién juega**: cualquiera, también los invitados (la cuenta silenciosa del punto 5 basta). Nombre automático cambiable ("Fan#4821").

**Dos modos, cada uno con su cola y su clasificación**:
- **Estándar**: cuentan el mazo y el nivel de las cartas. Los objetos no entran (se ignora el equipo al montar la partida).
- **Salvaje**: cuentan además los objetos equipados, tal como los lleva cada uno.
Son la misma partida con un ajuste distinto, así que el trabajo es el mismo: la `cola` y la `sala` llevan una columna `modo` y solo se empareja a gente del mismo modo; la tabla `pvp` guarda puntos por modo. Si en un modo hay poca gente, el mensaje de "no hay rivales" ofrece el otro.

**Emparejamiento** (sin servidor propio, solo Postgres + Realtime):
- Tabla `cola (usuario, juego, nivel, entra)`. Función `buscar_rival(juego, nivel)` que, en una sola transacción, coge al que más lleva esperando con nivel parecido (`for update skip locked`) y crea la `sala`; si no hay nadie, te mete en la cola.
- Los dos se unen al canal Realtime `sala:<id>`. Presence dice si el otro sigue ahí.
- Si en ~30 s no hay nadie: "No hay rivales ahora. ¿Juegas contra la IA?" (la IA ya existe). El rango de nivel se abre con la espera.

**Cómo se sincroniza la partida: lockstep determinista** (lo que usan los Clash/RTS):
- Solo viajan las jugadas ("carta X en la casilla Y en el tick 412"), no las posiciones. Las dos máquinas simulan lo mismo con la misma semilla.
- Muy pocos mensajes (~1-2 por segundo y partida): el plan gratis (100 mensajes/s, 200 conexiones) da para unas 50 partidas a la vez.
- Retardo de entrada de ~3 ticks para esconder la latencia; cada segundo se manda un resumen (hash) del estado para detectar desincronización o trampas.
- **Trabajo previo en Rumble**: hoy la simulación usa `Math.random` (≈40 sitios en `06*`, `14a`, `17a`...) y el paso de tiempo del fotograma. Hace falta: (1) un `rnd` con semilla para la simulación (lo visual de `07*` puede seguir con `Math.random`), (2) paso fijo (p. ej. 20 ticks/s) separado del dibujo, (3) prueba que juegue la misma partida dos veces y compare hashes. Se puede ir haciendo antes que el PvP con el protocolo base.py/comprobar.py.
- **Hecho (7-10-2026, v0.9.57)**: `games/rumble/js/04b-simulacion.js` tiene `simSeed`, `srnd/srand/spick/sshuffle` (mulberry32), `simStep` (tick fijo de 1/60 s; el dibujo va aparte en 21-arranque.js) y `simHash`. Todo lo que decide la partida usa `s*`; lo visual sigue con `rand/pick/Math.random`. La semilla se da con `G.seedNext` antes de `startMatch()`. Prueba: `python herramientas/comprobar.py --determinismo [--seg=N]` (juega 3 modos dos veces con la misma semilla y una con otra). Pendiente para el PvP: las jugadas por tick (hoy el jugador juega al instante), `Math.hypot/atan2/pow` pueden dar el último bit distinto entre navegadores distintos (vigilarlo con el hash), y la sala de pruebas/arena aún usan azar normal.

**Si uno se cae (decidido 8-10-2026)**: en lockstep el que sigue conectado se queda esperando las jugadas del otro, así que hay que resolverlo:
- Cada cliente espera las jugadas del rival tick a tick. Sin recibirlas en ~3-5 s, sale «Esperando al rival…».
- Pasados ~15-20 s, el que sigue conectado reclama la victoria por abandono con `cerrar_sala(sala, motivo='abandono')` (función de servidor; los puntos los decide el servidor, nunca el cliente). Presence de Realtime avisa de que el otro se ha ido. Si nadie responde, la sala se cierra.
- Reconexión: si el caído vuelve a tiempo, se reune a la sala y pide el registro de jugadas (con su tick) y la semilla; re-simula hasta el tick actual. Por eso cada cliente guarda ese registro.
- El abandono cuenta como derrota para quien deja de responder, para que no se pueda dejar la partida colgada y evitar perder.
- Los dos clientes mandan el hash del estado cada segundo. Si no coinciden: desincronización; se cierra la sala sin puntos para nadie (o se juzga por el registro de jugadas).

**Trampas en PvP**:
- Hasta que exista la tienda, el nivel y los objetos salen del SAVE y se pueden editar. Con la tienda (punto 14) el inventario pasa al servidor y Salvaje deja de fiarse del SAVE.
- Lo que sí se hace, y con poco trabajo: al entrar en la cola se sube el mazo (cartas, niveles y objetos) y el servidor comprueba que exista todo, que el coste esté dentro de lo permitido y que los niveles no pasen del máximo del juego. Luego los dos clientes juegan con esa lista firmada por el servidor, no con lo que tenga cada uno en su SAVE.
- La clasificación separada por modo limita el daño: quien se infle las cartas sube en su modo y se encuentra con rivales igual de inflados.
- Al acabar, los dos mandan ganador y hash final a `cerrar_sala`; si coinciden, se suman puntos (ELO sencillo en una tabla `pvp`); si no, no cuenta. Si alguien se va, 15 s para volver y si no, gana el otro.
- Más adelante, si hace falta, una Edge Function puede repetir la partida con las jugadas para validarla.

**Si crece**: con más de ~50 partidas a la vez, Pro (25 $/mes) sube a 500 conexiones y más mensajes; con miles, se pasa el relevo a un servidor de juego (Colyseus/Nakama) sin cambiar cuentas ni datos.

## 10. Coste si crece
- 0 € hasta ~50.000 jugadores activos al mes y 500 MB.
- Pro: 25 $/mes (100.000 activos, 8 GB); luego 0,00325 $ por activo extra y 0,125 $ por GB.
- Emails del enlace mágico: el correo propio de Supabase solo envía unos pocos por hora. Para producción, SMTP propio gratis (Resend, 3.000/mes) con un dominio.

## 11. Pasos (cada uno se puede subir solo)
1. Crear el proyecto Supabase (UE), activar invitados, Google y email. Crear tabla, política y función. Lo hace el usuario en la web; Claude prepara el SQL.
2. `core/js/sistema/cuenta.js`: iniciar Supabase, invitado silencioso, subir y bajar partida. Gancho en `loadSave`/`saveGame`; ningún `if` de juego (el nombre del juego sale de `NUCLEO`). Apuntar en COMUN.
3. Choques: `nube.version`, la regla del punto 7 y la ventana "¿Qué partida quieres?".
4. Pantalla "Cuenta" en Opciones y en la biblioteca (Google, enlace por email, cerrar sesión, borrar cuenta). Textos en español con su inglés en `core/idioma/`.
5. Herramientas DEV: ver estado de la nube, forzar subida/bajada, simular sin conexión.
6. Página de privacidad (ES/EN) enlazada desde Opciones y la biblioteca.
7. Probar: dos navegadores con la misma cuenta, modo sin conexión (`servidor.py --con-sw`), cambiar partida en ambos y comprobar la pregunta.
8. Publicar con entrada en novedades.
9. (En paralelo, cuando se quiera) Rumble determinista: `rnd` con semilla, paso fijo y prueba de repetición.
10. PvP en Rumble: tablas `cola`, `sala`, `pvp`, funciones `buscar_rival` y `cerrar_sala`, canal de sala, pantalla de búsqueda y resultado.
11. PvP en TD (modo VS de `games/td/js/partida.js`): mismo emparejamiento y tablas (columna `juego`); solo hay que hacer determinista su simulación y cambiar la IA rival (`aiThink`) por las jugadas que llegan del canal. Lo que se pueda se sube a core al hacer Rumble, para que TD lo herede.

## 12. Pendiente de decidir
- Edad: resuelto en los puntos 13 y 14.
- Antes de cobrar: darse de alta (autónomo o sociedad). Nombre MicroBlizz: se mantiene de momento asumiendo el riesgo de marca (decidido 6-10-2026); conviene tener pensado un nombre de recambio por si llega una queja.
- Dominio propio para emails y, de paso, para no depender del nombre de la organización.

## 13. Menores de edad
En España, por debajo de 14 años hace falta permiso de los padres para tratar datos personales (RGPD más la ley española; en otros países de la UE el límite va de 13 a 16, y en EE. UU. COPPA lo pone en 13).

Lo que se hace, que es lo más sencillo y deja el juego legal para todas las edades:
1. **Jugar no pide datos.** La cuenta de invitado no guarda nombre, email ni nada personal: solo un identificador aleatorio y la partida. Eso no son datos de registro, así que un niño de 8 años puede jugar y guardar su progreso sin permiso de nadie.
2. **Al vincular con Google o email**, una línea antes del botón: "Para guardar tu cuenta tienes que tener 14 años o más. Si eres menor, pide a tu padre, madre o tutor que lo haga contigo." Con una casilla o un botón de confirmación. Sin pedir fecha de nacimiento (eso ya sería recoger un dato más).
3. **Nada de perfilado ni publicidad personalizada**, ni medición que siga al jugador entre webs. Las estadísticas, si las hay, anónimas y agregadas.
4. **Sin chat libre ni nombres escritos a mano visibles para otros** en el PvP: nombre automático tipo "Fan#4821", y si se deja cambiar, una lista de palabras prohibidas. Así se evita lo que de verdad da problemas con menores.
5. **Borrar la cuenta** desde Opciones, en dos toques, sin escribir a nadie.
6. Página de privacidad corta y en lenguaje claro (ES/EN) que diga qué se guarda (la partida y el email si lo das), para qué, dónde (Supabase, UE) y cómo borrarlo.

Para jugar y guardar, lo que no conviene: pedir fecha de nacimiento, pedir el email de un padre o montar una verificación de edad. Es más datos, más trabajo y más responsabilidad.

Para comprar, en cambio, sí hay más cuidado: está en el punto 14.

## 14. Tienda con dinero real
Hoy no hay compras, pero la idea es tener una tienda que funcione para monetizar. Eso cambia tres cosas del plan.

**Modelo (decidido 6-10-2026)**: todos los objetos salen del gachapón y todo se compra con recursos que se ganan jugando. Pagar solo da más recursos (acelera). Quien pague mucho tendrá ventaja al principio en PvP Salvaje, pero los que no pagan acaban teniendo los mismos objetos.

**1. Recursos, gachapón e inventario en el servidor.**
Como el dinero compra los mismos recursos que se ganan jugando, no se pueden separar "gemas pagadas" de "gemas ganadas". Si los recursos siguieran en el SAVE, editarlo equivaldría a pagar sin pagar, y en Salvaje se colarían objetos inventados. Por eso, en cada juego, pasan al servidor:
- **Saldo de recursos** con los que se tira del gachapón (tabla `monedero`, por jugador y juego).
- **Tiradas del gachapón**: las hace una función del servidor (`tirar(juego, gachapon)`) con las probabilidades guardadas allí. Así son las mismas para todos y se pueden publicar.
- **Inventario de objetos y cartas** (tabla `inventario`): lo que usa el PvP Salvaje sale de aquí, no del SAVE.
- **Recompensas por jugar**: el juego pide `recompensa(juego, motivo)` al acabar un nivel, una misión o el idle. El servidor aplica la tabla de recompensas con topes razonables (por nivel, por hora, por día). No es infalible, pero acota mucho lo que gana un tramposo.
- **Compras**: tabla `compras` (cada pago con su id del cobro). El aviso del proveedor suma los recursos en `monedero`.
- El progreso de niveles, estrellas, opciones y demás sigue en el SAVE (local primero, copia en la nube).

Qué supone para el jugador:
- Jugar niveles sigue funcionando sin conexión. Las recompensas se apuntan y se cobran al volver, con los mismos topes.
- Tirar del gachapón, comprar y el PvP necesitan conexión.
- Lo ganado y lo comprado se recupera en cualquier dispositivo.

Qué supone en el código:
- `core/js/sistema/gachapon.js`, `inventario.js` y `tienda.js` dejan de escribir el SAVE directamente para esas cosas y llaman al servidor. Es un cambio en core, así que Rumble y TD lo heredan.
- Las cifras de cada juego (tablas de recompensa, probabilidades, precios) siguen siendo de cada juego, pero hay que subirlas al servidor. Una herramienta (`herramientas/subir_datos.py`) las lee de `games/<juego>/js/` y genera el SQL, para no tenerlas escritas dos veces.
- Al pasar a esto, una migración única: lo que cada jugador tenga ya en su SAVE se sube una vez como saldo e inventario iniciales (con un tope, para que no sirva de puerta a trampas).

**2. Cómo se cobra.**
- Recomendado: un **comercio registrado** ("merchant of record") como Paddle o Lemon Squeezy. Ellos cobran, emiten la factura e ingresan el IVA de cada país de la UE por nosotros. Con Stripe directo eso nos toca a nosotros (alta en la ventanilla única de IVA, facturas). Comisión aprox. 5 % + 0,50 $ por venta (verificar al elegir): con esa parte fija, packs por debajo de ~2,99 € dejan poco.
- Flujo: botón de compra → página de pago del proveedor → el proveedor avisa al servidor (webhook) → una Edge Function de Supabase comprueba la firma del aviso, apunta la compra y entrega. Nunca se entrega porque el navegador diga "he pagado".
- Edge Functions entran en el plan gratis de Supabase (cientos de miles de llamadas al mes).
- Si un día hay app en Android/iOS, allí es obligatorio el cobro de Google/Apple (15-30 %); las mismas tablas sirven, cambia solo quién avisa.

**3. Menores y consumo.**
- Para comprar hay que tener cuenta vinculada (Google o email), no de invitado, para que la compra no se pierda.
- Antes de pagar: "Las compras las hace una persona adulta o con su permiso" con confirmación. En España y la UE un menor no puede contratar libremente, y los padres pueden reclamar compras no autorizadas: mejor dejarlo claro y devolver sin discusión si pasa.
- Precio siempre también en euros, no solo en la moneda del juego (lo piden las autoridades de consumo de la UE desde 2024 para las monedas virtuales). Nada de prisas ni ofertas con cuenta atrás dirigidas a niños.
- Como los recursos que se compran sirven para tirar del gachapón, a efectos legales es un gachapón con dinero real (caja de botín). Hace falta:
  - mostrar las probabilidades de cada rareza en la pantalla del gachapón (lo exigen Apple y Google y es el camino de las normas de España y la UE);
  - Bélgica prohíbe las cajas de botín de pago y los Países Bajos las han perseguido: en esos países, no vender recursos (el país sale del proveedor de pago);
  - vigilar la ley española de cajas de botín, que lleva años en borrador; si sale, puede pedir límites de gasto o edad mínima.
- Derecho de desistimiento: en contenido digital se pierde si el comprador lo acepta expresamente al pagar; casilla en la página de pago (el comercio registrado suele traerla).
- Condiciones de venta y privacidad actualizadas, con datos de quien vende (hace falta estar dado de alta).

**PvP Salvaje y compras**: se acepta que pagar dé ventaja temporal (decidido). Para que no queme a los que no pagan: el emparejamiento de Salvaje tiene en cuenta también la fuerza del equipo, no solo los puntos, y Estándar queda como el modo "justo".

**Pasos extra** (después de las cuentas, antes o en paralelo al PvP):
1. Tablas `monedero`, `inventario` y `compras`; funciones `tirar`, `recompensa` y Edge Function del webhook. Herramienta que sube las cifras de cada juego. Migración única desde el SAVE.
2. Cuenta en el comercio registrado, en modo pruebas; catálogo de productos.
3. Gachapón, inventario y tienda de core llaman al servidor. La tienda gana una pestaña de pago, con precios en euros y probabilidades visibles.
4. Probar con pagos de prueba: compra, devolución, compra en un dispositivo y verla en otro.
5. Alta legal, condiciones de venta y nombre definitivo antes de activar cobros reales.

## 15. Recursos en la nube: enfoque por fases
Propuesta (7-10-2026) para llevar al servidor el oro, las gemas, los objetos, las cartas y lo demás que cuesta dinero o da ventaja, pensando en la tienda. Desarrolla el punto 14; nada de esto está hecho.

### 15.1 Qué guarda hoy cada juego
Lo que hay en el SAVE de Rumble (`games/rumble/js/02e-guardado.js`) y de TD (`metaDefaults` en `games/td/js/catalogo.js`), con `core/js/sistema/progreso.js` como común. Hoy se sube entero como un solo JSON (`partidas.datos`), escrito por el cliente: cualquiera lo puede editar.

| Tipo | Campos | Dónde debe vivir |
|---|---|---|
| Recursos | `gold`, `gems`, `tickets` | Servidor |
| Suerte del gachapón | `pity` (contadores de garantía) | Servidor (si no, se editan para forzar legendarias) |
| Objetos y habilidades | `inv` (cada copia: `u`, `k`, `id`, `q` calidades), `invSeq` | Servidor |
| Cartas | `units` (nivel y xp), `cards` (copias y estrellas, Rumble), `unlocked` (facciones) | Servidor (ver decisión 1) |
| Cosas que se cobran una vez | `giftDay`, `login`, `pass` (xp y premios cobrados), `tutGift`, `starter`, `mythPrize`, `bossPay`, `rlWeek`, `daily`, `weekly` | Servidor, como «reclamos» con clave única |
| Progreso | `camp`, `campH`, `campM`, `stars` (TD), `bossRec`, `bestBoss`, `stats`, `achDone`, `achSeen`, `tut`, `seenVer` | Blob local con copia en la nube |
| Equipado y mazos | `equip`, `abEquip`, `decks`, `facItem`, `lastFac`, `bossSel` | Blob; el servidor lo comprueba contra el inventario cuando importa (PvP) |
| Opciones | `muted`, `vol`, `mus`, `nums`, `shake`, `blood`, `feed`, `chatOff`, `speed2`… | Blob |

Hoy tocan `SAVE.gold`/`gems`/`tickets` unos 20 sitios repartidos en `core/js/retos.js`, `core/js/sistema/{gachapon,inventario,tienda,horas-extra,pantallas,pruebas}.js` y varios archivos de cada juego. Ese es el trabajo real: que todos pasen por un solo punto.

### 15.2 Idea central
1. **Una fachada común, `ECO`** (`core/js/sistema/economia.js`): `ECO.saldo()`, `ECO.cobrar(motivo, clave)`, `ECO.pagar(...)`, `ECO.tirar(...)`, `ECO.mejorar(...)`. El juego nunca escribe `SAVE.gold` directamente. Tiene dos motores con la misma interfaz: **local** (como hoy) y **nube**. Rumble y TD lo heredan; ningún `if` de juego.
2. **El servidor es la verdad para los recursos.** El cliente solo pide operaciones; el servidor valida, aplica y devuelve el estado nuevo. El `SAVE.gold` local pasa a ser una copia para pintar.
3. **Todo cambio de saldo queda apuntado** en un libro de movimientos (no se sobrescribe un número): se puede auditar, deshacer y detectar tramposos.
4. **Las tablas no se pueden escribir directamente**: solo con funciones (`security definer`) que validan. Las políticas solo dejan leer lo propio.

### 15.3 Tablas (por jugador y juego, como `partidas`)
```sql
monedero    (usuario, juego, oro bigint, gemas bigint, entradas int, garantia jsonb, rev int)  -- pk (usuario, juego)
movimientos (id, usuario, juego, motivo text, clave text, d_oro, d_gemas, d_entradas, creado)  -- unique (usuario, juego, clave): idempotente
inventario  (usuario, juego, uid text, tipo, objeto, calidades real[], creado)                 -- pk (usuario, juego, uid)
cartas      (usuario, juego, carta text, nivel int, xp int, copias int, estrellas int)
reclamos    (usuario, juego, clave text, creado)                                               -- premios de una sola vez
compras     (id_pago, usuario, juego, producto, recursos, estado, creado)                       -- ya en el punto 14
tablas_juego(juego, version, datos jsonb)  -- probabilidades, precios y recompensas, subidas por herramientas/subir_datos.py
```
`clave` la genera el cliente (por ejemplo `camp:1-3:primera` o un UUID por operación): si la misma petición llega dos veces (reintento sin red), el servidor ignora la segunda. Cada función bloquea la fila del monedero (`for update`) para que dos pestañas a la vez no gasten dos veces lo mismo.

### 15.4 Funciones (RPC) y qué valida cada una
- `estado(juego)`: devuelve saldo, inventario, cartas y reclamos. Se llama al arrancar y tras cada operación.
- `tirar(juego, gachapon, n)`: comprueba saldo (entradas primero, luego gemas), saca las probabilidades de `tablas_juego`, tira con `random()` del servidor, aplica la garantía, crea las copias con su calidad y devuelve lo que ha salido. Mismo coste y probabilidades que hoy (`ECON.pull`, `odds`, `pityEpic`…). Aquí se publican también las probabilidades.
- `mejorar_carta`, `despedir`, `retirar_numeros` (reroll): descuentan el oro de las tablas de coste, suben nivel o devuelven oro al despedir según la calidad que consta en el servidor.
- `recompensa(juego, motivo, clave, datos)`: ver 15.6.
- `reclamar(juego, clave)`: premio diario, pase, regalos, bienvenida; una vez por clave y periodo, con la fecha del servidor (no la del reloj del aparato).
- `migrar(juego, save)`: una sola vez (15.8).
- `guardar_partida` (ya existe): se le añade que **ignora** los campos de recursos del blob. Así un cliente viejo no puede pisar el saldo.
- Las compras no son una función del cliente: solo las suma el webhook del proveedor de pago (Edge Function con la firma comprobada), con `id_pago` único.

### 15.5 Qué se queda en el blob
Progreso (niveles, estrellas, récords), opciones, tutorial, mazos y equipado. Se sigue subiendo como hoy, con el control de versión del punto 7. Si alguien edita sus estrellas solo se falsea a sí mismo, siempre que el premio por esos niveles lo valide el servidor (15.6) y que el PvP no se fíe de él.

### 15.6 Recompensas por jugar: lo que se puede y no se puede evitar
El servidor **no puede ver** una partida (el juego corre en el navegador), así que no sabe si de verdad se ganó. Lo que sí hace:
- **Un solo cobro por logro**: el primer pase de un nivel de campaña, una misión o un jefe llevan clave única y se pagan una vez, con la cifra de la tabla del servidor (el cliente no manda cantidades, solo el motivo).
- **Orden razonable**: el primer cobro de un nivel exige haber cobrado el anterior.
- **Topes** por hora y por día para lo repetible (repetir niveles, idle `horas-extra`, derrotas), tomados de `tablas_juego`, con un margen de unas pocas veces lo que saca un jugador muy activo.
- **Detección**: los movimientos permiten ver cuentas que chocan siempre con el tope y marcarlas o limitarlas. Sin castigos automáticos hasta tener datos.
- Límite honesto: quien automatice o juegue a toda velocidad llegará al tope diario, y nada más. Impedirlo del todo exigiría simular la partida en el servidor; para el PvP se puede hacer más adelante (punto 9: Rumble determinista, repetición verificable), para el PvE no compensa.

### 15.7 Sin conexión
- **Jugar niveles, opciones y mazos**: siguen sin conexión.
- **Ganar**: las recompensas van a una cola local (con su clave) y se cobran al volver la red. Se enseña «+120 oro pendiente» y el saldo local sube de forma provisional; si el servidor aplica un tope, se corrige.
- **Gastar** (tirar, mejorar, despedir, comprar, PvP): necesita conexión. Es lo que decía el punto 14, ahora con las mejoras de carta incluidas.
- El service worker deja arrancar el juego sin red; el saldo se enseña desde la última copia local.

### 15.8 Migrar las partidas actuales
1. El cliente nuevo detecta que la cuenta no tiene `monedero` y llama a `migrar(juego, save)` con su SAVE.
2. El servidor **no se fía** de los números: calcula un tope a partir del progreso (niveles de campaña cobrados, cartas, estrellas) con margen generoso y crea monedero, inventario y cartas con el menor de lo declarado y el tope. Lo que lo pase se anota en `movimientos` para revisarlo si alguien se queja.
3. Se marca como migrada (una vez por cuenta y juego), el SAVE antiguo queda en `partidas` por si hay que corregir, y desde ahí manda el servidor.
4. Hasta la tienda real el riesgo es solo de juego limpio, por eso hay margen; el tope se aprieta si la migración se hace cerca del lanzamiento de cobros.

### 15.9 Fases (cada una se sube sola; el orden importa)
0. **Fachada `ECO` con motor local.** Sin servidor ni cambios visibles: los ~20 sitios pasan por `ECO`. Se comprueba con `herramientas/base.py` y el comparador en Rumble y TD. Es la parte que más cuesta y la que deja todo lo demás barato. Puede hacerse ya.
1. **Tablas, `estado`, `migrar` y subida de cifras.** Modo sombra: el servidor guarda el saldo y el cliente lo compara, sin mandar todavía. Sirve para ver cuánto difieren y afinar los topes.
2. **Gachapón y mejoras en el servidor** (`tirar`, `mejorar_carta`, `despedir`, `retirar_numeros`). El motor nube pasa a ser el de todas las cuentas.
3. **Recompensas y reclamos** (`recompensa`, `reclamar`, cola sin conexión, topes).
4. **Compras**: comercio registrado en pruebas, webhook, pestaña de pago (pasos extra del punto 14).
5. **PvP Salvaje** usa `inventario` y `cartas`, no el SAVE.

Hasta la fase 4 no hay dinero en juego, así que 1-3 pueden madurar con jugadores reales sin riesgo económico; la tienda no se abre antes de cerrar 2 y 3.

### 15.10 Decisiones pendientes
1. **Cartas al servidor** (nivel, xp, copias, estrellas): recomendado sí. Si el nivel se queda local, editarlo a 10 se salta el gasto de oro, que es justo lo que vende la tienda.
2. **Mejorar y despedir con conexión obligatoria**: recomendado sí, igual que el gachapón.
3. **Cuenta de invitado de Supabase para todos desde el primer arranque**: recomendado sí; así hay un solo camino (la nube) y el motor local queda como respaldo sin red.
4. **Empezar por la fase 0** (la fachada `ECO`): recomendado sí.

### 15.11 Estado y fase 2 preparada (7-10-2026)
**Hecho**: fase 0 (fachada `ECO`, publicada en Rumble 0.9.40 y TD 0.13.7) y fase 1 (tablas, `estado`, `migrar`, `anotar` y modo sombra, Rumble 0.9.41 y TD 0.13.8; SQL en `servidor/03-recursos-sombra.sql`). Las decisiones 1 a 4 de 15.10 se aceptaron.

**Fase 2: gachapón y mejoras en el servidor.** Lo que hay que mover, tal como está hoy en el código:
- `core/js/sistema/gachapon.js`: `rollRarity`, `onePull`, `newCopy` y `pull` (habilidades y equipo, tiradas x1, x10 y x50, garantías `pityEpic`, `pityLeg`, `pityQ`, el «al menos una épica cada 10»). Rumble añade la máquina de cartas (`cardPull`, `rollCardRarity` y `cardStartLevel` en `14b-gachapon-y-mazo.js`).
- `core/js/sistema/inventario.js`: despedir una o varias copias y volver a tirar los números (`ECO.ganar('despedir')` y `ECO.gastar('retirar-numeros')`).
- `core/js/sistema/pantallas.js` `levelUp`: sube nivel gastando oro y xp.

**Cómo se hace** (todo con las funciones y tablas del punto 15.4, y el motor nube de `ECO`):
1. **Datos del juego en el servidor** (`tablas_juego`): probabilidades (`ECON.odds`, `cardOdds`), garantías, costes (`pull`, `goldCost`, `xpNeed`, `scrap`, `reroll`), `QTIERS` y los grupos de habilidades y objetos por rareza, facción y «pase». Los saca `herramientas/subir_datos.py` abriendo el juego en Chrome sin ventana (como `comprobar.py`), para no escribirlos dos veces ni leer el JS a mano. Cada subida lleva `version`.
2. **`tirar(juego, maquina, n)`** devuelve las copias nuevas con su calidad y las garantías ya actualizadas; el cliente anima y enseña lo que llega. Descuenta entradas y gemas, crea las filas de `inventario` (o la `carta` y sus estrellas), y apunta en `movimientos`. Una sola transacción por llamada: o sale todo o nada.
3. **`despedir(juego, uids)`**, **`retirar_numeros(juego, uid)`**, **`mejorar_carta(juego, carta)`**: valen con los datos del servidor (la calidad de la copia, el nivel y el oro vienen de sus tablas, no de lo que diga el cliente).
4. **Cliente**: `gachapon.js`, `inventario.js` y `pantallas.js` dejan de calcular. Piden y pintan lo que devuelve el servidor. `SAVE.inv`, `SAVE.units`, `SAVE.cards` y `SAVE.pity` pasan a ser una copia que se rellena desde `estado`. Los juegos no cambian de forma: la fachada `ECO` gana `ECO.tirar`, `ECO.despedir`, `ECO.retirarNumeros` y `ECO.mejorar`.
5. **Sin conexión**: estas acciones se bloquean con el aviso «Necesitas conexión» (decidido en 15.10). Con el servidor caído, el modo local de la fase 0 queda como respaldo solo para jugadores sin cuenta.

**Lo que no se cierra todavía** (queda a la fase 3):
- La xp de las cartas la sigue contando el cliente al jugar (`xpGrant`): un tramposo puede subir cartas gastando solo oro. Pasa a `recompensa` con tope.
- Las facciones desbloqueadas (`SAVE.unlocked` en Rumble) las manda el cliente a `tirar` para saber qué hay en la máquina. Hasta la fase 3, quien las falsee solo accede antes a las cartas y objetos de otras facciones. En la fase 3 se desbloquean con un reclamo al ganar el mundo.
- `cardStartLevel` (la carta nueva llega cerca del nivel de su facción) se calcula en el servidor con los niveles que ya tiene allí.

**Orden de trabajo de la fase 2** (cada paso se puede subir solo):
1. ✔ (7-10-2026) `herramientas/subir_datos.py` (abre `herramientas/datos.html` en Chrome sin ventana y escribe `servidor/datos/<juego>.json` y `.sql`) y la tabla `tablas_juego` (`servidor/04-tablas-juego.sql`). Subidos los datos de Rumble (versión 3); los de TD están generados y se suben al llegar su paso.
2. ✔ (7-10-2026, en la rama, sin publicar) `tirar(juego, maquina, n, clave, desbloqueadas)` para habilidades y equipo (`servidor/05-tirar.sql`) y `ECO.tirar` en el cliente. Solo se activa si el juego lo pide con `AJUSTES.servidor.gachapon` (Rumble sí; TD cuando se suban sus datos) y hay cuenta. Las copias nuevas llevan uid `n<número>` (las locales, `i<número>`). Con servidor, el saldo y las garantías que devuelve mandan sobre los locales.
3. ✔ (7-10-2026) Máquina de cartas de Rumble: `tirar_cartas` (`servidor/06-tirar-cartas.sql`); las máquinas de un juego declaran `rpc` y `deServidor`. El cliente nunca baja las copias y estrellas que ya tiene (toma el máximo). El nivel de la carta nueva lo sigue calculando el cliente hasta el paso 4.
4. ✔ (7-10-2026) `conciliar`, `despedir`, `retirar_numeros` y `mejorar_carta` (`servidor/07-economia.sql`), con `AJUSTES.servidor.economia`. `conciliar` se hace una vez por cuenta y juego: sube lo que el servidor aún no tenía (copias y niveles anteriores) y desde ahí manda el servidor. La carta nueva ya llega al nivel que calcula el servidor. Pendiente de la fase 3: la xp de las cartas (`p_xp`) la sigue declarando el cliente; las copias que se regalan solo en local (pase, modo pruebas) no están en el servidor y no se pueden despedir.
5. Cambio del cliente a leer de `estado` y quitar los cálculos locales; entrada en novedades solo cuando el jugador lo note (por ejemplo, «necesita conexión»).

**Decisión pendiente antes de empezar**: ¿el servidor guarda también cada calidad de copia con sus decimales tal como hoy (`q` como lista de números del 0 al 1)? Recomendado sí, así el cliente no cambia sus cálculos de `valsOf`.

### 15.12 La puerta de las partidas locales se cierra (7-10-2026)
`migrar` y `conciliar` aceptan lo que diga el cliente (oro, gemas, copias, niveles), con topes. Es la única puerta por la que se puede meter algo inventado, y solo hace falta para los jugadores que ya tenían partida. Por eso se cierra sola el **21-10-2026 a las 00:00 UTC** (`servidor/08-cerrar-puerta.sql`, tabla `ajustes_servidor`):
- Antes de esa fecha, todo igual.
- Después, `migrar` crea una cuenta nueva con lo de `econ.start` (150 de oro y 100 gemas en Rumble) y sin copias ni niveles; `conciliar` solo marca la cuenta como al día, sin añadir nada.
- Para moverla: `update public.ajustes_servidor set valor = timestamptz '…' where clave = 'puerta_migracion';`.
- Quien no abra el juego con cuenta antes de la fecha pierde la subida de su partida antigua: conviene una nota en novedades unos días antes. Su partida local sigue en su aparato.
- Antes de abrir la tienda, la puerta tiene que estar cerrada y las funciones `migrar_abierta` y `conciliar_abierta` borradas.

### 15.13 Fase 3, paso 1: topes a lo que se gana jugando (7-10-2026)
**El problema que había**: `anotar` (el espejo de lo que el cliente gana, fase 1) aceptaba cualquier cantidad positiva con cualquier motivo. Como el servidor ya manda sobre las gemas (gashapón) y el oro (mejoras), eso era una puerta abierta: bastaba llamar a la función con `gemas: 10000000`. Cerrada en este paso (`servidor/09-anotar-con-topes.sql`).

**Cómo queda**: cada motivo tiene sus topes en `tablas_juego.datos.topes`: `vez` (por cobro), `dia` (suma de las últimas 24 h) y `unica` (una sola vez por cuenta). Los fija el código del juego: los comunes en `TOPES_COMUNES` (`core/js/sistema/economia.js`) y los de cada juego en `AJUSTES.topes`; `herramientas/subir_datos.py` los sube. Un motivo que no esté en la lista se rechaza; una cantidad que pase de los topes se recorta, y lo pedido queda en `movimientos.nota` para revisarlo. Las restas pasan (solo perjudican al jugador).

**Qué ve el jugador**: si el servidor recorta algo, el saldo de la pantalla se corrige a lo suyo después de sincronizar (en los juegos con `AJUSTES.servidor.economia`, hoy Rumble).

**Los topes son generosos a propósito** (por ejemplo, 5.000 de oro y 200 gemas por partida, 300.000 de oro al día): cortan las trampas gordas sin molestar a nadie. Se afinan mirando `movimientos.nota` cuando haya jugadores reales.

**Pendiente de la fase 3**:
- Las recompensas de un solo cobro (primer pase de un nivel, misión del día, premio del pase) todavía no llevan clave propia: valen los topes por día, pero no el «una vez».
- Objetos y copias que se regalan (pase, idle, tutorial) se crean aún en local; hay que crearlos en el servidor para poder despedirlos.
- La experiencia de las cartas (`p_xp` en `mejorar_carta`) la sigue declarando el cliente.
- Antes de abrir la tienda: quitar los motivos `compra` y `pruebas` de los topes.

### 15.14 Fase 3, paso 2: el servidor pone la cantidad de los premios de un solo cobro (7-10-2026)
`anotar` (`servidor/10-premios-del-servidor.sql`) ya no se fía de la cantidad que dice el cliente en estos casos; el cliente cuenta lo que ha pasado y el servidor decide:
- **Campaña** (Rumble): el cliente manda el evento `{tipo: 'camp', nivel, dif, estrellas, victoria, jefe}` y el servidor calcula el premio con `datos.premios` (primer pase o jefe, repetición, tercera estrella, derrota, multiplicador de dificultad). Apunta las estrellas ya cobradas de cada nivel en `reclamos` (`camp:<dif>:<nivel>:<1|2|3>`), así que el primer pase y la tercera estrella solo se pagan una vez por nivel y dificultad.
- **Regalo diario**: siempre `premios.gift`, una vez por día natural de Madrid (la clave lleva la fecha del servidor, no la del aparato).
- **Pack de bienvenida** y **entradas del tutorial**: cantidad fija del servidor, una sola vez por cuenta.
- Siguen aplicándose los topes `vez` y `dia`. El resto de motivos todavía dice el cliente cuánto, limitado por los topes.
- Datos nuevos en `tablas_juego.datos.premios` (los saca `herramientas/subir_datos.py`): `camp`, `pay`, `gift`, `starter`.
- **No se comprueba aún**: que el nivel esté desbloqueado (hace falta la lista de niveles y su orden en el servidor) ni que las estrellas sean verdad.
- Siguiente (paso 3): misiones, racha de días y pase de batalla por el mismo camino; horas extra y anuncios con el reloj en el servidor.

### 15.15 Fase 3, paso 3: el servidor lleva el progreso de la campaña y valida los niveles (7-10-2026)
Idea del usuario: para confirmar un evento de un solo cobro basta con tener los eventos ya cobrados y comprobar que, con ellos, el nuevo es posible (por ejemplo, haber pasado antes el jefe o los niveles previos). Aplicado a la campaña (`servidor/11-progreso-de-campana.sql`):
- El servidor guarda las estrellas ya cobradas de cada nivel y dificultad en `reclamos` (`camp:<dif>:<nivel>:<1|2|3>`) y no paga un nivel que no esté abierto con lo que sabe: el nivel anterior del mundo, el último nivel del mundo anterior (o el `openAfter` del mundo), Difícil tras pasar el mundo en Normal, Mítica tras Difícil. Los niveles y su orden salen de `datos.premios.mundos`, que sube `subir_datos.py` desde `WORLDS`.
- Que un nivel sea jefe lo dice el servidor, no el cliente.
- **Progreso que ya existía**: `conciliar_progreso` sube una vez las estrellas de `SAVE.camp`, `campH` y `campM` (misma puerta que `conciliar`, hasta el 21-10-2026). Mientras una cuenta no lo haya subido y la puerta esté abierta, no se comprueba el orden (para no negar premios a quien ya jugaba); cuando la puerta se cierre se comprueba a todas, también a las que no lo subieron (con progreso vacío).
- Idea para los siguientes pasos con el mismo patrón: logros y misiones se apoyan en contadores que el servidor lleva a partir de los eventos que ya valida; las horas extra, en la fecha del último cobro del servidor (nunca más de 12 h acumuladas).

### 15.16 Fase 3, paso 4: misiones, racha de días, pase de batalla y logros (7-10-2026)
Siguiendo la idea del usuario (eventos de un solo cobro validados con lo que el servidor ya sabe de la cuenta), `anotar` acepta ahora estos eventos (`servidor/12-misiones-pase-logros.sql`, `conciliar_progreso2`):
- **Misiones** `{tipo:'mision', periodo:'d'|'w', id}`: la misión debe estar en el catálogo (`datos.premios.misiones`), se cobra una vez por periodo (día o semana de Madrid) y como mucho 4 por periodo; la cantidad sale de `premios.mision`.
- **Racha de días** `{tipo:'login'}`: el servidor lleva la racha (`monedero.extra.login`), un cobro por día; el día de la racha y el premio los calcula él.
- **Pase de batalla** `{tipo:'pase', pista, nivel}`: solo hasta el nivel que da la xp de pase que cuenta el servidor (cada partida suma xpWin o xpLose, cada misión, su xp), una vez por nivel y pista; la pista Ejecutiva pide `pase-premium` (compra de prueba, motivo `compra-pase`; hay que quitarlo con los pagos reales).
- **Logros** `{tipo:'logros', claves:['familia:nivel',…]}`: cada logro se cobra una vez (`reclamos`) con las gemas de la tabla. El servidor no puede ver si se ha cumplido; el total de gemas que se puede sacar así es finito (unas 29.800 en Rumble).
- **Progreso que ya existía**: `conciliar_progreso2` sube una vez, hasta el 21-10-2026, la xp del pase y sus niveles cobrados, el pase Ejecutivo, la racha, los logros ya cobrados y las misiones cobradas hoy. Después de esa fecha solo marca la cuenta (empieza vacía).
- **Pendiente**: los objetos del pase (Diploma, Corbata del CEO) y los regalos de objetos se siguen creando en local; hay que crearlos en el servidor (paso siguiente).

### 15.17 Fans of TD con todo lo del servidor (7-10-2026)
TD usa ya lo mismo que Rumble (`AJUSTES.servidor = { gachapon, economia }` en `games/td/js/ajustes.js`):
- Gashapón de habilidades y equipo, despedir, volver a tirar los números y subir de nivel las cartas en el servidor (con conexión).
- Premios de campaña calculados por el servidor (`campReward` manda el evento `camp`; en VS, el evento `otro` para la xp del pase). TD solo tiene dificultad Normal. Su regla de apertura es `campRegla: 'todos'`: un mundo se abre al pasar todos los niveles del anterior (en Rumble, el último). El progreso previo sale de `SAVE.stars`.
- Misiones, racha de días, pase y logros: ya iban por core; ahora el servidor tiene también las tablas de TD (`servidor/datos/td.json`, subidas el 7-10-2026).
- Cambios en el servidor: `_camp_abierto` entiende `campRegla` y `conciliar_progreso` importa también `stars`.
- Pendiente igual que en Rumble: horas extra y anuncios con reloj del servidor, y los objetos regalados (pase, tutorial) creados en el servidor.

### 15.18 Fase 3, paso 5: horas extra, anuncios y objetos del pase en el servidor (7-10-2026)
`servidor/13-horas-extra-y-anuncios.sql`. Eventos nuevos de `anotar` (`premios.horas` y `premios.anuncios`, que saca `subir_datos.py` de `IDLE` y `ADS`):
- **horas**: se cobra solo lo que cabe en el tiempo desde el cobro anterior (como mucho `cap` = 12 h) a la mayor ganancia posible por hora (poder máximo `pwMax` = 12; un juego puede poner otro en `AJUSTES.horas.pwMax`), con el doble si el turbo estaba activo y otro doble si se cobra x2 con anuncio. La hora que cuenta es la que manda el aparato en cada movimiento (`t`), sin pasar de la del servidor ni ir hacia atrás: varios cobros hechos sin conexión y mandados juntos no se pisan, y nadie cobra horas del futuro. El primer cobro de una cuenta puede llevar hasta 12 h.
- **horas-anuncio** (ganancias de N horas), **turbo** y **anuncio** (tiradas gratis, regalo x2, premio x2 de partida, cambiar misión): cada uno gasta un cupo del día de su sitio y del total (`reclamos` `ad:<fecha>:<sitio>:<n>`), con los límites de `ADS`. Tirada gratis = 1 entrada, regalo x2 = `premios.gift`; el premio x2 de partida lo dice el cliente con los topes de siempre. Hoy el anuncio es de prueba (5 s); con anuncios de verdad (AdMob) el cobro debería llevar la verificación del proveedor en el servidor.
- **Objetos del pase** (Diploma, Corbata del CEO): el servidor los crea en el inventario de la cuenta (uid `n<número>`, calidad `premios.pase.q`) y los devuelve en `anotar` (`nuevos`, con la clave del movimiento). El aparato crea al momento una copia provisional (`pend`) y, al llegar la respuesta, la cambia por la del servidor (también donde estuviera equipada): `copiasDelServidor` en `economia-sombra.js`. Con esto todo lo del pase (xp, niveles, pista de pago, objetos) lo lleva el servidor.
- Pendiente: los objetos que el líder encuentra en horas extra y los regalos de tutorial y bienvenida se siguen creando en el aparato; el mismo mecanismo (`items` en el evento) sirve para pasarlos al servidor.

### 15.19 Fase 3, paso 6: los objetos regalados los crea o valida el servidor (7-10-2026)
`servidor/14-objetos-regalados.sql` (la función `_evento_horas` se redefinió con los eventos `objeto` e `items`; la versión viva está en la base de datos).
- **Objetos de horas extra** (core, los dos juegos): el aparato manda cuántos cree haber ganado (`items`) y las facciones libres (`facs`); el servidor limita la cantidad a lo que cabe en el tiempo (a la mayor tasa de objetos por hora, `IDLE.item` y `IDLE.itemK`) y **los sortea él** con las probabilidades del gashapón, sin garantía. Con servidor el aparato ya no los sortea: llegan en la respuesta (`nuevos`) y el juego avisa «Tu líder ha encontrado…».
- **Regalos de un solo cobro** (motivo `objeto`; el aparato ya los ha sorteado y enseñado, el servidor comprueba y apunta una vez): `cafe` (Cafeína 0,75 del tutorial), `starter` (objeto épico de calidad Director o mejor, pack de bienvenida), `mito` (legendario de calidad Director o mejor, uno por mundo, premio de Mítica) y `facitem` (objeto de la facción, `premios.facItems`, calidad Buena o mejor, una vez por facción). La copia provisional del aparato (`pend`) se cambia por la del servidor (`copiasDelServidor`; el gancho `copia.renombrada` actualiza referencias como la Cafeína del tutorial).
- Límite: en los regalos de un cobro el servidor no sortea, solo valida (el jugador ha visto lo que le ha tocado); un tramposo podría elegir el mejor objeto de la categoría, pero solo una vez por regalo.
- Con esto todo lo que da oro, gemas, entradas, objetos, experiencia de pase y progreso de campaña pasa por el servidor. Queda: la experiencia de las cartas, que sigue contando el cliente.
