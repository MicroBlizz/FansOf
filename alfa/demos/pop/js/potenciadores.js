// Fans of Pop · POTENCIADORES («copiarnos de Candy Crush», Daniel, 30-10-2026): las AYUDAS que se usan en un nivel. Se ganan
// jugando (regalo diario, pase, ofertas) y se guardan en SAVE.ayudas; si no te quedan, el botón la compra con perlas a precio
// fijo (PP_CFG.ayudas). Nunca azar (ADR 004).
// · Niveles normales: MARTILLO (revienta del todo la burbuja que toques), BOMBA (un golpe a un cuadrado de 3x3) y +3 TOQUES.
//   Ni el martillo ni la bomba gastan toque. Tras fallar un nivel, al volver a entrar se ofrece +3 toques antes de empezar.
// · Duelos (js/nimnivel.js): DESHACER (vuelve al principio de tu turno anterior, antes de la respuesta del rival) y la PISTA DE
//   LOLA (marca la jugada que gana). Al perder un duelo se ofrece deshacer y recuperar el corazón.
// La barra de ayudas es HTML (#pp-ayudas), debajo del tablero.
'use strict';
const PP_AYUDA = { modo: null };   // 'martillo' | 'bomba' mientras se elige la burbuja
const ppTengo = k => (SAVE.ayudas && SAVE.ayudas[k]) || 0;
function ppDaAyuda(k, n) { SAVE.ayudas = SAVE.ayudas || {}; SAVE.ayudas[k] = ppTengo(k) + n; ppGuarda(); }
// gastar una: la tuya si tienes; si no, se compra con perlas; sin perlas, abre la tienda (y vuelve a donde estabas)
function ppGastaAyuda(k, vuelta = null) {
  if (ppTengo(k) > 0) { SAVE.ayudas[k]--; ppGuarda(); return true; }
  const precio = PP_CFG.ayudas[k].perlas;
  if ((SAVE.perlas || 0) >= precio) { SAVE.perlas -= precio; ppGuarda(); return true; }
  ppTienda(vuelta, 'ayudas');
  return false;
}
/* ---------- la barra ---------- */
function ppBarraAyudas() {
  const b = $pp('#pp-ayudas'), T = PP_P && PP_P.T;
  if (!b) return;
  const ver = PP_PANT.actual === 'sala' && T && !T.hecho && !(T.d && T.d.tutorial && T.d.mundo === 0);
  b.hidden = !ver; if (!ver) return;
  const lista = T.nim ? ['deshacer', 'pista'] : ['martillo', 'bomba', 'toques3'];
  b.innerHTML = '';
  for (const k of lista) {
    const n = ppTengo(k), bt = document.createElement('button');
    bt.type = 'button'; bt.className = 'pp-ayuda' + (PP_AYUDA.modo === k ? ' pp-activa' : '');
    bt.innerHTML = `${ppIcono('i-' + k, 52, '#ffd1ec')}${k === 'toques3' ? '<em>+3</em>' : ''}<b>${n ? n : ppPerlasHtml(PP_CFG.ayudas[k].perlas, 18)}</b>`;
    bt.setAttribute('aria-label', tr(PP_CFG.ayudas[k].nombre));
    bt.onclick = () => { play('select'); ppPulsaAyuda(k); };
    b.appendChild(bt);
  }
}
function ppPulsaAyuda(k) {
  const T = PP_P && PP_P.T; if (!T || T.hecho) return;
  if (k === 'martillo' || k === 'bomba') {
    if (T.parado) return;
    PP_AYUDA.modo = PP_AYUDA.modo === k ? null : k;   // se elige la burbuja con el siguiente toque (otra pulsación, cancela)
    if (PP_AYUDA.modo) ppFlota(k === 'martillo' ? tr('Toca la burbuja que quieras reventar') : tr('Toca dónde quieres la bomba'), 270, 240, '#ff8a2a');
    ppBarraAyudas(); return;
  }
  if (k === 'toques3') { if (ppGastaAyuda(k)) { T.limite += 3; T.parado = false; ppFlota(tr('+{n} toques', { n: 3 }), 270, 240, '#3a8ee6'); play('ppPremio'); } ppBarraAyudas(); return; }
  if (k === 'deshacer') { ppNimDeshacer(false); return; }
  if (k === 'pista') ppNimPista();
}
// el toque que sigue a pulsar martillo o bomba
function ppAplicaAyuda(i) {
  const T = PP_P.T, k = PP_AYUDA.modo;
  if (i < 0 || !T.mask[i]) return;
  if (k === 'martillo' && !T.up[i]) return;
  if (!ppGastaAyuda(k)) { PP_AYUDA.modo = null; ppBarraAyudas(); return; }
  PP_AYUDA.modo = null;
  const pops = [], grietas = [];
  if (k === 'martillo') { T.up[i] = 0; pops.push(i); }
  else {
    const n = T.n, x0 = i % n, y0 = Math.floor(i / n);
    for (let y = y0 - 1; y <= y0 + 1; y++) for (let x = x0 - 1; x <= x0 + 1; x++) {
      if (x < 0 || y < 0 || x >= n || y >= n) continue;
      const j = y * n + x; if (!T.mask[j] || !T.up[j]) continue;
      T.up[j]--; (T.up[j] ? grietas : pops).push(j);
    }
    ppFxImpacto(T, i, true);
  }
  T.pops += pops.length; ppMarcaDentro(true);
  T.hecho = ppResuelto(T);
  T.sol = new Set(T.hecho ? [] : ppOptimo(T.n, T.mask, Array.from(T.up), 80000, T.esp));
  const r = { pops, grietas, subes: [], hecho: T.hecho, golpes: pops.length + grietas.length };
  ppFxToque(T, i, r); play(k === 'bomba' ? 'ppSalto' : 'ppPremio');
  ppTrasToque(T, i, r);
  ppBarraAyudas();
}
/* ---------- en los duelos ---------- */
// la foto del tablero al empezar cada turno tuyo (ppNimEmpieza y al volverte el turno la guarda nimnivel.js)
function ppNimFoto(T) { const N = T.nim; N.fotos = N.fotos || []; N.fotos.push({ up: Array.from(T.up), errores: N.errores }); }
function ppNimDeshacer(trasPerder) {
  const T = PP_P && PP_P.T, N = T && T.nim; if (!N) return;
  if (!trasPerder && (N.turno !== 'yo' || N.fin)) return;
  // en tu turno: la foto de ahora es la del turno en curso; se vuelve a la anterior. Tras perder, a la del último turno tuyo.
  const fotos = N.fotos || [], destino = trasPerder ? fotos[fotos.length - 1] : fotos[fotos.length - 2];
  if (!destino) { ppFlota(tr('Aún no hay nada que deshacer'), 270, 240, '#ff6ec7'); return; }
  if (!ppGastaAyuda('deshacer', trasPerder ? () => ppNimFin(T, false, true) : null)) return;
  if (!trasPerder) fotos.pop();
  T.up = Uint8Array.from(destino.up); N.errores = destino.errores; N.fin = null; N.turno = 'yo'; N.fila = null; N.esta = []; N.pistaNim = null;
  T.hecho = false;
  if (trasPerder) { ppCierra(); ppSumaVida(1); ppFxCura(1); ppMarcaDentro(true); }
  PP_FX.celdas = {}; for (let i = 0; i < T.up.length; i++) if (T.mask[i]) PP_FX.celdas[i] = { t: 0, dir: T.up[i] ? 'sube' : 'pop', demora: 0 };
  ppFlota(tr('¡Deshecho!'), 270, 240, '#4fc964'); play('ppCura');
  ppNimBoton(); ppBarraAyudas();
}
// la jugada que gana desde aquí (fila y cuántas), o null si no hay ninguna (vas perdiendo)
function ppNimGanadora(filas) {
  for (let y = 0; y < filas.length; y++) for (let k = 1; k <= filas[y]; k++) {
    const g = filas.slice(); g[y] -= k;
    if (g.some(v => v) && !ppNimGana(g)) return [y, k];
  }
  return null;
}
function ppNimPista() {
  const T = PP_P && PP_P.T, N = T && T.nim; if (!N || N.turno !== 'yo' || N.fin) return;
  if (N.esta.length) { ppFlota(tr('Pídela al empezar tu turno'), 270, 240, '#ff6ec7'); return; }
  const j = ppNimGanadora(ppFilasDuelo(T));
  if (!j) { ppFlota(tr('Lola: «Ahora no hay jugada segura… ¡a ver si se equivoca!»'), 270, 240, '#ff8a2a'); return; }
  if (!ppGastaAyuda('pista')) return;
  const [y, k] = j, sitios = [];
  for (let x = 0; x < T.n && sitios.length < k; x++) { const i = y * T.n + x; if (T.mask[i] && T.up[i]) sitios.push(i); }
  N.pistaNim = sitios; ppFxHabilidad('lola'); play('ppPista');
  ppFlota(k === 1 ? tr('Lola: «Revienta 1 de esta fila»') : tr('Lola: «Revienta {n} de esta fila»', { n: k }), 270, 240, '#3a8ee6');
  ppBarraAyudas();
}
/* ---------- antes de empezar (tras fallar ese nivel) ---------- */
function ppAntesDeEmpezar(T) {
  const fallos = (SAVE.fallos || {})[ppClaveNivel(T.d)] || 0;
  if (!fallos || T.nim || T.d.tutorial) return;
  const t = ppAbre(`<h2>${tr('¿Una ayudita?')}</h2><p class="pp-sub">${tr('Este nivel se te resiste. Empieza con 3 toques más.')}</p>`);
  const n = ppTengo('toques3');
  const b = ppBoton('', 'pp-btn', () => { if (ppGastaAyuda('toques3', () => ppAntesDeEmpezar(T))) { ppCierra(); T.limite += 3; ppFlota(tr('+{n} toques', { n: 3 }), 270, 240, '#3a8ee6'); play('ppPremio'); ppBarraAyudas(); } });
  b.innerHTML = `${tr('+3 TOQUES')} · ${n ? tr('tienes {n}', { n }) : ppPerlasHtml(PP_CFG.ayudas.toques3.perlas, 26)}`;
  t.appendChild(b);
  t.appendChild(ppBoton(tr('Jugar sin ayuda'), 'pp-btn2 pp-azul', ppCierra));
}
const ppClaveNivel = d => (d.dif ? 'd' : '') + d.g;
// cuenta los fallos de un nivel (para la ayuda de antes de empezar y la oferta de atasco); ganar los borra
function ppApuntaFallo(d) { SAVE.fallos = SAVE.fallos || {}; const k = ppClaveNivel(d); SAVE.fallos[k] = (SAVE.fallos[k] || 0) + 1; ppGuarda(); ppMiraAtasco(SAVE.fallos[k]); }
function ppBorraFallos(d) { if (SAVE.fallos && SAVE.fallos[ppClaveNivel(d)]) { delete SAVE.fallos[ppClaveNivel(d)]; ppGuarda(); } }
