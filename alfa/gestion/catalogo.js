// Fans Of · /gestion: el CATÁLOGO de juegos para la pestaña «Juegos» (tarea #162, ADR 161). La lista sale de la biblioteca de la web (../index.html: una
// <section class="game"> por juego, con su enlace games/<id>/, su título y data-tipo Prototipo o Archivo), así un juego nuevo aparece solo en /gestion.
// Funciones puras (leer el HTML, nombre corto, filtrar y ordenar, pintar la lista) que se prueban en Node; nav.js trae el HTML y las cuentas de tareas.
'use strict';
const GESTION_CATALOGO = (() => {
  // «FANS OF RUMBLE: TÁCTICAS» → «Rumble: Tácticas»; las palabras con cifras van en mayúsculas («V2», «3D»)
  const palabra = p => (/\d/.test(p) ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
  const nombreCorto = titulo => String(titulo || '').replace(/^\s*FANS OF\s+/i, '').trim().split(/\s+/).map(palabra).join(' ');
  const quitaEtiquetas = s => String(s || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
  // El HTML de la biblioteca → [{ id, nombre, tipo ('Prototipo' | 'Archivo'), color }], en el orden de la biblioteca; las secciones sin enlace a games/ se saltan
  function leer(html) {
    const lista = [];
    for (const m of String(html || '').matchAll(/<section class="game"([^>]*)>([\s\S]*?)<\/section>/g)) {
      const enlace = m[2].match(/href="games\/([a-z0-9-]+)\//), titulo = m[2].match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
      if (!enlace) continue;
      const tipo = (m[1].match(/data-tipo="([^"]*)"/) || [])[1] === 'Archivo' ? 'Archivo' : 'Prototipo';
      const color = (m[1].match(/--wc:\s*(#[0-9a-fA-F]{3,8})/) || [])[1] || '#56ccf2';
      lista.push(Object.freeze({ id: enlace[1], nombre: nombreCorto(quitaEtiquetas(titulo && titulo[1])) || enlace[1], tipo, color }));
    }
    return Object.freeze(lista);
  }
  // Cuántas tareas abiertas (no hechas) tiene cada juego en el tablero: { pop: 25, … }
  const abiertasPorJuego = tareas => (Array.isArray(tareas) ? tareas : []).reduce((n, t) => {
    if (t && t.estado !== 'hecho') n[t.juego] = (n[t.juego] || 0) + 1;
    return n;
  }, {});
  const normaliza = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  // Los filtros de arriba: todos, los que tienen pestañas propias en /gestion, prototipos y archivo
  const FILTROS = Object.freeze([['', 'Todos', '#f5b14c'], ['propias', 'Con pestañas propias', '#3dbe8b'], ['Prototipo', 'Prototipos', '#56ccf2'], ['Archivo', 'Archivo', '#f2994a']]);
  // Grupo de cada juego (orden de la lista): 0 con pestañas propias, 1 prototipo, 2 archivo
  const grupo = (j, propias) => (propias.includes(j.id) ? 0 : j.tipo === 'Archivo' ? 2 : 1);
  // La lista que se enseña: filtrada por texto y filtro; ordenada por grupo, luego más tareas abiertas y luego nombre
  function ordena(lista, { texto = '', filtro = '', propias = [], abiertas = {} } = {}) {
    const busca = normaliza(texto).trim();
    const pasa = j => (!busca || normaliza(j.nombre + ' ' + j.id).includes(busca))
      && (!filtro || (filtro === 'propias' ? propias.includes(j.id) : j.tipo === filtro && !propias.includes(j.id)));
    return lista.filter(pasa).sort((a, b) => (grupo(a, propias) - grupo(b, propias)) || ((abiertas[b.id] || 0) - (abiertas[a.id] || 0)) || a.nombre.localeCompare(b.nombre, 'es'));
  }
  const TITULOS = ['Con pestañas propias', 'Prototipos', 'Archivo'];
  const cuenta = n => (n ? `${n} ${n === 1 ? 'tarea' : 'tareas'}` : '');
  const marcasDe = (m, esc) => (m || []).map(x => `<em class="ct-marca ct-marca-${esc(x.clase)}">${esc(x.texto)}</em>`).join('');
  const fila = (j, abiertas, marcas, esc) => `<button type="button" class="ct-juego" data-juego="${esc(j.id)}"><i style="background:${esc(j.color)}"></i><span>${esc(j.nombre)}</span>${marcasDe(marcas[j.id], esc)}<small>${cuenta(abiertas[j.id])}</small></button>`;
  // La pantalla «Juegos»: buscador, filtros con su número y la lista en grupos; `marcas` ({ id: [{ texto, clase }] }) sale junto al nombre y `avisoMarcas`, en una línea. `esc` escapa el texto
  function html(lista, opciones, esc) {
    const { texto = '', filtro = '', propias = [], abiertas = {}, marcas = {}, avisoMarcas = '' } = opciones;
    const cuantos = id => ordena(lista, { filtro: id, propias }).length;
    const filtros = FILTROS.map(([id, t, tono]) => `<button type="button" class="ct-filtro${id === filtro ? ' activo' : ''}" data-filtro-juegos="${id}" style="--tono:${tono}" aria-pressed="${id === filtro}">${t} ${cuantos(id)}</button>`).join('');
    const visibles = ordena(lista, opciones);
    const grupos = [0, 1, 2].map(g => [g, visibles.filter(j => grupo(j, propias) === g)]).filter(([, js]) => js.length);
    const cuerpo = grupos.map(([g, js]) => `<div class="ct-grupo">${TITULOS[g]}</div>${js.map(j => fila(j, abiertas, marcas, esc)).join('')}`).join('');
    return `<label class="ct-buscar">Buscar juego<input type="search" data-buscar-juego value="${esc(texto)}" placeholder="Escribe: pop, asalto…"></label><div class="ct-filtros">${filtros}</div>`
      + (avisoMarcas ? `<div class="meta ct-aviso" role="status">${esc(avisoMarcas)}</div>` : '')
      + `<div class="ct-lista" data-lista-juegos>${cuerpo || '<div class="meta">Ningún juego con ese nombre.</div>'}</div>`;
  }
  const ESTILO = '.ct-buscar{display:grid;gap:4px;font-size:12px;color:var(--suave)}.ct-buscar input{min-height:46px;border-radius:12px;border:2px solid var(--acento);font-size:16px;padding:0 12px;background:var(--panel);color:var(--texto)}'
    + '.ct-filtros{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.ct-filtro{min-height:38px;border-radius:19px;border:2px solid var(--tono);background:transparent;color:var(--texto);font-weight:700}.ct-filtro.activo{background:var(--tono);color:#10202b}'
    + '.ct-lista{display:grid}.ct-grupo{font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--suave);padding:12px 4px 6px}'
    + '.ct-juego{display:flex;align-items:center;gap:10px;min-height:52px;border:0;border-bottom:1px solid var(--linea);border-radius:0;background:transparent;font-size:16px;font-weight:600;text-align:left;padding:0 4px}.ct-juego:hover{background:var(--panel)}'
    + '.ct-juego i{width:12px;height:12px;border-radius:6px;flex:none}.ct-juego span{flex:1}.ct-juego small{font-size:12px;color:var(--suave);font-weight:600}'
    + '.ct-aviso{margin:0 0 8px}.ct-marca{font-style:normal;font-size:11px;font-weight:700;padding:2px 7px;border-radius:99px;white-space:nowrap}.ct-marca-alfa{background:var(--debil-fondo);color:var(--debil)}.ct-marca-web{background:var(--clara-fondo);color:var(--clara)}';
  return { leer, nombreCorto, abiertasPorJuego, ordena, html, ESTILO };
})();
