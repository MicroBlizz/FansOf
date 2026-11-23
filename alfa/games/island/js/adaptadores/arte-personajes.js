// Fans of Island · adaptadores/arte-personajes: ARTE DE LOS PERSONAJES en lonchas por código: Brotito, el pez gordito que escupe,
// la gota, la zanahoria y la bandera (CrazyBunny viene de Yoshi: arte-crazybunny.js). Cada uno es una función (z, x, y) → color; las pilas se fabrican en TAREAS al cargar.
'use strict';
{
const { TAREAS, ruido } = IS;
const { dentro, mezcla, dist2Seg, pila } = IS.Lonchas;
// ================= Brotito (enemigo): bola turquesa con cuernitos coral y un brote =================
const BROTO = (() => {
  const W = 40, D = 40, H = 38, cx = 19.5, cy = 19.5, SUELO_CUERPO = 4;
  const P = { cuerpoClaro: '#7fe6d4', cuerpo: '#35b3a3', cuerpoOscuro: '#1f7a74', tripa: '#fff1cf', tripaOscura: '#e8cf9c',
    ojo: '#1b1626', brillo: '#ffffff', boca: '#5a2233', cuerno: '#ff8f6b', cuernoPunta: '#c9503a',
    hoja: '#8fdc4a', hojaOscura: '#4f9e2a', tallo: '#5aa832', pie: '#245c7a', pieClaro: '#3a7fa3' };
  const tono = (dz, claro, medio, oscuro) => dz > 5 ? claro : (dz < -5 ? oscuro : medio);
  const POSTURAS = {
    reposo:   { sx: 1.00, sz: 1.00, a: 0.0 }, agachado: { sx: 1.12, sz: 0.82, a: 0.0 }, despegue: { sx: 0.92, sz: 1.12, a: 0.6 },
    arriba:   { sx: 1.00, sz: 1.04, a: 1.0 }, cayendo:  { sx: 0.97, sz: 1.06, a: 0.5 }, aterriza: { sx: 1.15, sz: 0.80, a: 0.1 },
  };
  function cuernos(pose, zc) {
    return (z, x, y) => {
      const base = zc + 8 * pose.sz, alto = 7;
      if (z < base || z > base + alto) return null;
      const r = 3.2 * (1 - (z - base) / alto) + 0.8;
      for (const lado of [-1, 1]) {
        const dx = x - (cx + lado * 6.5 * pose.sx), dy = y - (cy - 1);
        if (dx * dx + dy * dy <= r * r) return z > base + alto - 3 ? P.cuernoPunta : P.cuerno;
      }
      return null;
    };
  }
  function brote(pose, zc) {
    return (z, x, y) => {
      const arranque = Math.round(zc + 10 * pose.sz), copa = arranque + 4;
      const dxT = x - cx, dyT = y - (cy + 1);
      if (z >= arranque && z <= copa && dxT * dxT + dyT * dyT <= 1.3) return P.tallo;
      if (z >= copa - 0.5 && z < copa + 1.5) {
        for (const lado of [-1, 1]) {
          const dx = x - (cx + lado * 3.6), dy = y - (cy + 1);
          if ((dx / 4) ** 2 + (dy / 2.2) ** 2 <= 1) return z >= copa + 0.5 ? P.hoja : P.hojaOscura;
        }
      }
      return null;
    };
  }
  function pies(pose) {
    return (z, x, y) => {
      for (const lado of [-1, 1]) if (dentro(x - (cx + lado * 6.5 * pose.sx), y - (cy + 5), z - 2, 4.2, 5.2, 2.8)) return z >= 3 ? P.pieClaro : P.pie;
      return null;
    };
  }
  function brazos(pose, rx, rz, zc) {
    return (z, x, y) => {
      for (const lado of [-1, 1]) {
        const hombro = [cx + lado * (rx - 3), cy + 3, zc + 1];
        const mano = [cx + lado * mezcla(rx + 1.5, rx + 0.5, pose.a), cy + mezcla(3, 4, pose.a), mezcla(zc - 5, zc + rz + 2, pose.a)];
        if (dist2Seg(x, y, z, hombro, mano) <= 2.6 * 2.6) return tono(z - zc + 4, P.cuerpoClaro, P.cuerpo, P.cuerpoOscuro);
      }
      return null;
    };
  }
  function cara(pose, dx, dy, dz) {
    if (dy < 7 * pose.sx) return null;
    const ez0 = Math.round(dz / pose.sz);
    for (const lado of [-1, 1]) {
      const ex = dx - lado * 5.5 * pose.sx, ez = ez0 - 3;
      if (ex * ex + ez * ez <= 7.5) return (ez === 1 && Math.abs(ex + 1.5) < 0.6) ? P.brillo : P.ojo;
    }
    if (ez0 === -1 && Math.abs(dx) <= 1.5) return P.boca;
    return null;
  }
  function cuerpo(pose, rx, ry, rz, zc) {
    return (z, x, y) => {
      const dx = x - cx, dy = y - cy, dz = z - zc;
      if (!dentro(dx, dy, dz, rx, ry, rz)) return null;
      const c = cara(pose, dx, dy, dz);
      if (c) return c;
      if (dy > 5 && (dx / (8.5 * pose.sx)) ** 2 + ((dz / pose.sz + 3) / 6.5) ** 2 <= 1) return dz < -5 ? P.tripaOscura : P.tripa;
      return tono(dz / pose.sz, P.cuerpoClaro, P.cuerpo, P.cuerpoOscuro);
    };
  }
  function modelo(pose) {
    const rx = 15.5 * pose.sx, ry = 14.5 * pose.sx, rz = 11 * pose.sz, zc = SUELO_CUERPO + rz;
    const cola = (z, x, y) => dentro(x - cx, y - (cy - ry - 0.5), z - (zc - 4 * pose.sz), 3.6, 3.6, 3.2)
      ? (z > zc - 4 * pose.sz ? P.cuerpoClaro : P.cuerpo) : null;
    const PIEZAS = [cuernos(pose, zc), brote(pose, zc), brazos(pose, rx, rz, zc), cuerpo(pose, rx, ry, rz, zc), cola, pies(pose)];
    return (z, x, y) => {
      for (const f of PIEZAS) { const c = f(z, x + 0.5, y + 0.5); if (c) return c; }
      return null;
    };
  }
  return { modelo, POSTURAS, W, D, H };
})();
const EB = 0.85, B_W = Math.round(BROTO.W * EB), B_D = Math.round(BROTO.D * EB), B_H = Math.round(BROTO.H * EB);
const PILAS_B = {};
for (const n in BROTO.POSTURAS) {
  const m = BROTO.modelo(BROTO.POSTURAS[n]);
  TAREAS.push(() => { PILAS_B[n] = pila(B_W, B_D, B_H, (z, x, y) => m((z + 0.5) / EB - 0.5, (x + 0.5) / EB - 0.5, (y + 0.5) / EB - 0.5)); });
}

// ================= Zanahoria y bandera =================
const PILA_ZANA = pila(16, 16, 24, (z, x, y) => {
  const dx = x + 0.5 - 8, dy = y + 0.5 - 8;
  if (z < 16) {
    const r = 1 + z * 0.42; if (dx * dx + dy * dy > r * r) return null;
    if (z > 12) return '#ffa63d';
    if (z % 4 === 1) return '#d2501a';
    return (dx < -r * 0.4) ? '#ffa63d' : '#f47c20';
  }
  for (const a of [0, 2.1, 4.2]) {
    const lx = Math.cos(a) * (z - 15) * 0.7, ly = Math.sin(a) * (z - 15) * 0.7;
    if ((dx - lx) ** 2 + (dy - ly) ** 2 <= 2.4) return z > 20 ? '#8cdc64' : '#52b846';
  }
  return null;
});
const PILA_BANDERA = pila(28, 12, 70, (z, x, y) => {
  const px = x + 0.5 - 5, py = y + 0.5 - 6;
  if (px * px + py * py <= 2.6) return z > 66 ? '#f9c531' : (px < 0 ? '#a0683a' : '#d8a070');
  if (z >= 45 && z <= 63 && x >= 7 && x <= 26) {
    const ola = Math.sin(x * 0.45) * 1.6;
    if (Math.abs(py - ola) <= 0.9) return ((x >> 2) + (z >> 2)) % 2 ? '#f04b53' : '#fff6e0';
  }
  return null;
});

// ================= Pez gordito: se asoma del agua y escupe =================
const PEZ_P = { claro: '#ffb38a', base: '#ff7a59', oscuro: '#c84a3a', tripa: '#fff1cf', tripaO: '#f2d6a0',
  aleta: '#ffd23f', aletaO: '#e09a1a', ojo: '#1b1626', brillo: '#ffffff', boca: '#5a1530', labio: '#ff9fb0', labioO: '#e8788f', mancha: '#ffd6c2' };
const POSE_PEZ = { cerrada: { boca: 0, s: 1, aleta: 0 }, abierta: { boca: 1, s: 1.1, aleta: 1 }, golpe: { boca: 0.4, s: 0.9, aleta: -1 } };
const PEZ_C = { cx: 18, cy: 21, zc: 14 };
function pezOjos(s) {
  const { cx, cy, zc } = PEZ_C;
  return (z, x, y) => {
    for (const l of [-1, 1]) {
      const dx = x - (cx + l * 7 * s), dy = y - (cy + 8), dz = z - (zc + 5);
      if (dx * dx + dy * dy + dz * dz > 3.7 * 3.7) continue;
      if (dy > 1.6 && Math.abs(dz) < 1.9 && Math.abs(dx) < 2.2) return (dz > 0.7 && dx * l > 0.3) ? PEZ_P.brillo : PEZ_P.ojo;
      return PEZ_P.brillo;
    }
    return null;
  };
}
function pezLabios(pose) {
  const { cx, cy, zc } = PEZ_C;
  return (z, x, y) => {
    if (!dentro(x - cx, y - (cy + 13.5), z - (zc - 1), 4.6 * pose.s, 3, 3.6)) return null;
    if (pose.boca > 0 && dentro(x - cx, y - (cy + 15), z - (zc - 1), 2.8 * pose.boca, 3, 2.2 * pose.boca)) return PEZ_P.boca;
    return z > zc - 1 ? PEZ_P.labio : PEZ_P.labioO;
  };
}
function pezAletas(pose) {
  const { cx, cy, zc } = PEZ_C;
  return (z, x, y) => {
    for (const l of [-1, 1]) if (dentro(x - (cx + l * 13 * pose.s), y - (cy + 1), z - (zc - 4 + pose.aleta * 2), 3.2, 4.5, 1.7)) return z > zc - 4 + pose.aleta * 2 ? PEZ_P.aleta : PEZ_P.aletaO;
    return null;
  };
}
function pezDorsal(s) {
  const { cx, cy, zc } = PEZ_C;
  return (z, x, y) => {
    const dy = y - cy; if (Math.abs(x - cx) > 1.5 || dy < -7 || dy > 5) return null;
    const b = zc + 9 * s, h = 6 - (dy + 7) * 0.35;
    if (z < b || z > b + h) return null;
    return z > b + h - 1.2 ? PEZ_P.aletaO : PEZ_P.aleta;
  };
}
function pezCola(z, x, y) {
  const { cx, cy, zc } = PEZ_C;
  const dy = y - cy; if (dy > -11 || dy < -20 || Math.abs(x - cx) > 1.7) return null;
  const u = -dy - 11, med = 2 + u * 0.95, dz = Math.abs(z - zc);
  if (dz > med || (u > 6 && dz < u * 0.35 - 1.5)) return null;
  return dz > med - 1.5 ? PEZ_P.aletaO : PEZ_P.aleta;
}
function pezCuerpo(s) {
  const { cx, cy, zc } = PEZ_C;
  return (z, x, y) => {
    const dx = x - cx, dy = y - cy, dz = z - zc;
    if (!dentro(dx, dy, dz, 12 * s, 13.5, 11 * s)) return null;
    if (dy > -3 && dz < -3) return dz < -7 ? PEZ_P.tripaO : PEZ_P.tripa;
    if (dz > 2 && ruido(Math.floor(x / 3), Math.floor(y / 3), Math.floor(z / 3)) < 0.13) return PEZ_P.mancha;
    return dz > 5 ? PEZ_P.claro : (dz < -4 ? PEZ_P.oscuro : PEZ_P.base);
  };
}
function pez(pose) {
  const piezas = [pezOjos(pose.s), pezLabios(pose), pezAletas(pose), pezDorsal(pose.s), pezCola, pezCuerpo(pose.s)];
  return (z, x, y) => { for (const f of piezas) { const c = f(z + 0.5, x + 0.5, y + 0.5); if (c) return c; } return null; };
}
const PILAS_PEZ = {};
for (const n in POSE_PEZ) TAREAS.push(() => { PILAS_PEZ[n] = pila(36, 40, 31, pez(POSE_PEZ[n])); });
const PILA_GOTA = pila(10, 10, 8, (z, x, y) => {
  const dx = x + 0.5 - 5, dy = y + 0.5 - 5, dz = z + 0.5 - 4;
  if (!dentro(dx, dy, dz, 4.6, 4.6, 3.6)) return null;
  return (dz > 1.2 && dx < -0.5) ? '#ffffff' : (dz > -0.5 ? '#9fdcf5' : '#3f9fdc');
});
Object.assign(IS.arte, { B_H, EB, BROTO_POSTURAS: BROTO.POSTURAS, PILAS_B, PILA_ZANA, PILA_BANDERA, PILAS_PEZ, PILA_GOTA });
}
