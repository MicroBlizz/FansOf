// Fans Of · /gestion · TABLERO · adaptador · VISTA DEL GRAFO: el HTML y SVG con el grafo de una tarea dibujado (cajas coloreadas por estado, flechas entre ellas),
// a partir de la disposición que calcula TABLERO.disposicion. Funciones puras (reciben `esc`): se prueban en Node. Pulsar un caja y «Ver grande» los maneja controlador.js.
'use strict';
TABLERO.vistaGrafo = (() => {
  const caja = (n, esc) => `<g class="tb-gnodo ${esc(n.estado)}" data-nodo="${esc(n.id)}" tabindex="0" role="button" transform="translate(${n.x} ${n.y})" aria-label="${esc(n.lineas.join(' '))}, ${esc(TABLERO.estadoNodoTexto(n.estado))}">`
    + `<rect width="${n.w}" height="${n.h}" rx="6"/><g clip-path="url(#tb-recorte)">${n.lineas.map((l, i) => `<text x="8" y="${18 + 14 * i}">${esc(l)}</text>`).join('')}<text class="m" x="8" y="${n.h - 8}">${esc(n.meta)}</text></g></g>`;
  const flecha = (f, esc) => `<path class="tb-flecha" d="${esc(f.d)}" marker-end="url(#tb-punta)" data-de="${esc(f.de)}" data-a="${esc(f.a)}"/>`;

  // El dibujo entero: botón «Ver grande», el SVG (con scroll lateral si no cabe) y el sitio donde sale el check y la evidencia del nodo pulsado
  function dibujo(niveles, esc) {
    const d = TABLERO.disposicion(niveles);
    return `<div class="tb-dibujo" data-dibujo><div class="tb-dibujo-barra"><button type="button" data-grande>Ver grande</button></div>`
      + `<div class="tb-lienzo"><svg class="tb-svg" viewBox="0 0 ${d.ancho} ${d.alto}" width="${d.ancho}" height="${d.alto}" role="group" aria-label="Grafo de la tarea">`
      + `<defs><clipPath id="tb-recorte"><rect width="150" height="58"/></clipPath><marker id="tb-punta" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path class="tb-punta" d="M0 0L8 4L0 8z"/></marker></defs>`
      + `${d.flechas.map(f => flecha(f, esc)).join('')}${d.nodos.map(n => caja(n, esc)).join('')}</svg></div>`
      + `<div class="tb-nodo-info meta" data-nodo-info aria-live="polite">Pulsa un nodo para ver su check y su evidencia.</div></div>`;
  }

  const ESTILO = '.tb-dibujo-barra{display:flex;justify-content:flex-end;margin-bottom:4px}.tb-lienzo{overflow-x:auto;border:1px solid var(--linea);border-radius:6px;background:var(--bg)}'
    + '.tb-svg{display:block;width:100%;height:auto}@media(max-width:600px){.tb-svg{width:auto;max-width:none}}'
    + '.tb-flecha{fill:none;stroke:var(--suave);stroke-width:1.5}.tb-punta{fill:var(--suave)}'
    + '.tb-gnodo{cursor:pointer}.tb-gnodo rect{fill:var(--panel);stroke:var(--linea);stroke-width:1.5}.tb-gnodo text{fill:var(--texto);font:600 12px system-ui,sans-serif}.tb-gnodo .m{font-weight:400;font-size:10.5px;fill:var(--suave)}'
    + '.tb-gnodo.pasa rect{fill:var(--ok-fondo);stroke:var(--ok)}.tb-gnodo.falla rect{fill:var(--clara-fondo);stroke:var(--clara);stroke-width:3}'
    + '.tb-gnodo.bloqueado rect{fill:var(--debil-fondo);stroke:var(--debil);stroke-width:2;stroke-dasharray:5 3}.tb-gnodo.en_curso rect{stroke:var(--acento);stroke-width:3}'
    + '.tb-gnodo:focus{outline:none}.tb-gnodo:focus rect,.tb-gnodo.elegido rect{stroke:var(--texto);stroke-width:3.5}'
    + '.tb-nodo.falla .estado{background:var(--clara-fondo);color:var(--clara)}.tb-nodo.bloqueado .estado,.tb-nodo.en_curso .estado{background:var(--debil-fondo);color:var(--debil)}.tb-nodo.pendiente .estado{background:var(--bg);color:var(--suave)}'
    + '.tb-nodo-info{margin-top:6px}.tb-nodo-info .tb-nodo{background:var(--bg)}'
    + '.tb-dibujo.grande{position:fixed;inset:0;z-index:30;overflow:auto;background:var(--panel);padding:12px;display:grid;gap:8px;align-content:start}.tb-dibujo.grande .tb-svg{width:auto;max-width:none}';
  return { dibujo, ESTILO };
})();
