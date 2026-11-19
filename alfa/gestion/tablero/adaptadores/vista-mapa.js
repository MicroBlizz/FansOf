// Fans Of · /gestion · TABLERO · adaptador · VISTAMAPA (tarea #147, ADR 147): el MAPA de todo el tablero en el móvil, como el PC pero en pequeño. Las seis
// columnas a la vez, cada tarea en una tarjeta mini con su número, su nombre corto y la raya del color de su columna; las urgentes llevan un rayo (tarea #163).
// Tocar una abre su detalle y dejarla apretada saca las reacciones, como cualquier tarjeta (llevan data-id). HTML puro (recibe `esc`); se prueba en Node.
'use strict';
TABLERO.vistaMapa = (() => {
  const CORTO = { idea: 'Ideas', refinando: 'Refin.', pendiente: 'Pend.', en_curso: 'Curso', en_revision: 'Revis.', hecho: 'Hecho' };
  const mini = (t, esc, elegida) => `<div role="button" tabindex="0" class="tb-mini tb-mprio-${esc(t.prioridad)}${t.id === elegida ? ' elegida' : ''}" data-id="${t.id}" title="#${t.id} ${esc(t.titulo)}">`
    + `<b>${t.prioridad === 'alta' ? `<span class="tb-mrayo" title="Urgente">${TABLERO.vistaRevisar.rayo}</span>` : ''}#${t.id}</b><span>${esc(t.corto || t.titulo)}</span>${(t.reacciones || []).length ? `<i>${t.reacciones.length}</i>` : ''}</div>`;
  const columna = (c, esc, elegida) => `<section class="tb-mcol" data-columna="${c.id}" style="--tono:${c.tono}"><h3><span>${CORTO[c.id] || esc(c.titulo)}</span><b>${c.tareas.length}</b></h3>`
    + `${c.tareas.map(t => mini(t, esc, elegida)).join('')}</section>`;
  const html = (columnas, esc, elegida = null) => `<div class="tb-mapa" aria-label="Todas las columnas del tablero">${columnas.map(c => columna(c, esc, elegida)).join('')}</div>`;
  const ESTILO = '.tb-mapa{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;align-items:start}.tb-mcol{display:grid;gap:3px;min-width:0}'
    + '.tb-mcol h3{margin:0;display:flex;flex-direction:column;align-items:center;background:var(--tono);color:#10202b;border-radius:6px;padding:3px 0;font-size:11px;line-height:1.2}.tb-mcol h3 b{font-size:14px}'
    + '.tb-mini{position:relative;cursor:pointer;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;display:flex;flex-direction:column;align-items:flex-start;gap:1px;min-height:0;width:100%;text-align:left;padding:3px 3px 3px 5px;border:1px solid var(--linea);border-left:4px solid var(--tono);border-radius:5px;background:var(--panel);color:var(--texto);font-size:10px;line-height:1.2;font-weight:400}'
    + '.tb-mini b{font-size:11px}.tb-mini span{overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;word-break:break-word}.tb-mini i{font-style:normal;font-size:9px;color:#3dbe8b}'
    + '.tb-mini.elegida{outline:2px solid var(--acento)}.tb-mrayo{display:inline-flex;vertical-align:-1px;margin-right:2px}'
    + '.tb-mapa .tb-barrita{position:fixed;left:50%;top:45%;transform:translate(-50%,-50%)}';
  return { html, ESTILO };
})();
