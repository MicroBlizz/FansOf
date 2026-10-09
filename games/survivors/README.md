# Fans of Survivors

Tercer juego de la serie Fans Of, estilo *Vampire Survivors*: CrazyBunny contra oleadas de bots de Microblizz y Phony.
Te mueves tú; las cartas de Animales Locos disparan solas. Recoges cristales de CAOS, subes de nivel y eliges 1 de 3 mejoras.
Aguantas 10 minutos y llega el jefe final, SurvivalBot.

Está hecho como el TD: carga todo `core/` con `NUCLEO.juego` (personajes, sonido y música, partida guardada y nube, cartera,
colección, inventario, biblioteca, gashapón, tienda, horas extra, misiones, logros, pase y perfil). Lo propio de este juego va aquí.

## Cómo se une con el progreso
- **CrazyBunny (el líder)**: su nivel, su habilidad y sus 3 objetos mejoran al personaje y a todas las armas.
- **Las otras 6 cartas** de tu facción son armas: el nivel de cada carta sube el daño de su arma; su habilidad, solo esa arma.
- **Facciones**: Animales Locos siempre está abierta; las otras 8 (No-Muertos, Streamers, Héroes, Ciberpunks, Memes, Comunidad Gamer, Olvidados y Cultura Pop) se abren con los minutos aguantados en total (`DESBLOQUEO`) y se eligen bajo JUGAR. Cada una tiene 8 armas (2 del líder + 1 por carta).
- Al acabar: oro (por minuto aguantado, bajas y victoria), gemas si ganas, experiencia para las cartas usadas y puntos de pase.

## Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | La página (la misma estructura que el TD). **La versión va en el `?v=` de nucleo.js.** |
| `js/ajustes.js` | Se carga antes de lo común: partida guardada (`fosurv-save`), economía, premios y qué hace aquí cada habilidad y objeto (`fx`). |
| `js/datos.js` | **Las cifras de la partida**: jugador, armas, mejoras, enemigos, oleadas por minuto, momentos especiales y jefe. |
| `js/datos-facciones.js`, `js/datos-facciones-2.js` | Las armas de las otras 8 facciones (cifras base, mejoras de nivel, `DESBLOQUEO`). |
| `js/armas-tipos.js` | Cómo dispara, se mueve y se dibuja cada tipo de arma de esas facciones (bala, nova, bomba, golpe, rayo, onda, charco, corre, aura, órbita, escudo). |
| `js/facciones.js` | El botón y la lista para elegir facción. |
| `js/catalogo.js` | Habilidades y objetos de este juego, lo que suma cada carta (`cardMods`), lo que pregunta la colección y la partida guardada. |
| `js/sonido.js` | Silencio, volúmenes y qué canción suena. |
| `js/retos.js` | Misiones, logros y perfil de este juego. |
| `js/juego.js` | La partida: moverse, oleadas, enemigos, daño, cristales, subir de nivel, ganar y perder. |
| `js/armas.js` | Lo que hace cada arma. |
| `js/dibujo.js` | El suelo, los personajes, los efectos y el marcador. |
| `js/menus.js` | Menú principal, opciones y lo que piden los sistemas comunes (`goHome`, `enPartida`…). |
| `js/interfaz.js` | Tamaño, controles (dedo, WASD, flechas), subir de nivel, pausa, final con premios y el bucle. Se carga el último. |
| `js/novedades.js` | Las novedades. |
| `idioma/en.js`, `idioma/en-facciones.js` | El inglés de este juego (y el de las armas de las facciones). |

## Todavía no tiene (prototipo)
Anuncios y tutorial guiado. Las facciones nuevas aún no tienen pasivas propias (solo sus armas).
Desde 0.1.2 el servidor hace el gashapón y la economía (`AJUSTES.servidor`) y pone topes a los premios de cada partida; sus cifras se suben con `python herramientas/subir_datos.py survivors`.
