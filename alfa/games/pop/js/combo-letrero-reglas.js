// Fans of Pop · EL LETRERO KAWAII DE LOS COMBOS, LAS CUENTAS (dominio; tarea 396, boceto elegido por Pepins el 26-11-2026). Qué dibujo
// sale en cada paso (gomita, nube y pegatina por turnos), su color, su tamaño (crece hasta x8), cómo entra y se apaga, y DÓNDE sale: junto
// a la burbuja del toque que lo hace, sin salirse de la pantalla. Funciones puras sobre lo que se les pasa: sin reloj, azar, SAVE ni
// dibujo. Lo dibuja js/combo-letrero.js.
'use strict';
const PP_COMBO_LETRERO = (() => {
  const ESTILOS = Object.freeze(['gomita', 'nube', 'pegatina']);
  const COLORES = Object.freeze(['#5be7ff', '#7fe0a8', '#ffd64a', '#ffab5e', '#ff7eb6', '#ff6ec7', '#ff5fa0']);   // x2 … x8 y más
  const ARCOIRIS = 5;   // desde este combo, la nube lleva arcoíris detrás
  const paso = n => Math.max(0, Math.floor(Number.isFinite(n) ? n : 2) - 2);
  const estilo = n => ESTILOS[paso(n) % ESTILOS.length];
  const color = n => COLORES[Math.min(COLORES.length - 1, paso(n))];
  const tamano = n => 0.95 + 0.07 * Math.min(6, paso(n));   // crece hasta x8
  // entra de golpe (pasa de largo un poco y vuelve) y crece con el combo
  function escala(n, t) {
    const e = t < 0.14 ? (t / 0.14) * 1.25 : t < 0.26 ? 1.25 - ((t - 0.14) / 0.12) * 0.33 : 0.92 + Math.min(0.08, (t - 0.26) * 0.4);
    return e * tamano(n);
  }
  // se va apagando al final (el letrero dura 1,1 s: js/efectos.js)
  const alfa = t => (t > 0.8 ? Math.max(0, 1 - (t - 0.8) / 0.3) : 1);
  // lo más arriba que puede ir el centro, desde la fila de arriba del tablero: más abajo cuanto más grande, para que la palabra COMBO
  // no tape los corazones de arriba
  const bajada = n => 30 + 7 * Math.min(6, paso(n));
  // el radio que se guarda contra los bordes: el del dibujo (y el arcoíris de la nube, que no crece); las partículas que vuelan sí pueden salir
  const radio = n => Math.max(112 * tamano(n), estilo(n) === 'nube' && n >= ARCOIRIS ? 162 : 0);
  // DÓNDE SALE (Pepins, 26-11-2026: «junto al toque»): encima de la burbuja tocada (cx, cy), sin salirse por los lados (ancho), sin subir
  // más de lo que deja `bajada` sobre la fila de arriba (arriba) ni bajar de `abajo` (para no tapar el equipo). Sin burbuja (cx o cy no
  // numéricos), centrado arriba, el sitio de siempre
  function sitio(cx, cy, n, { arriba, abajo = Infinity, ancho = 540 }) {
    const r = radio(n), alto = arriba + bajada(n);
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return [ancho / 2, alto];
    return [Math.min(ancho - r, Math.max(r, cx)), Math.max(alto, Math.min(abajo, cy - 70))];
  }
  return Object.freeze({ ESTILOS, ARCOIRIS, estilo, color, escala, alfa, bajada, sitio });
})();
