// Fans Of · /gestion · TABLERO · adaptador · CONTROLREACCIONES (tarea #124, ADR 149): cómo se reacciona a una tarea, como en WhatsApp. Dejar el dedo (o el
// ratón) apretado medio segundo sobre una tarjeta, o el clic derecho en el ordenador, abre la barrita de los doce iconos encima de ella; pulsar uno lo pone
// (o lo quita, si ya era el tuyo) y la barrita se cierra. Un toque fuera o Escape la cierran sin hacer nada. Toca el DOM: recibe del controlador la lista
// (el elemento), cómo encontrar una tarea por su id y qué hacer al elegir (`alElegir(tarea, reaccion)`).
'use strict';
TABLERO.controlReacciones = ({ lista, tareaDe, alElegir }) => {
  const ESPERA = 500, TEMBLOR = 10;   // ms apretado y píxeles que se puede mover el dedo sin que cuente como arrastrar
  let reloj = null, inicio = null, abiertaEn = -Infinity;
  const cierra = () => { lista.querySelectorAll('[data-barrita]').forEach(b => b.remove()); abiertaEn = -Infinity; };
  const corta = () => { clearTimeout(reloj); reloj = null; inicio = null; };
  function abre(tarjeta) {
    corta();
    cierra();
    const t = tareaDe(tarjeta.dataset.id);
    if (!t) return;
    tarjeta.insertAdjacentHTML('afterbegin', TABLERO.vistaReacciones.barrita(t));
    abiertaEn = Date.now();   // el clic que llega justo al soltar el dedo no abre el detalle ni la cierra
    const primero = tarjeta.querySelector('[data-reaccion]');
    if (primero) primero.focus({ preventScroll: true });
  }
  lista.addEventListener('pointerdown', ev => {
    const tarjeta = ev.target.closest('[data-id]');
    if (!tarjeta || ev.target.closest('[data-barrita]') || ev.button > 0) return;
    inicio = [ev.clientX, ev.clientY];
    reloj = setTimeout(() => abre(tarjeta), ESPERA);
  });
  lista.addEventListener('pointermove', ev => { if (inicio && Math.hypot(ev.clientX - inicio[0], ev.clientY - inicio[1]) > TEMBLOR) corta(); });
  ['pointerup', 'pointercancel', 'dragstart'].forEach(tipo => lista.addEventListener(tipo, corta));
  // Clic derecho en el ordenador; en Android, dejar el dedo apretado también lo lanza
  lista.addEventListener('contextmenu', ev => {
    const tarjeta = ev.target.closest('[data-id]');
    if (!tarjeta) return;
    ev.preventDefault();
    if (!tarjeta.querySelector('[data-barrita]')) abre(tarjeta);
  });
  document.addEventListener('pointerdown', ev => { if (!ev.target.closest('[data-barrita]') && !ev.target.closest('[data-id]')) cierra(); });
  lista.addEventListener('keydown', ev => { if (ev.key === 'Escape' && lista.querySelector('[data-barrita]')) { ev.stopPropagation(); cierra(); } });

  // Lo llama el controlador en cada clic de la lista: devuelve true si el clic era de las reacciones (y ya está hecho), para que no abra el detalle
  function clic(ev) {
    const boton = ev.target.closest('[data-reaccion]'), barra = ev.target.closest('[data-barrita]');
    if (boton && barra) { const t = tareaDe(barra.dataset.barrita); cierra(); if (t) alElegir(t, boton.dataset.reaccion); return true; }
    if (barra) return true;
    if (Date.now() - abiertaEn < 700) return true;
    if (lista.querySelector('[data-barrita]')) { cierra(); return true; }   // un toque en otra tarjeta solo cierra la barrita
    return false;
  }
  return { clic, cierra };
};
