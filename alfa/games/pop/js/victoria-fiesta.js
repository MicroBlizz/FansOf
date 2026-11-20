// Fans of Pop · FIESTA DE TOQUES SOBRANTES (tarea #157, Pepins, 19-11-2026: como el «Sugar Crush» de Candy Crush). Al ganar un
// nivel nuevo con toques de sobra, antes de la pantalla de victoria, cada toque que sobra sale del contador y hace pop en una
// burbuja del tablero, con su «+1» de moneda (PP_CFG.sobrantes: 1 por toque, como mucho 10). «Toca para saltar» la acelera, no la
// corta: se ven todos los pops y se cobran todas las monedas. Solo la primera vez que pasas el nivel (como el resto de monedas
// del nivel), para que repetir un nivel fácil no sea una mina. En los duelos no hay. Las cuentas, en PP_VICTORIA.sobrantes (js/victoria.js).
'use strict';
const PP_FIESTA = Object.freeze({ empieza: 350, paso: 300, rapido: 80, final: 500 });   // milisegundos
// cuántos toques sobran y cuántas monedas dan; nada si es un duelo o si el nivel ya estaba pasado
function ppFiestaCuenta(T) {
  const d = T && T.d;
  if (!d || T.nim || (ppPrefijo(d.dif) + d.g) in SAVE.mejor) return PP_VICTORIA.sobrantes(0, 0, PP_CFG.sobrantes);
  return PP_VICTORIA.sobrantes(T.limite, T.toques, PP_CFG.sobrantes);
}
// las burbujas del tablero donde caen los pops, en orden de lectura
function ppFiestaCeldas(T) {
  const res = [];
  for (let i = 0; i < T.up.length; i++) if (T.mask[i]) res.push(i);
  return res;
}
// el cartel de arriba y «Toca para saltar»: una capa encima del tablero que recoge los toques
function ppFiestaCapa(T, s) {
  const capa = document.createElement('div');
  capa.className = 'pp-fiesta-toques';
  const sub = s.monedas ? (s.monedas === 1 ? tr('+1 moneda') : tr('+{n} monedas', { n: s.monedas })) : '';
  capa.innerHTML = `<p class="pp-fiesta-cartel">${tr('¡Toques extra!')}</p>${sub ? `<p class="pp-fiesta-sub">${sub}</p>` : ''}`
    + `<p class="pp-fiesta-saltar">${tr('Toca para saltar')}</p>`;
  capa.onpointerdown = () => { if (T.fiesta) T.fiesta.rapido = true; capa.classList.add('pp-rapido'); };
  $pp('#pp-ui').appendChild(capa);
  return capa;
}
// un pop de la fiesta: la burbuja salta, chispas doradas y, si aún quedan monedas, su «+1»
function ppFiestaPop(T, j, k, s) {
  const [cx, cy] = ppCentro(ppGeom(T.n), j);
  PP_FX.celdas[j] = { t: 0, dir: 'pop', demora: 0 };
  for (let p = 0; p < 10; p++) {
    const a = p / 10 * Math.PI * 2, v = 140 + (p % 3) * 50;
    PP_FX.parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, r: 3 + (p % 3), t: 0, vida: 0.55, col: ['#ffd64a', '#fff3a0', '#ffffff'][p % 3] });
  }
  PP_FX.parts = PP_CHISPAS.recorta(PP_FX.parts);
  const por = PP_CFG.sobrantes.porToque;
  if ((k + 1) * por <= s.monedas) ppFlota('+' + por, cx, cy - 34, '#ffb000', false);
  play('ppPop', k);
  ppVibra(8);
}
// La fiesta entera; al acabar (o si no hay), `alAcabar()` abre la victoria. Guarda en T.fiesta las monedas, que cobra ppFiestaAlPremio.
function ppFiestaToques(T, alAcabar) {
  const s = ppFiestaCuenta(T);
  if (!s.toques) { alAcabar(); return; }
  const celdas = ppFiestaCeldas(T);
  T.fiesta = { monedas: s.monedas, rapido: false };
  const capa = ppFiestaCapa(T, s);
  let k = 0;
  const sigue = () => (PP_P && PP_P.T === T && PP_PANT.actual === 'sala');
  const fin = () => { capa.remove(); if (sigue()) alAcabar(); };
  const tic = () => {
    if (!sigue()) { fin(); return; }
    if (k >= s.toques) { setTimeout(fin, PP_FIESTA.final); return; }
    ppFiestaPop(T, celdas[k % celdas.length], k, s);
    k++;
    setTimeout(tic, T.fiesta.rapido ? PP_FIESTA.rapido : PP_FIESTA.paso);
  };
  setTimeout(tic, PP_FIESTA.empieza);
}
// las monedas de la fiesta, al premio del nivel (para el desglose y el x2) y al monedero
function ppFiestaAlPremio(T) {
  const m = T.fiesta ? T.fiesta.monedas : 0;
  if (!m || !T.premio) return;
  T.premio.monedas += m; T.premio.sobran = m;
  SAVE.monedas += m; ppGuarda();
}
