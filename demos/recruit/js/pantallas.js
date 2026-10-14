// Fans of Recruit · LAS PANTALLAS que no son la partida: la de carga, el título (con CrazyBunny corriendo por la oficina), la
// pausa, la de «¡DESPEDIDO!» (con su cuenta atrás para seguir) y la de misión cumplida, que suma los premios. Los menús
// valen igual con el dedo, con el ratón o con las flechas y Enter.
'use strict';

const MENU = { sel: 0, antes: 0 };
const AVISO = { s: '', t: 0 };   // el cartel con lo que hay que hacer para instalar el juego (cuando el navegador no saca su ventana)
// si está el cartel, cualquier toque o tecla lo cierra (y no hace nada más)
function pasoAviso() { if (!AVISO.t) return false; AVISO.t--; if (pulsaAlgo() || MANDO.p.pausa) { AVISO.t = 0; play('select'); } return true; }
function pintaAviso2(g) {
  if (!AVISO.t) return;
  const W = J.W, H = J.H, l = envuelve(tr(AVISO.s), W - 70, 1, 'mini'), h = l.length * 8 + 30, y0 = Math.round(H / 2 - h / 2);
  velo(g, 0.5); rect(g, 26, y0, W - 52, h, '#1c2f52'); marcoFino(g, 26, y0, W - 52, h);
  l.forEach((s, k) => escribe(g, s, W / 2, y0 + 9 + k * 8, { alin: 'centro', fuente: 'mini', c: BLANCO_ROTULO }));
  escribe(g, tr('TOCA PARA CERRAR'), W / 2, y0 + h - 12, { alin: 'centro', fuente: 'mini', c: ORO_ROTULO });
}
const pulsaAlgo = () => !!(MANDO.toque || MANDO.pok || MANDO.p.fuego || MANDO.p.salto);
const siNo = v => tr(v ? 'SÍ' : 'NO');

// un menú de n opciones, una debajo de otra desde y0. Devuelve cuál se acaba de elegir (o -1)
function pasoMenu(n, y0, alto) {
  const m = MANDO;
  let k = -1;
  if (m.y && !MENU.antes) { MENU.sel = (MENU.sel + m.y + n) % n; play('blip'); }
  MENU.antes = m.y;
  if (m.pok || m.p.fuego || m.p.salto) k = MENU.sel;
  if (m.toque) { const f = Math.floor((m.toque.y - y0 + 6) / alto); if (f >= 0 && f < n && Math.abs(m.toque.x - J.W / 2) < 110) { MENU.sel = f; k = f; } }
  if (k >= 0) play('select');
  return k;
}
function pintaMenu(g, ops, y0, alto) {
  const m = Math.round(J.W / 2);
  ops.forEach((s, k) => {
    const sel = k === MENU.sel, y = y0 + k * alto;
    if (sel) { const w = anchoTexto(s) + 22, x = Math.round(m - w / 2); rect(g, x, y - 4, w, 15, '#1c2f52'); marcoFino(g, x, y - 4, w, 15); }
    escribe(g, s, m, y, { alin: 'centro', c: sel ? ORO_ROTULO : BLANCO_ROTULO });
  });
}
function guardaRecord(p) { if (p > AJUSTES.record) { AJUSTES.record = p; guardaAjustes(); } }
// en el móvil, a pantalla completa y tumbado (si el navegador deja)
function pantallaCompleta() {
  if (!MANDO.tactil || document.fullscreenElement) return;
  try {
    const d = document.documentElement, p = d.requestFullscreen && d.requestFullscreen({ navigationUI: 'hide' });
    if (p && p.then) p.then(() => { try { const q = screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'); if (q && q.catch) q.catch(() => {}); } catch (_) { /* da igual */ } }).catch(() => {});
  } catch (_) { /* no se puede: se juega igual */ }
}

/* ---------- la carga ---------- */
function pintaCarga(g) {
  const W = J.W, H = J.H, m = W / 2, v = CARGA.k / CARGA.pasos.length, F_ = CARGA.frases;
  g.fillStyle = '#0c1018'; g.fillRect(0, 0, W, H);
  escribe(g, 'FANS OF', m, H / 2 - 56, { alin: 'centro', esc: 2, c: BLANCO_ROTULO });
  escribe(g, 'RECRUIT', m, H / 2 - 36, { alin: 'centro', esc: 4, c: ORO_ROTULO });
  const w = 160, x = Math.round(m - w / 2), y = Math.round(H / 2 + 12);
  rect(g, x - 2, y - 2, w + 4, 11, '#ffd23c'); rect(g, x - 1, y - 1, w + 2, 9, TINTA);
  rect(g, x, y, Math.round(w * v), 7, '#f47c20'); rect(g, x, y, Math.round(w * v), 2, '#ffa63d');
  escribe(g, tr(F_[Math.min(F_.length - 1, (v * F_.length) | 0)]), m, y + 18, { alin: 'centro', fuente: 'mini', c: '#c8d2e6' });
}

/* ---------- el título ---------- */
function alTitulo() {
  Object.assign(J, { estado: 'titulo', t: 0, camX: 0, zona: null, fase: '', rotulo: null, sello: 0, jefe: null, tiembla: 0, flash: 0, tinte: 0, adelante: 0 });
  for (const k of ['enes', 'balas', 'tiros', 'cosas', 'fx', 'flotan', 'luego']) J[k] = [];
  nuevoJugador();
  sueltaTodo();
  musica('menu');
}
function pasoTitulo() {
  const j = JG, q = MANDO.toque;
  J.t++;
  // CrazyBunny corre por la oficina
  J.camX += 1.45;
  if (J.camX > NIVEL.largo - J.W - 420) J.camX = 0;
  Object.assign(j, { x: J.camX + J.W * 0.3, y: SUELO, vx: 1.45, dir: 1, suelo: true, mira: 0, agachado: false, t: j.t + 1, anim: j.anim + 0.348 });
  if (pasoOpciones()) return;
  // los dos botones de abajo: las opciones y volver a la Biblioteca
  if (q && q.y > J.H - 34 && q.y < J.H - 12) {
    if (q.x < J.W / 2) abreOpciones(); else location.href = '../../#biblioteca';
    return;
  }
  if (J.t > 20 && pulsaAlgo()) { pantallaCompleta(); nuevaPartida(); }
}
function pintaTitulo(g) {
  const W = J.W, H = J.H, m = W / 2, mini = { alin: 'centro', fuente: 'mini', c: '#c8d2e6' };
  g.globalAlpha = 0.64; g.fillStyle = '#080a14'; g.fillRect(0, 0, W, 110); g.fillRect(0, H - 54, W, 54); g.globalAlpha = 1;
  rect(g, 0, 110, W, 1, TINTA); rect(g, 0, 109, W, 1, '#ffd23c'); rect(g, 0, H - 55, W, 1, TINTA); rect(g, 0, H - 54, W, 1, '#ffd23c');
  escribe(g, 'FANS OF', m, 12, { alin: 'centro', esc: 2, c: BLANCO_ROTULO });
  escribe(g, 'RECRUIT', m, 33, { alin: 'centro', esc: 5, c: ORO_ROTULO });
  escribe(g, tr('MISIÓN 1: LA GRAN COMPRA'), m, 80, { alin: 'centro', c: CIAN_ROTULO });
  escribe(g, tr('MICROBLIZZ COMPRA ESTUDIOS PARA CERRARLOS. HOY, NO.'), m, 96, mini);
  if ((J.t >> 5) & 1) escribe(g, tr(MANDO.tactil ? 'TOCA PARA EMPEZAR' : 'PULSA ENTER PARA EMPEZAR'), m, 122, { alin: 'centro', c: ORO_ROTULO });
  escribe(g, tr('RÉCORD') + ' ' + String(AJUSTES.record).padStart(7, '0'), 5, 4, { fuente: 'mini', c: '#c8d2e6' });
  escribe(g, 'V' + VERSION_RC, W - 5, 4, { fuente: 'mini', c: '#8490a4', alin: 'der' });
  // cómo se juega
  if (MANDO.tactil) escribe(g, tr('PULGAR IZQUIERDO: MOVER Y APUNTAR / BOTONES A LA DERECHA'), m, H - 46, mini);
  else ayudaTeclas().forEach((s, k) => escribe(g, s, m, H - 49 + k * 8, mini));
  // los botones
  [tr('OPCIONES'), tr('BIBLIOTECA')].forEach((s, k) => {
    const x = Math.round(W * (k * 2 + 1) / 4), w = Math.min(Math.floor(W / 2) - 16, 130), x0 = Math.round(x - w / 2), y = H - 31;
    rect(g, x0, y, w, 15, '#1c2f52'); marcoFino(g, x0, y, w, 15, k ? '#7ee8ff' : '#ffd23c');
    escribe(g, s, x, y + 4, { alin: 'centro', c: BLANCO_ROTULO });
  });
  escribe(g, tr('PARODIA HECHA POR FANS: MICROBLIZZ NO EXISTE (POR SUERTE)'), m, H - 10, Object.assign({}, mini, { c: '#8490a4' }));
}

/* ---------- la pausa ---------- */
function pausa(v) {
  if (v && J.estado === 'juego') { J.estado = 'pausa'; MENU.sel = 0; sueltaTodo(); play('select'); }
  else if (!v && J.estado === 'pausa') { J.estado = 'juego'; sueltaTodo(); play('select'); }
}
const opsPausa = () => [tr('CONTINUAR'), tr('OPCIONES'), tr('SALIR AL TÍTULO')];
function pasoPausa() {
  if (pasoOpciones()) return;
  if (MANDO.p.pausa) { pausa(false); return; }
  const k = pasoMenu(3, 92, 20);
  if (k === 0) pausa(false); else if (k === 1) abreOpciones(); else if (k === 2) { guardaRecord(J.puntos); alTitulo(); }
}
function pintaPausa(g) {
  velo(g, 0.62);
  escribe(g, tr('PAUSA'), J.W / 2, 40, { alin: 'centro', esc: 3, c: ORO_ROTULO });
  pintaMenu(g, opsPausa(), 92, 20);
  if (!MANDO.tactil) escribe(g, tr('ABAJO + SALTO: BAJAR DE LA MECHAVACA'), J.W / 2, J.H - 30, { alin: 'centro', fuente: 'mini', c: '#c8d2e6' });
}

/* ---------- sin vidas: ¿seguir? ---------- */
function continua() {
  J.estado = 'juego'; J.puntos = Math.floor(J.puntos / 20) * 10; J.continuado++;
  JG.vidas = 2; revive(); sueltaTodo();
  musica(J.fase === 'jefe' ? 'boss0' : J.fase === 'jefe-aviso' ? null : 'heroes'); play('revive');
}
function pasoFin() {
  J.t++;
  if (J.t > 45 && pulsaAlgo()) { continua(); return; }
  if (J.t >= 660) { guardaRecord(J.puntos); alTitulo(); } else if (J.t % 66 === 0) play('tick');
}
function pintaFin(g) {
  const m = J.W / 2;
  velo(g, 0.66);
  escribe(g, tr('¡DESPEDIDO!'), m, 36, { alin: 'centro', esc: 3, c: ROJO_ROTULO });
  escribe(g, tr('¿HACES HORAS EXTRA?'), m, 76, { alin: 'centro', c: BLANCO_ROTULO });
  escribe(g, String(Math.max(0, 9 - Math.floor(J.t / 66))), m, 93, { alin: 'centro', fuente: 'gorda', esc: 3, c: ORO_ROTULO });
  if ((J.t >> 4) & 1) escribe(g, tr(MANDO.tactil ? 'TOCA PARA SEGUIR' : 'PULSA ENTER PARA SEGUIR'), m, 134, { alin: 'centro', c: ORO_ROTULO });
  escribe(g, tr('SEGUIR CUESTA LA MITAD DE LOS PUNTOS (COMISIÓN DE MICROBLIZZ)'), m, 152, { alin: 'centro', fuente: 'mini', c: '#c8d2e6' });
}

/* ---------- misión cumplida: la suma de premios ---------- */
function pasoVictoria() {
  J.t++; JG.t++;
  if (J.t === 1) {
    const b = J.bonos = [['FANS RESCATADOS', J.fans, 1000], ['TIEMPO', J.tiempo, 100], ['VIDAS', JG.vidas, 2000]];
    if (!J.continuado) b.push(['SIN HORAS EXTRA', 1, 5000]);
    J.total = J.puntos + b.reduce((s, x) => s + x[1] * x[2], 0);
    J.esRecord = J.total > AJUSTES.record; guardaRecord(J.total);
  }
  const n = J.t / 34;
  if (J.t % 34 === 0 && n <= J.bonos.length + 1) play(n > J.bonos.length ? 'crown' : 'blip');
  if (n > J.bonos.length + 2.5 && pulsaAlgo()) alTitulo();
}
function pintaVictoria(g) {
  const m = Math.round(J.W / 2), n = Math.floor(J.t / 34), B = J.bonos || [], H = J.H;
  velo(g, 0.68);
  escribe(g, tr('¡MISIÓN CUMPLIDA!'), m, 18, { alin: 'centro', esc: 2, c: ORO_ROTULO });
  escribe(g, tr('PUNTOS'), m - 104, 50, { c: BLANCO_ROTULO }); escribe(g, String(J.puntos), m + 104, 50, { alin: 'der', c: BLANCO_ROTULO });
  B.forEach(([s, a, b], k) => {
    if (n <= k) return;
    const y = 64 + k * 14;
    escribe(g, tr(s), m - 104, y, { c: CIAN_ROTULO }); escribe(g, b === 5000 ? '5000' : a + ' x ' + b, m + 104, y, { alin: 'der', c: CIAN_ROTULO });
  });
  if (n > B.length) {
    const y = 72 + B.length * 14;
    rect(g, m - 104, y - 5, 208, 1, '#ffd23c');
    escribe(g, tr('TOTAL'), m - 104, y, { esc: 2, c: ORO_ROTULO }); escribe(g, String(J.total), m + 104, y, { alin: 'der', esc: 2, c: ORO_ROTULO });
    if (J.esRecord && (J.t & 16)) escribe(g, tr('¡NUEVO RÉCORD!'), m, y + 22, { alin: 'centro', c: ROJO_ROTULO });
  }
  if (n > B.length + 1) {
    escribe(g, tr('MIENTRAS TANTO, MICROBLIZZ YA HA COMPRADO OTRO ESTUDIO.'), m, H - 50, { alin: 'centro', fuente: 'mini', c: '#c8d2e6' });
    escribe(g, tr('CONTINUARÁ… HASTA LA PRÓXIMA REESTRUCTURACIÓN'), m, H - 40, { alin: 'centro', fuente: 'mini', c: '#c8d2e6' });
  }
  if (n > B.length + 2.5 && (J.t & 16)) escribe(g, tr(MANDO.tactil ? 'TOCA PARA SEGUIR' : 'PULSA ENTER PARA SEGUIR'), m, H - 22, { alin: 'centro', c: ORO_ROTULO });
}
