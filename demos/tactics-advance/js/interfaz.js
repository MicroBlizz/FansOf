// Fans of Tactics Advance (prototipo) · INTERFAZ: las ventanas de la batalla, pegadas a los bordes de la pantalla (fichas,
// menú de órdenes, técnicas, botones de pausa y zoom, cartel del turno, bocadillos y pista) en el lienzo de las ventanas (uc).
// Cada sitio se calcula con una función geo… que sirve para pintarlo y para saber qué se ha tocado.
'use strict';

const dentro = (r, x, y) => r && x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
const MENU_X = () => UW - 2, MENU_Y = () => UH - 64, SUB_Y = () => UH - 102, BOTON_Y = () => UH - 19;
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
// los botones pequeños de abajo a la izquierda (encima de la ficha): pausa, alejar y acercar
const BOTONES_PEQ = ['pausa', 'menos', 'mas'];
const geoPeq = i => ({ x: 2 + i * 18, y: UH - 72, w: 16, h: 16 });

function pintaMenu(items, g, activo, t) {
  ventana(uc, g.x, g.y, g.w, g.h);
  items.forEach((it, i) => escribe(uc, it.t, g.x + 15, g.y + 6 + i * 11, !it.ok ? '#7d8cc0' : i === activo ? '#ffffff' : '#d8e2ff'));
  if (activo >= 0) uc.drawImage(MANO, g.x + 2 + (Math.floor(t * 4) % 2), g.y + 5 + activo * 11);
}
function pintaSub(items, g, activo, t) {
  ventana(uc, g.x, g.y, g.w, g.h);
  items.forEach((it, i) => {
    escribe(uc, it.t, g.x + 15, g.y + 6 + i * 11, !it.ok ? '#7d8cc0' : i === activo ? '#ffffff' : '#d8e2ff');
    escribeMini(uc, it.coste, g.x + g.w - 6, g.y + 7 + i * 11, it.ok ? '#e8b8ff' : '#8a7cb0', '#101438', 'der');
  });
  if (activo >= 0) uc.drawImage(MANO, g.x + 2 + (Math.floor(t * 4) % 2), g.y + 5 + activo * 11);
}
function pintaBoton(t, g, tono) {
  ventana(uc, g.x, g.y, g.w, g.h, tono);
  escribe(uc, t, g.x + 9, g.y + 5);
}
// icono de cada botón pequeño, dibujado a mano
const ICONOS = {
  pausa: hazSello(['.......', 'wwwwwww', '.......', 'wwwwwww', '.......', 'wwwwwww'], { w: '#ffffff' }),
  menos: hazSello(['.......', '.......', 'wwwwwww', 'wwwwwww'], { w: '#ffffff' }),
  mas: hazSello(['..ww...', '..ww...', 'wwwwww.', 'wwwwww.', '..ww...', '..ww...'], { w: '#ffffff' }),
};
function pintaPeq() {
  BOTONES_PEQ.forEach((n, i) => {
    const g = geoPeq(i), apagado = (n === 'menos' && !puedeZoom(-1)) || (n === 'mas' && !puedeZoom(1));
    ventana(uc, g.x, g.y, g.w, g.h, 'oscuro');
    uc.globalAlpha = apagado ? 0.35 : 1;
    uc.drawImage(ICONOS[n], g.x + 5, g.y + (n === 'menos' ? 7 : 5));
    uc.globalAlpha = 1;
  });
}
// la ficha de un personaje: CrazyBunny con su retrato grande; los demás, la pequeña
function pintaFicha(u, abajo, extra) {
  const T = TIPOS_U[u.tipo];
  const d = { nombre: tr(T.nombre), clase: tr(T.clase), vida: u.vida, vidaMax: u.vidaMax, vidaVista: Math.max(0, u.vidaVista), caos: u.caos, caosMax: u.caosMax, extra };
  if (u.tipo === 'conejo' && abajo && !extra) { ficha(uc, 2, UH - 52, { ...d, retrato: RETRATO_B, nombre: 'CrazyBunny', nivel: 12 }); return; }
  d.retrato = spr(u.tipo, {}, { espejo: u.eq === 'e' });
  d.tono = u.eq === 'a' ? 'azul' : 'rojo';
  if (abajo) { d.izq = 2; d.abajo = UH - 2; fichaObjetivo(uc, 0, 0, d); } else fichaObjetivo(uc, UW - 2, 21, d);
}
function bannerTexto(k, texto, tono) {
  const entra = suave(Math.min(1, k / 0.22)), sale = suave(Math.max(0, (k - 0.8) / 0.2));
  const w = 20 + anchoTexto(texto), x = Math.round((UW - w) / 2 + (1 - entra) * -(UW / 2 + w) + sale * (UW / 2 + w)), y = Math.round(UH / 2) - 14;
  ventana(uc, x, y, w, 19, tono);
  escribe(uc, texto, x + 10, y + 6, '#ffe27a');
}
// de un punto del mundo a un punto de las ventanas (cada uno tiene su tamaño de píxel)
const aUI = (x, y) => [Math.round((CAM.x + x) * ESC_MUNDO / ESC_UI), Math.round((CAM.y + y) * ESC_MUNDO / ESC_UI)];

function pintaUI(t) {
  norma(uc, 2, 2, tr(ESC.norma));
  ventana(uc, UW - 44, 2, 42, 15);
  escribeMini(uc, tr('TURNO {n}').replace('{n}', J.ronda), UW - 23, 7, '#ffffff', '#101438', 'centro');
  if (J.pista && !J.fin && !J.banner) {
    const w = anchoTexto(J.pista) + 12;
    ventana(uc, 2, 21, w, 15, 'oscuro');
    escribe(uc, J.pista, 8, 25, '#d8e2ff');
  }
  if (J.fichaA && (J.fichaA.vivo || J.fichaA.muere)) pintaFicha(J.fichaA, true);
  if (J.fichaE && (J.fichaE.vivo || J.fichaE.muere)) {
    const p = J.previa && J.previa.o === J.fichaE ? tr('ACIERTO {a}%  DAÑO {d}').replace('{a}', J.previa.acierto).replace('{d}', J.previa.dano) : null;
    pintaFicha(J.fichaE, false, p);
  }
  for (const b of J.bocadillos) {
    const [x, y] = aUI(b.x, b.y), w = 12 + Math.max(...b.lineas.map(l => anchoTexto(l)));
    bocadillo(uc, Math.max(4, Math.min(UW - w - 4, x - 30)), Math.max(20, y - 8 - b.lineas.length * 10), b.lineas, x - 2, y);
  }
  if (J.fase !== 'fin') pintaPeq();
  if (J.menu) pintaMenu(J.menu, geoMenu(J.menu, MENU_X(), MENU_Y()), J.menuActivo, t);
  if (J.sub) pintaSub(J.sub, geoSub(J.sub, MENU_X(), SUB_Y()), J.subActivo, t);
  if (J.boton && !J.ocupado) pintaBoton(J.boton.t, geoBoton(J.boton.t, MENU_X(), BOTON_Y()), J.boton.tono);
  if (J.banner) bannerTexto(J.banner.t / J.banner.dura, J.banner.texto, J.banner.tono);
}
