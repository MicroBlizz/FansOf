# Boceto 3D de Fans of Rumble

Una página aparte para ver cómo quedaría Fans of Rumble en 3D, en estilo dibujo animado. **No toca el juego**: no usa
`core/`, ni la partida guardada, ni Supabase. Si se descarta la idea, se borra esta carpeta y ya está.

Se abre con `python herramientas/servidor.py` y http://localhost:8765/demos/rumble-3d/ (con `?idioma=en` sale en inglés).

## Qué enseña

- **La misión** (unos 3 minutos, `js/mision.js`): presentación de los personajes hablando a cámara, batalla con oro y cuatro
  cartas, SurvivalBot saliendo de la sede con su música, y el final. Narra Paco Rumble, el comentarista.
- **La música es la del juego**: la página carga `core/js/serie/canciones.js` y `js/musica.js` la toca (menú, Animales,
  SurvivalBot, ganar y perder).
- **El modo libre** con el botón +30, para medir la fluidez.

- El campo del juego en 3D, con las mismas medidas que `games/rumble/js/01-campo.js` (10 px del juego = 1 unidad en 3D):
  río, puentes, caminos, las torres, La Madriguera y la sede de Microblizz con su ciudad detrás.
- CrazyBunny, MadSquirrel, MeerCat, MechaVaca (y su vaca), el Becario y SurvivalBot modelados con código (bolas, cajas, conos), copiando los colores de sus dibujos
  (`core/js/serie/arte/animales.js` y `microblizz.js`). Estilo dibujo animado: tres tonos de luz y borde negro.
- Animaciones hechas con código: caer del cielo, aplastarse al llegar, saludar, andar, atacar, recibir golpes,
  el salto del CAOS de CrazyBunny, desaparecer con un «¡puf!» y celebrar.
- Efectos: polvo, chispas, explosiones, anillos, trozos de torre, números de daño y temblor de cámara.
- Voces: «inventada» (un idioma de mentira, como los Sims), «del móvil» (la voz del teléfono) o ninguna. Sonido hecho con código.
- Un medidor de fluidez (FPS) y el botón **+30** para probar muchos muñecos a la vez en el móvil.

Las reglas de la pelea son de mentira, solo para que haya movimiento.

## Archivos (js/)

| Archivo | Qué hace |
|---|---|
| `principal.js` | Arranque, botones, cartas, toques en el campo, bucle de dibujo y medidor de FPS |
| `escena.js` | Cámara, luces, cielo, suelo pintado, río, ciudad del fondo |
| `edificios.js` | Torres, sedes, escombros, puentes y decorado |
| `modelos.js` | Los tres muñecos, pieza a pieza |
| `munecos.js` | Cómo se mueven (animaciones), sombras y barras de vida |
| `piezas.js` | Las formas básicas, el estilo dibujo animado y el borde negro |
| `partida.js` | La partida de mentira: unidades, torres, IA de Microblizz |
| `habilidades.js` | Salto del CAOS, curar, la vaca que sale del mecha, golpes y congelar del jefe |
| `mision.js` | La misión: guion, oro, oleadas, jefe, final y el comentarista |
| `musica.js` | Toca las canciones del juego |
| `efectos.js` | Partículas, números de daño, bocadillos y temblor |
| `voces.js` | Sonidos y voces |
| `textos.js` | Los textos y su inglés |
| `three.min.js` | La librería 3D (three.js 0.186.1, licencia MIT), recortada |

## La librería 3D

`three.min.js` es una copia de three.js con solo las piezas que usa el boceto (563 KB, unos 145 KB comprimida).
Se generó una vez, fuera del repositorio, con:

```
npm install three@0.186.1 esbuild
# entrada.js: export { <los nombres THREE.xxx que usan los js de esta carpeta> } from 'three';
npx esbuild entrada.js --bundle --format=esm --minify --legal-comments=none --outfile=three.min.js
```

Si se usa una pieza nueva de three.js (`THREE.Algo`), hay que volver a generarla con ese nombre añadido.
