// Fans of Island · ALIADO: la IA que lleva al segundo personaje cuando se juega solo. Sigue a quien lleva el mando, salta huecos y
// muros, flota si se queda abajo y espera quieto cuando está cerca. Devuelve una entrada igual que la de un jugador (entrada.js).
'use strict';
const IS_IA = { inp: isEntradaNueva(), saltoAntes: 0, espera: 0 };
function isAliadoEntrada(a, lider, mundo, dt) {
  const i = IS_IA.inp; i.izq = i.der = i.salto = i.accion = i.saltoPulsa = i.accionPulsa = 0;
  if (a.llevadoPor || a.estado !== 'normal' || !lider) return i;
  if (lider.estado === 'burbuja') {   // el líder está en la burbuja: se pone debajo y salta para reventarla
    const dxb = isCentro(lider).x - isCentro(a).x;
    if (Math.abs(dxb) > 6) { if (dxb > 0) i.der = 1; else i.izq = 1; }
    const salta = a.suelo && Math.abs(dxb) <= 14 && !IS_IA.saltoAntes;
    i.salto = salta ? 1 : (a.suelo ? 0 : 1); i.saltoPulsa = salta ? 1 : 0; IS_IA.saltoAntes = i.salto;
    return i;
  }
  let dx = isCentro(lider).x - isCentro(a).x, dy = lider.y - a.y, lejos = Math.abs(dx);
  // si está en la repisa de un botón sin pulsar (lo han lanzado ahí), va a pisarlo antes que nada
  const boton = a.suelo && mundo.interruptores.find(b => !b.pulsado && Math.abs(b.y + b.h - (a.y + a.h)) < 6 && Math.abs(b.x + b.w / 2 - isCentro(a).x) < 90);
  if (boton) { dx = boton.x + boton.w / 2 - isCentro(a).x; dy = 0; lejos = Math.abs(dx); if (lejos < 4) return i; }
  let dir = 0;
  if (lejos > (boton ? 3 : 40)) dir = dx > 0 ? 1 : -1;
  else if (a.suelo && lider.suelo) IS_IA.espera = 0.3;
  if (dir) { if (dir > 0) i.der = 1; else i.izq = 1; }
  let salto = 0;
  if (a.suelo && dir) {
    const pies = a.y + a.h;
    if (isMuroDelante(a, dir, mundo.plataformas)) salto = 1;                                    // un bloque delante
    else if (!isSueloBajo(a.x + a.w / 2 + dir * 9, pies, mundo.plataformas, 6)) salto = 1;    // el borde de un hueco (salta desde el borde, como una persona)
    else if (dy < -26 && lejos < 150) salto = 1;                                                // el líder está más arriba
  }
  if (!a.suelo && ((a.vy < 0 && IS_IA.saltoAntes) || (a.vy > 0 && (dy < -13 || !isSueloBajo(a.x + a.w / 2, a.y + a.h, mundo.plataformas, 100))))) salto = 1;   // mantiene el salto para subir más, y flota si se queda abajo o no hay suelo cerca
  if (salto && a.suelo && IS_IA.saltoAntes) salto = 0;   // en el suelo suelta un fotograma el botón: el salto se pulsa, no se mantiene
  i.salto = salto; i.saltoPulsa = salto && !IS_IA.saltoAntes ? 1 : 0; IS_IA.saltoAntes = salto;
  return i;
}
