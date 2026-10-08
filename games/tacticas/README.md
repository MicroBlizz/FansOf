# Fans of Rumble: Tácticas (prototipo)

Combate por turnos con barras de tiempo (estilo JRPG clásico) con los líderes de las facciones de Fans Of contra Microblizz.

- No usa NUCLEO: carga de core solo el arte, la música y los efectos (ver la lista de scripts en index.html) y tiene su propia partida guardada (`for-tacticas-v1`).
- `js/datos.js`: héroes, técnicas, objetos, enemigos, mundos, balance (AJUSTES) y tienda (TIENDA). Todo el balance está aquí.
- `js/escena.js`: sprites, fondos y dibujo del combate. `js/combate.js`: barras, menús, acciones e IA. `js/pantallas.js`: mapa, grupo, tienda, opciones, regalo diario y monetización.
- Monetización simulada: `pagar()` y `verAnuncio()` en pantallas.js son los dos puntos que se conectan a Google Play / App Store y AdMob.
- Versión: el `?v=` de los scripts en index.html.
