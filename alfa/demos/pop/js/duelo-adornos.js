// Fans of Pop · LOS ADORNOS DEL DUELO (dibujo y botones; tarea #41, ADR 130, nodo n8): en la pantalla del duelo (contra el CEO o contra
// gente), la fila de tus pegatinas para lanzar, las pegatinas que vuelan (las tuyas desde abajo y las del rival desde su lado) y el efecto de
// pop de quien revienta (el tuyo y, contra gente, el de tu rival). Las reglas están en js/adornos-duelo.js (PP_ADORNOS); el perfil, en PP_MI.
// Todo tras el flag tienda-gemas de Pop: cerrado, no sale la fila y los pop son los de siempre.
'use strict';
const PP_ADN = { vuelan: [], cositas: [], ultimoYo: null, ultimoRival: null, reloj: 0, barra: null };
const PP_ADN_FORMA = Object.freeze({ corazones: 'corazon', estrellas: 'estrella', confeti: 'punto', burbujitas: 'perla' });
const PP_ADN_CONFETI = ['#7ec8ff', '#ffd166', '#ff8cc6', '#7be0a0'];
const ppAdnVisible = () => ppPerfilActivo() && PP_PANT.actual === 'duelo' && !PP_PANT.pausa && !!PP_DUELO && !PP_DUELO.fin && !ppCortActiva();
/* ---------- la fila de pegatinas (DOM) ---------- */
function ppAdnBarra() {
  if (PP_ADN.barra) return PP_ADN.barra;
  const b = document.createElement('div'); b.id = 'pp-pegatinas'; b.hidden = true;
  $pp('#pp-ui').appendChild(b); PP_ADN.barra = b;
  return b;
}
function ppAdnLlena() {
  const b = ppAdnBarra(); b.textContent = '';
  for (const id of PP_MI.perfil().pegatinas) {
    const d = PP_MI.dato('pegatina', id), m = d && ppPerfilMuestra('pegatina', d, 50); if (!m) continue;
    const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'pp-pegatina'; bt.setAttribute('aria-label', tr('Lanzar pegatina'));
    bt.appendChild(m); bt.onclick = () => ppAdnLanza(id); b.appendChild(bt);
  }
}
// cada fotograma: la fila sale solo en el duelo, en juego y sin la cortinilla delante
function ppAdnMira() {
  if (!PP_ADN.barra) return;
  const ver = ppAdnVisible() && PP_ADN.barra.childElementCount > 0;
  if (PP_ADN.barra.hidden === ver) PP_ADN.barra.hidden = !ver;
}
/* ---------- empezar, lanzar y recibir ---------- */
// al empezar un duelo (contra el CEO o contra gente)
function ppAdnEmpieza() {
  Object.assign(PP_ADN, { vuelan: [], cositas: [], ultimoYo: null, ultimoRival: null });
  if (ppPerfilActivo()) ppAdnLlena();
}
function ppAdnLanza(id) {
  if (!ppAdnVisible()) return;
  const r = PP_ADORNOS.lanzar(PP_MI.perfil(), id, PP_ADN.ultimoYo, PP_ADN.reloj);
  if (!r.ok) { if (r.error === 'espera') play('ppDano'); return; }
  PP_ADN.ultimoYo = PP_ADN.reloj; ppAdnVuela(id, -1); play('select'); ppVibra(12);
  const D = PP_DUELO; if (D.pvp && D.pvp.canal) D.pvp.canal.enviar(r.mensaje);
}
// la pegatina que lanza tu rival (js/pvp.js): solo una de las que lleva de verdad; mientras ves la cortinilla, no se enseña
function ppAdnRecibe(m) {
  const D = PP_DUELO; if (!D || !D.pvp || D.fin || ppCortActiva()) return;
  const r = PP_ADORNOS.recibir(D.pvp.perfil, m, PP_ADN.ultimoRival, PP_ADN.reloj);
  if (!r.ok) return;
  PP_ADN.ultimoRival = PP_ADN.reloj; ppAdnVuela(r.id, 1); ppBoing(0.4);
}
function ppAdnVuela(id, lado) { const d = PP_MI.dato('pegatina', id); if (d) PP_ADN.vuelan.push({ img: d.img, lado, t: 0 }); }
/* ---------- el efecto de pop ---------- */
// `quien` revienta la burbuja `i`: 'yo', 'rival' (persona) o 'ceo'. Con el efecto normal no se añade nada (las gotitas de siempre)
function ppAdnPop(T, i, quien) {
  if (!ppPerfilActivo()) return;
  const D = PP_DUELO, ef = PP_ADORNOS.efectoDe(quien, PP_MI.perfil(), D && D.pvp && D.pvp.perfil), forma = PP_ADN_FORMA[ef];
  if (!forma) return;
  const d = PP_MI.dato('efecto', ef) || {}, [cx, cy] = ppCentro(ppGeom(T.n), i);
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4 + rand(-0.3, 0.3), v = rand(120, 230);
    PP_ADN.cositas.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 140, t: 0, vida: rand(0.75, 1.05), forma, col: ef === 'confeti' ? PP_ADN_CONFETI[k % 4] : d.color || '#ff8cc6', giro: rand(-4, 4) });
  }
}
/* ---------- avanzar y pintar ---------- */
const PP_ADN_VUELO = 1.8;   // segundos que dura una pegatina en pantalla
function ppAdnAvanza(dt) {
  PP_ADN.reloj += dt;
  for (const v of PP_ADN.vuelan) v.t += dt;
  PP_ADN.vuelan = PP_ADN.vuelan.filter(v => v.t < PP_ADN_VUELO);
  for (const p of PP_ADN.cositas) { p.t += dt; p.vy += 420 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  PP_ADN.cositas = PP_ADN.cositas.filter(p => p.t < p.vida);
}
// la pegatina sale de su lado (la tuya desde tu fila, la del rival desde su cara), llega al centro grande, tiembla un poco y se va
function ppAdnPintaVuelo(c, v) {
  const k = Math.min(1, v.t / 0.35), fuera = Math.max(0, (v.t - 1.4) / 0.4), H = PP_V.H;
  const x0 = v.lado < 0 ? 270 : 400, y0 = v.lado < 0 ? H - 70 : 88, x1 = v.lado < 0 ? 200 : 340, y1 = H * 0.36;
  c.save(); c.globalAlpha = 1 - fuera;
  c.translate(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 70);
  c.rotate(v.lado * 0.2 * (1 - k) + Math.sin(v.t * 9) * 0.06 * (1 - fuera));
  ppDibujaEn(c, v.img, 0, 0, 56 + 104 * k + 20 * fuera, true);
  c.restore();
}
function ppAdnPinta(c) {
  if (!ppPerfilActivo()) return;
  for (const p of PP_ADN.cositas) {
    c.save(); c.globalAlpha = 1 - p.t / p.vida; c.translate(p.x, p.y); c.rotate(p.giro * p.t);
    ppPfAdorno(c, p.forma, 0, 0, 32, p.col); c.restore();
  }
  for (const v of PP_ADN.vuelan) ppAdnPintaVuelo(c, v);
}
