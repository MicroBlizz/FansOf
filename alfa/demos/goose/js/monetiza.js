// Fans of Goose · CÓMO SE GANA DINERO (0.8.0, «sí a todo» de Daniel al boceto del 31-10-2026): los ANUNCIOS con premio, los HUEVOS DE
// ORO (la moneda de pago) y la pestaña TESORO de la tienda. El Pase (Camino de la Oca) está en js/pase.js.
// · Anuncios: solo con premio, solo si el jugador pulsa y nunca peleando (ADR 012). Los pone la capa común (ANUNCIOS.ver: AdMob, H5
//   o el nuestro de reserva). Mientras sale uno, la partida espera. Como en Pop y Swipe, de momento solo en la alfa y en desarrollo.
//   Sitios: revivir (una vez por partida), doblar el botín al final y dos regalos en la Posada.
// · «Sin anuncios» (con euros) no quita premios: los da al momento, sin ver el anuncio (regla de la serie, docs/core/TIENDA.md).
// · Huevos de oro: se compran con euros (o salen en el Pase). Sirven para revivir por segunda vez, el Pase Real y aspecto exclusivo.
//   Las monedas se siguen ganando solo jugando. En el Tablero del día y el Contrarreloj no se revive: sus clasificaciones tienen que ser justas.
// · Las compras con euros pasan por la ventana de core (MONEDAS.compraReal): Google Play en la app; en la web avisa de que llegarán
//   con la app; en desarrollo, compra de prueba sin cobrar. Las cifras están en CFG.dinero.
'use strict';

CFG.dinero = {
  revivir: { huevos: 20, max: 2 },         // la 2.ª vuelta a la casilla cuesta huevos (la 1.ª, un anuncio)
  paseReal: 600,                           // huevos de oro
  // los productos con euros (mismos ids que tendrán en Play Console y en la tabla `productos`)
  productos: [
    { id: 'goose_bienvenida', tipo: 'bienvenida', huevos: 300, precio: '2,99 €', una: true },
    { id: 'goose_huevos_100', tipo: 'huevos', huevos: 100, precio: '0,99 €' },
    { id: 'goose_huevos_550', tipo: 'huevos', huevos: 550, precio: '4,99 €', regalo: 10 },
    { id: 'goose_huevos_1200', tipo: 'huevos', huevos: 1200, precio: '9,99 €', regalo: 20 },
    { id: 'goose_sin_anuncios', tipo: 'sinanuncios', precio: '4,99 €', una: true },
  ],
};

// --- los anuncios ---
const ANUNCIO_G = { activo: false };   // mientras sale uno, la partida no avanza (js/principal.js)
const hayAnuncios = () => !!(typeof NUCLEO !== 'undefined' && (NUCLEO.alfa || NUCLEO.desarrollo)) && typeof ANUNCIOS !== 'undefined';
const sinAnuncios = () => !!SAVE.sinAnuncios;
// ver un anuncio y, si se ha visto entero, dar el premio (con «Sin anuncios», el premio al momento)
function verAnuncioG(sitio, premio, siNo) {
  if (sinAnuncios()) { SONIDO.boton(); premio(); return; }
  if (ANUNCIO_G.activo) return;
  ANUNCIO_G.activo = true; SONIDO.boton();
  ANUNCIOS.ver(sitio).then(r => { ANUNCIO_G.activo = false; if (r && r.visto) premio(); else if (siNo) siNo(); })
    .catch(() => { ANUNCIO_G.activo = false; if (siNo) siNo(); });
}
// el botón verde de «ver anuncio»: la tele de Yoshi a la izquierda (o el rayo de «Sin anuncios»)
function botonAnuncio(x, y, w, h, txt, accion, tam = 9) {
  boton(x, y, w, h, txt, '#3f9a3a', accion, tam, sinAnuncios() ? tr('Sin anuncios: al momento') : tr('Ver anuncio'));
  icono('anuncio', x + 14, y + h / 2, 10);
}

// --- los huevos de oro ---
const huevos = () => SAVE.huevos || 0;
function gastaHuevos(n) {
  if (huevos() < n) { toast(tr('Te faltan huevos de oro')); SONIDO.dadoMalo(); return false; }
  SAVE.huevos = huevos() - n; guarda(); return true;
}
function sumaHuevos(n) { SAVE.huevos = huevos() + n; guarda(); }
function pintaHuevos(x, y, n = huevos(), tam = 10, alinea = 'left') {   // el icono y la cifra
  const w = anchoTexto(String(n), tam);
  const xi = alinea === 'center' ? x - (w + 12) / 2 + 5 : x + 5;
  icono('huevooro', xi, y, tam);
  texto2(String(n), xi + 7, y + 0.5, tam, '#ffe27a', 'left');
}

// --- revivir: te has caído o te han comido ---
// Se ofrece al acabar la caída (js/partida.js). No en el Tablero del día ni en el Contrarreloj (tienen clasificación), ni con amigos (eso ya tiene su forma de levantarse).
function ofreceRevivir() {
  const J = JUEGO, R = CFG.dinero.revivir;
  if (J.diario || J.contrarreloj || J.carrera || (J.revividas || 0) >= R.max) return false;
  const conAnuncio = hayAnuncios() && !J.revAnuncio;
  if (!conAnuncio && !(J.revividas || 0) && !huevos()) return false;   // sin anuncios ni huevos, nada que ofrecer
  J.revivir = { t: 0, anuncio: conAnuncio }; J.modo = 'revivir'; J.muerto = 0.001;   // el héroe no se pinta mientras eliges
  return true;
}
function pintaRevivir(dt) {
  const J = JUEGO, R = J.revivir, W = PAN.W, H = PAN.H; if (!R) { J.modo = 'juego'; return; }
  R.t += dt;
  oscurece(Math.min(0.78, R.t * 2.5));
  const k = Math.min(1, R.t * 3);
  texto2(tr('¡TE HAS CAÍDO!'), W / 2, H * 0.22, 20 * (0.6 + k * 0.4), '#ff6b4d', 'center', FUENTE_G, 400, 0.2);
  texto2(tr('Casilla {n} de 63', { n: J.casilla }), W / 2, H * 0.22 + 20, 8, '#f1e6c8');
  if (R.t < 0.6) return;   // que nadie lo pulse sin querer
  const y0 = H * 0.42;
  panelMadera(16, y0 - 12, W - 32, 128);
  texto2(tr('Vuelves a la casilla con media vida'), W / 2, y0 + 2, 7, '#c9b98a');
  if (R.anuncio) botonAnuncio(26, y0 + 12, W - 52, 32, tr('VOLVER A LA CASILLA'), () => verAnuncioG('goose-revivir', () => { J.revAnuncio = true; revive(tr('¡DE VUELTA!')); }), 10);
  const yh = y0 + (R.anuncio ? 50 : 12), puede = huevos() >= CFG.dinero.revivir.huevos;
  boton(26, yh, W - 52, 32, '', puede ? '#d99a1a' : '#7a3a22', () => { if (gastaHuevos(CFG.dinero.revivir.huevos)) revive(tr('¡HUEVO DE ORO!')); }, 10);
  texto2(tr('VOLVER POR'), W / 2 - 12, yh + 13, 10, '#fff8e8', 'right');
  pintaHuevos(W / 2 - 8, yh + 13, CFG.dinero.revivir.huevos, 10);
  texto2(tr('Tienes {n}', { n: huevos() }), W / 2, yh + 25, 6.5, '#ffe9b0');
  boton(26, y0 + 92, W - 52, 20, tr('Rendirse'), '#5a3418', () => { SONIDO.boton(); J.revivir = null; terminaPartida(false); }, 9);
}
function revive(texto) {
  const J = JUEGO; if (!J.revivir) return;
  J.revivir = null; J.revividas = (J.revividas || 0) + 1; J.muerto = 0; J.modo = 'juego';
  vuelveACasilla(texto, '#ffd34d');
}

// --- doblar el botín al final (una vez) ---
function botonDoblar(F, W, y) {
  if (!hayAnuncios() || F.doblado || !F.monedas || F.t < 3.4) return false;
  botonAnuncio(30, y, W - 60, 30, tr('DOBLAR A {n}', { n: F.monedas * 2 }), () => verAnuncioG('goose-doblar', () => {
    if (F.doblado) return; F.doblado = true; SAVE.monedas += F.monedas; F.monedas *= 2; guarda(); SONIDO.moneda(); destella('#ffd34d', 0.3);
  }), 11);
  return true;
}

// --- la Posada: dos regalos con anuncio, una vez por visita ---
const POSADA_ANUNCIO = [
  { id: 'regalo', nombre: 'Regalo del posadero', desc: 'Una mejora gratis', icono: 'pack', anuncio: true },
  { id: 'repuesto', nombre: 'Dado de repuesto', desc: '+1 «¿Otra vez?» del dado en esta partida', icono: 'redado', anuncio: true },
];
const listaPosada = () => (hayAnuncios() ? [...POSADA, ...POSADA_ANUNCIO] : POSADA);
function regaloPosada(o) {
  const J = JUEGO, E = J.escena; if (!E || E.compradas[o.id]) return;
  verAnuncioG('goose-posada', () => {
    if (J.escena !== E || E.compradas[o.id]) return;
    E.compradas[o.id] = true;
    if (o.id === 'regalo') J.pendientes++;
    else { J.redado = (J.redado || 0) + 1; texto(J.yo.x, J.yo.y - 16, tr('+1 tirada'), '#ffd34d', 9, 1); }
    SONIDO.moneda();
  });
}

// --- la tienda: pestaña TESORO ---
function pintaTesoro() {
  const W = PAN.W, H = PAN.H;
  let y = 88;
  const fila = (p, alto, destacada) => {
    const comprado = p.una && SAVE.compras && SAVE.compras[p.id];
    caja(8, y, W - 16, alto, 7, destacada ? '#3a2a0c' : '#2a1610', destacada ? '#ffd34d' : '#6e4426', 1.4);
    const ic = p.tipo === 'sinanuncios' ? 'anuncio' : p.tipo === 'bienvenida' ? 'pack' : 'huevooro';
    icono(ic, 24, y + alto / 2, 13);
    const nombre = p.tipo === 'huevos' ? tr('{n} huevos de oro', { n: p.huevos }) : p.tipo === 'bienvenida' ? tr('Pack de bienvenida') : tr('Sin anuncios');
    const desc = p.tipo === 'huevos' ? (p.regalo ? tr('+{n} % de regalo', { n: p.regalo }) : tr('Para revivir, el Pase y aspecto')) : p.tipo === 'bienvenida' ? tr('{n} huevos y la Capa real. Solo una vez', { n: p.huevos }) : tr('Los premios de los anuncios, al momento');
    texto2(nombre, 40, y + 10, 8, '#fff4dc', 'left');
    parrafo(desc, 40, y + 20, W - 112, 7, '#c9b98a');
    if (comprado) texto2(tr('TUYO'), W - 38, y + alto / 2, 9, '#7dff6b');
    else boton(W - 66, y + alto / 2 - 11, 54, 22, p.precio, destacada ? '#d99a1a' : '#3f9a3a', () => compraEuros(p), 8);
    y += alto + 5;
  };
  const P = CFG.dinero.productos;
  fila(P[0], 40, true);
  P.slice(1).forEach(p => fila(p, 36, false));
  texto2(tr('Las compras con euros solo están en la app de Android'), W / 2, Math.min(H - 52, y + 6), 6.5, '#c9b98a');
}
function compraEuros(p) {
  SONIDO.boton();
  if (p.una && SAVE.compras && SAVE.compras[p.id]) return;
  if (typeof MONEDAS === 'undefined' || !MONEDAS.compraReal) return;
  const titulo = p.tipo === 'huevos' ? tr('{n} huevos de oro', { n: p.huevos }) : p.tipo === 'bienvenida' ? tr('Pack de bienvenida') : tr('Sin anuncios');
  const html = `<p>${p.tipo === 'huevos' ? tr('{n} huevos de oro por {p}.', { n: p.huevos, p: p.precio }) : p.tipo === 'bienvenida' ? tr('{n} huevos de oro y la Capa real por {p}. Solo se puede comprar una vez.', { n: p.huevos, p: p.precio }) : tr('Los premios de los anuncios te llegan al momento, sin verlos, por {p}.', { p: p.precio })}</p>`;
  MONEDAS.compraReal(titulo, html, r => {
    if (r && r.real) return;   // la de verdad la entrega el servidor (pendiente: docs/TODO.md, Goose con euros)
    entregaCompra(p.id);       // compra de prueba (solo en desarrollo)
  }, p.id);
}
// lo que da cada producto (lo llama la compra de prueba y, cuando exista, la entrega del servidor)
function entregaCompra(id) {
  const p = CFG.dinero.productos.find(q => q.id === id); if (!p) return;
  if (!SAVE.compras) SAVE.compras = {};
  SAVE.compras[id] = (SAVE.compras[id] || 0) + 1;
  if (p.tipo === 'huevos') SAVE.huevos = huevos() + p.huevos;
  else if (p.tipo === 'bienvenida') { SAVE.huevos = huevos() + p.huevos; aspecto().capas.real = 1; }
  else if (p.tipo === 'sinanuncios') SAVE.sinAnuncios = 1;
  guarda(); SONIDO.evolucion(); destella('#ffd34d', 0.35);
  toast(tr('¡Comprado! Gracias'), true);
}
