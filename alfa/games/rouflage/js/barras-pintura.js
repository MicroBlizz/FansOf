// Fans of Rouflage · LAS BARRAS DE DESPLAZAMIENTO QUE PINTAN (Daniel, 5-11-2026): la barra es una brocha y, al mover la lista, va pintando el
// camino por donde pasa, hacia arriba y hacia abajo (o a los lados), con un brochazo de bordes irregulares y los colores de las Gotas.
// Los dibujos son SVG que se pasan al estilo como variables (--rastro-v / --rastro-h en cada lista, --brocha-v / --brocha-h): los usa
// estilo-barras.css en ::-webkit-scrollbar. Las cerdas miran hacia donde se mueve. Las funciones de dibujo (rastro, brocha, amplia) son
// puras; escucha() las engancha a todas las listas del juego con un solo aviso de 'scroll' (lo llama principal.js, al arrancar).
'use strict';

const BARRAS = (() => {
  const OL = '#0b0f1c', LARGO = 1000, ANCHO = 14;
  const ARCO = ['#ff4b5c', '#ff9a3d', '#ffd23d', '#7ee04a', '#39d5e8', '#4a7dff'];
  const url = svg => 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  // un borde irregular que no cambia al repintar: suma de ondas (la semilla separa un borde del otro)
  const ruido = (t, s) => Math.sin(t * 0.021 + s) * 0.55 + Math.sin(t * 0.057 + s * 2.3) * 0.35 + Math.sin(t * 0.13 + s * 4.1) * 0.2;
  const n = v => Math.round(v * 10) / 10;

  // el tramo pintado [a, b] (0..1) se agranda hasta cubrir [a2, b2]; devuelve el nuevo y si ha crecido de verdad (medio punto o más)
  const amplia = (r, a2, b2) => {
    const a = Math.max(0, Math.min(r ? r[0] : a2, a2)), b = Math.min(1, Math.max(r ? r[1] : b2, b2));
    return { r: [a, b], crece: !r || r[0] - a >= 0.005 || b - r[1] >= 0.005 };
  };

  // el brochazo entre a y b: bordes que tiemblan, puntas redondeadas y vetas de las cerdas; arcoíris a lo largo de toda la barra
  const rastro = (a, b, vertical) => {
    const y0 = a * LARGO, y1 = b * LARGO, izq = [], der = [];
    for (let y = y0; y <= y1; y += 14) { izq.push([n(2.2 + ruido(y, 1) * 1.3), n(y)]); der.push([n(11.8 - ruido(y, 7) * 1.3), n(y)]); }
    izq.push([n(2.2 + ruido(y1, 1) * 1.3), n(y1)]); der.push([n(11.8 - ruido(y1, 7) * 1.3), n(y1)]);
    const p = ([x, y]) => (vertical ? `${x} ${y}` : `${y} ${x}`);
    const fin = vertical ? `Q 7 ${n(y1 + 9)} ` : `Q ${n(y1 + 9)} 7 `, ini = vertical ? `Q 7 ${n(y0 - 9)} ` : `Q ${n(y0 - 9)} 7 `;
    const d = 'M' + izq.map(p).join(' L') + ' ' + fin + p(der[der.length - 1]) + ' L' + der.slice().reverse().map(p).join(' L') + ' ' + ini + p(izq[0]) + 'Z';
    const veta = x => 'M' + izq.map(([, y]) => p([n(x + ruido(y, x) * 0.6), y])).join(' L');
    const g = vertical ? 'x1="0" y1="0" x2="0" y2="1000"' : 'x1="0" y1="0" x2="1000" y2="0"';
    const caja = vertical ? `0 -12 ${ANCHO} ${LARGO + 24}` : `-12 0 ${LARGO + 24} ${ANCHO}`;
    return url(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${caja}" preserveAspectRatio="none"><defs><linearGradient id="a" gradientUnits="userSpaceOnUse" ${g}>${ARCO.map((c, i) => `<stop offset="${i / (ARCO.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient></defs>`
      + `<path d="${d}" fill="url(#a)" stroke="${OL}" stroke-width="1.4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`
      + `<path d="${veta(5)} ${veta(9)}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`);
  };

  // la brocha (14 x 34): mango de madera, virola de metal y cerdas mojadas en el color del sitio por donde va; `adelante` = las cerdas miran
  // hacia abajo (o a la derecha)
  const brocha = (color, vertical, adelante) => {
    const orienta = vertical ? '' : 'translate(0 14) rotate(-90)', vuelta = adelante ? '' : vertical ? 'rotate(180 7 17)' : 'rotate(180 17 7)';
    const svg = `<g transform="${vuelta}"><g transform="${orienta}"><rect x="4.5" y="1" width="5" height="13" rx="2.2" fill="#c98b4a" stroke="${OL}" stroke-width="1.4"/>`
      + `<rect x="2" y="13" width="10" height="6" rx="1" fill="#dfe6ef" stroke="${OL}" stroke-width="1.4"/><path d="M3 15.4h8" stroke="#8d97a8"/>`
      + `<path d="M2.2 19h9.6l.6 9-1.4 4-1.2-2.4-1 3.4-1.2-3-1 3-1.1-3.4-1.1 2.4-1.4-4z" fill="${color}" stroke="${OL}" stroke-width="1.4" stroke-linejoin="round"/>`
      + `<path d="M5 21v7M7 21v8M9 21v7" stroke="#fff" stroke-opacity=".45"/></g></g>`;
    return url(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vertical ? '14 34' : '34 14'}">${svg}</svg>`);
  };

  // el color del arcoíris en un punto (0..1) de la barra: así la brocha va mojada en lo que pinta
  const colorEn = f => ARCO[Math.max(0, Math.min(ARCO.length - 1, Math.round(f * (ARCO.length - 1))))];

  // cada lista recuerda su tramo pintado y hacia dónde iba
  const ESTADO = new WeakMap();
  const pinta = el => {
    const est = ESTADO.get(el) || {}; ESTADO.set(el, est); est.raf = 0;
    for (const vertical of [true, false]) {
      const total = vertical ? el.scrollHeight : el.scrollWidth, ve = vertical ? el.clientHeight : el.clientWidth, pos = vertical ? el.scrollTop : el.scrollLeft;
      if (total <= ve + 1) continue;
      const a = pos / total, b = (pos + ve) / total, k = vertical ? 'v' : 'h';
      const { r, crece } = amplia(est[k], a, b);
      if (est['p' + k] !== undefined && pos !== est['p' + k]) est['d' + k] = pos > est['p' + k];
      est['p' + k] = pos; est[k] = r;
      if (crece) el.style.setProperty('--rastro-' + k, rastro(r[0], r[1], vertical));
      el.style.setProperty('--brocha-' + k, brocha(colorEn((a + b) / 2), vertical, est['d' + k] !== false));
    }
  };
  const escucha = () => {
    document.documentElement.style.setProperty('--brocha-v', brocha(ARCO[0], true, true));
    document.documentElement.style.setProperty('--brocha-h', brocha(ARCO[0], false, true));
    document.addEventListener('scroll', e => {
      const el = e.target; if (!(el instanceof Element)) return;
      const est = ESTADO.get(el) || {}; ESTADO.set(el, est);
      if (!est.raf) est.raf = requestAnimationFrame(() => pinta(el));
    }, { capture: true, passive: true });
  };

  return Object.freeze({ amplia, rastro, brocha, colorEn, escucha });
})();
