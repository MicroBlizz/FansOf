// Fans of Pop · PANTALLA DE VICTORIA, el dibujo (Pepins, 19-11-2026: «más grande, más cozy, más destellos, que sea una fiesta
// conseguir 3 estrellas, y para 1, 2 o 0 también hay que hacer algo»). La cabecera que comparten «nivel superado», el rescate y
// «mundo superado» (js/pantallas.js): rayos, destellos, las tres estrellas que caen con su campanita, la nota (¡Perfecto!, ¡Genial!,
// ¡Superado!) sobre el fondo y, debajo, un panel con las casillas de datos, la frase y las monedas que suben contando (Pepins,
// 19-11-2026: «lo quiero como la captura»). Los botones grandes van fuera del panel. Con 0 estrellas (sin
// toques), la misma pantalla en tranquilo: «¡Casi!» y cuánto te faltaba. Los botones y la fiesta, en js/victoria-botones.js.
// Las reglas, en js/victoria.js.
'use strict';
const PP_VIC_NOTA = { perfecto: '¡Perfecto!', genial: '¡Genial!', superado: '¡Superado!' };
const PP_VIC_ROTULO = { toques: 'Toques', minimo: 'Mínimo', errores: 'Errores', tiempo: 'Tiempo', intento: 'Intento' };
const PP_VIC_CUENTA = 0.8;   // segundos que tardan las monedas en subir
// el reloj del nivel: solo corre mientras se puede jugar (ni con la cortinilla, ni con Lola hablando, ni con una ventana, ni en pausa)
function ppVictoriaReloj(T, dt) {
  if (T.hecho || T.parado || ppCortActiva() || PP_LOLA.actual || !$pp('#pp-modal').hidden) return;
  T.seg = (T.seg || 0) + dt;
}
// lo que la pantalla necesita saber del nivel recién ganado
function ppVictoriaResumen(T) {
  return { duelo: !!T.nim, toques: T.toques, minimo: T.minimo, errores: T.nim ? T.nim.errores : 0, seg: T.seg || 0, intento: T.intento || 1 };
}
function ppVictoriaFrase(r) {
  const f = PP_VICTORIA.frase(r);
  if (f.clave === 'minimo') return tr('¡Con el mínimo de toques!');
  if (f.clave === 'limpio') return tr('¡Ni un solo error!');
  if (f.clave === 'sinErrores') return tr('Las 3 estrellas: sin ningún error');
  return f.n === 1 ? tr('Las 3 estrellas: en 1 toque') : tr('Las 3 estrellas: en {n} toques', { n: f.n });
}
function ppVictoriaDatos(r) {
  return '<div class="pp-vic-datos">' + PP_VICTORIA.datos(r).map(d => `<div class="pp-vic-dato"><small>${tr(PP_VIC_ROTULO[d.clave])}</small><b>${d.valor}</b></div>`).join('') + '</div>';
}
// las monedas del nivel (suben contando) con el compañero celebrando al lado y el hueco del botón de doblarlas; debajo, de dónde
// salen (nivel y toques de sobra); y, si toca, el cofre de siempre (2.ª vuelta, tarea #157)
function ppVictoriaPremio(T) {
  const p = T.premio;
  if (!p) return '';
  const monedas = p.monedas ? `<div class="pp-vic-premio-fila">${ppVicSlimeHtml(T, true)}<p class="pp-premio pp-vic-premio">+<span class="pp-precio">${ppIcono('i-moneda', 40)}<span class="pp-vic-cuenta" data-total="${p.monedas}">0</span></span></p><span class="pp-vic-doble-hueco"></span></div>`
    + `<div class="pp-vic-premio-fila pp-vic-fila-baja">${ppVicDesglose(p)}</div>` : '';
  return monedas + ppPremioHtml({ monedas: 0, cofre: p.cofre, perlas: p.perlas });
}
// la parte de arriba: rayos, destellos, estrellas, el nivel y la palabra grande
function ppVictoriaCabeza(clase, estrellas, nivel, palabra) {
  return `<div class="pp-vic pp-vic-${clase}"><div class="pp-vic-rayos"></div><div class="pp-vic-brillos"></div>${ppEstrellasHtml(estrellas)}`
    + `<p class="pp-vic-nivel">${nivel || ''}</p><h2>${palabra}</h2></div>`;
}
// La ventana entera de victoria. `titulo`: si no se pasa, la nota según las estrellas.
function ppVictoriaHtml(T, titulo) {
  const r = ppVictoriaResumen(T), nota = PP_VICTORIA.nota(T.estrellas);
  return ppVictoriaCabeza(nota, T.estrellas, T.titulo, titulo || tr(PP_VIC_NOTA[nota]))
    + `<div class="pp-vic-panel">${ppVictoriaDatos(r)}<p class="pp-vic-frase">${ppVictoriaFrase(r)}</p>${ppVictoriaPremio(T)}${ppVicExtras(T)}${ppFeriaLinea(T)}${ppPaseLinea(T)}</div>`;
}
// un número que sube de `desde` a `hasta` en `seg` segundos, esperando `retraso` ms; frena al final
function ppVicCuenta(el, desde, hasta, seg = PP_VIC_CUENTA, retraso = 500) {
  if (!el) return;
  const t0 = performance.now() + retraso;
  const paso = ahora => {
    if (!el.isConnected) return;
    const k = (ahora - t0) / (seg * 1000);
    el.textContent = desde + PP_VICTORIA.cuenta(hasta - desde, k);
    if (k < 1) requestAnimationFrame(paso);
  };
  el.textContent = desde; requestAnimationFrame(paso);
}
// Lo que se mueve al abrir la ventana `t`: una campanita por estrella, la fiesta y las monedas subiendo.
// Al volver de la tienda (`T.vicVista`) ya no se repite: se ve todo como quedó.
function ppVictoriaAnima(t, T) {
  t.classList.add('pp-gana', 'pp-gana-' + Math.max(0, Math.min(3, T.estrellas || 0)));
  const cuenta = t.querySelector('.pp-vic-cuenta');
  const ganado = T.premio ? (T.premio.monedas || 0) * (T.doblado ? 2 : 1) : 0;
  if (T.vicVista) { t.classList.add('pp-quieta'); if (cuenta) cuenta.textContent = ganado; return; }
  T.vicVista = true;
  play('ppEstrellas', T.estrellas);
  if (T.estrellas >= 3) setTimeout(() => play('ppVictoria'), 1250);
  ppVictoriaFiesta(t, T.estrellas);
  ppVicCuenta(cuenta, 0, ganado);
  ppVicVuela(t, SAVE.monedas - ganado, ganado);   // y vuelan a la barra de arriba (js/victoria-panel.js)
}
// abre una ventana de victoria con la cabecera y `extra` debajo (el texto del rescate o del mundo nuevo).
// `opc.vuelta`: la función que vuelve a abrir esta ventana al salir de la tienda; `opc.mapa`: si lleva el botón de ir al mapa.
function ppAbreVictoria(extra = '', ancha = false, titulo, opc = {}) {
  const T = PP_P.T, t = ppAbre(ppVictoriaHtml(T, titulo) + extra, ancha);
  const ganado = T.premio ? (T.premio.monedas || 0) * (T.doblado ? 2 : 1) : 0;
  if (!T.vicVista) T.vicFondo = ppVicFondo(T.estrellas);   // el mismo fondo al volver de la tienda
  else ppVicFondoPon(T.vicFondo);
  ppVicBarra(T.vicVista ? SAVE.monedas : SAVE.monedas - ganado);   // la barra de arriba, nítida (js/victoria-panel.js)
  ppVicMarcoPon(t.querySelector('.pp-vic-panel'), T);   // el marco del mundo (js/victoria-marco.js)
  ppVictoriaAnima(t, T);
  ppVictoriaBotones(t, T, opc);
  ppVicEncaja(t);   // que quepa sin la barra de desplazamiento (js/victoria-panel.js)
  return t;
}
/* ---------- 0 estrellas: sin toques ---------- */
// cuántas burbujas quedaban y cuántas había en el tablero del nivel
function ppVictoriaQuedan(T) {
  if (!T || !T.up || !T.mask) return { quedan: 0, total: 0 };
  let quedan = 0, total = 0;
  T.up.forEach((v, i) => { if (T.mask[i]) { total++; if (v > 0) quedan++; } });
  return { quedan, total };
}
function ppDerrotaBarra(T) {
  const { quedan, total } = ppVictoriaQuedan(T), p = PP_VICTORIA.progreso(quedan, total);
  if (!p.total) return '';
  return `<div class="pp-vic-barra"><span style="width:${p.pct}%"></span></div>`
    + `<p class="pp-vic-frase">${tr('Has explotado {a} de {b} burbujas', { a: p.hechas, b: p.total })}</p>`;
}
// La ventana de «sin toques» con el mismo aire que la de victoria, pero en tranquilo. `texto`: lo de los corazones.
function ppAbreDerrota(texto) {
  const T = PP_P.T, { quedan, total } = ppVictoriaQuedan(T), p = PP_VICTORIA.progreso(quedan, total);
  const palabra = p.pct >= 70 ? tr('¡Casi!') : tr('¡Sin toques!');
  const frase = p.pct >= 70 ? tr('¡Te faltaba poquito! A la próxima sale.') : tr('¡Ánimo! Prueba a empezar por otra burbuja.');
  const t = ppAbre(ppVictoriaCabeza('casi', 0, T && T.titulo, palabra)
    + `<div class="pp-vic-panel"><p class="pp-vic-frase">${frase}</p>${ppDerrotaBarra(T)}`
    + `<div class="pp-vic-premio-fila">${ppVicSlimeHtml(T, false)}<p class="pp-sub">${texto}</p></div>${ppVicRachaPerdida(T)}</div>`);
  ppVicFondo(0); ppVicBarra(SAVE.monedas);   // tonos fríos y la barra de arriba (js/victoria-panel.js)
  ppVicMarcoPon(t.querySelector('.pp-vic-panel'), T);
  t.classList.add('pp-gana', 'pp-gana-0');
  ppVictoriaFiesta(t, 0);
  ppVicEncaja(t);
  return t;
}
