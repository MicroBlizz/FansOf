// Fans of Rouflage · LA PANTALLA DE MISIONES (botón MISIONES del título, #p-misiones de index.html): dos pestañas, MISIONES DE HOY (con la cuenta atrás
// hasta las de mañana, hora de Madrid) y LOGROS. Cada fila lleva su dibujo (contorno grueso, colores del juego), su barra de progreso y su botón COBRAR.
// Lo que se cuenta y cómo se cobra está en misiones.js.
'use strict';

const MIS_UI = { pest: 'hoy', reloj: 0 };

// los dibujos de las misiones (en una caja de 40 × 40)
function pintaIconoMision(c, w, ico) {
  c.save(); c.scale(w / 40, w / 40); c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 2.6; c.strokeStyle = OL;
  const f = (col) => { c.fillStyle = col; c.fill(); c.stroke(); };
  const rr = (x, y, ww, hh, r) => { c.beginPath(); c.roundRect(x, y, ww, hh, r); };
  const circ = (x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); };
  if (ico === 'partida') { rr(6, 9, 28, 22, 6); f('#ff7a1a'); c.beginPath(); c.moveTo(16, 14); c.lineTo(27, 20); c.lineTo(16, 26); c.closePath(); f('#fff6ea'); }
  else if (ico === 'silbido') {
    c.beginPath(); c.moveTo(14, 28); c.lineTo(14, 10); c.lineTo(30, 7); c.lineTo(30, 25); c.stroke();
    c.beginPath(); c.ellipse(10.5, 28.5, 4.5, 3.6, -0.3, 0, TAU); f('#ffcb3d'); c.beginPath(); c.ellipse(26.5, 25.5, 4.5, 3.6, -0.3, 0, TAU); f('#ffcb3d');
  } else if (ico === 'humo') {
    c.beginPath(); c.arc(13, 24, 7, Math.PI * 0.5, Math.PI * 1.5); c.arc(20, 15, 8, Math.PI, Math.PI * 1.9); c.arc(28, 22, 7, Math.PI * 1.4, Math.PI * 0.5); c.closePath(); f('#c9cfdc');
    circ(29, 30, 5); f('#3a2a50'); c.beginPath(); c.moveTo(31, 26); c.lineTo(34, 22); c.stroke();
  } else if (ico === 'foto') { rr(5, 12, 30, 21, 5); f('#39a0e8'); rr(10, 8, 9, 6, 2); f('#39a0e8'); circ(20, 22.5, 6.5); f('#fff6ea'); circ(20, 22.5, 3); f(OL); }
  else if (ico === 'sello') { rr(15, 5, 10, 12, 4); f('#b45cff'); rr(7, 17, 26, 8, 3); f('#ff4b5c'); rr(9, 25, 22, 8, 2); f('#ffd1d6'); c.beginPath(); c.moveTo(13, 29); c.lineTo(27, 29); c.stroke(); }
  else if (ico === 'copa') {
    c.beginPath(); c.moveTo(11, 7); c.lineTo(29, 7); c.quadraticCurveTo(29, 23, 20, 24); c.quadraticCurveTo(11, 23, 11, 7); c.closePath(); f('#ffcb3d');
    c.beginPath(); c.moveTo(11, 10); c.quadraticCurveTo(4, 11, 8, 17); c.moveTo(29, 10); c.quadraticCurveTo(36, 11, 32, 17); c.stroke();
    rr(17, 24, 6, 6, 1); f('#e0a11f'); rr(12, 30, 16, 5, 2); f('#e0a11f');
  } else if (ico === 'papeles') {
    c.save(); c.translate(15, 21); c.rotate(-0.2); rr(-9, -12, 18, 24, 4); f('#7ee04a'); c.restore();
    c.save(); c.translate(25, 20); c.rotate(0.2); rr(-9, -12, 18, 24, 4); f('#3a7de0'); circ(0, -2, 4); f('#ffcb3d'); c.restore();
  } else if (ico === 'red') {
    circ(20, 20, 13); f('#39d5e8');
    c.beginPath(); c.ellipse(20, 20, 5.5, 13, 0, 0, TAU); c.moveTo(7, 20); c.lineTo(33, 20); c.stroke();
  } else if (ico === 'mapa') {
    c.beginPath(); c.moveTo(5, 10); c.lineTo(14, 7); c.lineTo(26, 10); c.lineTo(35, 7); c.lineTo(35, 30); c.lineTo(26, 33); c.lineTo(14, 30); c.lineTo(5, 33); c.closePath(); f('#ffe07a');
    c.beginPath(); c.moveTo(14, 7); c.lineTo(14, 30); c.moveTo(26, 10); c.lineTo(26, 33); c.stroke();
    c.strokeStyle = '#ff4b5c'; c.lineWidth = 3; c.beginPath(); c.moveTo(17, 16); c.lineTo(23, 22); c.moveTo(23, 16); c.lineTo(17, 22); c.stroke();
  } else if (ico === 'fantasma') {
    c.beginPath(); c.moveTo(9, 33); c.lineTo(9, 18); c.arc(20, 18, 11, Math.PI, 0); c.lineTo(31, 33); c.lineTo(27, 30); c.lineTo(24, 33); c.lineTo(20, 30); c.lineTo(16, 33); c.lineTo(13, 30); c.closePath(); f('#eaf4ff');
    c.fillStyle = OL; circ(16, 18, 2.2); c.fill(); circ(24, 18, 2.2); c.fill(); c.beginPath(); c.ellipse(20, 24.5, 2.4, 3, 0, 0, TAU); c.fill();
  } else if (ico === 'ojo') {
    c.beginPath(); c.moveTo(4, 20); c.quadraticCurveTo(20, 4, 36, 20); c.quadraticCurveTo(20, 36, 4, 20); c.closePath(); f('#fff6ea');
    circ(20, 20, 7); f('#39a0e8'); circ(20, 20, 3); c.fillStyle = OL; c.fill();
  } else if (ico === 'escudo') {
    c.beginPath(); c.moveTo(20, 5); c.lineTo(33, 10); c.quadraticCurveTo(33, 28, 20, 35); c.quadraticCurveTo(7, 28, 7, 10); c.closePath(); f('#7ee04a');
    c.lineWidth = 3.4; c.beginPath(); c.moveTo(14, 20); c.lineTo(19, 25); c.lineTo(27, 14); c.stroke();
  } else if (ico === 'pincel') {
    c.save(); c.translate(20, 20); c.rotate(0.75); rr(-3, -2, 6, 18, 2); f('#b4703a'); rr(-4.5, -7, 9, 6, 1); f('#c9cfdc');
    c.beginPath(); c.moveTo(-4.5, -7); c.quadraticCurveTo(-5, -15, 0, -18); c.quadraticCurveTo(5, -15, 4.5, -7); c.closePath(); f('#ff4b5c'); c.restore();
    circ(9, 31, 3.2); f('#39d5e8'); circ(30, 9, 2.4); f('#ffcb3d');
  } else if (ico === 'reloj') {
    circ(20, 21, 13); f('#ff4b5c'); circ(20, 21, 9.5); f('#fff6ea');
    c.beginPath(); c.moveTo(20, 21); c.lineTo(20, 14.5); c.moveTo(20, 21); c.lineTo(25, 23); c.stroke(); rr(17, 3, 6, 5, 1.5); f('#ff4b5c');
  }
  c.restore();
}
const misionLienzo = (ico, hecho) => { const k = arLienzo(40, 40, 'mis-ico'); arPinta(k, (c, w) => pintaIconoMision(c, w, ico)); if (hecho) k.classList.add('hecho'); return k; };
const misionFalta = () => { const s = Math.max(0, Math.floor((86400000 - gachaMadrid().pasado) / 1000)); return tr('Misiones nuevas en {h} h {m} min', { h: Math.floor(s / 3600), m: Math.floor(s / 60) % 60 }); };

// una fila: dibujo, texto con su barra y el botón (COBRAR, cobrada o el premio que espera)
function misionFila(ico, titulo, sub, val, meta, gotas, hecho, cobrada, id) {
  const fila = document.createElement('div'); fila.className = 'mis-fila' + (cobrada ? ' cobrada' : hecho ? ' lista' : '');
  fila.appendChild(misionLienzo(ico, hecho));
  const txt = document.createElement('div'); txt.className = 'mis-txt';
  const b = document.createElement('b'); b.textContent = titulo; txt.appendChild(b);
  if (sub) { const s = document.createElement('small'); s.textContent = sub; txt.appendChild(s); }
  const barra = document.createElement('div'); barra.className = 'mis-barra';
  const i = document.createElement('i'); i.style.width = Math.round(100 * Math.min(1, val / meta)) + '%'; barra.appendChild(i);
  const n = document.createElement('span'); n.textContent = Math.min(val, meta) + ' / ' + meta; barra.appendChild(n);
  txt.appendChild(barra); fila.appendChild(txt);
  const lado = document.createElement('div'); lado.className = 'mis-lado';
  const premio = document.createElement('span'); premio.className = 'mis-premio';
  const k = arLienzo(18, 18); arPinta(k, (c, w) => pintaGotas(c, w)); premio.appendChild(k); premio.appendChild(document.createTextNode(String(gotas)));
  lado.appendChild(premio);
  const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'boton mis-cobrar';
  bt.textContent = cobrada ? tr('COBRADA') : tr('COBRAR'); bt.disabled = !hecho || cobrada;
  bt.onclick = () => misionCobra(id);
  lado.appendChild(bt); fila.appendChild(lado);
  return fila;
}
function misionesPinta() {
  const caja = E('mis-lista'), hoy = MIS_UI.pest === 'hoy';
  E('b-mis-hoy').classList.toggle('activa', hoy); E('b-mis-logros').classList.toggle('activa', !hoy);
  E('mis-gotas').textContent = String(SAVE.gotas || 0);
  caja.innerHTML = '';
  if (hoy) {
    E('mis-sub').textContent = misionFalta();
    const dif = [tr('FÁCIL'), tr('MEDIA'), tr('DIFÍCIL')];
    misionesDeHoy().forEach((m, i) => caja.appendChild(misionFila(m.ico, tr(m.t), dif[i], misionProgreso(m), m.n, m.g, misionHecha(m), misionCobrada(m), m.id)));
  } else {
    const hechos = LOGROS.filter(logroHecho).length;
    E('mis-sub').textContent = tr('Logros conseguidos: {n} de {t}', { n: hechos, t: LOGROS.length });
    // primero lo que se puede cobrar, luego lo que falta y al final lo ya cobrado
    const orden = l => (logroHecho(l) && !logroCobrado(l) ? 0 : logroCobrado(l) ? 2 : 1);
    LOGROS.slice().sort((a, b) => orden(a) - orden(b)).forEach(l => caja.appendChild(misionFila(l.ico, tr(l.t), tr(l.d), logroValor(l), l.n, l.g, logroHecho(l), logroCobrado(l), 'logro:' + l.id)));
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
