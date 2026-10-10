// Fans of Rouflage (prototipo) · EFECTOS: lo que adorna la partida sin cambiar sus reglas. Ondas de los silbidos, gotas de pintura,
// el fogonazo de un disparo, textos que flotan y lo que se queda en el suelo (el sello de DESPEDIDO y las manchas de los fallos).
'use strict';

const FX = { lista: [], suelo: [] };
const COLORES_MANCHA = ['#ff4b5c', '#ffcb3d', '#39d5e8', '#d43cff', '#7ee04a'];
function limpiaFx() { FX.lista.length = 0; FX.suelo.length = 0; }

// lo fuerte que suena algo según lo lejos que quede del centro de la pantalla
const volumenEn = (x, y) => limita(1.15 - lejos(x, y, CAM.x, CAM.y) / 620, 0, 1);

function ondaSilbido(x, y, e) {
  FX.lista.push({ k: 'onda', x, y, t: 0, dur: 1.6 });
  const v = volumenEn(x, y); if (v > 0.05) play('silbido', v);
}
function fxTexto(x, y, s, color, tam = 15) { FX.lista.push({ k: 'texto', x, y, s, color, tam, t: 0, dur: 1.5 }); }
function fxGota(x, y, color, vx = rand(-30, 30), vy = rand(-70, -20)) { FX.lista.push({ k: 'gota', x, y, vx, vy, color, r: rand(1.6, 3.4), t: 0, dur: rand(0.45, 0.8) }); }
function fxSalpica(x, y, color, n) { for (let k = 0; k < n; k++) fxGota(x, y, color, rand(-110, 110), rand(-170, -20)); }
function fxSudor(e) { fxGota(e.x + rand(-13, 13), e.y - rand(36, 48), '#bdeeff', rand(-24, 24), -46); }
function fxDisparo(e, x, y) {
  FX.lista.push({ k: 'tiro', x0: e.x + e.mira * 24, y0: e.y - 16, x, y, t: 0, dur: 0.24 });
  const v = volumenEn(x, y); if (v > 0.05) play('disparo', v);
}
function fxSello(x, y) { FX.suelo.push({ k: 'sello', x, y, rot: rand(-0.32, 0.32), t: 0 }); if (FX.suelo.length > 26) FX.suelo.shift(); }
function fxMancha(x, y) {
  const color = pick(COLORES_MANCHA);
  FX.suelo.push({ k: 'mancha', x, y, s: (Math.random() * 9999) | 0, color, t: 0 }); if (FX.suelo.length > 26) FX.suelo.shift();
  fxSalpica(x, y, color, 9);
}
// el aro que deja el cuentagotas al coger un color
function fxAro(x, y, color) { FX.lista.push({ k: 'aro', x, y, color, t: 0, dur: 0.45 }); }

function avanzaFx(dt) {
  for (let i = FX.lista.length - 1; i >= 0; i--) {
    const f = FX.lista[i]; f.t += dt;
    if (f.k === 'gota') { f.vy += 420 * dt; f.x += f.vx * dt; f.y += f.vy * dt; }
    if (f.t >= f.dur) FX.lista.splice(i, 1);
  }
  for (const s of FX.suelo) s.t += dt;
}

// lo que se queda en el suelo, por debajo de los personajes
function pintaFxSuelo(c) {
  for (const s of FX.suelo) {
    if (s.k === 'mancha') { c.globalAlpha = Math.min(1, s.t / 0.08) * 0.85; mancha(c, s.x, s.y, 13, s.color, s.s); c.globalAlpha = 1; }
    else {
      const e = s.t < 0.16 ? 2.3 - (s.t / 0.16) * 1.3 : 1;
      c.save(); c.translate(s.x, s.y); c.rotate(s.rot); c.scale(e, e); c.globalAlpha = Math.min(1, s.t / 0.06) * 0.92;
      c.strokeStyle = '#ff4b5c'; c.lineWidth = 3; c.beginPath(); rrPath(c, -38, -12, 76, 24, 4); c.stroke();
      c.lineWidth = 1.2; c.beginPath(); rrPath(c, -34, -8.5, 68, 17, 2); c.stroke();
      rotuloJusto(c, tr('DESPEDIDO'), 0, 0, 13, 62, '#ff4b5c');
      c.restore();
    }
  }
}
// lo que va por encima de los personajes
function pintaFx(c) {
  for (const f of FX.lista) {
    const p = f.t / f.dur;
    if (f.k === 'onda') {
      for (let k = 0; k < 3; k++) {
        const q = p * 1.5 - k * 0.24; if (q <= 0 || q >= 1) continue;
        c.globalAlpha = (1 - q) * 0.9; const r = 10 + q * 78;
        c.beginPath(); c.arc(f.x, f.y, r, 0, TAU); c.lineWidth = 5.5; c.strokeStyle = OL; c.stroke(); c.lineWidth = 2.6; c.strokeStyle = '#ffcb3d'; c.stroke();
      }
      c.globalAlpha = 1;
    } else if (f.k === 'texto') {
      c.globalAlpha = p > 0.7 ? (1 - p) / 0.3 : 1;
      rotulo(c, f.s, f.x, f.y - suaviza(Math.min(1, p * 1.6)) * 22, f.tam, f.color, OL);
      c.globalAlpha = 1;
    } else if (f.k === 'gota') {
      c.globalAlpha = 1 - p * p; punto(c, f.x, f.y, f.r + 1.1, OL); punto(c, f.x, f.y, f.r, f.color); c.globalAlpha = 1;
    } else if (f.k === 'tiro') {
      const q = Math.min(1, p * 2.4), x = entre(f.x0, f.x, q), y = entre(f.y0, f.y, q);
      c.globalAlpha = 1 - p; raya(c, [f.x0, f.y0, x, y], OL, 6); raya(c, [f.x0, f.y0, x, y], '#fff6ea', 2.6);
      if (q >= 1) { const r = 6 + (p - 0.42) * 46; c.beginPath(); c.arc(f.x, f.y, Math.max(2, r), 0, TAU); c.lineWidth = 4; c.strokeStyle = '#ff4b5c'; c.stroke(); }
      c.globalAlpha = 1;
    } else if (f.k === 'aro') {
      c.globalAlpha = 1 - p; c.beginPath(); c.arc(f.x, f.y, 3 + p * 9, 0, TAU); c.lineWidth = 3.4; c.strokeStyle = OL; c.stroke(); c.lineWidth = 1.8; c.strokeStyle = f.color; c.stroke(); c.globalAlpha = 1;
    }
  }
}
