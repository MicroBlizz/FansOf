// Tiny Fans · adaptador · GUÍA del primer minuto: frases cortas que salen bajo los marcadores en las dos primeras salidas (cómo moverse,
// que la grapadora dispara sola, cómo se coge el botín, volver a casa) y el «¡A casa!» de batería baja, que sale siempre. Se apunta sola
// a los eventos; cada frase sale una vez por salida y no tapa el tercio de abajo.
'use strict';
TN.guia = (() => {
  let cartel = null, reloj = 0, dichas = new Set(), nueva = false;
  function dice(clave, texto, segundos = 4, urgente = false) {
    if (dichas.has(clave)) return;
    dichas.add(clave);
    if (cartel) cartel.remove();
    cartel = TN.crea('div', { className: 'tn-guia' + (urgente ? ' tn-urgente' : ''), textContent: tr(texto) });
    TN.capa().append(cartel);
    clearTimeout(reloj); reloj = setTimeout(() => { if (cartel) cartel.remove(); cartel = null; }, segundos * 1000);
  }
  const FRASES = {
    sale() { dichas = new Set(); nueva = TN.sesion.partida.contadores.salidas <= 2; if (nueva) dice('mueve', 'Arrastra el dedo para moverte'); },
    'sale-nido': () => nueva && dice('dispara', 'La grapadora dispara sola'),
    'voltio-recoge': () => nueva && dice('voltios', 'Llena la barra azul y elige una mejora'),
    'muere-bicho': () => nueva && dice('botin', 'Quédate quieto sobre lo amarillo para cogerlo', 5),
    recoge: () => nueva && dice('vuelve', 'Vuelve al nido para guardar lo que llevas', 5),
    'mochila-llena': () => dice('llena', '¡Mochila llena! Vuelve al nido', 4, true),
    'bateria-baja': () => dice('casa', '¡A casa! Te queda poca batería', 4, true),
    'gigante-aviso': () => dice('gigante', '¡Sal de la sombra!', 3, true),
    pantalla() { if (cartel) cartel.remove(); cartel = null; clearTimeout(reloj); },
  };
  TN.eventos.oye(Object.keys(FRASES), e => FRASES[e.tipo](e));
  return { dice };
})();
