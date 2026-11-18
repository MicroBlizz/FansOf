// Fans of Snakes · VS tipo Tetris Attack, de momento contra un rival de la máquina (el online irá después, con el servidor). El
// rival juega de verdad en su propio tablero pequeño (RC x RR casillas): va a por su manzana esquivando muros y su cola, y a veces
// se equivoca (cada vez más). Lo que haces te sirve de ataque:
//   · cada racha x3, x6, x9… → 1 muro en su tablero · cada Frenesí → 2 muros · cada Demolición → 1 muro por cada 4 trozos
//     cortados (mínimo 1) y el rival va un poco más deprisa.
// Y él te ataca: cuando su barra de Frenesí se llena (comiendo), te manda una locura (Espejo, Apagón, Anuncio, Gigante o Modo
// texto) o, si ya tienes una encima, 3 muros. Gana quien sobrevive: si el rival choca, ganas (PREMIO_VS monedas).
'use strict';

const RC = 10, RR = 14, PREMIO_VS = 40;
const RIVALES = ['Becario de Microblizz', 'IAhorro Bot', 'Phony Jr.', 'Clippy 3000', 'Becaria de Phony'];
const ATAQUES_RIVAL = ['espejo', 'apagon', 'anuncio', 'gigante', 'texto'];
const VS = { rival: null, proy: [], t: 0, ver: false, pos: null, esquina: undefined, aparte: 0 };   // ver: su tablero a la vista (js/vs-pantalla.js)

function empiezaVS() {
  VS.t = 0; VS.proy = []; VS.ver = false; VS.pos = null; VS.esquina = undefined;
  VS.rival = { nombre: RIVALES[Math.floor(Math.random() * RIVALES.length)], serp: [[4, 7], [3, 7], [2, 7]], dir: [1, 0], manzana: null, muros: new Set(),
    paso: 0.3, acum: -1, vivo: true, frenesi: 0, puntos: 0, choque: 0 };
  manzanaRival();
}

const libreRival = (R, n, sinCola = true) => n[0] >= 0 && n[0] < RC && n[1] >= 0 && n[1] < RR && !R.muros.has(n[0] + ',' + n[1])
  && !R.serp.slice(0, sinCola ? -1 : undefined).some(s => s[0] === n[0] && s[1] === n[1]);
function libreAlAzarRival(R, lejos = 0) {
  for (let i = 0; i < 80; i++) {
    const p = [Math.floor(Math.random() * RC), Math.floor(Math.random() * RR)], h = R.serp[0];
    if (libreRival(R, p, false) && !(R.manzana && p[0] === R.manzana[0] && p[1] === R.manzana[1]) && Math.abs(p[0] - h[0]) + Math.abs(p[1] - h[1]) >= lejos) return p;
  }
  return null;
}
function manzanaRival() { VS.rival.manzana = libreAlAzarRival(VS.rival, 2); }

// cuántas casillas libres se alcanzan desde n (para no meterse en un callejón); corta en tope
function espacioRival(R, n, tope) {
  const visto = new Set([n[0] + ',' + n[1]]), cola = [n];
  while (cola.length && visto.size < tope) {
    const [c, r] = cola.shift();
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const m = [c + d[0], r + d[1]], k = m[0] + ',' + m[1]; if (!visto.has(k) && libreRival(R, m)) { visto.add(k); cola.push(m); } }
  }
  return visto.size;
}

function pasoRival() {
  const R = VS.rival, h = R.serp[0];
  const ops = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(d => !(d[0] === -R.dir[0] && d[1] === -R.dir[1]) && libreRival(R, [h[0] + d[0], h[1] + d[1]]));
  if (!ops.length) { R.vivo = false; return; }
  const error = Math.min(0.3, 0.04 + VS.t * 0.0016);   // se equivoca cada vez más
  let d;
  if (Math.random() < error) d = ops[Math.floor(Math.random() * ops.length)];
  else {
    const m = R.manzana || h;
    d = ops.map(o => { const n = [h[0] + o[0], h[1] + o[1]], esp = espacioRival(R, n, R.serp.length + 4); return { o, v: Math.abs(n[0] - m[0]) + Math.abs(n[1] - m[1]) + (esp < R.serp.length + 2 ? 50 : 0) }; })
      .sort((a, b) => a.v - b.v)[0].o;
  }
  R.dir = d;
  const n = [h[0] + d[0], h[1] + d[1]], come = R.manzana && n[0] === R.manzana[0] && n[1] === R.manzana[1];
  if (!come) R.serp.pop();
  R.serp.unshift(n);
  if (come) {
    R.puntos += 10; R.paso = Math.max(0.12, R.paso - 0.006); R.frenesi += 0.12;
    manzanaRival();
    if (R.frenesi >= 1) { R.frenesi = 0; ataqueDelRival(); }
  }
}

function avanzaVS(dt) {
  const R = VS.rival; if (!R) return;
  VS.t += dt;
  if (R.vivo) { R.acum += dt; while (R.acum >= R.paso && R.vivo) { R.acum -= R.paso; pasoRival(); } }
  if (R.choque > 0) R.choque -= dt;
  for (let i = VS.proy.length - 1; i >= 0; i--) { const p = VS.proy[i]; p.t += dt; if (p.t >= p.dur) { VS.proy.splice(i, 1); p.alLlegar(); } }
  if (!R.vivo && JUEGO.modo === 'juego') { R.vivo = null; numero(PAN.W / 2, TAB.y0 + 60, tr('¡{n} ha chocado!', { n: R.nombre }), '#ffd54a', 10); setTimeout(() => { if (JUEGO.modo === 'juego' && PARTIDA.tipo === 'vs') acaba(true); }, 700); }
}

// ---------- los ataques ----------
const enVS = () => PARTIDA.tipo === 'vs' && VS.rival && VS.rival.vivo && JUEGO.modo === 'juego';
function mandaMuros(k, txt) {
  if (!enVS()) return;
  const h = JUEGO.serp[0], P = panelVS();
  VS.proy.push({ x: cx(h[0]), y: cy(h[1]), tx: P.x + P.w / 2, ty: P.y + P.h / 2, t: 0, dur: 0.55, col: '#ffd54a', txt,
    alLlegar: () => { const R = VS.rival; if (!R || !R.vivo) return; for (let i = 0; i < k; i++) { const p = libreAlAzarRival(R, 3); if (p) R.muros.add(p[0] + ',' + p[1]); } R.choque = 0.3; SONIDO.corte(k); } });
}
const ataqueRacha = r => { if (r >= 3 && r % 3 === 0) mandaMuros(1, tr('+1 MURO')); };
const ataqueFrenesi = () => mandaMuros(2, tr('+2 MUROS'));
const ataqueCorte = n => { const k = 1 + Math.floor(n / 4); mandaMuros(k, tr('+{n} MUROS', { n: k })); if (enVS()) VS.rival.paso = Math.max(0.11, VS.rival.paso * 0.94); };

function ataqueDelRival() {
  if (PARTIDA.tipo !== 'vs' || JUEGO.modo !== 'juego') return;
  const P = panelVS(), h = JUEGO.serp[0], ocupada = LOCURA.t > 0;
  const tipo = ocupada ? 'muros' : ATAQUES_RIVAL[Math.floor(Math.random() * ATAQUES_RIVAL.length)];
  VS.proy.push({ x: P.x + P.w / 2, y: P.y + P.h / 2, tx: cx(h[0]), ty: cy(h[1]), t: 0, dur: 0.7, col: '#ff3d71', txt: tipo === 'muros' ? tr('+3 MUROS') : tr(LOCURAS[tipo].aviso),
    alLlegar: () => {
      if (JUEGO.modo !== 'juego') return;
      if (tipo === 'muros') { for (let i = 0; i < 3; i++) muroDeAtaque(); tiembla(2, 0.2); SONIDO.uy(); }
      else activaLocura(tipo);
    } });
}

function acabaVS(gana) {
  if (gana) { SAVE.monedas += PREMIO_VS; SAVE.vsGanados = (SAVE.vsGanados || 0) + 1; mision('vs', 1); }
  VS.proy = [];
}
