// Fans of Pop · EL DIBUJO DE UN COMPAÑERO EN EL ÁLBUM (tarea #142, ADR 157): la miniatura de las cartas, la ficha y Mi equipo. Los 13 de
// siempre usan su dibujo de Yoshi (o su repuesto, ppMiniatura de js/sprites.js); los 20 Animales, hasta que Yoshi los pinte, van dibujados
// por código en SVG: cuerpo de gelatina con su color, coloretes y el adorno de cada uno (orejas, pico, pinzas…), como el boceto que
// aprobó Pepins. La silueta «?» es la de los que aún no tienes; la de los escondidos (ADR 199) es su propio dibujo de un solo color
// (ppCompSombra), con su momento dibujado (lunita o solecito, ppCompMomento).
'use strict';
// el adorno de cada Animal (el del boceto) y si va detrás del cuerpo
const PP_COMP_ADORNO = Object.freeze({
  ardilla: 'cola', castor: 'dientes', capibara: 'orejitas', pinguino: 'pico', pato: 'pico', cangrejo: 'pinzas', osito: 'orejitas',
  mariquita: 'antena', zorro: 'orejas', suricata: 'orejitas', mapache: 'antifaz', pulpito: 'tentaculos', mariposa: 'alas',
  luciernaga: 'antena', erizo: 'pinchos', huron: 'antifaz', pezglobo: 'pinchos', caballito: 'cola', panda: 'orejitas', mechavaca: 'cuernos',
});
const PP_COMP_DETRAS = Object.freeze(['alas', 'cola', 'pinchos', 'orejas', 'orejitas', 'cuernos', 'antena']);
function ppCompAdornoSvg(tipo, c2) {
  const o = 'stroke="#4a2c2a" stroke-width="3" stroke-linejoin="round"';
  const A = {
    orejas: `<path d="M38 38 L32 6 L46 30Z M62 38 L68 6 L54 30Z" fill="${c2}" ${o}/>`,
    orejitas: `<circle cx="30" cy="36" r="9" fill="${c2}" ${o}/><circle cx="70" cy="36" r="9" fill="${c2}" ${o}/>`,
    antena: `<path d="M50 34 L50 16" ${o} fill="none"/><circle cx="50" cy="14" r="5" fill="${c2}" ${o}/>`,
    dientes: `<rect x="44" y="72" width="12" height="8" fill="#fff" ${o}/>`,
    tentaculos: `<path d="M34 92 Q32 100 36 104 M46 94 Q46 102 44 106 M56 94 Q56 102 58 106 M66 92 Q70 100 66 104" fill="none" ${o}/>`,
    alas: `<path d="M22 62 Q4 46 12 70 Q14 80 26 72Z M78 62 Q96 46 88 70 Q86 80 74 72Z" fill="${c2}" ${o}/>`,
    cola: `<path d="M80 80 Q100 70 92 50 Q88 64 76 70Z" fill="${c2}" ${o}/>`,
    pico: `<path d="M44 66 L56 66 L50 74Z" fill="#ffb020" ${o}/>`,
    pinzas: `<path d="M20 64 Q8 56 14 46 Q20 54 24 52Z M80 64 Q92 56 86 46 Q80 54 76 52Z" fill="${c2}" ${o}/>`,
    antifaz: '<rect x="30" y="56" width="40" height="13" rx="6" fill="#3a2a20"/>',
    pinchos: `<path d="M28 44 L22 30 L36 38 L40 22 L48 36 L56 20 L62 36 L72 26 L72 42" fill="${c2}" ${o}/>`,
    cuernos: `<path d="M34 36 Q26 20 32 16 Q36 26 42 32Z M66 36 Q74 20 68 16 Q64 26 58 32Z" fill="#fff4d0" ${o}/>`,
  };
  return A[tipo] || '';
}
// un Animal dibujado por código (SVG en texto: los colores son datos fijos de js/companeros-datos.js)
function ppCompSvg(id) {
  const d = PP_COMP.NUEVOS[id], tipo = PP_COMP_ADORNO[id] || '', ad = ppCompAdornoSvg(tipo, d.color2), detras = PP_COMP_DETRAS.includes(tipo);
  return `<svg viewBox="0 0 100 110" aria-hidden="true">${detras ? ad : ''}
    <path d="M18 92 Q14 44 50 38 Q86 44 82 92 Q50 100 18 92Z" fill="${d.color}" stroke="#4a2c2a" stroke-width="3"/>
    <path d="M26 60 Q30 46 44 44" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".8"/>
    <circle cx="40" cy="64" r="5" fill="#4a2c2a"/><circle cx="60" cy="64" r="5" fill="#4a2c2a"/>
    <circle cx="41.5" cy="62.5" r="1.6" fill="#fff"/><circle cx="61.5" cy="62.5" r="1.6" fill="#fff"/>
    <circle cx="32" cy="72" r="4" fill="#ff8aa8" opacity=".55"/><circle cx="68" cy="72" r="4" fill="#ff8aa8" opacity=".55"/>
    <path d="M46 72 Q50 76 54 72" stroke="#4a2c2a" stroke-width="2.5" fill="none" stroke-linecap="round"/>${detras ? '' : ad}</svg>`;
}
const PP_COMP_SILUETA = '<svg viewBox="0 0 100 110" aria-hidden="true"><path d="M18 92 Q14 44 50 38 Q86 44 82 92Z" fill="#e9cfc0"/><text x="50" y="80" text-anchor="middle" font-size="34" font-weight="700" fill="#c9a48f">?</text></svg>';
const ppCompCaja = lado => { const caja = document.createElement('span'); caja.className = 'pp-cm-dibujo'; caja.style.width = lado + 'px'; caja.style.height = lado + 'px'; return caja; };
// ¿va dibujado por código? (un Animal que Yoshi aún no ha pintado)
const ppCompEsSvg = id => !!PP_COMP.NUEVOS[id] && !ppTieneImg('sl-' + id);
// la miniatura de un compañero (elemento): su dibujo de Yoshi si ya está; si no, el repuesto (los 13) o el SVG (los Animales)
function ppCompMini(id, lado, falta = false) {
  const caja = ppCompCaja(lado);
  if (falta) caja.innerHTML = PP_COMP_SILUETA;
  else if (ppCompEsSvg(id)) caja.innerHTML = ppCompSvg(id);
  else caja.appendChild(ppMiniatura('sl-' + id, lado));
  return caja;
}
// el color de la silueta de un escondido que falta: un tono suave del papel del álbum
const PP_COMP_SOMBRA = '#d9b3a0';
// el dibujo de Yoshi (o su repuesto) relleno de un solo color: se pinta y se tiñe todo lo opaco
function ppCompSombraLienzo(id, lado) {
  const cv = ppMiniatura('sl-' + id, lado), c = cv.getContext('2d');
  c.globalCompositeOperation = 'source-in'; c.fillStyle = PP_COMP_SOMBRA; c.fillRect(0, 0, cv.width, cv.height);
  return cv;
}
// la silueta DE VERDAD de un escondido que te falta (ADR 199): su propio dibujo de un solo color, sin detalles, y una «?» pequeña.
// El SVG de los Animales se tiñe con CSS (.pp-cm-sombra en css/companeros.css); el dibujo de Yoshi, en el lienzo
function ppCompSombra(id, lado) {
  const caja = ppCompCaja(lado);
  caja.classList.add('pp-cm-sombra');
  if (ppCompEsSvg(id)) caja.innerHTML = ppCompSvg(id);
  else caja.appendChild(ppCompSombraLienzo(id, lado));
  caja.insertAdjacentHTML('beforeend', '<b class="pp-cm-sombra-q">?</b>');
  return caja;
}
// el momento de un escondido, dibujado: lunita (de noche, modo Difícil) o solecito (de día, camino normal)
const PP_COMP_MOMENTO = Object.freeze({
  noche: '<path d="M15.5 3.5 A9 9 0 1 0 20.5 16 A7 7 0 0 1 15.5 3.5Z" fill="#ffe68a" stroke="#4a6fc0" stroke-width="2.2" stroke-linejoin="round"/><circle cx="19" cy="6" r="1.3" fill="#4a6fc0"/>',
  dia: '<path d="M12 1.8 V4.6 M12 19.4 V22.2 M1.8 12 H4.6 M19.4 12 H22.2 M4.8 4.8 L6.8 6.8 M17.2 17.2 L19.2 19.2 M4.8 19.2 L6.8 17.2 M17.2 6.8 L19.2 4.8" stroke="#ff8a3d" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="12" r="5.2" fill="#ffcf3f" stroke="#ff8a3d" stroke-width="2.2"/>',
});
const ppCompMomento = (momento, px) => PP_COMP_MOMENTO[momento] ? `<svg class="pp-cm-momento" viewBox="0 0 24 24" width="${px}" height="${px}" aria-hidden="true">${PP_COMP_MOMENTO[momento]}</svg>` : '';
// la estrella dibujada (SVG): llena en oro o vacía en crema
const ppCompEstrella = (llena, px) => `<svg class="pp-cm-est" viewBox="0 0 24 24" width="${px}" height="${px}" aria-hidden="true"><path d="M12 2 L14.9 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.3 L5.8 21 L7.4 14 L2 9.3 L9.1 8.6Z" fill="${llena ? '#ffcf3f' : '#f3e2d4'}" stroke="#4a2c2a" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
// el candado de una casilla cerrada (SVG)
const PP_COMP_CANDADO = '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3" fill="#ffcf3f" stroke="#4a2c2a" stroke-width="2"/><path d="M8 10 V7 a4 4 0 0 1 8 0 V10" fill="none" stroke="#4a2c2a" stroke-width="2"/></svg>';
