// Fans of Goose · Cuatro armas más y seis pasivas más (0.5.0). Armas: la HERRADURA (va y vuelve como un bumerán), la GAITA DE OCA (un
// bocinazo en cono que empuja), el RAYO DE TORMENTA (cae sobre las ocas y salta de una a otra) y los CEPOS (trampas en el suelo que
// atrapan y muerden). Pasivas: Plumas de erizo (espinas), Pico vampiro (curas al tumbar), Ojo de la Oca (más cartas para elegir),
// Llave del cofre (cofres mejores), Escudo de plumas (para un golpe cada poco) y Bolsillo de flechas (+1 proyectil). Todo pixel art.
'use strict';

Object.assign(NIV, {
  herradura: { cd: [1.6, 1.5, 1.4, 1.3, 1.1], n: [1, 1, 2, 2, 3], dano: [12, 15, 18, 22, 28], alcance: [70, 80, 85, 95, 110] },
  gaita: { cd: [2.2, 2.0, 1.8, 1.6, 1.4], alcance: [55, 60, 66, 72, 82], abre: [0.5, 0.55, 0.62, 0.7, 0.8], dano: [10, 12, 15, 18, 24] },
  rayo: { cd: [2.0, 1.8, 1.6, 1.4, 1.2], n: [1, 2, 2, 3, 4], dano: [25, 30, 36, 42, 52], cadena: [0, 0, 1, 1, 2] },
  cepo: { cd: [3.0, 2.8, 2.6, 2.3, 2.0], n: [1, 1, 2, 2, 3], dano: [30, 36, 44, 52, 64] },
});
Object.assign(ARMAS, {
  herradura: { nombre: 'Herradura de la suerte', icono: 'herradura', color: '#c9d3ff',
    niveles: ['Una herradura que va y vuelve, golpeando a la ida y a la vuelta.', 'Más daño y más lejos.', 'Dos herraduras.', 'Más rápida y más lejos.', 'Tres herraduras.'],
    evo: { pasiva: 'llave', nombre: 'Herraduras de oro', desc: 'Cuatro herraduras doradas: cada golpe es crítico.' } },
  gaita: { nombre: 'Gaita de oca', icono: 'gaita', color: '#c98a3d',
    niveles: ['Un bocinazo en cono hacia donde miras que pega y empuja.', 'Más lejos.', 'Cono más ancho y más fuerte.', 'Más a menudo.', 'Un bocinazo enorme.'],
    evo: { pasiva: 'ojo', nombre: 'Gaita del Diablo', desc: 'El bocinazo sale en todas direcciones y atonta a las ocas.' } },
  rayo: { nombre: 'Rayo de tormenta', icono: 'rayo', color: '#ffe680',
    niveles: ['Un rayo cae sobre una oca.', 'Dos rayos.', 'Saltan a otra oca cercana.', 'Tres rayos.', 'Cuatro rayos que saltan dos veces.'],
    evo: { pasiva: 'colmillo', nombre: 'Rayo vampírico', desc: 'Más rayos, y cada uno te cura un poco.' } },
  cepo: { nombre: 'Cepos', icono: 'cepo', color: '#a09080',
    niveles: ['Dejas un cepo que atrapa y muerde a la primera oca que lo pisa.', 'Más mordisco.', 'Dos cepos a la vez.', 'Más a menudo.', 'Tres cepos que muerden fortísimo.'],
    evo: { pasiva: 'espinas', nombre: 'Campo de cepos', desc: 'Los cepos explotan al cerrarse y pillan a todas las de alrededor.' } },
});
Object.assign(PASIVAS, {
  espinas: { nombre: 'Plumas de erizo', desc: 'Las ocas que te tocan reciben daño.', icono: 'espinas' },
  colmillo: { nombre: 'Pico vampiro', desc: 'Cada pocas ocas que tumbas, te curas.', icono: 'colmillo' },
  ojo: { nombre: 'Ojo de la Oca', desc: 'Más a menudo eliges entre cuatro cartas.', icono: 'ojo' },
  llave: { nombre: 'Llave del cofre', desc: 'Los cofres dan más mejoras.', icono: 'llave' },
  escudo: { nombre: 'Escudo de plumas', desc: 'Para un golpe cada pocos segundos.', icono: 'escudo' },
  flechas: { nombre: 'Bolsillo de flechas', desc: '+1 huevo, dado, piedra o herradura cada dos niveles.', icono: 'flechas' },
});
// lo que valen (lo llama calculaStats)
function statsNuevas(st) {
  const p = id => JUEGO.pasivas[id] || 0;
  st.espinas = p('espinas') * 8; st.vampiro = p('colmillo') ? 16 - p('colmillo') * 2 : 0;   // 1 de vida cada tantas bajas
  st.cartas4 = p('ojo') * 0.15; st.llave = p('llave') * 0.08;   // estaban dentro del comentario hasta la 0.9.0: Ojo y Llave no hacían nada
  st.escudo = p('escudo') ? 15 - p('escudo') * 2 : 0; st.extra = Math.floor((p('flechas') + 1) / 2);
}
// el escudo de plumas: ¿para este golpe? (lo llama heridaJugador)
function escudoPara() {
  const J = JUEGO; if (!J.st.escudo || J.t < (J.escudoListo || 0)) return false;
  J.escudoListo = J.t + J.st.escudo; J.invul = 0.6; anillo(J.yo.x, J.yo.y, 22, '#6bf2ff', 0.35, 2); texto(J.yo.x, J.yo.y - 14, tr('¡PARADO!'), '#6bf2ff', 7, 0.6); SONIDO.corte();
  return true;
}

const HERRADURAS = [], CEPOS = [], RAYOS = [], NOTAS = [];
function armasMas(A, dt) {
  if (A.herradura && A.herradura.t <= 0) armaHerradura(A.herradura);
  if (A.gaita && A.gaita.t <= 0) armaGaita(A.gaita);
  if (A.rayo && A.rayo.t <= 0) armaRayo(A.rayo);
  if (A.cepo && A.cepo.t <= 0) armaCepo(A.cepo);
  avanzaHerraduras(dt); avanzaCepos(dt);
  armasCuatro(A, dt);   // ficha, tintero, rueda, reloj de arena y la Paciencia (js/armas4.js)
  for (let i = RAYOS.length - 1; i >= 0; i--) { RAYOS[i].t -= dt; if (RAYOS[i].t <= 0) RAYOS.splice(i, 1); }
  for (let i = NOTAS.length - 1; i >= 0; i--) { const n = NOTAS[i]; n.t -= dt; n.x += n.vx * dt; n.y += n.vy * dt; if (n.t <= 0) NOTAS.splice(i, 1); }
}
function vaciaArmasMas() { HERRADURAS.length = 0; CEPOS.length = 0; RAYOS.length = 0; NOTAS.length = 0; }

// --- herradura: sale hacia la oca más cercana, llega a su alcance y vuelve a ti ---
function armaHerradura(a) {
  const yo = JUEGO.yo, obj = ocaMasCercana(160), n = (a.evo ? 4 : nv('herradura', 'n')) + JUEGO.st.extra;
  const base = obj ? Math.atan2(obj.y - yo.y, obj.x - yo.x) : Math.atan2(yo.miraY, yo.miraX);
  for (let i = 0; i < n && HERRADURAS.length < 16; i++) {
    const an = base + (i - (n - 1) / 2) * (a.evo ? 1.57 : 0.5);
    HERRADURAS.push({ x: yo.x, y: yo.y, an, d: 0, max: (a.evo ? 110 : nv('herradura', 'alcance')) * multiArea(), vuelve: false, gira: 0, dano: (a.evo ? 30 : nv('herradura', 'dano')) * JUEGO.st.dano * multiDado(), evo: a.evo, golpes: new Map() });
  }
  a.t = (a.evo ? 1.0 : nv('herradura', 'cd')) * JUEGO.st.cd; SONIDO.lanza();
}
function avanzaHerraduras(dt) {
  const yo = JUEGO.yo;
  for (let i = HERRADURAS.length - 1; i >= 0; i--) {
    const h = HERRADURAS[i]; h.gira += dt * 18;
    if (!h.vuelve) { h.d += 200 * dt; h.x = yo.x + Math.cos(h.an) * h.d; h.y = yo.y + Math.sin(h.an) * h.d; if (h.d >= h.max) h.vuelve = true; }
    else { const dx = yo.x - h.x, dy = yo.y - h.y, d = Math.hypot(dx, dy) || 1; h.x += dx / d * 230 * dt; h.y += dy / d * 230 * dt; if (d < 8) { HERRADURAS.splice(i, 1); continue; } }
    const n = enemigosCerca(h.x, h.y, 14);
    for (let k = 0; k < n; k++) {
      const e = ENE.lista[CERCA[k]]; if (e.hp <= 0 || e.oculta) continue;
      if ((e.x - h.x) ** 2 + (e.y - h.y) ** 2 > (e.r + 5) ** 2) continue;
      const t = h.golpes.get(e.id) || 0; if (JUEGO.t - t < 0.35) continue;
      h.golpes.set(e.id, JUEGO.t); const d = Math.hypot(e.x - yo.x, e.y - yo.y) || 1;
      danar(e, h.dano, (e.x - yo.x) / d, (e.y - yo.y) / d, 80, false, h.evo);
    }
  }
}

// --- gaita: un cono hacia donde miras (en la evolución, todo alrededor) ---
function armaGaita(a) {
  const yo = JUEGO.yo, ang = Math.atan2(yo.miraY, yo.miraX), r = (a.evo ? 90 : nv('gaita', 'alcance')) * multiArea(), abre = a.evo ? 4 : nv('gaita', 'abre');
  const dano = (a.evo ? 26 : nv('gaita', 'dano')) * JUEGO.st.dano * multiDado(), n = enemigosCerca(yo.x, yo.y, r + 10);
  for (let k = 0; k < n; k++) {
    const e = ENE.lista[CERCA[k]]; if (e.hp <= 0 || e.oculta) continue;
    const dx = e.x - yo.x, dy = e.y - yo.y, d = Math.hypot(dx, dy) || 1; if (d > r + e.r) continue;
    if (abre < 3 && (dx * Math.cos(ang) + dy * Math.sin(ang)) / d < Math.cos(abre)) continue;
    danar(e, dano, dx / d, dy / d, 240, true); if (a.evo) { e.raiz = Math.max(e.raiz || 0, 0.8); }
  }
  const m = a.evo ? 12 : 5;
  for (let i = 0; i < m && NOTAS.length < 30; i++) { const an = a.evo ? i * 6.283 / m : ang + (i - (m - 1) / 2) * (abre / 2); NOTAS.push({ x: yo.x, y: yo.y, vx: Math.cos(an) * r * 2, vy: Math.sin(an) * r * 2, t: 0.45 }); }
  a.t = (a.evo ? 1.4 : nv('gaita', 'cd')) * JUEGO.st.cd; SONIDO.bandada(); tiembla(1);
}

// --- rayo: cae sobre ocas al azar y salta a las vecinas ---
function golpeRayo(x0, y0, e, dano, saltos, evo) {
  RAYOS.push({ x0, y0, x1: e.x, y1: e.y, t: 0.18 });
  danar(e, dano, 0, -1, 40, false);
  if (evo) JUEGO.vida = Math.min(JUEGO.st.vidaMax, JUEGO.vida + 1.5);
  estallido(e.x, e.y, 6, '#ffe680', 70, 0.3, 2, 2);
  if (saltos > 0) { const n = enemigosCerca(e.x, e.y, 50); for (let k = 0; k < n; k++) { const o = ENE.lista[CERCA[k]]; if (o !== e && o.hp > 0 && !o.oculta && Math.hypot(o.x - e.x, o.y - e.y) < 50) { golpeRayo(e.x, e.y, o, dano * 0.7, saltos - 1, evo); break; } } }
}
function armaRayo(a) {
  const n = (a.evo ? 5 : nv('rayo', 'n')), dano = (a.evo ? 50 : nv('rayo', 'dano')) * JUEGO.st.dano * multiDado();
  for (let i = 0; i < n; i++) { const e = objetivoAlAzar(150); if (e) golpeRayo(e.x + (Math.random() - 0.5) * 20, JUEGO.camY - 10, e, dano, a.evo ? 2 : nv('rayo', 'cadena'), a.evo); }
  a.t = (a.evo ? 1.1 : nv('rayo', 'cd')) * JUEGO.st.cd; destella('#fff6c2', 0.12); SONIDO.explota();
}

// --- cepos: se quedan en el suelo hasta que una oca los pisa ---
function armaCepo(a) {
  const yo = JUEGO.yo, n = (a.evo ? 4 : nv('cepo', 'n')) + JUEGO.st.extra;
  for (let i = 0; i < n && CEPOS.length < 18; i++) { const an = Math.random() * 6.283, d = 14 + Math.random() * 28; CEPOS.push({ x: yo.x + Math.cos(an) * d, y: yo.y + Math.sin(an) * d, t: 10, cierra: 0, dano: (a.evo ? 70 : nv('cepo', 'dano')) * JUEGO.st.dano * multiDado(), evo: a.evo }); }
  a.t = (a.evo ? 1.8 : nv('cepo', 'cd')) * JUEGO.st.cd;
}
function avanzaCepos(dt) {
  for (let i = CEPOS.length - 1; i >= 0; i--) {
    const c = CEPOS[i]; c.t -= dt;
    if (c.cierra > 0) { c.cierra -= dt; if (c.cierra <= 0) CEPOS.splice(i, 1); continue; }
    if (c.t <= 0 || c.y > JUEGO.yD) { CEPOS.splice(i, 1); continue; }
    const n = enemigosCerca(c.x, c.y, 12);
    for (let k = 0; k < n; k++) {
      const e = ENE.lista[CERCA[k]]; if (e.hp <= 0 || e.oculta || (e.x - c.x) ** 2 + (e.y - c.y) ** 2 > (e.r + 4) ** 2) continue;
      c.cierra = 0.5; e.raiz = Math.max(e.raiz || 0, 1.5); danar(e, c.dano, 0, 0, 0); SONIDO.corte();
      if (c.evo) { estallido(c.x, c.y, 14, '#ff9b4d', 90, 0.4, 2.4, 1); const m = enemigosCerca(c.x, c.y, 34); for (let q = 0; q < m; q++) { const o = ENE.lista[CERCA[q]]; if (o.hp > 0 && Math.hypot(o.x - c.x, o.y - c.y) < 30 + o.r) danar(o, c.dano * 0.6, 0, -1, 60, true); } }
      break;
    }
  }
}

// --- dibujo (todo de píxeles: los iconos de Yoshi y líneas de píxel para el rayo) ---
function pintaArmasMas() {
  pintaArmasCuatro();   // manchas de tinta y fichas (js/armas4.js)
  for (const c of CEPOS) { G.globalAlpha = c.t < 1.5 ? 0.4 + Math.sin(JUEGO.t * 20) * 0.3 : 1; if (SPR['ic-cepo']) pinta('ic-cepo', c.x, c.y, false, c.cierra > 0, c.cierra > 0 ? 0.8 : 0.7); else { G.fillStyle = '#a09080'; puntoPixel(c.x, c.y, 6); } }
  G.globalAlpha = 1;
  for (const h of HERRADURAS) { if (SPR['ic-herradura']) pintaGirado('ic-herradura', h.x, h.y, h.gira, 0.7); else { G.fillStyle = h.evo ? '#ffd34d' : '#c9d3ff'; puntoPixel(h.x, h.y, 5); } }
  for (const n of NOTAS) { G.globalAlpha = Math.min(1, n.t * 4); if (SPR['ic-nota']) pinta('ic-nota', n.x, n.y, false, false, 0.5); else { G.fillStyle = '#f6e7b8'; puntoPixel(n.x, n.y, 3); } }
  G.globalAlpha = 1;
  for (const r of RAYOS) {   // un zigzag de píxeles desde el cielo
    let px = r.x0, py = r.y0; const pasos = 7;
    for (let s = 1; s <= pasos; s++) { const t = s / pasos, nx = r.x0 + (r.x1 - r.x0) * t + (s < pasos ? (Math.random() - 0.5) * 12 : 0), ny = r.y0 + (r.y1 - r.y0) * t; lineaPixel(px, py, nx, ny, 2.5, '#fff6c2'); lineaPixel(px, py, nx, ny, 1, '#ffffff'); px = nx; py = ny; }
  }
}
