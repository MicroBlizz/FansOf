// Fans of Goose · Pantallas: la portada, las cartas al subir de nivel, el cofre, la pausa y el final. Todo dibujado en el canvas;
// los botones se apuntan en BOTONES (js/hud.js) cada fotograma. La tienda y las opciones están en js/tienda.js.
'use strict';

// los iconos de las cartas (dibujados, nada de emojis)
function icono(id, x, y, s) {
  const ic = SPR['ic-' + id];
  if (ic) { pinta('ic-' + id, x, y, false, false, Math.max(1, Math.round(s * 1.6 / Math.max(ic.w, ic.h)))); return; }   // el pixel art de Yoshi, ampliado a número entero
  const sp = { cuchilla: 'cuchilla', huevo: 'huevo', dado6: 'dado6', moneda: 'moneda', pollo: 'pollo', plumon: 'xp2' }[id];
  if (sp) { pinta(sp, x, y, false, false, s / 9); return; }
  G.lineWidth = 1.6; G.strokeStyle = '#120808'; G.lineJoin = 'round'; G.lineCap = 'round';
  if (id === 'latigo') { G.strokeStyle = '#c98a3d'; G.lineWidth = 2.2; G.beginPath(); G.moveTo(x - s * 0.5, y + s * 0.5); G.quadraticCurveTo(x - s * 0.1, y - s * 0.7, x + s * 0.55, y - s * 0.1); G.stroke(); G.fillStyle = '#5a3418'; G.fillRect(x - s * 0.6, y + s * 0.35, s * 0.22, s * 0.3); }
  else if (id === 'fuerza') { G.fillStyle = '#e0303a'; G.beginPath(); G.moveTo(x - s * 0.15, y - s * 0.55); G.lineTo(x + s * 0.15, y - s * 0.55); G.lineTo(x + s * 0.1, y + s * 0.2); G.lineTo(x - s * 0.1, y + s * 0.2); G.closePath(); G.fill(); G.stroke(); G.fillStyle = '#c98a3d'; G.fillRect(x - s * 0.35, y + s * 0.18, s * 0.7, s * 0.14); G.fillRect(x - s * 0.07, y + s * 0.3, s * 0.14, s * 0.3); }
  else if (id === 'prisa') { G.fillStyle = '#6bf2ff'; for (let i = 0; i < 3; i++) { G.beginPath(); G.moveTo(x - s * 0.5 + i * s * 0.3, y - s * 0.4); G.lineTo(x - s * 0.2 + i * s * 0.3, y); G.lineTo(x - s * 0.5 + i * s * 0.3, y + s * 0.4); G.lineWidth = 2.2; G.strokeStyle = '#6bf2ff'; G.stroke(); } }
  else if (id === 'area') { G.strokeStyle = '#7dff6b'; G.lineWidth = 1.6; for (let i = 1; i <= 3; i++) { G.beginPath(); G.arc(x, y, s * 0.18 * i, 0, 6.283); G.stroke(); } }
  else if (id === 'suerte') { G.fillStyle = '#3fbf4a'; for (let i = 0; i < 4; i++) { const a = i * 1.571 + 0.785; G.beginPath(); G.arc(x + Math.cos(a) * s * 0.22, y + Math.sin(a) * s * 0.22, s * 0.2, 0, 6.283); G.fill(); G.stroke(); } }
  else if (id === 'iman') { G.lineWidth = s * 0.22; G.strokeStyle = '#e0303a'; G.beginPath(); G.arc(x, y - s * 0.05, s * 0.35, Math.PI, 0); G.stroke(); G.strokeStyle = '#f1e6c8'; G.beginPath(); G.moveTo(x - s * 0.35, y - s * 0.05); G.lineTo(x - s * 0.35, y + s * 0.35); G.moveTo(x + s * 0.35, y - s * 0.05); G.lineTo(x + s * 0.35, y + s * 0.35); G.stroke(); }
  else if (id === 'vida') { G.fillStyle = '#e0303a'; G.beginPath(); G.moveTo(x, y + s * 0.45); G.bezierCurveTo(x - s * 0.8, y - s * 0.05, x - s * 0.3, y - s * 0.6, x, y - s * 0.2); G.bezierCurveTo(x + s * 0.3, y - s * 0.6, x + s * 0.8, y - s * 0.05, x, y + s * 0.45); G.fill(); G.stroke(); }
  else if (id === 'cadencia') { G.fillStyle = '#ffb04d'; G.beginPath(); G.moveTo(x - s * 0.4, y - s * 0.25); G.lineTo(x + s * 0.5, y); G.lineTo(x - s * 0.4, y + s * 0.25); G.closePath(); G.fill(); G.stroke(); }
  G.lineCap = 'butt';
}

function oscurece(a = 0.72) { G.globalAlpha = a; G.fillStyle = '#07040a'; G.fillRect(0, 0, PAN.W, PAN.H); G.globalAlpha = 1; }

// --- portada ---
const PORTADA = { t: 0, plumas: [] };
function pintaPortada(dt) {
  const W = PAN.W, H = PAN.H, P = PORTADA; P.t += dt;
  if (IMG.portada) { const im = IMG.portada, s = Math.max(W / im.width, H / im.height); G.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2 - Math.sin(P.t * 0.3) * 4, im.width * s, im.height * s); }
  else { G.drawImage(FONDO, 0, 0, W, H); }
  for (let b = 0; b < 10; b++) { const t = b / 9; G.fillStyle = `rgba(7,4,10,${(t < 0.5 ? 0.15 + t * 0.4 : 0.35 + (t - 0.5) * 1.14).toFixed(2)})`; G.fillRect(0, Math.floor(b * H / 10), W, Math.ceil(H / 10) + 1); }   // degradado en bandas
  // plumas doradas que caen
  if (P.plumas.length < 18) P.plumas.push({ x: Math.random() * W, y: -10, v: 10 + Math.random() * 14, r: Math.random() * 6, s: 0.8 + Math.random() * 0.8 });
  for (const p of P.plumas) { p.y += p.v * dt; p.r += dt * 1.5; pintaGirado('xp1', p.x + Math.sin(p.r) * 6, p.y, Math.sin(p.r) * 0.8, p.s); }
  P.plumas = P.plumas.filter(p => p.y < H + 10);
  // título
  const y = H * 0.17 + Math.sin(P.t * 1.6) * 2;
  texto2('FANS OF', W / 2, y - 18, 11, '#f6e7b8', 'center', FUENTE, 800, 0.3);
  texto2('GOOSE', W / 2, y + 6, 42, '#ffd34d', 'center', FUENTE_G, 400, 0.14);
  texto2(tr('El Juego de la Oca... maldito'), W / 2, y + 30, 8, '#f1e6c8', 'center', FUENTE, 700, 0.35);
  // récords
  const yb = H - 170;
  if (SAVE.partidas) {
    texto2(SAVE.victorias ? tr('Has escapado {n} veces', { n: SAVE.victorias }) : tr('Tu mejor casilla: {n} de 63', { n: SAVE.mejorCasilla }), W / 2, yb - 20, 7, '#ffd34d', 'center', FUENTE, 800);
  }
  botonLosa(30, yb - 8, W - 60, 32, tr('JUGAR'), '#e8742a', () => { SONIDO.boton(); abreSelector(); }, 15, null, 1);   // casillas de madera del tablero (js/hud.js)
  const mitad = (W - 66) / 2, D = diarioHoy();
  botonLosa(30, yb + 30, mitad, 26, tr('TABLERO DEL DÍA'), '#c0402f', () => { SONIDO.boton(); JUEGO.modo = 'diario'; }, 7.5, D.intentos ? tr('Hoy: {p}', { p: D.mejor }) : tr('¡Nuevo!'), 26);
  botonLosa(36 + mitad, yb + 30, mitad, 26, tr('DESAFÍOS'), '#d98a1a', () => { SONIDO.boton(); DESAFIOS_SCROLL = 0; JUEGO.modo = 'desafios'; }, 8, tr('{a} de {b}', { a: DESAFIOS.filter(d => hecho(d.id)).length, b: DESAFIOS.length }), 42);
  botonLosa(30, yb + 62, mitad, 24, tr('CON AMIGOS'), '#1f9a8a', () => { SONIDO.boton(); abreAmigos(); }, 8, tr('De 2 a 4'));
  botonLosa(36 + mitad, yb + 62, mitad, 24, tr('CONTRARRELOJ'), '#8a3a1a', () => { SONIDO.boton(); CR.datos = null; JUEGO.modo = 'contrarreloj'; }, 8, crSave().mejor ? tr('Récord {t}', { t: reloj(crSave().mejor) }) : tr('¡Nuevo!'));   // js/contrarreloj.js
  botonLosa(W - 46, 10, 38, 34, '', '#d99a1a', () => { SONIDO.boton(); abrePase(); }, 7);   // el Camino de la Oca, arriba a la derecha (js/pase.js)
  icono('pase', W - 27, 23, 12); texto2(String(escalonPase()) + '/63', W - 27, 37, 6, '#3a1c06', 'center', FUENTE, 800, 0);
  botonLosa(30, yb + 92, W - 110, 24, tr('MEJORAS'), '#3f9a3a', () => { SONIDO.boton(); JUEGO.modo = 'tienda'; }, 9, tr('{n} monedas', { n: SAVE.monedas }), 31);
  botonLosa(W - 76, yb + 92, 46, 24, tr('OPCIONES'), '#2f74c0', () => { SONIDO.boton(); JUEGO.modo = 'opciones'; JUEGO.opcionesDe = 'portada'; }, 6.5);
  texto2(tr('Microblizz no se hace responsable de las ocas'), W / 2, H - 12, 5.5, 'rgba(241,230,200,.55)', 'center', FUENTE, 700, 0);
}

// --- cartas al subir de nivel ---
function pintaCartas(dt) {
  const J = JUEGO, W = PAN.W, H = PAN.H; J.cartasT += dt;
  oscurece(0.7);
  const k = Math.min(1, J.cartasT * 4);
  texto2(tr('¡SUBES DE NIVEL!'), W / 2, 62 - (1 - k) * 20, 17 * (0.8 + k * 0.2), '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  texto2(tr('Elige una mejora'), W / 2, 80, 7.5, '#f1e6c8');
  const n = J.cartas.length, alto = n > 3 ? 54 : 62, gap = 8, y0 = 96;
  J.cartas.forEach((c, i) => {
    const ki = Math.max(0, Math.min(1, J.cartasT * 4 - i * 0.35)), e = 1 - (1 - ki) ** 3;
    const elegida = J.cartaElegida === i, otra = J.cartaElegida >= 0 && !elegida;
    const x = 12 + (1 - e) * (i % 2 ? 120 : -120), y = y0 + i * (alto + gap);
    if (otra) G.globalAlpha = 0.3;
    const brillo = c.clase === 'evo' ? (Math.sin(J.t * 6) * 0.5 + 0.5) : 0;
    if (c.clase === 'evo') { G.globalAlpha = 0.4 + brillo * 0.4; caja(x - 3, y - 3, W - 18, alto + 6, 10, '#ffd34d', null); G.globalAlpha = otra ? 0.3 : 1; }
    caja(x, y, W - 24, alto, 8, c.clase === 'evo' ? '#4a2a08' : '#2a1610', elegida ? '#ffd34d' : c.color, elegida ? 3 : 1.8);
    caja(x + 6, y + 6, alto - 12, alto - 12, 6, '#160b08', '#120808', 1);
    icono(c.icono, x + alto / 2, y + alto / 2, alto * 0.42);
    const tx = x + alto + 2;
    texto2(tr(c.nombre), tx, y + 13, 9.5, c.clase === 'evo' ? '#ffd34d' : '#fff4dc', 'left');
    const etq = c.clase === 'evo' ? tr('¡EVOLUCIÓN!') : c.nueva && c.clase !== 'monedas' && c.clase !== 'pollo' ? tr('¡NUEVA!') : c.nivel ? tr('NV {n}', { n: c.nivel }) : '';
    if (etq) texto2(etq, x + W - 30, y + 12, 6.5, c.clase === 'evo' ? '#ffd34d' : c.nueva ? '#7dff6b' : '#6bd4ff', 'right');
    parrafo(tr(c.desc), tx, y + 26, W - 24 - alto - 10, 7, '#e8dcc0');
    G.globalAlpha = 1;
    if (J.cartaElegida < 0 && ki >= 1) BOTONES.push({ x, y, w: W - 24, h: alto, accion: () => (J.desterrando ? destierra(i) : eligeCarta(i)) });
  });
  const yb = y0 + n * (alto + gap) + 4;
  botonesCartas(yb);   // volver a tirar, desterrar y saltar (js/maldicion.js)
}
function parrafo(t, x, y, ancho, tam, color) {
  const pal = t.split(' '), alto = Math.max(TAM_MIN, tam) * 1.15; let linea = '', yy = y;
  for (const p of pal) { const prueba = linea ? linea + ' ' + p : p; if (anchoTexto(prueba, tam, FUENTE, 700) > ancho && linea) { texto2(linea, x, yy, tam, color, 'left', FUENTE, 700, 0.3); linea = p; yy += alto; } else linea = prueba; }
  if (linea) texto2(linea, x, yy, tam, color, 'left', FUENTE, 700, 0.3);
  return yy + alto;   // dónde acaba
}

// --- cofre ---
function pintaCofre(dt) {
  const J = JUEGO, C = J.cofre, W = PAN.W, H = PAN.H; C.t += dt;
  oscurece(0.78);
  const abre = 0.9, cx = W / 2, cy = 120;
  if (C.t < abre) {
    const s = Math.sin(C.t * 60) * C.t * 3;
    pinta('luz', cx, cy, false, false, 1 + C.t);
    pinta('cofre', cx + s, cy, false, false, 3.2 + C.t);
    texto2(tr('¡COFRE!'), W / 2, 60, 18, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  } else {
    if (!C.abierto) { C.abierto = true; destella('#ffd34d', 0.7); SONIDO.premio(0); }
    // rayos de luz
    G.globalAlpha = 0.14; for (let i = 0; i < 12; i++) { const a = C.t * 0.6 + i * 0.5236; for (let q = 0; q < 4; q++) lineaPixel(cx, cy, cx + Math.cos(a + (q - 1.5) * 0.02) * 160, cy + Math.sin(a + (q - 1.5) * 0.02) * 160, 1 + q * 0.5, '#ffd34d'); }   // los rayos, en píxeles
    G.globalAlpha = 1;
    pinta('cofre', cx, cy, false, false, 3.6);
    texto2(C.n === 5 ? tr('¡CINCO MEJORAS!') : C.n === 3 ? tr('¡TRES MEJORAS!') : tr('¡UNA MEJORA!'), W / 2, 60, C.n === 5 ? 18 : 15, C.n === 5 ? '#ff6b4d' : '#ffd34d', 'center', FUENTE_G, 400, 0.2);
    const vistos = Math.min(C.premios.length, Math.floor((C.t - abre) / 0.28) + 1);
    if (vistos > (C.sonados || 0)) { C.sonados = vistos; SONIDO.premio(vistos); }
    for (let i = 0; i < vistos; i++) {
      const c = C.premios[i], y = 170 + i * 30;
      caja(20, y, W - 40, 26, 6, c.clase === 'evo' ? '#4a2a08' : '#2a1610', c.color, 1.5);
      icono(c.icono, 34, y + 13, 11);
      texto2(tr(c.nombre), 48, y + 9, 8, c.clase === 'evo' ? '#ffd34d' : '#fff4dc', 'left');
      texto2(c.clase === 'evo' ? tr('¡EVOLUCIÓN!') : c.nivel ? tr('NV {n}', { n: c.nivel }) : '', 48, y + 19, 6, '#6bd4ff', 'left', FUENTE, 700);
    }
    const ym = 172 + C.premios.length * 30;
    if (vistos >= C.premios.length) {
      pinta('moneda', W / 2 - 22, ym + 6, false, false, 1.4); texto2('+' + C.monedas, W / 2 - 12, ym + 6.5, 11, '#ffcf33', 'left');
      if (C.t > 1.4 + C.premios.length * 0.28) { boton(W / 2 - 55, ym + 22, 110, 26, tr('¡A POR ELLAS!'), '#e8742a', () => cierraCofre(), 10); }
    }
  }
}

// --- pausa ---
function pausa() { const J = JUEGO; if (J.modo !== 'juego') return; J.modo = 'pausa'; SONIDO.boton(); }
function pintaPausa() {
  const J = JUEGO, W = PAN.W, H = PAN.H;
  oscurece(0.78);
  texto2(tr('PAUSA'), W / 2, 60, 22, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  // lo que llevas
  let x = 22, y = 92;
  texto2(tr('Tu equipo'), W / 2, 82, 7, '#c9b98a');
  for (const id in J.armas) { if (!ARMAS[id]) continue; const a = J.armas[id]; caja(x - 10, y - 10, 20, 20, 5, a.evo ? '#4a2a08' : '#2a1610', a.evo ? '#ffd34d' : ARMAS[id].color, 1.2); icono(ARMAS[id].icono, x, y, 9); texto2(a.evo ? 'EVO' : String(a.nivel), x + 8, y + 8, 6, '#ffd34d'); x += 26; }
  x = 22; y += 26;
  for (const id in J.pasivas) { caja(x - 10, y - 10, 20, 20, 5, '#2a1610', '#7fd1ff', 1.2); icono(PASIVAS[id].icono, x, y, 9); texto2(String(J.pasivas[id]), x + 8, y + 8, 6, '#6bd4ff'); x += 26; }
  const yb = 160;
  boton(30, yb, W - 60, 32, tr('SEGUIR'), '#e8742a', () => { SONIDO.boton(); J.modo = 'juego'; J.invul = Math.max(J.invul, 0.5); }, 13);
  boton(30, yb + 42, W - 60, 24, tr('OPCIONES'), '#2f74c0', () => { SONIDO.boton(); J.modo = 'opciones'; J.opcionesDe = 'pausa'; }, 9);
  boton(30, yb + 74, W - 60, 24, tr('SALIR AL MENÚ'), '#c0402f', () => {
    SONIDO.boton();
    confirmBox(tr('¿Salir al menú?'), tr('Perderás esta partida (las monedas recogidas no se guardan).'), tr('SALIR'), () => { if (typeof RENDIMIENTO !== 'undefined') try { RENDIMIENTO.parar(); } catch (e) { /* nada */ } if (J.carrera) saleSala(); J.modo = 'portada'; });
  }, 9);
}

// --- final ---
function pintaFin(dt) {
  const J = JUEGO, F = J.fin, W = PAN.W, H = PAN.H; F.t += dt;
  oscurece(Math.min(0.85, F.t * 2));
  const k = Math.min(1, F.t * 3);
  if (J.carrera && J.carrera.clasificacion) {
    const p = J.carrera.puesto;
    texto2(p === 1 ? tr('¡GANAS LA CARRERA!') : tr('LLEGAS {n}º', { n: p }), W / 2, 58, 18 * (0.6 + k * 0.4), p === 1 ? '#ffd34d' : '#f6e7b8', 'center', FUENTE_G, 400, 0.2);
    texto2(tr('La Carrera de la Oca'), W / 2, 78, 7, '#f1e6c8');
    pintaClasificacion(92, F.t);
    finBotones(F, W, H, 92 + J.carrera.clasificacion.length * 24 + 6);
    return;
  }
  if (esCoop()) texto2(F.gana ? tr('¡HABÉIS ESCAPADO!') : tr('OS COMIÓ LA OCA'), W / 2, 58, 18 * (0.6 + k * 0.4), F.gana ? '#ffd34d' : '#ff4d4d', 'center', FUENTE_G, 400, 0.2);
  else if (F.gana) texto2(tr('¡HAS ESCAPADO!'), W / 2, 58, 20 * (0.6 + k * 0.4), '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  else texto2(tr('TE COMIÓ LA OCA'), W / 2, 58, 20 * (0.6 + k * 0.4), '#ff4d4d', 'center', FUENTE_G, 400, 0.2);
  texto2(F.gana ? tr('La Oca Madre ha caído. El jardín es tuyo.') : tr('El tablero siempre gana... esta vez.'), W / 2, 78, 7, '#f1e6c8');
  const filas = [
    [tr('Casilla'), J.mejorCasilla + ' / ' + CFG.jardin],
    [tr('Tiempo'), Math.floor(J.t / 60) + ':' + String(Math.floor(J.t) % 60).padStart(2, '0')],
    [tr('Ocas desplumadas'), String(J.bajas)],
    [tr('Nivel'), String(J.nivel)],
    [tr('Mejor combo'), 'x' + J.mejorCombo],
  ];
  const logros = lineasFin(F), paso = logros.length ? 13 : 17, y0 = logros.length ? 92 : 100;
  filas.forEach(([a, b], i) => {
    const y = y0 + i * paso, ki = Math.max(0, Math.min(1, F.t * 4 - 1 - i * 0.4)); if (!ki) return;
    G.globalAlpha = ki; texto2(a, 30, y, 8, '#c9b98a', 'left', FUENTE, 700); texto2(b, W - 30, y, 9, '#fff4dc', 'right'); G.globalAlpha = 1;
  });
  finBotones(F, W, H, y0 + filas.length * paso + 6, logros);
}
// lo nuevo de esta partida: la noche que se abre, los desafíos cumplidos y el Tablero del día
function lineasFin(F) {
  const l = [];
  if (F.diario) l.push([F.diario.record ? tr('Tablero del día: {p} puntos ¡tu mejor de hoy!', { p: F.diario.pts }) : tr('Tablero del día: {p} puntos', { p: F.diario.pts }), '#ffd34d']);
  if (F.cr && F.cr.gana) { l.push([tr('Contrarreloj: {t}', { t: reloj(F.cr.seg) }) + (F.cr.record ? ' · ' + tr('¡tu mejor tiempo!') : ''), '#ffd34d']); l.push([F.cr.medalla ? tr('Medalla de {m}: +{n} monedas', { m: tr(F.cr.medalla.nombre), n: F.cr.medalla.monedas }) : tr('Sin medalla esta vez'), F.cr.medalla ? F.cr.medalla.color : '#c9b98a']); }
  if (F.pase) l.push([textoPaseFin(F.pase), '#ffe27a']);   // el Camino de la Oca (js/pase.js)
  if (F.noche) l.push([tr('¡NOCHE {n} ABIERTA!', { n: F.noche }), '#ff8a6b']);
  for (const d of F.desafios || []) { l.push([tr('Desafío: {t}', { t: tr(d.txt) }), '#7dff6b']); l.push([textoPremio(d), '#ffd34d']); }
  return l;
}
function finBotones(F, W, H, ym, logros = []) {
  if (F.t > 2.4) {
    caja(30, ym, W - 60, 28, 8, '#2a1610', '#ffcf33', 1.5);
    pinta('moneda', W / 2 - 26, ym + 14, false, false, 1.6); texto2('+' + F.monedas, W / 2 - 14, ym + 14.5, 13, '#ffcf33', 'left');
    let y = ym + 38;
    if (F.record) { texto2(tr('¡NUEVO RÉCORD!'), W / 2, y, 8, '#7dff6b'); y += 11; }
    const conDoblar = hayAnuncios() && !F.doblado && F.monedas > 0, caben = Math.max(0, Math.floor((H - (conDoblar ? 156 : 122) - y) / 9));   // hueco para «doblar» (js/monetiza.js)
    logros.slice(0, caben).forEach(([t, c], i) => { if (F.t > 2.6 + i * 0.2) texto2(t, W / 2, y + i * 9, 7, c, 'center', FUENTE, 800, 0.3); });
    if (logros.length > caben && caben) texto2(tr('…y {n} más en Desafíos', { n: logros.length - caben }), W / 2, y + caben * 9, 7, '#c9b98a');
  }
  botonDoblar(F, W, H - 148);   // doblar el botín viendo un anuncio (js/monetiza.js)
  if (F.t > 2.8) {
    boton(30, H - 110, W - 60, 32, JUEGO.carrera ? tr('CON AMIGOS') : tr('OTRA VEZ'), '#e8742a', () => { SONIDO.boton(); if (JUEGO.carrera) { JUEGO.carrera = null; abreAmigos(); } else if (F.diario) empiezaDiario(); else nuevaPartida(); }, 13);
    boton(30, H - 70, W - 60, 24, tr('MEJORAS'), '#3f9a3a', () => { SONIDO.boton(); JUEGO.modo = 'tienda'; }, 9, tr('{n} monedas', { n: SAVE.monedas }));
    boton(30, H - 40, W - 60, 22, tr('MENÚ'), '#2f74c0', () => { SONIDO.boton(); JUEGO.carrera = null; JUEGO.modo = 'portada'; }, 9);
  }
}
