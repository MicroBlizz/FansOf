// Fans of Merge · SPRITES: dónde está la imagen de cada pieza (pintadas en Yoshi con ComfyUI) y cómo se dibuja.
// Si una imagen falta o aún no ha cargado, se dibuja un sustituto con código (forma y color de la pieza, contorno grueso),
// así el juego se puede jugar siempre (la portada no: espera a sus dibujos, ver MG_PORTADA). Cada imagen se reduce una vez al tamaño de la casilla y se guarda ya hecha.
'use strict';
const SPRITES = {
  brote: 'img/brote.png', zanahoria: 'img/zanahoria.png', huerto: 'img/huerto.png', casita: 'img/casita.png',
  madriguera: 'img/madriguera.png', torre: 'img/torre.png', palacio: 'img/palacio.png', flotante: 'img/flotante.png',
  dormido: 'img/dormido.png', cueva: 'img/cueva.png', piedra: 'img/piedra.png', roca: 'img/roca.png', cofre: 'img/cofre.png',
  zorro: 'img/zorro.png', cuervo: 'img/cuervo.png', semilla: 'img/semilla.png', topo: 'img/topo.png',
  FONDO: 'img/fondo.jpg', BUNNY: 'img/bunny.png',
  // el escenario y la interfaz, también pintados por Yoshi: suelo (textura que se repite), camino, conejito, iconos, charco y marco
  SUELO: 'img/suelo.jpg', TIERRA: 'img/tierra.jpg', ADOQUIN: 'img/adoquin.jpg', LOSA: 'img/losa.png', CONEJITO: 'img/conejito.png', RAYO: 'img/rayo.png', TIRACHINAS: 'img/tirachinas.png',
  FLECHA: 'img/flecha.png', CHARCO: 'img/charco.png', MARCO: 'img/marco.png',
  ADORNO1: 'img/adorno-hierba.png', ADORNO2: 'img/adorno-amarilla.png', ADORNO3: 'img/adorno-flor.png', ADORNO4: 'img/adorno-piedras.png', ADORNO5: 'img/adorno-hierba.png', ADORNO6: 'img/adorno-flor.png',
  CHISPA: 'img/chispa.png', HOJA: 'img/hoja.png', RELAMPAGO: 'img/relampago.png', ESTRELLA: 'img/estrella.png', TABLON: 'img/tablon.png', BOTON: 'img/boton.png', LOGO: 'img/logo.png',
};
// los detallitos del interior del camino (piedrecitas, hojas, huellas…): cada casilla lleva unos pocos al azar (ver mgDetalles en js/losetas.js)
// [nombre, tamaño en partes de casilla, si se puede girar del todo, su dibujo si no es img/detalle-<nombre>.png]
// (las flores y la matita son los adornos del borde del camino, que también quedan bien dentro)
const MG_DETALLES = [['guijarros', 0.24, 1], ['piedra', 0.17, 1], ['trebol', 0.15, 1], ['zanahoria', 0.16, 1],
  ['florecita', 0.14, 1, 'adorno-flor'], ['amarilla', 0.15, 1, 'adorno-amarilla'], ['matita', 0.17, 0, 'adorno-hierba']];
for (const [d, , , img] of MG_DETALLES) SPRITES['DET_' + d] = 'img/' + (img || 'detalle-' + d) + '.png';
const MG_IMG = {};
// Se cargan por turnos: primero lo que sale en la portada (el prado, el logo, el conejito, las piezas que caen y los botones), luego lo demás.
// Así la portada está lista antes y no se ve nada provisional. MG_PORTADA.lista se pone a true cuando ha llegado lo suyo (o a los 6 s, por si falla algo).
const MG_PORTADA = { lista: false, desde: 0, claves: ['FONDO', 'LOGO', 'BUNNY', 'brote', 'zanahoria', 'huerto', 'casita', 'madriguera', 'torre', 'palacio', 'flotante'], menus: ['boton-naranja', 'boton-verde', 'boton-azul', 'boton-rojo'] };
function mgCargaImg(src, listo) {
  return new Promise(fin => { const im = new Image(); im.decoding = 'async'; im.onload = () => { listo(im); fin(); }; im.onerror = fin; im.src = src + '?v=' + VERSION; });
}
// los dibujos de los menús en HTML: cuando uno carga, el body recibe la clase mg-img-<nombre> y merge.css lo usa en vez del dibujo de código
const mgCargaMenu = k => mgCargaImg('img/' + k + '.png', () => document.body.classList.add('mg-img-' + k));
const mgCargaSprite = k => mgCargaImg(SPRITES[k], im => { MG_IMG[k] = im; });
const mgPortadaLista = () => { if (!MG_PORTADA.lista) { MG_PORTADA.lista = true; MG_PORTADA.desde = performance.now(); document.body.classList.add('mg-listo'); } };
setTimeout(mgPortadaLista, 6000);
Promise.all([...MG_PORTADA.claves.map(mgCargaSprite), ...MG_PORTADA.menus.map(mgCargaMenu)]).then(() => {
  mgPortadaLista();
  for (const k in SPRITES) if (!MG_PORTADA.claves.includes(k)) mgCargaSprite(k);
  for (const k of ['panel', 'carta', 'nivel', 'candado']) mgCargaMenu(k);
});
const MG_CACHE = new Map();   // «tipo:tamaño» -> lienzo ya reducido
function mgSpriteListo(tipo, lado) {
  const im = MG_IMG[tipo]; if (!im) return null;
  const k = tipo + ':' + lado; let cv = MG_CACHE.get(k);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = cv.height = lado;
    const c = cv.getContext('2d'), r = Math.min(lado / im.width, lado / im.height);
    c.imageSmoothingQuality = 'high';
    c.drawImage(im, (lado - im.width * r) / 2, (lado - im.height * r) / 2, im.width * r, im.height * r);
    MG_CACHE.set(k, cv);
  }
  return cv;
}
// Dibuja la imagen `k` (si ya ha cargado) en el rectángulo dado; devuelve false si no está, para que se use el dibujo de relleno
function mgImg(c, k, x, y, w, h) {
  const im = MG_IMG[k]; if (!im) return false;
  if (Math.abs(w / h - im.width / im.height) > 0.2) { c.drawImage(im, x, y, w, h); return true; }   // apaisados (tablón, logo): tal cual
  const lado = Math.max(16, Math.round(Math.max(w, h) * mgK())), sp = mgSpriteListo(k, lado);
  c.drawImage(sp || im, x, y, w, h); return true;
}
// Dibuja la pieza `tipo` centrada en (x, y), de `t` de lado (en unidades lógicas). k = escala real de la pantalla (para la nitidez).
function mgDibujaPieza(c, tipo, x, y, t, k = 1, dorada = false) {
  if (!tipo) return;
  if (dorada) {   // la dorada: un halo que brilla detrás
    const g = c.createRadialGradient(x, y, t * 0.1, x, y, t * 0.62);
    g.addColorStop(0, 'rgba(255,236,140,.95)'); g.addColorStop(1, 'rgba(255,200,60,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, t * 0.62, 0, Math.PI * 2); c.fill();
  }
  const lado = Math.max(16, Math.round(t * k)), sp = mgSpriteListo(tipo, lado);
  if (sp) { c.drawImage(sp, x - t / 2, y - t / 2, t, t); return; }
  mgSustituto(c, tipo, x, y, t);
}
// el dibujo de relleno: una base de hierba, el cuerpo con el color de la pieza y su nombre corto
function mgSustituto(c, tipo, x, y, t) {
  const P = MG_PIEZAS[tipo] || { col: '#ccc', nombre: tipo }, n = MG_CADENA.indexOf(tipo);
  c.save(); c.translate(x, y); c.lineJoin = 'round'; c.lineWidth = Math.max(2, t * 0.05); c.strokeStyle = OL;
  const base = !['zorro', 'cuervo', 'semilla', 'flotante'].includes(tipo);
  if (base) { c.beginPath(); c.ellipse(0, t * 0.28, t * 0.4, t * 0.13, 0, 0, Math.PI * 2); c.fillStyle = '#5cbf4a'; c.fill(); c.stroke(); }
  c.fillStyle = P.col; c.beginPath();
  if (tipo === 'zorro') {   // cabeza con orejas
    c.moveTo(-t * 0.3, -t * 0.05); c.lineTo(-t * 0.26, -t * 0.36); c.lineTo(-t * 0.08, -t * 0.16); c.lineTo(t * 0.08, -t * 0.16); c.lineTo(t * 0.26, -t * 0.36); c.lineTo(t * 0.3, -t * 0.05); c.quadraticCurveTo(t * 0.2, t * 0.3, 0, t * 0.3); c.quadraticCurveTo(-t * 0.2, t * 0.3, -t * 0.3, -t * 0.05);
  } else if (tipo === 'cuervo') { c.ellipse(0, 0, t * 0.26, t * 0.3, 0, 0, Math.PI * 2); }
  else if (tipo === 'semilla') { c.moveTo(0, -t * 0.34); c.quadraticCurveTo(t * 0.3, t * 0.05, 0, t * 0.3); c.quadraticCurveTo(-t * 0.3, t * 0.05, 0, -t * 0.34); }
  else if (n >= 3 || tipo === 'cueva') {   // edificios: una casa que crece con el nivel
    const h = t * (0.28 + Math.max(0, n - 3) * 0.04), w = t * 0.3;
    c.rect(-w, t * 0.24 - h, w * 2, h); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-w - t * 0.05, t * 0.24 - h); c.lineTo(0, t * 0.24 - h - t * 0.2); c.lineTo(w + t * 0.05, t * 0.24 - h); c.closePath(); c.fillStyle = '#d4543c';
  } else { c.ellipse(0, t * 0.06, t * 0.22 + Math.max(0, n) * t * 0.02, t * 0.22, 0, 0, Math.PI * 2); }
  c.fill(); c.stroke();
  if (tipo === 'zorro' || tipo === 'cuervo') {   // ojos
    c.fillStyle = '#fff'; [-1, 1].forEach(s => { c.beginPath(); c.arc(s * t * 0.1, 0, t * 0.05, 0, Math.PI * 2); c.fill(); });
    c.fillStyle = OL; [-1, 1].forEach(s => { c.beginPath(); c.arc(s * t * 0.1, 0, t * 0.025, 0, Math.PI * 2); c.fill(); });
  }
  const nombre = tr(P.nombre), corto = nombre.length > 9 ? nombre.slice(0, 8) + '.' : nombre;
  c.font = `800 ${Math.round(t * 0.15)}px "Baloo 2", system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineWidth = Math.max(2, t * 0.04); c.strokeStyle = '#fff'; c.strokeText(corto, 0, t * 0.4); c.fillStyle = OL; c.fillText(corto, 0, t * 0.4);
  c.restore();
}
