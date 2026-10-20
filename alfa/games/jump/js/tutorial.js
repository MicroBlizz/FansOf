// Fans of Jump · El tutorial de Lola: la primera partida va guiada en 4 pasos (saltar, caer en el centro, rescatar a un
// amigo y huir de la ola). Mientras dura, la ola espera y caer al agua no acaba la partida: vuelves al último tronco.
// Los primeros troncos están puestos a mano (TUTO_RIO). Sale solo una vez (GUARDA.tuto) y se repite desde la hoja de
// reclamaciones. Lola habla en una ficha de carpeta arriba de la pantalla.
'use strict';

const TUTO = { paso: -1, t: 0, intentos: 0, troncos: [] };
// los primeros troncos del río del tutorial: [cuánto se aparta a un lado, altura, radio, qué lleva]
const TUTO_RIO = [[0, 62, 25, null], [26, 124, 25, 'zanas'], [-6, 188, 25, 'ardilla']];
const TUTO_PASOS = [
  '¡Hola, soy Lola! Microblizz me despidió y ahora os ayudo. Tira del conejo hacia abajo y suelta para saltar al tronco.',
  '¡Muy bien! Ahora intenta caer justo en el centro del tronco: con un ¡Perfecto!, Microblizz pierde más.',
  '¡MadSquirrel está atrapado en el barro! Salta a su tronco para rescatarlo y llevarlo a cuestas.',
  '¡Que viene la ola de barro! Corre río arriba y no mires atrás. ¡Suerte!',
];
const tutoActivo = () => TUTO.paso >= 0;
// la ola espera hasta el último paso
const tutoFrena = () => TUTO.paso >= 0 && TUTO.paso < 3;

// al empezar una partida: el tutorial va si aún no lo has hecho
function preparaTuto() {
  TUTO.paso = GUARDA.tuto ? -1 : 0; TUTO.t = 0; TUTO.intentos = 0; TUTO.troncos = [];
  return tutoActivo() ? TUTO_RIO : null;
}
function pasoTuto(n) {
  TUTO.paso = n; TUTO.t = 0; TUTO.intentos = 0;
  if (n === 3) { GUARDA.tuto = true; JUEGO.tutoHecho = true; salvaGuarda(); bandera(tr('¡Corre!'), PASTEL.melocoton); }
  else SONIDO.boton();
}
// cada vez que cae en un tronco
function tutoCae(perfecto, rescate) {
  if (!tutoActivo() || TUTO.paso >= 3) return;
  if (TUTO.paso === 0) return pasoTuto(rescate ? 3 : 1);
  if (TUTO.paso === 1) { TUTO.intentos++; if (rescate) return pasoTuto(3); if (perfecto || TUTO.intentos >= 2) return pasoTuto(2); return; }
  if (TUTO.paso === 2 && rescate) pasoTuto(3);
}
// al agua durante el tutorial: Lola te saca y vuelves al último tronco
function tutoAgua() {
  if (!tutoFrena()) return false;
  const c = JUEGO.conejo, t = c.ultimo && RIO.troncos.includes(c.ultimo) ? c.ultimo : RIO.troncos[0];
  onda(c.x, c.wy, 8); salpica(c.x, c.wy, 10, 'rgba(255,255,255,0.95)');
  Object.assign(c, { tronco: t, ox: 0, owy: 0, x: t.x, wy: t.wy, cae: 1 }); JUEGO.enTronco = 0;
  aviso(tr('¡Otra vez!'), c.x, c.wy + 30, '#9fe3ff', 10); SONIDO.uy();
  return true;
}
function avanzaTuto(dt) {
  if (!tutoActivo()) return;
  TUTO.t += dt;
  if (TUTO.paso === 3 && TUTO.t > 4.5) TUTO.paso = -1;
}

// a qué tronco apunta la flecha en cada paso
function troncoTuto() {
  if (TUTO.paso === 0 || TUTO.paso === 1) {
    const c = JUEGO.conejo, base = c.tronco ? c.tronco.wy : c.wy;
    return TUTO.troncos.find(t => t.wy > base + 10 && !t.amigo) || null;
  }
  if (TUTO.paso === 2) return TUTO.troncos.find(t => t.amigo) || RIO.troncos.find(t => t.amigo && t.wy > JUEGO.conejo.wy) || null;
  return null;
}
// la flecha que bota encima del tronco (y en el paso del centro, el círculo del ¡Perfecto!)
function pintaGuiaTuto(t) {
  if (!tutoFrena() || JUEGO.conejo.salto || PANEL.abierto) return;
  const o = troncoTuto(); if (!o) return;
  const x = o.x, y = pantY(o.wy), b = Math.abs(Math.sin(t * 5)) * 4;
  if (TUTO.paso === 1) {
    G.setLineDash([2, 2]);
    G.beginPath(); G.ellipse(x, y - 1, o.r * CENTRO_PERFECTO * 1.25, o.r * CENTRO_PERFECTO * APLASTA * 1.25, 0, 0, Math.PI * 2);
    G.lineWidth = 1.2; G.strokeStyle = 'rgba(255,255,255,0.95)'; G.stroke(); G.setLineDash([]);
  }
  const ya = y - o.r * 0.6 - 16 - b;
  forma([x - 6, ya - 5, x + 6, ya - 5, x, ya + 4], vol(x, ya - 2, 7, 6, PASTEL.melocoton), OLC, 0.9);
}

// la ficha de Lola: pestaña con su nombre, hoja de papel y los puntitos de los pasos
function pintaTuto(t) {
  if (!tutoActivo() || PANEL.abierto || JUEGO.modo === 'fin') return;
  const W = PAN.W, x = 18, w = W - 36, menu = JUEGO.modo === 'menu';
  const ls = envuelve(tr(TUTO_PASOS[TUTO.paso]), w - 18, 7.6), h = 14 + ls.length * 9.5;
  const e = Math.min(1, TUTO.t / 0.25), sale = TUTO.paso === 3 ? Math.min(1, Math.max(0, (4.5 - TUTO.t) / 0.3)) : 1;
  const y = (menu ? 90 : 56) - (1 - e) * 10;
  G.globalAlpha = e * sale;
  const nom = 'LOLA', nw = anchoLetras(nom, 9, { logo: true }) + 14, sub = tr('despedida por Microblizz');
  caja(x + 8, y - 11, nw, 14, [4, 4, 0, 0], PASTEL.melocoton, OLC, 0.9);
  letras(nom, x + 8 + nw / 2, y - 3.6, 9, '#ffffff', { logo: true, borde: OLC, bw: 2.2 });
  letras(sub, x + 12 + nw, y - 4, 6, '#ffffff', { alin: 'left', borde: OLC, bw: 2, peso: 700 });
  caja(x + 1.5, y + 2.5, w, h, 5, 'rgba(40,25,60,0.32)', null);
  caja(x, y, w, h, 5, PASTEL.papel, OLC, 0.9);
  ls.forEach((l, i) => letras(l, x + 9, y + 10 + i * 9.5, 7.6, PASTEL.texto, { alin: 'left', peso: 700 }));
  for (let i = 0; i < 4; i++) elipse(x + w - 26 + i * 6, y + h - 5, 1.6, 1.6, i <= TUTO.paso ? PASTEL.melocoton : PASTEL.raya, i <= TUTO.paso ? PASTEL.melocotonO : null, 0.5);
  G.globalAlpha = 1;
}
