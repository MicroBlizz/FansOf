// Fans of Jump · La VIDA DEL RÍO y los troncos con truco:
// · patitos: familias (mamá y dos patitos) que nadan de orilla a orilla, con su estela
// · ranas: sentadas en un nenúfar junto a la orilla; cuando CrazyBunny se acerca, saltan al agua (¡croac!)
// · peces: de vez en cuando uno salta haciendo un arco
// · la TORTUGA gigante (desde 250 m): su caparazón hace de tronco, pero cada pocos segundos se sumerge; burbujas y temblor
//   avisan antes. Si sigues encima, ¡glub!, al agua
// · el tronco PEONZA (desde 120 m): gira; si no caes en el centro, das vueltas con él (y apuntar cuesta más)
// La obra de Microblizz (conos, vallas y carteles en las orillas) sale en pintaRio (rio.js).
'use strict';

const TORTUGA_CICLO = 5.8;   // segundos: 3,2 arriba, 0,9 avisando, 1,3 abajo y 0,4 subiendo
const PEONZA_VEL = 2.4;      // vueltas de la peonza (radianes por segundo)
const FAUNA = { ranas: new Map(), peces: [], proxPez: 3 };
function reiniciaFauna() { VIENEN.length = 0; FAUNA.ranas.clear(); FAUNA.peces = []; FAUNA.proxPez = 3; LUCES.length = 0; JUEGO.paisaje = 0; }

/* ---------- los troncos con truco ---------- */
function bajoTortuga(c) {
  if (c < 3.2) return 0;
  if (c < 4.1) return (c - 3.2) / 0.9 * 0.3;
  if (c < 5.4) return Math.min(1, 0.3 + (c - 4.1) * 3);
  return 1 - (c - 5.4) / 0.4;
}
function avanzaEspeciales(dt) {
  const J = JUEGO, c = J.conejo;
  for (const t of RIO.troncos) {
    if (t.tipo === 'tortuga') {
      t.ciclo = (t.ciclo + dt) % TORTUGA_CICLO; t.bajo = bajoTortuga(t.ciclo);
      if (t.ciclo > 3.2 && t.ciclo < 4.2 && Math.random() < dt * 14) FX.push({ t: 'burbuja', x: t.x + azar(-t.r, t.r) * 0.7, wy: t.wy + azar(-4, 4), v: 0.7, v0: 0.7 });
      if (c.tronco === t && t.bajo > 0.6 && J.modo === 'juego') {
        c.tronco = null; aviso(tr('¡Glub!'), c.x, c.wy + 26, '#9fe3ff', 11); onda(t.x, t.wy, t.r); alAgua('tortuga');
      }
    } else if (t.tipo === 'peonza') {
      t.giro += PEONZA_VEL * dt;
      if (c.tronco === t && !c.salto) {
        // das vueltas con ella (en el centro, casi nada)
        const a = PEONZA_VEL * dt, u = c.owy / APLASTA, ox = c.ox * Math.cos(a) - u * Math.sin(a), ou = c.ox * Math.sin(a) + u * Math.cos(a);
        c.ox = ox; c.owy = ou * APLASTA;
      }
    }
  }
}
// ¿se puede caer en él ahora? (la tortuga sumergida, no)
const troncoPisable = t => !(t.tipo === 'tortuga' && t.bajo > 0.55);
// a qué tronco volver cuando te sacan del agua (casco, MeerCat, Lola en el tutorial o la segunda oportunidad): el último que
// pisaste si sigue ahí y se puede pisar, y si no, el más alto por debajo de ti que no esté hundido ni a punto de hundirse y
// quede por delante de la ola; si es una tortuga, sale a flote, y si está agrietado, se le cura la grieta. Así nunca pagas
// una oportunidad para morir en el mismo instante.
function troncoSeguro(c, margenOla = 20) {
  const vale = o => o.wy > OLA.wy + margenOla && !(o.tipo === 'tortuga' && (o.bajo > 0.2 || o.ciclo > 2.6)) && !o.final;
  let t = c.ultimo && RIO.troncos.includes(c.ultimo) && vale(c.ultimo) ? c.ultimo : null;
  if (!t) t = RIO.troncos.filter(o => o.wy <= c.wy + 10 && vale(o)).sort((a, b) => b.wy - a.wy)[0];
  if (!t) t = RIO.troncos.filter(o => o.wy > OLA.wy + margenOla && o.tipo !== 'tortuga').sort((a, b) => a.wy - b.wy)[0];
  if (!t) t = RIO.troncos[RIO.troncos.length - 1];
  if (t.tipo === 'tortuga') { t.ciclo = 0; t.bajo = 0; }
  if (t.tipo === 'hunde') t.pisa = 0;
  return t;
}
function alCaerEspecial(t) {
  const c = JUEGO.conejo;
  if (t.tipo === 'peonza' && Math.hypot(c.ox, c.owy / APLASTA) > t.r * 0.25) { aviso(tr('¡Wiii!'), c.x, c.wy + 34, '#c46aff', 10); SONIDO.boing(); }
}
function pintaEspecial(tr_, x, y) {
  if (tr_.tipo === 'peonza') { sprite('peonza' + (Math.floor(tr_.giro / (Math.PI / 8)) % 4), x, y, tr_.r); return true; }
  if (tr_.tipo !== 'tortuga') return false;
  // a flote se ve entera (la línea del agua, por debajo del caparazón); al hundirse, la línea sube y la tapa
  const b = tr_.bajo, tiembla = tr_.ciclo > 3.2 && tr_.ciclo < 4.1 ? Math.sin(tr_.fase * 60) * 0.8 : 0, linea = y + tr_.r * (0.32 + (1 - Math.min(1, b * 2)) * 0.4);
  if (b > 0.98) { elipse(x, linea - 2, tr_.r * 0.8, tr_.r * 0.3, null, 'rgba(255,255,255,0.55)', 0.8); return true; }   // abajo: solo su onda
  G.save(); G.beginPath(); G.rect(x - tr_.r * 2, y - tr_.r * 3, tr_.r * 4, linea - (y - tr_.r * 3)); G.clip();
  sprite('tortuga', x + tiembla, y + b * tr_.r * 0.7, tr_.r * 1.05, 0, 1, 1, 1 - b * 0.5);
  G.restore();
  if (b > 0.05) elipse(x, linea - 1, tr_.r * (0.9 - b * 0.2), tr_.r * 0.3, null, 'rgba(255,255,255,0.6)', 0.8);
  return true;
}

/* ---------- los animales del río (adorno) ---------- */
const BANDA_PATOS = 480, BANDA_RANAS = 330;
function avanzaFauna(dt) {
  const J = JUEGO, c = J.conejo, W = PAN.W, H = PAN.H;
  avanzaPaisaje(dt);
  avanzaEspeciales(dt);
  // las ranas saltan al agua cuando llega CrazyBunny
  for (let n = Math.floor(CAM.y / BANDA_RANAS) - 1; n <= Math.ceil((CAM.y + H) / BANDA_RANAS); n++) {
    const r = rana(n);
    if (!r) continue;
    const e = FAUNA.ranas.get(n) || { t: -1 };
    if (e.t < 0 && c && c.wy > r.wy - 80) { e.t = 0; SONIDO.croac(); }
    if (e.t >= 0 && e.t < 1) { e.t += dt / 0.55; if (e.t >= 1) { onda(r.x + r.dir * 24, r.wy + 4, 6); salpica(r.x + r.dir * 24, r.wy + 4, 5, 'rgba(255,255,255,0.9)'); } }
    FAUNA.ranas.set(n, e);
  }
  for (const k of FAUNA.ranas.keys()) if ((k + 2) * BANDA_RANAS < CAM.y) FAUNA.ranas.delete(k);
  // un pez salta de vez en cuando
  FAUNA.proxPez -= dt;
  if (FAUNA.proxPez <= 0 && J.modo !== 'menu') {
    FAUNA.proxPez = azar(2.5, 5.5);
    const wy = CAM.y + azar(H * 0.3, H * 0.8), [L, R] = orillas(wy), x = azar(L + 15, R - 15), dir = x < W / 2 ? 1 : -1;
    if (!RIO.troncos.some(t => Math.hypot(t.x - x, t.wy - wy) < t.r + 20)) { FAUNA.peces.push({ x, wy, dir, t: 0 }); onda(x, wy, 5); salpica(x, wy, 4, 'rgba(255,255,255,0.9)'); }
  }
  for (const p of FAUNA.peces) { p.t += dt / 0.9; if (p.t >= 1 && !p.chof) { p.chof = true; onda(p.x + p.dir * 30, p.wy, 5); salpica(p.x + p.dir * 30, p.wy, 4, 'rgba(255,255,255,0.9)'); } }
  FAUNA.peces = FAUNA.peces.filter(p => p.t < 1);
}
// la rana de cada tramo (o ninguna): siempre la misma, junto a una orilla
function rana(n) {
  if (n < 1 || hash(n, 910) > 0.45 || n * BANDA_RANAS > FINAL_WY - 200) return null;
  const wy = n * BANDA_RANAS + 120, [L, R] = orillas(wy), lado = hash(n, 911) < 0.5;
  return { wy, x: lado ? R - 12 : L + 12, dir: lado ? -1 : 1 };
}
// en el agua, debajo de los troncos: patitos, ranas y peces
function pintaFauna(t) {
  const W = PAN.W, H = PAN.H;
  for (let n = Math.floor(CAM.y / BANDA_PATOS) - 1; n <= Math.ceil((CAM.y + H) / BANDA_PATOS); n++) {
    if (n < 1 || hash(n, 900) > 0.55 || n * BANDA_PATOS > FINAL_WY - 300) continue;
    const wy = n * BANDA_PATOS + 200, [L, R] = orillas(wy), mitad = (R - L) / 2 - 22, cx = (L + R) / 2;
    const fase = t * 0.12 + n * 1.7, x = cx + Math.sin(fase) * mitad, dir = Math.cos(fase) >= 0 ? 1 : -1;
    [[0, 0, 5.2], [-10, 3, 3.6], [-18, 5, 3.6]].forEach(([dx, dwy, tam], i) => {
      const px = x + dx * dir, y = pantY(wy + dwy) + Math.sin(t * 3 + i) * 0.5;
      if (y < -10 || y > H + 10) return;
      elipse(px - dir * tam * 0.6, y + 1, tam * 0.9, tam * 0.3, 'rgba(255,255,255,0.35)', null);
      sprite('patito', px, y, tam, Math.sin(t * 3 + i) * 0.05, -dir, 1);
    });
  }
  for (let n = Math.floor(CAM.y / BANDA_RANAS) - 1; n <= Math.ceil((CAM.y + H) / BANDA_RANAS); n++) {
    const r = rana(n);
    if (!r) continue;
    const y = pantY(r.wy), e = FAUNA.ranas.get(n) || { t: -1 };
    sprite('nenufar_mini', r.x, y, 7);
    if (e.t < 0) sprite('rana', r.x, y - 1, 4.6, 0, 1, 1 + Math.sin(t * 4 + n) * 0.04);
    else if (e.t < 1) sprite('rana_salta', r.x + r.dir * 24 * e.t, y - 1 - Math.sin(Math.PI * e.t) * 12, 4.6, r.dir * 0.4);
  }
  for (const p of FAUNA.peces) {
    const k = p.t, x = p.x + p.dir * 30 * k, y = pantY(p.wy) - Math.sin(Math.PI * k) * 16;
    sprite('pez', x, y, 5, p.dir * (Math.PI / 2) * (1 - 2 * k) * 0.8 + (p.dir > 0 ? Math.PI / 2 : -Math.PI / 2) * 0.3, p.dir, 1);
  }
}
