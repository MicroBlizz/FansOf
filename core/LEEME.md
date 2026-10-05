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
| `js/serie/` | La serie: facciones, cartas y sus números (`config`), dibujos (`arte`), canciones, frases de humor e iconos. |
| `js/sistema/` | Los sistemas: utilidades y ganchos, sonido y música, pantallas comunes (cartera, niveles, avisos), colección, inventario, gashapón, tienda, horas extra y opciones comunes. |
| `js/retos.js` | Misiones, logros, pase de batalla, premio diario y perfil. Los datos los pone cada juego en su `js/retos.js`. |
| `js/novedades.js` | El informe de parches. La lista (`NEWS`) la pone cada juego en su `js/novedades.js`. |
| `js/sw.js` | Jugar sin conexión. Cada juego lo usa desde un `sw.js` de dos líneas en su carpeta. |
| `css/` | `base.css` (colores, letras, marco) y `menus.css` (las pantallas comunes). |

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

Además usa lo que por ahora define cada juego: `SAVE` y `saveGame()`, `ECON`, `ABILITIES`, `ITEMS`, `SHOP`, `uSave`, `invGet`, `statsOf`, `valsOf` y el resto del catálogo.

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

- **Guardado y catálogo de habilidades y objetos.** El Rumble los tiene en `js/02-progresion.js`; el TD, en `core/js/meta.js` y `core/js/save.js` (que por ahora solo usa él).
- **El resto de Opciones** (volumen, lo que se ve en la partida, pasar o borrar el progreso): depende del guardado.
- **Estilos.** `css/menus.css` se genera desde los del Rumble con `python herramientas/sincronizar.py`.
