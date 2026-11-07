// Fans Of · /gestion · TABLERO · adaptador · VISTA: el HTML del tablero. `html(columnas, esc)` es una función pura (se prueba en Node); `pinta` la pone en el
// panel. Solo lectura: mover y editar llegan en la fase 2. Reutiliza las clases de /gestion (caja, cuenta, cab, estado, meta).
'use strict';
TABLERO.vista = (() => {
  const tarjeta = (t, esc) => `<article class="cuenta tb-tarea"><div class="cab"><b>${esc(t.titulo)}</b></div>
    <div class="meta"><span class="estado">${esc(t.juego)}</span> <span class="estado">${esc(TABLERO.responsableTexto(t))}</span>${t.prioridad === 'normal' ? '' : ` <span class="estado">${esc(t.prioridad)}</span>`}</div></article>`;
  const columna = (c, esc) => `<section class="tb-col"><h3>${esc(c.titulo)} <span class="meta">${c.tareas.length}</span></h3>${c.tareas.map(t => tarjeta(t, esc)).join('') || '<div class="meta">Vacía</div>'}</section>`;
  const html = (columnas, esc) => `<div class="tb-tablero">${columnas.map(c => columna(c, esc)).join('')}</div>`;
  const ESTILO = '.tb-tablero{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}@media(max-width:1000px){.tb-tablero{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.tb-tablero{grid-template-columns:minmax(0,1fr)}}.tb-tarea{overflow-wrap:anywhere}.tb-col{display:grid;gap:8px;align-content:start}.tb-col h3{margin:0;font-size:14px}.tb-tarea{padding:8px 10px;gap:4px}';
  return { html, ESTILO };
})();
