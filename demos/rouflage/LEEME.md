# Fans of Rouflage (prototipo)

**El escondite con pintura.** Un prototipo jugable de la idea «Amungameleon»: personajes tipo alubia vistos desde arriba y camuflaje
pintándose el cuerpo. Es un juego nuevo de la serie Fans Of y no toca ninguno de los otros.

La estación de Microblizz, de noche. Los fans se cuelan, se pintan como el suelo (o como la pared) y se quedan congelados. Los
becarios vigilantes salen de Recursos Humanos con su linterna y sus cartas de despido. Se juega en los dos papeles, contra bots
(aún no hay partidas en red):

- **Camaleón**: 45 s para elegir sitio, pintarte y congelarte; luego 90 s de caza con dos becarios bot y tres compañeros bot.
- **Cazador**: 120 s para encontrar a cinco colados bot, con 5 cartas de despido.

Se abre con `python herramientas/servidor.py` y http://localhost:8765/demos/rouflage/ (con `?idioma=en` sale en inglés y con
`?modo=camaleon` o `?modo=cazador` entra directo a una partida).

## Qué enseña (y de dónde sale)

Es la Fase 1 del plan (el camuflaje, en local) y la parte de reglas de la Fase 2 (papeles y castigo por fallar), sin red:

- **Cuentagotas y pinceladas con el dedo.** En el taller la cámara se acerca a tu alubia. Tocar el suelo coge su color; arrastrar
  sobre el cuerpo lo pinta (tres gordos de pincel, rellenar, deshacer). El **Calco** deja ver el suelo a través del cuerpo.
- **Congelar.** El contorno negro, la sombra, el visor y los adornos (orejas, cola, corona) se desvanecen en medio segundo: solo
  queda la pintura. Los adornos se esconden siempre, así ninguno da ventaja.
- **Medidor de camuflaje.** Compara, punto a punto, tu piel con lo que tienes detrás. Lo que tapa un mueble no cuenta.
- **Los dos papeles** y el **castigo por fallar**: disparar donde no hay nadie es un «despido improcedente»: gasta una carta, deja
  la linterna a medias un rato y alarga la espera. Acertar devuelve la carta. Sin cartas, se pierde.
- **Silbido obligatorio** cada 28 s: todos los escondidos silban y los cazadores saben por dónde buscar (la zona, no el punto).
- **Mapa con mucho dibujo**: siete salas, cada una con su suelo y su papel de pared. Ningún suelo es liso: rellenarse de un solo
  color deja el camuflaje en torno al 50 %.
- **Bots.** El becario bot no hace trampas: solo «ve» con la misma medida de camuflaje que tu marcador (ver `bot-cazador.js`).
  Los camaleones bot se pintan con más o menos maña, tiemblan si los alumbras de cerca y los torpes salen corriendo.

Lo que **no** tiene todavía: partidas en red, poses, más mapas, cosméticos, gachapón, pase de batalla ni anuncios.

## Para tocar las reglas

Todas las cifras están juntas en `AJUSTES`, al principio de `js/entes.js`: tiempos, velocidades, cartas, alcance, linterna y lo
fino que hilan los becarios bot (`vistaCerca` y `vistaLejos`: más alto = más fácil colarse). El mapa (salas, puertas, muebles y
carteles) está en `js/mapa-datos.js`, en listas.

Con esas cifras, en unas 600 partidas simuladas (un camaleón quieto en un sitio al azar) sobrevive más o menos así según su
camuflaje: menos del 50 %, casi nunca; 50-59 %, una de cada diez; 60-69 %, una de cada tres; 70-79 %, tres de cada cuatro;
80 % o más, siempre. Es una simulación con bots: falta ver qué cifras saca una persona pintando con el dedo.

## Cómo está hecho

HTML + JavaScript + Canvas, sin compilar. De `core/` solo carga el sonido y las canciones de la serie, sin cambiarlos. No usa
partida guardada ni Supabase; en el navegador solo apunta el sonido, la música y si ya se ha visto la ayuda (`rouflage-mudo`,
`rouflage-sin-musica`, `rouflage-ayuda`).

El mapa se pinta entero una vez al arrancar (al doble de tamaño, para que se vea nítido) y otra a tamaño real para guardar el color
de cada punto: de ahí leen el cuentagotas y el medidor. Cada alubia tiene su propio lienzo de «piel». Al pintarse, el trozo de
mapa que se ve se vuelve a pintar ampliado.

Los scripts de `index.html` llevan `?v=`: al cambiar el juego, súbelo en todos para que el navegador no mezcle archivos.

| Archivo (`js/`) | Qué hace |
|---|---|
| `textos.js` | El inglés de todos los textos y `tr()` |
| `util.js` | Números, azar repetible, colores, lienzos y formas con contorno |
| `audio.js` | Lo que pide el motor de sonido de la serie y los efectos propios |
| `mapa-datos.js` | El mapa en datos: salas, pasos, muebles, carteles y la rejilla |
| `suelos.js` | El dibujo del suelo de cada sala y las manchas |
| `paredes.js` | Muros, paredes de frente (papeles) y carteles |
| `muebles.js` | Mesas, máquinas, cajas…: lo que ocupan y cómo se dibujan |
| `alubia.js` | El personaje: silueta, piel, visor y adornos de cada animal |
| `mapa.js` | Pinta el mundo, guarda el fondo y la «verdad», y responde: ¿se pisa?, ¿se ve?, ¿por dónde se va? |
| `pintura.js` | Trazos, relleno, deshacer, la medida del camuflaje y cómo se pinta un bot |
| `entes.js` | `AJUSTES`, el estado de la partida y lo que hace cualquier personaje |
| `efectos.js` | Ondas de silbido, gotas, disparos, sellos y manchas |
| `bot-cazador.js` | El becario bot: ronda, silbidos, sospecha y disparo |
| `bot-camaleon.js` | El camaleón bot: elegir sitio, pintarse, nervios y huir |
| `luz.js` | La oscuridad y los abanicos de las linternas |
| `dibujo.js` | La cámara y cada fotograma |
| `taller.js` | El modo de pintarse |
| `controles.js` | Dedo, ratón y teclado; el disparo del jugador |
| `partida.js` | Fases, silbidos, recta final, quién gana y los puntos |
| `interfaz.js` | Iconos, marcador, avisos, panel del taller y pantallas |
| `principal.js` | Arranque y bucle |

`idioma/en-raiz.js` es el inglés de la ficha en la Biblioteca de la página de la raíz.

Si se descarta la idea, se borra esta carpeta, su ficha de la Biblioteca (`index.html` de la raíz) y su línea en `novedades/`.
