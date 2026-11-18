// Fans of Goose · Los MINIJEFES que guardan la puerta de cada tierra (la primera casilla del Pantano, el Cementerio, la Aldea, las
// Catacumbas y el Castillo): la Rana Reina, el Cuervo Gigante, la Oca Alcaldesa, el Caballero Oca y, en la Muerte (58), la OCA PARCA
// (js/parca.js, con sus tres fases y su regateo). Al llegar a la puerta el tablero se cierra: no puedes tirar hasta vencerlo.
'use strict';

const MINIJEFES = {
  pantano:    { tipo: 'mj-rana',      nombre: 'LA RANA REINA',     vida: 120,  r: 18, vel: 14, dano: 8 },
  cementerio: { tipo: 'mj-cuervo',    nombre: 'EL CUERVO GIGANTE', vida: 240,  r: 20, vel: 34, dano: 12 },
  aldea:      { tipo: 'mj-alcalde',   nombre: 'LA OCA ALCALDESA',  vida: 340,  r: 18, vel: 20, dano: 14 },
  catacumbas: { tipo: 'mj-caballero', nombre: 'EL CABALLERO OCA',  vida: 460,  r: 18, vel: 24, dano: 18 },
  castillo:   { tipo: 'mj-caballero', nombre: 'EL CABALLERO NEGRO', vida: 650, r: 18, vel: 28, dano: 20 },
};

// la vida y el daño van por la PUERTA (la 1.ª, la 2.ª…), no por la tierra: las tierras salen en otro orden en cada partida
const PUERTA_VIDA = [120, 240, 340, 460, 650], PUERTA_DANO = [8, 12, 14, 18, 20];
function empiezaMinijefe(t) {
  const J = JUEGO, M = MINIJEFES[biomaDe(t).id]; if (!M) return;
  for (let i = ENE.n - 1; i >= 0; i--) { const e = ENE.lista[i]; if (Math.hypot(e.x - J.yo.x, e.y - J.yo.y) < 120) e.hp = 0; }
  const e = creaEnemigo('oca', centroX(t), yCentro(t) - 30); if (!e) return;
  const p = Math.max(0, Math.min(4, indiceBioma(t) - 1));
  e.tipo = M.tipo; e.hpMax = e.hp = PUERTA_VIDA[p] * (1 + J.nivel * 0.06) * J.mod.jefes; e.r = M.r; e.vel = M.vel; e.dano = PUERTA_DANO[p]; e.xp = 25; e.fase = 0; e.f2 = 1.5; e.cd = 0;
  J.minijefe = e; J.fase = 'parado'; J.escena = { tipo: 'minijefe', cx: centroX(t), cy: yCentro(t), r: 999, nombre: M.nombre };
  aviso(tr(M.nombre), '#ff9b4d', 2.2); aviso2(tr('Guarda la puerta de la tierra')); SONIDO.jefe(); tiembla(5); destella('#ff9b4d', 0.3); vibra(120);
}

// el movimiento de cada minijefe (lo llama muevePropio). Devuelve [qx, qy]
function mueveMinijefe(e, dt, ux, uy, d) {
  const J = JUEGO, yo = J.yo; e.f2 -= dt; e.cd -= dt;
  const furia = e.hp < e.hpMax * 0.4;
  avanzaJefe2(e, dt, furia);   // escudo, zonas rojas y gran ataque (js/jefes2.js)
  const nuevo = mueveMinijefe2(e, dt, ux, uy, d, furia); if (nuevo) return nuevo;   // los de las tierras nuevas (js/tierras2.js)
  if (e.tipo === 'mj-rana') {   // salta en arco y, al caer, charco; de vez en cuando escupe ranas
    if (e.f2 <= 0) { e.f2 = furia ? 2 : 2.8; e.kx += ux * 150; e.ky += uy * 150; e.fase = 1; }
    if (e.fase === 1 && Math.hypot(e.kx, e.ky) < 30) { e.fase = 0; const c = CHARCOS.saca(); if (c) { c.x = e.x; c.y = e.y; c.r = 16; c.vida = 2; c.dps = 0; c.tic = 0; c.malo = true; } tiembla(3); if (e.cd <= 0) { e.cd = 6; for (let i = 0; i < 2; i++) { const r = creaEnemigo('rana', e.x + (i - 1) * 20, e.y); } } }
    return [0, 0];
  }
  if (e.tipo === 'mj-cuervo') {   // círculos a tu alrededor y picados; roba plumas al pasar
    const a = e.t * 1.6, r = furia ? 40 : 60, tx = yo.x + Math.cos(a) * r, ty = yo.y + Math.sin(a) * r * 0.6;
    if (e.f2 <= 0) { e.f2 = furia ? 1.4 : 2.2; e.kx += ux * 260; e.ky += uy * 260; SONIDO.bandada(); }
    const l = PLUMAS.lista; for (let i = 0; i < PLUMAS.n; i++) { const p = l[i]; if (p.tipo === 'xp' && (p.x - e.x) ** 2 + (p.y - e.y) ** 2 < 100) { p.tipo = 'robada'; p.valor = 0; } }
    const dd = Math.hypot(tx - e.x, ty - e.y) || 1; return [(tx - e.x) / dd, (ty - e.y) / dd];
  }
  if (e.tipo === 'mj-alcalde') {   // lanza antorchas en abanico que dejan fuego
    if (e.f2 <= 0) { e.f2 = furia ? 1.6 : 2.6; const n = furia ? 7 : 5; for (let i = 0; i < n; i++) { const an = Math.atan2(uy, ux) + (i - (n - 1) / 2) * 0.35; disparaBala(e.x, e.y, Math.cos(an) * 80, Math.sin(an) * 80, 9, 'fuego', 4); } SONIDO.jefeTiro(); }
    return d > 60 ? [ux, uy] : [-uy, ux];
  }
  // caballero: embiste y, al chocar, onda; en furia, dos embestidas seguidas
  if (e.f2 <= 0) { e.fase = (e.fase + 1) % 3; e.f2 = e.fase === 2 ? 0.5 : furia ? 0.9 : 1.4; if (e.fase === 2) { e.kx += ux * 300; e.ky += uy * 300; SONIDO.jefeCarga(); } }
  if (e.fase === 2 && d < 24 && e.cd <= 0) { e.cd = 1; anillo(e.x, e.y, 40, '#c9d3ff', 0.4, 4); tiembla(4); for (let i = 0; i < 3; i++) creaEnemigo('oca', e.x + (i - 1) * 16, e.y + 12); }
  return e.fase === 2 ? [0, 0] : [ux, uy];
}

// al vencerlo se abre la puerta: la tierra nueva
function muereMinijefe(e) {
  const J = JUEGO;
  if (J.minijefe !== e) return;
  J.minijefe = null; J.escena = null; J.quieto = 0;
  for (let i = 0; i < 4; i++) estallido(e.x + (Math.random() - 0.5) * 30, e.y + (Math.random() - 0.5) * 30, 14, i % 2 ? '#ffd34d' : '#ece6d6', 120, 1, 2.6, 1, 20);
  for (let i = 0; i < 12; i++) suelta('moneda', e.x + (Math.random() - 0.5) * 50, e.y + (Math.random() - 0.5) * 30, 1);
  suelta('cofre', e.x, e.y - 10, 1);
  const B = biomaDe(J.casilla);
  aviso(tr('¡PUERTA ABIERTA!'), '#ffd34d', 2); aviso2(tr(B.nombre) + (TIERRAS[B.id].regla ? ': ' + tr(TIERRAS[B.id].regla) : ''));
  tiembla(7); destella('#ffd34d', 0.6); congela(0.15); SONIDO.victoria(); vibra([60, 40, 120]);
  J.mjHechos = (J.mjHechos || 0) + 1;
  abreCruce(B.id);   // ¿por dónde sigues? (js/caminos.js)
}

function pintaMinijefeHud() {
  const J = JUEGO, e = J.minijefe; if (!e || e.hp <= 0) return;
  const W = PAN.W;
  texto2(tr(J.escena.nombre), W / 2, 41, 10, e.tipo === 'parca' ? '#c9a0ff' : '#ff9b4d', 'center', FUENTE_G, 400, 0.25);
  barra(24, 50, W - 48, 5, e.hp / e.hpMax, e.tipo === 'parca' ? '#c9a0ff' : '#ff9b4d');
}
