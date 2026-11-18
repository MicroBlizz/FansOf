// Fans Of · NÚCLEO · la elección del idioma: qué idioma se usa, cambiarlo y tapar la página hasta que esté traducida. Una pieza de nucleo.js (tarea #28).
// No traduce: eso es core/js/sistema/idioma.js (IDIOMA, tr). Solo calcula con lo que le pasa nucleo.js (la regla, almacenamiento, navegador,
// documento), así que se prueba en Node. QUÉ idioma toca lo dice la regla común, core/js/sistema/idioma-regla.js (ADR 143): el que el jugador
// elija en Opciones (se guarda en este navegador) o, si no ha elegido, el primero de la serie del navegador, y cualquier otro → 'en'.
// Cambiarlo recarga la página. Un juego que no tenga diccionario de ese idioma (no lo pasa en juego({ idioma })) se juega en inglés;
// idiomas() dice cuáles ofrece. Los juegos no leen la dirección; las páginas que no son un juego (idiomaSolo) sí: ?idioma= o ?lang= (ADR 144).
'use strict';
(() => {
  const VELO_MAX_MS = 8000;   // sin splash, el velo de idioma no tapa más de 8 s

  const leeGuardado = (almacen, clave) => { try { return almacen.getItem(clave) || ''; } catch (e) { return ''; /* sin almacén: decide el navegador */ } };

  // regla: IDIOMA_REGLA · almacen: como localStorage · navegador: { languages, language } · documento: el document · recarga: recargar la página
  function idiomaEleccion({ regla, almacen, navegador, documento, recarga }) {
    const guardado = leeGuardado(almacen, regla.CLAVE);
    const calcula = (ofrecidos, pedido) => regla.elige({ pedido, guardado, navegador, ofrecidos });
    let idioma = calcula(regla.IDIOMAS, '');
    let idiomas = ['es', 'en'];
    documento.documentElement.lang = idioma;

    // dic: los diccionarios del juego por idioma ({ en: [...], pt: [...] }); sin el del idioma elegido, inglés
    // pedido: lo pedido en la dirección; solo lo pasa idiomaSolo (la portada y Lore), los juegos no
    function ajusta(dic, pedido = '') {
      idiomas = ['es', 'en'].concat(Object.keys(dic).filter(i => i !== 'es' && i !== 'en' && regla.IDIOMAS.includes(i)));
      idioma = calcula(idiomas, pedido);
      documento.documentElement.lang = idioma;
    }
    function elegir(i) {
      try { if (i) almacen.setItem(regla.CLAVE, i); else almacen.removeItem(regla.CLAVE); } catch (e) { /* sin guardar */ }
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

  if (typeof NUCLEO_PIEZAS !== 'undefined') NUCLEO_PIEZAS.idiomaEleccion = idiomaEleccion;
  if (typeof module !== 'undefined') module.exports = idiomaEleccion;
})();
