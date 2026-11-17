// Fans Of · el IDIOMA de la web fuera de los juegos, decidido en UN solo sitio (ADR 135): lo preguntan el menú (menu.js), el pie (pie.js)
// y las páginas de texto (idioma-pagina.js). Orden: ?lang= de la dirección, luego el elegido en el menú (guardado en 'fansof-idioma'), luego el del navegador.
// La web solo tiene español e inglés: cualquier otro idioma cae en español. Se carga antes que esas piezas: <script src="…/idioma-web.js"></script>
// (En la portada y en Lore los textos de la página los traduce core; esta pieza solo decide lo que core no pinta.)
'use strict';
const IDIOMA_WEB = (() => {
  const CLAVE = 'fansof-idioma';
  const guardado = () => { try { return localStorage.getItem(CLAVE); } catch (e) { return null; /* sin almacén: decide el navegador */ } };
  // 'en' si empieza por «en»; lo demás, 'es'
  const cual = x => (/^en/i.test(x || '') ? 'en' : 'es');
  const elegido = () => cual(new URLSearchParams(location.search).get('lang') || guardado() || navigator.language);
  // Guarda la elección del menú ('' = automático: la del navegador) y devuelve el idioma que toca ahora
  function elegir(v) {
    try { if (v) localStorage.setItem(CLAVE, v); else localStorage.removeItem(CLAVE); } catch (e) { /* sin almacén: vale para esta visita */ }
    return cual(v || navigator.language);
  }
  return { cual, elegido, elegir };
})();
