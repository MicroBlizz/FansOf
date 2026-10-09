# Fans of Roguelite (prototipo)

Un prototipo cortito para ver **el movimiento y el estilo** de un roguelite de móvil con el mundo de Fans of Rumble:
CrazyBunny camina solo hacia las oficinas de Microblizz, se encuentra combates y elecciones, y al subir de nivel
eliges 1 de 3 habilidades. **No toca el juego**: no usa `core/`, ni la partida guardada, ni Supabase. Si se descarta
la idea, se borra esta carpeta (y su ficha de la Biblioteca en el `index.html` de la raíz) y ya está.

Se abre con `python herramientas/servidor.py` y http://localhost:8765/demos/roguelite/ (con `?idioma=en` sale en inglés).

## Qué enseña

- **Pixel art dibujado a mano con código** (estilo Paul Robertson): cada pose se dibuja de nuevo píxel a píxel,
  pieza a pieza, con tres tonos (luz, base y sombra lila), contorno oscuro por fuera y de color por dentro.
  Nada de estirar imágenes: aplastar y estirar se dibuja otra vez, así que los píxeles siempre son cuadrados.
- **Personajes con los colores del juego**: CrazyBunny (capa, corona torcida, ojo en espiral y zanahoria),
  MadSquirrel, el Becario con su café, un abogado de Microblizz, StarBot, la CajaBotín que muerde y SurvivalBot
  (cabeza de robot, edificio de Microblizz con corbata). El puesto de café de Lola.
- **6 días**: Becario, café de Lola (elección), StarBot, el contrato del abogado (elección), CajaBotín (habilidades raras)
  y el jefe. Cada día cambia la luz: mañana, mediodía, tarde, atardecer con sol a rayas, noche y luna roja con focos.
  La torre de Microblizz se ve más grande cada día.
- **Combates automáticos** con coreografía: carrerilla, golpe que congela la imagen un instante (hit-stop), destello
  blanco, estrella de impacto, chispas, números que saltan, temblor y trozos que rebotan. Monedas que vuelan al marcador.
- **10 habilidades** con las rarezas y colores del juego (Común gris, Poco común verde, Rara azul, Épica lila y
  Legendaria naranja): Chaos Jump, Lluvia de bellotas, Pulgas, Huelga general, MadSquirrel…
- Sonido de 8 bits y dos musiquillas hechas con código. Botón x2 de velocidad.

Las cifras son de prueba. Con habilidades al azar se gana el 98 % de las veces (el jefe te deja a media vida).

## Archivos (js/), en el orden en que se cargan

| Archivo | Qué hace |
|---|---|
| `textos.js` | Los textos en inglés (en el código van en español) y `tr()` |
| `pixel.js` | El pincel de píxeles: formas, tres tonos, contornos |
| `letras.js` | La letra de píxeles (con tildes, ñ, ¿ y ¡) |
| `tiempo.js` | El reloj: esperas y animaciones en orden, congelado del golpe, x2 |
| `heroe.js` | CrazyBunny y MadSquirrel, pose a pose |
| `enemigos.js` | Becario, abogado, StarBot, CajaBotín, SurvivalBot y el puesto de Lola |
| `fondo.js` | Cielo, montañas, torre, colinas, camino y carteles de cada día |
| `efectos.js` | Polvo, chispas, golpes, números, monedas, bocadillos, láser |
| `iconos.js` | Iconos de las habilidades y del marcador |
| `sonido.js` | Efectos y música de 8 bits |
| `datos.js` | El conejo, los enemigos, las habilidades y los 6 días (cifras) |
| `reglas.js` | Las reglas sin dibujos: subir de nivel, ofertas, turnos |
| `personajes.js` | Quién sale en la escena y cómo se dibuja |
| `combate.js` | La coreografía de cada golpe y ataque |
| `viaje.js` | El orden de los días, las elecciones y el final |
| `interfaz.js` | Marcador, panel de abajo, botones y cartel del día |
| `principal.js` | Arranque, pantalla nítida (escala entera) y bucle |
