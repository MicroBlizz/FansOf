// Fans Of · /gestion · TABLERO · adaptador · VISTA: el HTML del tablero (columnas con tarjetas pequeñas), de los filtros y del formulario. El detalle de una
// tarea, en el panel de la derecha, está en vista-detalle.js. Todo son funciones puras (reciben `esc`, que escapa el texto):
// se prueban en Node. El controlador (controlador.js) las pone en la página. Reutiliza las clases de /gestion (caja, cuenta, cab, estado, meta…).
'use strict';
TABLERO.vista = (() => {
  const CAMPOS = { titulo: 'El título tiene que tener de 1 a 120 letras', juego: 'El juego solo lleva minúsculas, números y guiones', descripcion: 'La descripción es demasiado larga', criterio: 'El criterio es demasiado largo', refinado: 'El informe de refinado es demasiado largo', esperando: 'Lo de «esperando a» tiene que ser corto (200 letras)', enlaces: 'Los enlaces son demasiado largos', hilo: 'El enlace al hilo es demasiado largo', requiere: 'En «Requiere» van números de tarea (#3, 7), como mucho 20' };
  const MENSAJES = {
    'es-de-otro': 'Esa tarea es de otra persona',
    'esta-hecha': 'Esa tarea ya está hecha',
    'sin-refinar': 'Una idea o una tarea en refinamiento solo pasa a pendiente o en curso',
    'sin-aprobacion': 'Para sacarla de ideas o de refinamiento, o pasarla a hecho, Claude enlaza vuestro sí en la nota',
    'no-existe': 'La tarea ya no existe: recarga el tablero',
    'sin-servidor': 'No se ha podido hablar con el servidor',
    'estado': 'Esa columna no existe',
    'estado-desconocido': 'Esa columna no existe',
    'datos': 'El servidor no ha aceptado los datos',
    'requisitos-abiertos': 'Para pasar a en curso, antes tienen que estar en revisión o hechas',
    'requisito-propio': 'Una tarea no puede requerirse a sí misma',
    'ciclo': 'Eso cerraría un círculo de tareas que se esperan entre sí',
    'requisito-no-existe': 'No existen las tareas',
    'requisitos-muchos': 'Como mucho 20 requisitos',
  };
  const numeros = datos => (datos && Array.isArray(datos.requisitos) && datos.requisitos.length ? ': ' + datos.requisitos.map(n => '#' + n).join(', ') : '');
  const mensaje = (error, datos) => (error === 'campo-invalido' ? CAMPOS[datos && datos.campo] || 'Hay un campo que no vale'
    : MENSAJES[error] ? MENSAJES[error] + numeros(datos) : 'No se ha podido hacer: ' + error);

  const opciones = (lista, actual, esc) => lista.map(([id, texto]) => `<option value="${esc(id)}"${id === actual ? ' selected' : ''}>${esc(texto)}</option>`).join('');
  const COLUMNAS = TABLERO.COLUMNAS.map(c => [c.id, c.titulo]);
  // La tarjeta es pequeña: número, título y etiquetas (si espera respuesta, si ya tiene informe de refinado y cuántos nodos pasan si lleva grafo).
  // Al pulsarla, su detalle sale en el panel de la derecha
  // Si aún no ha empezado y algún requisito sigue abierto: «Espera a #N», o «Bloqueada» si son varios (el detalle dice cuáles)
  const bloqueo = t => (b => (b.length ? ` <span class="estado tb-bloqueo">${b.length === 1 ? 'Espera a #' + b[0] : 'Bloqueada'}</span>` : ''))(TABLERO.bloqueos(t));
  const avanceGrafo = t => (t.grafo ? (r => ` <span class="estado">${r.pasa}/${r.total} nodos</span>`)(t.grafo.resumen()) : '');
  const tonoDe = id => (TABLERO.columna(id) || { tono: 'transparent' }).tono;
  const tarjeta = (t, esc, elegida, conColumna) => `<article class="cuenta tb-tarea${t.id === elegida ? ' elegida' : ''}" draggable="true" data-id="${t.id}" tabindex="0" style="border-left:4px solid ${tonoDe(t.estado)}" aria-label="Tarea #${t.id}: ${esc(t.titulo)}">
    <div class="cab"><span class="codigo">#${t.id}</span><b>${esc(t.titulo)}</b></div>
    <div class="meta">${conColumna ? `<span class="estado tb-donde">${esc(TABLERO.tituloDe(t.estado))}</span> ` : ''}<span class="estado">${esc(t.juego)}</span> <span class="estado">${esc(TABLERO.responsableTexto(t))}</span>${t.prioridad === 'normal' ? '' : ` <span class="estado">${esc(t.prioridad)}</span>`}${t.refinado ? ' <span class="estado">con informe</span>' : ''}${avanceGrafo(t)}${bloqueo(t)}</div>
    ${t.esperando ? `<div class="tb-espera">Esperando: ${esc(t.esperando)}</div>` : ''}</article>`;
  // Cabecera de la columna con su color y, debajo, su frase de ayuda (qué significa estar ahí)
  const cabecera = (c, esc) => `<h3 class="tb-cab" style="background:${c.tono}">${esc(c.titulo)} <span>${c.tareas.length}</span></h3>${c.ayuda ? `<div class="tb-ayuda">${esc(c.ayuda)}</div>` : ''}`;
  const columna = (c, esc, elegida) => `<section class="tb-col" data-columna="${c.id}">${cabecera(c, esc)}${c.tareas.map(t => tarjeta(t, esc, elegida)).join('') || '<div class="meta">Vacía</div>'}</section>`;
  // En el móvil (menos de 700 px) se ven tres botones grandes (TABLERO.GRUPOS_MOVIL) y la lista del grupo elegido; cada tarjeta dice en qué columna está
  const botonGrupo = (g, elegido, esc) => `<button type="button" class="tb-grupo${g.id === elegido ? ' activo' : ''}" data-grupo="${g.id}" style="--tono:${g.tono}" aria-pressed="${g.id === elegido}"><b>${g.tareas.length}</b>${esc(g.titulo)}</button>`;
  const movil = (columnas, esc, elegida, elegido) => {
    const grupos = TABLERO.agrupaMovil(columnas), g = grupos.find(x => x.id === elegido) || grupos[0];
    return `<div class="tb-movil"><div class="tb-grupos">${grupos.map(x => botonGrupo(x, g.id, esc)).join('')}</div>
    <div class="tb-lista-movil">${g.tareas.map(t => tarjeta(t, esc, elegida, true)).join('') || '<div class="meta">Nada ahora mismo</div>'}</div></div>`;
  };
  // elegida: el id de la tarea abierta en el panel (su tarjeta se marca); grupo: el grupo del móvil que se ve (ideas por defecto)
  const html = (columnas, esc, elegida = null, grupo = 'ideas') => `<div class="tb-tablero">${columnas.map(c => columna(c, esc, elegida)).join('')}</div>${movil(columnas, esc, elegida, grupo)}`;

  // Los filtros de arriba: tarea nueva, refrescar, la búsqueda (filtra mientras se escribe) y juego y responsable (con «todos»)
  const filtros = (juegos, filtro, esc) => `<div class="filtros"><button type="button" class="tb-rapida" data-rapida>Apuntar idea o fallo</button><button type="button" class="fuerte" data-nueva>Nueva tarea</button><button type="button" data-refrescar>Refrescar</button>
    <input type="search" data-buscar value="${esc(filtro.texto || '')}" placeholder="Buscar: #12, palabras…" aria-label="Buscar tareas">
    <select data-filtro="juego" aria-label="Juego">${opciones([['', 'Todos los juegos'], ...juegos.map(j => [j, j])], filtro.juego || '', esc)}</select>
    <select data-filtro="responsable" aria-label="Responsable">${opciones([['', 'Todos'], ...Object.entries(TABLERO.RESPONSABLES)], filtro.responsable || '', esc)}</select></div>`;

  // El formulario de una tarea (nueva si v.id no existe). Cada campo lleva name= para que el controlador lo lea. «Esperando a» solo sale en curso
  const campo = (nombre, etiqueta, valor, esc, ancho) => `<label>${etiqueta}<input type="text" name="${nombre}" value="${esc(valor || '')}"${ancho ? ` maxlength="${ancho}"` : ''}></label>`;
  const area = (nombre, etiqueta, valor, esc, ancho) => `<label>${etiqueta}<textarea name="${nombre}" rows="2" maxlength="${ancho}">${esc(valor || '')}</textarea></label>`;
  const formulario = (v, esc) => `<form class="tb-form" data-id="${v.id || ''}"><div class="cab"><b>${v.id ? 'Editar tarea #' + v.id : 'Nueva tarea (nace en Ideas)'}</b></div>
    ${campo('titulo', 'Título', v.titulo, esc, 120)}<div class="tb-parecidas" data-parecidas aria-live="polite"></div>${area('descripcion', 'Qué hay que hacer', v.descripcion, esc, 4000)}${area('criterio', 'Está hecho cuando…', v.criterio, esc, 2000)}
    ${area('refinado', 'Informe de refinado (dudas, choques, qué queda fuera)', v.refinado, esc, 4000)}${v.estado === 'en_curso' ? campo('esperando', 'Esperando a (a quién y qué; se borra al salir de en curso)', v.esperando, esc, 200) : ''}
    <div class="filtros"><label>Juego o área<input type="text" name="juego" value="${esc(v.juego || 'general')}" maxlength="40" list="tb-juegos"></label>
    <label>Responsable<select name="responsable">${opciones([['', 'Sin responsable'], ...Object.entries(TABLERO.RESPONSABLES)], v.responsable || '', esc)}</select></label>
    <label>Prioridad<select name="prioridad">${opciones(Object.keys(TABLERO.PRIORIDADES).map(p => [p, p]), v.prioridad || 'normal', esc)}</select></label></div>
    ${campo('requiere', 'Requiere (números de tarea: #3, 7; no entra en curso hasta que estén en revisión o hechas)', (v.requiere || []).map(r => '#' + r.id).join(', '), esc, 200)}
    ${campo('hilo', 'Enlace al hilo', v.hilo, esc, 300)}${area('enlaces', 'Otros enlaces (ADR, TODO, PR)', v.enlaces, esc, 1000)}
    <div class="filtros"><button type="submit" class="fuerte">Guardar</button><button type="button" data-cancelar>Cancelar</button></div></form>`;

  // El formulario corto de «Apuntar idea o fallo» (Pepins, tarea #63): qué es, una frase y el juego. Lo demás se rellena después con Editar
  const tipo = (valor, texto, marcado) => `<label class="tb-tipo"><input type="radio" name="tipo" value="${valor}"${marcado ? ' checked' : ''}>${texto}</label>`;
  const formularioRapido = (juegos, esc) => `<form class="tb-form" data-rapida><div class="cab"><b>Apuntar idea o fallo</b></div>
    <div class="tb-tipos">${tipo('idea', 'Una idea', true)}${tipo('fallo', 'Un fallo', false)}</div>
    <label>Cuéntalo en una frase<input type="text" name="titulo" maxlength="120" required></label><div class="tb-parecidas" data-parecidas aria-live="polite"></div>
    <label>¿De qué juego?<select name="juego">${opciones([['general', 'General'], ...juegos.filter(j => j !== 'general').map(j => [j, j])], 'general', esc)}</select></label>
    <div class="meta">Lo demás (prioridad, criterio, quién lo hace) se rellena después.</div>
    <div class="filtros"><button type="submit" class="tb-rapida">Guardar en Ideas</button><button type="button" data-cancelar>Cancelar</button></div></form>`;

  // La lista de tareas parecidas al título que se escribe (para no duplicar): cada una abre su detalle si está en el tablero
  const parecidas = (lista, esc) => (lista.length
    ? `<b>Se parece a:</b> ${lista.map(p => `<button type="button" class="tb-parecida" data-abrir="${p.id}">#${p.id} ${esc(p.titulo)} <span class="meta">${esc(TABLERO.tituloDe(p.estado))}</span></button>`).join(' ')}` : '');

  const ESTILO = '.tb-tablero{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}@media(max-width:1000px){.tb-tablero{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.tb-tablero{grid-template-columns:minmax(0,1fr)}}'
    + '.tb-col{display:grid;gap:8px;align-content:start;min-height:80px;padding:4px;border-radius:6px}.tb-col.encima{outline:2px dashed var(--acento)}.tb-col h3{margin:0;font-size:14px}.tb-cab{display:flex;justify-content:space-between;color:#10202b;border-radius:6px;padding:6px 8px}.tb-ayuda{font-size:12px;color:var(--suave);line-height:1.35}.tb-tarea{padding:6px 8px;gap:3px;overflow-wrap:anywhere;cursor:pointer;font-size:13px}.tb-tarea .codigo{font-size:13px}.tb-tarea:hover,.tb-tarea.elegida{border-color:var(--acento)}.tb-tarea.elegida{box-shadow:inset 3px 0 0 var(--acento)}'
    + '.tb-vista{display:grid;gap:10px;align-items:start}.tb-vista.abierto{grid-template-columns:minmax(0,1fr) minmax(300px,400px)}.tb-panel{position:sticky;top:8px;max-height:calc(100vh - 16px);overflow:auto;display:grid;gap:8px;align-content:start}.tb-tarea .estado{white-space:nowrap}.tb-panel .cab button{margin-left:auto}'
    + '@media(max-width:1200px){.tb-vista.abierto{grid-template-columns:minmax(0,1fr)}.tb-panel{position:fixed;inset:0 0 0 auto;width:min(420px,100%);max-height:none;z-index:20;border-radius:0;box-shadow:-4px 0 16px rgba(0,0,0,.25)}}'
    + '.tb-barra{height:6px;border:1px solid var(--linea);border-radius:4px;overflow:hidden;background:var(--bg);margin:4px 0}.tb-barra i{display:block;height:100%;background:var(--ok)}.tb-nivel{display:grid;gap:4px;margin-top:6px}.tb-nodo{border-left:3px solid var(--linea);padding-left:6px}.tb-nodo.pasa{border-color:var(--ok)}.tb-nodo.falla,.tb-nodo.bloqueado{border-color:var(--clara)}.tb-nodo.en_curso{border-color:var(--acento)}'
    + '.tb-form{display:grid;gap:8px}.tb-form textarea{font:inherit;color:var(--texto);background:var(--bg);border:1px solid var(--linea);border-radius:5px;padding:7px 9px;width:100%}.tb-form .filtros label{flex:1;min-width:140px}'
    + '.tb-espera{font-size:12px;color:var(--debil);background:var(--debil-fondo);border-radius:4px;padding:2px 6px}.tb-parecidas{display:flex;flex-wrap:wrap;gap:4px;font-size:13px;align-items:baseline}.tb-parecidas:empty{display:none}.tb-parecida{font-size:12px;padding:2px 6px}[data-buscar]{flex:1;min-width:160px;max-width:320px}.tb-informe{white-space:pre-wrap}.tb-tarea .tb-bloqueo{color:var(--debil);background:var(--debil-fondo)}.tb-enlazadas{display:flex;flex-wrap:wrap;gap:4px;align-items:baseline}';
  const ESTILO_MOVIL = '.tb-movil{display:none;gap:10px}.tb-grupos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}'
    + '.tb-grupo{min-height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border:2px solid var(--tono);background:var(--panel);color:var(--texto);border-radius:12px;font-weight:600}'
    + '.tb-grupo b{font-size:20px}.tb-grupo.activo{background:var(--tono);color:#10202b}.tb-lista-movil{display:grid;gap:8px}.tb-lista-movil .tb-tarea{font-size:15px;padding:10px 12px}.tb-donde{font-weight:600}'
    + '.tb-rapida{background:#3dbe8b;color:#10202b;border-color:#3dbe8b;font-weight:700}.tb-tipos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.tb-tipo{display:flex;gap:6px;align-items:center;border:2px solid var(--acento);border-radius:10px;padding:10px;font-weight:600}.tb-tipo:has(input:checked){background:var(--acento);color:var(--acento-texto)}'
    + '@media(max-width:700px){.tb-tablero{display:none}.tb-movil{display:grid}.filtros .tb-rapida{flex-basis:100%;min-height:52px;font-size:16px}}';
  return { html, filtros, formulario, formularioRapido, parecidas, mensaje, opciones, COLUMNAS, ESTILO: ESTILO + ESTILO_MOVIL };
})();
