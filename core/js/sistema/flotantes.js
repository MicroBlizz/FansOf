// Fans Of · FLOTANTES: en la página, los botones fijos de core (el botón DEV, la pestaña de comentarios y PROTOTIPO) se arrastran con el dedo o
// el ratón y, al soltarlos, se pegan al borde más cercano, a la altura (o anchura) donde se soltaron; las etiquetas que no reciben toques (la
// versión de la alfa y los fps) se mandan a otro borde desde el panel DEV (FLOTANTES.mueve). Tarea #362, ADR 217. Las reglas son puras y están
// en flotantes-reglas.js (FLOTANTES_REGLAS, también como FLOTANTES.reglas); aquí, el DOM, lo guardado y los toques.
// DE MOMENTO SOLO EN LA ALFA Y EN LOCAL (NUCLEO.alfa o NUCLEO.desarrollo): fuera, movible() devuelve null y cada botón sigue como siempre, con
// su hoja y sin arrastre. Se abrirá para todos cuando Pepins lo dé por bueno (ADR 217).
// Un toque sigue siendo un toque: solo se arrastra pasado UMBRAL px. Los gestos sobre un flotante no son del juego: sus pointerdown, move, up y
// cancel no suben a la página (los clics, sí, como siempre). La posición se recuerda por id en el navegador (todos los juegos comparten
// origen). Un juego cambia el sitio de serie de uno con FLOTANTES.deSerie(id, sitio).
'use strict';
const FLOTANTES = (() => {
  const R = FLOTANTES_REGLAS;
  const activo = () => typeof NUCLEO !== 'undefined' && !!(NUCLEO.alfa || NUCLEO.desarrollo);
  const CLAVE = 'fansof-flotantes', UMBRAL = 6;
  const todos = new Map();   // id → { el, id, serie, hueco, fuera, junto, alColocar, arrastrando }
  const deSerieJuego = {};   // los sitios de serie que cambia el juego (deSerie)

  function lee() {
    try { const g = JSON.parse(localStorage.getItem(CLAVE)); return g && typeof g === 'object' && !Array.isArray(g) ? g : {}; } catch (e) { return {}; /* sin almacenamiento o el dato roto: cada uno a su sitio de serie */ }
  }
  const guardados = lee();
  // { guardado: false } sin almacenamiento: el sitio vale hasta recargar
  function guarda() {
    try { localStorage.setItem(CLAVE, JSON.stringify(guardados)); return { guardado: true }; } catch (e) { return { guardado: false, motivo: e.name }; }
  }
  const estilo = document.createElement('style');
  estilo.textContent = '[data-flotante] { touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-user-drag: none; } [data-flotante][data-arrastrando] { opacity: 1 !important; cursor: grabbing; }';

  let seguro = null;   // las zonas seguras (env(safe-area-inset-*)), medidas una vez y otra en cada cambio de tamaño
  function zonasSeguras() {
    if (seguro) return seguro;
    const p = document.createElement('div');
    p.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.append(p); const c = getComputedStyle(p);
    seguro = { arriba: parseFloat(c.paddingTop) || 0, der: parseFloat(c.paddingRight) || 0, abajo: parseFloat(c.paddingBottom) || 0, izq: parseFloat(c.paddingLeft) || 0 };
    p.remove(); return seguro;
  }
  const pantalla = () => ({ ancho: document.documentElement.clientWidth || innerWidth, alto: document.documentElement.clientHeight || innerHeight, seguro: zonasSeguras() });
  const tamDe = el => ({ ancho: el.offsetWidth, alto: el.offsetHeight });
  const rectVisto = el => { const b = el.getBoundingClientRect(); return b.width && b.height ? { x: b.left, y: b.top, ancho: b.width, alto: b.height } : null; };
  const pon = (el, x, y) => Object.assign(el.style, { left: Math.round(x) + 'px', top: Math.round(y) + 'px', right: 'auto', bottom: 'auto', transform: 'none' });
  const donde = () => (typeof location !== 'undefined' ? location.pathname : '');   // la página: lo movido en un juego no pisa el sitio de serie propio de otro (R.elige)
  const sitioDe = id => R.elige(guardados[id], deSerieJuego[id], todos.has(id) ? todos.get(id).serie : null, donde());
  // lo que se guarda de un sitio: con la página si este juego tiene su propio sitio de serie para ese botón
  const conDonde = (id, sitio) => (deSerieJuego[id] ? { ...sitio, donde: donde() } : sitio);

  // lo que ocupan los demás que se ven (con lo que va con ellos, como la versión bajo la pestaña), para no montarse encima
  const otrosRects = r => [...todos.values()].filter(o => o !== r && !o.arrastrando && o.el.isConnected)
    .flatMap(o => [o.el, o.junto].filter(Boolean).map(rectVisto)).filter(Boolean);
  // dónde va en ese sitio: pegado al borde y apartado de los demás
  function rectEn(r, sitio) {
    r.el.dataset.borde = sitio.borde;   // la hoja de cada uno gira o ajusta las esquinas según el borde (antes de medirlo)
    const p = pantalla(), tam = tamDe(r.el);
    if (!tam.ancho && !tam.alto) return null;   // oculto: se coloca al volver a verse (lo avisa el ResizeObserver)
    const rect = R.rectDe(sitio, tam, p, { hueco: r.hueco, fuera: r.fuera ? r.fuera(sitio.borde) : 0 });
    return R.aparta(rect, otrosRects(r), sitio.borde, R.limites(tam, p, r.hueco));
  }
  // lo pone en su sitio (el guardado o el de serie): al crearlo, al cambiar la pantalla o su tamaño, con deSerie y al moverlo
  function coloca(r) {
    if (r.arrastrando || !r.el.isConnected) return;
    const sitio = sitioDe(r.id), rect = rectEn(r, sitio);
    if (!rect) return;
    pon(r.el, rect.x, rect.y);
    if (r.alColocar) r.alColocar(sitio.borde, rect);
  }
  // al soltar: el borde más cercano al centro del elemento tal como iba, sin montarse, y se guarda
  function suelta(r) {
    const b = r.el.getBoundingClientRect(), p = pantalla();
    const sitio = R.sitioAlSoltar(b.left + b.width / 2, b.top + b.height / 2, p);
    const rect = rectEn(r, sitio);
    if (rect) { guardados[r.id] = conDonde(r.id, R.sitioDeRect(rect, sitio.borde, p)); guarda(); }
    coloca(r);
  }
  // mientras se arrastra, sigue al dedo (por donde se cogió) sin salirse de la pantalla
  function sigue(r, x, y) {
    const p = pantalla(), t = tamDe(r.el);
    pon(r.el, Math.max(0, Math.min(p.ancho - t.ancho, x)), Math.max(0, Math.min(p.alto - t.alto, y)));
  }

  // el arrastre: un toque es un toque (su clic va como siempre); pasado UMBRAL px se arrastra y el clic que venga detrás no cuenta
  function escucha(r) {
    const el = r.el; let ini = null, tragar = false;
    el.draggable = false; el.addEventListener('dragstart', e => e.preventDefault());   // un enlace (PROTOTIPO) no se arrastra como enlace
    const deEste = e => ini && e.pointerId === ini.id;
    const acaba = soltado => {
      ini = null; if (!r.arrastrando) return;
      r.arrastrando = false; delete el.dataset.arrastrando; tragar = soltado;   // solo un arrastre soltado trae detrás un clic que no cuenta
      if (soltado) suelta(r); else coloca(r);   // cancelado o perdido (se escondió): vuelve a su sitio
    };
    el.addEventListener('pointerdown', e => {
      e.stopPropagation(); if (e.button > 0) return;
      const b = el.getBoundingClientRect();
      ini = { x: e.clientX, y: e.clientY, dx: e.clientX - b.left, dy: e.clientY - b.top, id: e.pointerId }; tragar = false;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', e => {
      e.stopPropagation(); if (!deEste(e)) return;
      if (!r.arrastrando && Math.hypot(e.clientX - ini.x, e.clientY - ini.y) < UMBRAL) return;
      if (!r.arrastrando) { r.arrastrando = true; el.dataset.arrastrando = ''; }
      sigue(r, e.clientX - ini.dx, e.clientY - ini.dy); e.preventDefault();
    });
    el.addEventListener('pointerup', e => { e.stopPropagation(); if (deEste(e)) acaba(true); });
    el.addEventListener('pointercancel', e => { e.stopPropagation(); if (deEste(e)) acaba(false); });
    el.addEventListener('lostpointercapture', e => { if (deEste(e)) acaba(false); });
    el.addEventListener('click', e => { if (!tragar) return; tragar = false; e.preventDefault(); e.stopImmediatePropagation(); }, true);
  }

  // movible(el, { id, borde, a, d, hueco, fuera, junto, arrastre, alColocar }), con el ya en la página. borde, a y d: su sitio de serie ·
  // hueco: px al borde (6; 0 para una pestaña pegada) · fuera(borde): px de más hacia dentro · junto: otro elemento que va con él (cuenta para
  // no montarse) · arrastre: false para lo que no recibe toques (se mueve con mueve) · alColocar(borde, rect): para mover lo que va con él.
  // Devuelve { coloca } para recolocarlo cuando cambia lo que mira `fuera`, o null fuera de la alfa y de local (el elemento sigue como siempre).
  function movible(el, { id, borde, a, d = 0, hueco = 6, fuera = null, junto = null, arrastre = true, alColocar = null }) {
    if (!activo()) return null;
    if (!estilo.isConnected) document.head.append(estilo);
    const r = { el, id, serie: Object.freeze({ borde, a, d }), hueco, fuera, junto, alColocar, arrastrando: false };
    todos.set(id, r); el.dataset.flotante = id;
    if (arrastre) escucha(r);
    coloca(r);
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => coloca(r)).observe(el);   // cambia su texto, llega la letra o vuelve a verse
    return { coloca: () => coloca(r) };
  }
  // manda uno a otro borde (el panel DEV, para la versión y los fps); se guarda aunque aún no esté en la página
  function mueve(id, borde) {
    guardados[id] = conDonde(id, R.sitioAlMover(sitioDe(id), borde));
    const g = guarda();
    if (todos.has(id)) coloca(todos.get(id));
    return g;
  }
  // un juego cambia el sitio de serie de uno (lo que se haya movido sigue mandando)
  function deSerie(id, sitio) {
    deSerieJuego[id] = sitio;
    if (todos.has(id)) coloca(todos.get(id));
  }
  // todos a su sitio de serie (utilidad del panel DEV)
  function reinicia() {
    for (const k of Object.keys(guardados)) delete guardados[k];
    const g = guarda(); todos.forEach(coloca);
    return g;
  }
  window.addEventListener('resize', () => { seguro = null; todos.forEach(coloca); });
  return Object.freeze({ reglas: R, activo, movible, mueve, deSerie, reinicia });
})();
