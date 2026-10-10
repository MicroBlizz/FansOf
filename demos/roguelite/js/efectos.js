// Fans of Roguelite · Efectos: polvo, chispas, estrellas de golpe, trozos que rebotan, números de daño que saltan, monedas que
// vuelan al marcador, bocadillos, bellotas, sobres de despido, rayos láser, bolas de hielo o de sombra, rayos eléctricos y
// destellos de curación. Todo en píxeles enteros.
'use strict';

const FX = [];
const TEMBLOR = { a: 0, x: 0, y: 0 };
let DESTELLO = null;
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
function tiembla(a) { TEMBLOR.a = Math.max(TEMBLOR.a, a); }
function destella(color, s = 0.12) { DESTELLO = { color, t: s, dur: s }; }
function fx(tipo, o) { const e = Object.assign({ tipo, t: 0, vida: 0.5, x: 0, y: 0, vx: 0, vy: 0, g: 0 }, o); FX.push(e); return e; }

// los dibujitos de los efectos (con contorno, como todo)
function creaEfectos() {
  const estrellaGolpe = (R, rot, fases) => fases.map(([esc, pl]) => {
    const p = new Pincel(R * 2 + 6, R * 2 + 6, R + 3, R + 3), pts = [];
    for (let i = 0; i < 16; i++) { const a = rot + i * Math.PI / 8, q = (i % 2 ? R * 0.42 : (i % 4 ? R * 0.75 : R)) * esc; pts.push(Math.cos(a) * q, Math.sin(a) * q); }
    p.parte(F.pol(...pts), pl, { sombra: 2, luz: false });
    if (esc > 0.7) p.plano(F.ov(0, 0, R * 0.32 * esc, R * 0.32 * esc), '#ffffff');
    return p.lienzo();
  });
  const blanca = pal('#ffffff', '#fff3a0', '#ffffff', '#ffcb3d'), amarilla = pal('#ffcb3d', '#ff8a1f', '#fff3a0', '#c4410f'), naranja = pal('#ff8a1f', '#e63946', '#ffcb3d', '#8f2410');
  SPR.golpe = estrellaGolpe(9, 0.2, [[0.75, blanca], [1, amarilla], [0.8, naranja]]);
  SPR.golpeG = estrellaGolpe(15, 0.5, [[0.7, blanca], [1, amarilla], [1.05, naranja]]);
  let p = new Pincel(12, 12, 6, 6);
  p.parte(F.ov(0, 1, 3.4, 3.8), pal('#c8874a', '#8f5428', '#e8b07a', '#4a2a14'), { sombra: 1 });
  p.parte(F.ov(0, -2, 4, 2.2), pal('#6b4423', '#4a2a14', '#9a6a3a', '#2a1408'), { sombra: 0 });
  p.plano(F.tr(0, -4, 1, -5.5, 0.5), OL);
  SPR.bellota = p.lienzo();
  p = new Pincel(14, 10, 7, 5);
  p.parte(F.re(-6, -4, 12, 8), PAL_E.papel, { sombra: 1 });
  p.plano(F.un(F.tr(-5, -3, 0, 1, 0.5), F.tr(5, -3, 0, 1, 0.5)), '#9a9080');
  p.plano(F.ov(0, 0.5, 1.5, 1.5), '#e63946');
  SPR.sobre = p.lienzo();
  SPR.moneda = [5, 3.6, 1.4, 3.6].map(a => { const q = new Pincel(12, 12, 6, 6); q.parte(F.ov(0, 0, a, 4.6), PAL_H.oro, { sombra: 1 }); if (a > 2) q.plano(F.re(-0.5, -2, 1, 4), '#e0821f'); return q.lienzo(); });
}

/* ---------- recetas ---------- */
function polvo(x, y, n = 3, dir = 0) { for (let i = 0; i < n; i++) fx('polvo', { x: x + rnd(-3, 3), y: y - rnd(2), vx: dir * rnd(10, 30) + rnd(-7, 7), vy: rnd(-16, -6), vida: rnd(0.3, 0.55), r: 1 + Math.floor(rnd(2)) }); }
function chispas(x, y, n, col = '#fff3a0', fuerza = 90) { for (let i = 0; i < n; i++) { const a = rnd(Math.PI * 2), v = rnd(0.4, 1) * fuerza; fx('chispa', { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, g: 160, vida: rnd(0.3, 0.6), col }); } }
function estallido(x, y, grande) { fx('estallido', { x, y, vida: grande ? 0.3 : 0.2, grande }); }
function anillo(x, y, r, col = '#fff6ea', vida = 0.3) { fx('anillo', { x, y, r, col, vida }); }
function trozos(x, y, n, cols) { for (let i = 0; i < n; i++) fx('trozo', { x: x + rnd(-6, 6), y: y + rnd(-10, 0), vx: rnd(-70, 70), vy: rnd(-130, -50), g: 320, vida: rnd(0.9, 1.4), col: cols[i % cols.length], s: 1 + Math.floor(rnd(3)), suelo: SUELO + rnd(-2, 6) }); }
function humo(x, y, n) { for (let i = 0; i < n; i++) fx('humo', { x: x + rnd(-10, 10), y: y + rnd(-14, 0), vx: rnd(-12, 12), vy: rnd(-26, -10), vida: rnd(0.5, 0.9), r: 2 + Math.floor(rnd(3)) }); }
function gotas(x, y, n, col) { for (let i = 0; i < n; i++) fx('gota', { x, y, vx: rnd(-50, 30), vy: rnd(-90, -30), g: 300, vida: rnd(0.4, 0.7), col, suelo: SUELO + rnd(4) }); }
function rayas(x, y, dir) { for (let i = 0; i < 3; i++) fx('raya', { x: x + rnd(-4, 4), y: y + rnd(-14, 0), vx: -dir * 260, vida: 0.12, l: Math.floor(rnd(6, 14)) }); }
// número de daño: tipo 'golpe' | 'critico' | 'herida' | 'cura' | 'poco'
function numero(x, y, n, clase = 'golpe') { fx('num', { x: x + rnd(-4, 4), y, txt: String(n), clase, vida: clase === 'critico' ? 1.1 : 0.85, vy: clase === 'poco' ? -50 : -78, vx: rnd(-14, 14), g: 170 }); }
// a velocidad x1 tiene que dar tiempo a leerlo todo: los rótulos duran la mitad más y los bocadillos, según lo que digan
const lectura = (txt, s) => Math.max(s * 1.4, 1.3 + tr(txt).length / 11);
function rotulo(x, y, txt, col = '#fff6ea', vida = 1.1, esc = 1) { fx('rotulo', { x, y, txt, col, vida: Math.max(1, vida * 1.5), esc }); }
function moneda(x, y, alFinal) { fx('moneda', { x, y, x0: x, y0: y, vx: rnd(-70, 70), vy: rnd(-150, -80), g: 340, vida: 1.6, alFinal, suelo: SUELO + rnd(-1, 4), espera: rnd(0.55, 0.85) }); }
function bocadillo(ent, txt, s = 1.8) { for (const e of FX) if (e.tipo === 'bocadillo' && e.ent === ent) e.t = e.vida; fx('bocadillo', { ent, txt, vida: lectura(txt, s) }); }
function laser(x1, y, x2, s = 0.18) { fx('laser', { x: x1, y, x2, vida: s }); }
// rayo eléctrico en zigzag de (x1, y1) a (x2, y2)
function rayo(x1, y1, x2, y2, col = '#fff3a0', s = 0.22) { fx('rayo', { x: x1, y: y1, x2, y2, col, vida: s }); }
// una bola que se lanza (hielo, sombra…): devuelve el efecto para moverlo; al acabar, b.t = b.vida
function bola(x, y, col, r = 3) { return fx('bola', { x, y, col, r, vida: 9 }); }
// cruces verdes que suben (curación)
function curita(x, y, n = 6) { for (let i = 0; i < n; i++) fx('cruz', { x: x + rnd(-10, 10), y: y + rnd(-8, 8), vy: rnd(-34, -18), vida: rnd(0.5, 0.8) }); }

function avanzaFx(dt, real) {
  if (TEMBLOR.a > 0) { TEMBLOR.a = Math.max(0, TEMBLOR.a - real * 30); const a = Math.ceil(TEMBLOR.a); TEMBLOR.x = Math.round(rnd(-a, a)); TEMBLOR.y = Math.round(rnd(-a, a) * 0.6); } else { TEMBLOR.x = TEMBLOR.y = 0; }
  if (DESTELLO) { DESTELLO.t -= real; if (DESTELLO.t <= 0) DESTELLO = null; }
  for (let i = FX.length - 1; i >= 0; i--) {
    const e = FX[i];
    e.t += dt;
    if (e.tipo === 'moneda' && e.t > e.espera) {   // primero salta y rebota, luego vuela al marcador
      const k = Math.min(1, (e.t - e.espera) / 0.45), [hx, hy] = MONEDERO;
      if (e.kx === undefined) { e.kx = e.x; e.ky = e.y; }
      e.x = e.kx + (hx - e.kx) * entra(k); e.y = e.ky + (hy - e.ky) * k - Math.sin(k * Math.PI) * 20;
      if (k >= 1) { FX.splice(i, 1); fx('chispa', { x: hx, y: hy, vx: rnd(-30, 30), vy: rnd(-40, -10), g: 80, vida: 0.3, col: '#fff3a0', capa: 'monedas' }); if (e.alFinal) e.alFinal(); continue; }
    } else {
      e.vy += e.g * dt; e.x += e.vx * dt; e.y += e.vy * dt;
      if (e.suelo !== undefined && e.y > e.suelo) { e.y = e.suelo; e.vy *= -0.35; e.vx *= 0.6; }
    }
    if (e.t >= e.vida) FX.splice(i, 1);
  }
}

function pintaFx(ctx, capa) {
  for (const e of FX) {
    const k = e.t / e.vida, x = Math.round(e.x), y = Math.round(e.y);
    const c = e.capa || e.tipo === 'moneda' ? e.capa || 'monedas' : e.tipo === 'num' || e.tipo === 'rotulo' || e.tipo === 'bocadillo' || e.tipo === 'cruz' ? 'arriba' : 'abajo';
    if (c !== capa) continue;
    switch (e.tipo) {
      case 'polvo': { const r = e.r + Math.floor(k * 3); if (k < 0.55) { circuloPx(ctx, x, y, r, '#e8d2b0'); circuloPx(ctx, x - 1, y - 1, Math.max(0, r - 1), '#fff6ea'); } else anilloPx(ctx, x, y, r, 1, '#e8d2b0'); break; }
      case 'humo': { const r = e.r + Math.floor(k * 3); circuloPx(ctx, x, y, r, k < 0.6 ? '#4a3a5a' : '#6a5a7a'); if (k < 0.5) circuloPx(ctx, x - 1, y - 1, Math.max(0, r - 2), '#6a5a7a'); break; }
      case 'chispa': { const l = k < 0.5 ? 2 : 1; ctx.fillStyle = e.col; ctx.fillRect(x - l, y, l * 2 + 1, 1); ctx.fillRect(x, y - l, 1, l * 2 + 1); ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, 1, 1); break; }
      case 'estallido': { const lista = e.grande ? SPR.golpeG : SPR.golpe; pintaSpr(ctx, lista[Math.min(2, Math.floor(k * 3))], x, y); break; }
      case 'anillo': { const r = Math.round(e.r * (0.3 + k * 0.9)); anilloPx(ctx, x, y, r, k < 0.5 ? 2 : 1, e.col); break; }
      case 'trozo': { ctx.fillStyle = OL; ctx.fillRect(x - 1, y - 1, e.s + 2, e.s + 2); ctx.fillStyle = e.col; ctx.fillRect(x, y, e.s, e.s); break; }
      case 'gota': { ctx.fillStyle = e.col; ctx.fillRect(x, y, 1, 2); break; }
      case 'raya': { ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, e.l, 1); break; }
      case 'spr': pintaSpr(ctx, e.spr, x, y); break;
      case 'moneda': { pintaSpr(ctx, SPR.moneda[Math.floor(e.t * 14) % 4], x, y); break; }
      case 'rayo': {
        if (Math.floor(e.t * 30) % 3 === 2) break;
        const n = 7, sem = Math.floor(e.t * 30);
        let px = x, py = y;
        for (let i = 1; i <= n; i++) {
          const q = i / n, nx = Math.round(e.x + (e.x2 - e.x) * q), ny = Math.round(e.y + (e.y2 - e.y) * q + (i < n ? (hash(i, sem) - 0.5) * 12 : 0));
          for (const [c, w] of [[OL, 3], [e.col, 1]]) { ctx.fillStyle = c; const pasos = Math.max(Math.abs(nx - px), Math.abs(ny - py)) || 1; for (let k = 0; k <= pasos; k++) ctx.fillRect(Math.round(px + (nx - px) * k / pasos) - (w >> 1), Math.round(py + (ny - py) * k / pasos) - (w >> 1), w, w); }
          ctx.fillStyle = '#ffffff'; ctx.fillRect(nx, ny, 1, 1);
          px = nx; py = ny;
        }
        break;
      }
      case 'bola': { circuloPx(ctx, x, y, e.r + 1, OL); circuloPx(ctx, x, y, e.r, e.col); circuloPx(ctx, x - 1, y - 1, Math.max(0, e.r - 2), mezcla(e.col, '#ffffff', 0.6)); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, y - 1, 1, 1); break; }
      case 'cruz': { if (k > 0.7 && Math.floor(e.t * 20) % 2) break; ctx.fillStyle = OL; ctx.fillRect(x - 2, y - 1, 5, 3); ctx.fillRect(x - 1, y - 2, 3, 5); ctx.fillStyle = '#7be04a'; ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); break; }
      case 'laser': { if (Math.floor(e.t * 40) % 2) break; const a = Math.min(e.x, e.x2), b = Math.max(e.x, e.x2); ctx.fillStyle = OL; ctx.fillRect(a, y - 3, b - a, 7); ctx.fillStyle = '#33e0ff'; ctx.fillRect(a, y - 2, b - a, 5); ctx.fillStyle = '#ffffff'; ctx.fillRect(a, y - 1, b - a, 2); break; }
      case 'num': {
        if (k > 0.75 && Math.floor(e.t * 20) % 2) break;
        const C = { golpe: ['#fff6ea', '#ffcb3d'], critico: ['#fff3a0', '#ff8a1f'], herida: ['#ffb0b8', '#ff3348'], cura: ['#d8ffb0', '#7be04a'], poco: ['#fff6ea', '#cdb9ea'], escudo: ['#e8f4ff', '#5aaeff'] }[e.clase];
        const esc = (e.clase === 'critico' ? 3 : e.clase === 'poco' ? 1 : 2) + (e.t < 0.06 ? 1 : 0);
        escribe(ctx, e.txt + (e.clase === 'critico' ? '!' : ''), x, y - 8, { esc, c: C[0], c2: C[1], alin: 'centro' });
        break;
      }
      case 'rotulo': {
        if (k > 0.8 && Math.floor(e.t * 20) % 2) break;
        const m = anchoTexto(e.txt, e.esc) / 2 + 2, rx = Math.max(m, Math.min(PAN.W - m, x));   // nunca se sale por un lado
        escribe(ctx, e.txt, rx, Math.max(ESC.Y + ESC.corte + 4, Math.round(y - 14 * sale(Math.min(1, k * 2)))), { c: e.col, alin: 'centro', esc: e.esc }); break;
      }
      case 'bocadillo': pintaBocadillo(ctx, e, k); break;
    }
  }
}

function pintaBocadillo(ctx, e, k) {
  const ent = e.ent, lineas = envuelve(tr(e.txt), 104), w = Math.max(...lineas.map(l => anchoTexto(l))) + 8, h = lineas.length * LINEA + 5;
  const sube = e.t < 0.08 ? 3 : 0;
  let cx = Math.round(ent.x), base = Math.round(ent.y - ent.z - ent.alto - 6 + sube);
  let x = Math.round(cx - w / 2); x = Math.max(3, Math.min(PAN.W - w - 3, x));
  const y = Math.max(ESC.Y + ESC.corte + 3, base - h);
  ctx.fillStyle = OL; ctx.fillRect(x - 1, y, w + 2, h); ctx.fillRect(x, y - 1, w, h + 2);
  ctx.fillStyle = '#fff6ea'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#e2d4f2'; ctx.fillRect(x, y + h - 1, w, 1);
  const tx = Math.max(x + 3, Math.min(x + w - 6, cx - 2));
  ctx.fillStyle = OL; ctx.fillRect(tx - 1, y + h, 6, 2); ctx.fillRect(tx, y + h + 2, 4, 1); ctx.fillRect(tx + 1, y + h + 3, 2, 1);
  ctx.fillStyle = '#fff6ea'; ctx.fillRect(tx, y + h, 4, 1); ctx.fillRect(tx + 1, y + h + 1, 3, 1); ctx.fillRect(tx + 1, y + h + 2, 1, 1);
  const letras = Math.floor(e.t * 45);
  let usadas = 0;
  lineas.forEach((l, i) => { escribe(ctx, l, x + 4, y + 3 + i * LINEA, { c: '#26143c', borde: null, hasta: Math.max(0, letras - usadas) }); usadas += l.length; });
}
