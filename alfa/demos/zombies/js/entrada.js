// Fans of Zombies · TECLADO Y RATÓN (adaptador): lee las teclas y el ratón y los deja como la entrada que piden las reglas
// ({ mx, mz, corre, agacha, apunta, ataca, arma, usar, dormir, registrar }). Para PC: WASD o flechas para andar, Mayús para correr,
// C para agacharse, clic o espacio para atacar, clic derecho o R para empujar, 1 a 6 cambian de arma, F registra, Tab abre la mochila,
// B clava tablas en la puerta o ventana de al lado, E come, Q bebe, V venda, Z duerme, Esc pausa. F junto a una puerta la abre o cierra. Con la mochila abierta solo se anda (los clics son para la mochila).
// En el móvil, js/tactil.js pone la palanca y los botones (que pulsan estas mismas teclas) y apunta solo.
'use strict';
const TECLAS_ZOM = {
  arriba: ['KeyW', 'ArrowUp'], abajo: ['KeyS', 'ArrowDown'], izq: ['KeyA', 'ArrowLeft'], der: ['KeyD', 'ArrowRight'], corre: ['ShiftLeft', 'ShiftRight'],
  agacha: ['KeyC', 'ControlLeft'], ataca: ['Space'], empuja: ['KeyR'], arma1: ['Digit1'], arma2: ['Digit2'], arma3: ['Digit3'], arma4: ['Digit4'], arma5: ['Digit5'], arma6: ['Digit6'], registra: ['KeyF'], reposta: ['KeyG'], tablas: ['KeyB'], come: ['KeyE'], bebe: ['KeyQ'], venda: ['KeyV'],
  duerme: ['KeyZ'], pausa: ['Escape', 'KeyP'], mochila: ['Tab', 'KeyI'], mapa: ['KeyM'], faros: ['KeyL'],
};
const ENTRADA = { abajo: new Set(), pulsos: new Set(), raton: { x: 0, y: 0, abajo: false, visto: false, derecho: false } };
function preparaEntrada() {
  addEventListener('keydown', (ev) => { if (!ENTRADA.abajo.has(ev.code)) ENTRADA.pulsos.add(ev.code); ENTRADA.abajo.add(ev.code); if (ev.code === 'Space' || ev.code === 'Tab') ev.preventDefault(); });
  addEventListener('keyup', (ev) => ENTRADA.abajo.delete(ev.code));
  addEventListener('blur', () => ENTRADA.abajo.clear());
  const cv = el('cv');
  cv.addEventListener('mousemove', (ev) => { ENTRADA.raton.x = ev.clientX; ENTRADA.raton.y = ev.clientY; ENTRADA.raton.visto = true; });
  cv.addEventListener('mousedown', (ev) => { if (ev.button === 0) ENTRADA.raton.abajo = true; if (ev.button === 2) ENTRADA.raton.derecho = true; });
  addEventListener('mouseup', () => { ENTRADA.raton.abajo = false; });
  cv.addEventListener('contextmenu', (ev) => ev.preventDefault());
  preparaTactil();                                        // los botones del móvil (js/tactil.js)
}
const mantiene = (acc) => TECLAS_ZOM[acc].some((k) => ENTRADA.abajo.has(k));
const pulsa = (acc) => TECLAS_ZOM[acc].some((k) => ENTRADA.pulsos.has(k));
// la entrada de este fotograma (cerca = el sitio que se puede registrar, si lo hay). Gasta los pulsos.
function leeEntrada(J, cerca, hueco) {
  const mx = (mantiene('der') ? 1 : 0) - (mantiene('izq') ? 1 : 0), mz = (mantiene('abajo') ? 1 : 0) - (mantiene('arriba') ? 1 : 0);
  if (VM.abierta || VMAPA.abierto) return entradaQuieta(mx, mz);
  if (TACTIL.activo) ENTRADA.raton.abajo = ENTRADA.raton.visto = false;   // en el móvil, los toques no son el ratón
  const empuja = ENTRADA.raton.derecho || pulsa('empuja'); ENTRADA.raton.derecho = false;
  const ent = { mx, mz, corre: mantiene('corre'), agacha: pulsa('agacha'), apunta: apuntaRaton(J, mx, mz), ataca: ENTRADA.raton.abajo || mantiene('ataca'), empuja,
    arma: armaPulsada(), usar: pulsa('venda') ? 'venda' : null, come: pulsa('come'), bebe: pulsa('bebe'), dormir: pulsa('duerme'), ...sitioPulsado(cerca, hueco) };
  return TACTIL.activo ? entradaTactil(J, ent) : ent;
}
// con la mochila o el mapa abiertos solo se anda
function entradaQuieta(mx, mz) {
  ENTRADA.raton.derecho = false; TACTIL.mx = TACTIL.mz = 0;
  return { mx, mz, corre: mantiene('corre'), agacha: false, apunta: mx || mz ? Math.atan2(mx, mz) : null, ataca: false, empuja: false, arma: null, usar: null, come: false, bebe: false, dormir: false, registrar: null, puerta: null, tablas: null };
}
// hacia el ratón; si no se ha movido nunca, hacia donde andas
function apuntaRaton(J, mx, mz) {
  if (ENTRADA.raton.visto) { const p = pantallaASuelo(ENTRADA.raton.x, ENTRADA.raton.y); return Math.atan2(p.x - J.x, p.z - J.z); }
  return mx || mz ? Math.atan2(mx, mz) : null;
}
// F (registrar, o la puerta de al lado) y B (tablas)
function sitioPulsado(cerca, hueco) {
  const quiere = pulsa('registra'), puerta = !cerca && hueco && hueco.tipo === 'puerta';
  return { registrar: quiere && cerca ? cerca.id : null, tipoSitio: cerca ? cerca.tipo : null, puerta: quiere && puerta ? hueco.id : null,
    tablas: pulsa('tablas') && hueco ? hueco.id : null, nadaCerca: quiere && !cerca && !puerta };
}
// las teclas 1 a 6, en el orden de las armas de js/ajustes.js
function armaPulsada() { const ids = Object.keys(ZOM.AJ.armas); for (let i = 0; i < ids.length && i < 6; i++) if (pulsa('arma' + (i + 1))) return ids[i]; return null; }
const pidePausa = () => pulsa('pausa');
function limpiaPulsos() { ENTRADA.pulsos.clear(); }
