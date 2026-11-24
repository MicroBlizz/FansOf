// Fans Of · RECURSOS · mandos comunes al comparar (de la galería local y de la pestaña Recursos de /gestion): una barra que mueve a la vez TODOS los visores abiertos
// (lonchas y modelos .glb): «Mover juntos» (si se arrastra uno, los demás giran con él), girar, dar vueltas, vista inicial, contorno, postura
// y reproducir. Habla con los iframes por postMessage (mismo origen y campo tipo propio; su lado está en mandos-panel.js).
// Guía: docs/guia/herramientas/galeria.md
'use strict';
const MANDOS = (() => {
  const TIPO = 'fansof-galeria-mandos', GIRO = Math.PI / 4;
  const estado = { juntos: true, vueltas: false, contorno: false, reproducir: false };
  let barra = null, marcos = () => [];
  const manda = (ventana, orden, valor) => ventana.postMessage({ tipo: TIPO, orden, valor }, location.origin);
  const ventanas = () => marcos().map(f => f.contentWindow).filter(Boolean);
  const todos = (orden, valor) => { for (const v of ventanas()) manda(v, orden, valor); };

  // de un panel: «listo» (le llega cómo están los interruptores) o «girar» (lo arrastran: giran los demás si se mueven juntos).
  // Puro: los mensajes [ventana, orden, valor] que hay que mandar; ninguno si no viene del mismo origen, de un panel abierto y con el tipo
  function responde(ev, origen, abiertas, como) {
    if (ev.origin !== origen || !ev.data || ev.data.tipo !== TIPO || !abiertas.includes(ev.source)) return [];
    if (ev.data.orden === 'listo') return ['vueltas', 'contorno', 'reproducir'].map(clave => [ev.source, clave, como[clave]]);
    if (ev.data.orden === 'girar' && como.juntos && Number.isFinite(ev.data.valor)) {
      return abiertas.filter(v => v !== ev.source).map(v => [v, 'girar', ev.data.valor]);
    }
    return [];
  }
  function recibe(ev) { for (const [v, orden, valor] of responde(ev, location.origin, ventanas(), estado)) manda(v, orden, valor); }
  // a un visor que no es de un panel (la pantalla completa de /gestion) se le dice, cuando avisa de que está listo, cómo están los interruptores
  function saluda(ventana) { for (const [v, orden, valor] of responde({ origin: location.origin, source: ventana, data: { tipo: TIPO, orden: 'listo' } }, location.origin, [ventana], estado)) manda(v, orden, valor); }
  function boton(texto, titulo, accion) {
    const b = document.createElement('button'); b.textContent = texto; b.title = titulo; b.onclick = accion; barra.append(b); return b;
  }
  function interruptor(texto, titulo, clave) {
    const b = boton(texto, titulo, () => { estado[clave] = !estado[clave]; b.setAttribute('aria-pressed', String(estado[clave])); todos(clave, estado[clave]); });
    b.setAttribute('aria-pressed', String(estado[clave]));
  }
  function arranca(caja, dameMarcos) {
    barra = caja; marcos = dameMarcos;
    const juntos = document.createElement('label'), casilla = document.createElement('input');
    casilla.type = 'checkbox'; casilla.checked = estado.juntos; casilla.onchange = () => { estado.juntos = casilla.checked; };
    juntos.append(casilla, ' Mover juntos'); juntos.title = 'Si arrastras un panel, los demás giran con él';
    barra.append(juntos);
    boton('< Girar', 'Gira todos los paneles un octavo de vuelta', () => todos('girar', -GIRO));
    boton('Girar >', 'Gira todos los paneles un octavo de vuelta', () => todos('girar', GIRO));
    interruptor('Dar vueltas', 'Todos dan vueltas solos', 'vueltas');
    boton('Vista inicial', 'Todos vuelven a como se abrieron', () => todos('vista-inicial'));
    interruptor('Contorno', 'Contorno oscuro en todos', 'contorno');
    boton('Postura', 'La siguiente postura en todos los que tengan varias', () => todos('postura', 'siguiente'));
    interruptor('Reproducir', 'Pasa por las posturas en todos', 'reproducir');
    addEventListener('message', recibe);
  }
  // la barra solo sale si hay algún visor abierto
  function actualiza() { if (barra) barra.hidden = !marcos().length; }
  return { TIPO, arranca, actualiza, responde, saluda };
})();
if (typeof module !== 'undefined') module.exports = MANDOS;   // en node (tests/herramientas/galeria/ y tests/gestion/) solo se carga
