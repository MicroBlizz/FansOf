// Fans of Jump · El río del bosque que Microblizz está arrasando: orillas con arena, piedras, juncos y flores, tocones de los
// árboles talados y huellas de las excavadoras; el agua se vuelve barro cerca de la ola. Los troncos cortados flotan y son donde
// se salta. El mundo se mide en «wy»: la altura desde la salida, hacia arriba. La cámara (CAM.y) es la wy del borde de abajo.
'use strict';

const CAM = { y: 0 };
const RIO = { troncos: [], ultimo: null, cuenta: 0, ultimoAmigo: -9, siguienteAmigo: 0 };
const COL_RIO = {
  hierba: '#a8d66b', hierbaO: '#93c45a', hierbaL: '#c2e48a', arena: '#f2dea8', arenaO: '#dcc088', piedra: '#cfc8bc',
  agua: '#7fd3cf', aguaO: '#68c2c2', aguaL: '#b4ece4', barro: '#9a6a40', barroO: '#7a4e2c',
  corteza: '#9a6038', madera: '#f4d29a', anillo: '#ddb072',
};
const pantY = wy => PAN.H - (wy - CAM.y);   // de la altura del mundo a la y de la pantalla
const azar = (a, b) => a + Math.random() * (b - a);
function hash(a, b) {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// las dos orillas a esa altura: el río serpentea un poco
function orillas(wy) {
  const W = PAN.W;
  const a = W * 0.14 + Math.sin(wy / 90) * 6 + Math.sin(wy / 31 + 1) * 2;
  const b = W * 0.14 + Math.sin(wy / 77 + 2) * 6 + Math.sin(wy / 27) * 2;
  return [a, W - b];
}

/* ---------- los troncos cortados (los «nenúfares») ---------- */
const APLASTA = 0.8;   // los troncos se ven un poco de lado: más anchos que altos
function dentroTronco(t, x, wy, margen = 0) {
  const dx = (x - t.x) / (t.r + margen), dy = (wy - t.wy) / ((t.r + margen) * APLASTA);
  return dx * dx + dy * dy;
}

function nuevoTronco(x, wy, r, dif) {
  const t = { x, wy, r, vx: 0, amigo: null, zanas: 0, pisado: false, id: RIO.cuenta++, fase: Math.random() * 6, hunde: 0 };
  if (Math.random() < 0.18 + dif * 0.3) t.vx = (Math.random() < 0.5 ? -1 : 1) * azar(6, 10 + dif * 10);
  RIO.troncos.push(t);
  return t;
}

// pone troncos hasta la altura «hasta»: cada fila queda al alcance de la anterior, a veces con otro al lado
function generaRio(hasta) {
  while (RIO.ultimo.wy < hasta) {
    const prev = RIO.ultimo, dif = Math.min(1, prev.wy / 6000);
    const wy = prev.wy + azar(50, 64) + dif * 10;
    const [L, R] = orillas(wy);
    const r = Math.round(azar(20, 25) - dif * 4);
    const lo = L + r + 3, hi = R - r - 3;
    let x = prev.x + azar(-60, 60);
    if (x < lo) x = lo + (lo - x) * 0.5;
    if (x > hi) x = hi - (x - hi) * 0.5;
    x = Math.max(lo, Math.min(hi, x));
    const t = nuevoTronco(x, wy, r, dif);
    RIO.ultimo = t;
    const fila = [t];
    if (Math.random() < 0.34 - dif * 0.14) {
      const r2 = Math.round(azar(18, 22) - dif * 3);
      const lado = x < (lo + hi) / 2 ? 1 : -1, x2 = x + lado * azar(r + r2 + 8, r + r2 + 26);
      if (x2 > L + r2 + 3 && x2 < R - r2 - 3) fila.push(nuevoTronco(x2, wy + azar(-8, 8), r2, dif));
    }
    // un amigo atrapado de vez en cuando (nunca dos filas seguidas), y si no, zanahorias
    const n = Math.floor(wy / 40);
    for (const f of fila) {
      if (n - RIO.ultimoAmigo >= 3 && Math.random() < 0.3) {
        const mios = AMIGOS.filter(a => tengoAmigo(a.id)); f.amigo = mios[RIO.siguienteAmigo % mios.length].id; RIO.siguienteAmigo++; RIO.ultimoAmigo = n; f.vx *= 0.5;
      } else if (Math.random() < 0.24) f.zanas = 1 + Math.floor(Math.random() * Math.random() * 3);
    }
  }
}

function avanzaRio(dt) {
  for (const t of RIO.troncos) {
    t.fase += dt; t.hunde = Math.max(0, t.hunde - dt * 4);
    if (!t.vx) continue;
    t.x += t.vx * dt;
    const [L, R] = orillas(t.wy);
    if (t.x < L + t.r + 1) { t.x = L + t.r + 1; t.vx = Math.abs(t.vx); }
    if (t.x > R - t.r - 1) { t.x = R - t.r - 1; t.vx = -Math.abs(t.vx); }
  }
  RIO.troncos = RIO.troncos.filter(t => t.wy > CAM.y - 60 || t === RIO.ultimo);
}

function reiniciaRio(xSalida) {
  RIO.troncos = []; RIO.cuenta = 0; RIO.ultimoAmigo = -9; RIO.siguienteAmigo = Math.floor(Math.random() * AMIGOS.length);
  const t = nuevoTronco(xSalida, 0, 27, 0); t.vx = 0; t.pisado = true;
  RIO.ultimo = t;
  generaRio(PAN.H + 200);
  return t;
}

/* ---------- las orillas ---------- */
function pintaRio(t) {
  const W = PAN.W, H = PAN.H, C = COL_RIO;
  G.fillStyle = C.hierba; G.fillRect(0, 0, W, H);
  // la hierba: manchas suaves más claras y más oscuras
  const paso = 22, k0 = Math.floor(CAM.y / paso) - 2, k1 = Math.ceil((CAM.y + H) / paso) + 3;
  for (let k = k0; k <= k1; k++) {
    const y = pantY(k * paso);
    for (let i = 0; i < 3; i++) {
      const h = hash(k, i + 10), x = h * W;
      elipse(x, y + i * 7, 6 + hash(k, i + 20) * 8, 2.5 + hash(k, i + 30) * 2, hash(k, i + 70) < 0.5 ? 'rgba(150,200,90,0.5)' : 'rgba(195,230,140,0.5)', null);
    }
  }
  // el río: la arena de la orilla, el agua, y el barro que sube desde la ola
  G.beginPath();
  for (let y = -4; y <= H + 4; y += 4) G.lineTo(orillas(CAM.y + H - y)[0] - 5, y);
  for (let y = H + 4; y >= -4; y -= 4) G.lineTo(orillas(CAM.y + H - y)[1] + 5, y);
  G.closePath(); G.fillStyle = C.arena; G.fill();
  G.beginPath();
  for (let y = -4; y <= H + 4; y += 4) G.lineTo(orillas(CAM.y + H - y)[0], y);
  for (let y = H + 4; y >= -4; y -= 4) G.lineTo(orillas(CAM.y + H - y)[1], y);
  G.closePath();
  G.save(); G.clip();
  G.fillStyle = C.agua; G.fillRect(0, 0, W, H);
  const lado = G.createLinearGradient(0, 0, W, 0);
  lado.addColorStop(0, 'rgba(190,240,232,0.95)'); lado.addColorStop(0.2, 'rgba(127,211,207,0)'); lado.addColorStop(0.8, 'rgba(127,211,207,0)'); lado.addColorStop(1, 'rgba(190,240,232,0.95)');
  G.fillStyle = lado; G.fillRect(0, 0, W, H);
  const yo = pantY(OLA.wy);
  if (yo < H + 160) {
    const turbio = G.createLinearGradient(0, yo - 150, 0, yo);
    turbio.addColorStop(0, 'rgba(154,106,64,0)'); turbio.addColorStop(0.6, 'rgba(154,106,64,0.5)'); turbio.addColorStop(1, 'rgba(122,78,44,0.85)');
    G.fillStyle = turbio; G.fillRect(0, yo - 150, W, H - yo + 150);
  }
  // reflejos de la corriente
  const baja = t * 6;
  for (let k = Math.floor((CAM.y + baja) / 16) - 1; k <= Math.ceil((CAM.y + baja + H) / 16) + 1; k++) {
    const wy = k * 16 - baja, [L, R] = orillas(wy), y = pantY(wy), x = L + 6 + hash(k, 3) * (R - L - 18), l = 4 + hash(k, 4) * 7;
    G.beginPath(); G.moveTo(x, y); G.quadraticCurveTo(x + l / 2, y - 1.4, x + l, y); G.lineWidth = 0.9; G.strokeStyle = 'rgba(255,255,255,0.5)'; G.lineCap = 'round'; G.stroke();
  }
  G.restore();
  // lo de las orillas, de lo más lejano (arriba) a lo más cercano: piedras y juncos pegados al agua; tocones, árboles,
  // arbustos y flores en la hierba (los dibujos 3D)
  const cosas = [];
  const k2 = Math.floor(CAM.y / 10) - 3, k3 = Math.ceil((CAM.y + H) / 10) + 4;
  for (let k = k2; k <= k3; k++) for (const s of [0, 1]) {
    const wy = k * 10, [L, R] = orillas(wy), h = hash(k, s + 200);
    if (h < 0.3) cosas.push(['roca0', s ? R + 3 + h * 6 : L - 3 - h * 6, wy, 3.2 + hash(k, s + 210) * 2.4]);
    else if (h < 0.5) cosas.push(['juncos0', s ? R + 1 : L - 1, wy, 6 + hash(k, s + 220) * 3]);
  }
  for (let k = k0; k <= k1; k++) for (const s of [0, 1]) {
    const h = hash(k, s + 100), wy = k * paso + hash(k, s + 110) * 14, [L, R] = orillas(wy);
    const sitio = s ? W - R : L, x = s ? R + 10 + hash(k, 120 + s) * Math.max(1, sitio - 14) : L - 10 - hash(k, 120 + s) * Math.max(1, sitio - 14);
    if (h < 0.18) cosas.push([hash(k, s + 130) < 0.5 ? 'tocon0' : 'tocon1', x, wy, 6.5 + hash(k, s + 140) * 2]);
    else if (h < 0.27) cosas.push(['arbol0', s ? W - 4 - hash(k, 150) * 6 : 4 + hash(k, 151) * 6, wy, 9 + hash(k, s + 160) * 2]);
    else if (h < 0.37) cosas.push(['arbusto0', x, wy, 7 + hash(k, s + 170) * 2]);
    else if (h < 0.62) cosas.push([hash(k, s + 180) < 0.5 ? 'flor0' : 'flor1', x, wy, 7]);
  }
  cosas.sort((a, b) => b[2] - a[2]);
  for (const [n, x, wy, tam] of cosas) { const y = pantY(wy); if (y > -40 && y < H + 50) sprite(n, x, y, tam); }
}

/* ---------- los troncos y lo que llevan ---------- */
function pintaTronco(tr, y, conejo) {
  const baja = (conejo ? 1.2 : 0) + tr.hunde * 1.6;
  y += baja + Math.sin(tr.fase * 2) * 0.5;
  elipse(tr.x + 2, y + tr.r * 0.32, tr.r * 1.08, tr.r * 0.6, 'rgba(40,110,120,0.28)', null);
  sprite('tronco' + (tr.id % 3), tr.x, y, tr.r);
  return y;
}
function pintaTroncos(t, bajoConejo) {
  for (const tr of RIO.troncos) {
    const y0 = pantY(tr.wy);
    if (y0 < -50 || y0 > PAN.H + 40) continue;
    const y = pintaTronco(tr, y0, tr === bajoConejo);
    for (let i = 0; i < tr.zanas; i++) sprite('zanahoria', tr.x - (tr.zanas - 1) * 4.5 + i * 9, y + 1 - (i % 2), 8);
    if (tr.amigo) {
      // atrapado en un charco de barro, temblando, con su cartelito de SOS clavado en el tronco
      blanda([tr.x - 11, y + 1, tr.x - 4, y - 4, tr.x + 7, y - 3.5, tr.x + 12, y + 2, tr.x + 4, y + 6, tr.x - 7, y + 5.5], COL_RIO.barro, COL_RIO.barroO, 0.8);
      const f = Math.floor(t * 5 + tr.id) % 2;
      sprite(tr.amigo + '_susto' + f, tr.x + Math.sin(t * 40 + tr.id) * 0.3, y + 2, 12);
      elipse(tr.x - 8, y + 4, 1.6, 1, COL_RIO.barroO, null); elipse(tr.x + 9, y + 4.4, 1.3, 0.9, COL_RIO.barroO, null);
      aqui(tr.x + 11, y - 1, Math.sin(t * 4 + tr.id) * 0.12, 1, 1, () => {
        trazo(0, 0, 0, -20, 1.2, '#a06a3a');
        caja(-9, -29, 18, 11, 2, PASTEL.melocoton, OLC, 0.8);
        letras('SOS', 0, -23.2, 7.5, '#ffffff', { logo: true, borde: PASTEL.melocotonO, bw: 1.8 });
      });
    }
  }
}
