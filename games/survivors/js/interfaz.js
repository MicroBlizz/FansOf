// Fans of Survivors · La partida en pantalla: el tamaño, los controles (dedo, WASD y flechas), subir de nivel, la pausa,
// el final con sus premios y el bucle que mueve todo. Se carga el último: al acabar, enseña el menú principal.
'use strict';

/* ---------- el tamaño: 540 x 960 que se agranda o encoge según la pantalla ---------- */
const cv = $('#cv');
function ajustar() {
  const w = window.innerWidth, h = window.innerHeight;
  ESCALA = Math.min(w / VW, h / VH); DPR = Math.min(SAVE.ahorro ? 1.25 : 2, window.devicePixelRatio || 1);
  const st = $('#stage'); st.style.width = VW * ESCALA + 'px'; st.style.height = VH * ESCALA + 'px';
  cv.width = Math.round(VW * ESCALA * DPR); cv.height = Math.round(VH * ESCALA * DPR);
  $('#ui').style.transform = `scale(${ESCALA})`;
  ctx = cv.getContext('2d'); ctx.imageSmoothingQuality = 'high'; PAT = null;
  for (const k in ICONOS) delete ICONOS[k];
}
window.addEventListener('resize', ajustar);

/* ---------- los controles: teclado (WASD o flechas) y dedo (arrastrar en cualquier sitio) ---------- */
const TECLAS = new Set();
const TACTIL = { activo: false, id: null, ox: 0, oy: 0 };
function mandoTeclado() {
  if (TACTIL.activo) return;
  let x = 0, y = 0;
  if (TECLAS.has('arrowleft') || TECLAS.has('a')) x--; if (TECLAS.has('arrowright') || TECLAS.has('d')) x++;
  if (TECLAS.has('arrowup') || TECLAS.has('w')) y--; if (TECLAS.has('arrowdown') || TECLAS.has('s')) y++;
  const l = Math.hypot(x, y) || 1; MANDO.x = x / l; MANDO.y = y / l;
}
const jugando = () => enPartida() && P && P.estado === 'jugando';
window.addEventListener('keydown', e => {
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  const k = e.key.toLowerCase(); TECLAS.add(k); mandoTeclado();
  if ((k === 'escape' || k === 'p') && jugando()) pausar();
  else if ((k === 'escape' || k === 'p') && P && P.estado === 'pausa') seguir();
  if (P && P.estado === 'nivel' && ['1', '2', '3'].includes(k)) { const b = document.querySelectorAll('#niv-ops button')[+k - 1]; if (b) b.click(); }
  if (enPartida() && (k.startsWith('arrow') || k === ' ')) e.preventDefault();
});
window.addEventListener('keyup', e => { TECLAS.delete(e.key.toLowerCase()); mandoTeclado(); });
window.addEventListener('blur', () => { TECLAS.clear(); mandoTeclado(); if (jugando()) pausar(); });
const aLogico = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / ESCALA, y: (e.clientY - r.top) / ESCALA }; };
cv.addEventListener('pointerdown', e => {
  if (!jugando() || TACTIL.activo) return;
  audioInit();
  const p = aLogico(e); TACTIL.activo = true; TACTIL.id = e.pointerId; TACTIL.ox = p.x; TACTIL.oy = p.y; MANDO.x = MANDO.y = 0;
  try { cv.setPointerCapture(e.pointerId); } catch (er) { /* da igual */ }
});
cv.addEventListener('pointermove', e => {
  if (!TACTIL.activo || e.pointerId !== TACTIL.id) return;
  const p = aLogico(e), dx = p.x - TACTIL.ox, dy = p.y - TACTIL.oy, d = Math.hypot(dx, dy);
  if (d > 56) { TACTIL.ox += dx - (dx / d) * 56; TACTIL.oy += dy - (dy / d) * 56; }   // el mando sigue al dedo si se aleja mucho
  const k = Math.min(1, d / 56); MANDO.x = d ? (dx / d) * k : 0; MANDO.y = d ? (dy / d) * k : 0;
});
const soltar = e => { if (e.pointerId !== TACTIL.id) return; TACTIL.activo = false; TACTIL.id = null; MANDO.x = MANDO.y = 0; mandoTeclado(); };
cv.addEventListener('pointerup', soltar); cv.addEventListener('pointercancel', soltar);
const sueltaMando = () => { TACTIL.activo = false; TACTIL.id = null; MANDO.x = MANDO.y = 0; };

/* ---------- empezar, subir de nivel, pausa ---------- */
function empezar() {
  audioInit(); hideScreens(); VISTA = 'juego'; $('#hud').hidden = false; sueltaMando();
  nuevaPartida(); play('go');
}
function abrirNivel() {
  P.estado = 'nivel'; P.pendientes--; sueltaMando();
  const ops = opcionesNivel(3);
  $('#scr-nivel').hidden = false; play('levelup');
  $('#niv-titulo').innerHTML = `${tr('¡ASCENSO!')}<small>${tr('NIVEL')} ${P.nivel - P.pendientes}</small>`;
  const box = $('#niv-ops'); box.innerHTML = '';
  ops.forEach((op, i) => {
    const b = document.createElement('button'); b.className = 'op' + (op.nuevo ? ' nuevo' : '');
    const ic = iconoOp(op);
    const tx = document.createElement('div'); tx.className = 'op-tx';
    tx.innerHTML = `<div class="op-nom ol">${tr(op.nombre)} <span class="op-nv">${op.clase === 'relleno' ? '' : op.nuevo ? tr('¡NUEVO!') : tr('Nivel ' + op.nivelNuevo)}</span></div><div class="op-desc">${tr(op.desc)}</div>`;
    b.append(ic, tx);
    b.onclick = () => { aplicarOpcion(op); P.estado = 'jugando'; $('#scr-nivel').hidden = true; if (P.pendientes > 0) abrirNivel(); };
    b.style.animationDelay = (i * 0.06) + 's';
    box.appendChild(b);
  });
}
const FRASES_PAUSA = ['Los becarios no tienen pausa. Tú sí.', 'El CEO aprovecha la pausa para subir los precios.', 'Microblizz ya está pensando qué juego cerrar ahora.', 'SurvivalBot también se toma un café. Descafeinado.'];
function pausar() {
  if (!jugando()) return;
  P.estado = 'pausa'; sueltaMando(); stat('pause', 1); soundBtns();
  $('#pause-quote').textContent = pick(FRASES_PAUSA);
  const L = Object.keys(P.armas).map(k => `<li><b>${ARMAS[k].nombre}</b> · Nivel ${P.armas[k]}</li>`).concat(Object.keys(P.pasivas).map(k => `<li>${PASIVAS[k].icono} <b>${PASIVAS[k].nombre}</b> · Nivel ${P.pasivas[k]}</li>`));
  $('#pau-lista').innerHTML = L.join('');
  $('#scr-pause').hidden = false;
}
function seguir() { if (!P || P.estado !== 'pausa') return; P.estado = 'jugando'; $('#scr-pause').hidden = true; }
$('#btn-pause').onclick = () => { play('select'); pausar(); };
$('#btn-resume').onclick = () => { play('select'); seguir(); };
$('#btn-quit').onclick = () => { play('select'); $('#scr-pause').hidden = true; P.estado = 'jugando'; perder(); };
document.addEventListener('visibilitychange', () => { if (document.hidden && jugando()) pausar(); });

/* ---------- el final: premios, misiones y logros ---------- */
function mostrarFin() {
  const g = P.ganado, t = P.ganado ? P.t : Math.min(P.t, SV.duracion), E = ECON.partida, min = Math.floor(t / 60);
  const F = FACTIONS.animales, usadas = Object.keys(P.armas);
  // oro y gemas
  const gold = Math.round(min * E.porMinuto + (P.kills / 100) * E.por100Bajas + (g ? E.victoria : 0) + P.oroCajas), gems = g ? E.gemasVictoria : 0;
  // experiencia: para el líder y para cada carta-arma que has usado
  const xp1 = Math.round(Math.max(1, min) * E.xpPorMinuto * (g ? ECON.winXpMult : 1)), cartas = new Set([F.leader]);
  for (const a of usadas) cartas.add(ARMAS[a].carta);
  for (const k of cartas) uSave(k).xp += xp1;
  cierraRetos(g, { t, kills: P.kills, nivel: P.nivel, cofres: P.cofres, elites: P.elites, armas: usadas, vida: P.jug.vida / P.jug.vidaMax });
  let rw = give(gold, gems, xp1 * cartas.size, { tipo: 'otro', victoria: g }) + passMatch(g);
  // objetos que han salido de las cajas: sin servidor se dan aquí; con servidor aún no hay camino validado (pendiente)
  if (P.objetosCajas && !ECO.servidor('economia')) {
    const got = []; for (let i = 0; i < P.objetosCajas; i++) got.push(idleItem());
    saveGame(); rw += got.map(it => { const D = defOf(it); return `<div class="rw-xp">${tr('¡Una caja escondía un objeto! Ya lo tienes en el inventario:')} <b>${D.name}</b></div>`; }).join('');
  }
  // la pantalla
  $('#hud').hidden = true; hideScreens(); $('#scr-end').hidden = false;
  const ti = $('#end-title'); ti.textContent = g ? '¡HAS GANADO!' : 'TE HAN DESPEDIDO'; ti.className = 'end-title ol-big ' + (g ? 'win' : 'lose'); fitText(ti, 74, 34);
  $('#end-crowns').innerHTML = '';
  $('#end-sub').textContent = g ? `SurvivalBot despedido en ${mmss(P.t - SV.duracion)} de pelea.` : `Has aguantado ${mmss(t)} contra la plantilla de Microblizz.`;
  $('#end-rewards').innerHTML = rw; $('#end-quote').textContent = pick(g ? QUOTES.p : QUOTES.e);
  $('#st-0').textContent = mmss(t); $('#st-1').textContent = fmt(P.kills); $('#st-2').textContent = P.nivel;
  $('#btn-next').hidden = true;
  $('#btn-again').onclick = () => { play('select'); empezar(); };
  if (AC) { M.want = g ? 'win' : 'lose'; musicSet(M.want); }
  play(g ? 'win' : 'lose');
}
$('#btn-menu').onclick = () => { play('select'); showMenu(); };

/* ---------- el bucle ---------- */
let antes = performance.now();
function fotograma(ahora) {
  const dt = Math.min(0.05, (ahora - antes) / 1000); antes = ahora;
  if (enPartida() && P) { actualizar(dt); dibujar(); }
  else { fondoMenu(dt); idleFrame(dt); }   // horas extra: su escena solo se mueve mientras se ve el menú
  requestAnimationFrame(fotograma);
}
// detrás de los menús: el campo, moviéndose despacio
let menuT = 0;
function fondoMenu(dt) {
  menuT += dt; if (!PAT) hacerSuelo();
  ctx.setTransform(ESCALA * DPR, 0, 0, ESCALA * DPR, 0, 0);
  ctx.save(); ctx.translate(-(menuT * 20 % 256), -(menuT * 12 % 256)); ctx.scale(1 / PAT.K, 1 / PAT.K);
  ctx.fillStyle = ctx.createPattern(PAT.c, 'repeat'); ctx.fillRect(0, 0, (VW + 512) * PAT.K, (VH + 512) * PAT.K); ctx.restore();
}

/* ---------- arrancar ---------- */
$('#btn-jugar').onclick = () => { play('select'); empezar(); };
buildSprites();
ajustar(); soundBtns();
showMenu();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { for (const k in ICONOS) delete ICONOS[k]; });
requestAnimationFrame(fotograma);
