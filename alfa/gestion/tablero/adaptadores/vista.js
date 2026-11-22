// Fans Of · /gestion · TABLERO · adaptador · VISTA: el HTML del tablero (columnas con tarjetas pequeñas), de los filtros y del formulario. El detalle de una
// tarea, en el panel de la derecha, está en vista-detalle.js. Todo son funciones puras (reciben `esc`, que escapa el texto):
// se prueban en Node. El controlador (controlador.js) las pone en la página. Reutiliza las clases de /gestion (caja, cuenta, cab, estado, meta…).
'use strict';
TABLERO.vista = (() => {
  const CAMPOS = { titulo: 'El título tiene que tener de 1 a 120 letras', corto: 'El nombre corto tiene que tener como mucho 60 letras', juego: 'El juego solo lleva minúsculas, números y guiones', descripcion: 'La descripción es demasiado larga', criterio: 'El criterio es demasiado largo', refinado: 'El informe de refinado es demasiado largo', esperando: 'Lo de «esperando a» tiene que ser corto (200 letras)', enlaces: 'Los enlaces son demasiado largos', hilo: 'El enlace al hilo es demasiado largo', que_mirar: '«Qué mirar» es demasiado largo (1500 letras)', pedida_por: 'Quién la pidió: Arkioner o Pepins', responsable: 'El responsable es Arkioner, Pepins o nadie', requiere: 'En «Requiere» van números de tarea (#3, 7), como mucho 20' };
  const MENSAJES = {
    'es-de-otro': 'Esa tarea es de otra persona',
    'falta-para': 'Claude tiene que decir para quién trabaja (Arkioner o Pepins)',
    'falta-confirmacion': 'Para pasarla a tu nombre hace falta el enlace a tu sí',
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
    'informe-sin-aprobar': 'Para salir de ideas o de refinamiento, el informe de refinado tiene que estar aprobado',
    'informe-falta': 'Todavía no hay informe de refinado que aprobar',
    'sin-nota': 'Escribe qué hay que cambiar del informe',
    'accion': 'Esa acción no existe',
    'fuera-de-refinamiento': 'El informe solo se aprueba mientras la tarea está en ideas o en refinamiento',
    'reaccion': 'Esa reacción no existe',
    'sin-catalogo': 'No se ha podido leer la lista de juegos: las tareas salen sin el botón Probar',
    'catalogo-roto': 'La lista de juegos no vale: las tareas salen sin el botón Probar',
    'informe-cambiado': 'El informe ha cambiado desde que lo abriste: refresca y vuelve a leerlo',
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
  // Con nombre corto (SQL 141, Pepins): «#61 Paperwork: cosas de pago» en grande y el título largo debajo, más pequeño; sin él, el título como siempre
  const cabeza = (t, esc) => (t.corto ? `<div class="cab"><span class="codigo">#${t.id}</span><b class="tb-corto">${esc(t.corto)}</b></div><div class="tb-largo">${esc(t.titulo)}</div>`
    : `<div class="cab"><span class="codigo">#${t.id}</span><b>${esc(t.titulo)}</b></div>`);
  const pidio = (t, esc) => (TABLERO.pidioTexto(t) ? ` <span class="estado">${esc(TABLERO.pidioTexto(t))}</span>` : '');   // ADR 136
  // El estado del informe, solo antes de pendiente (después siempre está aprobado; ADR 137). «Falta» y «con cambios» se ven en ámbar
  const informe = (t, esc) => (TABLERO.sinRefinar(t.estado) && TABLERO.informeTexto(t)
    ? ` <span class="estado${t.informe === 'falta' || t.informe === 'cambios' ? ' tb-bloqueo' : ''}">${esc(TABLERO.informeTexto(t))}</span>` : '');
  const tonoDe = id => (TABLERO.columna(id) || { tono: 'transparent' }).tono;
  const tarjeta = (t, esc, elegida, clase = '', extra = '', yo = null, alfa = []) => `<article class="cuenta tb-tarea${clase}${t.id === elegida ? ' elegida' : ''}" draggable="true" data-id="${t.id}" tabindex="0" style="border-left:4px solid ${tonoDe(t.estado)}" aria-label="Tarea #${t.id}: ${esc(t.titulo)}">
    ${cabeza(t, esc)}
    <div class="meta"><span class="estado">${esc(t.juego)}</span> <span class="estado">${esc(TABLERO.responsableTexto(t))}</span>${pidio(t, esc)}${TABLERO.vistaRevisar.urgente(t)}${informe(t, esc)}${avanceGrafo(t)}${bloqueo(t)}</div>
    ${t.esperando ? `<div class="tb-espera">Esperando: ${esc(t.esperando)}</div>` : ''}${TABLERO.vistaReacciones.fila(t, esc)}${extra}${TABLERO.vistaRevisar.tarjeta(t, yo, esc, alfa)}</article>`;
  // Con una sola columna a la vista (ADR 147; Pepins, 18-11-2026: «muy vacío»), cada tarea es una fila ancha en tres partes: número, título y etiquetas;
  // «Qué hay que hacer»; y «Está hecho cuando…» con su último cambio. Los textos largos se cortan con «…» (el detalle los enseña enteros)
  const trozo = (clase, titulo, texto, esc) => `<div class="tb-trozo ${clase}"><b>${titulo}</b><div class="tb-texto">${texto ? esc(texto) : '<span class="meta">Sin escribir</span>'}</div></div>`;
  const fila = (t, esc, elegida, fecha, yo, alfa) => tarjeta(t, esc, elegida, ' tb-fila', trozo('tb-que', 'Qué hay que hacer', t.descripcion, esc) + trozo('tb-cuando', 'Está hecho cuando…', t.criterio, esc)
    + (t.actualizado && fecha ? `<div class="meta tb-cambio">Último cambio: ${esc(fecha(t.actualizado))}</div>` : ''), yo, alfa);
  // Cabecera de la columna con su color y, debajo, su frase de ayuda (qué significa estar ahí). Es un botón (Pepins, 19-11-2026: en el PC sin la fila de botones
  // repetida): pulsarla deja solo esa columna y, si ya es la elegida (`activa`), vuelve a todas
  const cabecera = (c, esc, activa) => `<h3 class="tb-cab" style="background:${c.tono}"><button type="button" class="tb-cab-boton" data-ver="${activa ? '' : c.id}" aria-pressed="${activa}" title="${activa ? 'Ver todas las columnas' : 'Ver solo esta columna'}">${esc(c.titulo)} <span>${c.tareas.length}</span></button></h3>${c.ayuda ? `<div class="tb-ayuda">${esc(c.ayuda)}</div>` : ''}`;
  // Debajo de las tarjetas, «Ver las N más» o «Ver menos» si la columna pasa del tope (TABLERO.recorta; tarea #301). Sin recortar (c.vistas no viene), todas
  const despliega = c => (c.mas ? `<button type="button" class="tb-vermas" data-despliega="${c.id}" aria-expanded="false">${c.mas === 1 ? 'Ver 1 más' : `Ver las ${c.mas} más`}</button>`
    : c.menos ? `<button type="button" class="tb-vermas" data-despliega="${c.id}" aria-expanded="true">Ver menos</button>` : '');
  const columna = (c, esc, elegida, fecha, enFilas, yo, activa = false, alfa = []) => `<section class="tb-col" data-columna="${c.id}">${cabecera(c, esc, activa)}${(c.vistas || c.tareas).map(t => (enFilas ? fila(t, esc, elegida, fecha, yo, alfa) : tarjeta(t, esc, elegida, '', '', yo, alfa))).join('') || '<div class="meta">Vacía</div>'}${despliega(c)}</section>`;
  // Los botones de arriba (ADR 147): «Todas» y uno por columna, con su recuento. Al pulsar uno solo se ve esa columna, con una tarea por fila a lo ancho.
  // Solo se ven en el móvil: en pantalla ancha hacen lo mismo las cabeceras de las columnas (Pepins, 19-11-2026). En el móvil (menos de 700 px) «Todas» ocupa una fila arriba y enseña el mapa pequeño de las seis columnas (tarea #147)
  const boton = (id, titulo, tono, cuantas, activo, esc) => `<button type="button" class="tb-ver${activo ? ' activo' : ''}" data-ver="${id}" style="--tono:${tono}" aria-pressed="${activo}"><b>${cuantas}</b>${esc(titulo)}</button>`;
  const botones = (columnas, vista, esc) => {
    const todas = boton('', 'Todas', 'var(--acento)', columnas.reduce((n, c) => n + c.tareas.length, 0), !vista, esc);
    return `<div class="tb-botones">${todas}${columnas.map(c => boton(c.id, c.titulo, c.tono, c.tareas.length, c.id === vista, esc)).join('')}</div>`;
  };
  // En el móvil: sin columna elegida («Todas»), el mapa pequeño de las seis (tarea #147); con una, esa columna con sus tarjetas
  const movil = (columnas, esc, elegida, vista, yo, alfa) => `<div class="tb-movil">${vista ? columna(TABLERO.columnasVisibles(columnas, vista)[0], esc, elegida, null, false, yo, true, alfa) : TABLERO.vistaMapa.html(columnas, esc, elegida)}</div>`;
  // elegida: el id de la tarea abierta en el panel (su tarjeta se marca); vista: la columna elegida con los botones (null = todas); fecha: cómo se escribe una fecha;
  // yo: quién mira ('pepins', 'arkioner' o null), para los botones de revisar de las tarjetas (tarea #161); alfa: los ids del catálogo, para el botón Probar
  const html = (columnas, esc, elegida = null, vista = null, fecha = null, yo = null, alfa = []) => {
    const visibles = TABLERO.columnasVisibles(columnas, vista), una = visibles.length === 1;
    return `${botones(columnas, vista, esc)}<div class="tb-tablero${una ? ' tb-una' : ''}">${visibles.map(c => columna(c, esc, elegida, fecha, una, yo, una && !!vista, alfa)).join('')}</div>${movil(columnas, esc, elegida, vista, yo, alfa)}`;
  };

  // Los filtros de arriba: tarea nueva, refrescar, la búsqueda (filtra mientras se escribe), juego, responsable, persona (con «todos»; ADR 136: siempre empieza en Todos)
  // y «Ordenar por» (ADR 147: empieza en Prioridad)
  const PERSONAS = [['', 'Todos'], ...Object.entries(TABLERO.PERSONAS)];
  const filtros = (juegos, filtro, esc) => `<div class="filtros"><button type="button" class="tb-rapida" data-rapida>Apuntar idea o fallo</button><button type="button" class="fuerte" data-nueva>Nueva tarea</button><button type="button" data-refrescar>Refrescar</button>
    <input type="search" data-buscar value="${esc(filtro.texto || '')}" placeholder="Buscar: 104, palabras…" aria-label="Buscar tareas">
    <select data-filtro="juego" aria-label="Juego">${opciones([['', 'Todos los juegos'], ...juegos.map(j => [j, j])], filtro.juego || '', esc)}</select>
    <select data-filtro="responsable" aria-label="Responsable">${opciones([['', 'Todos'], ...Object.entries(TABLERO.RESPONSABLES)], filtro.responsable || '', esc)}</select>
    <label class="tb-persona">Persona <select data-filtro="persona" aria-label="Persona: de lo que es responsable y lo que pidió sin responsable">${opciones(PERSONAS, filtro.persona || '', esc)}</select></label>
    <label class="tb-persona">Ordenar por <select data-filtro="orden" aria-label="Ordenar por">${opciones(Object.entries(TABLERO.TEXTO_ORDEN), filtro.orden || 'prioridad', esc)}</select></label></div>`;

  // El formulario de una tarea (nueva si v.id no existe). Cada campo lleva name= para que el controlador lo lea. «Esperando a» solo sale en curso
  const campo = (nombre, etiqueta, valor, esc, ancho) => `<label>${etiqueta}<input type="text" name="${nombre}" value="${esc(valor || '')}"${ancho ? ` maxlength="${ancho}"` : ''}></label>`;
  const area = (nombre, etiqueta, valor, esc, ancho) => `<label>${etiqueta}<textarea name="${nombre}" rows="2" maxlength="${ancho}">${esc(valor || '')}</textarea></label>`;
  // «Lo pidió» es obligatorio al crear (ADR 136); al editar una vieja puede quedar sin dato. Responsable: Arkioner, Pepins o nadie (ADR 154)
  const SIN_DATO = [['', 'Sin dato'], ...Object.entries(TABLERO.PERSONAS)];
  const formulario = (v, esc) => `<form class="tb-form" data-id="${v.id || ''}"><div class="cab"><b>${v.id ? 'Editar tarea #' + v.id : 'Nueva tarea (nace en Ideas)'}</b></div>
    ${campo('titulo', 'Título', v.titulo, esc, 120)}${campo('corto', 'Nombre corto y fácil (sale en la tarjeta junto al número; si se deja vacío, sale el título)', v.corto, esc, 60)}<div class="tb-parecidas" data-parecidas aria-live="polite"></div>${area('descripcion', 'Qué hay que hacer', v.descripcion, esc, 4000)}${area('criterio', 'Está hecho cuando…', v.criterio, esc, 2000)}
    ${area('refinado', 'Informe de refinado (dudas, choques, qué queda fuera)', v.refinado, esc, 4000)}${v.estado === 'en_curso' ? campo('esperando', 'Esperando a (a quién y qué; se borra al salir de en curso)', v.esperando, esc, 200) : ''}
    <div class="filtros"><label>Juego o área<input type="text" name="juego" value="${esc(v.juego || 'general')}" maxlength="40" list="tb-juegos"></label>
    <label>Responsable<select name="responsable">${opciones([['', 'Sin responsable'], ...Object.entries(TABLERO.RESPONSABLES)], v.responsable || '', esc)}</select></label>
    <label>Lo pidió<select name="pedida_por"${v.id ? '' : ' required'}>${opciones(SIN_DATO, v.pedida_por || '', esc)}</select></label>
    <label>Prioridad<select name="prioridad">${opciones(Object.keys(TABLERO.PRIORIDADES).map(p => [p, p]), v.prioridad || 'normal', esc)}</select></label></div>
    ${campo('requiere', 'Requiere (números de tarea: #3, 7; no entra en curso hasta que estén en revisión o hechas)', (v.requiere || []).map(r => '#' + r.id).join(', '), esc, 200)}
    ${campo('hilo', 'Enlace al hilo', v.hilo, esc, 300)}${area('enlaces', 'Otros enlaces (ADR, TODO, PR)', v.enlaces, esc, 1000)}${area('que_mirar', 'Qué mirar al revisar (un paso por línea)', v.que_mirar, esc, 1500)}
    <div class="filtros"><button type="submit" class="fuerte">Guardar</button><button type="button" data-cancelar>Cancelar</button></div></form>`;

  // El formulario corto de «Apuntar idea o fallo» (Pepins, tarea #63): qué es, una frase y el juego. Lo demás se rellena después con Editar
  const tipo = (valor, texto, marcado) => `<label class="tb-tipo"><input type="radio" name="tipo" value="${valor}"${marcado ? ' checked' : ''}>${texto}</label>`;
  const formularioRapido = (juegos, esc) => `<form class="tb-form" data-rapida><div class="cab"><b>Apuntar idea o fallo</b></div>
    <div class="tb-tipos">${tipo('idea', 'Una idea', true)}${tipo('fallo', 'Un fallo', false)}</div>
    <label>Cuéntalo en una frase<input type="text" name="titulo" maxlength="120" required></label><div class="tb-parecidas" data-parecidas aria-live="polite"></div>
    <label>¿Quién lo pide?<select name="pedida_por" required>${opciones(SIN_DATO, '', esc)}</select></label>
    <label>¿De qué juego?<select name="juego">${opciones([['general', 'General'], ...juegos.filter(j => j !== 'general').map(j => [j, j])], 'general', esc)}</select></label>
    <div class="meta">Lo demás (prioridad, criterio, quién lo hace) se rellena después.</div>
    <div class="filtros"><button type="submit" class="tb-rapida">Guardar en Ideas</button><button type="button" data-cancelar>Cancelar</button></div></form>`;

  // La lista de tareas parecidas al título que se escribe (para no duplicar): cada una abre su detalle si está en el tablero
  const parecidas = (lista, esc) => (lista.length
    ? `<b>Se parece a:</b> ${lista.map(p => `<button type="button" class="tb-parecida" data-abrir="${p.id}">#${p.id} ${esc(p.titulo)} <span class="meta">${esc(TABLERO.tituloDe(p.estado))}</span></button>`).join(' ')}` : '');

  const ESTILO = '.tb-tablero{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}@media(max-width:1000px){.tb-tablero{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.tb-tablero{grid-template-columns:minmax(0,1fr)}}'
    + '.tb-col{display:grid;gap:8px;align-content:start;min-height:80px;padding:4px;border-radius:6px}.tb-col.encima{outline:2px dashed var(--acento)}.tb-col h3{margin:0;font-size:14px}.tb-cab{display:flex;justify-content:space-between;color:#10202b;border-radius:6px;padding:6px 8px}.tb-ayuda{font-size:12px;color:var(--suave);line-height:1.35}.tb-tarea{padding:6px 8px;gap:3px;overflow-wrap:anywhere;cursor:pointer;font-size:13px}.tb-tarea .codigo{font-size:13px}.tb-tarea:hover,.tb-tarea.elegida{border-color:var(--acento)}.tb-tarea.elegida{box-shadow:inset 3px 0 0 var(--acento)}'
    + '.tb-vista{display:grid;gap:10px;align-items:start}.tb-vista.abierto{grid-template-columns:minmax(0,1fr) minmax(300px,400px)}.tb-panel{position:sticky;top:8px;max-height:calc(100vh - 16px);overflow:auto;display:grid;gap:8px;align-content:start}.tb-tarea .estado{white-space:nowrap}.tb-panel .cab button{margin-left:auto}'
    + '@media(max-width:1200px){.tb-vista.abierto{grid-template-columns:minmax(0,1fr)}.tb-panel{position:fixed;inset:0 0 0 auto;width:min(420px,100%);max-height:none;z-index:40;border-radius:0;box-shadow:-4px 0 16px rgba(0,0,0,.25)}}'
    + '.tb-barra{height:6px;border:1px solid var(--linea);border-radius:4px;overflow:hidden;background:var(--bg);margin:4px 0}.tb-barra i{display:block;height:100%;background:var(--ok)}.tb-nivel{display:grid;gap:4px;margin-top:6px}.tb-nodo{border-left:3px solid var(--linea);padding-left:6px}.tb-nodo.pasa{border-color:var(--ok)}.tb-nodo.falla,.tb-nodo.bloqueado{border-color:var(--clara)}.tb-nodo.en_curso{border-color:var(--acento)}'
    + '.tb-form{display:grid;gap:8px}.tb-form textarea{font:inherit;color:var(--texto);background:var(--bg);border:1px solid var(--linea);border-radius:5px;padding:7px 9px;width:100%}.tb-form .filtros label{flex:1;min-width:140px}'
    + '.tb-espera{font-size:12px;color:var(--debil);background:var(--debil-fondo);border-radius:4px;padding:2px 6px}.tb-parecidas{display:flex;flex-wrap:wrap;gap:4px;font-size:13px;align-items:baseline}.tb-parecidas:empty{display:none}.tb-parecida{font-size:12px;padding:2px 6px}[data-buscar]{flex:1;min-width:160px;max-width:320px}.tb-informe{white-space:pre-wrap}.tb-tarea .tb-bloqueo{color:var(--debil);background:var(--debil-fondo)}.tb-enlazadas{display:flex;flex-wrap:wrap;gap:4px;align-items:baseline}.tb-persona{display:flex;gap:4px;align-items:center}.tb-informe-accion{display:flex;flex-wrap:wrap;gap:6px}.tb-informe-accion input{flex:1;min-width:140px}';
  const ESTILO_MOVIL = '.tb-movil{display:none}.tb-botones{display:none;flex-wrap:wrap;gap:8px;margin-bottom:10px}'
    + '.tb-cab-boton{all:unset;box-sizing:border-box;display:flex;justify-content:space-between;width:100%;cursor:pointer;font:inherit;color:inherit}.tb-cab:hover{filter:brightness(1.08)}.tb-tablero{margin-top:10px}.tb-cab:has(.tb-cab-boton:focus-visible){outline:2px solid var(--acento);outline-offset:2px}'
    + '.tb-ver{min-height:44px;display:flex;align-items:center;gap:6px;border:2px solid var(--tono);background:var(--panel);color:var(--texto);border-radius:10px;font-weight:600;padding:4px 12px}'
    + '.tb-vermas{min-height:44px;width:100%;font-weight:600}.tb-ver b{font-size:16px}.tb-ver.activo{background:var(--tono);color:#10202b}.tb-tablero.tb-una{grid-template-columns:minmax(0,1fr)}.tb-una .tb-tarea{font-size:15px;padding:10px 12px}.tb-fila{display:grid;grid-template-columns:minmax(220px,1.1fr) minmax(0,1.6fr) minmax(0,1.3fr);grid-template-rows:auto auto auto 1fr;column-gap:18px;row-gap:3px}.tb-fila>.cab,.tb-fila>.tb-largo,.tb-fila>.meta,.tb-fila>.tb-espera{grid-column:1}.tb-fila>.tb-trozo{border-left:1px solid var(--linea);padding-left:14px}.tb-fila>.tb-que{grid-column:2;grid-row:1/5}.tb-fila>.tb-cuando{grid-column:3;grid-row:1/4}.tb-fila>.tb-cambio{grid-column:3;grid-row:4;padding-left:15px;align-self:end}.tb-trozo b{font-size:12px;color:var(--suave);text-transform:uppercase;letter-spacing:.03em}.tb-texto{white-space:pre-wrap;line-height:1.4;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}'
    + '.tb-movil .tb-tarea{font-size:15px;padding:10px 12px}.tb-corto{font-size:1.1em}.tb-largo{font-size:.9em;color:var(--suave);line-height:1.35}'
    + '.tb-rapida{background:#22c55e;color:#052e14;border-color:#22c55e;font-weight:700}.tb-tipos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.tb-tipo{display:flex;gap:6px;align-items:center;border:2px solid var(--acento);border-radius:10px;padding:10px;font-weight:600}.tb-tipo:has(input:checked){background:var(--acento);color:var(--acento-texto)}'
    + '@media(max-width:700px){.tb-tablero{display:none}.tb-movil{display:grid}.tb-botones{display:grid}.filtros .tb-rapida{flex-basis:100%;min-height:52px;font-size:16px}'
    + '.tb-botones{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.tb-ver{min-height:64px;flex-direction:column;justify-content:center;gap:2px;border-radius:12px}.tb-ver b{font-size:20px}.tb-ver[data-ver=""]{grid-column:1/-1;min-height:46px;flex-direction:row;gap:8px}}';
  return { html, pidio, filtros, formulario, formularioRapido, parecidas, mensaje, opciones, COLUMNAS, ESTILO: ESTILO + ESTILO_MOVIL + TABLERO.vistaReacciones.ESTILO + TABLERO.vistaMapa.ESTILO };
})();
