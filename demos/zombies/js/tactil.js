// Fans of Zombies · EL MÓVIL (adaptador, ADR 081): solo en pantallas táctiles (en PC no sale nada). Una palanca a la izquierda para
// andar (llevando el dedo más allá del aro, corres) y botones a la derecha: ATACAR (se mantiene y apunta solo al fan más cercano),
// EMPUJAR, ACCIÓN (abrir, registrar, subir al coche…), CORRER y AGACHARSE; arriba MOCHILA, MAPA, DORMIR, TABLAS, GASOLINA, FAROS y PAUSA.
// Tocar el arma la cambia y tocar COMER, BEBER o VENDAS los usa. Los botones hacen lo mismo que su tecla (entran en ENTRADA como si se
// hubiera pulsado), así que el juego no sabe si juegas con teclado o con el dedo. De pie se pide girar el móvil.
'use strict';
const TACTIL = { activo: false, mx: 0, mz: 0, fuerte: 0, corre: false };
const R_PALANCA = 50, CORRE_PALANCA = 1.3;   // radio del aro (px) y cuánto más allá de él se corre
const BOTONES_TACTIL = [
  // [id, texto, tecla, mantener]
  ['t-ataca', 'ATACAR', 'Space', true], ['t-empuja', 'EMPUJAR', 'KeyR'], ['t-accion', 'ACCIÓN', 'KeyF'], ['t-corre', 'CORRER', 'ShiftLeft', 'fija'], ['t-agacha', 'AGACHAR', 'KeyC'],
  ['t-mochila', 'MOCHILA', 'Tab'], ['t-mapa', 'MAPA', 'KeyM'], ['t-duerme', 'DORMIR', 'KeyZ'], ['t-tablas', 'TABLAS', 'KeyB'], ['t-gasolina', 'GASOLINA', 'KeyG'], ['t-faros', 'FAROS', 'KeyL'], ['t-pausa', 'PAUSA', 'Escape'],
];
const TECLA_HOTBAR = { E: 'KeyE', Q: 'KeyQ', V: 'KeyV', TAB: 'Tab' };

function preparaTactil() {
  TACTIL.activo = matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window && !matchMedia('(any-pointer: fine)').matches);
  document.body.classList.toggle('tactil', TACTIL.activo);
  if (!TACTIL.activo) return;
  VM.celda = 30;                                          // la mochila, más pequeña para que quepa
  const m = document.createElement('div'); m.id = 'zb-mandos';
  m.innerHTML = '<div class="t-palanca" id="t-palanca"><i></i></div>' +
    BOTONES_TACTIL.map(([id, t]) => '<button type="button" class="t-boton" id="' + id + '">' + esc(tr(t)) + '</button>').join('') +
    '';
  document.body.appendChild(m);
  const g = document.createElement('div'); g.id = 't-gira'; g.innerHTML = '<b>' + esc(tr('Gira el móvil para jugar')) + '</b>'; document.body.appendChild(g);   // encima de todo
  for (const b of BOTONES_TACTIL) botonTactil(...b);
  palancaTactil(el('t-palanca'));
  el('zb').addEventListener('pointerdown', tocaHud);   // el arma, la hotbar y el cartel de acción también se tocan
  addEventListener('pointerup', pantallaCompleta, true);
}
// un botón: un toque es un pulso de su tecla; los de mantener la tienen pulsada mientras hay dedo; CORRER se queda puesto
function botonTactil(id, txt, tecla, modo) {
  const b = el(id);
  b.addEventListener('pointerdown', (ev) => {
    ev.preventDefault(); ev.stopPropagation();
    if (modo === 'fija') { const on = !ENTRADA.abajo.has(tecla); if (on) ENTRADA.abajo.add(tecla); else ENTRADA.abajo.delete(tecla); b.classList.toggle('on', on); return; }
    ENTRADA.pulsos.add(tecla);
    if (modo) { ENTRADA.abajo.add(tecla); b.setPointerCapture(ev.pointerId); b.classList.add('on'); }
  });
  if (modo === true) for (const t of ['pointerup', 'pointercancel']) b.addEventListener(t, () => { ENTRADA.abajo.delete(tecla); b.classList.remove('on'); });
}
// la palanca: aparece donde pones el dedo dentro de su zona (la mitad izquierda de la pantalla)
function palancaTactil(zona) {
  const bola = zona.querySelector('i'); let dedo = null, cx = 0, cy = 0;
  const pon = (x, y) => { bola.style.left = x + 'px'; bola.style.top = y + 'px'; };
  zona.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    if (dedo !== null) return;                            // un segundo dedo no le quita la palanca al primero
    dedo = ev.pointerId; zona.setPointerCapture(dedo);
    cx = ev.clientX; cy = ev.clientY; zona.style.setProperty('--cx', cx + 'px'); zona.style.setProperty('--cy', cy + 'px'); zona.classList.add('activa'); pon(cx, cy);
  });
  zona.addEventListener('pointermove', (ev) => {
    if (ev.pointerId !== dedo) return;
    let dx = (ev.clientX - cx) / R_PALANCA, dy = (ev.clientY - cy) / R_PALANCA;
    const m = Math.hypot(dx, dy);
    if (m > 1) { dx /= m; dy /= m; }
    TACTIL.mx = m > 0.2 ? dx : 0; TACTIL.mz = m > 0.2 ? dy : 0; TACTIL.corre = m > CORRE_PALANCA;
    zona.classList.toggle('corre', TACTIL.corre); pon(cx + dx * R_PALANCA, cy + dy * R_PALANCA);
  });
  const fin = (ev) => { if (ev.pointerId !== dedo) return; dedo = null; TACTIL.mx = TACTIL.mz = 0; TACTIL.corre = false; zona.classList.remove('activa', 'corre'); };
  zona.addEventListener('pointerup', fin); zona.addEventListener('pointercancel', fin);
}
// tocar el HUD: el arma (la siguiente que llevas), COMER / BEBER / VENDAS / MOCHILA y el cartel de lo que tienes al lado
function tocaHud(ev) {
  const t = ev.target;
  if (t.closest('#h-arma')) return pulsoTactil(ev, siguienteArmaTactil());
  if (t.closest('#h-accion')) return pulsoTactil(ev, 'KeyF');
  const s = t.closest('#h-mochila span'), k = s && s.querySelector('em');
  if (k && TECLA_HOTBAR[k.textContent]) pulsoTactil(ev, TECLA_HOTBAR[k.textContent]);
}
function pulsoTactil(ev, tecla) { if (!tecla) return; ev.preventDefault(); ENTRADA.pulsos.add(tecla); }
// la tecla (1 a 6) de la siguiente arma que llevas
function siguienteArmaTactil() {
  const e = JUEGO.e, ids = Object.keys(ZOM.AJ.armas).slice(0, 6), i = ids.indexOf(e && e.jugador.arma);
  for (let k = 1; k <= ids.length; k++) { const j = (i + k) % ids.length; if (ZOM.lleva(e.jugador, ids[j])) return 'Digit' + (j + 1); }
  return null;
}
// lo que el móvil cambia en la entrada: la palanca anda (y corre), y al atacar o empujar te giras solo hacia el fan más cercano
function entradaTactil(J, ent) {
  el('t-corre').classList.toggle('on', ENTRADA.abajo.has('ShiftLeft'));   // CORRER puesto o no (se quita al volver al menú o al salir de la página)
  if (TACTIL.mx || TACTIL.mz) { ent.mx = TACTIL.mx; ent.mz = TACTIL.mz; ent.apunta = Math.atan2(TACTIL.mx, TACTIL.mz); }
  if (TACTIL.corre) ent.corre = true;
  if (!ent.ataca && !ent.empuja) return ent;
  const W = ZOM.AJ.armas[J.arma], z = ZOM.blancoCerca(JUEGO.e, ent.empuja ? 3 : Math.max(3, W.alcance * 1.1));
  if (z) ent.apunta = Math.atan2(z.x - J.x, z.z - J.z);
  return ent;
}
// en el móvil, al tocar con la partida empezada se pone a pantalla completa y tumbado (si el navegador deja)
function pantallaCompleta() {
  if (!JUEGO.e || document.fullscreenElement || !document.documentElement.requestFullscreen) return;
  document.documentElement.requestFullscreen().then(() => (screen.orientation && screen.orientation.lock ? screen.orientation.lock('landscape') : null)).catch(() => {});
}
