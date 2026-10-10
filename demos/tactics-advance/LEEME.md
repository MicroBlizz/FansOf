# Fans of Tactics Advance (prototipo)

Un prototipo para enseñar **el aspecto y el ritmo** de un juego táctico por casillas con el mundo de Fans of Rumble,
en pixel art de consola portátil (240 × 160, como la Game Boy Advance). Es un juego nuevo de la serie: **no sustituye**
a Fans of Rumble: Tácticas (`games/tacticas`, el de barras de tiempo), que sigue igual.

Es **jugable** y ocupa **toda la pantalla**. La primera vez sale la **presentación** (Arkioner y Pepins presentan y cuatro
viñetas con la historia; se puede saltar). Luego el **título** (logo, una islita con CrazyBunny, EpicChampion y un esqueleto, y
«Toca para empezar») y el menú principal: Jugar, **Tutorial** (con Lola, paso a paso), Opciones (idioma, pantalla completa,
ver la presentación) y Biblioteca. Hay elegir batalla, pausa y final. Zoom con dos dedos, rueda del ratón o los botones + y −; arrastrar
mueve la cámara. Cada batalla es de 2 contra 4 por turnos. Tocas a CrazyBunny o a EpicChampion y eliges Mover (casillas
azules), Atacar o Técnica (zona roja; se toca dos veces al enemigo para confirmar) o Esperar. Luego juega Microblizz.
**No toca nada más**: no usa `core/`, ni partida guardada, ni Supabase. Si se descarta la idea, se borra esta carpeta
(y su ficha de la Biblioteca en el `index.html` de la raíz) y ya está.

Lo visto (la presentación y el tutorial) se apunta en este navegador (`fota-intro`, `fota-tutorial`).

Los scripts de `index.html` llevan `?v=`: al cambiar el juego, súbelo en todos para que el navegador no mezcle archivos viejos y nuevos.

Se abre con `python herramientas/servidor.py` y http://localhost:8765/demos/tactics-advance/ (con `?idioma=en` sale en inglés).

## Qué enseña

- **Mapa en diagonal con alturas** (10 × 10): hierba con matas, tierra, losas con musgo, acantilados con vetas,
  agua con espuma que se mueve. Cada casilla se pinta una vez píxel a píxel; el agua, en cada fotograma.
- **Personajes dibujados con código** (el pincel de Fans of Roguelite): tres tonos por pieza y contorno de color.
  CrazyBunny de tres cuartos (corona, capa naranja, ojo en espiral que gira al saltar, zanahoria de garrote),
  EpicChampion, el esqueleto pirata, el becario con su café y StarBot. Retrato grande de CrazyBunny en la ficha.
- **Dos escenarios**: el Cementerio de juegos al atardecer (mar de nubes, faroles, luciérnagas, cripta) y las Oficinas
  de Microblizz de noche (moqueta, mesas, cajas de despido, fosos de servidores, la ciudad y el letrero de Microblizz).
- **Ventanas de consola**: letra de píxeles propia con minúsculas y tildes, la manita, la norma del día, la ficha con
  VIDA y CAOS, menú y submenú, probabilidad de acierto, el daño que salta y el bocadillo del enemigo.
- **Las reglas** (todo en `reglas.js`): vida, CAOS, ataque, defensa, movimiento y cuánto puede subir cada uno de un salto.
  Desde más arriba se acierta más y se pega más fuerte. Técnicas: Salto caótico (CrazyBunny, 12 de CAOS, a 3 casillas, sin
  importar la altura) y Tajo épico (EpicChampion, 10). Se gana CAOS cada turno y al golpear. StarBot dispara a 3 casillas.
- **Microblizz** mueve a cada uno hacia quien pueda pegar (mejor al que menos vida tenga y desde arriba) o se acerca.
- **Animaciones**: saltos de casilla en casilla con polvo, embestida, Salto caótico (se agacha, salta, aplasta: onda,
  chispas, espirales, temblor y destello), láser, números, parpadeo al caer y bocadillos con quejas.
- Con ratón: el cursor sigue a la casilla y al pasar por un objetivo se ve el acierto y el daño. Arrastrar mueve la cámara;
  Esc o el botón derecho vuelven atrás (Esc sin nadie elegido abre la pausa). En los menús, flechas e Intro.
- **Dos tamaños de píxel**: el mundo se pinta en un lienzo y las ventanas en otro; cada uno se amplía un número entero de
  veces. El de las ventanas lo decide la pantalla (caben 200 × 170) y el del mundo, el zoom.

Las cifras son de prueba. Jugando a lo bruto (siempre atacar al primero que pilla) se gana casi siempre, a veces por poco.

## Archivos (js/), en el orden en que se cargan

| Archivo | Qué hace |
|---|---|
| `textos.js` | Los textos en inglés (en el código y en la página van en español), `tr()` y la traducción de la página |
| `pixel.js` | El pincel de píxeles: formas, tres tonos, contornos, trama de Bayer y `hash` |
| `personajes.js` | CrazyBunny, EpicChampion, el esqueleto, el becario, StarBot y el retrato grande de CrazyBunny |
| `decorados.js` | Tumbas, cruz, árboles, arbusto, farol, cripta, mesa, planta, fuente, cajas y archivador |
| `mapa.js` | El mapa (alturas y suelos), la textura de cada casilla, el agua, las casillas marcadas y el cursor |
| `escenas.js` | Los dos escenarios: suelos, decorados, norma del día y queja del enemigo |
| `fondo.js` | El cielo de cada escenario, las nubes, las luciérnagas y el letrero de Microblizz |
| `letras.js` | La letra de píxeles, la pequeña de 3 × 5 y las cifras gordas del daño |
| `ventanas.js` | Marcos, barras, manita, flecha, ficha, menús, norma y bocadillo |
| `reglas.js` | Personajes y sus cifras, técnicas, salidas, caminos, objetivos, acierto, daño y lo que decide Microblizz |
| `dibujo.js` | Pinta la batalla: cielo, mapa, casillas marcadas, decorados, personajes con su pose y los efectos |
| `interfaz.js` | Las ventanas de la batalla pegadas a los bordes (fichas, órdenes, botones de pausa y zoom, carteles, pista) |
| `pantallas.js` | Menú principal, elegir batalla, cómo se juega, opciones, pausa y final (ventanas con la manita) |
| `intro.js` | La presentación (viñetas con texto a máquina) y la pantalla de título con la isla y el logo |
| `tutorial.js` | El tutorial con Lola: los pasos, qué se deja hacer en cada uno, la casilla que parpadea y su tarjeta |
| `juego.js` | El estado de la batalla, los turnos, las órdenes y las acciones animadas; la cámara |
| `controles.js` | Tocar, arrastrar, pellizcar, rueda, pasar el ratón y teclado; qué hay debajo de un punto; la pista |
| `principal.js` | Pantalla completa, tamaño del píxel de las ventanas y del mundo (zoom), el bucle y el menú principal |

`idioma/en-raiz.js` es el inglés de la ficha en la Biblioteca de la página de la raíz.
