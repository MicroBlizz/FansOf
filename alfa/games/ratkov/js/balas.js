// Fans of Ratkov · BALAS, GRANADAS Y EFECTOS: cada bala es un trazo que avanza, se para en lo sólido (o rebota, con la anomalía de la
// física rota) y daña a quien toca. Las zanahorias bomba botan y explotan. Los efectos son cubitos que saltan (chispas, nieve,
// trocitos bugueados) y se apagan solos. Los disparos hacen ruido: los enemigos que lo oyen vienen a mirar (oyeRuido en js/enemigos.js).
'use strict';
const BALAS = [], GRANADAS = [], PARTICULAS = [];
let POOL_BALAS = [], POOL_PART = [];
function preparaBalas() {
  const geo = new THREE.BoxGeometry(0.09, 0.09, 0.7), geoP = new THREE.BoxGeometry(0.14, 0.14, 0.14);
  for (let i = 0; i < 180; i++) { const m = new THREE.Mesh(geo, matBasico(0xffd27a)); m.visible = false; MOTOR.escena.add(m); POOL_BALAS.push(m); }
  for (let i = 0; i < 260; i++) { const m = new THREE.Mesh(geoP, matBasico(0xffffff)); m.visible = false; MOTOR.escena.add(m); POOL_PART.push(m); }
}
function limpiaBalas() {
  for (const b of BALAS) b.m.visible = false; BALAS.length = 0;
  for (const g of GRANADAS) MOTOR.escena.remove(g.m); GRANADAS.length = 0;
  for (const p of PARTICULAS) p.m.visible = false; PARTICULAS.length = 0;
}
// dispara una bala. o: { x, z, a (ángulo), dano, vel, alc, quien ('j' o 'e'), dueno, anom, gorda }
function bala(o) {
  const m = POOL_BALAS.find(p => !p.visible); if (!m) return;
  const b = Object.assign({ y: 1.25, rebotes: o.anom === 'rebote' ? 2 : 0, r: o.anom === 'hitbox' ? 0.45 : 0.12, tocados: new Set() }, o);
  b.vx = Math.sin(o.a) * o.vel; b.vz = Math.cos(o.a) * o.vel; b.vida = o.alc; b.m = m;
  m.material = matBasico(o.quien === 'j' ? (o.anom ? 0xd08aff : 0xffd27a) : 0xffe8e8);
  m.scale.setScalar(o.anom === 'hitbox' ? 3 : 1);
  m.position.set(b.x, b.y, b.z); m.rotation.y = o.a; m.visible = true;
  BALAS.push(b);
}
function avanzaBalas(dt) {
  for (let i = BALAS.length - 1; i >= 0; i--) {
    const b = BALAS[i];
    let paso = Math.hypot(b.vx, b.vz) * dt, x1 = b.x + b.vx * dt, z1 = b.z + b.vz * dt, fin = false;
    if (paso > b.vida) { const k = b.vida / paso; x1 = b.x + b.vx * dt * k; z1 = b.z + b.vz * dt * k; paso = b.vida; fin = true; }
    // ¿toca a alguien por el camino?
    const blancos = b.quien === 'j' ? ENEMIGOS.filter(e => e.vivo) : (JUG && JUG.vivo ? [JUG] : []);
    let tocado = null, tMin = 2;
    for (const e of blancos) {
      if (b.tocados.has(e)) continue;
      const t = tocaSegmento(b.x, b.z, x1, z1, e.x, e.z, e.radio + b.r); if (t != null && t < tMin) { tMin = t; tocado = e; }
    }
    const pared = corta(b.x, b.z, x1, z1, true);
    if (pared && pared.t < tMin) {
      const px = b.x + (x1 - b.x) * pared.t, pz = b.z + (z1 - b.z) * pared.t;
      if (b.rebotes > 0) {
        b.rebotes--; if (pared.nx) b.vx = -b.vx; if (pared.nz) b.vz = -b.vz; if (!pared.nx && !pared.nz) { b.vx = -b.vx; b.vz = -b.vz; }
        b.x = px + Math.sign(b.vx) * 0.05; b.z = pz + Math.sign(b.vz) * 0.05; b.vida -= paso * pared.t; b.m.rotation.y = Math.atan2(b.vx, b.vz);
        chispas(px, b.y, pz, 0xd08aff, 4); play('metal'); continue;
      }
      chispas(px, b.y, pz, pared.s.tipo === 'edificio' || pared.s.tipo === 'muro' ? 0xc8c0b0 : 0xffd27a, 4); play('impacto');
      quitaBala(i); continue;
    }
    if (tocado) {
      const px = b.x + (x1 - b.x) * tMin, pz = b.z + (z1 - b.z) * tMin;
      if (b.quien === 'j') golpeaEnemigo(tocado, b.dano, b); else golpeaJugador(b.dano, b);
      b.tocados.add(tocado);
      if (b.anom !== 'desync') { quitaBala(i); continue; }
      b.x = px; b.z = pz; b.vida -= paso * tMin; continue;
    }
    b.x = x1; b.z = z1; b.vida -= paso; b.m.position.set(b.x, b.y, b.z);
    if (fin || b.vida <= 0) quitaBala(i);
  }
}
function quitaBala(i) { BALAS[i].m.visible = false; BALAS.splice(i, 1); }
// ¿el segmento (a → b) pasa a menos de r del punto (cx, cz)? Devuelve dónde (0 a 1) o null
function tocaSegmento(ax, az, bx, bz, cx, cz, r) {
  const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9;
  let t = ((cx - ax) * dx + (cz - az) * dz) / L; t = Math.max(0, Math.min(1, t));
  const px = ax + dx * t, pz = az + dz * t;
  return (px - cx) ** 2 + (pz - cz) ** 2 <= r * r ? t : null;
}

/* ---------- zanahorias bomba ---------- */
function lanzaGranada(x, z, a, fuerza, quien) {
  const o = new Obra(); o.cono(0.16, 0.6, 6, 0xff7a1a, 0, 0, 0, Math.PI / 2); o.caja(0.06, 0.24, 0.06, 0x52b846, 0, 0.08, -0.34);
  const m = o.hecha(); MOTOR.escena.add(m);
  GRANADAS.push({ x, z, y: 1.2, vx: Math.sin(a) * fuerza, vz: Math.cos(a) * fuerza, vy: 4, t: 2.0, m, quien });
  play('lanza');
}
function avanzaGranadas(dt) {
  for (let i = GRANADAS.length - 1; i >= 0; i--) {
    const g = GRANADAS[i];
    g.vy -= 14 * dt; g.y += g.vy * dt; if (g.y < 0.2) { g.y = 0.2; g.vy = Math.abs(g.vy) * 0.35; g.vx *= 0.6; g.vz *= 0.6; }
    const nx = g.x + g.vx * dt, nz = g.z + g.vz * dt;
    if (choca(nx, g.z, 0.2)) g.vx = -g.vx * 0.5; else g.x = nx;
    if (choca(g.x, nz, 0.2)) g.vz = -g.vz * 0.5; else g.z = nz;
    g.m.position.set(g.x, g.y, g.z); g.m.rotation.y += dt * 8; g.m.rotation.x += dt * 5;
    g.t -= dt; if (g.t <= 0) { explosion(g.x, g.z, 4.6, 95, g.quien); MOTOR.escena.remove(g.m); g.m.traverse(m => { if (m.isMesh) m.geometry.dispose(); }); GRANADAS.splice(i, 1); }
  }
}
function explosion(x, z, radio, dano, quien) {
  play('explota'); destello(x, 1.5, z, 0xffa040, 6, 0.5, 12); temblor(0.5);
  for (let k = 0; k < 26; k++) particula(x, 0.6, z, k % 3 ? 0xff9a3a : 0x5a5a60, entre(-6, 6), entre(4, 10), entre(-6, 6), entre(0.4, 0.9));
  for (let k = 0; k < 14; k++) particula(x, 0.3, z, 0xe8eef4, entre(-5, 5), entre(2, 6), entre(-5, 5), 0.8);
  const efecto = (e, d) => { const f = Math.max(0, 1 - d / radio); return f > 0 && seVe(x, z, e.x, e.z) ? dano * (0.35 + 0.65 * f) : 0; };
  for (const e of ENEMIGOS) if (e.vivo) { const d = lejos(x, z, e.x, e.z); if (d < radio) golpeaEnemigo(e, efecto(e, d), { quien, x, z, explosion: true }); }
  if (JUG && JUG.vivo) { const d = lejos(x, z, JUG.x, JUG.z); if (d < radio) golpeaJugador(efecto(JUG, d), { x, z, explosion: true }); }
  oyeRuido(x, z, 34);
}

/* ---------- cubitos que saltan ---------- */
function particula(x, y, z, color, vx, vy, vz, vida = 0.5, gravedad = 18) {
  const m = POOL_PART.find(p => !p.visible); if (!m) return;
  m.material = matBasico(color); m.position.set(x, y, z); m.visible = true; m.scale.setScalar(1);
  PARTICULAS.push({ m, vx, vy, vz, vida, max: vida, g: gravedad });
}
function chispas(x, y, z, color, n) { for (let k = 0; k < n; k++) particula(x, y, z, color, entre(-3, 3), entre(1, 5), entre(-3, 3), entre(0.15, 0.35)); }
function avanzaParticulas(dt) {
  for (let i = PARTICULAS.length - 1; i >= 0; i--) {
    const p = PARTICULAS[i]; p.vida -= dt;
    if (p.vida <= 0) { p.m.visible = false; PARTICULAS.splice(i, 1); continue; }
    p.vy -= p.g * dt; p.m.position.x += p.vx * dt; p.m.position.y = Math.max(0.05, p.m.position.y + p.vy * dt); p.m.position.z += p.vz * dt;
    p.m.scale.setScalar(Math.max(0.2, p.vida / p.max));
  }
}
// la pantalla tiembla un poco (explosiones, golpes fuertes)
let TEMBLOR = 0;
function temblor(f) { TEMBLOR = Math.max(TEMBLOR, f); }
