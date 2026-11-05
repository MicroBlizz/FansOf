// Fans of Rouflage · LAS BARRAS DE DESPLAZAMIENTO QUE PINTAN (Daniel, 5-11-2026): cada lista del juego lleva su propia barra, dibujada por
// el juego en un lienzo (no la del navegador: en el móvil daba saltos y no se dejaba dibujar igual en todos). La barra es una brocha que va
// de punta a punta y pinta por donde pasa (nunca por delante de sus cerdas) con un brochazo de bordes irregulares y los colores de las
// Gotas, que se borra a RADIO px de la brocha: la mancha dice dónde estás. Mientras no hayas movido una lista que tiene más, una flecha
// parpadea al final y la brocha se menea: avisa de que se puede bajar. Las cuentas (amplia, recorta, posBrocha, colorEn) son puras.
'use strict';

const BARRAS = (() => {
  const OL = '#0b0f1c', ANCHO = 14, ALTO = 34, RADIO = 150;      // px: grosor de la barra, largo de la brocha, pintura que dura a su lado
  const ARCO = [[255, 75, 92], [255, 154, 61], [255, 210, 61], [126, 224, 74], [57, 213, 232], [74, 125, 255]];
  // las listas que llevan barra (las que tenían barra visible); las de la partida y las que la escondían a propósito, no
  const LISTAS = '.pantalla, .pantalla.con-barra > .caja, .ar-pestanas, .ar-rejilla, .pase-lista, .tienda-lista, .tn-cats, .cs-lista, .fc-lista, .ar-compra, .esc-tira, .esc-herr, .esc-colores, .mis-lista, .obra-elige-caja, .sala, .clasif, #retratos, .tal-lista, .amg-lista, .tem-tabla';

  // un borde irregular que no cambia al repintar: suma de ondas (la semilla separa un borde del otro)
  const ruido = (t, s) => Math.sin(t * 0.06 + s) * 0.55 + Math.sin(t * 0.16 + s * 2.3) * 0.35 + Math.sin(t * 0.37 + s * 4.1) * 0.2;

  // el tramo pintado [a, b] (px) se agranda hasta cubrir [a2, b2]
  const amplia = (r, a2, b2) => [Math.min(r ? r[0] : a2, a2), Math.max(r ? r[1] : b2, b2)];
  // el tramo pintado se queda solo con lo que cae dentro de [lo, hi] (cerca de la brocha); null si no queda nada
  const recorta = (r, lo, hi) => { if (!r) return null; const a = Math.max(r[0], lo), b = Math.min(r[1], hi); return a < b ? [a, b] : null; };
  // dónde está la brocha (px desde el principio de la barra de `pista` px): va de punta a punta según lo movida que está la lista; la punta
  // de las cerdas, 13 px más allá hacia donde se mueve (hasta ahí se pinta)
  const posBrocha = (total, ve, pos, pista, adelante) => {
    const f = Math.min(1, Math.max(0, pos / Math.max(1, total - ve))), centro = f * (pista - ALTO) + ALTO / 2;
    return { centro, punta: Math.max(0, Math.min(pista, centro + (adelante ? 13 : -13))) };
  };
  // el color del arcoíris (mezclado) en un punto 0..1 de la barra
  const colorEn = f => {
    const x = Math.min(1, Math.max(0, f)) * (ARCO.length - 1), i = Math.min(ARCO.length - 2, Math.floor(x)), t = x - i;
    return ARCO[i].map((c, k) => Math.round(c + (ARCO[i + 1][k] - c) * t));
  };

  // ---- dibujo (en el lienzo de cada barra; v = vertical) ----
  const CERDAS = new Path2D('M2.2 19h9.6l.6 9-1.4 4-1.2-2.4-1 3.4-1.2-3-1 3-1.1-3.4-1.1 2.4-1.4-4z');
  function pintaRastro(c, r, centro, pista) {
    for (let y = Math.floor(r[0]); y < r[1]; y += 2) {
      const lejos = Math.abs(y - centro) / RADIO, alfa = lejos < 0.4 ? 1 : Math.max(0, 1 - (lejos - 0.4) / 0.6);
      if (alfa <= 0) continue;
      const iz = 2 + ruido(y, 1) * 1.4, de = ANCHO - 2 - ruido(y, 7) * 1.4, [rr, gg, bb] = colorEn(y / pista);
      c.globalAlpha = alfa;
      c.fillStyle = OL; c.fillRect(iz - 1.4, y, de - iz + 2.8, 2);
      c.fillStyle = `rgb(${rr},${gg},${bb})`; c.fillRect(iz, y, de - iz, 2);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(5 + ruido(y, 3) * 0.6, y, 1, 2); c.fillRect(9 + ruido(y, 9) * 0.6, y, 1, 2);
    }
    c.globalAlpha = 1;
  }
  function pintaBrocha(c, centro, adelante, color) {
    c.save(); c.translate(0, centro - ALTO / 2);
    if (!adelante) { c.translate(ANCHO / 2, ALTO / 2); c.rotate(Math.PI); c.translate(-ANCHO / 2, -ALTO / 2); }
    c.lineWidth = 1.4; c.strokeStyle = OL; c.lineJoin = 'round';
    c.fillStyle = '#c98b4a'; c.beginPath(); c.roundRect(4.5, 1, 5, 13, 2.2); c.fill(); c.stroke();
    c.fillStyle = '#dfe6ef'; c.beginPath(); c.roundRect(2, 13, 10, 6, 1); c.fill(); c.stroke();
    c.fillStyle = `rgb(${color.join(',')})`; c.fill(CERDAS); c.stroke(CERDAS);
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(5, 21); c.lineTo(5, 28); c.moveTo(7, 21); c.lineTo(7, 29); c.moveTo(9, 21); c.lineTo(9, 28); c.stroke();
    c.restore();
  }

  // ---- cada lista: su lienzo, su flecha y su estado ----
  const LISTA = new WeakMap(), VIVAS = new Set();
  function prepara(el) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.classList.add('rf-barra');
    const lienzo = document.createElement('canvas'); lienzo.className = 'rf-barra-lienzo'; lienzo.setAttribute('aria-hidden', 'true');
    const flecha = document.createElement('i'); flecha.className = 'rf-barra-flecha'; flecha.setAttribute('aria-hidden', 'true');
    el.append(lienzo, flecha);
    const est = { el, lienzo, flecha, r: null, pos: el.scrollTop, adelante: true, movido: false, raf: 0, v: true };
    LISTA.set(el, est); VIVAS.add(est);
    return est;
  }
  // vertical si se baja; horizontal si solo se mueve de lado
  const sentido = el => el.scrollHeight > el.clientHeight + 2 ? 'v' : el.scrollWidth > el.clientWidth + 2 ? 'h' : null;
  function dibuja(est) {
    est.raf = 0;
    const { el, lienzo } = est, s = sentido(el), v = s === 'v';
    if (lienzo.parentNode !== el) el.append(lienzo, est.flecha);      // la lista se rehízo por dentro (innerHTML): se vuelven a poner
    lienzo.hidden = !s; est.flecha.hidden = !s || est.movido; if (!s) return;
    est.v = v;
    const pista = v ? el.clientHeight : el.clientWidth, total = v ? el.scrollHeight : el.scrollWidth, pos = v ? el.scrollTop : el.scrollLeft;
    if (pos !== est.pos) { est.adelante = pos > est.pos; est.movido = true; est.flecha.hidden = true; est.pos = pos; }
    colocaLienzo(est, v, pista, pos);
    const { centro, punta } = posBrocha(total, pista, pos, pista, est.adelante), meneo = est.movido ? 0 : Math.sin(performance.now() / 160) * 3;
    est.r = amplia(recorta(est.r, centro - RADIO, centro + RADIO), Math.min(centro, punta), Math.max(centro, punta));
    const c = lienzo.getContext('2d'), k = lienzo.width / ANCHO;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, lienzo.width, lienzo.height);
    c.setTransform(v ? k : 0, v ? 0 : k, v ? 0 : k, v ? k : 0, 0, 0);      // en horizontal se dibuja igual, girado
    if (est.movido) pintaRastro(c, est.r, centro, pista);
    pintaBrocha(c, centro + meneo, est.adelante, colorEn(centro / pista));
    if (!est.movido && !lienzo.hidden) est.raf = requestAnimationFrame(() => dibuja(est));      // el meneo, hasta que la muevas
  }
  // el lienzo, pegado al borde de lo que se ve (sigue el desplazamiento para no irse con la lista)
  function colocaLienzo(est, v, pista, pos) {
    const { lienzo, flecha, el } = est, k = Math.min(3, window.devicePixelRatio || 1);
    const w = Math.round(ANCHO * k), h = Math.round(pista * k);
    if (lienzo.width !== (v ? w : h) || lienzo.height !== (v ? h : w)) { lienzo.width = v ? w : h; lienzo.height = v ? h : w; }
    lienzo.classList.toggle('h', !v);
    lienzo.style.cssText = v ? `top:${pos}px;right:0;width:${ANCHO}px;height:${pista}px` : `left:${pos}px;top:${el.clientHeight - ANCHO}px;width:${pista}px;height:${ANCHO}px`;
    flecha.classList.toggle('h', !v);
    flecha.style.cssText = v ? `top:${pos + pista - 34}px;left:calc(50% - 14px)` : `left:${pos + pista - 34}px;top:calc(50% - 14px)`;
  }
  const pide = est => { if (!est.raf) est.raf = requestAnimationFrame(() => dibuja(est)); };
  // busca listas nuevas (al cambiar de pantalla) y repinta las que cambian de tamaño
  function repasa() {
    for (const el of document.querySelectorAll(LISTAS)) {
      if (!el.getClientRects().length || !sentido(el)) { const e = LISTA.get(el); if (e) e.lienzo.hidden = e.flecha.hidden = true; continue; }
      pide(LISTA.get(el) || prepara(el));
    }
    for (const est of VIVAS) if (!est.el.isConnected) VIVAS.delete(est);
  }
  const escucha = () => {
    document.addEventListener('scroll', e => { const est = LISTA.get(e.target); if (est) pide(est); }, { capture: true, passive: true });
    addEventListener('resize', repasa);
    setInterval(repasa, 700);
    repasa();
  };

  return Object.freeze({ amplia, recorta, posBrocha, colorEn, escucha, RADIO });
})();
