// Fans Of · NÚCLEO · la elección del idioma: qué idioma se usa, cambiarlo y tapar la página hasta que esté traducida. Una pieza de nucleo.js (tarea #28).
// No traduce: eso es core/js/sistema/idioma.js (IDIOMA, tr). Solo calcula con lo que le pasa nucleo.js (almacenamiento, navegador, documento), así que se prueba en Node.
// EL IDIOMA: el que el jugador elija en Opciones (se guarda en este navegador) o, si no ha elegido, el del navegador: español → 'es', uno de
// IDIOMAS → ese, y cualquier otro → 'en'. Cambiarlo recarga la página. Un juego que no tenga diccionario de ese idioma (no lo pasa en
// juego({ idioma })) se juega en inglés; idiomas() dice cuáles ofrece.
'use strict';
(() => {
  const IDIOMAS = Object.freeze(['es', 'en', 'pt', 'fr', 'de', 'it']);
  const VELO_MAX_MS = 8000;   // sin splash, el velo de idioma no tapa más de 8 s

  const elegido = almacen => { try { return almacen.getItem('fansof-idioma') || ''; } catch (e) { return ''; } };
  function delNavegador(navegador) {
    const lista = navegador.languages && navegador.languages.length ? navegador.languages : [navegador.language || 'es'];
    for (const l of lista) { const c = String(l).slice(0, 2).toLowerCase(); if (IDIOMAS.includes(c)) return c; }
    return 'en';
  }

  // almacen: como localStorage · navegador: { languages, language } · documento: el document · recarga: recargar la página
  function idiomaEleccion({ almacen, navegador, documento, recarga }) {
    let idioma = IDIOMAS.includes(elegido(almacen)) ? elegido(almacen) : delNavegador(navegador);
    let idiomas = ['es', 'en'];
    documento.documentElement.lang = idioma;

    // dic: los diccionarios del juego por idioma ({ en: [...], pt: [...] }); sin el del idioma elegido, inglés
    function ajusta(dic) {
      if (idioma !== 'es' && idioma !== 'en' && !dic[idioma]) { idioma = 'en'; documento.documentElement.lang = idioma; }
      idiomas = ['es', 'en'].concat(Object.keys(dic).filter(i => i !== 'es' && i !== 'en' && IDIOMAS.includes(i)));
    }
    function elegir(i) {
      try { if (i) almacen.setItem('fansof-idioma', i); else almacen.removeItem('fansof-idioma'); } catch (e) { /* sin guardar */ }
      recarga();
    }
    // En otro idioma, la página espera tapada a que se traduzca lo que ya hay (después se traduce también lo que el juego escriba). Si la splash
    // está puesta, ella ya tapa: no hace falta el velo, solo traducir al cargar (antes de que la splash se vaya: se va en el siguiente cuadro).
    // tapada: ¿la splash ya tapa? · alCargar: cuando ha cargado todo · traduce: traducir la pantalla · espera: como setTimeout
    function velo({ tapada, alCargar, traduce, espera }) {
      const v = documento.createElement('style'); v.textContent = 'body { visibility: hidden !important; }';
      if (!tapada) documento.head.appendChild(v);
      const listo = () => { traduce(); v.remove(); };
      alCargar(listo);
      if (!tapada) espera(() => { if (v.isConnected) listo(); }, VELO_MAX_MS);
    }

    return { ajusta, elegir, velo, get idioma() { return idioma; }, get idiomas() { return idiomas.slice(); } };
  }
  idiomaEleccion.IDIOMAS = IDIOMAS;

  if (typeof NUCLEO_PIEZAS !== 'undefined') NUCLEO_PIEZAS.idiomaEleccion = idiomaEleccion;
  if (typeof module !== 'undefined') module.exports = idiomaEleccion;
})();
