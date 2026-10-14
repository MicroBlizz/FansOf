// Fans of Survivors · Las armas: cada carta de Animales Locos dispara sola. Aquí está lo que hace cada una;
// sus cifras (daño, recarga, cuántas) están en datos.js (ARMAS).
'use strict';

// las cifras de un arma a su nivel en la partida, con lo que suma su carta (nivel y habilidad) y el área de lo que llevas puesto
function vArma(k) {
  const v = ARMAS[k].v(P.armas[k]), A = P.mods.arma[ARMAS[k].carta], area = 1 + P.mods.area + (A ? A.area : 0);
  if (A) { v.dano *= A.mul; if (v.cd) v.cd *= Math.max(0.5, 1 - A.cd); }
  if (v.r) v.r *= area;
  return v;
}
function armasDisparan(dt) {
  const R = multRecarga();
  for (const k in P.armas) {
    if (k === 'suricata' || CONTINUAS.has(ARMAS[k].tipo)) continue;   // las auras, lo que gira y los escudos van aparte
    if (k === 'vacas' && P.vacas) continue;   // mientras giran las vacas no cuenta la recarga
    P.cd[k] = (P.cd[k] || 0) - dt;
    if (P.cd[k] > 0) continue;
    const v = vArma(k);
    const hecho = DISPARO[k](v);
    P.cd[k] = hecho === false ? 0.4 : v.cd * R;   // si no había a quién disparar, vuelve a mirar enseguida
  }
  armasContinuas(dt);
  if (P.armas.suricata) aura(dt);
  if (P.vacas) vacasGiran(dt);
  if (P.jug.salto) saltoChaos(dt);
}

const DISPARO = {
  // Zanahorias: al más cercano (o a los más cercanos si salen varias)
  zanahoria(v) {
    const j = P.jug, ya = new Set();
    let algo = false;
    for (let i = 0; i < v.n; i++) {
      const e = masCercano(j.x, j.y - 20, 520, ya) || masCercano(j.x, j.y - 20, 520); if (!e) break;
      ya.add(e); algo = true;
      const dx = e.x - j.x, dy = e.y - 14 - (j.y - 30), d = Math.hypot(dx, dy) || 1, ab = (i - (v.n - 1) / 2) * 0.08;
      const ca = Math.cos(ab), sa = Math.sin(ab), ux = (dx / d) * ca - (dy / d) * sa, uy = (dx / d) * sa + (dy / d) * ca;
      P.proy.push({ tipo: 'zanahoria', x: j.x, y: j.y - 30, vx: ux * v.vel, vy: uy * v.vel, t: 1.3, dano: v.dano, quedan: v.atraviesa, golpeados: new Set(), giro: 0 });
    }
    if (algo) play('carrot');
    return algo;
  },
  // Chaos Jump: salta y cae aplastando
  chaos(v) {
    if (!P.enemigos.length) return false;
    P.jug.salto = { t: 0, dur: 0.6, r: v.r, dano: v.dano }; play('jump');
    return true;
  },
  // MadSquirrel: ardillas en abanico, en todas direcciones
  ardillas(v) {
    const j = P.jug, a0 = Math.random() * Math.PI * 2;
    for (let i = 0; i < v.n; i++) {
      const a = a0 + (i / v.n) * Math.PI * 2 + rand(-0.2, 0.2);
      P.proy.push({ tipo: 'ardilla', x: j.x, y: j.y - 6, vx: Math.cos(a) * v.vel, vy: Math.sin(a) * v.vel * 0.85, t: v.vida, dano: v.dano, quedan: 999, golpeados: new Set(), walk: Math.random() * 6 });
    }
    play('pop'); return true;
  },
  // BoomBeaver: corre al grupo más gordo que vea y explota
  castor(v) {
    const j = P.jug, cand = P.enemigos.filter(e => !e.muerto && Math.hypot(e.x - j.x, e.y - j.y) < 380);
    if (!cand.length) return false;
    for (let i = 0; i < v.n; i++) {
      let mejor = null, mn = -1;
      for (let s = 0; s < 8; s++) { const e = pick(cand); let n = 0; cerca(e.x, e.y, v.r, () => n++); if (n > mn) { mn = n; mejor = e; } }
      P.proy.push({ tipo: 'castor', x: j.x + rand(-10, 10), y: j.y, obj: mejor, tx: mejor.x, ty: mejor.y, vel: v.vel, t: 2.6, dano: v.dano, r: v.r, walk: 0, face: 1 });
    }
    play('deploy'); return true;
  },
  // SlyFox: aparece junto a los enemigos con más vida y les pega x3
  zorro(v) {
    const j = P.jug, L = P.enemigos.filter(e => !e.muerto && Math.hypot(e.x - j.x, e.y - j.y) < v.alcance).sort((a, b) => b.vida - a.vida).slice(0, v.n);
    if (!L.length) return false;
    for (const e of L) {
      const lado = Math.random() < 0.5 ? -1 : 1;
      P.efectos.push({ tipo: 'zorro', x: e.x - lado * (e.r * e.escala + 14), y: e.y + 2, face: lado, t: 0.5, max: 0.5 });
      herir(e, v.dano * v.mult, lado, 0, 120, true);
    }
    play('blink'); return true;
  },
  // JunkCoon: bolsas de basura que caen en parábola y explotan
  mapache(v) {
    const j = P.jug, cand = P.enemigos.filter(e => !e.muerto && Math.hypot(e.x - j.x, e.y - j.y) < v.alcance);
    if (!cand.length) return false;
    for (let i = 0; i < v.n; i++) { const e = pick(cand); P.proy.push({ tipo: 'bolsa', x0: j.x, y0: j.y - 34, tx: e.x + rand(-12, 12), ty: e.y + rand(-12, 12), t: 0, dur: 0.62, dano: v.dano, r: v.r, x: j.x, y: j.y }); }
    play('trash'); return true;
  },
  // MechaVaca: las vacas empiezan a girar
  vacas(v) { P.vacas = { t: 0, dura: v.dura, n: v.n, r: v.r, dano: v.dano, giro: v.giro, a0: Math.random() * 6 }; play('summon'); return true; },
};

// MeerCat: el aura daña cada medio segundo y cura poco a poco
function aura(dt) {
  const v = vArma('suricata'), j = P.jug;
  curarSuave(v.cura * dt);
  P.auraT -= dt; if (P.auraT > 0) return;
  P.auraT = v.tick;
  cerca(j.x, j.y - 10, v.r, e => herir(e, v.dano, 0, 0, 0)); golpeCajas(j.x, j.y - 10, v.r, v.dano);
}
function curarSuave(n) { const j = P.jug; j.vida = Math.min(j.vidaMax, j.vida + n); }

function vacasGiran(dt) {
  const V = P.vacas, j = P.jug; V.t += dt;
  if (V.t >= V.dura) { P.vacas = null; P.cd.vacas = vArma('vacas').cd * multRecarga(); return; }
  for (let i = 0; i < V.n; i++) {
    const a = V.a0 + V.t * V.giro + (i / V.n) * Math.PI * 2, x = j.x + Math.cos(a) * V.r, y = j.y - 10 + Math.sin(a) * V.r * 0.8;
    cerca(x, y, 20, e => {
      if (P.t - e.vacaT < 0.45) return; e.vacaT = P.t;
      const dx = e.x - j.x, dy = e.y - j.y, d = Math.hypot(dx, dy) || 1;
      herir(e, V.dano, dx / d, dy / d, 380); play('hit');
    });
    golpeCajas(x, y, 20, V.dano * 0.2);
  }
}
function saltoChaos(dt) {
  const S = P.jug.salto; S.t += dt;
  if (S.t < S.dur) return;
  const j = P.jug; P.jug.salto = null;
  cerca(j.x, j.y, S.r, e => { const dx = e.x - j.x, dy = e.y - j.y, d = Math.hypot(dx, dy) || 1; herir(e, S.dano, dx / d, dy / d, 520); }); golpeCajas(j.x, j.y, S.r, S.dano);
  P.efectos.push({ tipo: 'onda', x: j.x, y: j.y, r: S.r, t: 0.45, max: 0.45 });
  particulas(j.x, j.y, 22, '#e9dcc0', 260, 5);
  P.sacudida = Math.max(P.sacudida, 7); play('slam');
}
function explotar(x, y, r, dano, col = '#ff9a3c') {
  cerca(x, y, r, e => { const dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy) || 1; herir(e, dano, dx / d, dy / d, 300); }); golpeCajas(x, y, r, dano);
  P.efectos.push({ tipo: 'boom', x, y, r, t: 0.4, max: 0.4, col });
  particulas(x, y, 16, col, 240, 5); particulas(x, y, 6, '#5a5a66', 120, 7, 0.8);
  P.sacudida = Math.max(P.sacudida, 4);
}

function moverProyectiles(dt) {
  for (const p of P.proy) {
    p.t -= dt;
    if (p.gen) { moverGen(p, dt); continue; }   // las armas de las otras facciones: armas-tipos.js
    if (p.tipo === 'zanahoria' || p.tipo === 'ardilla') {
      p.x += p.vx * dt; p.y += p.vy * dt; p.giro = (p.giro || 0) + dt * 14; if (p.walk !== undefined) p.walk += dt * 18;
      cerca(p.x, p.y + (p.tipo === 'ardilla' ? 0 : 14), p.tipo === 'ardilla' ? 12 : 8, e => {
        if (p.quedan <= 0 || p.golpeados.has(e)) return;
        p.golpeados.add(e); p.quedan--;
        const d = Math.hypot(p.vx, p.vy) || 1; herir(e, p.dano, p.vx / d, p.vy / d, p.tipo === 'ardilla' ? 140 : 90);
      });
      if (p.quedan > 0) golpeCajas(p.x, p.y, 10, p.dano);
      if (p.quedan <= 0) p.t = 0;
    } else if (p.tipo === 'castor') {
      if (p.obj && !p.obj.muerto) { p.tx = p.obj.x; p.ty = p.obj.y; }
      const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy) || 1;
      p.x += (dx / d) * p.vel * dt; p.y += (dy / d) * p.vel * dt; p.walk += dt * 16; if (Math.abs(dx) > 2) p.face = dx > 0 ? 1 : -1;
      if (d < 14 || p.t <= 0) { explotar(p.x, p.y, p.r, p.dano); play('boom'); p.t = 0; }
    } else if (p.tipo === 'bolsa') {
      p.k = (p.k || 0) + dt / p.dur; const f = Math.min(1, p.k);   // de 0 (sale) a 1 (cae)
      p.x = lerp(p.x0, p.tx, f); p.y = lerp(p.y0, p.ty, f); p.z = Math.sin(f * Math.PI) * 110;
      if (f >= 1) { explotar(p.tx, p.ty, p.r, p.dano, '#9ad04a'); play('trash'); p.t = -1; }
      else p.t = 1;
    }
  }
  P.proy = P.proy.filter(p => p.t > 0);
}
