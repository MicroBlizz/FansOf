// Fans Of · el IDIOMA de la web fuera de los juegos, decidido en UN solo sitio (ADR 135): lo preguntan el menú (menu.js), el pie (pie.js)
// y las páginas de texto (idioma-pagina.js). Decide con la MISMA regla que core (core/js/sistema/idioma-regla.js, ADR 144): ?idioma= de la
// dirección (o ?lang=, el de antes), luego el elegido en el menú (guardado en 'fansof-idioma'), luego el del navegador. La web tiene español
// e inglés: cualquier otro idioma es inglés, como en los juegos. Se carga antes que esas piezas y detrás de la regla, que la trae nucleo.js si
// la página lo carga antes o, si no, su propio <script src="…/core/js/sistema/idioma-regla.js"> (una sola vez: tests/web/idioma-web.test.mjs).
// (En la portada y en Lore los textos de la página los traduce core con la misma regla; esta pieza decide lo que core no pinta.)
'use strict';
const IDIOMA_WEB = (() => {
  const R = IDIOMA_REGLA, OFRECIDOS = Object.freeze(['es', 'en']);
  const guardado = () => { try { return localStorage.getItem(R.CLAVE); } catch (e) { return null; /* sin almacén: decide el navegador */ } };
  // 'es' o 'en' para un idioma suelto (el del menú); vacío = el del navegador
  const cual = x => R.elige({ pedido: x, navegador: navigator, ofrecidos: OFRECIDOS });
  const elegido = () => R.elige({ pedido: R.pedido(location.search), guardado: guardado(), navegador: navigator, ofrecidos: OFRECIDOS });
  // Guarda la elección del menú ('' = automático: la del navegador) y devuelve el idioma que toca ahora
  function elegir(v) {
    try { if (v) localStorage.setItem(R.CLAVE, v); else localStorage.removeItem(R.CLAVE); } catch (e) { /* sin almacén: vale para esta visita */ }
    return cual(v);
  }
  return { cual, elegido, elegir };
})();
