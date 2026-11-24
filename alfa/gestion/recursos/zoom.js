// Fans Of · RECURSOS · zoom y mover dentro de una caja (paneles de la pestaña Recursos de /gestion, su pantalla completa y el visor de lonchas):
// el adaptador del DOM de ENCUADRE (encuadre.js, aquí al lado). Rueda o pellizco amplían alrededor del puntero sin mover la página; arrastrar
// corre la imagen ampliada; doble clic o doble toque la vuelven a encajar y, si ya está encajada, llaman a alDoble (abrir la pantalla completa).
// Encajada, un dedo deja hacer scroll de la página (touch-action: pan-y); ampliada, el dedo mueve la imagen. Guía: docs/guia/herramientas/galeria.md
'use strict';
const ZOOM = (() => {
  const E = ENCUADRE;
  const medidaDe = el => ({ ancho: el.offsetWidth || 1, alto: el.offsetHeight || 1 });   // sin el transform
  /**
   * caja: el elemento que recibe los gestos. op: { elemento() → lo que se amplía (o null), base: transform que ya lleva, mueve(ev) → si un dedo
   * solo corre la imagen, alDoble(), alCambiar(encuadre), tactil: touch-action encajada }
   */
  function crea(caja, op) {
    const o = { base: '', mueve: ev => ev.button === 0 || ev.button === 1, alDoble: null, alCambiar: null, tactil: 'pan-y', ...op };
    const dedos = new Map();
    let enc = E.inicial(), gesto = null, ultimo = null, movio = false;
    const punto = ev => { const r = caja.getBoundingClientRect(); return { x: ev.clientX - r.left - r.width / 2, y: ev.clientY - r.top - r.height / 2 }; };
    const medidas = el => [{ ancho: caja.clientWidth || 1, alto: caja.clientHeight || 1 }, medidaDe(el)];
    // sin nada que ampliar (aún cargando, un vídeo, un error), el encuadre vuelve a encajado
    function pon(nuevo) {
      const el = o.elemento();
      enc = el ? E.acota(nuevo, ...medidas(el)) : E.inicial();
      if (el) { el.style.transform = E.encajada(enc) ? o.base : E.css(enc, o.base); el.style.transformOrigin = 'center'; }
      caja.classList.toggle('rec-ampliada', !E.encajada(enc));
      caja.style.touchAction = E.encajada(enc) ? o.tactil : 'none';
      if (o.alCambiar) o.alCambiar(enc);
    }
    const encaja = () => pon(E.inicial());
    function rueda(ev) {
      const el = o.elemento(), factor = E.factorRueda(ev.deltaY, ev.deltaMode);
      if (!el || !E.ruedaAmplia(enc, factor)) return;   // encajada y alejando: la rueda mueve la página
      ev.preventDefault();   // la rueda que amplía (o mueve la ampliada) no mueve la página
      pon(E.zoomEn(enc, factor, punto(ev), ...medidas(el)));
    }
    // el puntero se captura (salvo que ya lo tenga lo de dentro, como el lienzo de las lonchas que gira): su final llega aunque se suelte fuera
    function captura(ev) {
      const dentro = ev.target !== caja && ev.target.hasPointerCapture && ev.target.hasPointerCapture(ev.pointerId);
      if (dentro || caja.hasPointerCapture(ev.pointerId)) return;
      try { caja.setPointerCapture(ev.pointerId); } catch (err) { if (err.name !== 'NotFoundError') throw err; }   // NotFoundError: el puntero ya se soltó
    }
    function baja(ev) {
      if (!dedos.size) movio = false;   // empieza un gesto, haya imagen o no (la modal mira movio para cerrar al tocar fuera)
      if (!o.elemento() || (ev.pointerType === 'mouse' && ev.button > 1)) return;
      if (ev.button === 1) ev.preventDefault();   // la rueda pulsada corre la imagen, no lanza el desplazamiento automático
      dedos.set(ev.pointerId, punto(ev));
      if (dedos.size === 1) gesto = { desde: punto(ev), propio: o.mueve(ev) };
      captura(ev);
    }
    function mueve(ev) {
      if (!dedos.has(ev.pointerId)) return;
      const antes = [...dedos.values()], ahora = punto(ev), el = o.elemento();
      dedos.set(ev.pointerId, ahora);
      if (gesto && !E.esToque(gesto.desde, ahora)) movio = true;
      if (!el) return;
      if (dedos.size >= 2) pon(E.pellizca(enc, antes.slice(0, 2), [...dedos.values()].slice(0, 2), ...medidas(el)));
      else if (gesto && gesto.propio && !E.encajada(enc)) pon(E.mueve(enc, ahora.x - antes[0].x, ahora.y - antes[0].y, ...medidas(el)));
    }
    function sube(ev) {
      if (!dedos.has(ev.pointerId)) return;
      const solo = dedos.size === 1; dedos.delete(ev.pointerId);
      if (!solo) { movio = true; return; }   // al soltar un dedo de un pellizco no hay toque
      const toque = { t: ev.timeStamp, ...punto(ev) };
      if (movio || ev.type === 'pointercancel') { ultimo = null; return; }
      if (!E.esDoble(ultimo, toque)) { ultimo = toque; return; }
      ultimo = null;
      if (!E.encajada(enc)) encaja(); else if (o.alDoble) o.alDoble();
    }
    caja.addEventListener('wheel', rueda, { passive: false });
    caja.addEventListener('pointerdown', baja);
    caja.addEventListener('pointermove', mueve);
    for (const fin of ['pointerup', 'pointercancel']) { caja.addEventListener(fin, sube); addEventListener(fin, sube); }   // también si se suelta fuera
    // un dedo que se pierde (sin captura, o al salir sin botones pulsados) deja de contar: pasar por encima no mueve la imagen
    const olvida = ev => { if (dedos.delete(ev.pointerId) && !dedos.size) gesto = null; };
    caja.addEventListener('lostpointercapture', olvida);
    caja.addEventListener('pointerleave', ev => { if (!ev.buttons) olvida(ev); });
    caja.addEventListener('dragstart', ev => ev.preventDefault());   // arrastrar una imagen la corre, no la saca de la página
    caja.style.touchAction = o.tactil;
    return { encaja, encuadre: () => enc, dedos: () => dedos.size, movio: () => movio, recoloca: () => pon(enc) };
  }
  return { crea };
})();
