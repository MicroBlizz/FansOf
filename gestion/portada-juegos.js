// Fans Of · /gestion → Juegos → «Portada» (tarea #327, ADR 203): lo puro de los controles de cada juego. Con el catálogo del repo (biblioteca/juegos.json)
// y las filas de juego_portada calcula cómo sale el juego en la alfa y en la web (JUEGOS_PORTADA.aplica), la fila nueva de la alfa tras un toque (lo que
// coincide con el repo se manda como null), qué cambiaría «Pasar a la web», las marcas de la lista de juegos y el HTML del panel. Sin DOM ni red.
'use strict';
const GESTION_PORTADA = (() => {
  const SECCIONES = [['favoritos', 'Favoritos'], ['prototipos', 'Prototipos'], ['archivo', 'Archivo (en pausa)']];
  const NOMBRE_SECCION = Object.fromEntries(SECCIONES);
  const MOTIVO = {
    sin_publicar: 'Sin publicar: en el repo solo está en la alfa.',
    fuera_de_portada: 'Fuera de la portada: enciende «En la portada» primero.',
    archivo: 'En el Archivo: sácalo del Archivo para anunciarlo.',
  };
  const MOTIVO_CORTO = { sin_publicar: 'sin publicar', fuera_de_portada: 'fuera de la portada', archivo: 'en el Archivo' };
  const ESTADO_REPO = { vivo: 'publicado', alfa: 'solo en la alfa (sin publicar)', archivo: 'archivado' };
  const CAMPOS = ['seccion', 'en_portada', 'en_anuncio'];

  // juegos.json → [{ id, estado, favorito }] (lo que necesita la regla); lo que no sea un juego con id se salta
  const repoDe = json => Object.freeze(((json && json.juegos) || []).filter(j => j && typeof j.id === 'string')
    .map(j => Object.freeze({ id: j.id, estado: j.estado, favorito: j.favorito === true })));
  const filaDe = (filas, id, plataforma) => (filas || []).filter(f => f && f.juego === id && f.plataforma === plataforma).pop() || null;
  const sinFila = fila => !fila || CAMPOS.every(c => fila[c] == null);

  // Cómo está un juego: lo del repo, cómo sale en la alfa y en la web, sus filas y si hay algo cambiado o por pasar. null si no está en el catálogo
  function estado(catalogo, filas, id) {
    const juego = (catalogo || []).find(j => j.id === id);
    if (!juego) return null;
    const filaAlfa = filaDe(filas, id, 'alfa'), filaWeb = filaDe(filas, id, 'web');
    const como = (fila, plataforma) => JUEGOS_PORTADA.aplica([juego], fila ? [fila] : [], plataforma)[0];
    return Object.freeze({
      juego, filaAlfa, filaWeb, repo: como(null, 'alfa'), alfa: como(filaAlfa, 'alfa'), web: como(filaWeb, 'web'),
      cambiadaAlfa: !sinFila(filaAlfa), pendiente: JUEGOS_PORTADA.difiere(filaAlfa, filaWeb),
    });
  }

  // La fila entera que se manda a la alfa tras cambiar un campo: lo que vale lo mismo que el repo va como null (así «Deshacer» y el repo coinciden)
  function filaConCambio(e, campo, valor) {
    const base = { seccion: e.repo.seccion, en_portada: true, en_anuncio: true };
    const fila = {};
    for (const c of CAMPOS) {
      const v = c === campo ? valor : (e.filaAlfa ? e.filaAlfa[c] : null);
      fila[c] = v == null || v === base[c] ? null : v;
    }
    return Object.freeze(fila);
  }

  const siNo = v => (v ? 'Sí' : 'No');
  const textoAnuncio = a => (a.enAnuncio ? 'Sí' : a.motivo ? `No (${MOTIVO_CORTO[a.motivo]})` : 'No');
  const LINEAS = [['Sección', a => NOMBRE_SECCION[a.seccion]], ['En la portada', a => siNo(a.enPortada)], ['En el anuncio', textoAnuncio]];
  // Qué cambiaría en la web al pasar la alfa: [{ que, antes, despues }]; vacío si se vería igual
  function cambiosAWeb(e) {
    const fila = e.filaAlfa ? { ...e.filaAlfa, plataforma: 'web' } : null;
    const despues = JUEGOS_PORTADA.aplica([e.juego], fila ? [fila] : [], 'web')[0];
    return LINEAS.map(([que, f]) => ({ que, antes: f(e.web), despues: f(despues) })).filter(c => c.antes !== c.despues);
  }

  // Las marcas de la lista de juegos: { id: [{ texto, clase }] } solo de los que tienen algo
  function marcas(catalogo, filas) {
    const r = {};
    for (const j of catalogo || []) {
      const e = estado(catalogo, filas, j.id), m = [];
      if (e.cambiadaAlfa) m.push({ texto: 'alfa cambiada', clase: 'alfa' });
      if (e.pendiente) m.push({ texto: 'pasar a la web', clase: 'web' });
      if (m.length) r[j.id] = m;
    }
    return r;
  }

  // La sección de cada juego en la alfa (la que se edita aquí): { id: 'favoritos' | 'prototipos' | 'archivo' }, para agrupar y filtrar la lista
  const secciones = (catalogo, filas) => Object.fromEntries(JUEGOS_PORTADA.aplica(catalogo || [], filas, 'alfa').map(a => [a.id, a.seccion]));

  const interruptor = (campo, texto, encendido, bloqueado) => `<button type="button" class="pj-int" role="switch" data-interruptor="${campo}" aria-checked="${encendido}"${bloqueado ? ' disabled' : ''}>`
    + `<span>${texto}</span><i aria-hidden="true"></i></button>`;
  const botonSeccion = actual => ([id, t]) => `<button type="button" class="pj-sec${id === actual ? ' activa' : ''}" data-seccion="${id}" aria-pressed="${id === actual}">${t}</button>`;
  const celda = (texto, distinta) => `<td${distinta ? ' class="pj-distinta"' : ''}>${texto}</td>`;
  const tabla = e => `<table class="pj-tabla"><thead><tr><th></th><th>Alfa</th><th>Web</th></tr></thead><tbody>${LINEAS.map(([que, f]) => {
    const a = f(e.alfa), w = f(e.web);
    return `<tr><th>${que}</th>${celda(a, a !== w)}${celda(w, a !== w)}</tr>`;
  }).join('')}</tbody></table>`;
  function confirmacion(e, nombre, esc) {
    const cambios = cambiosAWeb(e);
    const lista = cambios.length ? `<ul>${cambios.map(c => `<li><b>${c.que}</b>: ${c.antes} → ${c.despues}</li>`).join('')}</ul>`
      : '<p>Lo que se ve en la web no cambia: solo se iguala su fila con la de la alfa.</p>';
    return `<div class="pj-confirma" role="alertdialog" aria-label="Pasar a la web"><b>Esto cambia la web de producción para ${esc(nombre)}.</b>${lista}`
      + '<div class="pj-botones"><button type="button" class="fuerte" data-confirmar>Sí, pasar a la web</button><button type="button" data-cancelar>Cancelar</button></div></div>';
  }
  const chips = e => [e.cambiadaAlfa ? '<em class="pj-chip alfa">Alfa cambiada</em>' : '', e.pendiente ? '<em class="pj-chip web">Pendiente de pasar a la web</em>' : ''].join('');

  // El panel de un juego. opciones: { confirmando } (enseña el paso de confirmar «Pasar a la web»)
  function html(e, nombre, opciones, esc) {
    if (!e) return '<div class="caja">Este juego no está en el catálogo del repo (biblioteca/juegos.json): su portada no se puede cambiar desde aquí.</div>';
    const { confirmando = false } = opciones || {};
    const repo = `En el repo: ${NOMBRE_SECCION[e.repo.seccion]} · ${ESTADO_REPO[e.juego.estado] || esc(e.juego.estado)}.`;
    const motivo = e.alfa.puedeAnuncio ? '' : `<div class="meta pj-motivo">${MOTIVO[e.alfa.motivo]}</div>`;
    return `<div class="caja pj"><b class="pj-nombre">Portada y anuncio</b><div class="meta">${repo} Lo que cambies aquí sale solo en la alfa; después, «Pasar a la web».</div>`
      + `<div class="pj-chips">${chips(e)}</div>`
      + `<div class="pj-titulo">En la alfa</div><div class="pj-secciones" role="group" aria-label="Sección">${SECCIONES.map(botonSeccion(e.alfa.seccion)).join('')}</div>`
      + interruptor('en_portada', 'En la portada', e.alfa.enPortada, false) + interruptor('en_anuncio', 'En el anuncio', e.alfa.enAnuncio, !e.alfa.puedeAnuncio) + motivo
      + `<div class="pj-titulo">Alfa y web</div>${tabla(e)}`
      + `<div class="pj-botones"><button type="button" class="fuerte" data-pasar${e.pendiente && !confirmando ? '' : ' disabled'}>Pasar a la web</button>`
      + `<button type="button" data-deshacer${e.cambiadaAlfa ? '' : ' disabled'}>Deshacer</button></div>`
      + (confirmando && e.pendiente ? confirmacion(e, nombre, esc) : '') + '<div class="aviso" data-aviso-portada role="alert"></div></div>';
  }

  const ESTILO = '.pj{display:grid;gap:10px}.pj-nombre{font-size:18px}.pj-chips{display:flex;flex-wrap:wrap;gap:6px}.pj-chips:empty{display:none}'
    + '.pj-chip{font-style:normal;font-size:12px;font-weight:700;padding:3px 9px;border-radius:99px}.pj-chip.alfa{background:var(--debil-fondo);color:var(--debil)}.pj-chip.web{background:var(--clara-fondo);color:var(--clara)}'
    + '.pj-titulo{font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--suave);margin-top:4px}'
    + '.pj-secciones{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.pj-sec{min-height:48px;border:2px solid var(--acento);border-radius:12px;font-weight:700;padding:4px}.pj-sec.activa{background:var(--acento);color:var(--acento-texto)}'
    + '.pj-int{display:flex;align-items:center;justify-content:space-between;min-height:52px;border-radius:12px;font-size:16px;font-weight:600;padding:0 14px}'
    + '.pj-int i{width:46px;height:28px;border-radius:14px;background:var(--linea);position:relative;flex:none}.pj-int i::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:11px;background:var(--panel);border:2px solid var(--suave);box-sizing:border-box}'
    + '.pj-int[aria-checked="true"] i{background:var(--ok)}.pj-int[aria-checked="true"] i::after{left:21px;border-color:var(--ok)}.pj-motivo{margin-top:-6px;padding:0 4px}'
    + '.pj-tabla{width:100%;border-collapse:collapse;font-size:14px}.pj-tabla th,.pj-tabla td{text-align:left;padding:8px 6px;border-bottom:1px solid var(--linea)}.pj-tabla thead th{font-size:12px;color:var(--suave)}'
    + '.pj-distinta{background:var(--debil-fondo);color:var(--debil);font-weight:700}'
    + '.pj-botones{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pj-botones button{min-height:48px;border-radius:12px;font-size:16px}'
    + '.pj-confirma{display:grid;gap:8px;border:2px solid var(--clara);border-radius:12px;padding:12px;background:var(--clara-fondo)}.pj-confirma ul{margin:0;padding-left:18px}.pj-confirma p{margin:0}';

  return Object.freeze({ repoDe, estado, filaConCambio, cambiosAWeb, marcas, secciones, html, ESTILO });
})();
