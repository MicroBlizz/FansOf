// Fans of Jump · El dron de Microblizz: desde los 200 m, de vez en cuando entra por un lado, vuela hasta un tronco que tienes
// delante, le suelta su cubo de barro y se va. Caer en un tronco embarrado resbala: se te cae un amigo (si llevas) y se
// pierde la racha; ahí no hay ¡Perfecto!.
'use strict';

const DRON = { activo: false, espera: 12, x: 0, wy: 0, lado: 1, fase: 0, t: 0, tronco: null, gota: null };
const DRON_ALTO = 34;
function reiniciaDron() { Object.assign(DRON, { activo: false, espera: 10 + Math.random() * 6, gota: null, tronco: null }); }

function avanzaDron(dt) {
  const J = JUEGO, c = J.conejo, D = DRON;
  if (D.gota) {
    D.gota.z -= dt * 70;
    if (D.gota.z <= 0) { const t = D.gota.tronco; if (RIO.troncos.includes(t)) { t.barro = true; salpica(t.x, t.wy, 10, '#9a6a40'); onda(t.x, t.wy, t.r * 0.8); } D.gota = null; }
  }
  if (!D.activo) {
    if (J.metros < 200 || tutoActivo()) return;
    D.espera -= dt;
    if (D.espera > 0) return;
    // elige un tronco libre que tengas delante
    const libres = RIO.troncos.filter(t => t.wy > c.wy + 60 && t.wy < c.wy + 200 && !t.amigo && !t.barro && t !== c.tronco);
    if (!libres.length) { D.espera = 2; return; }
    const t = libres[Math.floor(Math.random() * libres.length)];
    D.lado = Math.random() < 0.5 ? -1 : 1;
    Object.assign(D, { activo: true, fase: 0, t: 0, tronco: t, x: D.lado < 0 ? -30 : PAN.W + 30, wy: t.wy });
    SONIDO.dron();
    return;
  }
  D.t += dt;
  const t = D.tronco, vivo = RIO.troncos.includes(t);
  if (D.fase === 0) {                       // va hacia el tronco
    const ob = vivo ? t.x : PAN.W / 2;
    D.x += (ob - D.x) * Math.min(1, dt * 2.6); if (vivo) D.wy += (t.wy - D.wy) * Math.min(1, dt * 3);
    if (Math.abs(ob - D.x) < 2 || D.t > 2.4) { D.fase = 1; D.t = 0; }
  } else if (D.fase === 1) {                // suelta el barro
    if (vivo) { D.x = t.x; D.wy = t.wy; }
    if (D.t > 0.35) { if (vivo) D.gota = { tronco: t, z: 12 }; D.fase = 2; D.t = 0; }
  } else {                                  // y se va por el otro lado
    D.x += D.lado * -1 * dt * 110; D.wy += dt * 20;
    if (D.x < -40 || D.x > PAN.W + 40) { D.activo = false; D.espera = Math.max(5, 13 - J.metros / 150) + Math.random() * 5; }
  }
}
function pintaDron(t) {
  const D = DRON;
  if (D.gota && RIO.troncos.includes(D.gota.tronco)) { const g = D.gota, y = pantY(g.tronco.wy) - g.z; elipse(g.tronco.x, y, 3.2, 3.8, vol(g.tronco.x, y, 3.2, 3.8, '#8a5530'), '#4a2a14', 0.6); }
  if (!D.activo) return;
  const y = pantY(D.wy);
  elipse(D.x + 4, y + 2, 15, 5, 'rgba(30,70,80,0.25)', null);
  sprite('dron' + Math.floor(t * 20) % 2, D.x, y - DRON_ALTO + 24 + Math.sin(t * 6) * 1.5, 16, D.fase === 0 ? -D.lado * -0.12 : D.fase === 2 ? D.lado * 0.15 : 0);
}
// el barro encima de un tronco embarrado
function pintaBarroTronco(tr, y) {
  blanda([tr.x - tr.r * 0.55, y - 1, tr.x - tr.r * 0.2, y - tr.r * 0.35, tr.x + tr.r * 0.3, y - tr.r * 0.3, tr.x + tr.r * 0.6, y - 0.5, tr.x + tr.r * 0.2, y + tr.r * 0.2, tr.x - tr.r * 0.35, y + tr.r * 0.18], COL_RIO.barro, COL_RIO.barroO, 0.8);
  elipse(tr.x - tr.r * 0.15, y - tr.r * 0.12, tr.r * 0.14, tr.r * 0.06, 'rgba(255,255,255,0.35)', null);
}
