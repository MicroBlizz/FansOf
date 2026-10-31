// Fans of Goose · El marcador: todo arriba (vida, experiencia, casilla, monedas y combo; el dado y su aro de plumas, abajo a la izquierda), el mapa de las 63
// casillas en el borde derecho, los avisos grandes del centro y el jefe. La parte de abajo queda libre para jugar.
'use strict';

const BOTONES = [];   // los botones de la pantalla actual: { x, y, w, h, accion } (se rehacen en cada fotograma)
const FUENTE_G = '"Pirata One", "Jersey 15", serif';
const FUENTE = '"Jersey 15", system-ui, sans-serif';   // letra de píxel que se lee pequeña (la Pixelify Sans salía a bultos)

// LETRAS DE PÍXEL NÍTIDAS: cada texto se escribe una vez a su tamaño exacto en píxeles de verdad, se le quita el suavizado (cada
// píxel, lleno o vacío) y se le pone un contorno de un píxel; luego se pega como un sprite. Así no sale borroso al ampliar el canvas.
// Nada por debajo de TAM_MIN (se lee en el móvil) y la gótica solo en títulos grandes.
const TAM_MIN = 9,   // subió de 8 a 9 (31-10-2026, Daniel: «la letra sigo sin leerla bien a veces»)
      LETRAS = new Map();
let MIDE = null;
const fuenteDe = (tam, fuente) => (fuente === FUENTE_G && tam < 12 ? FUENTE : fuente);
function anchoTexto(t, tam, fuente = FUENTE, peso = 800) {
  if (!MIDE) MIDE = document.createElement('canvas').getContext('2d');
  const px = Math.round(Math.max(TAM_MIN, tam) * PAN.k); MIDE.font = `400 ${px}px ${fuenteDe(tam, fuente)}`;
  return MIDE.measureText(String(t)).width / PAN.k;
}
function letra(t, tam, color, fuente, peso, borde) {
  t = String(t); const k = PAN.k, px = Math.round(Math.max(TAM_MIN, tam) * k), f = fuenteDe(tam, fuente), pw = 400;   // Jersey y Pirata solo tienen un peso
  const clave = t + '|' + px + '|' + color + '|' + f + '|' + pw + '|' + (borde ? 1 : 0);
  let L = LETRAS.get(clave); if (L) return L;
  if (LETRAS.size > 900) { let n = 0; for (const c of LETRAS.keys()) { LETRAS.delete(c); if (++n >= 200) break; } }   // fuera las más viejas, no todas de golpe
  const o = borde ? Math.max(1, Math.round(px / 18)) : 0, m = 2 + o;
  if (!MIDE) MIDE = document.createElement('canvas').getContext('2d');
  MIDE.font = `${pw} ${px}px ${f}`;
  const tw = Math.ceil(MIDE.measureText(t).width), w = tw + m * 2, h = Math.ceil(px * 1.45) + m * 2;
  const a = lienzo(w, h), xa = a.getContext('2d', { willReadFrequently: true });   // se lee aquí mismo: en memoria, sin esperar a la tarjeta gráfica
  xa.font = `${pw} ${px}px ${f}`; xa.textBaseline = 'middle'; xa.fillStyle = '#fff'; xa.fillText(t, m, h / 2);
  const d = xa.getImageData(0, 0, w, h); for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0; xa.putImageData(d, 0, 0);
  const tinta = col => { const c = lienzo(w, h), x = c.getContext('2d'); x.drawImage(a, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, w, h); return c; };
  const out = lienzo(w, h), xo = out.getContext('2d');
  let contorno = null; const relleno = tinta(color);
  if (o) { const osc = tinta('#120808'); contorno = lienzo(w, h); const xc = contorno.getContext('2d'); for (let dy = -o; dy <= o; dy++) for (let dx = -o; dx <= o; dx++) if (dx || dy) xc.drawImage(osc, dx, dy); xo.drawImage(contorno, 0, 0); }
  xo.drawImage(relleno, 0, 0);
  L = { c: out, w: w / k, h: h / k, tw: tw / k, m: m / k }; LETRAS.set(clave, L);
  if (t.length === 1) { L.o = contorno; L.f = relleno; }   // las cifras sueltas guardan sus dos capas para montar números
  return L;
}
// RENDIMIENTO: los números que cambian sin parar (daño, vida, tiempo, monedas) se montan con cifras sueltas ya hechas: antes cada número
// nuevo («37», «38»…) se fabricaba entero y en el móvil eso daba tirones. Primero todos los contornos y luego el color, para que no se pisen.
const NUMERO = /^[0-9 :\/x+\-.!]{2,8}$/;
function numero2(t, x, y, tam, color, alinea, fuente, peso, borde) {
  let tw = 0; const P = [];
  for (const ch of t) { const L = letra(ch, tam, color, fuente, peso, borde); P.push(L); tw += L.tw; }
  let cx = alinea === 'left' ? x : alinea === 'right' ? x - tw : x - tw / 2;
  for (let pasada = 0; pasada < 2; pasada++) {
    let xx = cx;
    for (const L of P) { const c = pasada ? L.f : L.o; if (c) G.drawImage(c, xx - L.m, y - L.h / 2, L.w, L.h); xx += L.tw; }
  }
}
function texto2(t, x, y, tam, color, alinea = 'center', fuente = FUENTE, peso = 800, borde = 0.3) {
  t = String(t); if (NUMERO.test(t)) { numero2(t, x, y, tam, color, alinea, fuente, peso, borde); return; }
  const L = letra(t, tam, color, fuente, peso, borde);
  const x0 = alinea === 'left' ? x - L.m : alinea === 'right' ? x - L.tw - L.m : x - L.tw / 2 - L.m;
  G.drawImage(L.c, x0, y - L.h / 2, L.w, L.h);
}
function caja(x, y, w, h, r, relleno, borde = '#120808', grosor = 1.5) { cajaPixel(x, y, w, h, r, relleno, borde, grosor); }   // en píxeles (js/pixel.js)
function barra(x, y, w, h, k, color, fondo = '#2a1414') {
  caja(x, y, w, h, Math.min(2, h / 2), fondo, '#120808', 1.2);
  if (k > 0) { caja(x + 1, y + 1, Math.max(1, (w - 2) * Math.min(1, k)), h - 2, 1, color, null); G.globalAlpha *= 0.35; caja(x + 1, y + 1, Math.max(1, (w - 2) * Math.min(1, k)), Math.max(0.5, (h - 2) * 0.35), 0, '#ffffff', null); G.globalAlpha /= 0.35; }
}
function boton(x, y, w, h, txt, color, accion, tam = 10, sub) {
  const pulsado = ENTRADA.botonDown && ENTRADA.bx > x && ENTRADA.bx < x + w && ENTRADA.by > y && ENTRADA.by < y + h;
  const dy = pulsado ? 1.5 : 0;
  caja(x, y + 2.5, w, h, 6, '#120808', null);
  caja(x, y + dy, w, h, 6, color, '#120808', 1.8);
  G.globalAlpha = 0.25; caja(x + 3, y + dy + 2, w - 6, h * 0.35, 4, '#ffffff', null); G.globalAlpha = 1;
  texto2(txt, x + w / 2, y + dy + h / 2 + (sub ? -3.5 : 0.5), tam, '#fff8e8', 'center', FUENTE, 800, 0.32);
  if (sub) texto2(sub, x + w / 2, y + dy + h / 2 + 6.5, 7, '#fff1c2', 'center', FUENTE, 700, 0.3);
  BOTONES.push({ x, y, w, h, accion });
}

// un botón con forma de casilla de madera del tablero (img/ui-losa.png de Yoshi, en nueve trozos para que las esquinas de hierro no se
// deformen), pintado del color de su opción y con el número de casilla pintado al fondo, como en el Juego de la Oca. Sin el dibujo, boton()
function botonLosa(x, y, w, h, txt, color, accion, tam = 10, sub, numero) {
  const im = IMG['ui-losa']; if (!im) { boton(x, y, w, h, txt, color, accion, tam, sub); return; }
  const pulsado = ENTRADA.botonDown && ENTRADA.bx > x && ENTRADA.bx < x + w && ENTRADA.by > y && ENTRADA.by < y + h, dy = pulsado ? 1.5 : 0;
  caja(x + 1, y + 3, w, h, 4, '#0a0505', null);   // la sombra de la losa
  const Y = y + dy, c = 12, cu = c / ARTE, iw = im.width, ih = im.height;
  const X0 = snap(x), Y0 = snap(Y), Wd = snap(w), Hd = snap(h);
  const pieza = (sx, sy, sw, sh, dx, dy2, dw, dh) => { if (dw > 0 && dh > 0) G.drawImage(im, sx, sy, sw, sh, dx, dy2, dw, dh); };
  pieza(0, 0, c, c, X0, Y0, cu, cu); pieza(iw - c, 0, c, c, X0 + Wd - cu, Y0, cu, cu); pieza(0, ih - c, c, c, X0, Y0 + Hd - cu, cu, cu); pieza(iw - c, ih - c, c, c, X0 + Wd - cu, Y0 + Hd - cu, cu, cu);
  pieza(c, 0, iw - c * 2, c, X0 + cu, Y0, Wd - cu * 2, cu); pieza(c, ih - c, iw - c * 2, c, X0 + cu, Y0 + Hd - cu, Wd - cu * 2, cu);
  pieza(0, c, c, ih - c * 2, X0, Y0 + cu, cu, Hd - cu * 2); pieza(iw - c, c, c, ih - c * 2, X0 + Wd - cu, Y0 + cu, cu, Hd - cu * 2);
  const mw = (iw - c * 2) / ARTE, mh = (ih - c * 2) / ARTE;
  for (let yy = Y0 + cu; yy < Y0 + Hd - cu; yy += mh) for (let xx = X0 + cu; xx < X0 + Wd - cu; xx += mw) { const dw = Math.min(mw, X0 + Wd - cu - xx), dh = Math.min(mh, Y0 + Hd - cu - yy); pieza(c, c, dw * ARTE, dh * ARTE, xx, yy, dw, dh); }
  // la pintura del color de la opción, gastada: deja ver la madera del borde
  G.globalAlpha = 0.78; caja(x + 4, Y + 4, w - 8, h - 8, 2, color, null); G.globalAlpha = 0.18; caja(x + 4, Y + 4, w - 8, (h - 8) * 0.4, 2, '#ffffff', null); G.globalAlpha = 1;
  if (numero && w >= 120) { G.globalAlpha = 0.22; texto2(String(numero), x + w - 8, Y + h / 2 + 1, Math.min(22, h * 0.8), '#1a0a04', 'right', FUENTE_G, 400, 0); G.globalAlpha = 1; }
  texto2(txt, x + w / 2, Y + h / 2 + (sub ? -3.5 : 0.5), tam, '#fff8e8', 'center', FUENTE, 800, 0.32);
  if (sub) texto2(sub, x + w / 2, Y + h / 2 + 6.5, 7, '#fff1c2', 'center', FUENTE, 700, 0.3);
  BOTONES.push({ x, y, w, h, accion });
}

function pintaHud() {
  const J = JUEGO, W = PAN.W;
  // franja de arriba
  G.globalAlpha = 0.55; G.fillStyle = '#0a0608'; G.fillRect(0, 0, W, 26); G.globalAlpha = 1;
  // pausa
  caja(4, 4, 17, 17, 5, '#e8742a'); G.fillStyle = '#fff8e8'; G.fillRect(9.5, 8.5, 2.2, 8); G.fillRect(13.5, 8.5, 2.2, 8);
  BOTONES.push({ x: 0, y: 0, w: 26, h: 26, accion: () => pausa() });
  // vida
  const kv = J.vida / J.st.vidaMax;
  barra(25, 5, 96, 8, kv, kv < 0.3 ? '#ff3b3b' : '#e0303a');
  texto2(Math.ceil(J.vida) + ' / ' + Math.round(J.st.vidaMax), 73, 9.4, 5.5, '#fff', 'center', FUENTE, 800, 0.35);
  // monedas
  pinta('moneda', W - 9, 9, false, false, 1); texto2(String(J.monedasPartida), W - 15, 9.5, 7, '#ffcf33', 'right');
  // tiempo
  const s = Math.floor(J.t); texto2(Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'), W - 46, 9.5, 6.5, '#f1e6c8', 'center', FUENTE, 700);
  // experiencia
  barra(25, 16, W - 64, 5, J.xp / J.xpNecesita, '#6bd4ff');
  texto2(tr('NV {n}', { n: J.nivel }), W - 36, 18.6, 6, '#6bd4ff', 'left');
  // el equipo bajo la vida: cada arma con su nivel (marco de oro si ha evolucionado) y debajo las mejoras pasivas, de 4 en 4
  const filas = pintaEquipo();
  // casilla o jefe
  if (J.minijefe && J.minijefe.hp > 0) { /* lo pinta pintaMinijefeHud */ }
  else if (J.jefe) {
    texto2(tr('LA OCA MADRE'), W / 2, 42, 11, '#ff4d6b', 'center', FUENTE_G, 400, 0.25);
    barra(24, 49, W - 48, 6, J.jefe.hp / J.jefe.hpMax, '#ff2d4d');
  } else {
    texto2(tr('CASILLA'), W / 2, 39, 6, '#c9b98a', 'center', FUENTE, 700);
    texto2(J.casilla + ' / ' + CFG.jardin, W / 2, 48, 12, '#f6e7b8', 'center', FUENTE_G, 400, 0.25);
    if (J.carrera) texto2(tr('{n}º', { n: J.carrera.llegada !== null ? J.carrera.puesto : puestoActual() }), W / 2 + 34, 46, 10, J.carrera.color, 'left', FUENTE_G, 400, 0.25);
  }
  pintaRelojCR();   // js/contrarreloj.js
  if (J.carrera && J.carrera.cuenta > 0) texto2(String(Math.ceil(J.carrera.cuenta)), W / 2, PAN.H * 0.42, 44 * (1 + (J.carrera.cuenta % 1) * 0.4), '#ffd34d', 'center', FUENTE_G, 400, 0.15);
  // combo
  if (J.combo >= 5) {
    const k = J.comboT / 2.2, pop = 1 + Math.max(0, (J.comboT - 2) * 2), cy = 38 + filas * 15;   // bajo el equipo
    texto2('x' + J.combo, 8, cy, 11 * pop, J.combo >= 100 ? '#ff4d6b' : J.combo >= 50 ? '#ffb04d' : '#ffd34d', 'left', FUENTE_G, 400, 0.25);
    texto2(tr('COMBO'), 9, cy + 9, 5.5, '#c9b98a', 'left', FUENTE, 700);
    G.fillStyle = '#ffd34d'; G.fillRect(8, cy + 13, 28 * k, 1.5);
  }
  pintaDado();
  pintaEscenasHud();
  pintaMinijefeHud();
  pintaTrato();
  pintaMapa();
  if (J.modo === 'juego') pintaAvisos();
}

// el equipo: casillas de 13 bajo las barras, a la izquierda (la casilla y el jefe van en el centro). Devuelve cuántas filas ocupa
function pintaEquipo() {
  const J = JUEGO, cosas = [];
  for (const id in J.armas) if (ARMAS[id]) cosas.push([ARMAS[id].icono, J.armas[id].nivel, J.armas[id].evo, ARMAS[id].color]);
  const nArmas = cosas.length;
  for (const id in J.pasivas) if (PASIVAS[id]) cosas.push([PASIVAS[id].icono, J.pasivas[id], false, '#7fd1ff']);
  let fila = 0, col = 0;
  cosas.forEach((c, i) => {
    if (i === nArmas && col) { fila++; col = 0; }   // las pasivas empiezan fila nueva
    if (col === 4) { fila++; col = 0; }
    const x = 32 + col * 15, y = 33 + fila * 15;
    caja(x - 6.5, y - 6.5, 13, 13, 3, c[2] ? '#4a2a08' : '#1c100b', c[2] ? '#ffd34d' : c[3], 1);
    icono(c[0], x, y, 6.2);
    texto2(String(c[1]), x + 6, y + 5, 5, i < nArmas ? '#ffd34d' : '#9fe0ff', 'center', FUENTE, 800, 0.4);
    col++;
  });
  return cosas.length ? fila + 1 : 0;
}

// el mapa: la columna de las 63 casillas, con las especiales, tú y el derrumbe
function pintaMapa() {
  const J = JUEGO, x = PAN.W - 4, y0 = PAN.H - 50, y1 = 70, h = y0 - y1, N = CFG.jardin;
  const yDe = t => y0 - (t - 1) / (N - 1) * h;
  G.fillStyle = 'rgba(0,0,0,.5)'; G.fillRect(x - 2, y1 - 2, 4, h + 4);
  const caida = Math.max(0, Math.min(N, -J.yD / TH));
  G.fillStyle = '#ff5a2a'; G.fillRect(x - 1.5, yDe(caida + 1), 3, y0 - yDe(caida + 1) + 1);
  for (const t in CFG.ocaSalta) { G.fillStyle = '#ffd34d'; G.fillRect(x - 2, yDe(+t) - 1, 4, 2); }
  G.fillStyle = '#7dff6b'; G.fillRect(x - 2, yDe(J.casillas.pozo) - 1, 4, 2);
  G.fillStyle = '#ffb86b'; G.fillRect(x - 2, yDe(J.casillas.posada) - 1, 4, 2);
  G.fillStyle = '#ff9b4d'; for (const t of J.casillas.puertas) G.fillRect(x - 2, yDe(t) - 1, 4, 2);
  G.fillStyle = '#ff2d2d'; G.fillRect(x - 2, yDe(CFG.muerte) - 1, 4, 2);
  G.fillStyle = '#3c7030'; G.fillRect(x - 2.5, y1 - 3, 5, 4);
  pintaRivalesMapa(yDe);
  const yy = yDe(Math.min(N, -J.yo.y / TH + 1));
  disco(x, yy, 3.2, 3.2, '#8a1e22'); disco(x, yy, 2.4, 2.4, '#fff');
}

function pintaAvisos() {
  const J = JUEGO, a = J.avisos[0]; if (!a) return;
  const k = a.t / a.dur, entra = Math.min(1, a.t * 7), sale = k > 0.82 ? (1 - k) / 0.18 : 1;
  const esc = entra < 1 ? 0.4 + entra * 0.9 : 1.3 - Math.min(0.3, (a.t - 1 / 7) * 1.5) * 1;
  G.globalAlpha = Math.max(0, sale);
  const y = PAN.H * 0.43, tam = Math.min(20, 300 / Math.max(8, a.txt.length)) * esc;
  texto2(a.txt, PAN.W / 2, y, tam, a.color, 'center', FUENTE_G, 400, 0.22);
  if (J.aviso2) texto2(J.aviso2, PAN.W / 2, y + 16, 7, '#f6e7b8', 'center', FUENTE, 700);
  G.globalAlpha = 1;
}

// el joystick flotante (aparece donde apoyas el dedo)
function pintaPalanca() {
  const E = ENTRADA; if (!E.palanca) return;
  G.globalAlpha = 0.28; disco(E.px, E.py, 22, 22, '#f6e7b8');
  G.globalAlpha = 0.6; aro(E.px, E.py, 22, 1.5, '#f6e7b8');
  G.globalAlpha = 0.9; disco(E.px + E.mx * 22, E.py + E.my * 22, 10, 10, '#120808'); disco(E.px + E.mx * 22, E.py + E.my * 22, 9, 9, '#e8742a');
  G.globalAlpha = 1;
}
