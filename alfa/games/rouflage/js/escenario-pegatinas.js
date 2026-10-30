// Fans of Rouflage · PEGATINAS EN TU ESCENARIO (25-10-2026, «sí con todo» de Daniel): las pegatinas del chat que tienes (pegMias, pegatinas-datos.js)
// se pegan en el suelo y en las paredes de Mi escenario, como calcomanías: no estorban al andar ni a los muebles. Pestaña PEGATINAS del editor: eliges
// una y tocas donde va; con QUITAR, tocas una para despegarla. Como mucho ESC_PEG.MAX. Se guardan en SAVE.escenario.g y viajan con el escenario
// (salaADatos: d.g = [[número, x, y, giro]]); se dibujan en el editor (escDibuja), en la sala con amigos y en la partida (pintaMundoEsc, mapa-escenario.js).
'use strict';

const ESC_PEG = { MAX: 24, LADO: 62, sel: 0, quitar: false };

// dibuja las pegatinas de una sala en c (ya en unidades del mundo), las que caen en R
function pegPintaSala(c, sala, R) {
  for (const p of sala.peg || []) {
    if (R && (p.x < R.x0 - 40 || p.x > R.x1 + 40 || p.y < R.y0 - 40 || p.y > R.y1 + 40)) continue;
    const cv = pegLienzo(p.n, 96); if (!cv) continue;
    c.save(); c.translate(p.x, p.y); c.rotate(p.r || 0); c.drawImage(cv, -ESC_PEG.LADO / 2, -ESC_PEG.LADO / 2, ESC_PEG.LADO, ESC_PEG.LADO); c.restore();
  }
}
const pegDeDatos = g => (Array.isArray(g) ? g.slice(0, ESC_PEG.MAX).filter(q => Array.isArray(q) && PEG_CHAT[q[0]]).map(q => ({ n: q[0] | 0, x: +q[1] || 0, y: +q[2] || 0, r: Math.max(-0.5, Math.min(0.5, +q[3] || 0)) })) : []);
const pegADatos = peg => (peg || []).slice(0, ESC_PEG.MAX).map(p => [p.n, Math.round(p.x), Math.round(p.y), Math.round((p.r || 0) * 100) / 100]);

/* ---------- en el editor ---------- */
function pegToca(p) {
  const sala = escenarioSala(); sala.peg = sala.peg || [];
  const cerca = sala.peg.map((q, i) => [i, Math.hypot(q.x - p.x, q.y - p.y)]).filter(q => q[1] < ESC_PEG.LADO * 0.6).sort((a, b) => a[1] - b[1])[0];
  if (ESC_PEG.quitar) {
    if (!cerca) { play('deny'); return; }
    sala.peg.splice(cerca[0], 1); play('pop'); pegCambio(); return;
  }
  if (escTipoEn(escMundo(sala.id), p.x, p.y) === VACIO) { play('deny'); escAviso(tr('Pégala en el suelo o en una pared')); return; }
  if (sala.peg.length >= ESC_PEG.MAX) { play('deny'); escAviso(tr('Ya no caben más pegatinas: quita alguna')); return; }
  if (!ESC_PEG.sel || !pegTengo(ESC_PEG.sel)) { play('deny'); escAviso(tr('Elige una pegatina abajo')); return; }
  sala.peg.push({ n: ESC_PEG.sel, x: p.x, y: p.y, r: Math.round((Math.random() - 0.5) * 30) / 100 });
  play('pop'); MIESC.chispas.push(...Array.from({ length: 8 }, (_, i) => ({ x: p.x, y: p.y, vx: Math.cos(i) * 90, vy: Math.sin(i) * 90 - 60, vida: 0.5, r: 3.5, col: ['#ffcb3d', '#7ee04a', '#4f95f5', '#ff4b5c'][i % 4] })));
  pegCambio();
}
function pegCambio() { const s = escenarioSala(); s.ver = (s.ver || 0) + 1; MIESC.sucio = true; escGuarda(); escBandeja(); pegRefresca(); }
function preparaPeg() {
  if (E('esc-pegar')) return;
  const d = document.createElement('div'); d.id = 'esc-pegar'; d.hidden = true;
  d.innerHTML = '<div class="esc-cab"><span id="peg-cuenta"></span><span id="peg-pista"></span></div><div class="esc-tira" id="peg-tira"></div>';
  E('esc-pintar').after(d);
}
function pegRefresca() {
  preparaPeg();
  const sala = escenarioSala(), tira = E('peg-tira'), viejo = tira.scrollLeft; tira.innerHTML = '';
  E('peg-cuenta').textContent = tr('{n} de {t} pegadas', { n: (sala.peg || []).length, t: ESC_PEG.MAX });
  E('peg-pista').textContent = ESC_PEG.quitar ? tr('Toca una pegatina para despegarla') : tr('Elige una y toca donde va');
  // QUITAR, la primera
  const q = document.createElement('button'); q.type = 'button'; q.className = 'esc-carta peg-quitar' + (ESC_PEG.quitar ? ' activa' : '');
  q.innerHTML = '<i></i><small></small>'; ponIcono(q.firstChild, 'quitar'); q.lastChild.textContent = tr('QUITAR');
  q.onclick = () => { ESC_PEG.quitar = !ESC_PEG.quitar; play('select'); pegRefresca(); }; tira.appendChild(q);
  const mias = pegMias().flatMap(pq => pq.peg);
  if (!ESC_PEG.sel && mias[0]) ESC_PEG.sel = mias[0].n;
  for (const p of mias) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'esc-carta r-comun' + (!ESC_PEG.quitar && ESC_PEG.sel === p.n ? ' activa' : '');
    const im = document.createElement('img'); im.src = pegImagen(p.n, 120); im.alt = ''; im.width = im.height = 60; b.appendChild(im);
    b.onclick = () => { ESC_PEG.sel = p.n; ESC_PEG.quitar = false; play('tick'); pegRefresca(); };
    tira.appendChild(b);
  }
  const mas = document.createElement('button'); mas.type = 'button'; mas.className = 'esc-carta mas';
  mas.innerHTML = '<i></i><small></small>'; ponIcono(mas.firstChild, 'bolsa'); mas.lastChild.textContent = tr('CONSEGUIR MÁS');
  mas.onclick = () => { play('select'); escGuarda(); MIESC.abierto = false; cancelAnimationFrame(MIESC.raf); E('esc-burbuja').hidden = true; abreArmario('pegatinas', 'escenario'); };
  tira.appendChild(mas); tira.scrollLeft = viejo;
}
