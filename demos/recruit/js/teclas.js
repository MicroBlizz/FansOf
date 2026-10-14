// Fans of Recruit · LOS CONTROLES DEL ORDENADOR: qué tecla hace cada cosa (dos por acción, se cambian en Opciones →
// Controles y se guardan), el mando de consola (se enchufa y ya va) y el ratón (clic izquierdo dispara, derecho lanza la
// zanahoria). También la pantalla de Opciones → Controles, donde se elige una casilla y se pulsa la tecla nueva.
'use strict';

const ACCIONES = [['izq', 'IZQUIERDA'], ['der', 'DERECHA'], ['arr', 'ARRIBA / APUNTAR'], ['aba', 'ABAJO / AGACHARSE'], ['fuego', 'DISPARAR'],
  ['salto', 'SALTAR'], ['bomba', 'ZANAHORIA BOMBA'], ['caos', 'SALTO DEL CAOS'], ['pausa', 'PAUSA']];
const TECLAS_BASE = { izq: ['KeyA', 'ArrowLeft'], der: ['KeyD', 'ArrowRight'], arr: ['KeyW', 'ArrowUp'], aba: ['KeyS', 'ArrowDown'],
  fuego: ['KeyJ', 'KeyZ'], salto: ['KeyK', 'KeyX'], bomba: ['KeyL', 'KeyC'], caos: ['KeyI', 'KeyV'], pausa: ['Escape', 'KeyP'] };
const NOMBRE_TECLA = { ArrowLeft: 'FLECHA IZQ.', ArrowRight: 'FLECHA DER.', ArrowUp: 'FLECHA ARR.', ArrowDown: 'FLECHA ABA.', Space: 'ESPACIO', Escape: 'ESC',
  Enter: 'ENTER', ShiftLeft: 'MAYÚS', ShiftRight: 'MAYÚS DER.', ControlLeft: 'CTRL', ControlRight: 'CTRL DER.', AltLeft: 'ALT', AltRight: 'ALT GR', Tab: 'TAB',
  Backspace: 'BORRAR', Comma: ',', Period: '.', Minus: '-', Semicolon: 'Ñ', Slash: '-', Quote: '´', BracketLeft: '`', BracketRight: '+', Backslash: 'Ç', IntlBackslash: '<' };
const nombreTecla = c => (!c ? '---' : NOMBRE_TECLA[c] || c.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, 'NUM '));
// las teclas que el jugador tiene ahora (las suyas o las de serie)
function teclasDe(a) { const t = AJUSTES.teclas && AJUSTES.teclas[a]; return Array.isArray(t) ? t : TECLAS_BASE[a]; }
// rehace la tabla tecla → acción. Espacio salta y Enter acepta siempre, salvo que el jugador los haya puesto en otra cosa
function rehaceMapa() {
  for (const k in MAPA_TECLAS) delete MAPA_TECLAS[k];
  MAPA_TECLAS.Space = 'salto'; MAPA_TECLAS.Enter = 'ok';
  for (const [a] of ACCIONES) for (const c of teclasDe(a)) if (c) MAPA_TECLAS[c] = a;
}
rehaceMapa();
// pon la tecla c en la casilla n (0 o 1) de la acción a. Si otra acción la tenía, se le quita
function ponTecla(a, n, c) {
  const T = {};
  for (const [b] of ACCIONES) T[b] = teclasDe(b).slice();
  for (const b in T) T[b] = T[b].map(x => (x === c ? null : x));
  T[a][n] = c;
  AJUSTES.teclas = T; guardaAjustes(); rehaceMapa();
}
function teclasDeSerie() { delete AJUSTES.teclas; guardaAjustes(); rehaceMapa(); }

/* ---------- el mando de consola (el de Xbox, PlayStation o cualquiera «estándar») ---------- */
const PAD = { x: 0, y: 0, b: {} };
function leeMandoConsola() {
  PAD.x = PAD.y = 0; PAD.b = {};
  const ps = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const p of ps) {
    if (!p || !p.connected) continue;
    const B = i => !!(p.buttons[i] && p.buttons[i].pressed), ax = p.axes[0] || 0, ay = p.axes[1] || 0;
    PAD.x = B(14) ? -1 : B(15) ? 1 : ax < -0.4 ? -1 : ax > 0.4 ? 1 : PAD.x;
    PAD.y = B(12) ? -1 : B(13) ? 1 : ay < -0.5 ? -1 : ay > 0.5 ? 1 : PAD.y;
    // A salta, X (o el gatillo derecho) dispara, B (o el gatillo izquierdo) lanza la zanahoria, Y es el CAOS, START la pausa
    if (B(0)) PAD.b.salto = true; if (B(2) || B(7) || B(5)) PAD.b.fuego = true; if (B(1) || B(6) || B(4)) PAD.b.bomba = true; if (B(3)) PAD.b.caos = true; if (B(9)) PAD.b.pausa = true;
    if (B(0)) PAD.b.ok = true;
  }
}

/* ---------- Opciones → Controles ---------- */
const TUI = { on: false, fila: 0, col: 0, espera: false, antesY: 0, antesX: 0 };
const TUI_Y0 = 36, TUI_ALTO = 14;
const tuiFilas = () => ACCIONES.length + 2;   // las acciones, «de serie» y «volver»
function abreTeclas() { TUI.on = true; TUI.fila = 0; TUI.col = 0; TUI.espera = false; play('select'); }
function geoTeclas() { const x0 = Math.round(J.W / 2 - 128); return { x0, c0: x0 + 132, c1: x0 + 194, w: 58 }; }
// la tecla que llega mientras se espera una: se asigna (Esc cancela). Devuelve true si se la ha quedado
function teclaParaControles(e) {
  if (!TUI.espera) return false;
  e.preventDefault();
  TUI.espera = false;
  if (e.code !== 'Escape') { ponTecla(ACCIONES[TUI.fila][0], TUI.col, e.code); play('select'); } else play('deny');
  for (const k in TECLA) TECLA[k] = false;
  TUI.trago = true;   // el paso siguiente no hace nada (esa tecla ya se ha usado)
  return true;
}
function eligeFila(f) {
  if (f < ACCIONES.length) { TUI.espera = true; play('blip'); }
  else if (f === ACCIONES.length) { teclasDeSerie(); play('select'); avisa('CONTROLES DE SERIE: WASD O FLECHAS PARA MOVERTE, J O Z DISPARA, K O X SALTA, L O C LANZA LA ZANAHORIA, I O V EL CAOS.'); }
  else { TUI.on = false; play('select'); }
}
function pasoTeclas() {
  const m = MANDO;
  if (TUI.trago) { TUI.trago = false; return; }
  if (TUI.espera) return;
  if (m.p.pausa) { TUI.on = false; return; }
  const n = tuiFilas();
  if (m.y && !TUI.antesY) { TUI.fila = (TUI.fila + m.y + n) % n; play('blip'); }
  if (m.x && !TUI.antesX && TUI.fila < ACCIONES.length) { TUI.col = TUI.col ? 0 : 1; play('blip'); }
  TUI.antesY = m.y; TUI.antesX = m.x;
  if (m.pok || m.p.fuego || m.p.salto) { eligeFila(TUI.fila); return; }
  const q = m.toque;
  if (q) {
    const f = Math.floor((q.y - TUI_Y0 + 3) / TUI_ALTO), G = geoTeclas();
    if (f < 0 || f >= n) return;
    if (f < ACCIONES.length) { if (q.x >= G.c0 && q.x < G.c0 + G.w) TUI.col = 0; else if (q.x >= G.c1 && q.x < G.c1 + G.w) TUI.col = 1; else return; }
    TUI.fila = f; eligeFila(f);
  }
}
function pintaTeclas(g) {
  const W = J.W, H = J.H, G = geoTeclas();
  velo(g, 0.95);
  escribe(g, tr('CONTROLES DEL TECLADO'), W / 2, 10, { alin: 'centro', esc: 2, c: ORO_ROTULO });
  ACCIONES.forEach(([a, s], k) => {
    const y = TUI_Y0 + k * TUI_ALTO, sel = TUI.fila === k;
    escribe(g, tr(s), G.x0, y + 1, { c: sel ? ORO_ROTULO : BLANCO_ROTULO });
    teclasDe(a).forEach((c, n) => {
      const x = n ? G.c1 : G.c0, on = sel && TUI.col === n, espera = on && TUI.espera;
      rect(g, x, y - 2, G.w, 12, on ? '#2c4a7a' : '#141c30');
      if (on) marcoFino(g, x, y - 2, G.w, 12, espera ? '#9ef07a' : '#ffd23c');
      escribe(g, espera ? (J.t & 16 ? tr('PULSA...') : '') : nombreTecla(c), x + G.w / 2, y + 1, { alin: 'centro', fuente: 'mini', c: c ? BLANCO_ROTULO : '#8490a4' });
    });
  });
  [tr('PONER LOS DE SERIE'), tr('VOLVER')].forEach((s, k) => {
    const f = ACCIONES.length + k, y = TUI_Y0 + f * TUI_ALTO + 4, sel = TUI.fila === f;
    escribe(g, s, W / 2, y, { alin: 'centro', c: sel ? ORO_ROTULO : BLANCO_ROTULO });
    if (sel) { const w = anchoTexto(s) + 16; marcoFino(g, Math.round(W / 2 - w / 2), y - 3, w, 13); }
  });
  const ayuda = envuelve(tr(TUI.espera ? 'PULSA LA TECLA NUEVA (ESC: DEJARLA COMO ESTABA)' : 'ELIGE UNA CASILLA Y PULSA LA TECLA. RATÓN: CLIC DISPARA, CLIC DERECHO ZANAHORIA. MANDO DE CONSOLA: SE ENCHUFA Y VA.'), W - 16, 1, 'mini');
  ayuda.forEach((s, k) => escribe(g, s, W / 2, H - 9 - (ayuda.length - 1 - k) * 8, { alin: 'centro', fuente: 'mini', c: '#c8d2e6' }));
  pintaAviso2(g);
}
// la ayuda del título: las teclas de ahora
function ayudaTeclas() {
  const k = a => teclasDe(a).filter(Boolean).map(nombreTecla).join(' O ') || '---';
  const mov = ['arr', 'izq', 'aba', 'der'].map(a => nombreTecla(teclasDe(a)[0]));
  const flechas = ['arr', 'izq', 'aba', 'der'].every((a, i) => teclasDe(a)[1] === ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'][i]);
  return [tr('MOVER') + ': ' + (mov.every(s => s.length === 1) ? mov.join('') : mov.join(' ')) + (flechas ? ' ' + tr('O FLECHAS') : '') + '   ' + tr('DISPARAR') + ': ' + k('fuego') + '   ' + tr('SALTAR') + ': ' + k('salto'),
    tr('ZANAHORIA') + ': ' + k('bomba') + '   ' + tr('CAOS') + ': ' + k('caos') + '   ' + tr('PAUSA') + ': ' + k('pausa') + '   ' + tr('(CÁMBIALOS EN OPCIONES)')];
}
