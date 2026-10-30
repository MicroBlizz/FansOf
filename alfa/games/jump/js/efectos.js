// Fans of Jump · Los efectos: ondas en el agua al caer, salpicones, estrellitas del PERFECTO, corazones al rescatar y los
// números que suben. Viven en medidas del mundo (x, wy) y se van apagando.
'use strict';

const FX = [];
function onda(x, wy, r = 10, color = 'rgba(255,255,255,0.8)') { FX.push({ t: 'onda', x, wy, r, v: 0.6, v0: 0.6, color }); }
function salpica(x, wy, n, color) {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = azar(18, 46); FX.push({ t: 'gota', x, wy, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, z: 0, vz: azar(30, 60), r: azar(0.9, 1.8), color, v: 1 }); }
}
function estrellas(x, wy, n = 6, color = '#ffe066') {
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; FX.push({ t: 'estrella', x, wy, vx: Math.cos(a) * 34, vy: Math.sin(a) * 34, r: azar(2, 3.2), giro: Math.random() * 3, color, v: 0.7, v0: 0.7 }); }
}
function corazones(x, wy, n = 4) {
  for (let i = 0; i < n; i++) FX.push({ t: 'corazon', x: x + azar(-8, 8), wy: wy + azar(4, 14), vx: azar(-8, 8), vy: azar(18, 32), r: azar(2, 3), v: 1, v0: 1 });
}
// un número o un aviso que sube (en la pantalla, encima del conejo)
function aviso(txt, x, wy, color = '#fff8ea', size = 9) { FX.push({ t: 'texto', txt, x, wy, color, size, v: 1.1, v0: 1.1 }); }

function avanzaFx(dt) {
  for (const f of FX) {
    f.v -= dt;
    if (f.t === 'gota' || f.t === 'gotaG') { f.x += f.vx * dt; f.wy += f.vy * dt; f.z += f.vz * dt; f.vz -= 160 * dt; if (f.z < 0) { f.v = 0; if (f.t === 'gotaG' && Math.random() < 0.4) onda(f.x, f.wy, 2.5, 'rgba(255,255,255,0.6)'); } }
    else if (f.t === 'estrella' || f.t === 'corazon') { f.x += f.vx * dt; f.wy += f.vy * dt; f.vx *= 0.92; f.vy *= 0.92; f.giro = (f.giro || 0) + dt * 5; }
    else if (f.t === 'texto') f.wy += dt * 16;
    else if (f.t === 'burbuja') f.wy += dt * 3;
    else if (f.t === 'petalo') { f.x += f.vx * dt; f.wy += f.vy * dt; f.vx *= 0.94; f.vy = f.vy * 0.94 - 14 * dt; f.giro += dt * 7; }
  }
  for (let i = FX.length - 1; i >= 0; i--) if (FX[i].v <= 0) FX.splice(i, 1);
}

function estrellaForma(x, y, r, a, color) {
  const p = [];
  for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.42 : r, b = a + i * Math.PI / 4; p.push(x + Math.cos(b) * rr, y + Math.sin(b) * rr); }
  forma(p, color, OLC, 0.6);
}
function corazonForma(x, y, r, color) {
  G.beginPath(); G.moveTo(x, y + r * 0.9);
  G.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.4, x, y - r * 0.5);
  G.bezierCurveTo(x + r * 0.7, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9);
  pinta(color, OLC, 0.6);
}

// capa: 'agua' (ondas, debajo de todo) o 'aire' (lo demás, encima)
function pintaFx(capa) {
  for (const f of FX) {
    const y = pantY(f.wy);
    if (capa === 'agua') {
      if (f.t !== 'onda') continue;
      const k = 1 - f.v / f.v0;
      G.globalAlpha = Math.max(0, 1 - k); elipse(f.x, y + 2, f.r + k * 12, (f.r + k * 12) * 0.6, null, f.color, 1.2 * (1 - k) + 0.3); G.globalAlpha = 1;
      continue;
    }
    if (f.t === 'gota') elipse(f.x, y - f.z, f.r, f.r, f.color, null);
    else if (f.t === 'gotaG') {   // gota grande y brillante, alargada al caer
      const st = Math.min(1.6, 1 + Math.abs(f.vz) / 120);
      elipse(f.x, y - f.z, f.r / Math.sqrt(st), f.r * st, f.color, 'rgba(70,140,160,0.45)', 0.35);
      elipse(f.x - f.r * 0.3, y - f.z - f.r * 0.4, f.r * 0.32, f.r * 0.32, f.luz, null);
    } else if (f.t === 'columna') {   // la columna de agua del golpe: sube y se deshace
      const k = 1 - f.v / f.v0, h = Math.sin(Math.min(1, k * 1.3) * Math.PI) * 26, w = 4 + k * 5;
      G.globalAlpha = Math.max(0, 1 - k * 0.8);
      blanda([f.x - w, y, f.x - w * 0.45, y - h * 0.6, f.x, y - h, f.x + w * 0.45, y - h * 0.6, f.x + w, y], f.color, 'rgba(61,42,92,0.3)', 0.5);
      G.globalAlpha = 1;
    } else if (f.t === 'espuma') {   // la espuma alrededor, que se abre y se va
      const k = 1 - f.v / f.v0;
      G.globalAlpha = Math.max(0, 1 - k);
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rr = 8 + k * 14; elipse(f.x + Math.cos(a) * rr, y + 2 + Math.sin(a) * rr * 0.5, 3.2 - k * 2, 2 - k, f.color, null); }
      G.globalAlpha = 1;
    }
    else if (f.t === 'estrella') { G.globalAlpha = Math.min(1, f.v / f.v0 * 2); estrellaForma(f.x, y, f.r, f.giro, f.color); G.globalAlpha = 1; }
    else if (f.t === 'petalo') { G.globalAlpha = Math.min(1, f.v * 2); aqui(f.x, y - 8, f.giro, 1, Math.abs(Math.sin(f.giro)) * 0.6 + 0.4, () => elipse(0, 0, f.r, f.r * 0.6, f.color, 'rgba(200,120,150,0.5)', 0.3)); G.globalAlpha = 1; }
    else if (f.t === 'burbuja') { const k = 1 - f.v / f.v0; G.globalAlpha = 1 - k; elipse(f.x, y - k * 4, 1 + k * 1.6, 1 + k * 1.6, 'rgba(230,255,250,0.5)', '#ffffff', 0.5); G.globalAlpha = 1; }
    else if (f.t === 'corazon') { G.globalAlpha = Math.min(1, f.v * 2); corazonForma(f.x, y, f.r, '#ff7aa8'); G.globalAlpha = 1; }
    else if (f.t === 'texto') {
      const k = 1 - f.v / f.v0, s = k < 0.15 ? 0.6 + k / 0.15 * 0.5 : 1.1 - Math.min(0.1, (k - 0.15));
      G.globalAlpha = Math.min(1, f.v * 2.5);
      letras(f.txt, f.x, y - 34, f.size * s, f.color, { borde: OLC, bw: 2.2 });
      G.globalAlpha = 1;
    }
  }
}
