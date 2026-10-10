// Fans of Tactics Advance (prototipo) · INTERFAZ: dónde va cada ventana (la misma cuenta sirve para pintarla y para saber qué
// se ha tocado) y cómo se pinta: fichas, menú de órdenes, técnicas, botón de abajo, cartel del turno, bocadillos y el final.
'use strict';

const MENU_X = 238, MENU_Y = 96, SUB_Y = 58, BOTON_Y = 141;
const dentro = (r, x, y) => r && x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
function geoMenu(items, xDer, y) {
  const w = 26 + Math.max(...items.map(i => anchoTexto(i.t))), h = 8 + items.length * 11;
  return { x: xDer - w, y, w, h, filas: items.map((_, i) => ({ x: xDer - w, y: y + 4 + i * 11, w, h: 11 })) };
}
function geoSub(items, xDer, y) {
  const nombres = Math.max(...items.map(i => anchoTexto(i.t))), costes = Math.max(...items.map(i => anchoMini(i.coste)));
  const w = 15 + nombres + 10 + costes + 8, h = 8 + items.length * 11;
  return { x: xDer - w, y, w, h, filas: items.map((_, i) => ({ x: xDer - w, y: y + 4 + i * 11, w, h: 11 })) };
}
const geoBoton = (t, xDer, y) => { const w = anchoTexto(t) + 18; return { x: xDer - w, y, w, h: 17 }; };
const geoFin = () => ({ x: 30, y: 44, w: 180, h: 66 });
const geoOtraVez = () => { const t = tr('Otra vez'), w = anchoTexto(t) + 18; return { x: 120 - Math.floor(w / 2), y: 88, w, h: 17 }; };

function pintaMenu(items, g, activo, t) {
  ventana(lc, g.x, g.y, g.w, g.h);
  items.forEach((it, i) => escribe(lc, it.t, g.x + 15, g.y + 6 + i * 11, !it.ok ? '#7d8cc0' : i === activo ? '#ffffff' : '#d8e2ff'));
  if (activo >= 0) lc.drawImage(MANO, g.x + 2 + (Math.floor(t * 4) % 2), g.y + 5 + activo * 11);
}
function pintaSub(items, g, activo, t) {
  ventana(lc, g.x, g.y, g.w, g.h);
  items.forEach((it, i) => {
    escribe(lc, it.t, g.x + 15, g.y + 6 + i * 11, !it.ok ? '#7d8cc0' : i === activo ? '#ffffff' : '#d8e2ff');
    escribeMini(lc, it.coste, g.x + g.w - 6, g.y + 7 + i * 11, it.ok ? '#e8b8ff' : '#8a7cb0', '#101438', 'der');
  });
  if (activo >= 0) lc.drawImage(MANO, g.x + 2 + (Math.floor(t * 4) % 2), g.y + 5 + activo * 11);
}
function pintaBoton(t, g, tono) {
  ventana(lc, g.x, g.y, g.w, g.h, tono);
  escribe(lc, t, g.x + 9, g.y + 5);
}
// la ficha de un personaje: CrazyBunny con su retrato grande; los demás, la pequeña
function pintaFicha(u, abajo, extra) {
  const T = TIPOS_U[u.tipo];
  const d = { nombre: tr(T.nombre), clase: tr(T.clase), vida: u.vida, vidaMax: u.vidaMax, vidaVista: Math.max(0, u.vidaVista), caos: u.caos, caosMax: u.caosMax, extra };
  if (u.tipo === 'conejo' && abajo && !extra) { ficha(lc, 2, 108, { ...d, retrato: RETRATO_B, nombre: 'CrazyBunny', nivel: 12 }); return; }
  d.retrato = spr(u.tipo, {}, { espejo: u.eq === 'e' });
  d.tono = u.eq === 'a' ? 'azul' : 'rojo';
  if (abajo) { d.izq = 2; d.abajo = 158; fichaObjetivo(lc, 0, 0, d); } else fichaObjetivo(lc, 238, 21, d);
}
function bannerTexto(k, texto, tono) {
  const entra = suave(Math.min(1, k / 0.22)), sale = suave(Math.max(0, (k - 0.8) / 0.2));
  const w = 20 + anchoTexto(texto), x = Math.round((LW - w) / 2 + (1 - entra) * -170 + sale * 170), y = 66;
  ventana(lc, x, y, w, 19, tono);
  escribe(lc, texto, x + 10, y + 6, '#ffe27a');
}

function pintaUI(t) {
  norma(lc, 2, 2, tr(ESC.norma));
  ventana(lc, 196, 2, 42, 15);
  escribeMini(lc, tr('TURNO {n}').replace('{n}', J.ronda), 217, 7, '#ffffff', '#101438', 'centro');
  if (J.fichaA && (J.fichaA.vivo || J.fichaA.muere)) pintaFicha(J.fichaA, true);
  if (J.fichaE && (J.fichaE.vivo || J.fichaE.muere)) {
    const p = J.previa && J.previa.o === J.fichaE ? tr('ACIERTO {a}%  DAÑO {d}').replace('{a}', J.previa.acierto).replace('{d}', J.previa.dano) : null;
    pintaFicha(J.fichaE, false, p);
  }
  for (const b of J.bocadillos) {
    const x = Math.round(CAM.x + b.x), y = Math.round(CAM.y + b.y), w = 12 + Math.max(...b.lineas.map(l => anchoTexto(l)));
    bocadillo(lc, Math.max(4, Math.min(LW - w - 4, x - 30)), Math.max(20, y - 8 - b.lineas.length * 10), b.lineas, x - 2, y);
  }
  if (J.menu) pintaMenu(J.menu, geoMenu(J.menu, MENU_X, MENU_Y), J.menuActivo, t);
  if (J.sub) pintaSub(J.sub, geoSub(J.sub, MENU_X, SUB_Y), J.subActivo, t);
  if (J.boton && !J.ocupado) pintaBoton(J.boton.t, geoBoton(J.boton.t, MENU_X, BOTON_Y), J.boton.tono);
  if (J.banner) bannerTexto(J.banner.t / J.banner.dura, J.banner.texto, J.banner.tono);
  if (J.fin) {
    const g = geoFin();
    ventana(lc, g.x, g.y, g.w, g.h, J.fin.tono);
    escribe(lc, J.fin.titulo, 120, g.y + 8, '#ffe27a', '#101438', 'centro');
    J.fin.lineas.forEach((l, i) => escribe(lc, l, 120, g.y + 21 + i * 10, '#ffffff', '#101438', 'centro'));
    pintaBoton(tr('Otra vez'), geoOtraVez(), 'azul');
  }
}
