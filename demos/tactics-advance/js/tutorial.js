// Fans of Tactics Advance (prototipo) · TUTORIAL: una batalla corta (CrazyBunny contra un esqueleto) en la que Lola, despedida
// por Microblizz, explica paso a paso: elegir, mover, atacar, el turno de Microblizz, el zoom y la técnica. En cada paso solo
// se deja hacer lo que toca (TUT.deja) y la casilla buena parpadea. Los pasos avanzan con eventos del juego (tutEvento).
'use strict';

let TUT = null;
const PASOS_TUT = [
  { t: '¡Hola! Soy Lola. Microblizz me despidió del puesto de café, así que ahora te enseño a pelear por turnos.', vale: true },
  { t: 'Este es CrazyBunny. Tócalo para darle órdenes.', espera: 'elige', deja: { elegir: true }, marca: 'conejo' },
  { t: 'Elige Mover. Las casillas azules son los sitios a los que puede ir.', espera: 'modoMover', deja: { orden: 'mover' } },
  { t: 'Toca la casilla que parpadea: al lado del esqueleto y más alta que la suya.', espera: 'movido', deja: { casilla: [4, 3] }, marca: [4, 3] },
  { t: 'Ahora elige Atacar. Desde más arriba aciertas más y pegas más fuerte.', espera: 'modoAtacar', deja: { orden: 'atacar' } },
  { t: 'Toca al esqueleto una vez para ver el acierto y el daño. Tócalo otra vez para atacar.', espera: 'atacado', deja: { objetivo: true }, marca: 'enemigo' },
  { t: 'Cuando todos los tuyos han actuado, le toca a Microblizz. Paciencia: los esqueletos no cobran, pero pegan.', espera: 'tuTurno' },
  { t: 'Para el zoom, pellizca con dos dedos, usa la rueda o los botones + y −. Arrastrando mueves la cámara.', vale: true },
  { t: 'Golpeando y en cada turno se gana CAOS. Toca a CrazyBunny y elige Técnica: el Salto caótico.', espera: 'modoTecnica', deja: { elegir: true, orden: 'tecnica', tecnica: true }, marca: 'conejo' },
  { t: 'El Salto caótico llega a 3 casillas y pega casi el doble. ¡Aplasta a ese esqueleto!', espera: 'gana', deja: { elegir: true, orden: ['mover', 'atacar', 'tecnica', 'esperar'], tecnica: true, casilla: true, objetivo: true, boton: true, volver: true }, marca: 'enemigo' },
  { t: '¡Despedido! Así se hace. Ya sabes mover, atacar y usar técnicas. Ahora, a por Microblizz.', vale: true, fin: true },
];
function empiezaTutorial() {
  cierra();
  empieza('cementerio', true);
  TUT = { paso: 0 };
  const e = J.unidades.find(u => u.eq === 'e');
  if (e) { e.vida = e.vidaMax = e.vidaVista = 110; }
}
const pasoTut = () => TUT && PASOS_TUT[TUT.paso];
// ¿se puede hacer esto ahora? (fuera del tutorial, siempre)
function dejaTut(tipo, arg) {
  if (!TUT) return true;
  const d = (pasoTut() || {}).deja || {}, v = d[tipo];
  if (!v) return false;
  if (tipo === 'orden') return Array.isArray(v) ? v.includes(arg) : v === arg;
  if (tipo === 'casilla') return v === true || (v[0] === arg[0] && v[1] === arg[1]);
  return true;
}
function tutEvento(nombre) {
  const p = pasoTut();
  if (p && p.espera === nombre) { TUT.paso++; actualizaPista(); refrescaMenu(); if (J.fase === 'jugador' && !J.ocupado && !J.sel) J.boton = botonFin(); }
}
function valeTut() {
  const p = pasoTut();
  if (!p || !p.vale) return;
  if (p.fin) { VISTO.poner('tutorial'); TUT = null; return finTutorial(); }
  TUT.paso++;
  refrescaMenu(); if (J.fase === 'jugador' && !J.ocupado && !J.sel) J.boton = botonFin();
}
function finTutorial() {
  abre({ titulo: tr('Tutorial completado'), texto: [tr('Lola vuelve a su café. Microblizz no sabe lo que le espera.')], items: [
    { t: tr('Jugar una batalla'), f: elegirBatalla },
    { t: tr('Menú principal'), f: menuPrincipal },
  ] });
}
// la casilla que parpadea en este paso
function marcaTut() {
  const m = (pasoTut() || {}).marca;
  if (!m || J.ocupado) return null;
  if (m === 'conejo') { const u = J.unidades.find(x => x.tipo === 'conejo' && x.vivo); return u ? [u.gx, u.gy] : null; }
  if (m === 'enemigo') { const u = vivos('e')[0]; return u ? [u.gx, u.gy] : null; }
  return m;
}

/* ---------- la tarjeta de Lola (arriba, de color crema, como en Fans of Rumble) ---------- */
function geoLola() {
  const p = pasoTut(); if (!p) return null;
  const w = Math.min(UW - 8, 250), lineas = envuelve(tr(p.t), w - 16), h = 16 + lineas.length * 10 + (p.vale ? 18 : 2);
  const x = Math.round((UW - w) / 2), y = 20;
  const bw = anchoTexto(tr('¡Vale!')) + 18;
  return { x, y, w, h, lineas, boton: p.vale ? { x: x + w - bw - 6, y: y + h - 20, w: bw, h: 16 } : null };
}
function pintaLola(t) {
  const g = geoLola(); if (!g) return;
  ventana(uc, g.x, g.y, g.w, g.h, 'crema');
  escribeMini(uc, tr('LOLA - DESPEDIDA POR MICROBLIZZ'), g.x + 8, g.y + 6, '#a3168f');
  g.lineas.forEach((l, i) => escribe(uc, l, g.x + 8, g.y + 15 + i * 10, '#20102c', null));
  if (g.boton) {
    const b = g.boton, bota = Math.floor(t * 3) % 2;
    ventana(uc, b.x, b.y - bota, b.w, b.h, 'azul');
    escribe(uc, tr('¡Vale!'), b.x + 9, b.y + 4 - bota, '#ffe27a');
  }
}
function tocaLola(x, y) { const g = geoLola(); if (g && g.boton && dentro(g.boton, x, y)) { valeTut(); return true; } return false; }
