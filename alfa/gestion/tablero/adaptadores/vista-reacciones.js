// Fans Of · /gestion · TABLERO · adaptador · VISTAREACCIONES (tarea #124, ADR 149): el HTML de las reacciones. Los doce iconos dibujados con el estilo de
// Fans Of (contorno grueso, colores de la casa; nada de emojis) van una sola vez en la página como <symbol> (ICONOS, lo pone principal.js) y cada reacción
// los usa con <use>. `fila`: las reacciones debajo de la tarjeta, cada una con quién la puso (y al pasar el ratón, «Lo puso …»). `barrita`: los doce
// botones que salen al dejar apretada una tarjeta. Funciones puras (reciben `esc`); se prueban en Node.
'use strict';
TABLERO.vistaReacciones = (() => {
  const T = '#10202b';   // el contorno de todos
  const DIBUJO = {
    vale: `<circle cx="20" cy="20" r="16" fill="#3dbe8b" stroke="${T}" stroke-width="3.5"/><path d="M12 20.5l5.5 5.5L28.5 14" fill="none" stroke="${T}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    urge: `<path d="M20 4c2 7 10 10 10 19a10 10 0 0 1-20 0c0-5 3-8 5-10 0 4 2 6 4 6-1-6 0-11 1-15z" fill="#f2994a" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/><path d="M20 22c3 2 5 4 5 7a5 5 0 0 1-10 0c0-3 3-4 5-7z" fill="#f2c94c" stroke="${T}" stroke-width="2.5" stroke-linejoin="round"/>`,
    lo_miro: `<path d="M3 20c5-9 11-12 17-12s12 3 17 12c-5 9-11 12-17 12S8 29 3 20z" fill="#fff" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="20" cy="20" r="7" fill="#4aa3df" stroke="${T}" stroke-width="3"/><circle cx="20" cy="20" r="2.8" fill="${T}"/>`,
    duda: `<circle cx="20" cy="20" r="16" fill="#f2c94c" stroke="${T}" stroke-width="3.5"/><path d="M14.5 15.5a5.5 5.5 0 1 1 8 4.8c-1.8 1-2.5 2-2.5 4" fill="none" stroke="${T}" stroke-width="4" stroke-linecap="round"/><circle cx="20" cy="29.5" r="2.4" fill="${T}"/>`,
    me_rio: `<circle cx="20" cy="20" r="16" fill="#f2c94c" stroke="${T}" stroke-width="3.5"/><path d="M11 15l4 2-4 2M29 15l-4 2 4 2" fill="none" stroke="${T}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 23h18a9 9 0 0 1-18 0z" fill="#e5484d" stroke="${T}" stroke-width="3" stroke-linejoin="round"/>`,
    no: `<circle cx="20" cy="20" r="16" fill="#e5484d" stroke="${T}" stroke-width="3.5"/><path d="M13.5 13.5l13 13M26.5 13.5l-13 13" stroke="${T}" stroke-width="4.5" stroke-linecap="round"/>`,
    ideaza: `<path d="M20 4a11 11 0 0 0-6 20c1.5 1 2 2.5 2 4h8c0-1.5.5-3 2-4a11 11 0 0 0-6-20z" fill="#f2c94c" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/><rect x="15" y="29" width="10" height="7" rx="2" fill="#aab3c2" stroke="${T}" stroke-width="3"/><path d="M17 17l3 4 3-4" fill="none" stroke="${T}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    chapuza: `<path d="M8 33c-3 0-4-5 0-6-2-3 0-7 4-6-1-4 3-7 7-5 0-4 4-6 6-3 3-2 7 2 4 5 4 0 5 5 2 6 4 1 3 6-1 6z" fill="#a0673a" stroke="${T}" stroke-width="3.2" stroke-linejoin="round"/><circle cx="16" cy="26" r="2.2" fill="#fff" stroke="${T}" stroke-width="1.5"/><circle cx="24" cy="26" r="2.2" fill="#fff" stroke="${T}" stroke-width="1.5"/><path d="M17 30.5q3 2 6 0" fill="none" stroke="${T}" stroke-width="2" stroke-linecap="round"/>`,
    esto_peta: `<circle cx="18" cy="24" r="12" fill="#3a4150" stroke="${T}" stroke-width="3.5"/><path d="M25 14l4-4" stroke="${T}" stroke-width="4" stroke-linecap="round"/><path d="M29 10q3-4 6-2" fill="none" stroke="#a0673a" stroke-width="2.5" stroke-linecap="round"/><path d="M35 5l1.5 3M37 9h3M35 11l2 2" stroke="#f2994a" stroke-width="2.5" stroke-linecap="round"/><circle cx="13.5" cy="20" r="2.5" fill="#fff"/>`,
    a_tope: `<path d="M20 3c7 5 9 13 7 23H13C11 16 13 8 20 3z" fill="#fff" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="20" cy="15" r="3.5" fill="#4aa3df" stroke="${T}" stroke-width="2.5"/><path d="M13 20l-6 7 6 1M27 20l6 7-6 1" fill="#e5484d" stroke="${T}" stroke-width="3" stroke-linejoin="round"/><path d="M16 28l4 9 4-9z" fill="#f2994a" stroke="${T}" stroke-width="2.5" stroke-linejoin="round"/>`,
    sin_prisa: `<circle cx="17" cy="23" r="14" fill="#56ccf2" stroke="${T}" stroke-width="3.5"/><path d="M10 22q3 2 6 0M18 22q3 2 6 0" fill="none" stroke="${T}" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="17" cy="30" rx="3" ry="2" fill="${T}"/><path d="M27 4h8l-8 8h8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    fiesta: `<path d="M5 36l9-24 14 14z" fill="#f2994a" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/><path d="M9 26l6 6M12 18l9 9" stroke="#f2c94c" stroke-width="3" stroke-linecap="round"/><circle cx="29" cy="7" r="2.5" fill="#3dbe8b"/><circle cx="35" cy="15" r="2.5" fill="#e5484d"/><circle cx="23" cy="5" r="2" fill="#4aa3df"/><path d="M30 13l3-3M25 11q2-4 0-7M33 21q4-2 6 0" fill="none" stroke="#f2c94c" stroke-width="2.5" stroke-linecap="round"/>`,
  };
  const ICONOS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${TABLERO.REACCIONES.map(r => `<symbol id="tb-r-${r.id}" viewBox="0 0 40 40">${DIBUJO[r.id]}</symbol>`).join('')}</defs></svg>`;
  const icono = (id, lado) => `<svg width="${lado}" height="${lado}" aria-hidden="true"><use href="#tb-r-${id}"/></svg>`;

  // Debajo de la tarjeta: cada reacción con su icono y quién la puso; la tuya, con borde verde. Sin reacciones, nada
  const pastilla = (r, esc) => {
    const nombre = esc(TABLERO.nombreDe(r.quien)), texto = esc(TABLERO.textoReaccion(r.reaccion));
    return `<span class="tb-reac${r.mia ? ' mia' : ''}" title="Lo puso ${nombre}: ${texto}" aria-label="${nombre} reaccionó: ${texto}">${icono(r.reaccion, 20)}${nombre}</span>`;
  };
  const fila = (t, esc) => ((t.reacciones || []).length ? `<div class="tb-reacciones">${t.reacciones.map(r => pastilla(r, esc)).join('')}</div>` : '');

  // La barrita de los doce, encima de la tarjeta; la que ya tienes puesta sale marcada (pulsarla otra vez la quita)
  const barrita = t => {
    const mia = TABLERO.miReaccion(t);
    return `<div class="tb-barrita" data-barrita="${t.id}" role="menu" aria-label="Reaccionar a la tarea #${t.id}">${TABLERO.REACCIONES.map(r => `<button type="button" role="menuitem" class="tb-r${r.id === mia ? ' puesta' : ''}" data-reaccion="${r.id}" title="${r.texto}" aria-label="${r.texto}${r.id === mia ? ' (quitar)' : ''}">${icono(r.id, 36)}</button>`).join('')}</div>`;
  };

  const ESTILO = '.tb-reacciones{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}.tb-reac{display:inline-flex;align-items:center;gap:4px;border:1.5px solid var(--linea);border-radius:14px;padding:1px 9px 1px 3px;font-size:12px;cursor:default}.tb-reac.mia{border-color:#3dbe8b}'
    + '.tb-tarea{position:relative;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.tb-barrita{position:absolute;z-index:5;left:6px;top:-6px;transform:translateY(-100%);display:grid;grid-template-columns:repeat(6,auto);gap:4px;background:var(--panel);border:2px solid #4aa3df;border-radius:16px;padding:6px}'
    + '.tb-r{border:0;background:transparent;padding:3px;border-radius:10px;min-height:0;line-height:0}.tb-r:hover,.tb-r:focus-visible{background:var(--bg)}.tb-r.puesta{background:#3dbe8b}.tb-fila>.tb-reacciones{grid-column:1}';
  return { ICONOS, fila, barrita, ESTILO };
})();
