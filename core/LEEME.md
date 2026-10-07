# core · lo común a todos los juegos de Fans Of

Aquí hay **una sola copia** de cada cosa que comparten los juegos. Un juego no copia nada de `core/`: lo carga.
La regla es: **los sistemas se heredan, los datos son de cada juego.**

## Cómo se carga

Cada juego pone en su `index.html` el cargador, con su versión, y le dice sus estilos y sus archivos:

```html
<script src="../../core/js/nucleo.js?v=0.9.6"></script>
<script>NUCLEO.estilos('../../core/css/base.css', 'css/mi-juego.css')</script>
…
<script>NUCLEO.juego({ antes: ['js/novedades.js'], despues: ['js/mi-juego.js'] })</script>
```

`core/js/nucleo.js` carga, en este orden: los archivos de `antes`, lo común (su lista `COMUN`) y los de `despues`.
Un archivo nuevo de `core/` se apunta en `COMUN` y lo reciben todos los juegos.

La versión se escribe **solo** en ese `?v=`. De ella salen `VERSION`, el `?v=` de cada archivo y la copia para jugar sin conexión.

## Qué hay

| Carpeta | Qué es |
|---|---|
| `js/serie/` | La serie: facciones, cartas y sus números (`config`), dibujos (`arte`), canciones, frases de humor, iconos y el catálogo de habilidades y objetos (qué existen; lo que hacen lo dice cada juego). |
| `js/sistema/` | Los sistemas: utilidades y ganchos, sonido y música, progreso (economía, calidades, tienda y partida guardada), pantallas comunes (cartera, niveles, avisos), colección, inventario, gashapón, tienda, horas extra y opciones comunes. |
| `js/retos.js`, `js/retos-pantallas.js` | Misiones, pase de batalla y premio diario (`retos.js`); logros, nombre, perfil, avisos y botones (`retos-pantallas.js`). Los datos los pone cada juego en su `js/retos.js`. |
| `js/novedades.js` | El informe de parches. La lista (`NEWS`) la pone cada juego en su `js/novedades.js`. |
| `js/sw.js` | Jugar sin conexión. Cada juego lo usa desde un `sw.js` de dos líneas en su carpeta. |
| `css/` | `base.css` (colores, letras, marco) y `menus.css`, `menus-tienda.css` y `menus-extra.css` (las pantallas comunes). Cada juego pide `menus.css` y NUCLEO.estilos carga las tres, y después su propia hoja, con lo suyo. |

Cada archivo empieza con un comentario que dice qué hace y qué necesita del juego.

## Lo que un juego le da a lo común

Lo común nunca mira dentro del juego: le pregunta con estas funciones, que el juego define con estos nombres.

| Función | Para qué |
|---|---|
| `facNow()` | La facción con la que juega el jugador. |
| `enPartida()` | `true` mientras se está jugando. |
| `goHome()` | Volver al menú principal. |
| `isUnlocked(fac)` | Si el jugador tiene ya esa facción. |
| `effStats(k, fac)` | Los números de una carta con lo que lleva puesto (`boosts`: la lista de mejoras). |
| `cardStats(k, es)`, `cardDesc(k)`, `passiveText(fac)` | Los textos de una carta y de una pasiva en la colección. |
| `idlePower(fac)` | El poder de un líder en horas extra (1 = nivel 1 sin nada). |
| `idleFrame(dt)` | No se define: hay que **llamarla** en cada fotograma mientras se ve el menú. |
| `sonidoApagado()`, `volGeneral()`, `volMusica()` | El silencio y los volúmenes (de 0 a 1). |
| `musicUpdate()` | Qué canción toca en cada momento: llama a `musicSet('nombre')`. |
| `titlePopups()` | Qué ventanas salen solas al volver al menú (novedades, premio diario…). |

Y, para el progreso (ver `js/sistema/progreso.js`):

- **Antes** de lo común, en su `js/ajustes.js`: `AJUSTES.guardado` (el nombre de su partida guardada; cada juego tiene la suya y nunca se comparten) y `AJUSTES.econ` (los números de economía que cambia o añade).
- **Después**: `ABILITIES = catalogo('ab', {…})` e `ITEMS = catalogo('eq', {…})` con lo que hace cada habilidad y objeto en ese juego, `newSave()` y `migrateSave()` con la forma de su partida, y `SAVE = loadSave()`.

## Ganchos: lo que solo tiene un juego

Cuando un juego tiene algo que los demás no (mazos, anuncios, un tutorial), no se toca el archivo común: el juego lo engancha.

```js
hook('tienda', () => { /* añado mi oferta a #gift-row */ });
```

| Gancho | Cuándo salta |
|---|---|
| `pantalla` (id) | Al abrir una pantalla. |
| `insignias` | Al repasar los puntos rojos del menú. |
| `coleccion.arriba` (fac), `coleccion.abajo` (fac, bloqueada) | Al pintar la colección: lo que devuelvan (HTML) va antes o después de las cartas. |
| `coleccion.nombre` (k) | Junto al nombre de cada carta (HTML). |
| `coleccion.lista` (lista) | Con la colección ya pintada. |
| `coleccion.abrir` () | Al entrar en la colección desde el menú principal (antes de pintarla). |
| `equipar` (tipo) | Al ponerle una habilidad o un objeto a una carta. |
| `gacha.abierto`, `gacha.textos`, `gacha.tirada` (n) | Al entrar en el gashapón, al escribir sus textos y después de tirar. |
| `tienda` | Con la tienda ya pintada. |
| `idle.ui`, `idle.box` | Con el panel de horas extra y con su ventana de cobrar ya pintados. |
| `idle.equipo` (unidad, tipo, lienzo, capa), `idle.disparo` (tipo) | Al dibujar al líder en la escena y al elegir el color de su disparo. |

Un gashapón propio se añade en `MAQUINAS` (ver `js/sistema/gachapon.js`), y efectos de sonido propios, con `tone()` o `Object.assign(SFX, {…})`.

## Antes de publicar un cambio en core

Pásalo por el comparador: `python herramientas/base.py`, `python herramientas/servidor.py` y abre `http://localhost:8765/herramientas/pruebas/`.
Ejecuta el mismo guion en la versión anterior y en la nueva, en cada juego, y enseña en qué se diferencian.

## Lo que todavía no es común

- **El resto de Opciones** (volumen, lo que se ve en la partida, pasar o borrar el progreso): cada juego tiene todavía las suyas.
- **Los colores y el marco** (`css/base.css`): el Rumble lleva todavía los suyos, iguales, al principio de `css/estilos-partida.css`.

## Idiomas

El español es el idioma de origen: todo el código y los datos están en español. Si el jugador usa otro idioma, se cargan diccionarios que dicen cómo se traduce cada frase tal cual está escrita. Hoy hay español (`es`) e inglés (`en`).

- **Cuál se usa**: el que se elija en Opciones (se guarda en este navegador, `fansof-idioma`) o, si no se ha elegido, el del navegador (`es` → español, cualquier otro → inglés). Lo decide `nucleo.js` (`NUCLEO.idioma`, `NUCLEO.elegirIdioma(i)`), y cambiarlo recarga la página.
- **Qué hace `js/sistema/idioma.js`**: `IDIOMA.add({...})` registra frases. Una frase exacta es `'Volumen': 'Volume'`; una con huecos usa `%1`, `%2`… (`'Nivel %1': 'Level %1'`) o `%#1` si el hueco es solo un número. Todo lo que sale en pantalla (textos y `title`, `aria-label`, `placeholder`, `alt`) se traduce solo, aunque lo escriba el juego más tarde. En español no hace nada.
- **Los textos armados por trozos** («HABILIDAD: Cafeína, calidad Senior. Toca para cambiar») se traducen frase a frase: se corta por ` · `, por frases y por comas. Por eso hay trozos sueltos en los diccionarios.
- **Lo que se dibuja en un canvas** no es texto de la página: se traduce a mano con `tr('texto')` (en español devuelve lo mismo).
- **Dónde están los diccionarios**: `core/idioma/en-*.js` (lo común) y `games/<juego>/idioma/en-*.js` (lo de cada juego, que los pide en `NUCLEO.juego({ idioma: { en: [...] } })`). Un archivo nuevo de lo común se apunta en `DICCIONARIOS` de `nucleo.js`.
- **Un idioma nuevo**: crea `core/idioma/<id>-*.js` y los de cada juego, añade el id a `IDIOMAS` y sus archivos a `DICCIONARIOS`, y ponlo en el botón de Opciones.
- **Cómo se comprueba**: `python herramientas/idioma.py` pasa el guion del comparador en inglés y lista lo que sigue en español (con `--todo` guarda esa lista en un archivo). `python herramientas/comprobar.py` sigue comparando el español.
- **Una frase nueva en el juego**: escríbela en español, como siempre, y añade su inglés al diccionario del juego (o de core si la usan los dos).
- **Para cazar lo que se ha quedado sin traducir mientras juegas**: en la consola del navegador, `localStorage.setItem('fansof-idioma-depura', '1')`, recarga, juega, y `IDIOMA.pendientes()` lista los textos que han salido en español.

## Modo desarrollo

`NUCLEO.desarrollo` es verdadero en `localhost`/`127.0.0.1`, o con `?dev=1` en la dirección (se recuerda en este navegador; `?dev=0` lo apaga). Entonces `nucleo.js` carga al final `js/sistema/desarrollo.js`, que añade un botón «DEV» abajo a la izquierda con un panel de utilidades: datos del juego y la versión, cambiar de idioma, apuntar y listar los textos sin traducir, ver / cargar / borrar la partida y borrar la caché del modo sin conexión. En la web publicada no se carga ni se ve. Con `?devabrir=1` el panel sale abierto. Para añadir una utilidad, apúntala en `UTILIDADES` de ese archivo. El comparador de `herramientas/pruebas/` lo apaga a propósito para que no salga en las pantallas.
