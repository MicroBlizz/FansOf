// Fans of Pop · POTENCIADORES («copiarnos de Candy Crush», Daniel, 30-10-2026): las AYUDAS que se usan en un nivel. Se ganan
// jugando (regalo diario, pase, ofertas) y se guardan en SAVE.ayudas; si no te quedan, el botón la compra con perlas a precio
// fijo (PP_CFG.ayudas). Nunca azar (ADR 004).
// · Niveles normales: MARTILLO (revienta del todo la burbuja que toques), BOMBA (un golpe a un cuadrado de 3x3) y +3 TOQUES.
//   Ni el martillo ni la bomba gastan toque. Tras fallar un nivel, al volver a entrar se ofrece +3 toques antes de empezar.
// · Duelos (js/nimnivel.js): DESHACER (vuelve al principio de tu turno anterior, antes de la respuesta del rival) y la PISTA DE
//   LOLA (marca la jugada que gana). Al perder un duelo se ofrece deshacer y recuperar el corazón.
// La barra de ayudas es HTML (#pp-ayudas), debajo del tablero; en los duelos, grande y donde estaría «Tu equipo» (tarea #129).
'use strict';
const PP_AYUDA = { modo: null };   // 'martillo' | 'bomba' mientras se elige la burbuja
const ppTengo = k => (SAVE.ayudas && SAVE.ayudas[k]) || 0;
function ppDaAyuda(k, n) { SAVE.ayudas = SAVE.ayudas || {}; SAVE.ayudas[k] = ppTengo(k) + n; ppGuarda(); }
// gastar una: la tuya si tienes; si no, se compra con perlas; sin perlas, abre la tienda (y vuelve a donde estabas)
function ppGastaAyuda(k, vuelta = null) {
  if (ppTengo(k) > 0) { SAVE.ayudas[k]--; ppGuarda(); return true; }
  const precio = PP_CFG.ayudas[k].perlas;
  if (ppPerlas(-precio, 'ayuda')) return true;
  ppFaltanPerlas(precio, () => { ppCierra(); if (vuelta) vuelta(); ppBarraAyudas(); }, vuelta);   // «Te faltan N perlas» con el pack que llega (js/tienda-venta.js, tarea #185); luego se vuelve a tocar la ayuda
  return false;
}
/* ---------- la barra ---------- */
// ¿este nivel tiene barra de ayudas? No en el tutorial del primer mundo, ni en una partida nueva antes del nivel 4 (tarea #140).
// No mira la cortinilla: así «Tu equipo» sabe desde el principio si va debajo de las ayudas (js/marcador.js, tarea #269)
const ppAyudasEnNivel = T => !(T.d && T.d.tutorial && T.d.mundo === 0) && ppPrimerosAyudas(T);
// ¿van las ayudas pequeñas justo bajo el tablero, con «Tu equipo» debajo? (en los duelos van grandes, en el sitio del equipo)
const ppAyudasBajoTablero = T => !!T && !T.nim && ppAyudasEnNivel(T);
function ppBarraAyudas() {
  const b = $pp('#pp-ayudas'), T = PP_P && PP_P.T;
  if (!b) return;
  // con la cortinilla del duelo puesta no salen: taparían su tarjeta «Así se gana» (tarea #129); vuelven al pulsar ¡A JUGAR!
  const ver = PP_PANT.actual === 'sala' && T && !T.hecho && ppAyudasEnNivel(T) && !ppCortActiva();
  b.hidden = !ver; if (!ver) return;
  const duelo = !!T.nim, lista = duelo ? ['deshacer', 'pista'] : ['martillo', 'bomba', 'toques3'];
  const ico = duelo ? 88 : 62, perla = duelo ? 28 : 18;
  b.classList.toggle('pp-duelo', duelo);
  ppTutorial(duelo ? 'ayudasDuelo' : 'ayudas');
  b.innerHTML = '';
  for (const k of lista) {
    const n = ppTengo(k), bt = document.createElement('button');
    bt.type = 'button'; bt.className = 'pp-ayuda' + (PP_AYUDA.modo === k ? ' pp-activa' : '');
    const gratis = duelo && ppAyudaGratis(k, T.nim);   // la lupa de Lola o los compañeros de duelo
    const nombre = duelo ? '' : `<i>${tr(PP_CFG.ayudas[k].nombre)}</i>`;   // en los niveles, con su nombre debajo (tarea #269)
    bt.innerHTML = `${ppIcono('i-' + k, ico, '#ffd1ec')}${k === 'toques3' ? '<em>+3</em>' : ''}<b>${gratis ? tr('GRATIS') : n ? n : ppPerlasPrecioHtml(PP_CFG.ayudas[k].perlas, perla)}</b>${nombre}`;
    bt.setAttribute('aria-label', tr(PP_CFG.ayudas[k].nombre));
    bt.onclick = () => { play('select'); ppPulsaAyuda(k); };
    b.appendChild(bt);
  }
  ppHabBotones(b, T);   // los compañeros de Pesadilla con botón (js/habilidades-pesadilla.js)
}
function ppPulsaAyuda(k) {
  const T = PP_P && PP_P.T; if (!T || T.hecho || ppCortActiva()) return;   // con la cortinilla del jefe puesta, las ayudas esperan
  if (k === 'martillo' || k === 'bomba') {
    if (T.parado) return;
    PP_AYUDA.modo = PP_AYUDA.modo === k ? null : k; T.habModo = null;   // se elige la burbuja con el siguiente toque (otra pulsación, cancela)
    if (PP_AYUDA.modo) ppFlota(k === 'martillo' ? tr('Toca la burbuja en la que quieras hacer pop') : tr('Toca dónde quieres la bomba'), 270, 240, '#ff8a2a');
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
  // en PESADILLA hundir una sola burbuja podría dejar el tablero sin solución: el martillo es un toque gratis donde lo pongas y la
  // bomba hace gratis dos toques de la solución (como el salto de un amigo)
  if (T.lo) {
    const objetivos = k === 'martillo' ? [i] : [...T.sol].slice(0, 2);
    if (k === 'bomba') ppFxImpacto(T, i, true);
    play(k === 'bomba' ? 'ppSalto' : 'ppPremio'); ppMarcaDentro(true);
    for (const j of objetivos) { const r = ppToca(T, j, true); if (!r) break; ppFxToque(T, j, r); ppTrasToque(T, j, r); if (T.hecho) break; }
    ppBarraAyudas(); return;
  }
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
  T.sol = new Set(T.hecho ? [] : T.lo ? (ppResuelveLO(T.n, T.mask, T.up) || []) : ppOptimo(T.n, T.mask, Array.from(T.up), 80000, T.esp));
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
  // en tu turno: la foto de ahora es la del turno en curso; se vuelve a la anterior. Tras perder, al último turno tuyo desde el que aún
  // se podía ganar (js/deshacer-nim.js), y Lola marca gratis la jugada buena: pagar sirve de verdad (Pepins, 18-11-2026)
  const fotos = N.fotos || [], k = trasPerder ? ppNimVuelta(T) : fotos.length - 2, destino = fotos[k];
  if (!destino) { ppFlota(tr('Aún no hay nada que deshacer'), 270, 240, '#ff6ec7'); return; }
  if (!ppPagaDeshacer(T, trasPerder)) return;
  fotos.length = k + 1;
  T.up = Uint8Array.from(destino.up); N.errores = destino.errores; N.fin = null; N.turno = 'yo'; N.fila = null; N.esta = []; N.pistaNim = null;
  T.hecho = false;
  if (trasPerder) { ppCierra(); ppSumaVida(1); ppFxCura(1); ppMarcaDentro(true); }
  PP_FX.celdas = {}; for (let i = 0; i < T.up.length; i++) if (T.mask[i]) PP_FX.celdas[i] = { t: 0, dir: T.up[i] ? 'sube' : 'pop', demora: 0 };
  ppFlota(tr('¡Deshecho!'), 270, 240, '#4fc964'); play('ppCura');
  if (trasPerder) ppNimMarcaGanadora(T);
  ppNimBoton(); ppBarraAyudas();
}
// pagar el deshacer: gratis una vez por duelo (dos a 5 estrellas) con Otra vez del equipo de Duelos (en tu turno, no tras perder: js/habilidades-duelo.js)
function ppPagaDeshacer(T, trasPerder) {
  if (!trasPerder && ppHabDDeshazGratis(T.nim)) { T.nim.deshacesGratis = (T.nim.deshacesGratis || 0) + 1; return true; }
  return ppGastaAyuda('deshacer', trasPerder ? () => ppNimFin(T, false, true) : null);
}
// tras perder: la última foto desde la que se gana (o la última, si no hubiera ninguna)
function ppNimVuelta(T) {
  const fotos = T.nim.fotos || [], k = PP_DESHACER.buena(fotos, T.mask, T.n, ppNimGana);
  return k >= 0 ? k : fotos.length - 1;
}
// Lola marca con aros la jugada que gana desde aquí y lo dice (sin cobrar); false si no hay ninguna
function ppNimMarcaGanadora(T) {
  const j = ppNimGanadora(ppFilasDuelo(T));
  if (!j) return false;
  const [y, k] = j, sitios = [];
  for (let x = 0; x < T.n && sitios.length < k; x++) { const i = y * T.n + x; if (T.mask[i] && T.up[i]) sitios.push(i); }
  T.nim.pistaNim = sitios; ppFxHabilidad('lola'); play('ppPista');
  ppFlota(k === 1 ? tr('Lola: «Haz pop en 1 de esta fila»') : tr('Lola: «Haz pop en {n} de esta fila»', { n: k }), 270, 240, '#3a8ee6');
  return true;
}
// la jugada que gana desde aquí (fila y cuántas), o null si no hay ninguna (vas perdiendo)
function ppNimGanadora(filas) {
  for (let y = 0; y < filas.length; y++) for (let k = 1; k <= filas[y]; k++) {
    const g = filas.slice(); g[y] -= k;
    if (g.some(v => v) && !ppNimGana(g)) return [y, k];
  }
  return null;
}
// Lola en el equipo da UNA lupa gratis en cada duelo (Daniel, 31-10-2026: «los duelos se me hacen muy difíciles»)
// (con el flag `companeros` abierto, en vez de Lola, la Lupa del equipo de Duelos: js/habilidades-duelo.js; dos a 5 estrellas).
// N.pistasGratis: las gratis que ya se han gastado en este duelo
const ppPistaGratis = N => PP_HAB.queda(Math.max(ppEnEquipo('lola') ? 1 : 0, ppHabDUsos('dPista')), N.pistasGratis);
const ppAyudaGratis = (k, N) => (k === 'pista' ? ppPistaGratis(N) : k === 'deshacer' && ppHabDDeshazGratis(N));
function ppPagaPista(N) { if (ppPistaGratis(N)) { N.pistasGratis = (N.pistasGratis || 0) + 1; return true; } return ppGastaAyuda('pista'); }
function ppNimPista() {
  const T = PP_P && PP_P.T, N = T && T.nim; if (!N || N.turno !== 'yo' || N.fin) return;
  // a mitad de turno (ya has reventado en una fila): cuántas MÁS de esa fila, o pulsar ¡LISTO! ya, o que con esa fila ya no se gana
  if (N.esta.length) {
    const f = ppFilasDuelo(T), y = N.fila;
    if (f.some(v => v) && !ppNimGana(f)) { if (!ppPagaPista(N)) return; N.pistaNim = []; ppFxHabilidad('lola'); play('ppPista'); ppFlota(tr('Lola: «¡Así está perfecto! Pulsa ¡LISTO!»'), 270, 240, '#3a8ee6'); ppBarraAyudas(); return; }
    let k = 0;
    for (let c = 1; c <= f[y]; c++) { const g = f.slice(); g[y] -= c; if (g.some(v => v) && !ppNimGana(g)) { k = c; break; } }
    if (!k) { ppFlota(tr('Lola: «Con esta fila ya no se puede ganar. Prueba Deshacer.»'), 270, 240, '#ff8a2a'); return; }
    if (!ppPagaPista(N)) return;
    const sitios = []; for (let x = 0; x < T.n && sitios.length < k; x++) { const i = y * T.n + x; if (T.mask[i] && T.up[i]) sitios.push(i); }
    N.pistaNim = sitios; ppFxHabilidad('lola'); play('ppPista');
    ppFlota(k === 1 ? tr('Lola: «Haz pop en 1 más de esta fila»') : tr('Lola: «Haz pop en {n} más de esta fila»', { n: k }), 270, 240, '#3a8ee6');
    ppBarraAyudas(); return;
  }
  const j = ppNimGanadora(ppFilasDuelo(T));
  if (!j) { ppFlota(tr('Lola: «Ahora no hay jugada segura… ¡a ver si se equivoca!»'), 270, 240, '#ff8a2a'); return; }
  if (!ppPagaPista(N)) return;
  ppNimMarcaGanadora(T);
  ppBarraAyudas();
}
/* ---------- antes de empezar (tras fallar ese nivel) ---------- */
function ppAntesDeEmpezar(T) {
  const fallos = (SAVE.fallos || {})[ppClaveNivel(T.d)] || 0;
  if (!fallos || T.nim || T.d.tutorial) return;
  const t = ppAbre(`<h2>${tr('¿Una ayudita?')}</h2><p class="pp-sub">${tr('Este nivel se te resiste. Empieza con 3 toques más.')}</p>`);
  const n = ppTengo('toques3');
  const b = ppBoton('', 'pp-btn', () => { if (ppGastaAyuda('toques3', () => ppAntesDeEmpezar(T))) { ppCierra(); T.limite += 3; ppFlota(tr('+{n} toques', { n: 3 }), 270, 240, '#3a8ee6'); play('ppPremio'); ppBarraAyudas(); } });
  b.innerHTML = `${tr('+3 TOQUES')} · ${n ? tr('tienes {n}', { n }) : ppPerlasPrecioHtml(PP_CFG.ayudas.toques3.perlas, 26)}`;
  t.appendChild(b);
  t.appendChild(ppBoton(tr('Jugar sin ayuda'), 'pp-btn2 pp-azul', ppCierra));
}
const ppClaveNivel = d => ppPrefijo(d.dif) + d.g;
// cuenta los fallos de un nivel (para la ayuda de antes de empezar y la oferta de atasco); ganar los borra
function ppApuntaFallo(d) { SAVE.fallos = SAVE.fallos || {}; const k = ppClaveNivel(d); SAVE.fallos[k] = (SAVE.fallos[k] || 0) + 1; ppGuarda(); ppMiraAtasco(SAVE.fallos[k]); }
function ppBorraFallos(d) { if (SAVE.fallos && SAVE.fallos[ppClaveNivel(d)]) { delete SAVE.fallos[ppClaveNivel(d)]; ppGuarda(); } }
