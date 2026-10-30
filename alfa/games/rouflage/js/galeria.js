// Fans of Rouflage · LA GALERÍA DE DISFRACES (extra «galeria», modos.js): al acabar la partida, cada colado aparece en su pedestal (el trozo de
// suelo donde se escondió, con su pintura y su postura) y todos, fantasmas incluidos, votan el MEJOR y el PEOR camuflaje. Se vota durante
// GALERIA.plazo segundos o hasta que ha votado todo el mundo. El mejor se lleva GALERIA.premio puntos en la clasificación; el peor, una frase de
// Microblizz. Los bots votan solos (en el PvP los vota el anfitrión); por internet cada voto viaja en un mensaje `vt` y cada navegador cuenta.
'use strict';

const GALERIA = { plazo: 15, premio: 60, candidatos: [], votos: new Map(), mio: { mejor: null, peor: null }, t: 0, cerrada: false, tic: null };
const FRASES_PEOR = [
  'Microblizz: «Eso no es camuflaje, es una petición de ayuda».',
  'Microblizz: «Hemos visto extintores mejor escondidos».',
  'Microblizz: «La pintura se cobra del sueldo. Y no hay sueldo».',
  'Phony: «Yo lo habría encontrado con los ojos cerrados. Que es como los tengo».',
];
// cada uno se identifica por su plaza (PvP) o por su sitio en la lista (solitario): es igual en todos los navegadores
const galId = e => e.slot >= 0 ? e.slot : J.entes.indexOf(e);
const galEnte = id => J.entes.find(e => galId(e) === id);

// al terminar la partida: ¿hay galería? Solo con el extra puesto y al menos dos colados que se hayan pintado (los contagiados ya van de gris)
function galeriaPrepara() {
  GALERIA.candidatos = extraOn('galeria') ? J.camaleones.filter(e => e.pintado || e.jugador) : [];
  GALERIA.votos = new Map(); GALERIA.mio = { mejor: null, peor: null }; GALERIA.t = 0; GALERIA.cerrada = false; GALERIA.pre = null; GALERIA.mejor = GALERIA.peor = null;
  GALERIA.frase = FRASES_PEOR[Math.floor(Math.random() * FRASES_PEOR.length)];
  const caja = E('fin-galeria'); if (caja) { caja.dataset.lista = ''; caja.innerHTML = ''; caja.hidden = true; }
  if (GALERIA.candidatos.length < 2) { GALERIA.candidatos = []; return; }
  for (const e of J.entes) if (e.galeria) e.galeria = 0;
  // los bots votan a su aire pasados unos segundos (en el PvP solo los del anfitrión)
  for (const b of J.entes) if (b.bot && (!J.pvp || RFP.soyHost)) setTimeout(() => { if (!GALERIA.cerrada && J.fase === 'fin') galeriaVotaBot(b); }, 1500 + Math.random() * 5000);
}
const galeriaActiva = () => GALERIA.candidatos.length > 0;
// un bot vota: el mejor camuflaje suele ser el de más porcentaje, el peor el de menos (con algo de azar para que no sea un cálculo)
function galeriaVotaBot(b) {
  const otros = GALERIA.candidatos.filter(e => e !== b && e !== b.cuerpo); if (otros.length < 2) return;
  const nota = e => e.camo + Math.random() * 30;
  const orden = otros.slice().sort((a, c) => nota(c) - nota(a));
  galeriaVota(b, galId(orden[0]), galId(orden[orden.length - 1]), true);
}
// el voto de alguien (tuyo, de un bot o llegado por la red): mejor y peor, sin votarse a uno mismo
function galeriaVota(quien, mejor, peor, manda) {
  if (GALERIA.cerrada || mejor === peor) return;
  const id = galId(quien), suyo = quien.cuerpo ? galId(quien.cuerpo) : -1; if (mejor === id || peor === id || mejor === suyo || peor === suyo) return;
  if (!galEnte(mejor) || !galEnte(peor)) return;
  GALERIA.votos.set(id, { mejor, peor });
  if (manda && J.pvp) rfpManda({ t: 'vt', s: id, b: mejor, p: peor });
  if (quien.jugador) { GALERIA.mio = { mejor, peor }; play('select'); }
  galeriaPinta();
  if (galeriaTodosVotaron()) galeriaCierra();
}
function rfpVotoRecibido(m) {
  const e = RFP.slots[m.s] && RFP.slots[m.s].ente; if (!e || !galeriaActiva()) return;
  if (!(m.de === m.s || (m.de === RFP.host && e.bot))) return;      // cada uno vota por sí mismo; los bots, el anfitrión
  galeriaVota(e, m.b, m.p, false);
}
const galeriaTodosVotaron = () => J.entes.filter(e => !e.dueno).every(e => GALERIA.votos.has(galId(e)));      // (los cuerpos de Ida y vuelta no votan: vota su becario)
// el recuento: cuántos votos de mejor y de peor tiene cada candidato
function galeriaRecuento() {
  const r = new Map(GALERIA.candidatos.map(e => [galId(e), { mejor: 0, peor: 0 }]));
  for (const v of GALERIA.votos.values()) { if (r.has(v.mejor)) r.get(v.mejor).mejor++; if (r.has(v.peor)) r.get(v.peor).peor++; }
  return r;
}
function galeriaCierra() {
  if (GALERIA.cerrada || !galeriaActiva()) return;
  GALERIA.cerrada = true;
  const r = galeriaRecuento(), lista = GALERIA.candidatos.slice();
  const mejor = lista.sort((a, b) => (r.get(galId(b)).mejor - r.get(galId(a)).mejor) || (b.camo - a.camo))[0];
  const peor = lista.filter(e => e !== mejor).sort((a, b) => (r.get(galId(b)).peor - r.get(galId(a)).peor) || (a.camo - b.camo))[0];
  GALERIA.mejor = mejor; GALERIA.peor = peor;
  if (mejor) mejor.galeria = GALERIA.premio;
  if (J.resultado) J.resultado.ranking = clasificacion();
  play(mejor && mejor.jugador ? 'crown' : 'select');
  galeriaPinta();
  if (!E('p-fin').hidden) E('fin-ranking').innerHTML = pintaRankingFin(J.resultado.ranking);
}
// cada segundo mientras está abierta: el plazo
function galeriaAvanza(dt) {
  if (!galeriaActiva() || GALERIA.cerrada || J.fase !== 'fin') return;
  GALERIA.t += dt;
  const n = E('gal-plazo'); if (n) n.textContent = Math.max(0, Math.ceil(GALERIA.plazo - GALERIA.t)) + ' s';
  if (GALERIA.t >= GALERIA.plazo) galeriaCierra();
}

// ---------- la pantalla: los pedestales en la ventana del final ----------
function galeriaPinta() {
  const caja = E('fin-galeria'); if (!caja) return;
  caja.hidden = !galeriaActiva(); if (caja.hidden) return;
  const r = galeriaRecuento(), yo = J.yo, puedo = !GALERIA.cerrada && yo && !GALERIA.votos.has(galId(yo));
  const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  if (!caja.dataset.lista) {
    caja.dataset.lista = '1';
    caja.innerHTML = `<h3 class="ol">${tr('GALERÍA DE DISFRACES')}</h3><p class="gal-sub" id="gal-sub"></p><div class="gal-rejilla">`
      + GALERIA.candidatos.map(e => `<div class="gal-ficha" data-id="${galId(e)}"><canvas width="120" height="120"></canvas><span class="gal-nom">${esc(e.jugador ? tr('Tú') : e.nombre)}<small>${e.fuera ? tr('Despedido') : e.camo + ' %'}</small></span>
        <span class="gal-votos"><b class="mejor"></b><b class="peor"></b></span><span class="gal-botones"><button type="button" class="boton peq" data-v="mejor">${tr('MEJOR')}</button><button type="button" class="boton peq gris" data-v="peor">${tr('PEOR')}</button></span></div>`).join('')
      + `</div><p class="gal-frase" id="gal-frase" hidden></p>`;
    for (const e of GALERIA.candidatos) galeriaPedestal(caja.querySelector(`.gal-ficha[data-id="${galId(e)}"] canvas`), e);
    caja.querySelectorAll('.gal-ficha button').forEach(b => { b.onclick = () => galeriaToca(Number(b.closest('.gal-ficha').dataset.id), b.dataset.v); });
  }
  for (const f of caja.querySelectorAll('.gal-ficha')) {
    const id = Number(f.dataset.id), v = r.get(id) || { mejor: 0, peor: 0 }, e = galEnte(id);
    f.querySelector('.mejor').textContent = v.mejor ? '+' + v.mejor : ''; f.querySelector('.peor').textContent = v.peor ? '-' + v.peor : '';
    f.classList.toggle('mio-mejor', GALERIA.mio.mejor === id); f.classList.toggle('mio-peor', GALERIA.mio.peor === id);
    f.classList.toggle('gana', GALERIA.cerrada && GALERIA.mejor === e); f.classList.toggle('pierde', GALERIA.cerrada && GALERIA.peor === e);
    f.querySelector('.gal-botones').hidden = !puedo || (yo && (galId(yo) === id || (yo.cuerpo && galId(yo.cuerpo) === id)));
    for (const b of f.querySelectorAll('button')) b.classList.toggle('puesto', GALERIA.pre && GALERIA.pre[b.dataset.v] === id);
  }
  const sub = E('gal-sub');
  if (GALERIA.cerrada) sub.textContent = GALERIA.mejor ? tr('Mejor camuflaje: {a} (+{n} puntos)', { a: GALERIA.mejor.jugador ? tr('Tú') : GALERIA.mejor.nombre, n: GALERIA.premio }) : '';
  else if (puedo) sub.innerHTML = `${esc(tr('Vota el mejor y el peor camuflaje'))} · <span id="gal-plazo">${Math.max(0, Math.ceil(GALERIA.plazo - GALERIA.t))} s</span>`;
  else sub.innerHTML = `${esc(tr('Esperando los demás votos'))} · <span id="gal-plazo">${Math.max(0, Math.ceil(GALERIA.plazo - GALERIA.t))} s</span>`;
  const fr = E('gal-frase'); fr.hidden = !(GALERIA.cerrada && GALERIA.peor);
  if (!fr.hidden) fr.textContent = tr('Peor camuflaje: {a}.', { a: GALERIA.peor.jugador ? tr('Tú') : GALERIA.peor.nombre }) + ' ' + tr(GALERIA.frase);
}
// tocas MEJOR en uno y PEOR en otro: cuando están los dos, se vota
function galeriaToca(id, v) {
  GALERIA.pre = GALERIA.pre || { mejor: null, peor: null }; GALERIA.pre[v] = GALERIA.pre[v] === id ? null : id; play('select');
  if (GALERIA.pre.mejor != null && GALERIA.pre.peor != null && GALERIA.pre.mejor !== GALERIA.pre.peor) { galeriaVota(J.yo, GALERIA.pre.mejor, GALERIA.pre.peor, true); GALERIA.pre = null; }
  else galeriaPinta();
}
// el pedestal: el trozo de suelo donde se escondió, con los muebles de alrededor y él encima, congelado tal como estaba
function galeriaPedestal(cv, e) {
  const c = cv.getContext('2d'), z = 2, x0 = e.x - cv.width / z / 2, y0 = e.y - 24 - cv.height / z / 2;
  c.setTransform(z, 0, 0, z, -x0 * z, -y0 * z);
  c.drawImage(MAPA.fondo, 0, 0, ANCHO, ALTO);
  for (const f of MAPA.porY) if (f.dibujo) c.drawImage(f.dibujo.cv, f.dib.x0, f.dib.y0, f.dib.w, f.dib.h);
  const falso = Object.assign({}, e, { fuera: false, tFuera: 0, hielo: 1, tiembla: 0, invis: 0, pz: null });
  pintaAlubia(c, falso, 0);
}
