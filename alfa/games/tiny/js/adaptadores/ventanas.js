// Tiny Fans · adaptador · VENTANAS: las ventanas con aire de material de oficina (nota adhesiva, hoja con clip, sello «APROBADO») y las
// circulares de MicroBlizz. Una a la vez, encima de todo; ningún toque se pierde. Dueño: N6 (interfaz).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.ventanas = {
  // abre una ventana: { clase: 'nota' | 'hoja' | 'circular', titulo, cuerpo (HTML o elemento), sello, botones: [{ texto, clase, alPulsar }], alCerrar }
  abre(datos) {},
  cierra() {},
  get abierta() { return false; },
  // una circular de MicroBlizz con un solo botón
  circular(texto, alCerrar) {},
};
