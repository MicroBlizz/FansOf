// Fans of Survivors · Los tipos de arma de las otras 8 facciones: cómo dispara, se mueve y se dibuja cada uno.
// Las cifras de cada arma están en datos-facciones.js (ARMAS con «tipo»). Las armas de Animales Locos tienen su código propio en armas.js.
//   Disparan cada cierto tiempo: bala, nova, bomba, golpe, rayo, onda, charco, corre.   Siempre activas: aura, orbita, escudo.
'use strict';

const CONTINUAS = new Set(['aura', 'orbita', 'escudo']);
// lo que añade armas-tipos-2.js (los tipos de las armas iniciales de los líderes): cada uno se engancha aquí
const CONT_EXTRA = {}, MOVER_EXTRA = {}, DIBUJA_PROY = {}, DIBUJA_EFECTO = {}, SUELO_EXTRA = [], PIE_EXTRA = [], TICK_EXTRA = [];
const SONIDO_TIPO = { bala: 'gun', nova: 'pop', bomba: 'missile', golpe: 'blink', rayo: 'zap', onda: 'slam', charco: 'trash', corre: 'deploy' };

/* ---------- efectos que dejan algunas armas: frenar y aturdir (los jefes y los gigantes aguantan más) ---------- */
function estadoArma(e, v) {
  if (v.lento > 0) e.lentoT = Math.max(e.lentoT || 0, e.jefe ? v.lento * 0.5 : v.lento);
  if (v.aturde > 0 && !e.jefe && !e.elite) e.congT = Math.max(e.congT || 0, v.aturde);
}
const empujeA = (e, x, y) => { const dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };

/* ---------- los que disparan cada cierto tiempo (devuelven false si no había a quién) ---------- */
const TIPOS = {
  // al más cercano (o a los más cercanos si salen varios); puede atravesar y rebotar
  bala(v, A) {
    const j = P.jug, ya = new Set(); let algo = false;
    for (let i = 0; i < v.n; i++) {
      const e = masCercano(j.x, j.y - 20, 520, ya) || masCercano(j.x, j.y - 20, 520); if (!e) break;
      ya.add(e); algo = true;
      const a = Math.atan2(e.y - 14 - (j.y - 30), e.x - j.x) + (i - (v.n - 1) / 2) * 0.09;
      P.proy.push(proyectilGen('bala', A, v, j.x, j.y - 30, Math.cos(a) * v.vel, Math.sin(a) * v.vel, v.dur, v.atraviesa));
    }
    return algo;
  },
  // en todas direcciones, atravesando a todos
  nova(v, A) {
    const j = P.jug, a0 = Math.random() * Math.PI * 2;
    if (!P.enemigos.length) return false;
    for (let i = 0; i < v.n; i++) { const a = a0 + (i / v.n) * Math.PI * 2; P.proy.push(proyectilGen('bala', A, v, j.x, j.y - 14, Math.cos(a) * v.vel, Math.sin(a) * v.vel * 0.85, v.dur, 999)); }
    return true;
  },
  // cae en parábola sobre los enemigos y explota
  bomba(v, A) {
    const j = P.jug, cand = P.enemigos.filter(e => !e.muerto && Math.hypot(e.x - j.x, e.y - j.y) < v.alc);
    if (!cand.length) return false;
    for (let i = 0; i < v.n; i++) { const e = pick(cand); P.proy.push({ gen: 'bomba', x0: j.x, y0: j.y - 34, tx: e.x + rand(-12, 12), ty: e.y + rand(-12, 12), k: 0, dur: 0.6, t: 1, x: j.x, y: j.y, z: 0, A, v }); }
    return true;
  },
  // aparece junto a los enemigos con más vida y les pega
  golpe(v, A) {
    const j = P.jug, L = P.enemigos.filter(e => !e.muerto && Math.hypot(e.x - j.x, e.y - j.y) < v.alc).sort((a, b) => b.vida - a.vida).slice(0, v.n);
    if (!L.length) return false;
    for (const e of L) {
      P.efectos.push({ gen: 'golpe', x: e.x, y: e.y - 10, emo: A.emo, col: A.col, t: 0.45, max: 0.45 });
      const [nx, ny] = empujeA(e, j.x, j.y); herir(e, v.dano, nx, ny, 160, true); estadoArma(e, v);
    }
    for (const e of L) golpeCajas(e.x, e.y, 20, v.dano);
    return true;
  },
  // un rayo que salta de un enemigo a otros cercanos
  rayo(v, A) {
    const j = P.jug, ya = new Set(); let algo = false;
    for (let i = 0; i < v.n; i++) {
      let e = masCercano(j.x, j.y - 20, v.alc, ya); if (!e) break; algo = true;
      const pts = [{ x: j.x, y: j.y - 34 }];
      for (let s = 0; s <= v.cadena && e; s++) {
        ya.add(e); pts.push({ x: e.x, y: e.y - 18 });
        const [nx, ny] = empujeA(e, j.x, j.y); herir(e, v.dano * (s ? 0.8 : 1), nx, ny, 60); estadoArma(e, v);
        e = masCercano(e.x, e.y, 150, ya);
      }
      for (const q of pts.slice(1)) golpeCajas(q.x, q.y + 18, 14, v.dano);
      P.efectos.push({ gen: 'rayo', pts, col: A.col, t: 0.22, max: 0.22 });
    }
    return algo;
  },
  // un golpe alrededor del jugador
  onda(v, A) {
    const j = P.jug; let n = 0; cerca(j.x, j.y, v.r, () => n++); if (!n) return false;
    cerca(j.x, j.y, v.r, e => { const [nx, ny] = empujeA(e, j.x, j.y); herir(e, v.dano, nx, ny, v.emp); estadoArma(e, v); });
    golpeCajas(j.x, j.y, v.r, v.dano);
    P.efectos.push({ gen: 'anillo', x: j.x, y: j.y, r: v.r, emo: A.emo, col: A.col, t: 0.5, max: 0.5 });
    P.sacudida = Math.max(P.sacudida, 3);
    return true;
  },
  // deja una zona en el suelo que daña cada poco rato
  charco(v, A) {
    const j = P.jug, cand = P.enemigos.filter(e => !e.muerto && Math.hypot(e.x - j.x, e.y - j.y) < v.alc);
    if (!cand.length) return false;
    for (let i = 0; i < v.n; i++) { const e = pick(cand); P.zonas.push({ x: e.x + rand(-14, 14), y: e.y + rand(-14, 14), r: v.r, dano: v.dano, tick: v.tick, tt: 0, t: v.dura, max: v.dura, col: A.col, emo: A.emo, lento: v.lento, aturde: 0 }); }
    return true;
  },
  // una carta corre hacia el grupo de enemigos más gordo y revienta
  corre(v, A) {
    const j = P.jug, cand = P.enemigos.filter(e => !e.muerto && Math.hypot(e.x - j.x, e.y - j.y) < 380);
    if (!cand.length) return false;
    for (let i = 0; i < v.n; i++) {
      let mejor = null, mn = -1;
      for (let s = 0; s < 8; s++) { const e = pick(cand); let n = 0; cerca(e.x, e.y, v.r, () => n++); if (n > mn) { mn = n; mejor = e; } }
      P.proy.push({ gen: 'corre', spr: v.spr || A.carta, x: j.x + rand(-10, 10), y: j.y, obj: mejor, tx: mejor.x, ty: mejor.y, vel: v.vel, t: 2.6, walk: 0, face: 1, A, v });
    }
    return true;
  },
};
function registraTipos() {
  for (const k in ARMAS) {
    const t = ARMAS[k].tipo;
    if (t && TIPOS[t]) DISPARO[k] = v => { const r = TIPOS[t](v, ARMAS[k]); if (r !== false && SONIDO_TIPO[t]) play(SONIDO_TIPO[t]); return r; };
  }
}
registraTipos();

function proyectilGen(gen, A, v, x, y, vx, vy, t, quedan) {
  return { gen, x, y, vx, vy, t, dano: v.dano, quedan, golpeados: new Set(), emo: A.emo, col: A.col, tam: v.tam || 18, giro: Math.random() * 6, gira: v.gira !== 0, rebota: v.rebota || 0, lento: v.lento || 0, aturde: v.aturde || 0 };
}

/* ---------- los que están siempre activos ---------- */
function armasContinuas(dt) {
  const j = P.jug;
  for (const k in P.armas) {
    const A = ARMAS[k]; if (!A.tipo || !CONTINUAS.has(A.tipo)) continue;
    const v = vArma(k); P.cd[k] = (P.cd[k] || 0) - dt;
    if (A.tipo === 'aura') {
      if (v.cura) curarSuave(v.cura * dt);
      if (P.cd[k] <= 0) { P.cd[k] = v.tick; cerca(j.x, j.y - 10, v.r, e => { herir(e, v.dano, 0, 0, 0); estadoArma(e, v); }); golpeCajas(j.x, j.y - 10, v.r, v.dano); }
    } else if (A.tipo === 'orbita') {
      const T = P.t;
      for (let i = 0; i < v.n; i++) {
        const a = T * v.giro + (i / v.n) * Math.PI * 2, x = j.x + Math.cos(a) * v.r, y = j.y - 10 + Math.sin(a) * v.r * 0.8;
        if (T - (P['o_' + k + i] || -9) >= v.tick) { P['o_' + k + i] = T; golpeCajas(x, y, 18, v.dano); }
        cerca(x, y, 18, e => {
          if (T - (e['o_' + k] || -9) < v.tick) return; e['o_' + k] = T;
          const [nx, ny] = empujeA(e, j.x, j.y); herir(e, v.dano, nx, ny, 220); estadoArma(e, v);
        });
      }
    } else if (CONT_EXTRA[A.tipo]) {
      CONT_EXTRA[A.tipo](k, A, v, dt);
    } else if (A.tipo === 'escudo') {
      // se recarga de uno en uno hasta los golpes que aguanta
      const T = v.cd * multRecarga();
      if (P.escudoN >= v.n) P.cd[k] = T; else if (P.cd[k] <= 0) { P.escudoN++; P.cd[k] = T; play('shield'); }
    }
  }
  // los charcos
  for (const z of P.zonas) {
    z.t -= dt; z.tt -= dt;
    if (z.tt <= 0) { z.tt = z.tick; cerca(z.x, z.y, z.r, e => { herir(e, z.dano, 0, 0, 0); estadoArma(e, z); }); golpeCajas(z.x, z.y, z.r, z.dano); }
  }
  P.zonas = P.zonas.filter(z => z.t > 0);
  for (const f of TICK_EXTRA) f(dt);
}
// el escudo se come el golpe (lo llama danarJugador)
function absorbeEscudo() {
  if (!(P.escudoN > 0)) return false;
  P.escudoN--; P.jug.invulT = 0.5; P.jug.golpeT = 0.15; numero(P.jug.x, P.jug.y - 70, '¡BLOQUEADO!', '#9fd3ff'); play('clank');
  P.efectos.push({ gen: 'anillo', x: P.jug.x, y: P.jug.y, r: 40, emo: null, col: '#9fd3ff', t: 0.35, max: 0.35 });
  return true;
}

/* ---------- cómo se mueve lo que han disparado ---------- */
function moverGen(p, dt) {
  if (MOVER_EXTRA[p.gen]) return MOVER_EXTRA[p.gen](p, dt);
  if (p.gen === 'bala') {
    p.x += p.vx * dt; p.y += p.vy * dt; p.giro += dt * 12;
    let dio = false;
    cerca(p.x, p.y + 14, 8 + p.tam * 0.3, e => {
      if (p.quedan <= 0 || p.golpeados.has(e)) return;
      p.golpeados.add(e); p.quedan--; dio = true;
      const d = Math.hypot(p.vx, p.vy) || 1; herir(e, p.dano, p.vx / d, p.vy / d, 90); estadoArma(e, p);
    });
    if (p.quedan > 0) golpeCajas(p.x, p.y + 14, 10, p.dano);
    if (dio && p.quedan <= 0) {
      const s = p.rebota > 0 ? masCercano(p.x, p.y, 240, p.golpeados) : null;
      if (s) {   // rebota hacia otro enemigo
        p.rebota--; p.quedan = 1; p.t = Math.max(p.t, 0.7);
        const a = Math.atan2(s.y - 14 - p.y, s.x - p.x), vel = Math.hypot(p.vx, p.vy); p.vx = Math.cos(a) * vel; p.vy = Math.sin(a) * vel;
      } else p.t = 0;
    }
  } else if (p.gen === 'bomba') {
    p.k += dt / p.dur; const f = Math.min(1, p.k);
    p.x = lerp(p.x0, p.tx, f); p.y = lerp(p.y0, p.ty, f); p.z = Math.sin(f * Math.PI) * 110;
    if (f >= 1) {
      explotar(p.tx, p.ty, p.v.r, p.v.dano, p.A.col); play('boom'); p.t = -1;
      if (p.v.lento || p.v.aturde) cerca(p.tx, p.ty, p.v.r, e => estadoArma(e, p.v));
    }
  } else if (p.gen === 'corre') {
    if (p.obj && !p.obj.muerto) { p.tx = p.obj.x; p.ty = p.obj.y; }
    const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy) || 1;
    p.x += (dx / d) * p.vel * dt; p.y += (dy / d) * p.vel * dt; p.walk += dt * 16; if (Math.abs(dx) > 2) p.face = dx > 0 ? 1 : -1;
    if (d < 14 || p.t <= 0) {
      explotar(p.x, p.y, p.v.r, p.v.dano, p.A.col); play('boom'); p.t = 0;
      if (p.v.lento || p.v.aturde) cerca(p.x, p.y, p.v.r, e => estadoArma(e, p.v));
    }
  }
}

/* ---------- dibujo ---------- */
function emoji(c, e, x, y, tam, ang = 0, espejo = 1) {
  c.save(); c.translate(x, y); if (ang) c.rotate(ang); if (espejo < 0) c.scale(-1, 1);
  c.font = tam + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, 0, 0); c.restore();
}
function puntoBrillo(c, x, y, col, r = 5) {
  c.globalAlpha = 0.35; c.fillStyle = col; c.beginPath(); c.arc(x, y, r * 1.8, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r * 0.45, 0, Math.PI * 2); c.fill();
}
function proyectilGenDibuja(p) {
  const c = ctx;
  if (DIBUJA_PROY[p.gen]) return DIBUJA_PROY[p.gen](p);
  if (p.gen === 'bala') {
    if (!p.emo) { puntoBrillo(c, p.x, p.y, p.col); return; }
    emoji(c, p.emo, p.x, p.y, p.tam, p.gira ? p.giro : 0, p.gira ? 1 : (p.vx < 0 ? 1 : -1));
  } else if (p.gen === 'bomba') {
    c.globalAlpha = 0.25; c.fillStyle = '#140a1e'; c.beginPath(); c.ellipse(p.x, p.y, 9, 3.5, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    if (p.A.emo) emoji(c, p.A.emo, p.x, p.y - p.z - 8, 22, p.k * 7); else puntoBrillo(c, p.x, p.y - p.z - 8, p.A.col, 7);
  } else if (p.gen === 'corre') personaje(p.spr, { x: p.x, y: p.y, esc: 0.7, face: p.face, walk: p.walk, andando: true });
}
function efectoGenDibuja(f) {
  const c = ctx, k = 1 - f.t / f.max;
  if (DIBUJA_EFECTO[f.gen]) return DIBUJA_EFECTO[f.gen](f, c, k);
  if (f.gen === 'anillo') {
    c.globalAlpha = (1 - k) * 0.85; c.strokeStyle = f.col; c.lineWidth = 6 * (1 - k) + 1;
    c.beginPath(); c.ellipse(f.x, f.y - 8, f.r * (0.3 + k * 0.75), f.r * (0.3 + k * 0.75) * 0.75, 0, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = (1 - k) * 0.18; c.fillStyle = f.col; c.fill(); c.globalAlpha = 1;
    if (f.emo) { c.globalAlpha = 1 - k; emoji(c, f.emo, f.x, f.y - 30 - k * 14, 26 + k * 10); c.globalAlpha = 1; }
  } else if (f.gen === 'golpe') {
    c.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
    c.strokeStyle = f.col; c.lineWidth = 4 * (1 - k) + 1; c.beginPath(); c.arc(f.x, f.y, 10 + k * 26, 0, Math.PI * 2); c.stroke();
    if (f.emo) emoji(c, f.emo, f.x, f.y - 8 - k * 10, 30 * (0.7 + 0.5 * Math.sin(Math.min(1, k * 1.6) * Math.PI)));
    c.globalAlpha = 1;
  } else if (f.gen === 'rayo') {
    c.globalAlpha = 1 - k; c.lineJoin = 'round';
    for (const [w, col] of [[7, f.col], [2.5, '#fff']]) {
      c.strokeStyle = col; c.lineWidth = w * (1 - k * 0.5); c.beginPath(); c.moveTo(f.pts[0].x, f.pts[0].y);
      for (let i = 1; i < f.pts.length; i++) {   // rayo en zigzag entre cada par de puntos
        const a = f.pts[i - 1], b = f.pts[i], m = { x: (a.x + b.x) / 2 + ((i * 37) % 17) - 8, y: (a.y + b.y) / 2 + ((i * 53) % 13) - 6 };
        c.lineTo(m.x, m.y); c.lineTo(b.x, b.y);
      }
      c.stroke();
    }
    c.globalAlpha = 1;
  }
}
// lo que va pegado al suelo: charcos y auras
function dibujaSueloArmas(c) {
  const j = P.jug;
  for (const f of SUELO_EXTRA) f(c);
  for (const z of P.zonas) {
    const a = Math.min(1, z.t / 0.6);
    c.globalAlpha = 0.28 * a; c.fillStyle = z.col; c.beginPath(); c.ellipse(z.x, z.y, z.r, z.r * 0.75, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.6 * a; c.strokeStyle = z.col; c.lineWidth = 2; c.setLineDash([5, 5]); c.lineDashOffset = -P.t * 12; c.stroke(); c.setLineDash([]);
    if (z.emo) { c.globalAlpha = 0.8 * a; emoji(c, z.emo, z.x, z.y - 4 + Math.sin(P.t * 4 + z.x) * 2, 18); }
    c.globalAlpha = 1;
  }
  for (const k in P.armas) {
    const A = ARMAS[k]; if (A.tipo !== 'aura') continue;
    const r = vArma(k).r, pul = 1 + Math.sin(P.t * 4) * 0.03;
    c.globalAlpha = 0.16; c.fillStyle = A.col; c.beginPath(); c.ellipse(j.x, j.y - 10, r * pul, r * pul * 0.85, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.55; c.strokeStyle = A.col; c.lineWidth = 2; c.setLineDash([6, 6]); c.lineDashOffset = -P.t * 20; c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
  }
}
// lo que va de pie y se ordena con los demás: los que corren, lo que gira alrededor y el escudo
function armasPie(L) {
  const j = P.jug;
  for (const f of PIE_EXTRA) f(L);
  for (const p of P.proy) if (p.gen === 'corre') L.push({ y: p.y, f: () => proyectilGenDibuja(p) });
  for (const k in P.armas) {
    const A = ARMAS[k];
    if (A.tipo === 'orbita') {
      const v = vArma(k);
      for (let i = 0; i < v.n; i++) { const a = P.t * v.giro + (i / v.n) * Math.PI * 2, x = j.x + Math.cos(a) * v.r, y = j.y - 10 + Math.sin(a) * v.r * 0.8; L.push({ y, f: () => emoji(ctx, A.emo, x, y - 6, 26, a + Math.PI / 2) }); }
    } else if (A.tipo === 'escudo' && P.escudoN > 0) {
      L.push({ y: j.y + 1, f: () => {
        const c = ctx, pul = 1 + Math.sin(P.t * 5) * 0.04;
        for (let i = 0; i < P.escudoN; i++) {
          c.globalAlpha = 0.22; c.fillStyle = A.col; c.beginPath(); c.ellipse(j.x, j.y - 30, (30 + i * 5) * pul, (38 + i * 5) * pul, 0, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 0.7; c.strokeStyle = A.col; c.lineWidth = 2.5; c.stroke();
        }
        c.globalAlpha = 1;
      } });
    }
  }
}
