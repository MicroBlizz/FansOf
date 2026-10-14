// Fans of Dungeons · Los efectos, estilo arcade: explosiones grandes (fogonazo, bola de fuego, anillo y humo), escombros que
// vuelan y rebotan, chispas de neón, rayos, estelas, arcos de golpe, números que flotan, rótulos y el temblor de pantalla.
// Las posiciones van en casillas; se pasan a píxeles al pintar, con la cámara.
'use strict';

const FX = [];
const TEMBLOR = { t: 0, f: 0, x: 0, y: 0 };
const R = () => D.f();

function fxChispas(x, y, color, n = 6) {
  for (let i = 0; i < n; i++) { const a = R() * TAU, v = 30 + R() * 70; FX.push({ tipo: 'chispa', x: x * TS + TS / 2, y: y * TS + TS / 2 - 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, t: 0, dur: 0.35 + R() * 0.3, c: color }); }
}
// una explosión: tam 1 = una casilla; color de la bola (naranja de serie)
function fxExplosion(x, y, tam = 1, color = '#ff9a2a') {
  const cx = x * TS + TS / 2, cy = y * TS + TS / 2 - 6, r = TS * 0.55 * tam;
  FX.push({ tipo: 'fogonazo', x: cx, y: cy, r: r * 1.6, t: 0, dur: 0.12 });
  FX.push({ tipo: 'anillo', x: cx, y: cy, r, t: 0, dur: 0.45, c: color });
  const bolas = Math.round(5 + tam * 5);
  for (let i = 0; i < bolas; i++) { const a = R() * TAU, d = R() * r * 0.7; FX.push({ tipo: 'bola', x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.7, r: r * (0.35 + R() * 0.5), vy: -20 - R() * 30, t: -R() * 0.12, dur: 0.5 + R() * 0.3, c: color }); }
  for (let i = 0; i < 4 * tam; i++) { const a = R() * TAU, d = R() * r; FX.push({ tipo: 'humo', x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r: r * (0.3 + R() * 0.4), t: -0.2 - R() * 0.2, dur: 0.9 + R() * 0.5 }); }
  fxChispas(x, y, '#fff6c0', Math.round(8 * tam));
  fxChispas(x, y, color, Math.round(6 * tam));
  TEMBLOR.t = Math.max(TEMBLOR.t, 0.12 * tam); TEMBLOR.f = Math.max(TEMBLOR.f, 2 + tam * 2);
}
// escombros: trozos del que ha caído (tornillos y chapa de los robots, trozos verdes de los zombis…) que vuelan y rebotan
const ESCOMBROS_COLOR = {
  becario: ['#b4bcd4', '#6f7898', '#ff3f52', '#fff6ea'], abogado: ['#5e6280', '#fff6ea', '#5a3a1c'], starbot: ['#ffd848', '#c0901c', '#ff4b5c'], cajabotin: ['#ffd040', '#b07040', '#b870ff'],
  esqueleto: ['#f4eee4', '#b8ac9c', '#ff3f52'], zombi: ['#96dc8c', '#5e6498', '#4f8a50'], fantasma: ['#e0f0ff', '#9bb8e8', '#3e4498'], cosido: ['#96dc8c', '#d0a874', '#b4bcd4'],
  soporte: ['#fafaff', '#4ae070', '#4a5070'], fallen: ['#4e4a68', '#7a2ab0', '#ffd040'], survivalbot: ['#b4bcd4', '#4a5070', '#ff3f52', '#fff6ea'], becariomes: ['#b4bcd4', '#ffd848', '#fff6ea'],
  parche: ['#b4bcd4', '#f2e8d4', '#ff4b5c'], ceo: ['#2c2c44', '#ffd040', '#fff8f0', '#b07040'], bunny: ['#fbf6ff', '#ffb0dc', '#ff9830'], cybermarine: ['#3f78e6', '#c8d0e8', '#4a9aa8'], necrolord: ['#8a44e8', '#f6f0e8', '#5cff8a'], bug: ['#58f070', '#1f9a3e'],
};
function fxEscombros(x, y, n = 8, fig = 'becario') {
  const cols = ESCOMBROS_COLOR[fig] || ['#b4bcd4', '#6f7898'];
  const suelo = y * TS + TS - 2;
  for (let i = 0; i < n; i++) { const a = -Math.PI * (0.15 + R() * 0.7), v = 60 + R() * 120; FX.push({ tipo: 'escombro', x: x * TS + TS / 2 + (R() - 0.5) * 10, y: suelo - 14 - R() * 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, suelo: suelo + (R() - 0.5) * 8, w: 2 + Math.floor(R() * 3), h: 2 + Math.floor(R() * 3), c: cols[Math.floor(R() * cols.length)], t: 0, dur: 1.4 + R() * 0.8, giro: R() * 10 }); }
}
function fxMonedas(x, y, n = 6) {
  for (let i = 0; i < n; i++) { const a = -Math.PI * (0.2 + R() * 0.6), v = 50 + R() * 80; FX.push({ tipo: 'moneda', x: x * TS + TS / 2, y: y * TS + TS - 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, suelo: y * TS + TS - 4 + (R() - 0.5) * 6, t: -R() * 0.1, dur: 0.9 + R() * 0.4, f: R() * 6 }); }
}
function fxNumero(x, y, txt, color, dy = 0) { FX.push({ tipo: 'numero', x: x * TS + TS / 2 + (R() - 0.5) * 8, y: y * TS - 10 + dy, txt: String(txt), c: color, t: 0, dur: 0.9 }); }
function fxRotulo(txt, color = '#ffffff', dur = 1.1) { FX.push({ tipo: 'rotulo', txt, c: color, t: 0, dur }); sonido('rotulo'); }
function fxRayo(x0, y0, x1, y1, color, grosor = 1) { FX.push({ tipo: 'rayo', x: x0 * TS + TS / 2, y: y0 * TS + TS / 2 - 12, x1: x1 * TS + TS / 2, y1: y1 * TS + TS / 2 - 12, c: color, g: grosor, t: 0, dur: 0.22 }); fxChispas(x1, y1, color, 5); }
function fxArco(x, y, dx, dy, color) { FX.push({ tipo: 'arco', x: x * TS + TS / 2, y: y * TS + TS / 2 - 12, a: Math.atan2(dy, dx), c: color, t: 0, dur: 0.22 }); }
function fxEstela(x0, y0, x1, y1, color) { for (let i = 0; i < 8; i++) { const k = i / 7; FX.push({ tipo: 'estela', x: (x0 + (x1 - x0) * k) * TS + TS / 2, y: (y0 + (y1 - y0) * k) * TS + TS / 2 - 14 - Math.sin(k * Math.PI) * 24, r: 5 + Math.sin(k * Math.PI) * 4, c: color, t: -i * 0.03, dur: 0.4 }); } }
// el que cae: su dibujo se queda un instante en blanco y se encoge
function fxMuerto(e) { FX.push({ tipo: 'muerto', x: e.x * TS + TS / 2, y: e.y * TS + TS, fig: e.fig, izq: e.izq, t: 0, dur: 0.35 }); }

function avanzaFx(dt) {
  for (let i = FX.length - 1; i >= 0; i--) {
    const f = FX[i];
    f.t += dt;
    if (f.t < 0) continue;
    if (f.t > f.dur) { FX.splice(i, 1); continue; }
    if (f.tipo === 'chispa') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 160 * dt; f.vx *= 0.96; }
    else if (f.tipo === 'escombro' || f.tipo === 'moneda') {
      f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 420 * dt;
      if (f.y >= f.suelo) { f.y = f.suelo; f.vy = -f.vy * 0.45; f.vx *= 0.6; if (Math.abs(f.vy) < 25) f.vy = 0; }
      if (f.tipo === 'moneda') f.f += dt * 14;
    }
    else if (f.tipo === 'bola' || f.tipo === 'humo') { f.y += (f.vy || -12) * dt; }
    else if (f.tipo === 'numero') f.y -= 22 * dt;
  }
  if (TEMBLOR.t > 0) { TEMBLOR.t -= dt; const f = TEMBLOR.f; TEMBLOR.x = Math.round((R() - 0.5) * 2 * f); TEMBLOR.y = Math.round((R() - 0.5) * 2 * f); if (TEMBLOR.t <= 0) { TEMBLOR.x = TEMBLOR.y = 0; TEMBLOR.f = 0; } }
}
// capas: 'suelo' (debajo de las figuras), 'aire' (encima) y 'pantalla' (rótulos, sin cámara)
function pintaFx(ctx, capa, ox, oy) {
  for (const f of FX) {
    if (f.t < 0) continue;
    const k = f.t / f.dur, x = Math.round(f.x - ox), y = Math.round(f.y - oy);
    if (capa === 'suelo') {
      if (f.tipo === 'estela') { ctx.globalAlpha = 1 - k; circuloPx(ctx, x, y, Math.round(f.r * (1 - k * 0.5)), f.c); ctx.globalAlpha = 1; }
      else if (f.tipo === 'escombro' && f.vy === 0) { ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1; ctx.fillStyle = f.c; ctx.fillRect(x, y, f.w, f.h); ctx.globalAlpha = 1; }
    } else if (capa === 'aire') {
      if (f.tipo === 'chispa') { ctx.fillStyle = k < 0.5 ? '#ffffff' : f.c; ctx.fillRect(x, y, k < 0.5 ? 2 : 1, k < 0.5 ? 2 : 1); }
      else if (f.tipo === 'fogonazo') { ctx.globalAlpha = (1 - k) * 0.7; circuloPx(ctx, x, y, Math.round(f.r * (0.6 + k * 0.4)), '#ffe0a0'); ctx.globalAlpha = 1; }
      else if (f.tipo === 'bola') {
        const col = k < 0.2 ? '#ffffff' : k < 0.4 ? '#fff0a0' : k < 0.65 ? f.c : k < 0.85 ? mezcla(f.c, '#5a1a40', 0.5) : '#3a2040';
        const r = Math.round(f.r * (k < 0.3 ? 0.5 + k * 1.8 : 1.04 - (k - 0.3) * 0.6));
        if (k < 0.65) ctx.globalCompositeOperation = 'lighter';
        circuloPx(ctx, x, y, Math.max(1, r), col);
        if (k < 0.5) circuloPx(ctx, x - r * 0.25, y - r * 0.25, Math.max(1, Math.round(r * 0.45)), '#ffffff');
        ctx.globalCompositeOperation = 'source-over';
      }
      else if (f.tipo === 'humo') { ctx.globalAlpha = (1 - k) * 0.7; circuloPx(ctx, x, y, Math.round(f.r * (0.6 + k * 0.8)), k < 0.5 ? '#6a5a7a' : '#4a4060'); ctx.globalAlpha = 1; }
      else if (f.tipo === 'anillo') { ctx.globalAlpha = 1 - k; anilloPx(ctx, x, y, Math.round(f.r * (0.3 + k * 1.4)), k < 0.4 ? 2 : 1, k < 0.3 ? '#ffd8a0' : mezcla(f.c, '#1a0a0a', 0.3)); ctx.globalAlpha = 1; }
      else if (f.tipo === 'escombro' && f.vy !== 0) { const g = Math.floor(f.giro + f.t * 12) & 1; ctx.fillStyle = f.c; ctx.fillRect(x, y, g ? f.w : f.h, g ? f.h : f.w); }
      else if (f.tipo === 'moneda') { const fase = Math.floor(f.f) % 4, w = [6, 4, 2, 4][fase]; ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1; ctx.fillStyle = '#20102c'; ctx.fillRect(x - w / 2 - 1, y - 4, w + 2, 8); ctx.fillStyle = fase === 2 ? '#c0901c' : '#ffd848'; ctx.fillRect(x - w / 2, y - 3, w, 6); if (w > 2) { ctx.fillStyle = '#fff4a8'; ctx.fillRect(x - w / 2 + 1, y - 2, 1, 2); } ctx.globalAlpha = 1; }
      else if (f.tipo === 'rayo') {
        const x1 = Math.round(f.x1 - ox), y1 = Math.round(f.y1 - oy);
        ctx.lineWidth = 3 + f.g * 2; ctx.strokeStyle = f.c; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.lineWidth = 1 + f.g; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      else if (f.tipo === 'arco') {
        ctx.globalAlpha = 1 - k;
        ctx.lineWidth = 3; ctx.strokeStyle = f.c; ctx.beginPath(); ctx.arc(x, y, 12 + k * 8, f.a - 1.1 + k * 0.5, f.a + 1.1 + k * 0.5); ctx.stroke();
        ctx.lineWidth = 1; ctx.strokeStyle = '#f0e0c8'; ctx.beginPath(); ctx.arc(x, y, 12 + k * 8, f.a - 0.9 + k * 0.5, f.a + 0.9 + k * 0.5); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      else if (f.tipo === 'numero') { ctx.globalAlpha = k > 0.6 ? (1 - k) / 0.4 : 1; escribe(ctx, f.txt, x, y, { c: f.c, alin: 'centro' }); ctx.globalAlpha = 1; }
      else if (f.tipo === 'muerto') { const s = cuadro(f.fig, 'muerto', 0, f.izq); if (s) { ctx.globalAlpha = 1 - k; ctx.drawImage(k < 0.4 ? s.b : s.c, x - s.ox, y - s.oy + Math.round(k * 10)); ctx.globalAlpha = 1; } }
    } else if (capa === 'pantalla' && f.tipo === 'rotulo') {
      const esc = 2, alpha = k < 0.1 ? k / 0.1 : k > 0.75 ? (1 - k) / 0.25 : 1;
      ctx.globalAlpha = alpha;
      const y0 = Math.round(PAN.H * 0.32 - (k < 0.1 ? (0.1 - k) * 60 : 0));
      escribe(ctx, f.txt, PAN.W / 2, y0, { c: f.c, esc, alin: 'centro', c2: mezcla(f.c, '#3a0a10', 0.45) });
      ctx.globalAlpha = 1;
    }
  }
}
