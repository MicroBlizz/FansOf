# Fans of Roguelite

Roguelite de móvil tipo Capybara Go con el mundo de Fans of Rumble, en pixel art dibujado a mano con código (estilo
Paul Robertson). **No toca los juegos**: no usa `core/`, ni Supabase; guarda lo suyo en `localStorage` (`fansof-roguelite`).
Va solo en español (decisión de Daniel; el inglés del prototipo queda en textos.js para más adelante).

Se abre con `python herramientas/servidor.py` y http://localhost:8765/demos/roguelite/

## Qué hay

- **La Madriguera (menú)**: Jugar (3 mundos, se abren al ganar el anterior), Continuar (la partida se guarda al empezar
  cada día), Mejoras para siempre (con las monedas de todas las partidas), Colección (habilidades, objetos y enemigos
  vistos) y Opciones (sonido, velocidad, chat, borrar progreso).
- **3 mundos de 40 días**: Oficinas de Microblizz (mini jefe Becario del Mes, jefe SurvivalBot), Cementerio de juegos
  (StitchBrute, NecroLord corrupto) y Torre de Microblizz (Parche Día 1, el CEO). El paisaje pasa de la mañana a la
  noche del jefe en 6 tramos.
- **Cada día**: combate, élite (suelta objeto), encuentro con elección, tienda de Lola, cofre, ruleta, gashapón,
  hoguera de la huelga, monedas por el camino y el Pase Premium (habilidad legendaria a cambio de una cuota diaria).
- **23 habilidades** de 3 niveles y **15 objetos** en 3 huecos, con las rarezas del juego.
- **El directo**: etiqueta EN DIRECTO con espectadores y un chat falso tipo Twitch (como el de Fans of Rumble) que
  comenta y da consejos; Lola es la moderadora y da el consejo de verdad la primera vez de cada cosa.

Balance (simulación con el script de pruebas): mundo 1 sin mejoras, casi siempre se gana; el 2 pide unas cuantas
mejoras y el 3, bastantes.

## Archivos (js/), en el orden en que se cargan

| Archivo | Qué hace |
|---|---|
| `textos.js` | `tr()` y el inglés del prototipo |
| `pixel.js` | El pincel de píxeles: formas, tres tonos, contornos |
| `letras.js` | La letra de píxeles (tildes, ñ, ¿, ¡, ★ y el hueco de las insignias del chat) |
| `tiempo.js` | El reloj: esperas y animaciones en orden, congelado del golpe, x2 |
| `guardado.js` | Lo que se guarda: monedas, mejoras, mundos, récords, colección y partida a medias |
| `heroe.js` | CrazyBunny y MadSquirrel, pose a pose |
| `enemigos.js` | Mundo 1: Becario, abogado, StarBot, CajaBotín, SurvivalBot y el puesto de Lola |
| `enemigos-2.js` | Mundo 2: esqueleto, zombi, fantasma, StitchBrute y NecroLord |
| `enemigos-3.js` | Mundo 3: Becario del Mes, FallenHero, SoporteBot, Parche Día 1 y el CEO |
| `fondo.js` | El motor del paisaje y el bosque del mundo 1 |
| `fondo-mundos.js` | El cementerio y la ciudad |
| `efectos.js` | Polvo, chispas, golpes, números, monedas, bocadillos, láser, rayos y bolas |
| `props.js` | Castor, bolsa, máquina, gashapón, ruleta, hoguera, cofre, La Madriguera |
| `iconos.js / iconos-2.js` | Iconos de habilidades, objetos, mejoras y marcador |
| `sonido.js` | Efectos y músicas de 8 bits (menú, 3 mundos y jefe) |
| `datos.js` | El conejo y las 23 habilidades |
| `datos-mundos.js` | Enemigos, mundos y qué toca cada día |
| `datos-meta.js` | Objetos, mejoras, encuentros, Pase Premium, hoguera y consejos de Lola |
| `datos-chat.js` | Usuarios y frases del chat del directo |
| `reglas.js` | Las reglas sin dibujos: cifras, niveles, ofertas, enemigos y turnos |
| `personajes.js` | Quién sale en la escena y cómo se dibuja |
| `combate.js` | El combate y los ataques del rival |
| `combate-conejo.js` | Los ataques y habilidades del conejo |
| `eventos.js` | Días sin combate, premios, subir de nivel y objetos |
| `viaje.js` | Los 40 días, guardar, ganar y perder |
| `interfaz.js` | Marcador, botones, cartel del día y panel de elecciones |
| `paneles.js` | Habilidades, objeto nuevo y resumen final |
| `chat.js` | El directo: espectadores, chat y consejos de Lola |
| `menu.js` | La Madriguera y sus paneles |
| `principal.js` | Arranque, pantalla nítida (escala entera) y bucle |
