// Fans of Rouflage · ARMARIO (dibujo, 2 de 2): los iconos de lo que no va en el cuerpo: bomba de humo, rastro del silbido, fantasma,
// efecto al congelarte, sello de despido, linterna, marco, título y gesto. Mismas ayudas que armario-dibujo.js (se añaden a ARD).
// Cada dibujo recibe (c, w): un cuadrado de w×w.
'use strict';
Object.assign(ARD, (() => {
  const { OL, T, shape, el, rr, poly, line, dot, starPath, otxt, vestida, cara, traza } = ARD;
  function humo(c, w, colores) {   // la bomba con su nube, al estilo de los hechizos del Rumble
    const col = colores || ['#9aa3b8', '#c8cfdc'];
    c.save(); c.translate(w / 2, w / 2); c.scale(w / 100, w / 100);
    for (const [i, [x, y, r]] of [[-16, -6, 13], [14, -8, 12], [0, -18, 14], [-6, 4, 12], [10, 6, 11]].entries()) shape(c, el(x, y, r, r * 0.9), col[i % col.length], 2.4);
    shape(c, el(0, 30, 9, 7), '#3d4063', 2.4); shape(c, rr(-3, 20, 6, 5, 1.5), '#9aa3b8', 1.6);
    c.restore();
  }
  function sabana(c, w, color = '#f4f1fa') {
    c.save(); c.translate(w / 2, w * .62); const e = w / 70; c.scale(e, e);
    shape(c, g => { g.moveTo(-14, 0); g.lineTo(-14, -14); g.arc(0, -14, 14, Math.PI, 0); g.lineTo(14, 0); for (let k = 0; k < 4; k++) g.quadraticCurveTo(14 - k * 7 - 3.5, 6 - (k % 2) * 4, 14 - (k + 1) * 7, 0); g.closePath(); }, color, 3);
    shape(c, el(-5, -15, 2, 2.8), OL, 0); shape(c, el(5, -15, 2, 2.8), OL, 0); c.restore();
  }
  function rastro(c, w, tipo) {
    c.lineWidth = w * .035; c.strokeStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(w * .2, w * .8, w * .55, -1.2, -.35); c.stroke(); c.beginPath(); c.arc(w * .2, w * .8, w * .4, -1.2, -.35); c.stroke();
    for (const [i, [x, y]] of [[.45, .55], [.62, .38], [.78, .24]].entries()) {
      c.save(); c.translate(w * x, w * y); const s = w * .11;
      if (tipo === 'ondas') shape(c, el(0, 0, s * .4, s * .4), '#ffcb3d', w * .02);
      else if (tipo === 'notas') { shape(c, el(0, s * .6, s * .45, s * .35, -.4), ['#ffcb3d', '#ff6fb5', '#39d5e8'][i], w * .02); line(c, [s * .4, s * .5, s * .4, -s * .7, s * .9, -s * .4], OL, w * .03); }
      else if (tipo === 'pajaros') shape(c, poly(-s, 0, s, -s * .3, 0, s * .6), '#f4f1fa', w * .02);
      else if (tipo === 'burbujas') { shape(c, el(0, 0, s * (.5 + i * .15), s * (.5 + i * .15)), 'rgba(143,227,255,.5)', w * .02); dot(c, -s * .2, -s * .2, s * .12, '#fff'); }
      else if (tipo === 'estrellas') shape(c, g => starPath(g, 0, 0, s * .9, s * .4), '#ffcb3d', w * .02);
      else if (tipo === 'zzz') otxt(c, 'Z', 0, 0, s * 1.8, '#b48cff');
      else if (tipo === 'arcoiris') { c.lineWidth = w * .04; ['#ff4b5c', '#ffcb3d', '#7ee04a', '#39d5e8'].forEach((col, k) => { c.strokeStyle = col; c.beginPath(); c.arc(0, s * .6, s * (1 - k * .2), Math.PI, 0); c.stroke(); }); }
      else if (tipo === 'bellotas') { shape(c, el(0, s * .3, s * .5, s * .56), '#9a6a33', w * .016); shape(c, el(0, -s * .16, s * .6, s * .28), '#5b3a1c', w * .016); line(c, [0, -s * .44, s * .14, -s * .7], OL, w * .014); }
      else if (tipo === 'chispas') { for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .4; line(c, [Math.cos(a) * s * .3, Math.sin(a) * s * .3, Math.cos(a) * s, Math.sin(a) * s], '#ffe27a', w * .03); } }
      c.restore();
    }
  }
  function fantasma(c, w, tipo) {
    if (tipo === 'sabana') return sabana(c, w);
    if (tipo === 'dorado') return sabana(c, w, '#ffe27a');
    if (tipo === 'avion') { shape(c, poly(w * .1, w * .5, w * .9, w * .22, w * .5, w * .82, w * .44, w * .58), '#f4f1fa', w * .05); line(c, [w * .44, w * .58, w * .9, w * .22], OL, w * .05); return; }
    if (tipo === 'galleta') {   // la galleta con cola de Casper (espectador.js)
      c.save(); c.translate(w / 2, w * .95); c.scale(w / 72, w / 72); c.globalAlpha = .92;
      const s = g => { g.beginPath(); g.moveTo(-9, -32); g.bezierCurveTo(-3, -34, 3, -34, 9, -32); g.bezierCurveTo(13.5, -24, 14, -14, 11, -7); g.bezierCurveTo(8, -1, 4, 3, -1, 6); g.bezierCurveTo(-5, 9, -9, 7, -6, 3); g.bezierCurveTo(-6, 1, -10, 2, -11, -6); g.bezierCurveTo(-14, -14, -13.5, -24, -9, -32); g.closePath(); g.moveTo(11.5, -41.5); g.arc(0, -41.5, 11.5, 0, T); g.closePath(); };
      c.lineWidth = 6; c.strokeStyle = OL; c.lineJoin = 'round'; s(c); c.stroke(); line(c, [-10, -27, -18, -30], OL, 9); line(c, [10, -28, 18, -36], OL, 9);
      c.fillStyle = '#f4f1fa'; s(c); c.fill(); line(c, [-10, -27, -18, -30], '#f4f1fa', 5.5); line(c, [10, -28, 18, -36], '#f4f1fa', 5.5);
      cara(c); c.restore(); return;
    }
    if (tipo === 'caja') { shape(c, rr(w * .22, w * .35, w * .56, w * .45, 1), '#b98a4f', w * .04); shape(c, poly(w * .22, w * .35, w * .12, w * .22, w * .42, w * .22, w * .5, w * .35), '#c99a62', w * .04); shape(c, el(w * .4, w * .55, w * .03, w * .045), OL, 0); shape(c, el(w * .6, w * .55, w * .03, w * .045), OL, 0); return; }
    if (tipo === 'bola') { shape(c, g => { for (let k = 0; k < 12; k++) { const a = k / 12 * T, r = w * (.3 + (k % 2) * .06); g.lineTo(w / 2 + Math.cos(a) * r, w * .52 + Math.sin(a) * r); } g.closePath(); }, '#ece6d8', w * .04); line(c, [w * .35, w * .45, w * .55, w * .58, w * .62, w * .4], 'rgba(32,16,44,.35)', w * .02); return; }
    if (tipo === 'globo') { line(c, [w / 2, w * .66, w * .48, w * .95], OL, w * .02); shape(c, el(w / 2, w * .4, w * .24, w * .28), '#ff6fb5', w * .04); shape(c, el(w * .43, w * .38, w * .025, w * .04), OL, 0); shape(c, el(w * .57, w * .38, w * .025, w * .04), OL, 0); return; }
    if (tipo === 'nube') { shape(c, g => { g.arc(w * .35, w * .5, w * .16, Math.PI * .5, Math.PI * 1.5); g.arc(w * .5, w * .38, w * .18, Math.PI, 0); g.arc(w * .66, w * .5, w * .16, Math.PI * 1.5, Math.PI * .5); g.closePath(); }, '#e8eefc', w * .04); shape(c, el(w * .44, w * .48, w * .025, w * .04), OL, 0); shape(c, el(w * .58, w * .48, w * .025, w * .04), OL, 0); return; }
    if (tipo === 'polaroid') { shape(c, rr(w * .22, w * .16, w * .56, w * .68, 1), '#fff', w * .04); c.fillStyle = '#39275e'; c.fillRect(w * .28, w * .22, w * .44, w * .44); c.save(); c.translate(w * .28, w * .2); sabana(c, w * .44); c.restore(); otxt(c, tr('ADIÓS'), w / 2, w * .76, w * .08, '#fff6ea'); return; }
    sabana(c, w);
  }
  function congelar(c, w, tipo) {
    vestida(c, w, w, { sinCara: true });
    c.save(); c.globalAlpha = .9;
    if (tipo === 'destello') for (let k = 0; k < 8; k++) { const a = k / 8 * T; line(c, [w / 2 + Math.cos(a) * w * .2, w * .45 + Math.sin(a) * w * .2, w / 2 + Math.cos(a) * w * .42, w * .45 + Math.sin(a) * w * .42], '#fff', w * .03); }
    else if (tipo === 'escarcha') for (const [x, y] of [[.3, .3], [.72, .5], [.4, .75]]) for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; line(c, [w * x - Math.cos(a) * w * .07, w * y - Math.sin(a) * w * .07, w * x + Math.cos(a) * w * .07, w * y + Math.sin(a) * w * .07], '#8fe3ff', w * .025); }
    else if (tipo === 'pegatina') shape(c, poly(w * .62, w * .2, w * .8, w * .2, w * .62, w * .38), '#e0dbe8', w * .02);
    else if (tipo === 'confeti') for (let k = 0; k < 18; k++) { c.save(); c.translate(w * (.15 + (k * .37) % .7), w * (.1 + (k * .53) % .8)); c.rotate(k); shape(c, rr(-w * .025, -w * .012, w * .05, w * .024, 1), ['#ff4b5c', '#ffcb3d', '#7ee04a', '#39d5e8'][k % 4], w * .008); c.restore(); }
    else if (tipo === 'flash') { c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(w / 2, w * .45, w * .42, 0, T); c.fill(); }
    else if (tipo === 'tinta') for (let k = 0; k < 7; k++) dot(c, w * (.25 + (k * .41) % .5), w * (.2 + (k * .29) % .7), w * (.04 + (k % 3) * .02), 'rgba(57,40,94,.7)');
    c.restore();
  }
  function sello(c, w, tipo) {
    if (tipo === 'grapa') { shape(c, rr(w * .25, w * .35, w * .5, w * .4, 1), '#fff', w * .03); line(c, [w * .35, w * .3, w * .35, w * .4, w * .65, w * .4, w * .65, w * .3], '#9aa3b8', w * .05); return; }
    if (tipo === 'firma') { c.beginPath(); c.moveTo(w * .15, w * .6); c.bezierCurveTo(w * .3, w * .2, w * .35, w * .8, w * .5, w * .45); c.bezierCurveTo(w * .6, w * .3, w * .7, w * .7, w * .85, w * .4); c.strokeStyle = '#2e8bff'; c.lineWidth = w * .03; c.lineCap = 'round'; c.stroke(); return; }
    if (tipo === 'huella') { shape(c, el(w / 2, w * .58, w * .14, w * .12), 'rgba(255,75,92,.85)', 0); for (const [x, y] of [[.36, .4], [.46, .34], [.56, .34], [.66, .4]]) dot(c, w * x, w * y, w * .05, 'rgba(255,75,92,.85)'); return; }
    const col = { rojo: '#ff4b5c', oro: '#ffcb3d', azul: '#2e8bff', verde: '#7ee04a' }[tipo] || '#ff4b5c';
    c.save(); c.translate(w / 2, w / 2); c.rotate(-.18); c.scale(w / 100, w / 100);
    shape(c, rr(-46, -17, 92, 34, 5), col + '22', 3.6); c.strokeStyle = col; c.lineWidth = 2.6; c.strokeRect(-42, -13, 84, 26);
    otxt(c, tr(tipo === 'oro' ? 'ASCENDIDO' : 'DESPEDIDO'), 0, 1, 15, col, 78);
    c.restore();
  }
  function linterna(c, w, col, borde) {
    c.save(); c.scale(w / 100, w / 100);
    shape(c, rr(2, 2, 96, 96, 12), '#120b22', 3);
    const g = c.createRadialGradient(20, 70, 2, 20, 70, 90); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(20, 70); c.lineTo(95, 15); c.lineTo(98, 65); c.closePath(); c.fill();
    if (borde === 'puntos') c.setLineDash([3, 3]);
    if (borde) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(20, 70); c.lineTo(95, 15); c.moveTo(20, 70); c.lineTo(98, 65); c.stroke(); c.setLineDash([]); }
    if (borde === 'estrellas') for (let k = 1; k < 4; k++) shape(c, gg => starPath(gg, 20 + k * 20, 70 - k * 14, 5, 2.2), '#ffcb3d', 1);
    c.save(); c.translate(20, 72); c.rotate(-0.55); shape(c, rr(-10, -5, 20, 10, 3), '#3d4063', 2); shape(c, rr(8, -7, 6, 14, 2), col.replace(/^rgba\(/, 'rgb(').replace(/,[^,]*\)$/, ')'), 2); c.restore();
    c.restore();
  }
  const COLOR_MARCO = { madera: '#b98a4f', oro: '#ffcb3d', neon: '#39d5e8', cinta: '#f4e6a0', pixel: '#7ee04a', corcho: '#c99a62' };
  // el marco: `dibuja(c, w, h)` pinta lo de dentro (la galleta del perfil); si no, una galleta de siempre
  function marco(c, w, tipo, dibuja, h = w) {
    const col = COLOR_MARCO[tipo] || COLOR_MARCO.madera, x = w * .1, y = h * .08, mw = w * .8, mh = h * .84, b = w * .055;
    shape(c, rr(x - b, y - b, mw + 2 * b, mh + 2 * b, w * .05), col, w * .03);
    if (tipo === 'corcho') for (let k = 0; k < 60; k++) dot(c, x - b + (k * 37.3) % (mw + 2 * b), y - b + (k * 53.7) % (mh + 2 * b), w * .012, 'rgba(90,50,10,.3)');
    if (tipo === 'madera') for (let k = 0; k < 4; k++) line(c, [x - b + 2, y + mh * (.1 + k * .25), x - b + 2, y + mh * (.2 + k * .25)], 'rgba(90,50,10,.35)', w * .012);
    shape(c, rr(x, y, mw, mh, w * .02), '#2a1746', w * .025);
    c.save(); c.beginPath(); c.rect(x, y, mw, mh); c.clip(); if (dibuja) dibuja(c, w, h); else vestida(c, w, h * .9, { esc: w / 100 }); c.restore();
    if (tipo === 'neon') { c.save(); c.shadowColor = col; c.shadowBlur = w * .08; c.lineWidth = w * .03; c.strokeStyle = col; c.strokeRect(x, y, mw, mh); c.restore(); }
    if (tipo === 'cinta') for (const [cx, r] of [[x, -.7], [x + mw, .7]]) { c.save(); c.translate(cx, y); c.rotate(r); shape(c, rr(-w * .12, -w * .035, w * .24, w * .07, 1), 'rgba(244,230,160,.85)', w * .012); c.restore(); }
    if (tipo === 'corcho') for (const [cx, cy] of [[x, y], [x + mw, y]]) { dot(c, cx, cy, w * .045, OL); dot(c, cx, cy, w * .032, '#ff4b5c'); dot(c, cx - w * .01, cy - w * .01, w * .01, '#fff'); }
    if (tipo === 'pixel') { c.fillStyle = OL; for (const [cx, cy] of [[x, y], [x + mw, y], [x, y + mh], [x + mw, y + mh]]) c.fillRect(cx - w * .04, cy - w * .04, w * .08, w * .08); }
    if (tipo === 'oro') for (const [cx, cy] of [[x, y], [x + mw, y], [x, y + mh], [x + mw, y + mh]]) shape(c, g => starPath(g, cx, cy, w * .05, w * .022, 4), '#fff7d6', w * .012);
  }
  function titulo(c, w, txt, col) { shape(c, rr(w * .03, w * .32, w * .94, w * .36, w * .1), '#160d28', w * .032); c.lineWidth = w * .016; c.strokeStyle = col; c.beginPath(); c.roundRect(w * .07, w * .36, w * .86, w * .28, w * .08); c.stroke(); otxt(c, tr(txt), w / 2, w * .51, w * .13, col, w * .8); }
  function gesto(c, w, tipo) {
    vestida(c, w, w, { esc: w / 84 });
    c.save(); c.translate(w / 2, w * .95); c.scale(w / 84, w / 84);
    const extra = {
      saludo: () => otxt(c, tr('¡HOLA!'), 16, -64, 9, '#fff6ea'),
      baile: () => { for (const s of [-1, 1]) shape(c, g => starPath(g, s * 22 - 2, -50, 4.5, 2), '#ffcb3d', 1.2); },
      reverencia: () => shape(c, el(0, -66, 4, 4), '#ffcb3d', 1.5),
      risa: () => { otxt(c, 'JA', 18, -56, 9, '#ffcb3d'); otxt(c, 'JA', -20, -50, 9, '#ffcb3d'); },
      llorar: () => { shape(c, el(-3, -36, 1.4, 2.4), '#8fe3ff', 0); shape(c, el(8, -36, 1.4, 2.4), '#8fe3ff', 0); },
      selfie: () => { shape(c, rr(14, -48, 8, 13, 2), '#3d4063', 1.5); dot(c, 18, -45, 1.2, '#39d5e8'); },
      cafe: () => { shape(c, rr(13, -26, 8, 9, 1.5), '#fff', 1.5); c.beginPath(); c.moveTo(16, -28); c.quadraticCurveTo(18, -32, 16, -35); c.strokeStyle = '#c3cbe0'; c.lineWidth = 1; c.stroke(); },
      dormir: () => { otxt(c, 'Z', 16, -56, 9, '#b48cff'); otxt(c, 'z', 22, -64, 7, '#b48cff'); },
    };
    if (extra[tipo]) extra[tipo](); c.restore();
  }
  return { humo, rastro, fantasma, congelar, sello, linterna, marco, titulo, gesto, COLOR_MARCO };
})());
