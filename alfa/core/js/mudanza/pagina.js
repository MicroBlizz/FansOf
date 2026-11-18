// Fans Of · MUDANZA de las demos (ADR 142): la página de reenvío que queda en cada web/demos/<x>/index.html hasta el 18-2-2027.
// En el navegador manda en el acto a games/<x>/ conservando ?idioma y #. Abierta como app instalada (la vieja), saltar fuera la dejaría con la
// barra del navegador: entonces explica la mudanza y deja JUGAR aquí mismo (el juego dentro, a pantalla completa) o ABRIR EN EL NAVEGADOR.
// Necesita antes core/js/sistema/idioma-regla.js e idioma-web.js (IDIOMA_WEB, ADR 144) y mudanza/reglas.js (MUDANZA_REGLAS); su estilo, core/css/mudanza.css.
'use strict';
(() => {
  const R = MUDANZA_REGLAS;
  const destino = R.destino(location.pathname, location.search, location.hash);
  if (!destino) return;
  if (!R.esApp(window.matchMedia && window.matchMedia.bind(window), navigator)) { location.replace(destino); return; }

  // la web fuera de los juegos va en español o inglés (ADR 135): estos textos solo salen aquí
  const TEXTOS = {
    es: { tit: '{n} SE HA MUDADO', p1: 'Ahora vive en una dirección nueva. Tu partida sigue en este móvil: no se pierde nada.',
      p2: 'Esta es la app vieja y dejará de funcionar en febrero de 2027. Para tener la nueva:',
      l1: 'Toca ABRIR EN EL NAVEGADOR y, desde el menú del navegador, añádela a la pantalla de inicio.', l2: 'Después borra esta app vieja.',
      p3: '¿Quieres jugar ya? JUGAR funciona aquí mismo.', jugar: 'JUGAR', abrir: 'ABRIR EN EL NAVEGADOR' },
    en: { tit: '{n} HAS MOVED', p1: 'It now lives at a new address. Your save is still on this phone: nothing is lost.',
      p2: 'This is the old app and it will stop working in February 2027. To get the new one:',
      l1: 'Tap OPEN IN THE BROWSER and, from the browser menu, add it to your home screen.', l2: 'Then delete this old app.',
      p3: 'Want to play now? PLAY works right here.', jugar: 'PLAY', abrir: 'OPEN IN THE BROWSER' },
  };

  function crea(etiqueta, texto, padre) {
    const e = document.createElement(etiqueta);
    if (texto) e.textContent = texto;
    padre.appendChild(e);
    return e;
  }

  function aviso() {
    const idioma = IDIOMA_WEB.elegido(), t = TEXTOS[idioma];
    document.documentElement.lang = idioma;
    const nombre = document.title.toUpperCase();
    const fondo = crea('div', '', document.body), caja = crea('div', '', fondo);
    fondo.className = 'mudanza'; caja.className = 'caja';
    crea('h1', t.tit.replace('{n}', nombre), caja);
    crea('p', t.p1, caja); crea('p', t.p2, caja);
    const lista = crea('ol', '', caja);
    crea('li', t.l1, lista); crea('li', t.l2, lista);
    crea('p', t.p3, caja);
    const fila = crea('div', '', caja); fila.className = 'fila';
    crea('button', t.jugar, fila).onclick = () => {
      const marco = crea('iframe', '', document.body);
      marco.className = 'juego'; marco.src = destino; fondo.remove(); marco.focus();
    };
    crea('button', t.abrir, fila).onclick = () => { location.href = destino; };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aviso); else aviso();
})();
