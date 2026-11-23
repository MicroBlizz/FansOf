// Fans Of · /gestion: el CATÁLOGO de juegos para la pestaña «Juegos» (tarea #162, ADR 161). La lista sale de la biblioteca de la web (../index.html: una
// <section class="game"> por juego, con su enlace games/<id>/, su título, data-tipo Prototipo o Archivo y data-favorito), así un juego nuevo aparece solo en /gestion.
// Se agrupa y filtra por la sección de la portada en la alfa (Nuestros favoritos, Prototipos o Archivo; ADR 203), que da portada.js; sin ella, la del repo.
// Funciones puras (leer el HTML, nombre corto, filtrar y ordenar, pintar la lista) que se prueban en Node; nav.js trae el HTML y las cuentas de tareas.
'use strict';
const GESTION_CATALOGO = (() => {
  // «FANS OF RUMBLE: TÁCTICAS» → «Rumble: Tácticas»; las palabras con cifras van en mayúsculas («V2», «3D»)
  const palabra = p => (/\d/.test(p) ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
  const nombreCorto = titulo => String(titulo || '').replace(/^\s*FANS OF\s+/i, '').trim().split(/\s+/).map(palabra).join(' ');
  const quitaEtiquetas = s => String(s || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
  // El HTML de la biblioteca → [{ id, nombre, tipo ('Prototipo' | 'Archivo'), favorito, color }], en el orden de la biblioteca; las secciones sin enlace a games/ se saltan
  function leer(html) {
    const lista = [];
    for (const m of String(html || '').matchAll(/<section class="game"([^>]*)>([\s\S]*?)<\/section>/g)) {
      const enlace = m[2].match(/href="games\/([a-z0-9-]+)\//), titulo = m[2].match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
      if (!enlace) continue;
      const tipo = (m[1].match(/data-tipo="([^"]*)"/) || [])[1] === 'Archivo' ? 'Archivo' : 'Prototipo';
      const color = (m[1].match(/--wc:\s*(#[0-9a-fA-F]{3,8})/) || [])[1] || '#56ccf2';
      const favorito = /\sdata-favorito[\s=>]|\sdata-favorito$/.test(m[1]);
      lista.push(Object.freeze({ id: enlace[1], nombre: nombreCorto(quitaEtiquetas(titulo && titulo[1])) || enlace[1], tipo, favorito, color }));
    }
    return Object.freeze(lista);
  }
  // Cuántas tareas abiertas (no hechas) tiene cada juego en el tablero: { pop: 25, … }
  const abiertasPorJuego = tareas => (Array.isArray(tareas) ? tareas : []).reduce((n, t) => {
    if (t && t.estado !== 'hecho') n[t.juego] = (n[t.juego] || 0) + 1;
    return n;
  }, {});
  const normaliza = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  // Las secciones de la portada, en el orden de la lista, con su filtro y su color
  const SECCIONES = Object.freeze(['favoritos', 'prototipos', 'archivo']);
  const TITULOS = Object.freeze({ favoritos: 'Nuestros favoritos', prototipos: 'Prototipos', archivo: 'Archivo' });
  // Los filtros de arriba: todos, cada sección y los que tienen herramientas propias en /gestion (una pestaña solo suya, como la Telemetría de Decks)
  const FILTROS = Object.freeze([['', 'Todos', '#f5b14c'], ['favoritos', TITULOS.favoritos, '#3dbe8b'], ['herramientas', 'Con herramientas propias', '#b98cf2'], ['prototipos', TITULOS.prototipos, '#56ccf2'], ['archivo', TITULOS.archivo, '#f2994a']]);
  // La sección de un juego: la de la alfa si llega (secciones: { id: 'favoritos' | 'prototipos' | 'archivo' }); si no, la del repo
  const seccionDe = (j, secciones) => (SECCIONES.includes(secciones[j.id]) ? secciones[j.id] : j.tipo === 'Archivo' ? 'archivo' : j.favorito ? 'favoritos' : 'prototipos');
  // La lista que se enseña: filtrada por texto y sección; ordenada por sección, luego más tareas abiertas y luego nombre
  const pasaFiltro = (j, filtro, secciones, propias) => !filtro || (filtro === 'herramientas' ? propias.includes(j.id) : seccionDe(j, secciones) === filtro);
  function ordena(lista, { texto = '', filtro = '', secciones = {}, propias = [], abiertas = {} } = {}) {
    const busca = normaliza(texto).trim();
    const pasa = j => (!busca || normaliza(j.nombre + ' ' + j.id).includes(busca)) && pasaFiltro(j, filtro, secciones, propias);
    const orden = j => SECCIONES.indexOf(seccionDe(j, secciones));
    return lista.filter(pasa).sort((a, b) => (orden(a) - orden(b)) || ((abiertas[b.id] || 0) - (abiertas[a.id] || 0)) || a.nombre.localeCompare(b.nombre, 'es'));
  }
  const cuenta = n => (n ? `${n} ${n === 1 ? 'tarea' : 'tareas'}` : '');
  const marcasDe = (m, esc) => (m || []).map(x => `<em class="ct-marca ct-marca-${esc(x.clase)}">${esc(x.texto)}</em>`).join('');
  // Cada juego: su botón (abre sus pestañas) y, si tiene tareas abiertas, su contador, que lleva al tablero filtrado por ese juego
  const tareas = (j, n, esc) => (n ? `<button type="button" class="ct-tareas" data-tablero-juego="${esc(j.id)}" aria-label="Ver en el tablero las ${cuenta(n)} de ${esc(j.nombre)}">${cuenta(n)}</button>` : '');
  const fila = (j, abiertas, marcas, esc) => `<div class="ct-fila"><button type="button" class="ct-juego" data-juego="${esc(j.id)}"><i style="background:${esc(j.color)}"></i><span>${esc(j.nombre)}</span>${marcasDe(marcas[j.id], esc)}</button>${tareas(j, abiertas[j.id], esc)}</div>`;
  // La pantalla «Juegos»: buscador, filtros con su número y la lista en grupos; `marcas` ({ id: [{ texto, clase }] }) sale junto al nombre y `avisoMarcas`, en una línea. `esc` escapa el texto
  function html(lista, opciones, esc) {
    const { texto = '', filtro = '', secciones = {}, propias = [], abiertas = {}, marcas = {}, avisoMarcas = '' } = opciones;
    const cuantos = id => ordena(lista, { filtro: id, secciones, propias }).length;
    const filtros = FILTROS.map(([id, t, tono]) => `<button type="button" class="ct-filtro${id === filtro ? ' activo' : ''}" data-filtro-juegos="${id}" style="--tono:${tono}" aria-pressed="${id === filtro}">${t} ${cuantos(id)}</button>`).join('');
    const visibles = ordena(lista, opciones);
    const grupos = SECCIONES.map(g => [g, visibles.filter(j => seccionDe(j, secciones) === g)]).filter(([, js]) => js.length);
    const cuerpo = grupos.map(([g, js]) => `<div class="ct-grupo">${TITULOS[g]}</div>${js.map(j => fila(j, abiertas, marcas, esc)).join('')}`).join('');
    return `<label class="ct-buscar">Buscar juego<input type="search" data-buscar-juego value="${esc(texto)}" placeholder="Escribe: pop, asalto…"></label><div class="ct-filtros">${filtros}</div>`
      + (avisoMarcas ? `<div class="meta ct-aviso" role="status">${esc(avisoMarcas)}</div>` : '')
      + `<div class="ct-lista" data-lista-juegos>${cuerpo || '<div class="meta">Ningún juego con ese nombre.</div>'}</div>`;
  }
  const ESTILO = '.ct-buscar{display:grid;gap:4px;font-size:12px;color:var(--suave)}.ct-buscar input{min-height:46px;border-radius:12px;border:2px solid var(--acento);font-size:16px;padding:0 12px;background:var(--panel);color:var(--texto)}'
    + '.ct-filtros{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.ct-filtro{min-height:38px;border-radius:19px;border:2px solid var(--tono);background:transparent;color:var(--texto);font-weight:700}.ct-filtro.activo{background:var(--tono);color:#10202b}'
    + '.ct-lista{display:grid}.ct-grupo{font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--suave);padding:12px 4px 6px}'
    + '.ct-fila{display:flex;align-items:stretch;border-bottom:1px solid var(--linea)}'
    + '.ct-juego{flex:1;display:flex;align-items:center;gap:10px;min-height:52px;border:0;border-radius:0;background:transparent;font-size:16px;font-weight:600;text-align:left;padding:0 4px}.ct-juego:hover{background:var(--panel)}'
    + '.ct-juego i{width:12px;height:12px;border-radius:6px;flex:none}.ct-juego span{flex:1}'
    + '.ct-tareas{flex:none;min-height:52px;min-width:72px;border:0;border-radius:0;background:transparent;font-size:12px;font-weight:700;color:var(--acento);text-decoration:underline;padding:0 8px}.ct-tareas:hover{background:var(--panel)}'
    + '.ct-aviso{margin:0 0 8px}.ct-marca{font-style:normal;font-size:11px;font-weight:700;padding:2px 7px;border-radius:99px;white-space:nowrap}.ct-marca-alfa{background:var(--debil-fondo);color:var(--debil)}.ct-marca-web{background:var(--clara-fondo);color:var(--clara)}';
  return { leer, nombreCorto, abiertasPorJuego, ordena, html, ESTILO };
})();
