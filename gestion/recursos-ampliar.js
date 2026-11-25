// Fans Of · /gestion, pestaña RECURSOS: ampliar lo abierto para verlo de cerca (tarea #334). En cada panel con imagen, zoom y mover (recursos/zoom.js)
// y los botones «Encajar» y «Ver grande»; doble clic o doble toque en un panel encajado (o «Ver grande») abre esa salida en pantalla completa,
// en una modal con la misma imagen o el mismo visor, también con zoom y mover. En ella, flechas o «Anterior»/«Siguiente» pasan por las salidas
// abiertas; Esc, «Cerrar» o tocar fuera la cierran y el foco vuelve a donde estaba. Los visores en iframe (lonchas, .glb) piden abrirla con
// el mensaje «ampliar» de mandos-panel.js y, dentro de ella, le reenvían Esc y las flechas («tecla»). La modal no cambia la dirección (ADR 211). Lo usa recursos.js; guía: docs/guia/herramientas/galeria.md
'use strict';
const RECURSOS_AMPLIAR = (() => {
  const TIPO = 'fansof-galeria-mandos';   // el de mandos-comunes.js y mandos-panel.js
  /** Puro: qué panel pide abrirse con un mensaje «ampliar» (su índice en ventanas), o -1 si no viene del mismo origen, de un panel y con el tipo */
  function quienPide(ev, origen, ventanas) {
    if (ev.origin !== origen || !ev.source || !ev.data || ev.data.tipo !== TIPO || ev.data.orden !== 'ampliar') return -1;
    return ventanas.indexOf(ev.source);
  }
  /** Puro: lo que manda el visor de la modal ({ orden, valor }), o null si no viene del mismo origen, de esa ventana y con el tipo */
  function deLaModal(ev, origen, ventana) {
    if (ev.origin !== origen || !ventana || ev.source !== ventana || !ev.data || ev.data.tipo !== TIPO) return null;
    return { orden: ev.data.orden, valor: ev.data.valor };
  }
  let contenedor = null, dlg = null, actual = 0, volver = null, zoom = null, abajo = null;
  const paneles = () => (contenedor ? [...contenedor.children] : []);
  const boton = (texto, titulo, accion) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = texto; b.title = titulo; b.onclick = accion; return b; };
  const medio = p => p.querySelector('.rec-dentro img, .rec-dentro video, .rec-dentro iframe');

  // ---- en cada panel: zoom sobre su imagen, «Encajar» (sale ampliada) y «Ver grande»
  function panel(el) {
    const dentro = el.querySelector('.rec-dentro'), barra = el.querySelector('.rec-barra'), cerrar = barra.lastChild;
    if (dentro.classList.contains('rec-audio')) return;   // un sonido no se amplía
    const encajar = boton('Encajar', 'Vuelve a encajar la imagen (o doble clic)', () => z.encaja()); encajar.hidden = true;
    const grande = boton('Ver grande', 'Pantalla completa (o doble clic)', () => abre(paneles().indexOf(el)));
    const z = ZOOM.crea(dentro, { elemento: () => dentro.querySelector('img'), alDoble: () => abre(paneles().indexOf(el)), alCambiar: enc => { encajar.hidden = ENCUADRE.encajada(enc); } });
    dentro.addEventListener('dblclick', ev => ev.preventDefault());
    barra.insertBefore(encajar, cerrar); barra.insertBefore(grande, cerrar);
  }

  // ---- la modal
  function copia(p) {   // la misma imagen, vídeo o visor del panel (los iframe sin los mandos comunes: la modal tapa los demás)
    const m = medio(p); if (!m) return null;
    const c = m.cloneNode(false); c.removeAttribute('data-mandos'); c.style.transform = '';
    if (c.tagName === 'VIDEO') c.controls = true;
    return c;
  }
  // una imagen pequeña se ve ampliada un número entero de veces, la mayor que cabe (el pixel art, nítido); una grande, encajada
  function aumenta(img, escena) {
    const cs = getComputedStyle(escena), px = v => parseFloat(v) || 0;   // la caja de contenido: sin el relleno, o el pixel art no queda entero
    const caja = { ancho: escena.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight), alto: escena.clientHeight - px(cs.paddingTop) - px(cs.paddingBottom) };
    const k = ENCUADRE.vecesEnteras(caja, { ancho: img.naturalWidth, alto: img.naturalHeight });
    img.style.width = k >= 2 ? img.naturalWidth * k + 'px' : '';
  }
  // un panel sin nada que enseñar (sonido, sin vista previa, error o aún cargando): su texto
  const aviso = p => Object.assign(document.createElement('p'), { className: 'meta', textContent: ((p.querySelector('.rec-dentro') || {}).textContent || '').trim() || 'Sin vista previa.' });
  function pinta() {
    const lista = paneles(), p = lista[actual], escena = dlg.querySelector('.rec-modal-escena');
    if (!p) return cierra();
    dlg.querySelector('#rec-modal-titulo').textContent = (p.querySelector('.rec-barra b') || {}).textContent || '';
    dlg.querySelector('.rec-modal-n').textContent = lista.length > 1 ? `${actual + 1} de ${lista.length}` : '';
    for (const b of dlg.querySelectorAll('.rec-modal-paso')) b.hidden = lista.length < 2;
    const c = copia(p);
    escena.replaceChildren(c || aviso(p));
    if (!dlg.contains(document.activeElement)) dlg.querySelector('.rec-modal-cerrar').focus();   // el foco estaba en el visor que se ha ido
    zoom.encaja();
    if (c && c.tagName === 'IMG') { const ajusta = () => { aumenta(c, escena); zoom.recoloca(); }; if (c.complete) ajusta(); else c.onload = ajusta; }
  }
  // pasa a la siguiente salida con algo que enseñar (se salta los sonidos, los errores y lo que aún carga)
  function pasa(paso) {
    const lista = paneles(), i = ENCUADRE.siguienteQueVale(lista.length, actual, paso, j => !!medio(lista[j]));
    if (i !== null && i !== actual) { actual = i; pinta(); }
  }
  function abre(i) {
    if (i < 0) return;
    crea();
    actual = i;
    if (!dlg.open) { volver = document.activeElement; dlg.showModal(); }
    pinta();
    dlg.querySelector('.rec-modal-cerrar').focus();
  }
  function cierra() {
    if (!dlg || !dlg.open) return;
    dlg.close(); dlg.querySelector('.rec-modal-escena').replaceChildren();
    if (volver && volver.isConnected) volver.focus();
    volver = null;
  }
  // el foco no sale de la modal: Tab en el último vuelve al primero (y al revés)
  function atrapa(ev) {
    const f = [...dlg.querySelectorAll('button:not([hidden]), iframe, video')];
    if (!f.length) return;
    const primero = f[0], ultimo = f[f.length - 1];
    if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus(); } else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus(); }
  }
  function tecla(ev) {
    if (ev.key === 'Tab') return atrapa(ev);
    if (ev.target.tagName === 'VIDEO') return;   // las flechas del vídeo son suyas
    if (ev.key === 'ArrowRight') { ev.preventDefault(); pasa(1); } else if (ev.key === 'ArrowLeft') { ev.preventDefault(); pasa(-1); }
  }
  function crea() {
    if (dlg) return;
    dlg = document.createElement('dialog');
    dlg.className = 'rec-modal'; dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-labelledby', 'rec-modal-titulo');
    const barra = document.createElement('div'), escena = document.createElement('div');
    barra.className = 'rec-modal-barra'; escena.className = 'rec-modal-escena';
    const n = document.createElement('span'), titulo = document.createElement('b'); n.className = 'meta rec-modal-n'; titulo.id = 'rec-modal-titulo';
    const anterior = boton('< Anterior', 'La salida abierta anterior (flecha izquierda)', () => pasa(-1)), siguiente = boton('Siguiente >', 'La siguiente salida abierta (flecha derecha)', () => pasa(1));
    anterior.className = siguiente.className = 'rec-modal-paso';
    const encajar = boton('Encajar', 'Vuelve a encajar la imagen (o doble clic)', () => zoom.encaja()); encajar.hidden = true;   // sale solo con una imagen ampliada
    const cerrar = boton('Cerrar', 'Cerrar (Esc)', cierra);
    cerrar.className = 'rec-modal-cerrar';
    barra.append(titulo, n, anterior, siguiente, encajar, cerrar);
    dlg.append(barra, escena); document.body.append(dlg);
    zoom = ZOOM.crea(escena, { elemento: () => escena.querySelector('img'), tactil: 'none', alCambiar: enc => { encajar.hidden = ENCUADRE.encajada(enc); } });
    dlg.addEventListener('cancel', ev => { ev.preventDefault(); cierra(); });   // Esc
    dlg.addEventListener('keydown', tecla);
    // tocar fuera de lo que se enseña (y sin arrastrar) cierra. Se mira dónde se bajó el dedo: con el puntero capturado, el clic es de la escena
    const fuera = t => t === escena || t === dlg;
    dlg.addEventListener('pointerdown', ev => { abajo = ev.target; }, true);
    dlg.addEventListener('click', ev => { if (fuera(abajo) && fuera(ev.target) && !zoom.movio()) cierra(); });
    escena.addEventListener('dblclick', ev => ev.preventDefault());
    addEventListener('resize', () => { const i = escena.querySelector('img'); if (dlg.open && i) { aumenta(i, escena); zoom.recoloca(); } });
  }

  // el visor de la modal (lonchas, .glb): al estar listo recibe cómo están los mandos comunes; Esc y las flechas que le llegan, las reenvía aquí
  const TECLAS = { Escape: () => cierra(), ArrowLeft: () => pasa(-1), ArrowRight: () => pasa(1) };
  function oyeModal(ev) {
    const f = dlg && dlg.open ? dlg.querySelector('.rec-modal-escena iframe') : null, m = deLaModal(ev, location.origin, f && f.contentWindow);
    if (!m) return false;
    if (m.orden === 'listo') MANDOS.saluda(ev.source);
    else if (m.orden === 'tecla' && Object.prototype.hasOwnProperty.call(TECLAS, m.valor)) TECLAS[m.valor]();
    return true;
  }
  /** contenedor: el que tiene los paneles (cada hijo es un panel). Escucha el «ampliar» de los visores en iframe y lo que manda el de la modal */
  function arranca(caja) {
    contenedor = caja;
    addEventListener('message', ev => {
      if (oyeModal(ev)) return;
      const ventanas = paneles().map(p => { const f = p.querySelector('.rec-dentro iframe'); return f ? f.contentWindow : null; });
      abre(quienPide(ev, location.origin, ventanas));
    });
  }
  return { arranca, panel, abre, cierra, quienPide, deLaModal };
})();
if (typeof module !== 'undefined') module.exports = RECURSOS_AMPLIAR;   // en node (tests/gestion/) solo se carga
