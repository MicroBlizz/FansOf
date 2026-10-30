// Fans of Ratkov · CONTROLES: teclado y ratón (WASD para andar, el ratón apunta y dispara), dos palancas en el móvil (la izquierda anda,
// la derecha apunta y, si la llevas al borde, dispara) y mando de consola. Todo acaba en ENT, que lee el juego en cada fotograma.
// Las pulsaciones sueltas (recargar, esquivar…) se apuntan en PULSO y el juego las gasta con pulsado('nombre').
'use strict';
const ENT = { mx: 0, mz: 0, ax: 0, az: 1, apunta: false, dispara: false, accion: false, raton: null, tactil: false, mando: false };
const PULSO = new Set();
const pulsado = n => { if (PULSO.has(n)) { PULSO.delete(n); return true; } return false; };
const TECLAS = new Set();
// las teclas de cada acción (se pueden cambiar en Opciones > TECLAS; se guardan en AJUSTES.teclas). «pulso» = lo que se apunta en PULSO
// al pulsarla; sin pulso, la acción se mira mientras la mantienes (andar, correr, registrar)
const ACCIONES_TECLA = [
  { id: 'arriba', n: 'ANDAR HACIA ARRIBA', def: ['KeyW', 'ArrowUp'] }, { id: 'abajo', n: 'ANDAR HACIA ABAJO', def: ['KeyS', 'ArrowDown'] },
  { id: 'izq', n: 'ANDAR A LA IZQUIERDA', def: ['KeyA', 'ArrowLeft'] }, { id: 'der', n: 'ANDAR A LA DERECHA', def: ['KeyD', 'ArrowRight'] },
  { id: 'correr', n: 'CORRER (mantener)', def: ['ShiftLeft', 'ShiftRight'] }, { id: 'agacha', n: 'AGACHARSE', def: ['KeyC'], pulso: 'agacha' },
  { id: 'despide', n: 'GOLPE / DESPEDIR POR LA ESPALDA', def: ['KeyF'], pulso: 'despide' },
  { id: 'accion', n: 'REGISTRAR / FROTAR MANOS', def: ['KeyE'], pulso: 'frota' }, { id: 'esquiva', n: 'ESQUIVAR', def: ['Space'], pulso: 'esquiva' },
  { id: 'recarga', n: 'RECARGAR', def: ['KeyR'], pulso: 'recarga' }, { id: 'granada', n: 'ZANAHORIA BOMBA', def: ['KeyG'], pulso: 'granada' },
  { id: 'cambia', n: 'CAMBIAR DE ARMA', def: ['KeyQ'], pulso: 'cambia' }, { id: 'b1', n: 'BOLSILLO 1', def: ['Digit1'], pulso: 'b1' },
  { id: 'b2', n: 'BOLSILLO 2', def: ['Digit2'], pulso: 'b2' }, { id: 'b3', n: 'BOLSILLO 3', def: ['Digit3'], pulso: 'b3' },
  { id: 'mochila', n: 'MOCHILA', def: ['Tab', 'KeyI'], pulso: 'mochila' }, { id: 'mapa', n: 'MAPA', def: ['KeyM'], pulso: 'mapa' },
  { id: 'pausa', n: 'PAUSA', def: ['KeyP'], pulso: 'pausa' },
];
const teclasDe = id => (AJUSTES.teclas && AJUSTES.teclas[id]) || (ACCIONES_TECLA.find(a => a.id === id) || { def: [] }).def;
const mantiene = id => teclasDe(id).some(c => TECLAS.has(c));
// qué pulsos da cada tecla (se rehace al cambiarlas). Esc siempre pausa
let TECLA_PULSO = {};
function rehaceTeclas() { TECLA_PULSO = { Escape: ['pausa'] }; for (const a of ACCIONES_TECLA) if (a.pulso) for (const c of teclasDe(a.id)) (TECLA_PULSO[c] = TECLA_PULSO[c] || []).push(a.pulso); }
rehaceTeclas();
// el nombre que se enseña de una tecla
function nombreTecla(c) {
  if (!c) return '—';
  const fijos = { Space: tr('ESPACIO'), ShiftLeft: tr('MAYÚS'), ShiftRight: tr('MAYÚS DCHA.'), ControlLeft: 'CTRL', ControlRight: tr('CTRL DCHA.'), AltLeft: 'ALT', AltRight: 'ALT GR', Tab: 'TAB', Escape: 'ESC', Enter: 'INTRO', Backspace: tr('BORRAR'), CapsLock: tr('BLOQ MAYÚS'),
    ArrowUp: tr('FLECHA ARRIBA'), ArrowDown: tr('FLECHA ABAJO'), ArrowLeft: tr('FLECHA IZQ.'), ArrowRight: tr('FLECHA DCHA.'), Backquote: 'º', Minus: "'", Equal: '¡', BracketLeft: '`', BracketRight: '+', Semicolon: 'Ñ', Quote: '´', Backslash: 'Ç', Comma: ',', Period: '.', Slash: '-', IntlBackslash: '<' };
  if (fijos[c]) return fijos[c];
  if (/^Key[A-Z]$/.test(c)) return c.slice(3); if (/^Digit\d$/.test(c)) return c.slice(5); if (/^Numpad/.test(c)) return 'NUM ' + c.slice(6).toUpperCase();
  return c.toUpperCase();
}

// instalado como app en el móvil: al primer toque, pantalla completa (sin la barra de la hora arriba). Si el móvil la quita, al siguiente toque vuelve
const COMO_APP = () => (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true || window.self !== window.top;
function pantallaCompleta() {
  const d = document.documentElement, pide = d.requestFullscreen || d.webkitRequestFullscreen;
  if (!pide || document.fullscreenElement || document.webkitFullscreenElement || !COMO_APP() || !ENT.tactil) return;
  try { const r = pide.call(d, { navigationUI: 'hide' }); if (r && r.catch) r.catch(() => {}); } catch (e) { /* el móvil no deja: se juega igual */ }
}
function preparaControles() {
  window.addEventListener('pointerup', pantallaCompleta, true);
  // táctil = móvil o tableta. Un portátil con pantalla táctil, si tiene ratón o panel, se juega como ordenador
  ENT.tactil = matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window && !matchMedia('(any-pointer: fine)').matches);
  document.body.classList.toggle('tactil', ENT.tactil);
  window.addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (CAPTURA_TECLA) return;   // cambiando una tecla en Opciones
    if (!TECLAS.has(e.code) && TECLA_PULSO[e.code]) for (const p of TECLA_PULSO[e.code]) PULSO.add(p);
    TECLAS.add(e.code);
    if (RAID.activa && (e.code === 'Tab' || e.code === 'Space' || e.code.startsWith('Arrow') || TECLA_PULSO[e.code] || e.code.startsWith('Shift'))) e.preventDefault();
  });
  window.addEventListener('keyup', e => TECLAS.delete(e.code));
  window.addEventListener('blur', () => { TECLAS.clear(); ENT.dispara = false; });
  // el ratón: apunta a donde esté y dispara con el botón izquierdo (solo sobre el juego, no sobre ventanas)
  const cv = el('cv');
  cv.addEventListener('mousemove', e => { ENT.raton = { x: e.clientX, y: e.clientY }; });
  cv.addEventListener('mousedown', e => { if (e.button === 0) ENT.dispara = true; if (e.button === 2) PULSO.add('granada'); ENT.raton = { x: e.clientX, y: e.clientY }; });
  window.addEventListener('mouseup', e => { if (e.button === 0) ENT.dispara = false; });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  // botones de la pantalla
  const boton = (id, n, mantener) => {
    const b = el(id); if (!b) return;
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (mantener) ENT[n] = true; else PULSO.add(n); });
    if (mantener) for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, () => { ENT[n] = false; });
  };
  boton('b-recarga', 'recarga'); boton('b-agacha', 'agacha'); boton('b-esquiva', 'esquiva'); boton('b-granada', 'granada'); boton('b-cambia', 'cambia');
  boton('b-mochila', 'mochila'); boton('b-mapa', 'mapa'); boton('b-pausa', 'pausa');
  el('b-accion').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); PULSO.add(JUG && JUG.blancoDespide ? 'despide' : 'registrar'); });
  // el botón grande de disparar (de pie, con apuntado automático): se mantiene
  const f = el('b-fuego');
  // si no hay a quién disparar y estás junto a algo, el mismo botón registra (un toque basta)
  f.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (f.dataset.modo === 'despide') { PULSO.add('despide'); return; } if (f.dataset.modo === 'accion') { PULSO.add('registrar'); return; } ENT.fuego = true; f.setPointerCapture(e.pointerId); });
  for (const ev of ['pointerup', 'pointercancel']) f.addEventListener(ev, () => { ENT.fuego = false; });
  // ¿de pie o tumbado? Se mira al empezar y cada vez que se gira el móvil
  const mira = () => ponOrientacion(); matchMedia('(orientation: portrait)').addEventListener('change', mira); window.addEventListener('resize', mira); mira();
  // la palanca izquierda: si llevas el dedo bastante más allá del aro, corres
  palanca('p-izq', (x, y, m, bruto) => { ENT.mx = x; ENT.mz = y; ENT.correTactil = bruto > CORRE_PALANCA; }, () => { ENT.mx = 0; ENT.mz = 0; ENT.correTactil = false; });
  palanca('p-der', (x, y, m) => { if (m > 0.2) { ENT.ax = x / m; ENT.az = y / m; ENT.apunta = true; } ENT.dispara = m > 0.62; }, () => { ENT.dispara = false; ENT.apunta = false; });
}
// una palanca táctil: aparece donde pones el dedo dentro de su zona y devuelve el vector (-1 a 1)
// El centro nunca queda pegado a un borde: siempre hay sitio para empujar hasta correr (abajo, además, Android se queda los toques de sus gestos)
const CORRE_PALANCA = 1.3;   // más allá de este tanto del aro, se corre
function palanca(id, mueve, suelta) {
  const zona = el(id), bola = zona.querySelector('i'); let dedo = null, cx = 0, cy = 0;
  const R = 56, lado = Math.round(R * CORRE_PALANCA) + 26, abajo = Math.round(R * CORRE_PALANCA) + 64;
  zona.addEventListener('pointerdown', e => { e.preventDefault(); dedo = e.pointerId; zona.setPointerCapture(dedo); const b = zona.getBoundingClientRect();
    cx = Math.max(lado, Math.min(innerWidth - lado, e.clientX)); cy = Math.max(lado, Math.min(innerHeight - abajo, e.clientY)); zona.classList.add('activa'); bola.style.left = (cx - b.left) + 'px'; bola.style.top = (cy - b.top) + 'px'; zona.style.setProperty('--cx', (cx - b.left) + 'px'); zona.style.setProperty('--cy', (cy - b.top) + 'px'); mover(e); });
  const mover = e => { if (e.pointerId !== dedo) return; let dx = (e.clientX - cx) / R, dy = (e.clientY - cy) / R; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } zona.classList.toggle('corre', m > CORRE_PALANCA); const b = zona.getBoundingClientRect(); bola.style.left = (cx - b.left + dx * R) + 'px'; bola.style.top = (cy - b.top + dy * R) + 'px'; mueve(dx, dy, Math.min(1, m), m); };
  zona.addEventListener('pointermove', mover);
  const fin = e => { if (e.pointerId !== dedo) return; dedo = null; zona.classList.remove('activa', 'corre'); bola.style.left = bola.style.top = ''; zona.style.removeProperty('--cx'); zona.style.removeProperty('--cy'); suelta(); };
  zona.addEventListener('pointerup', fin); zona.addEventListener('pointercancel', fin);
}
// cada fotograma: teclado y mando se juntan en ENT
let MANDO_ANTES = [], CAPTURA_TECLA = null;
function leeControles(jx, jz) {
  // teclado
  if (!ENT.tactil || TECLAS.size || ENT.teclado) {
    let x = 0, z = 0;
    if (mantiene('izq')) x -= 1; if (mantiene('der')) x += 1;
    if (mantiene('arriba')) z -= 1; if (mantiene('abajo')) z += 1;
    const m = Math.hypot(x, z) || 1;
    if (x || z) { ENT.mx = x / m; ENT.mz = z / m; ENT.teclado = true; }
    else if (ENT.teclado || !ENT.tactil) { ENT.mx = 0; ENT.mz = 0; ENT.teclado = false; } // al soltar las teclas, quieto
    ENT.accion = mantiene('accion') || !!ENT.accionB;
    ENT.corre = mantiene('correr');
  } else { ENT.accion = !!ENT.accionB; ENT.corre = !!ENT.correTactil; }
  // el ratón apunta desde el jugador
  if (ENT.raton && !ENT.tactil) { const p = pantallaASuelo(ENT.raton.x, ENT.raton.y), dx = p.x - jx, dz = p.z - jz, m = Math.hypot(dx, dz) || 1; ENT.ax = dx / m; ENT.az = dz / m; ENT.apunta = true; ENT.distRaton = m; }
  // mando
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const g = pads && Array.from(pads).find(p => p && p.connected);
  if (g) {
    const dz0 = v => (Math.abs(v) < 0.18 ? 0 : v);
    const lx = dz0(g.axes[0]), ly = dz0(g.axes[1]), rx = dz0(g.axes[2] || 0), ry = dz0(g.axes[3] || 0);
    if (lx || ly) { ENT.mx = lx; ENT.mz = ly; ENT.mando = true; }
    if (rx || ry) { const m = Math.hypot(rx, ry); ENT.ax = rx / m; ENT.az = ry / m; ENT.apunta = true; ENT.mando = true; }
    const b = i => !!(g.buttons[i] && g.buttons[i].pressed);
    const nuevo = i => b(i) && !MANDO_ANTES[i];
    if (ENT.mando) ENT.dispara = b(7) || b(5);
    if (nuevo(0)) PULSO.add('esquiva'); if (nuevo(2)) PULSO.add('recarga'); if (nuevo(3)) PULSO.add('cambia'); if (nuevo(4)) PULSO.add('granada'); if (nuevo(1)) PULSO.add('frota');
    if (nuevo(8)) PULSO.add('mochila'); if (nuevo(9)) PULSO.add('pausa'); if (nuevo(14)) PULSO.add('b1'); if (nuevo(15)) PULSO.add('b2'); if (nuevo(13)) PULSO.add('b3');
    if (ENT.mando) { ENT.accion = ENT.accion || b(1); ENT.corre = ENT.corre || b(10); }
    if (nuevo(11)) PULSO.add('agacha'); if (nuevo(12)) PULSO.add('despide');
    MANDO_ANTES = g.buttons.map(x => x.pressed);
  }
}

/* ---------- de pie o tumbado ---------- */
// En el móvil hay dos maneras de jugar (Opciones, «Apuntado automático»): sí = una palanca y un botón de disparar que apunta solo al
// enemigo más cercano (lo normal); no = dos palancas. De pie y tumbado se colocan distinto. El cuerpo de la página lleva las clases para el CSS.
const ORIENTA = { vertical: false };
const modoAuto = () => ENT.tactil && AJUSTES.autoApunta !== false;
function ponOrientacion() {
  const v = window.innerHeight > window.innerWidth;
  if (v !== ORIENTA.vertical && typeof RAID !== 'undefined' && RAID.activa) avisa(tr(v ? 'Móvil de pie: controles en vertical.' : 'Móvil tumbado: controles en horizontal.'), 'info');
  ORIENTA.vertical = v;
  const b = document.body.classList; b.toggle('vertical', v); b.toggle('horizontal', !v);
  b.toggle('modo-auto', AJUSTES.autoApunta !== false); b.toggle('modo-palancas', AJUSTES.autoApunta === false);
  ENT.dispara = false; ENT.fuego = false; ENT.mx = 0; ENT.mz = 0;
}
// el apuntado automático: el enemigo vivo más cercano que se vea y esté a tiro; si no hay, hacia donde andas
function apuntaSolo(J, st) {
  let mejor = null, dMin = st ? st.alc * 1.05 : 18;
  for (const e of ENEMIGOS) { if (!e.vivo) continue; const d = lejos(J.x, J.z, e.x, e.z); if (d < dMin && seVe(J.x, J.z, e.x, e.z)) { dMin = d; mejor = e; } }
  const b = el('h-blanco'); ENT.blanco = mejor;
  if (mejor) {
    const dx = mejor.x - J.x, dz = mejor.z - J.z, m = Math.hypot(dx, dz) || 1; ENT.ax = dx / m; ENT.az = dz / m; ENT.apunta = true;
    const p = sueloAPantalla(mejor.x, 1.2, mejor.z); b.hidden = false; b.style.left = p.x + 'px'; b.style.top = p.y + 'px';
  } else { ENT.apunta = !!ENT.fuego; if (Math.hypot(ENT.mx, ENT.mz) > 0.2) { ENT.ax = Math.sin(J.a); ENT.az = Math.cos(J.a); } b.hidden = true; }
  ENT.dispara = !!ENT.fuego;
  return mejor;
}
