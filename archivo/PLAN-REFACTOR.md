# Plan de refactor: que cada tarea lea pocos archivos pequeños

Solo es un plan: no se ha tocado código. Los tamaños y números de línea están sacados con `wc`, `grep` y rangos sobre el commit `1b21055` (main). Si cambian antes de ejecutar un paso, se vuelven a medir.

**Idea central.** Hoy, casi cualquier tarea obliga a pasar por uno de estos cinco: `core/js/serie/arte.js` (197 KB, 2174 líneas, algunas de 1200 caracteres), `core/js/serie/config.js` (59 KB), `games/rumble/js/06-combate.js` (83 KB), `07-dibujo.js` (70 KB) y `games/td/js/game.js` (76 KB). Se parten en piezas por tema de menos de 25 KB, casi siempre **en tramos seguidos y sin cambiar el orden**, de modo que juntar las piezas da exactamente el archivo de antes. Eso se puede comprobar con un `diff` y deja el riesgo casi a cero. Solo `arte.js` y `config.js` necesitan algo más (repartir un objeto grande entre varios archivos), y van al final.

El repo ya usa ese patrón: `games/rumble/js/05b-iahorro.js` añade la facción de Los Creadores con `Object.assign(CFG.cards, …)`, `Object.assign(ART, …)`, `Object.assign(BOX, …)`, etc. Las facciones de core seguirán el mismo modelo.

---

## 1. CLAUDE.md propuesto (raíz del repo, 30 líneas)

```markdown
# Fans Of · guía para Claude
Juegos web sin compilación (HTML + JS + CSS). Rumble es el principal; TD y los demás heredan de core/. Todo en español.

## Leer poco
- Empieza por MAPA.md (archivo, tamaño y funciones). Abre solo lo que la tarea pide.
- Nada de más de 30 KB se lee entero: grep -n y rangos de líneas.
- Ignora _base/ (copia del comparador), ../fans-of.zip y ../fans-of-rumble/ (repo antiguo: no tocar).
- core/LEEME.md explica la carga y los ganchos; si la tarea es solo de datos, no hace falta.

## Dónde va cada cosa
- Dibujo de un personaje o edificio: core/js/serie/arte/<facción>.js
- Números y textos de sus cartas: core/js/serie/facciones/<facción>.js
- Qué objetos y habilidades existen: core/js/serie/catalogo.js; qué hacen en un juego: games/<juego>/js/ajustes.js (AJUSTES.fx) y su catálogo
- Economía y calibración de un juego: games/<juego>/js/ajustes.js. Sistemas comunes: core/js/sistema/
- Misiones y logros: games/<juego>/js/retos.js (datos); core/js/retos.js (sistema)
- Lo que solo tiene un juego se engancha con hook(...): nunca un if de juego dentro de core.
- Cada juego tiene su partida guardada y sus datos: nada se comparte entre juegos.

## Archivos
- Uno nuevo de core se apunta en COMUN (core/js/nucleo.js); uno de un juego, en NUCLEO.juego({...}) de su index.html.
- El orden importa: un archivo solo ve lo que se cargó antes. Todos comparten ámbito global: no repitas un const/let/function.
- Cada archivo empieza con un comentario de qué hace y 'use strict'. Ninguno por encima de ~25 KB: si crece, se parte.

## Probar y publicar
- python herramientas/servidor.py y abre http://localhost:8765/games/<juego>/ (--con-sw para probar el modo sin conexión).
- Cambio que no debe notarse: python herramientas/base.py y el comparador (/herramientas/pruebas/) en cada juego afectado.
- Publicar: sube el ?v= de nucleo.js en el index.html de cada juego afectado (si tocas core, en todos); si el jugador lo nota, entrada en NEWS.
- No hagas commit ni push sin que te lo pidan (git push sube main y gh-pages).
```

Y en `.claude/settings.json`, para que ni siquiera se abra por error lo que no sirve:

```json
{ "permissions": { "deny": ["Read(./_base/**)"] } }
```

`MAPA.md` es una propuesta (ver paso 1 y decisiones): un índice generado de todos los archivos con su tamaño y sus funciones. Si no se quiere, se quita esa línea del CLAUDE.md.

---

## 2. Cómo partir los archivos grandes

Regla general: **tramos seguidos, mismo orden, mismo texto**. Cada pieza nueva lleva arriba la línea de comentario de qué hace y `'use strict';`. Nada más cambia.

### 2.1 `core/js/serie/arte.js` (197 KB) → `core/js/serie/arte/` (14 archivos)

Estructura actual: ayudas de dibujo (l. 1-23), `const ART = { … }` con 145 dibujos (l. 24-1927), `BOX` (1928-1953), `SPR`, `buildSprites`, `drawVector` (1954-1983), campo del Rumble (1984-2174: `PATHS`, `STRUCT_SPOTS`, `THEMES`, `buildBG`, `decor`, `bigDecor`, `buildBridges`).

| Archivo nuevo | Contenido | Tamaño aprox. |
|---|---|---|
| `arte/base.js` | l. 1-23 (`shape`, `el`, `rr`, `poly`, `line`, `dot`, `heartPath`, `txt`, `starPath`, `otxt`, `spBg`) + `const ART = {}; const BOX = {};` | 3 KB |
| `arte/animales.js` | `Object.assign(ART, {…})` con bunny, squirrel, beaver, fox, meercat, junkcoon, mechavaca, vaca, huron, sp_bellotas, sp_botiquin, sp_pulgas, p_tower, p_base, p_rubble | 21 KB |
| `arte/nomuertos.js` | necrolord, skeleton, zombie, ghostmage, banshee, skullknight, stitchbrute, sombra, sp_lapidas, sp_formol, sp_eternas, sp_crunch, u_tower, u_base, u_rubble | 16 KB |
| `arte/streamers.js` | twitchking, subswarm, hypebeast, viralbot, snackmom, hypetrain, banhammer, hater, sp_donaciones, sp_merienda, sp_baneo, s_tower, s_base | 17 KB |
| `arte/heroes.js` | epicchampion, cupidarcher, hoplite, shieldmaiden, thundergod, medusa, minotaur, arpia, sp_rayo, sp_ambrosia, sp_nerfeo, h_tower, h_base | 18 KB |
| `arte/ciber.js` | cybermarine, drone, nanobot, cyberninja, techdroid, hackerkid, neonsniper, siegemech, dron, sp_orbital, sp_nanobots, sp_update, c_tower, c_base | 13 KB |
| `arte/memes.js` | memelord, suchdog, gifblaster, synthcat, trollbot, stonks, chonkcat, clickbait, sp_gatos, sp_likes, sp_confusion, m_tower, m_base | 16 KB |
| `arte/gamer.js` | progamer, noobs, speedrunner, modder, coleccionista, ragequitter, recreativa, campero, sp_critico, sp_energetica, sp_ping, sp_review, g_tower, g_base | 14 KB |
| `arte/olvidados.js` | vikingo, swarmbug, vikingsquad, retromarine, ghostagent, rockracer, titanbeta, espia, sp_cartuchos, sp_parchefan, sp_cancelado, o_tower, o_base | 14 KB |
| `arte/pop.js` | directora, extras, doble, detective, heroe, spoiler, kaiju, paparazzi, sp_taquilla, sp_maquillaje, sp_remake, k_tower, k_base | 15 KB |
| `arte/microblizz.js` | ceo, becario, starbot, fallen, cajabotin, soportebot, parchebot, sp_despido, e_tower, e_base, e_rubble, x_rubble | ~12 KB |
| `arte/phony.js` | presi, descargabot, licenciabot, plusbot, cobradlc, servidorbot, remasterbot, sp_cobro, y_tower, y_base | ~12 KB |
| `arte/sprites.js` | `Object.assign(BOX, {…})` (las 25 líneas de cajas, l. 1929-1953), `SPR`, `buildSprites`, `drawVector` | 6 KB |
| `arte/fondos.js` | l. 1984-2174: `THEMES` y el campo (pasa al Rumble en el paso 11) | 20 KB |

La suma de las 10 facciones medida con un guion sobre las 145 claves: 168 KB, ninguna por encima de 21,4 KB (empresas juntas daban 23,8 KB; por eso se separan en `microblizz` y `phony`).

Cómo se hace sin riesgo: un guion de un solo uso (no se sube) que corta cada `clave(c) { … }` por nombre y lo pega tal cual en su archivo. Comprobación: la lista de claves de `ART` es la misma (145) y el texto de cada dibujo es idéntico byte a byte.

Registro en `COMUN` de `core/js/nucleo.js` (sustituye a la línea de `arte.js`):

```js
    'js/serie/config.js',          // la serie: constantes y CFG (las cartas las añade cada facción)
    'js/serie/facciones/animales.js', 'js/serie/facciones/nomuertos.js', /* … las 11, ver 2.2 … */
    'js/serie/facciones/cierre.js',   // lo que se calcula con todas las cartas ya puestas
    'js/serie/arte/base.js',       // ayudas de dibujo, ART y BOX vacíos
    'js/serie/arte/animales.js', 'js/serie/arte/nomuertos.js', 'js/serie/arte/streamers.js', 'js/serie/arte/heroes.js',
    'js/serie/arte/ciber.js', 'js/serie/arte/memes.js', 'js/serie/arte/gamer.js', 'js/serie/arte/olvidados.js',
    'js/serie/arte/pop.js', 'js/serie/arte/microblizz.js', 'js/serie/arte/phony.js',
    'js/serie/arte/sprites.js',    // cajas, buildSprites y drawVector (después de todos los dibujos)
    'js/serie/arte/fondos.js',     // colores de cada facción (THEMES)
```

Para que la lista no crezca a mano en cada facción se puede añadir a `nucleo.js` un `const FACCIONES = ['animales', …]` y generar las dos series con un `map`. Es opcional; la lista explícita es más fácil de leer.

### 2.2 `core/js/serie/config.js` (59 KB) → `config.js` + `core/js/serie/facciones/`

Hoy `CFG.cards` (27 KB, l. 58-169), `CFG.enemyCards` (170-187), `CFG.units` (11 KB, 188-284), `TYPES` (295-363), `ROLES` y `FACTIONS` (381-424) están ordenados por facción dentro de cada objeto.

| Archivo | Contenido | Tamaño aprox. |
|---|---|---|
| `serie/config.js` | Constantes del campo (`W`, `H`, `RES`…), `FAC_BAL`, `CFG` sin cartas ni unidades (`cards: {}`, `units: {}`), `structs`, `diff`, `SKINS`, `TOPS`, `FACTION_ORDER`, `HEALER_SPELL`, `CORP`, `isCorp`, `losOf`, `capFirst`, `isLeader`, `cardDef`, `SUMMON_PARENT`, y `TYPES`, `ROLES`, `FACTIONS` vacíos con las claves en su orden actual | ~16 KB |
| `serie/facciones/<facción>.js` (animales, nomuertos, streamers, heroes, ciber, memes, gamer, olvidados, pop, microblizz, phony) | `FACTIONS.<f> = {…}`, sus cartas (`Object.assign(CFG.cards, …)` o `CFG.enemyCards` para las empresas), sus unidades (`CFG.units`), `TYPES`, `ROLES` y su lista de gashapón | 3-6 KB cada uno |
| `serie/facciones/cierre.js` | Lo que hoy se ejecuta al cargar y necesita todas las cartas: el bucle que añade «A los sanadores, un 50 % más» (l. 396) y el reparto de `GACHA_CARDS` (l. 398), los hechizos de las empresas (l. 403) | <1 KB |

Así «ajustar una carta» es abrir un archivo de unos 5 KB en vez de 59 KB.

### 2.3 Rumble: `games/rumble/js/`

Todos son tramos seguidos; las piezas se cargan en el mismo sitio de la lista de `NUCLEO.juego` de `games/rumble/index.html`, en el mismo orden.

| Archivo de hoy | Piezas (líneas) | Tamaño |
|---|---|---|
| `06-combate.js` (83 KB) | `06a-despliegue.js` (1-186: `spawnUnit`, `applySpawnMods`, `applyAbility`, `applyItem`, `doDeploy`…) · `06b-movimiento.js` (187-346: `acquire`, `moveToward`, `attack`, `zapChain`, `updatePassives`, `dmgMult`) · `06c-dano.js` (347-538: `hurt`, `kill`, `passiveKill`, `PROJ`, `shoot`, `updateProjs`) · `06d-unidades.js` (539-868: `updateUnit` y todos los `…Tick`, `bunnyJump`, `updateStruct`, `updateBoss`, `separate`) · `06e-ia-y-partida.js` (869-1061: `aiUpdate`, `aiGeneric`, `endMatch`, `updateGame`, `updateParts`, `FUR`, `deathFx`) | 14 / 12 / 18 / 23 / 16 KB |
| `07-dibujo.js` (70 KB) | `07a-escena.js` (1-155: `render`, `drawAmbient`, `drawWater`) · `07b-unidades.js` (156-315: `drawUnitShadow`, `drawUnit`, `drawEquip`, `drawWeapon`) · `07c-edificios-y-disparos.js` (316-520: `drawStruct`, `drawBars`, `drawProj`) · `07d-particulas.js` (521-649: `drawPart`, `drawGhost`) | 13 / 20 / 21 / 16 KB |
| `09-menus.js` (46 KB) | `09a-chat-y-campana.js` (1-205: chat falso, imagen para compartir, `buildCamp`, `openPrep`, `setupMatch`) · `09b-recompensas-y-hud.js` (206-431: `grantRewards`, `hud`, `showCardTip`, `selectCard`) · `09c-pantallas.js` (432-495: `startMatch`, `showEnd`) | 21 / 18 / 8 KB |
| `02-progresion.js` (46 KB) | `02a-objetos.js` (1-76: `ABILITIES`, `ITEMS`) · `02b-mundos.js` (77-128: `WORLDS`) · `02c-chat.js` (129-~240: `QUIPS`, `CHAT_PH`, `CHAT_FAC`) · `02d-chat-rival.js` (~241-363: `CHAT_VS`, `CHAT_BOSS`, `CHAT_UNIT`) · `02e-guardado.js` (364-417: `newSave`, `migrateSave`, utilidades de combate) | 7 / 8 / ~12 / ~14 / 5 KB |
| `05b-iahorro.js` (36 KB) | `05b-creadores-datos.js` (1-185: cartas, facción, campaña 3, frases, música) · `05c-creadores-arte.js` (186-380) | 21 / 15 KB |
| `retos.js` (29 KB) | `retos.js` (misiones, pase, nombre) · `retos-perfil.js` (desde l. 54: `avatares`, `nombre`, `perfil`… como `Object.assign(RETOS, {…})`) | 4 / 25 KB; si el segundo pasa de 25 KB, se separan los logros |
| `css/estilos.css` (43 KB) | `estilos-partida.css` (l. 1-200: escenario, marcador, bandeja, ventanas) · `estilos-extra.css` (201-406: mazo, gashapón de cartas, anuncios, avisos) | 19 / 24 KB |

`14-cartas-y-jefes.js` (34 KB) y `17-campos.js` (34 KB) se dejan para el final: están por encima de 30 KB pero son temas que se tocan poco. Si se parten, también por tramos (`14`: hechizos 1-183 / gashapón y mazo 184-352 / Modo Jefe 353-393; `17`: `TERRAINS` y su lógica 1-200 / dibujo 201-336).

### 2.4 TD: `games/td/js/`

| Archivo de hoy | Piezas (líneas) | Tamaño |
|---|---|---|
| `game.js` (76 KB) | `reglas.js` (1-279: casillas y camino, torres, `build`, ataques, pasivas, `ability`, enemigos, `spawnFoe`, `kill`) · `partida.js` (280-568: oleadas, `update`, `finish`, `startVS`, `aiThink`, fusión) · `dibujo.js` (569-766: `buildTDBackground`, `drawTower`, `drawFoe`, `drawProj`, `drawBoard`) · `interfaz.js` (767-928: `buildTray`, `hud`, `placePanel`, `tryBuild`, botones y arranque) | 21 / 22 / 20 / 14 KB |
| `data.js` (31 KB) | `datos-torres.js` (1-221: `TD`, `VS`, `TOWERS`, `PASSIVES`) · `datos-enemigos.js` (222-314: `FOES`, `ETRAITS`, `WORLDS_TD`, `LEVEL_RULE`) | 20 / 11 KB |

### 2.5 Core (sistemas y estilos)

| Archivo | Piezas | Tamaño |
|---|---|---|
| `sistema/horas-extra.js` (32 KB) | `horas-extra.js` (1-117: ganancias, ventana de líder, cobrar, `idleUI`) · `horas-extra-escena.js` (118-346: `idleSpecial`, `idleBuild`, `idleSim`, `idleDraw`) | 10 / 22 KB |
| `retos.js` (27 KB) | `retos.js` (1-224: misiones, pase) · `retos-pantallas.js` (225-359: logros, nombre, perfil, avisos, botones) | 17 / 11 KB |
| `css/menus.css` (57 KB, sin secciones marcadas) | 3 piezas seguidas por pantallas (portada y cartera / colección, inventario y gashapón / tienda, horas extra, pase y perfil), cortando por los selectores. Se cargan desde una lista `ESTILOS_COMUNES` en `nucleo.js` para no tener que tocar el `index.html` de cada juego cuando cambie | ~19 KB cada una |

Ojo: el corte de `menus.css` no puede usar `@import`. Lo que se pide con `@import` no entra en la lista `pedido` de `nucleo.js` y no se guardaría para jugar sin conexión.

---

## 3. Separar datos de lógica

| Dónde | Qué sacar | A dónde |
|---|---|---|
| `core/js/serie/config.js` | Cartas, unidades, tipos, roles por facción | `serie/facciones/<f>.js` (2.2). Se queda en `config.js` lo que es de la serie entera. |
| `core/js/serie/config.js` | Lo que solo usa el Rumble: `RIVER`, `BRIDGES`, `BASE_BRIDGES`, `BRIDGE_HALF`, `BOUNDS`, `ZONE`, `TRAY_Y`, `FIELD_DY`, `CFG.matchTime/doubleAt/chaos*`, `CFG.structs`, `CFG.diff` (el TD no usa ninguno: comprobado con grep) | `games/rumble/js/ajustes.js` o un `games/rumble/js/03-campo.js`. Así el juego tipo Vampire Survivors no carga números de otro juego. |
| `core/js/serie/arte.js` | El campo del Rumble (`PATHS`, `STRUCT_SPOTS`, `freeSpot`, `nearPath`, `distToSeg`, `buildBG`, `decor`, `bigDecor`, `buildBridges`). Solo lo llama el Rumble (`12-app-y-preparacion.js`, `21-arranque.js`). `THEMES` se queda en core porque el TD también lo usa. | `games/rumble/js/03-campo.js` |
| `games/rumble/js/02-progresion.js` | Casi todo es datos: objetos (7 KB), mundos (8 KB), frases del chat (26 KB) | `02a`…`02d` (2.3) |
| `games/rumble/js/05b-iahorro.js` | Datos de Los Creadores frente a su dibujo | `05b-creadores-datos.js` / `05c-creadores-arte.js` |
| `games/rumble/js/06-combate.js` | `PROJ` (proyectiles) y `FUR` (colores de pelo al morir) son tablas | Se pueden pasar a `02a-objetos.js` o a un `datos-combate.js` más adelante, después de partir el archivo (no a la vez) |
| `games/td/js/data.js` | Ya es solo datos; se parte en dos (2.4) | — |
| `games/rumble/js/retos.js` | Ya es solo datos; se parte en dos (2.3) | — |

Los números que hoy están escritos dentro de funciones del combate (por ejemplo, multiplicadores sueltos en `hurt`) se dejan como están en este plan. Sacarlos cambia código, no solo de sitio, y eso ya es otro tipo de trabajo.

---

## 4. Riesgos y cómo comprobar que no se rompe nada

### Riesgos generales

| Riesgo | Por qué | Cómo se evita / se comprueba |
|---|---|---|
| **Orden de carga** | Los archivos se cargan con `async = false`, en orden. Una función o `const` solo existe cuando su archivo ya se ha ejecutado. Si una pieza usa algo *al cargar* (no dentro de una función) que ahora está en una pieza posterior, falla (`ReferenceError`). | Partir solo en tramos seguidos y registrar las piezas en el mismo hueco y orden. Para `arte` y `config`, lo que se ejecuta al cargar va al final (`sprites.js`, `cierre.js`). |
| **Variables globales compartidas** | Todos los archivos comparten ámbito. Si un `const`, `let` o `function` acaba en dos piezas, el segundo archivo entero falla con «Identifier has already been declared» y el juego no arranca. | Cortar siempre entre declaraciones de primer nivel, nunca dentro. Comprobación: que juntar las piezas dé el archivo original (`cat piezas > x; diff x original`, quitando las dos líneas de cabecera añadidas). |
| **Orden de las claves** | `for…in` y `Object.keys` sobre `CFG.cards`, `FACTIONS`, etc. siguen el orden en que se añadieron. Si cambia, cambian el orden de la colección, los repartos al azar con semilla o el gashapón. | `config.js` declara los objetos con sus claves en el orden actual; cada facción rellena la suya. Además, el comparador apunta la «huella» (paso 1) y tiene que salir igual. |
| **Caché sin conexión** | `core/js/sw.js` guarda lo que la página dice que ha cargado (`pedido`), así que las piezas nuevas entran solas. Pero con el mismo `?v=` un jugador puede mezclar copias viejas y nuevas. | Subir el `?v=` en el `index.html` de cada juego afectado en cada paso. Probar una vez con `python herramientas/servidor.py --con-sw`: cargar, cortar la red en las herramientas del navegador y recargar. Nada de `@import` en CSS. |
| **El comparador** | `base.py` copia `core/` y `games/` del commit anterior a `_base/`, con su propio `nucleo.js`. Comparar antes y después de partir funciona aunque cambien los archivos. Pero compara textos, estilos y partida guardada: un dibujo que falte puede no salir como diferencia. | Paso 1: añadir al guion una «huella» (claves de `ART`, `BOX`, `CFG.cards`, `CFG.units`, `FACTIONS`, `TYPES`, `ROLES`, `TOPS`, en orden; número de sprites en `SPR`) y la lista de errores de la consola. Las dos versiones tienen que dar lo mismo. |
| **El repo antiguo del Rumble** | `games/rumble/README.md` dice que esta copia sale del original y que para actualizarla se vuelve a copiar. Tras partir los archivos del Rumble, ya no se podrá copiar archivo por archivo. Además, el clon antiguo (`../fans-of-rumble`) tiene 4 archivos cambiados sin commit (`app-android.yml`, `.gitignore`, `README.md`, `app/preparar.js`). | Solo afecta a los pasos del Rumble (6 a 9) y a `arte`/`config` (10 a 12). Es una decisión tuya (ver abajo). |
| **Documentación vieja** | `games/rumble/README.md`, `games/td/js/data.js` (l. 5) y `games/td/js/extras.js` (l. 17) hablan de `core/js/vendor/`, que ya no existe. Hacen buscar archivos que no están. | Se corrige en el paso 0. |

### Comprobación de cada paso (siempre la misma)

1. `python herramientas/base.py` (deja en `_base/` el commit anterior).
2. Hacer el corte. Si es por tramos, `diff` de las piezas juntas contra el original.
3. `python herramientas/servidor.py`, abrir `http://localhost:8765/herramientas/pruebas/` y pasar el guion en cada juego afectado (si se toca core, en los dos). Resultado esperado: sin diferencias y sin errores.
4. Abrir el juego, jugar 30 segundos y mirar la consola.
5. Subir `?v=` y hacer commit.

---

## 5. Orden de los pasos (de menos a más riesgo)

Cada paso cabe en una conversación corta y termina en un commit. Los pasos 0 y 1 no cambian nada del juego.

| # | Paso | Toca | Riesgo |
|---|---|---|---|
| 0 | Añadir `CLAUDE.md` y `.claude/settings.json`; corregir las referencias a `core/js/vendor/` en `games/rumble/README.md` y los comentarios de `games/td/js/data.js` y `extras.js` | docs | Ninguno |
| 1 | Herramientas: «huella» en el comparador y `herramientas/mapa.py`, que escribe `MAPA.md` (archivo, KB, funciones de primer nivel) | `herramientas/` | Ninguno para el juego |
| 2 | TD: partir `data.js` en 2 | solo TD | Muy bajo |
| 3 | TD: partir `game.js` en 4 | solo TD | Bajo |
| 4 | Rumble: partir `02-progresion.js` en 5 (datos) | solo Rumble | Bajo |
| 5 | Rumble: partir `05b-iahorro.js` en 2 y `retos.js` en 2 | solo Rumble | Bajo |
| 6 | Rumble: partir `06-combate.js` en 5 | solo Rumble | Bajo |
| 7 | Rumble: partir `07-dibujo.js` en 4 y `09-menus.js` en 3 | solo Rumble | Bajo |
| 8 | Core: partir `horas-extra.js` y `retos.js` en 2 cada uno | los dos juegos | Bajo |
| 9 | Rumble: partir `css/estilos.css` en 2 | solo Rumble | Bajo (el orden del CSS se mantiene) |
| 10 | Core: partir `arte.js` en `arte/` (14 archivos) con el guion de un solo uso | los dos juegos | Medio (huella obligatoria) |
| 11 | Pasar el campo del Rumble de `arte/fondos.js` a `games/rumble/js/03-campo.js` | los dos juegos | Medio |
| 12 | Core: partir `config.js` en `config.js` + `facciones/` + `cierre.js` | los dos juegos | Medio-alto (orden de claves y código que corre al cargar) |
| 13 | Pasar las constantes del campo del Rumble de `config.js` al Rumble | los dos juegos | Medio |
| 14 | Core: partir `menus.css` en 3 con `ESTILOS_COMUNES` en `nucleo.js` | los dos juegos y `nucleo.js` | Medio |
| 15 | Opcional: `14-cartas-y-jefes.js` y `17-campos.js` | solo Rumble | Bajo |

Después de cada paso se regenera `MAPA.md` (si se aprueba) y se actualizan `core/LEEME.md` y `README.md` donde nombren archivos que cambian de sitio.

---

## 6. Qué tareas leerían menos

Cuentas aproximadas: 1 KB de este código son unos 300-350 tokens. «Hoy» supone que se respeta la regla de no leer enteros los archivos grandes, así que incluye los `grep` y los rangos necesarios; con líneas de hasta 1200 caracteres, esos rangos salen caros.

| Tarea típica | Hoy | Después |
|---|---|---|
| Cambiar el dibujo de un personaje | `grep` + rangos de `arte.js` (197 KB) y de `config.js` para `TYPES`/`BOX`/`TOPS`; varias vueltas para encontrar la clave. Unos 30-40 KB leídos | `arte/<facción>.js` (13-21 KB) + `facciones/<facción>.js` (~5 KB). Unos 20-25 KB, y a la primera |
| Ajustar el balance de una carta | Rangos de `config.js` (59 KB) + `ajustes.js` del juego. Unos 15-20 KB | `facciones/<facción>.js` (~5 KB) + `ajustes.js` (1-6 KB). Unos 6-10 KB |
| Añadir un objeto o habilidad | `catalogo.js` (6 KB) + rangos de `02-progresion.js` (46 KB) + `06-combate.js` (`applyItem`) + `07-dibujo.js` (`drawEquip`) + el catálogo del TD. Unos 35-50 KB | `catalogo.js` + `02a-objetos.js` (7 KB) + `06a-despliegue.js` (14 KB) + `07b-unidades.js` si se ve (20 KB) + `td/js/catalogo.js` (7 KB). Unos 25-50 KB, pero sin búsquedas |
| Cambiar una torre o un enemigo del TD | `data.js` (31 KB) + rangos de `game.js` (76 KB) | `datos-torres.js` o `datos-enemigos.js` (11-20 KB) + `reglas.js` (21 KB) si cambia la lógica |
| Añadir una misión o un logro del Rumble | `retos.js` (29 KB) | `retos.js` (4 KB) o `retos-perfil.js` |
| Cambiar una frase del chat | `02-progresion.js` (46 KB) | `02c-chat.js` o `02d-chat-rival.js` (12-14 KB) |
| Retocar una pantalla común | `menus.css` (57 KB) + el sistema | Una pieza de `menus.css` (~19 KB) + el sistema |
| Empezar el tercer juego | Leer `LEEME.md` + averiguar qué de `arte.js` y `config.js` es del Rumble | `LEEME.md` + `MAPA.md`; core ya no trae el campo ni los números del Rumble |

En las tareas de datos y dibujo, que son las más frecuentes, el ahorro es de 3 a 5 veces. En las de lógica del combate es menor, pero desaparecen las búsquedas a ciegas.

---

## Decisiones que necesito de ti

1. **¿Cuál es el Rumble bueno?** Si el repo antiguo (con la compilación Android) va a seguir recibiendo cambios que luego se copien aquí, los pasos 4-7, 9 y 10-13 lo complican. Recomiendo hacer ya los pasos 0-3 y 8 (no dependen de esto) y esperar tu respuesta para el resto.
2. **¿Generamos `MAPA.md` automáticamente?** Recomendado: sí, con `herramientas/mapa.py`, regenerado en cada commit (a mano o con un gancho de git).
3. **¿Dónde abres Claude?** Recomendado: en la carpeta del repo (`fans-of-rumble-td`), no en la de arriba, que también tiene el repo antiguo y `fans-of.zip` (5,7 MB).
4. **¿Sacamos de core lo que es solo del Rumble?** Hablo del campo y sus números (pasos 11 y 13). Recomendado: sí, antes de empezar el tercer juego.
5. **¿Versión y publicación en cada paso o al final?** Recomendado: subir el `?v=` en cada commit (lo pide el README), pero publicar en `gh-pages` solo cuando se cierre un bloque (por ejemplo, tras el paso 9 y tras el 14).
