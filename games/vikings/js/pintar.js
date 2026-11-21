// Fans of Vikings · PINTAR LA ALDEA: el suelo (hierba, caminos y el mar, con las casillas de Yoshi), los edificios y los fans
// ordenados por altura, las barras de progreso de cada cola, los iconos que suben, la barra de arriba (oro, almacén y nivel de
// aldea), la misión de la guía y la barra de abajo (TRIBU, AUTOBÚS, OPCIONES). Las ventanas de cada edificio, en paneles.js.
'use strict';
const VK_FONDO = { cv: null, hecho: false };
const VK_FILA_AGUA = 19;
function vkHazFondo() {
  const ces = VK_IMG.cesped, cam = VK_IMG.camino;
  if (!vkLista(ces) || !vkLista(cam)) return null;
  const cv = document.createElement('canvas'); cv.width = VK_V.W; cv.height = VK_MAPA.alto;
  const c = cv.getContext('2d');
  let semilla = 7; const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  // la hierba: los tonos de la casilla de Yoshi repartidos a manchas de 2 px (sin cuadrícula que se note)
  const tonos = vkTonosHierba(ces);
  c.fillStyle = tonos[0]; c.fillRect(0, 0, cv.width, VK_FILA_AGUA * 16);
  for (let y = 0; y < VK_FILA_AGUA * 16; y += 2) for (let x = 0; x < cv.width; x += 2) {
    const r = azar();
    if (r < 0.2) { c.fillStyle = tonos[1]; c.fillRect(x, y, 2, 2); } else if (r < 0.3) { c.fillStyle = tonos[2]; c.fillRect(x, y, 2, 2); }
  }
  for (let i = 0; i < 160; i++) {   // matojos en V
    const x = Math.floor(azar() * cv.width), y = Math.floor(azar() * VK_FILA_AGUA * 16);
    c.fillStyle = tonos[3]; c.fillRect(x, y, 1, 2); c.fillRect(x + 2, y, 1, 2); c.fillRect(x + 1, y + 1, 1, 2);
    c.fillStyle = tonos[2]; c.fillRect(x + 1, y - 1, 1, 1);
  }
  // matas y flores de píxel sueltas
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(azar() * VK_V.W), y = Math.floor(azar() * (VK_FILA_AGUA * 16 - 4));
    const col = ['#3d8a2e', '#6fcf4a', '#fff4d6', '#ffd34d', '#ff8a8a'][Math.floor(azar() * 5)];
    c.fillStyle = col; c.fillRect(x, y, 1, 1);
    if (col === '#3d8a2e' || col === '#6fcf4a') { c.fillRect(x - 1, y + 1, 1, 1); c.fillRect(x + 1, y + 1, 1, 1); }
  }
  // los caminos: uno cruza la aldea de lado a lado y otro baja hasta el muelle
  const tierra = (cx, cy) => c.drawImage(cam, cx * 16, cy * 16);
  for (let x = 0; x * 16 < VK_V.W; x++) { tierra(x, 6); tierra(x, 11); }
  for (let y = 6; y < VK_FILA_AGUA; y++) tierra(6, y);
  // la orilla
  c.fillStyle = '#e8cf8a'; c.fillRect(0, VK_FILA_AGUA * 16 - 3, VK_V.W, 3);
  c.fillStyle = '#c9a862'; c.fillRect(0, VK_FILA_AGUA * 16 - 1, VK_V.W, 1);
  VK_FONDO.cv = cv; VK_FONDO.hecho = true;
  return cv;
}
// los 4 tonos de la hierba sacados de la casilla de Yoshi: el más común (base), uno más oscuro, uno más claro y el de las matas
function vkTonosHierba(im) {
  const def = ['#6cc04a', '#5cad3e', '#86d65a', '#3f8a2e'];
  try {
    const g = document.createElement('canvas').getContext('2d'); g.canvas.width = 16; g.canvas.height = 16; g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, 16, 16).data, cuenta = {};
    for (let i = 0; i < d.length; i += 4) { const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]; cuenta[k] = (cuenta[k] || 0) + 1; }
    const col = Object.keys(cuenta).map(Number).sort((a, b) => cuenta[b] - cuenta[a]);
    const luz = k => ((k >> 16) & 255) + ((k >> 8) & 255) + (k & 255);
    const hex = k => '#' + k.toString(16).padStart(6, '0');
    const base = col[0], resto = col.slice(1, 6);
    const osc = resto.filter(k => luz(k) < luz(base)).sort((a, b) => luz(b) - luz(a));
    const cla = resto.filter(k => luz(k) > luz(base)).sort((a, b) => luz(a) - luz(b));
    return [hex(base), osc[0] !== undefined ? hex(osc[0]) : def[1], cla[0] !== undefined ? hex(cla[0]) : def[2], osc[1] !== undefined ? hex(osc[osc.length - 1]) : def[3]];
  } catch (e) { return def; }
}
function vkPintaSuelo(c, t) {
  const fondo = VK_FONDO.cv || vkHazFondo();
  const oy = VK_MAPA.y0 - Math.round(VK_MAPA.camY);
  c.fillStyle = '#5aa63e'; c.fillRect(0, 0, VK_V.W, VK_V.H);
  if (fondo) c.drawImage(fondo, 0, oy);
  // el mar, con un vaivén de un píxel
  const agua = VK_IMG.agua;
  if (vkLista(agua)) {
    const d = Math.floor(t * 2) % 16;
    for (let y = VK_FILA_AGUA; y * 16 < VK_MAPA.alto + 64; y++) for (let x = -1; x * 16 < VK_V.W + 16; x++)
      c.drawImage(agua, x * 16 + (y % 2 ? d : -d) % 16, oy + y * 16);
    c.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 6; i++) { const x = (i * 41 + Math.floor(t * 6)) % VK_V.W, y = oy + VK_FILA_AGUA * 16 + 10 + (i * 23) % 40; c.fillRect(x, y, 3, 1); }
  }
}

function vkPintaAldea(c, t, dt) {
  VK_BOTONES.length = 0;
  vkPintaSuelo(c, t);
  const oy = VK_MAPA.y0 - Math.round(VK_MAPA.camY);
  // edificios y fans, de arriba abajo, para que lo de delante tape lo de detrás
  const cosas = [];
  for (const id in VK_EDIFICIOS) { const s = vkSitio(id); cosas.push({ y: s.pieY, pinta: () => vkPintaEdificio(c, id, s, oy, t) }); }
  for (const id of VK_ORDEN_FANS) { const f = VK_ALDEA.fans[id]; cosas.push({ y: f.y, pinta: () => vkPintaFanAldea(c, id, f, oy, t) }); }
  cosas.sort((a, b) => a.y - b.y).forEach(o => o.pinta());
  // los iconos de lo que se acaba de hacer
  for (const o of VK_ALDEA.flotan) {
    const y = oy + o.y - o.t * 18;
    c.globalAlpha = Math.min(1, 2 - o.t * 1.4); vkIcono(c, o.icono, o.x - 4, y); c.globalAlpha = 1;
    vkTexto(o.x + 6, y, '+' + o.n, { tam: 8, col: VK_COL.oro, negrita: true });
  }
  vkPintaBarraArriba(c, t);
  vkPintaBarraAbajo(c, t);
  if (VK_ALDEA.panel) vkPintaPanel(c, t);
  vkPintaAvisos(c);
}
function vkPintaEdificio(c, id, s, oy, t) {
  const E = VK_EDIFICIOS[id], im = VK_IMG[E.dibujo], y = oy + s.y;
  if (!vkLista(im)) return;
  const abierto = vkAbierto(id);
  c.save(); if (!abierto) c.globalAlpha = 0.55;
  // la cocina y la herrería echan humo al trabajar
  c.drawImage(im, s.x, y);
  c.restore();
  if (vkTrabajando(id) && (id === 'cocina' || id === 'herreria')) {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.7 + i / 3) % 1;
      c.fillStyle = `rgba(240,240,240,${0.7 - k * 0.7})`;
      c.fillRect(Math.round(s.x + s.w * 0.62 + Math.sin(k * 6 + i) * 3), Math.round(y + 6 - k * 22), 3, 3);
    }
  }
  vkZona('edif', s.x, y, s.w, s.h, id);
  if (!abierto) { vkCaja(c, s.pieX - 22, y + s.h / 2 - 6, 44, 12, VK_COL.tinta); vkTexto(s.pieX, y + s.h / 2, tr('Nivel {n}', { n: E.nivel }), { tam: 7, al: 'center', col: VK_COL.oro }); return; }
  // la barra de la tarea en marcha y cuántas quedan en cola
  const p = vkProgreso(id);
  if (p !== null) {
    vkBarra(c, s.pieX - 18, y - 6, 36, 5, p, VK_COL.oro);
    const n = SAVE.colas[id].length;
    if (n > 1) vkTexto(s.pieX + 21, y - 4, 'x' + n, { tam: 6, col: VK_COL.crema });
  } else if (E.recetas && !(SAVE.colas[id] || []).length) {
    // parado: un bocadillo que pide trabajo
    const bote = Math.floor(t * 3) % 2;
    vkCaja(c, s.pieX - 6, y - 10 - bote, 12, 10, VK_COL.crema);
    vkTexto(s.pieX, y - 5 - bote, '!', { tam: 7, al: 'center', col: VK_COL.naranja, negrita: true, borde: false });
  }
}
function vkPintaFanAldea(c, id, f, oy, t) {
  const ko = SAVE.fans[id].vida <= 0;
  vkPersonaje(c, id, f.x, oy + f.y, ko && f.anim !== 'andar' ? 'ko' : f.anim, f.t);
  if (ko && f.anim !== 'andar') {   // Zzz
    const k = (t * 0.8) % 1;
    vkTexto(f.x + 10, oy + f.y - 20 - k * 10, 'z', { tam: 6 + k * 3, col: VK_COL.azulClaro });
  }
}

function vkPintaBarraArriba(c, t) {
  const W = VK_V.W;
  vkCaja(c, -1, -1, W + 2, 22, '#5a3a24', '#8a5a32');
  // oro y almacén
  c.fillStyle = VK_COL.oro; c.fillRect(5, 5, 5, 5); c.fillStyle = '#b8860b'; c.fillRect(6, 9, 4, 1); c.fillRect(9, 6, 1, 4);
  vkTexto(13, 8, SAVE.oro, { tam: 8, col: VK_COL.oro, negrita: true });
  vkIcono(c, 'zanahoria', 52, 8); vkTexto(60, 8, SAVE.inv.zanahoria, { tam: 8 });
  vkIcono(c, 'pan', 84, 8); vkTexto(93, 8, SAVE.inv.pan, { tam: 8 });
  // nivel de aldea y su barra
  vkCaja(c, W - 92, 3, 18, 15, VK_COL.azul, VK_COL.azulClaro);
  vkTexto(W - 83, 11, SAVE.nivel, { tam: 8, al: 'center', negrita: true });
  vkBarra(c, W - 72, 8, 68, 6, SAVE.xp / vkXpNivel(SAVE.nivel), VK_COL.azulClaro);
  vkTexto(W - 38, 4, tr('ALDEA'), { tam: 5, al: 'center', col: VK_COL.crema });
  // la misión de la guía
  const m = vkMisionActual();
  if (m && !VK_ALDEA.panel) {
    vkCaja(c, 4, 23, W - 8, 13, 'rgba(32,20,42,0.82)');
    vkTexto(W / 2, 29.5, tr(m.texto), { tam: 6.5, al: 'center', col: VK_COL.crema });
  }
}
function vkPintaBarraAbajo(c) {
  const W = VK_V.W, H = VK_V.H, y = H - 30;
  vkCaja(c, -1, y, W + 2, 31, '#5a3a24', '#8a5a32');
  vkBoton(c, 'abre', 4, y + 5, 64, 20, tr('TRIBU'), { col: 'verde', dato: 'casa' });
  vkBoton(c, 'abre', 72, y + 5, 72, 20, tr('ASALTO'), { col: 'naranja', dato: 'autobus' });
  vkBoton(c, 'opciones', 148, y + 5, 64, 20, tr('OPCIONES'), { col: 'azul', tam: 7 });
}
function vkPintaAvisos(c) {
  VK_ALDEA.avisos.slice(-3).forEach((a, i) => {
    const y = 44 + i * 16 - Math.max(0, a.t - 2.2) * 30;
    const col = a.tipo === 'oro' ? VK_COL.oro : a.tipo === 'mal' ? VK_COL.rojoClaro : VK_COL.crema;
    vkCaja(c, 16, y - 6, VK_V.W - 32, 13, 'rgba(32,20,42,0.9)');
    vkTexto(VK_V.W / 2, y + 0.5, a.txt, { tam: 6.5, al: 'center', col });
  });
}
