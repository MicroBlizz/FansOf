// Fans of Rouflage · LA PANTALLA DE MISIONES (botón MISIONES del título, #p-misiones de index.html): dos pestañas, MISIONES DE HOY (con la cuenta atrás
// hasta las de mañana, hora de Madrid) y LOGROS. Cada fila lleva su dibujo (contorno grueso, colores del juego), su barra de progreso y su botón COBRAR.
// Lo que se cuenta y cómo se cobra está en misiones.js.
'use strict';

const MIS_UI = { pest: 'hoy', reloj: 0 };

const misionFalta = () => { const s = Math.max(0, Math.floor((86400000 - gachaMadrid().pasado) / 1000)); return tr('Misiones nuevas en {h} h {m} min', { h: Math.floor(s / 3600), m: Math.floor(s / 60) % 60 }); };
const DIF_MIS = [['facil', 'FÁCIL', 1], ['media', 'MEDIA', 2], ['dificil', 'DIFÍCIL', 3]];
// el metal de cada logro: dentro de su familia (lo que cuenta), el primero bronce, luego plata y oro
function logroMetal(l) { const fam = LOGROS.filter(x => x.c === l.c).sort((a, b) => a.n - b.n), i = fam.indexOf(l); return fam.length === 1 ? 'plata' : ['bronce', 'plata', 'oro'][Math.min(2, fam.length === 2 ? i * 2 : i)]; }
const elem = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

// una tarjeta: la insignia, la etiqueta (dificultad con sus estrellas, o el metal), el texto, la barra, el premio y el botón; cobrada, con su sello
function misionFila(o) {
  const estado = o.cobrada ? 'cobrada' : o.hecho ? 'lista' : o.val <= 0 && o.logro ? 'bloqueada' : '';
  const fila = elem('div', 'mis-fila tono-' + o.tono + (o.cobrada ? ' cobrada' : o.hecho ? ' lista' : ''));
  const k = arLienzo(58, 58, 'mis-ico'); arPinta(k, (c, w) => pintaInsignia(c, w, o.ico, o.tono, estado)); fila.appendChild(k);
  const txt = elem('div', 'mis-txt'), cab = elem('div', 'mis-cab');
  cab.appendChild(elem('span', 'mis-tag', o.etiqueta));
  if (o.estrellas) { const es = elem('span', 'mis-estrellas'); for (let i = 0; i < 3; i++) es.appendChild(elem('i', i < o.estrellas ? 'si' : '')); cab.appendChild(es); }
  txt.appendChild(cab); txt.appendChild(elem('b', '', o.titulo)); if (o.sub) txt.appendChild(elem('small', '', o.sub));
  const barra = elem('div', 'mis-barra'), relleno = elem('i'); relleno.style.width = Math.round(100 * Math.min(1, o.val / o.meta)) + '%'; barra.appendChild(relleno);
  barra.appendChild(elem('span', '', Math.min(o.val, o.meta) + ' / ' + o.meta)); txt.appendChild(barra); fila.appendChild(txt);
  const lado = elem('div', 'mis-lado'), premio = elem('span', 'mis-premio'), g = arLienzo(22, 22); arPinta(g, (c, w) => pintaGotas(c, w));
  premio.appendChild(g); premio.appendChild(elem('b', '', '+' + o.gotas)); lado.appendChild(premio);
  if (!o.cobrada) { const bt = elem('button', 'boton mis-cobrar', tr('COBRAR')); bt.type = 'button'; bt.disabled = !o.hecho; bt.onclick = () => { MIS_UI.desde = bt.getBoundingClientRect(); misionCobra(o.id); }; lado.appendChild(bt); }
  fila.appendChild(lado);
  if (o.cobrada) fila.appendChild(elem('div', 'mis-sello', tr('COBRADA')));
  return fila;
}
// al cobrar: las gotas salen del botón y vuelan hasta «Tus gotas», que da un saltito
function misionCelebra(n) {
  const de = MIS_UI.desde, a = E('mis-gotas'); if (!de || !a || E('p-misiones').hidden || !Element.prototype.animate) return;
  const fin = a.getBoundingClientRect(), x0 = de.left + de.width / 2, y0 = de.top + de.height / 2, x1 = fin.left + fin.width / 2, y1 = fin.top + fin.height / 2;
  for (let i = 0; i < Math.min(10, 4 + Math.round(n / 5)); i++) {
    const g = arLienzo(26, 26); arPinta(g, (c, w) => pintaGotas(c, w)); g.className = 'mis-vuela'; document.body.appendChild(g);
    const ax = x0 + (Math.random() - 0.5) * 90, ay = y0 - 30 - Math.random() * 60;
    g.animate([{ transform: `translate(${x0 - 13}px,${y0 - 13}px) scale(.4)`, opacity: 0 }, { transform: `translate(${ax - 13}px,${ay - 13}px) scale(1.15)`, opacity: 1, offset: 0.35 }, { transform: `translate(${x1 - 13}px,${y1 - 13}px) scale(.6)`, opacity: 0.9 }],
      { duration: 750 + i * 60, easing: 'cubic-bezier(.3,.7,.4,1)' }).onfinish = () => { g.remove(); a.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 220 }); };
  }
}
function misionesPinta() {
  const caja = E('mis-lista'), hoy = MIS_UI.pest === 'hoy';
  E('b-mis-hoy').classList.toggle('activa', hoy); E('b-mis-logros').classList.toggle('activa', !hoy);
  E('mis-gotas').textContent = String(SAVE.gotas || 0);
  caja.innerHTML = '';
  if (hoy) {
    E('mis-sub').textContent = misionFalta();
    misionesDeHoy().forEach((m, i) => { const [tono, et, est] = DIF_MIS[Math.min(2, i)]; caja.appendChild(misionFila({ ico: m.ico, tono, etiqueta: tr(et), estrellas: est, titulo: tr(m.t), val: misionProgreso(m), meta: m.n, gotas: m.g, hecho: misionHecha(m), cobrada: misionCobrada(m), id: m.id })); });
  } else {
    const hechos = LOGROS.filter(logroHecho).length;
    E('mis-sub').textContent = tr('Logros conseguidos: {n} de {t}', { n: hechos, t: LOGROS.length });
    // primero lo que se puede cobrar, luego lo que falta y al final lo ya cobrado
    const orden = l => (logroHecho(l) && !logroCobrado(l) ? 0 : logroCobrado(l) ? 2 : 1);
    const METAL = { bronce: 'BRONCE', plata: 'PLATA', oro: 'ORO' };
    LOGROS.slice().sort((a, b) => orden(a) - orden(b)).forEach(l => { const tono = logroMetal(l); caja.appendChild(misionFila({ ico: l.ico, tono, logro: true, etiqueta: tr(METAL[tono]), titulo: tr(l.t), sub: tr(l.d), val: logroValor(l), meta: l.n, gotas: l.g, hecho: logroHecho(l), cobrada: logroCobrado(l), id: 'logro:' + l.id })); });
  }
  E('b-mis-hoy').classList.toggle('aviso', misionesDeHoy().some(m => misionHecha(m) && !misionCobrada(m)));
  E('b-mis-logros').classList.toggle('aviso', LOGROS.some(l => logroHecho(l) && !logroCobrado(l)));
}
function abreMisiones() {
  misionEstado(); logroEstado(); pantalla('p-misiones'); misionesPinta(); play('select');
  clearInterval(MIS_UI.reloj);
  MIS_UI.reloj = setInterval(() => {      // la cuenta atrás (y, si cambia el día con la pantalla abierta, las misiones nuevas)
    if (E('p-misiones').hidden) { clearInterval(MIS_UI.reloj); return; }
    const antes = SAVE.misiones && SAVE.misiones.dia; misionEstado();
    if (SAVE.misiones.dia !== antes) misionesPinta(); else if (MIS_UI.pest === 'hoy') E('mis-sub').textContent = misionFalta();
  }, 1000);
}
function preparaMisiones() {
  if (!PANTALLAS.includes('p-misiones')) PANTALLAS.push('p-misiones');
  E('b-misiones').onclick = abreMisiones;
  E('b-mis-hoy').onclick = () => { MIS_UI.pest = 'hoy'; play('select'); misionesPinta(); };
  E('b-mis-logros').onclick = () => { MIS_UI.pest = 'logros'; play('select'); misionesPinta(); };
  E('b-mis-volver').onclick = () => { play('select'); irTitulo(); };
  misionBoton();
}
