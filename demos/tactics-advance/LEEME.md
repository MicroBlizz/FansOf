# Fans of Tactics Advance (prototipo)

Un prototipo para enseñar **el aspecto y el ritmo** de un juego táctico por casillas con el mundo de Fans of Rumble,
en pixel art de consola portátil (240 × 160, como la Game Boy Advance). Es un juego nuevo de la serie: **no sustituye**
a Fans of Rumble: Tácticas (`games/tacticas`, el de barras de tiempo), que sigue igual.

De momento **se mira, no se juega**: un turno completo de CrazyBunny que se repite. Se puede parar, mover con la barra
y cambiar de escenario. **No toca nada más**: no usa `core/`, ni partida guardada, ni Supabase. Si se descarta la idea,
se borra esta carpeta (y su ficha de la Biblioteca en el `index.html` de la raíz) y ya está.

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
- **El turno**: elegir a CrazyBunny, casillas azules de movimiento, cursor, saltos con polvo, Salto caótico
  (se agacha, salta, aplasta: onda, chispas, espirales, temblor y destello), queja del enemigo y su turno.

## Archivos (js/), en el orden en que se cargan

| Archivo | Qué hace |
|---|---|
| `textos.js` | Los textos en inglés (en el código y en la página van en español), `tr()` y la traducción de la página |
| `pixel.js` | El pincel de píxeles: formas, tres tonos, contornos, trama de Bayer y `hash` |
| `personajes.js` | CrazyBunny, EpicChampion, el esqueleto, el becario, StarBot y el retrato grande de CrazyBunny |
| `decorados.js` | Tumbas, cruz, árboles, arbusto, farol, cripta, mesa, planta, fuente, cajas y archivador |
| `mapa.js` | El mapa (alturas y suelos), la textura de cada casilla, el agua, las casillas marcadas y el cursor |
| `escenas.js` | Los dos escenarios: suelos, decorados, enemigo, norma del día y queja |
| `fondo.js` | El cielo de cada escenario, las nubes, las luciérnagas y el letrero de Microblizz |
| `letras.js` | La letra de píxeles, la pequeña de 3 × 5 y las cifras gordas del daño |
| `ventanas.js` | Marcos, barras, manita, flecha, ficha, menús, norma y bocadillo |
| `demo.js` | El turno: dónde está cada cosa en cada instante, la cámara, los efectos y las ventanas |
| `principal.js` | Traduce la página, la escala del lienzo, el bucle y los botones |

`idioma/en-raiz.js` es el inglés de la ficha en la Biblioteca de la página de la raíz.
