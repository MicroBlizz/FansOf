// Fans of Crush · PRINCIPAL: el lienzo y su tamaño, la portada, los toques (arrastrar fichas, potenciadores, el mapa), instalar como app,
// el bucle de cada fotograma y el arranque.
'use strict';
const CR_CV = document.getElementById('cv'), CR_CTX = CR_CV.getContext('2d');
const CR_ESCENARIO = document.getElementById('stage'), CR_UI = document.getElementById('cr-ui');
const CR_IN = { sel: null, x0: 0, y0: 0, arrastra: false, martillo: false };

function crAjusta() {
  const bw = document.body.clientWidth, bh = document.body.clientHeight, estrecho = bw < 600, pad = estrecho ? 0 : 24;
  const LH = estrecho ? clamp(Math.round((540 * bh) / Math.max(1, bw)), 960, 1170) : 960;
  let w = bw - pad * 2, h = (w * LH) / 540;
  if (h > bh - pad * 2) { h = bh - pad * 2; w = (h * 540) / LH; }
  w = Math.max(200, Math.floor(w)); h = Math.floor((w * LH) / 540);
  CR_ESCENARIO.style.width = w + 'px'; CR_ESCENARIO.style.height = h + 'px';
  CR_V.H = LH; CR_V.sc = w / 540; CR_V.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  CR_CV.width = Math.round(w * CR_V.dpr); CR_CV.height = Math.round(h * CR_V.dpr);
  CR_UI.style.height = LH + 'px'; CR_UI.style.transform = `scale(${w / 540})`;
  crMide();
  if (CR_PANT.actual === 'mapa') CR_MAPA.s = clamp(CR_MAPA.s, 0, CR_MAPA_LARGO() - CR_V.H);
}
/* ---------- la portada: el logo, chapas que caen y CrazyBunny saludando ---------- */
const CR_LLUVIA = Array.from({ length: 12 }, (_, i) => ({ f: i % 6, x: (i * 97) % 540, y: (i * 173) % 960, v: 34 + (i * 37) % 40, r: (i * 1.7) % 6.28, s: 0.95 + ((i * 13) % 10) / 18 }));
const CR_PORTADA = { clave: '', logo: null, conejo: null };
function crPortadaLienzos() {   // el logo y CrazyBunny se pintan una vez (son lo que más cuesta) y después solo se copian
  const V = CR_V, k = V.sc * V.dpr, clave = [k, VERSION].join(':');
  if (CR_PORTADA.clave === clave) return;
  CR_PORTADA.clave = clave;
  const logo = document.createElement('canvas'); logo.width = Math.ceil(540 * k); logo.height = Math.ceil(260 * k);
  let f = logo.getContext('2d'); f.setTransform(k, 0, 0, k, 0, 0); f.translate(270, 140); f.rotate(-0.04);
  crLetras(f, 'FANS OF', 0, -58, 42, '#ffffff', 0.3, true); crLetras(f, 'CRUSH', 0, 12, 112, '#ff7a96', 0.2, true);
  const conejo = document.createElement('canvas'); conejo.width = Math.ceil(260 * k); conejo.height = Math.ceil(220 * k);
  f = conejo.getContext('2d'); f.setTransform(k, 0, 0, k, 0, 0); f.translate(130, 210); f.scale(2.9, 2.9); f.lineJoin = 'round'; f.lineCap = 'round'; if (ART.bunny) ART.bunny(f);
  Object.assign(CR_PORTADA, { logo, conejo });
}
function crPortadaPinta(c, t, dt) {
  const V = CR_V;
  crFondo(c, CR_FONDO_PORTADA, 11, 0.32);
  crPortadaLienzos();
  for (const L of CR_LLUVIA) {
    L.y += L.v * dt; L.r += dt * 0.6; if (L.y > V.H + 60) { L.y = -60; L.x = Math.random() * 540; }
    const sp = crSprite('n', L.f, V.px); crPonSprite(c, sp, L.x, L.y, V.k * L.s, V.k * L.s, 0.85, Math.sin(L.r) * 0.3);
  }
  const y0 = V.H * 0.22 + Math.sin(t * 1.6) * 4;
  c.drawImage(CR_PORTADA.logo, 0, y0 - 140, 540, 260);
  for (let i = 0; i < 6; i++) { const a = t * 1.3 + i * 1.05, x = 270 + Math.cos(a) * 200, y = y0 - 10 + Math.sin(a) * 70; c.beginPath(); starPath(c, x, y, 7 + 3 * Math.sin(t * 4 + i), 3); c.fillStyle = '#ffffff'; c.fill(); }
  const by = V.H * 0.62, salto = Math.abs(Math.sin(t * 2.4)) * 16;
  c.beginPath(); c.ellipse(270, by + 6, 70 - salto, 14, 0, 0, CR_TAU); c.fillStyle = 'rgba(74,45,107,.18)'; c.fill();
  c.drawImage(CR_PORTADA.conejo, 140, by - salto - 210, 260, 220);
}
/* ---------- los toques ---------- */
function crLogico(e) { const r = CR_CV.getBoundingClientRect(); return [(e.clientX - r.left) / CR_V.sc, (e.clientY - r.top) / CR_V.sc]; }
function crTocaPote(i) {
  const P = CR_POTES[i];
  if ((SAVE.potes[P.k] || 0) <= 0) { play('select'); crAbreTienda(); return; }
  if (CR_P.estado !== 'jugando' || crOcupado()) return;
  if (P.k === 'martillo') {
    CR_IN.martillo = !CR_IN.martillo; CR_IN.sel = null; play('select');
    if (CR_IN.martillo) crLola('Toca la ficha que quieras despedir. Sin preaviso.', 3, 5);
    return;
  }
  crUsaPote(P.k);
}
function crToqueAbajo(lx, ly) {
  if (CR_PANT.actual === 'mapa') { crMapaAbajo(lx, ly); return; }
  if (CR_PANT.actual !== 'partida' || CR_PANT.pausa) return;
  if (crEnPausa(lx, ly)) { play('select'); crAbrePausa(); return; }
  const i = crPoteEn(lx, ly); if (i >= 0) { crTocaPote(i); return; }
  if (CR_P.estado !== 'jugando') return;
  const cas = crCasillaEn(lx - CR_FX.tx, ly - CR_FX.ty);
  if (!cas) { CR_IN.sel = null; return; }
  const [x, y] = cas;
  if (CR_IN.martillo) { if (!crOcupado() && crUsaPote('martillo', x, y)) CR_IN.martillo = false; else play('crNoVale'); return; }
  if (crOcupado()) return;
  const S = CR_IN.sel;
  if (S && Math.abs(S[0] - x) + Math.abs(S[1] - y) === 1) { CR_IN.sel = null; crJuega(S[0], S[1], x, y); return; }
  if (crMovible(x, y)) { CR_IN.sel = [x, y]; CR_IN.x0 = lx; CR_IN.y0 = ly; CR_IN.arrastra = true; }
  else CR_IN.sel = null;
}
function crToqueMueve(lx, ly) {
  if (CR_PANT.actual === 'mapa') { crMapaMueve(lx, ly); return; }
  if (!CR_IN.arrastra || !CR_IN.sel) return;
  const dx = lx - CR_IN.x0, dy = ly - CR_IN.y0, umbral = CR_V.cel * 0.3;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < umbral) return;
  const [x, y] = CR_IN.sel, [nx, ny] = Math.abs(dx) > Math.abs(dy) ? [x + Math.sign(dx), y] : [x, y + Math.sign(dy)];
  CR_IN.arrastra = false; CR_IN.sel = null;
  if (crDentro(nx, ny)) crJuega(x, y, nx, ny);
}
function crToqueArriba(lx, ly) {
  if (CR_PANT.actual === 'mapa') { crMapaArriba(lx, ly); return; }
  CR_IN.arrastra = false;
}
function crJuega(ax, ay, bx, by) { if (!crTutoPermite(ax, ay, bx, by)) return; crIntenta(ax, ay, bx, by); }
CR_CV.addEventListener('pointerdown', e => { e.preventDefault(); try { CR_CV.setPointerCapture(e.pointerId); } catch (er) { /* sin captura */ } crToqueAbajo(...crLogico(e)); });
CR_CV.addEventListener('pointermove', e => { crToqueMueve(...crLogico(e)); });
CR_CV.addEventListener('pointerup', e => crToqueArriba(...crLogico(e)));
CR_CV.addEventListener('pointercancel', e => crToqueArriba(...crLogico(e)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && CR_PANT.actual === 'partida') { if (CR_PANT.pausa) { crCierraModal(); CR_PANT.pausa = false; } else crAbrePausa(); }
});
/* ---------- instalar como app (el manifiesto y el modo sin conexión los pone NUCLEO) ---------- */
const CR_INST = { evento: null, ios: /iPad|iPhone|iPod/.test(navigator.userAgent), ya: matchMedia('(display-mode: standalone)').matches || navigator.standalone === true };
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); CR_INST.evento = e; crBotonInstalar(); });
window.addEventListener('appinstalled', () => { CR_INST.evento = null; CR_INST.ya = true; crBotonInstalar(); });
const crPuedeInstalar = () => !CR_INST.ya && !NUCLEO.nativa && (!!CR_INST.evento || (CR_INST.ios && location.protocol === 'https:'));
function crBotonInstalar() { const b = $('#cr-instalar'); if (b) b.hidden = !crPuedeInstalar(); }
async function crInstala() {
  play('select');
  if (CR_INST.evento) { CR_INST.evento.prompt(); try { await CR_INST.evento.userChoice; } catch (e) { /* cerrado */ } CR_INST.evento = null; crBotonInstalar(); return; }
  crAviso(tr('INSTALAR EN EL IPHONE'), tr('iPhone: Compartir → Añadir a pantalla de inicio'));
}
/* ---------- el bucle ---------- */
let CR_ULT = 0;
function crFotograma(ahora) {
  requestAnimationFrame(crFotograma);
  const dt = Math.min(0.05, (ahora - CR_ULT) / 1000 || 0.016); CR_ULT = ahora;
  const t = ahora / 1000, c = CR_CTX;
  crDespuesAvanza(dt); crMusicaBucle();
  c.setTransform(CR_V.sc * CR_V.dpr, 0, 0, CR_V.sc * CR_V.dpr, 0, 0);
  if (CR_PANT.actual === 'partida') {
    if (!CR_PANT.pausa) {
      crSigue(dt); crTutoBucle(dt);
      if (CR_P.estado === 'jugando' && !crOcupado() && !CR_TUTO.paso) {
        CR_P.quieto += dt;
        if (!CR_P.pista && CR_P.quieto > (CR_P.N.id <= 2 ? 3 : 6)) { CR_P.pista = crBuscaPista(); if (CR_P.pista && CR_P.N.id <= 3) crLola('Mira las que se mueven solas: ahí hay jugada.', 1, 4); }
      }
    }
    crFxAvanza(dt);
    crPintaPartida(c, t, dt);
    crTutoPinta(c, t);
  } else if (CR_PANT.actual === 'mapa') { crMapaPinta(c, t, dt); crFxAvanza(dt); crFxPinta(c, t); }
  else crPortadaPinta(c, t, dt);
}
function crArranque() {
  crAjusta();
  window.addEventListener('resize', crAjusta);
  $('#cr-jugar').onclick = () => { play('go'); crIrA('mapa'); };
  $('#cr-p-opc').onclick = () => { play('select'); crAbreOpciones(); };
  $('#cr-instalar').onclick = crInstala;
  crBotonInstalar();
  crIrA('titulo');
  if (document.fonts) document.fonts.ready.then(() => { crOlvidaSprites(); CR_FONDO.clave = ''; CR_FONDO_PORTADA.clave = ''; CR_MARCO.clave = ''; CR_PORTADA.clave = ''; });
  requestAnimationFrame(crFotograma);
}
crArranque();
