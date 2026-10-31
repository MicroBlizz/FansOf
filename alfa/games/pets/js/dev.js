// Fans Of Pets · DEV: utilidades para probar el prototipo sin esperar horas. Solo en modo desarrollo (NUCLEO.desarrollo): una barra en el juego
// y, en el panel DEV de core (UTILIDADES_JUEGO), lo mismo. Adelantar el tiempo suma al desfase del reloj del juego y simula lo que pasa.
'use strict';
function ptAdelanta(horas) {
  SAVE.desfase = (SAVE.desfase || 0) + horas * 60 * PT_MIN; ptGuarda();
  const pasa = ptSimula(); ptTrasSimular(pasa); ptPantalla();
}
function ptEclosionaYa() { if (SAVE.fase !== 'huevo') return; ptAdelanta(Math.max(0, (ptEclosionEn() - ptAhora()) / (60 * PT_MIN)) + 1 / 60); }
function ptReiniciaTodo() { ptReinicia(); Object.assign(PT_UI, { paso: 'hola', respuestas: [], elegido: -1, anim: '', bocadillo: '', volverA: '', bufanda: false }); ptPantalla(); }
const PT_DEV = [['+1 h', () => ptAdelanta(1)], ['+6 h', () => ptAdelanta(6)], [tr('ECLOSIONAR YA'), ptEclosionaYa], [tr('REINICIAR'), ptReiniciaTodo],
  // las poses del dibujo que aún no tienen botón en la casa (el aseo llegará con el niño)
  [tr('DIENTES'), () => ptAnima('dientes')], [tr('CARA'), () => ptAnima('cara')], [tr('BAÑO'), () => ptAnima('bano')]];
const UTILIDADES_JUEGO = NUCLEO.desarrollo ? [{ titulo: 'Fans Of Pets', pinta(c) {
  const fila = document.createElement('div'); fila.className = 'fila';
  for (const [t, fn] of PT_DEV) { const b = document.createElement('button'); b.textContent = t; b.onclick = fn; fila.append(b); }
  c.append(fila);
} }] : [];
function ptBarraDev() {
  const barra = $pt('#pt-dev'); if (!NUCLEO.desarrollo) { barra.hidden = true; return; }
  barra.hidden = false; barra.innerHTML = '<b>DEV</b>';
  for (const [t, fn] of PT_DEV) { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = fn; barra.append(b); }
}
