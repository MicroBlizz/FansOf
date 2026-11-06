// Fans of Zombies · TECLADO Y RATÓN (adaptador): lee las teclas y el ratón y los deja como la entrada que piden las reglas
// ({ mx, mz, corre, agacha, apunta, ataca, arma, usar, dormir, registrar }). Para PC: WASD o flechas para andar, Mayús para correr,
// C para agacharse, clic o espacio para atacar, clic derecho o R para empujar, 1 y 2 cambian de arma, F registra, Tab abre la mochila,
// B clava tablas en la puerta o ventana de al lado, E come, Q bebe, V venda, Z duerme, Esc pausa. F junto a una puerta la abre o cierra. Con la mochila abierta solo se anda (los clics son para la mochila).
'use strict';
const TECLAS_ZOM = {
  arriba: ['KeyW', 'ArrowUp'], abajo: ['KeyS', 'ArrowDown'], izq: ['KeyA', 'ArrowLeft'], der: ['KeyD', 'ArrowRight'], corre: ['ShiftLeft', 'ShiftRight'],
  agacha: ['KeyC', 'ControlLeft'], ataca: ['Space'], empuja: ['KeyR'], arma1: ['Digit1'], arma2: ['Digit2'], registra: ['KeyF'], tablas: ['KeyB'], come: ['KeyE'], bebe: ['KeyQ'], venda: ['KeyV'],
  duerme: ['KeyZ'], pausa: ['Escape', 'KeyP'], mochila: ['Tab', 'KeyI'],
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
}
const mantiene = (acc) => TECLAS_ZOM[acc].some((k) => ENTRADA.abajo.has(k));
const pulsa = (acc) => TECLAS_ZOM[acc].some((k) => ENTRADA.pulsos.has(k));
// la entrada de este fotograma (cerca = el sitio que se puede registrar, si lo hay). Gasta los pulsos.
function leeEntrada(J, cerca, hueco) {
  const mx = (mantiene('der') ? 1 : 0) - (mantiene('izq') ? 1 : 0), mz = (mantiene('abajo') ? 1 : 0) - (mantiene('arriba') ? 1 : 0);
  if (VM.abierta) { ENTRADA.raton.derecho = false; return { mx, mz, corre: mantiene('corre'), agacha: false, apunta: mx || mz ? Math.atan2(mx, mz) : null, ataca: false, empuja: false, arma: null, usar: null, come: false, bebe: false, dormir: false, registrar: null, puerta: null, tablas: null }; }
  let apunta = null;
  if (ENTRADA.raton.visto) { const p = pantallaASuelo(ENTRADA.raton.x, ENTRADA.raton.y); apunta = Math.atan2(p.x - J.x, p.z - J.z); }
  else if (mx || mz) apunta = Math.atan2(mx, mz);
  const quiere = pulsa('registra'), usar = pulsa('venda') ? 'venda' : null;
  const empuja = ENTRADA.raton.derecho || pulsa('empuja'); ENTRADA.raton.derecho = false;
  const ent = { mx, mz, corre: mantiene('corre'), agacha: pulsa('agacha'), apunta, ataca: ENTRADA.raton.abajo || mantiene('ataca'), empuja,
    arma: pulsa('arma1') ? 'escopeta' : pulsa('arma2') ? 'palanca' : null, usar, come: pulsa('come'), bebe: pulsa('bebe'), dormir: pulsa('duerme'), registrar: quiere && cerca ? cerca.id : null, tipoSitio: cerca ? cerca.tipo : null, puerta: quiere && !cerca && hueco && hueco.tipo === 'puerta' ? hueco.id : null,
    tablas: pulsa('tablas') && hueco ? hueco.id : null, nadaCerca: quiere && !cerca && !(hueco && hueco.tipo === 'puerta') };
  return ent;
}
const pidePausa = () => pulsa('pausa');
function limpiaPulsos() { ENTRADA.pulsos.clear(); }
