// Fans of Tactics Advance (prototipo) · PANTALLAS: el menú principal con el logo, elegir batalla, cómo se juega, opciones,
// la pausa y el final de la batalla. Todas son una ventana centrada con título, texto y una lista de opciones con la manita.
'use strict';

let PANT = null;   // la pantalla abierta (null = se está jugando)
function abre(p) { PANT = { activo: 0, ...p }; PANT.activo = Math.max(0, PANT.items.findIndex(i => i.ok !== false)); }
function cierra() { PANT = null; }

// texto grande con borde, guardado (el logo y los títulos)
const GRANDES = new Map();
function textoGrande(t, color, escala, borde = '#1c1028') {
  const k = t + color + escala + borde;
  if (GRANDES.has(k)) return GRANDES.get(k);
  const w = anchoTexto(t) + 4, h = 13, base = lienzoNuevo(w, h), g = base.getContext('2d');
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1], [1, 2], [0, 2], [2, 2], [2, 1]]) escribe(g, t, 2 + dx, 3 + dy, borde, null);
  escribe(g, t, 2, 3, color, null);
  const c = lienzoNuevo(w * escala, h * escala), gc = c.getContext('2d');
  gc.imageSmoothingEnabled = false; gc.drawImage(base, 0, 0, w * escala, h * escala);
  GRANDES.set(k, c);
  return c;
}
// parte un texto en líneas que caben en «ancho» píxeles
function envuelve(texto, ancho) {
  const out = []; let linea = '';
  for (const p of texto.split(' ')) { const prueba = linea ? linea + ' ' + p : p; if (anchoTexto(prueba) > ancho && linea) { out.push(linea); linea = p; } else linea = prueba; }
  if (linea) out.push(linea);
  return out;
}

/* ---------- dónde va cada cosa de una pantalla ---------- */
// el tamaño de la ventana (las del menú principal se colocan al lado de la isla del título: ver intro.js)
function tamPantalla(P) {
  const lineas = (P.texto || []).flatMap(t => t === '' ? [''] : envuelve(t, Math.min(UW - 30, 260)));
  const anchos = [P.titulo ? anchoTexto(P.titulo) : 0, ...lineas.map(l => anchoTexto(l)), ...P.items.map(i => anchoTexto(i.t) + 14)];
  const w = Math.min(UW - 8, Math.max(...anchos) + 28), h = (P.titulo ? 16 : 6) + lineas.length * 10 + (lineas.length ? 6 : 0) + P.items.length * 12 + 6;
  return { w, h, lineas };
}
function geoPantalla(P) {
  const { w, h, lineas } = tamPantalla(P);
  let x = Math.round((UW - w) / 2), y = Math.round((UH - h) / 2);
  if (P.logo) { const g = geoTitulo({ w, h }); x = g.mx; y = g.my; }
  const y0 = y + (P.titulo ? 16 : 6) + lineas.length * 10 + (lineas.length ? 6 : 0);
  return { x, y, w, h, lineas, filas: P.items.map((_, i) => ({ x, y: y0 + i * 12 - 2, w, h: 12 })) };
}
function pintaPantalla(t) {
  const P = PANT, g = geoPantalla(P);
  if (!P.logo) { uc.globalAlpha = 0.5; uc.fillStyle = '#0c0818'; uc.fillRect(0, 0, UW, UH); uc.globalAlpha = 1; }
  ventana(uc, g.x, g.y, g.w, g.h, P.tono || 'azul');
  let y = g.y + 5;
  if (P.titulo) { escribe(uc, P.titulo, Math.round(g.x + g.w / 2), y, '#ffe27a', '#101438', 'centro'); y += 16; }
  for (const l of g.lineas) { escribe(uc, l, g.x + 12, y, '#e8eeff'); y += 10; }
  P.items.forEach((it, i) => {
    const f = g.filas[i];
    escribe(uc, it.t, f.x + 22, f.y + 3, it.ok === false ? '#7d8cc0' : i === P.activo ? '#ffffff' : '#d8e2ff');
    if (it.nuevo) { const nx = f.x + 26 + anchoTexto(it.t); uc.fillStyle = '#c81e3a'; uc.fillRect(nx, f.y + 2, anchoMini(it.nuevo) + 4, 8); escribeMini(uc, it.nuevo, nx + 2, f.y + 3, '#ffffff'); }
  });
  uc.drawImage(MANO, g.x + 6 + (Math.floor(t * 4) % 2), g.filas[P.activo].y + 2);
}

/* ---------- las pantallas ---------- */
function menuPrincipal() {
  if (J.fase !== 'titulo') pantallaTitulo();
  TUT = null; TITULO.etapa = 'menu';
  const tut = VISTO.leer('tutorial');
  abre({ logo: true, items: [
    { t: tr('Jugar'), f: elegirBatalla },
    { t: tr('Tutorial'), f: empiezaTutorial, nuevo: tut ? null : tr('NUEVO') },
    { t: tr('Opciones'), f: () => opciones(menuPrincipal) },
    { t: tr('Biblioteca'), f: () => { location.href = '../../#biblioteca'; } },
  ] });
  if (!tut) PANT.activo = 1;
}
function elegirBatalla() {
  abre({ titulo: tr('Elige la batalla'), items: [
    { t: tr('Cementerio de juegos'), f: () => { cierra(); empieza('cementerio'); } },
    { t: tr('Oficinas de Microblizz'), f: () => { cierra(); empieza('oficinas'); } },
    { t: tr('Volver'), f: menuPrincipal },
  ] });
}
function ayuda(volver) {
  abre({ titulo: tr('Cómo se juega'), texto: [
    tr('Toca a CrazyBunny o a EpicChampion y elige: Mover, Atacar, Técnica o Esperar.'),
    tr('Para atacar, toca al enemigo una vez para ver el acierto y otra para confirmar.'),
    tr('Desde más alto aciertas más y pegas más fuerte. Las técnicas gastan CAOS.'),
    tr('Zoom: pellizca con dos dedos, usa la rueda o los botones + y −. Arrastra para mover la cámara.'),
  ], items: [{ t: tr('Volver'), f: volver }] });
}
function opciones(volver) {
  const pantalla = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  abre({ titulo: tr('Opciones'), items: [
    { t: tr('Idioma: Español'), f: () => cambiaIdioma(IDIOMA_TA === 'es' ? 'en' : 'es') },
    ...(pantalla ? [{ t: tr('Pantalla completa'), f: pantallaCompleta }] : []),
    { t: tr('Ver la presentación'), f: presentacion },
    { t: tr('Volver'), f: volver },
  ] });
}
function pausa() {
  abre({ titulo: tr('Pausa'), pausa: true, items: [
    { t: tr('Seguir'), f: cierra },
    { t: tr('Empezar de nuevo'), f: () => { if (TUT) empiezaTutorial(); else { cierra(); empieza(NOMBRE_ESC); } } },
    { t: tr('Cambiar de batalla'), f: elegirBatalla },
    { t: tr('Cómo se juega'), f: () => ayuda(pausa) },
    { t: tr('Opciones'), f: () => opciones(pausa) },
    { t: tr('Menú principal'), f: menuPrincipal },
  ] });
}
function final(gana) {
  abre({ titulo: gana ? tr('¡Victoria!') : tr('¡Te han despedido!'), tono: gana ? 'azul' : 'rojo',
    texto: gana ? [tr('Microblizz tendrá que contratar más becarios.')] : [tr('Microblizz te agradece los servicios prestados.')],
    items: [
      { t: tr('Otra vez'), f: () => { cierra(); empieza(NOMBRE_ESC); } },
      { t: tr('Cambiar de batalla'), f: elegirBatalla },
      { t: tr('Menú principal'), f: menuPrincipal },
    ] });
}
function cambiaIdioma(i) { try { localStorage.setItem('fansof-idioma', i); } catch (_) { /* sin guardar */ } location.href = location.pathname; }
function pantallaCompleta() {
  try {
    const d = document;
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else { const el = d.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }
  } catch (_) { /* este navegador no deja */ }
}
// tocar o pulsar en una pantalla
function tocaPantalla(x, y) {
  const g = geoPantalla(PANT), i = g.filas.findIndex(f => dentro(f, x, y));
  if (i >= 0 && PANT.items[i].ok !== false) { PANT.activo = i; PANT.items[i].f(); }
}
function pasaPantalla(x, y) {
  const g = geoPantalla(PANT), i = g.filas.findIndex(f => dentro(f, x, y));
  if (i >= 0 && PANT.items[i].ok !== false) PANT.activo = i;
}
function teclaPantalla(k) {
  const n = PANT.items.length;
  if (k === 'ArrowDown' || k === 'ArrowUp') { const d = k === 'ArrowDown' ? 1 : -1; let i = PANT.activo; do { i = (i + d + n) % n; } while (PANT.items[i].ok === false); PANT.activo = i; return true; }
  if (k === 'Enter' || k === ' ') { PANT.items[PANT.activo].f(); return true; }
  if (k === 'Escape') { if (PANT.pausa) cierra(); else if (!PANT.logo) { const v = PANT.items[n - 1]; if (v) v.f(); } return true; }
  return false;
}
