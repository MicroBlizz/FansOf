// Fans of Jump · El tronco agrietado que se rompe (dibujos 3D tronco_grieta y tronco_mitad0/1 del estudio): al pisarlo, la grieta
// se abre poco a poco (las dos mitades se separan y tiembla); al romperse hace ¡CRAC!, la pantalla tiembla, las dos mitades se abren
// hacia los lados, se inclinan y se hunden con su chapuzón, saltan astillas girando y sale una nube de serrín.
// (Las mitades: tronco_mitad1 es la que se ve a la izquierda y tronco_mitad0 la de la derecha; la cámara mira desde atrás.)
'use strict';

const ROTURA = { trozos: [], astillas: [], serrin: [] };
const ROTURA_SEG = 1.1;
const MITAD = { '-1': 'tronco_mitad1', '1': 'tronco_mitad0' };

// cómo se dibuja un tronco agrietado: entero con su grieta y, cuanto más lo pisas, partido y abriéndose
function pintaTroncoAgrietado(tr, x, y, k) {
  if (k < 0.3) { sprite('tronco_grieta', x, y, tr.r); return; }
  const g = Math.pow((k - 0.3) / 0.7, 1.5) * 5.5;
  sprite(MITAD[-1], x - g, y, tr.r, -g * 0.02); sprite(MITAD[1], x + g, y, tr.r, g * 0.02);
  if (Math.random() < 0.25) ROTURA.astillas.push(astilla(x + azar(-2, 2), tr.wy, 0.6));
}
const astilla = (x, wy, fuerza = 1) => ({ x, wy, vx: azar(-30, 30) * fuerza, vy: azar(-10, 14) * fuerza, z: 3, vz: azar(30, 70) * fuerza, giro: Math.random() * 6, vgiro: azar(-14, 14), l: azar(2.2, 4.2) * (0.6 + fuerza * 0.4), c: Math.random() < 0.6 ? '#f7dcae' : '#c98a4a', v: 2 });

function rompeTronco(t) {
  for (const lado of [-1, 1]) ROTURA.trozos.push({ x: t.x, wy: t.wy, r: t.r, lado, t: 0, chof: false });
  for (let i = 0; i < 16; i++) ROTURA.astillas.push(astilla(t.x + azar(-4, 4), t.wy, 1));
  for (let i = 0; i < 9; i++) ROTURA.serrin.push({ x: t.x + azar(-10, 10), wy: t.wy + azar(-4, 6), r: azar(2, 4), t: -i * 0.03 });
  onda(t.x, t.wy, t.r); salpica(t.x, t.wy, 10, colorAgua(t.wy, 0.6));
  aviso(tr('¡Crac!'), t.x, t.wy + 38, '#ffb36a', 15); SONIDO.crac(); vibra([40, 30, 60]);
  JUEGO.temblor = Math.max(JUEGO.temblor, GUARDA.suave ? 0 : 0.22);
}
function avanzaRotura(dt) {
  const R = ROTURA;
  for (const p of R.trozos) {
    p.t += dt;
    if (!p.chof && p.t > 0.32) { p.chof = true; const x = p.x + p.lado * 14; onda(x, p.wy, p.r * 0.7); salpica(x, p.wy, 7, colorAgua(p.wy, 0.6)); }
  }
  R.trozos = R.trozos.filter(p => p.t < ROTURA_SEG);
  for (const a of R.astillas) {
    a.x += a.vx * dt; a.wy += a.vy * dt; a.z += a.vz * dt; a.vz -= 170 * dt; a.giro += a.vgiro * dt;
    if (a.z < 0 && a.v > 0) { a.v = 0; if (Math.random() < 0.4) onda(a.x, a.wy, 2, 'rgba(255,255,255,0.6)'); }
  }
  R.astillas = R.astillas.filter(a => a.v > 0);
  for (const s of R.serrin) s.t += dt;
  R.serrin = R.serrin.filter(s => s.t < 0.9);
}
function pintaRotura() {
  const R = ROTURA;
  for (const p of R.trozos) {
    // se abren deprisa, se inclinan y se hunden (lo de debajo del agua no se ve)
    const k = p.t / ROTURA_SEG, e = Math.min(1, p.t / 0.22), sale = 1 - (1 - e) * (1 - e);
    const dx = p.lado * (11 * sale + 10 * k), sube = Math.sin(Math.min(1, p.t / 0.32) * Math.PI) * 4, baja = Math.max(0, p.t - 0.32) * 16;
    const y = pantY(p.wy);
    G.save(); G.beginPath(); G.rect(0, 0, PAN.W, y + p.r * 0.62); G.clip();   // la línea del agua, por la mitad del canto
    G.globalAlpha = Math.max(0, Math.min(1, (1 - k) * 2.2));
    sprite(MITAD[p.lado], p.x + dx, y - sube + baja, p.r, p.lado * 0.45 * e);
    G.restore();
  }
  for (const s of R.serrin) {
    if (s.t < 0) continue;
    const k = s.t / 0.9; G.globalAlpha = 0.7 * (1 - k);
    elipse(s.x, pantY(s.wy) - 6 - k * 10, s.r * (1 + k * 1.6), s.r * (1 + k * 1.6) * 0.8, '#f4dcb0', null);
    G.globalAlpha = 1;
  }
  for (const a of R.astillas) {
    const y = pantY(a.wy) - a.z;
    aqui(a.x, y, a.giro, 1, 1, () => caja(-a.l / 2, -0.55, a.l, 1.1, 0.5, a.c, 'rgba(90,50,25,0.7)', 0.35));
  }
}
