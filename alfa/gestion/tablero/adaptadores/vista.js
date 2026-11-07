// Fans Of · /gestion · TABLERO · adaptador · VISTA: el HTML del tablero y de su formulario. Todo son funciones puras (reciben `esc`, que escapa el texto, y
// `fecha`, que da la fecha legible): se prueban en Node. El controlador (controlador.js) las pone en la página. Reutiliza las clases de /gestion
// (caja, cuenta, cab, estado, meta, filtros, aviso).
'use strict';
TABLERO.vista = (() => {
  const CAMPOS = { titulo: 'El título tiene que tener de 1 a 120 letras', juego: 'El juego solo lleva minúsculas, números y guiones', descripcion: 'La descripción es demasiado larga', criterio: 'El criterio es demasiado largo', enlaces: 'Los enlaces son demasiado largos', hilo: 'El enlace al hilo es demasiado largo' };
  const MENSAJES = {
    'solo-personas-hecho': 'Solo una persona pasa una tarea a hecho',
    'es-de-otro': 'Esa tarea es de otra persona',
    'esta-hecha': 'Esa tarea ya está hecha',
    'sin-refinar': 'Una tarea sin refinar la saca una persona',
    'no-existe': 'La tarea ya no existe: recarga el tablero',
    'sin-servidor': 'No se ha podido hablar con el servidor',
    'estado': 'Esa columna no existe',
    'estado-desconocido': 'Esa columna no existe',
    'datos': 'El servidor no ha aceptado los datos',
  };
  const mensaje = (error, datos) => (error === 'campo-invalido' ? CAMPOS[datos && datos.campo] || 'Hay un campo que no vale' : MENSAJES[error] || 'No se ha podido hacer: ' + error);

  const opciones = (lista, actual, esc) => lista.map(([id, texto]) => `<option value="${esc(id)}"${id === actual ? ' selected' : ''}>${esc(texto)}</option>`).join('');
  const COLUMNAS = TABLERO.COLUMNAS.map(c => [c.id, c.titulo]);
  const enlace = (hilo, esc) => (/^https:\/\//.test(hilo) ? `<a href="${esc(hilo)}" target="_blank" rel="noopener">hilo</a>` : esc(hilo));
  const linea = (etiqueta, texto, esc) => (texto ? `<div class="meta"><b>${etiqueta}:</b> ${esc(texto)}</div>` : '');
  const historial = (t, esc, fecha) => (t.historial && t.historial.length
    ? `<details><summary>Historial (${t.historial.length})</summary>${t.historial.map(h => `<div class="meta">${esc(fecha(h.cuando))} · ${esc(h.quien)}${h.de && h.de !== h.a ? ` · ${esc(h.de)} → ${esc(h.a)}` : ''}${h.nota ? ' · ' + esc(h.nota) : ''}</div>`).join('')}</details>` : '');

  // La foto del grafo de la tarea (skill tarea-como-grafo): cuántos nodos pasan, de cuándo es la foto y los nodos por niveles con su evidencia
  const estadoNodo = e => e.replace('_', ' ');
  const intentos = n => (n.intentos ? ` × ${n.intentos}` : '');
  const nodoHtml = (n, esc) => `<div class="tb-nodo ${esc(n.estado)}"><div><span class="estado">${esc(estadoNodo(n.estado))}</span> <b>${esc(n.titulo || n.id)}</b>`
    + `${n.tipo ? ` <span class="meta">${esc(n.tipo)}</span>` : ''}${n.modelo || n.intentos ? ` <span class="meta">· ${esc(n.modelo || '')}${esc(intentos(n))}</span>` : ''}</div>`
    + `${n.depende.length ? `<div class="meta">Usa: ${n.depende.map(esc).join(', ')}</div>` : ''}${linea('Check', n.check, esc)}${linea('Evidencia', n.evidencia, esc)}${linea('Salida', n.salida, esc)}</div>`;
  const cuenta = (n, texto) => (n ? ` · ${n} ${texto}` : '');
  // t.grafo es un TABLERO.Grafo ya leído por los casos de uso (o null, con t.grafoMal si la foto no valía)
  function grafoHtml(t, esc, fecha) {
    if (t.grafoMal) return `<div class="meta">Grafo con datos raros (${esc(t.grafoMal)}).</div>`;
    if (!t.grafo) return '';
    const g = t.grafo, res = g.resumen(), pct = res.total ? Math.round(100 * res.pasa / res.total) : 0;
    const niveles = g.niveles().map((fila, i) => `<div class="tb-nivel"><span class="meta">Nivel ${i}</span>${fila.map(n => nodoHtml(n, esc)).join('')}</div>`).join('');
    const foto = [t.grafo_foto ? 'Foto del ' + fecha(t.grafo_foto) : 'Foto sin fecha', g.fase && 'fase: ' + g.fase, g.siguiente && 'siguiente: ' + g.siguiente].filter(Boolean).join(' · ');
    return `<details class="tb-grafo"><summary>Grafo: ${res.pasa} de ${res.total} nodos pasan${cuenta(res.porEstado.falla, 'fallan')}${cuenta(res.porEstado.bloqueado, 'bloqueados')}</summary>`
      + `<div class="tb-barra"><i style="width:${pct}%"></i></div><div class="meta">${esc(foto)}</div>${niveles}</details>`;
  }

  const tarjeta = (t, esc, fecha) => `<article class="cuenta tb-tarea" draggable="true" data-id="${t.id}">
    <div class="cab"><b>${esc(t.titulo)}</b></div>
    <div class="meta"><span class="estado">${esc(t.juego)}</span> <span class="estado">${esc(TABLERO.responsableTexto(t))}</span>${t.prioridad === 'normal' ? '' : ` <span class="estado">${esc(t.prioridad)}</span>`}${t.alfa ? ` <span class="estado">${esc(t.alfa)}</span>` : ''}</div>
    ${linea('Qué', t.descripcion, esc)}${linea('Hecho cuando', t.criterio, esc)}${linea('Enlaces', t.enlaces, esc)}${t.hilo ? `<div class="meta"><b>Hilo:</b> ${enlace(t.hilo, esc)}</div>` : ''}
    ${grafoHtml(t, esc, fecha)}${historial(t, esc, fecha)}
    <div class="accion"><select data-mover="${t.id}" aria-label="Mover a">${opciones(COLUMNAS, t.estado, esc)}</select><button type="button" data-editar="${t.id}">Editar</button></div></article>`;
  const columna = (c, esc, fecha) => `<section class="tb-col" data-columna="${c.id}"><h3>${esc(c.titulo)} <span class="meta">${c.tareas.length}</span></h3>${c.tareas.map(t => tarjeta(t, esc, fecha)).join('') || '<div class="meta">Vacía</div>'}</section>`;
  const html = (columnas, esc, fecha = String) => `<div class="tb-tablero">${columnas.map(c => columna(c, esc, fecha)).join('')}</div>`;

  // Los filtros de arriba: juego y responsable (con «todos») y el botón de tarea nueva
  const filtros = (juegos, filtro, esc) => `<div class="filtros"><button type="button" class="fuerte" data-nueva>Nueva tarea</button>
    <select data-filtro="juego" aria-label="Juego">${opciones([['', 'Todos los juegos'], ...juegos.map(j => [j, j])], filtro.juego || '', esc)}</select>
    <select data-filtro="responsable" aria-label="Responsable">${opciones([['', 'Todos'], ...Object.entries(TABLERO.RESPONSABLES)], filtro.responsable || '', esc)}</select></div>`;

  // El formulario de una tarea (nueva si v.id no existe). Cada campo lleva name= para que el controlador lo lea
  const campo = (nombre, etiqueta, valor, esc, ancho) => `<label>${etiqueta}<input type="text" name="${nombre}" value="${esc(valor || '')}"${ancho ? ` maxlength="${ancho}"` : ''}></label>`;
  const area = (nombre, etiqueta, valor, esc, ancho) => `<label>${etiqueta}<textarea name="${nombre}" rows="2" maxlength="${ancho}">${esc(valor || '')}</textarea></label>`;
  const formulario = (v, esc) => `<form class="caja tb-form" data-id="${v.id || ''}"><b>${v.id ? 'Editar tarea' : 'Nueva tarea (nace por refinar)'}</b>
    ${campo('titulo', 'Título', v.titulo, esc, 120)}${area('descripcion', 'Qué hay que hacer', v.descripcion, esc, 4000)}${area('criterio', 'Está hecho cuando…', v.criterio, esc, 2000)}
    <div class="filtros"><label>Juego o área<input type="text" name="juego" value="${esc(v.juego || 'general')}" maxlength="40" list="tb-juegos"></label>
    <label>Responsable<select name="responsable">${opciones([['', 'Sin responsable'], ...Object.entries(TABLERO.RESPONSABLES)], v.responsable || '', esc)}</select></label>
    <label>Prioridad<select name="prioridad">${opciones(Object.keys(TABLERO.PRIORIDADES).map(p => [p, p]), v.prioridad || 'normal', esc)}</select></label></div>
    ${campo('hilo', 'Enlace al hilo', v.hilo, esc, 300)}${area('enlaces', 'Otros enlaces (ADR, TODO, PR)', v.enlaces, esc, 1000)}
    <div class="filtros"><button type="submit" class="fuerte">Guardar</button><button type="button" data-cancelar>Cancelar</button></div></form>`;

  const ESTILO = '.tb-tablero{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}@media(max-width:1000px){.tb-tablero{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.tb-tablero{grid-template-columns:minmax(0,1fr)}}'
    + '.tb-col{display:grid;gap:8px;align-content:start;min-height:80px;padding:4px;border-radius:6px}.tb-col.encima{outline:2px dashed var(--acento)}.tb-col h3{margin:0;font-size:14px}.tb-tarea{padding:8px 10px;gap:4px;overflow-wrap:anywhere}.tb-tarea[draggable=true]{cursor:grab}'
    + '.tb-barra{height:6px;border:1px solid var(--linea);border-radius:4px;overflow:hidden;background:var(--bg);margin:4px 0}.tb-barra i{display:block;height:100%;background:var(--ok)}.tb-nivel{display:grid;gap:4px;margin-top:6px}.tb-nodo{border-left:3px solid var(--linea);padding-left:6px}.tb-nodo.pasa{border-color:var(--ok)}.tb-nodo.falla,.tb-nodo.bloqueado{border-color:var(--clara)}.tb-nodo.en_curso{border-color:var(--acento)}'
    + '.tb-form{display:grid;gap:8px}.tb-form textarea{font:inherit;color:var(--texto);background:var(--bg);border:1px solid var(--linea);border-radius:5px;padding:7px 9px;width:100%}.tb-form .filtros label{flex:1;min-width:140px}';
  return { html, filtros, formulario, mensaje, ESTILO };
})();
