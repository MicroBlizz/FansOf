// Fans Of · /gestion · TABLERO · adaptador · VISTA DEL DETALLE: el HTML del panel de la derecha con todo lo de una tarea (qué, criterio, a quién espera,
// informe de refinado, requisitos, enlaces, fechas, mover y editar, la foto del grafo y el historial), para seguir viendo el tablero mientras se van abriendo tareas. Funciones puras como vista.js
// (reciben `esc` y `fecha`), de la que usa `opciones` y `COLUMNAS`; se prueban en Node.
'use strict';
TABLERO.vistaDetalle = (() => {
  const enlace = (hilo, esc) => (/^https:\/\//.test(hilo) ? `<a href="${esc(hilo)}" target="_blank" rel="noopener">hilo</a>` : esc(hilo));
  const linea = (etiqueta, texto, esc) => (texto ? `<div class="meta"><b>${etiqueta}:</b> ${esc(texto)}</div>` : '');
  const historial = (t, esc, fecha) => (t.historial && t.historial.length
    ? `<details><summary>Historial (${t.historial.length})</summary>${t.historial.map(h => `<div class="meta">${esc(fecha(h.cuando))} · ${esc(h.quien)}${h.de && h.de !== h.a ? ` · ${esc(TABLERO.tituloDe(h.de))} → ${esc(TABLERO.tituloDe(h.a))}` : ''}${h.nota ? ' · ' + esc(h.nota) : ''}</div>`).join('')}</details>` : '');

  // La foto del grafo de la tarea (skill tarea-como-grafo): cuántos nodos pasan, de cuándo es la foto y los nodos por niveles con su evidencia
  const estadoNodo = TABLERO.estadoNodoTexto;
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
    return `<details class="tb-grafo" open><summary>Grafo: ${res.pasa} de ${res.total} nodos pasan${cuenta(res.porEstado.falla, 'fallan')}${cuenta(res.porEstado.bloqueado, 'bloqueados')}</summary>`
      + `<div class="tb-barra"><i style="width:${pct}%"></i></div><div class="meta">${esc(foto)}</div>${TABLERO.vistaGrafo.dibujo(g.niveles(), esc)}`
      + `<details><summary>Lista de nodos</summary>${niveles}</details></details>`;
  }

  // «Requiere» y «Lo necesitan»: número, título y columna; cada una abre su detalle (si es una hecha antigua, el controlador avisa de que no está en el tablero)
  const enlazadas = (etiqueta, lista, esc) => (lista && lista.length ? `<div class="meta tb-enlazadas"><b>${etiqueta}:</b> ${lista.map(r => `<button type="button" class="tb-parecida" data-abrir="${r.id}">#${r.id} ${esc(r.titulo)} <span class="meta">${esc(TABLERO.tituloDe(r.estado))}</span></button>`).join(' ')}</div>` : '');
  const fechas = (t, esc, fecha) => [t.creado && 'Creada el ' + fecha(t.creado) + (t.creado_por ? ' por ' + t.creado_por : ''), t.actualizado && 'cambiada el ' + fecha(t.actualizado)]
    .filter(Boolean).map(esc).join(' · ');
  const etiquetas = (t, esc) => `<span class="estado">${esc(t.juego)}</span> <span class="estado">${esc(TABLERO.responsableTexto(t))}</span> <span class="estado">${esc(t.prioridad)}</span>`
    + `${t.alfa ? ` <span class="estado">${esc(t.alfa)}</span>` : ''}`;
  const detalle = (t, esc, fecha = String) => `<div class="cab"><span class="codigo">#${t.id}</span><b>${esc(t.titulo)}</b><button type="button" data-cerrar aria-label="Cerrar el detalle">Cerrar</button></div>
    <div class="meta">${etiquetas(t, esc)}</div>
    ${t.esperando ? `<div class="tb-espera"><b>Esperando:</b> ${esc(t.esperando)}</div>` : ''}
    ${linea('Qué', t.descripcion, esc)}${linea('Hecho cuando', t.criterio, esc)}${t.refinado ? `<div class="meta tb-informe"><b>Informe de refinado:</b> ${esc(t.refinado)}</div>` : ''}${enlazadas('Requiere', t.requiere, esc)}${enlazadas('Lo necesitan', t.requerida_por, esc)}${linea('Enlaces', t.enlaces, esc)}${t.hilo ? `<div class="meta"><b>Hilo:</b> ${enlace(t.hilo, esc)}</div>` : ''}
    <div class="meta">${fechas(t, esc, fecha)}</div>
    <div class="accion"><select data-mover="${t.id}" aria-label="Mover a">${TABLERO.vista.opciones(TABLERO.vista.COLUMNAS, t.estado, esc)}</select><button type="button" data-editar="${t.id}">Editar</button></div>
    ${grafoHtml(t, esc, fecha)}${historial(t, esc, fecha)}`;
  return { detalle, nodoInfo: nodoHtml };
})();
