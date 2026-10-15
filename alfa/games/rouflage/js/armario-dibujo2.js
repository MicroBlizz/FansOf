// Fans of Rouflage · ARMARIO (dibujo, 2 de 2): los iconos de lo que no se lleva puesto en el cuerpo: bomba de humo, rastro del silbido,
// fantasma, efecto al congelarte, sello de despido, linterna, marco, título y gesto. Se añaden a ARD (armario-dibujo.js).
'use strict';
Object.assign(ARD, (() => {
  const { OL, T, forma, vestida, ICONOS } = ARD;
  function humo(c, w, colores) {   // la bomba con su nube
    const col = colores || ['#9aa3b8', '#c8cfdc'];
    for (let k = 0; k < 6; k++) { const a = k / 6 * T, x = w / 2 + Math.cos(a) * w * .2, y = w * .45 + Math.sin(a) * w * .16; c.beginPath(); c.arc(x, y, w * .17, 0, T); c.fillStyle = col[k % col.length]; c.fill(); }
    c.beginPath(); c.arc(w / 2, w * .45, w * .2, 0, T); c.fillStyle = col[0]; c.fill();
    c.beginPath(); c.arc(w / 2, w * .78, w * .11, 0, T); c.fillStyle = '#4a4f66'; c.fill(); c.lineWidth = w * .05; c.strokeStyle = OL; c.stroke();
  }
  function sabana(c, w, color = '#f4f1fa') {
    c.save(); c.translate(w / 2, w * .62); const e = w / 70; c.scale(e, e);
    c.beginPath(); c.moveTo(-14, 0); c.lineTo(-14, -14); c.arc(0, -14, 14, Math.PI, 0); c.lineTo(14, 0); for (let k = 0; k < 4; k++) c.quadraticCurveTo(14 - k * 7 - 3.5, 6 - (k % 2) * 4, 14 - (k + 1) * 7, 0); c.closePath();
    c.fillStyle = color; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
    c.fillStyle = OL; c.beginPath(); c.ellipse(-5, -15, 2, 2.8, 0, 0, T); c.ellipse(5, -15, 2, 2.8, 0, 0, T); c.fill(); c.restore();
  }
  function rastro(c, w, tipo) {
    c.lineWidth = w * .035; c.strokeStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(w * .2, w * .8, w * .55, -1.2, -.35); c.stroke(); c.beginPath(); c.arc(w * .2, w * .8, w * .4, -1.2, -.35); c.stroke();
    for (const [i, [x, y]] of [[.45, .55], [.62, .38], [.78, .24]].entries()) {
      c.save(); c.translate(w * x, w * y); const s = w * .11;
      if (tipo === 'notas') { forma(c, g => g.ellipse(0, s * .6, s * .45, s * .35, -.4, 0, T), ['#ffcb3d', '#ff6fb5', '#39d5e8'][i], w * .02); c.lineWidth = w * .03; c.strokeStyle = OL; c.beginPath(); c.moveTo(s * .4, s * .5); c.lineTo(s * .4, -s * .7); c.lineTo(s * .9, -s * .4); c.stroke(); }
      else if (tipo === 'pajaros') forma(c, g => { g.moveTo(-s, 0); g.lineTo(s, -s * .3); g.lineTo(0, s * .6); g.closePath(); }, '#f4f1fa', w * .02);
      else if (tipo === 'burbujas') { forma(c, g => g.arc(0, 0, s * (.5 + i * .15), 0, T), 'rgba(143,227,255,.5)', w * .02); c.fillStyle = '#fff'; c.beginPath(); c.arc(-s * .2, -s * .2, s * .12, 0, T); c.fill(); }
      else if (tipo === 'estrellas') { c.translate(-s, -s); ICONOS.xp(c, s * 2); }
      else if (tipo === 'zzz') { c.font = `${Math.round(s * 1.6)}px "Luckiest Guy", sans-serif`; c.textAlign = 'center'; c.lineWidth = w * .03; c.strokeStyle = OL; c.strokeText('Z', 0, s * .5); c.fillStyle = '#b48cff'; c.fillText('Z', 0, s * .5); }
      else if (tipo === 'arcoiris') { c.lineWidth = w * .04; ['#ff4b5c', '#ffcb3d', '#7ee04a', '#39d5e8'].forEach((col, k) => { c.strokeStyle = col; c.beginPath(); c.arc(0, s * .6, s * (1 - k * .2), Math.PI, 0); c.stroke(); }); }
      else if (tipo === 'monedas') { forma(c, g => g.arc(0, 0, s * .6, 0, T), '#ffcb3d', w * .02); c.fillStyle = '#b07b10'; c.font = `700 ${Math.round(s * .8)}px sans-serif`; c.textAlign = 'center'; c.fillText('M', 0, s * .3); }
      else if (tipo === 'chispas') { c.strokeStyle = '#ffe27a'; c.lineWidth = w * .03; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .4; c.beginPath(); c.moveTo(Math.cos(a) * s * .3, Math.sin(a) * s * .3); c.lineTo(Math.cos(a) * s, Math.sin(a) * s); c.stroke(); } }
      c.restore();
    }
  }
  function fantasma(c, w, tipo) {
    if (tipo === 'sabana') return sabana(c, w);
    if (tipo === 'dorado') return sabana(c, w, '#ffe27a');
    if (tipo === 'avion') {
      c.beginPath(); c.moveTo(w * .1, w * .5); c.lineTo(w * .9, w * .22); c.lineTo(w * .5, w * .82); c.lineTo(w * .44, w * .58); c.closePath(); c.fillStyle = '#f4f1fa'; c.fill(); c.lineWidth = w * .05; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke();
      c.beginPath(); c.moveTo(w * .44, w * .58); c.lineTo(w * .9, w * .22); c.stroke(); return;
    }
    if (tipo === 'galleta') {   // la galleta con cola de Casper (como en el juego)
      c.save(); c.translate(w / 2, w * .86); c.scale(w / 72, w / 72); c.globalAlpha = .9;
      const silu = g => { g.beginPath(); g.moveTo(-15, -26); g.arc(-17, -28, 4, 0, T); g.moveTo(19, -33); g.arc(17, -35, 4, 0, T);
        g.moveTo(-9, -32); g.bezierCurveTo(-3, -34, 3, -34, 9, -32); g.bezierCurveTo(13.5, -24, 14, -14, 11, -7); g.bezierCurveTo(8, -1, 4, 3, -1, 6); g.bezierCurveTo(-5, 9, -9, 7, -6, 3); g.bezierCurveTo(-6, 1, -10, 2, -11, -6); g.bezierCurveTo(-14, -14, -13.5, -24, -9, -32); g.closePath();
        g.moveTo(11.5, -41.5); g.arc(0, -41.5, 11.5, 0, T); g.closePath(); };
      c.lineWidth = 5; c.strokeStyle = OL; c.lineJoin = 'round'; silu(c); c.stroke(); c.lineWidth = 8; c.beginPath(); c.moveTo(-10, -27); c.lineTo(-17, -28); c.moveTo(10, -28); c.lineTo(17, -35); c.stroke();
      c.fillStyle = '#f4f1fa'; silu(c); c.fill(); c.strokeStyle = '#f4f1fa'; c.lineWidth = 6; c.beginPath(); c.moveTo(-10, -27); c.lineTo(-17, -28); c.moveTo(10, -28); c.lineTo(17, -35); c.stroke();
      c.fillStyle = OL; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(2 + s * 4.4, -42, 1.9, 2.5, 0, 0, T); c.fill(); } c.beginPath(); c.ellipse(2, -37, 1.5, 2, 0, 0, T); c.fill();
      c.restore(); return;
    }
    if (tipo === 'caja') { forma(c, g => g.rect(w * .22, w * .35, w * .56, w * .45), '#b98a4f', w * .04); forma(c, g => { g.moveTo(w * .22, w * .35); g.lineTo(w * .12, w * .22); g.lineTo(w * .42, w * .22); g.lineTo(w * .5, w * .35); }, '#c99a62', w * .04); c.fillStyle = OL; c.beginPath(); c.ellipse(w * .4, w * .55, w * .03, w * .045, 0, 0, T); c.ellipse(w * .6, w * .55, w * .03, w * .045, 0, 0, T); c.fill(); return; }
    if (tipo === 'bola') { forma(c, g => { for (let k = 0; k < 12; k++) { const a = k / 12 * T, r = w * (.3 + (k % 2) * .06); g.lineTo(w / 2 + Math.cos(a) * r, w * .52 + Math.sin(a) * r); } g.closePath(); }, '#ece6d8', w * .04); c.strokeStyle = 'rgba(32,16,44,.35)'; c.lineWidth = w * .02; c.beginPath(); c.moveTo(w * .35, w * .45); c.lineTo(w * .55, w * .58); c.lineTo(w * .62, w * .4); c.stroke(); return; }
    if (tipo === 'globo') { c.strokeStyle = OL; c.lineWidth = w * .02; c.beginPath(); c.moveTo(w / 2, w * .66); c.quadraticCurveTo(w * .55, w * .8, w * .48, w * .95); c.stroke(); forma(c, g => g.ellipse(w / 2, w * .4, w * .24, w * .28, 0, 0, T), '#ff6fb5', w * .04); c.fillStyle = OL; c.beginPath(); c.ellipse(w * .43, w * .38, w * .025, w * .04, 0, 0, T); c.ellipse(w * .57, w * .38, w * .025, w * .04, 0, 0, T); c.fill(); return; }
    if (tipo === 'nube') { forma(c, g => { g.arc(w * .35, w * .5, w * .16, Math.PI * .5, Math.PI * 1.5); g.arc(w * .5, w * .38, w * .18, Math.PI, 0); g.arc(w * .66, w * .5, w * .16, Math.PI * 1.5, Math.PI * .5); g.closePath(); }, '#e8eefc', w * .04); c.fillStyle = OL; c.beginPath(); c.ellipse(w * .44, w * .48, w * .025, w * .04, 0, 0, T); c.ellipse(w * .58, w * .48, w * .025, w * .04, 0, 0, T); c.fill(); return; }
    if (tipo === 'polaroid') { forma(c, g => g.rect(w * .22, w * .16, w * .56, w * .68), '#fff', w * .04); c.fillStyle = '#39275e'; c.fillRect(w * .28, w * .22, w * .44, w * .44); c.save(); c.translate(w * .28, w * .2); sabana(c, w * .44); c.restore(); c.fillStyle = OL; c.font = `${Math.round(w * .07)}px "Luckiest Guy", sans-serif`; c.textAlign = 'center'; c.fillText(tr('ADIÓS'), w / 2, w * .78); return; }
    sabana(c, w);
  }
  function congelar(c, w, tipo) {
    vestida(c, w, w, {});
    c.save(); c.globalAlpha = .9;
    if (tipo === 'destello') { c.strokeStyle = '#fff'; c.lineWidth = w * .03; for (let k = 0; k < 8; k++) { const a = k / 8 * T; c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * w * .2, w * .45 + Math.sin(a) * w * .2); c.lineTo(w / 2 + Math.cos(a) * w * .42, w * .45 + Math.sin(a) * w * .42); c.stroke(); } }
    else if (tipo === 'escarcha') { c.strokeStyle = '#8fe3ff'; c.lineWidth = w * .025; for (const [x, y] of [[.3, .3], [.72, .5], [.4, .75]]) for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; c.beginPath(); c.moveTo(w * x - Math.cos(a) * w * .07, w * y - Math.sin(a) * w * .07); c.lineTo(w * x + Math.cos(a) * w * .07, w * y + Math.sin(a) * w * .07); c.stroke(); } }
    else if (tipo === 'pegatina') forma(c, g => { g.moveTo(w * .62, w * .2); g.lineTo(w * .8, w * .2); g.lineTo(w * .62, w * .38); g.closePath(); }, '#e0dbe8', w * .02);
    else if (tipo === 'confeti') for (let k = 0; k < 18; k++) { c.fillStyle = ['#ff4b5c', '#ffcb3d', '#7ee04a', '#39d5e8'][k % 4]; c.save(); c.translate(w * (.15 + (k * .37) % .7), w * (.1 + (k * .53) % .8)); c.rotate(k); c.fillRect(-w * .02, -w * .01, w * .04, w * .02); c.restore(); }
    else if (tipo === 'flash') { c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(w / 2, w * .45, w * .42, 0, T); c.fill(); }
    else if (tipo === 'tinta') { c.fillStyle = 'rgba(57,40,94,.7)'; for (let k = 0; k < 7; k++) { c.beginPath(); c.arc(w * (.25 + (k * .41) % .5), w * (.2 + (k * .29) % .7), w * (.04 + (k % 3) * .02), 0, T); c.fill(); } }
    c.restore();
  }
  function sello(c, w, tipo) {
    if (tipo === 'grapa') { forma(c, g => g.rect(w * .25, w * .35, w * .5, w * .4), '#fff', w * .03); c.lineWidth = w * .05; c.strokeStyle = '#9aa3b8'; c.beginPath(); c.moveTo(w * .35, w * .3); c.lineTo(w * .35, w * .4); c.lineTo(w * .65, w * .4); c.lineTo(w * .65, w * .3); c.stroke(); return; }
    if (tipo === 'firma') { c.strokeStyle = '#2e8bff'; c.lineWidth = w * .03; c.lineCap = 'round'; c.beginPath(); c.moveTo(w * .15, w * .6); c.bezierCurveTo(w * .3, w * .2, w * .35, w * .8, w * .5, w * .45); c.bezierCurveTo(w * .6, w * .3, w * .7, w * .7, w * .85, w * .4); c.stroke(); return; }
    if (tipo === 'huella') { c.fillStyle = 'rgba(255,75,92,.85)'; c.beginPath(); c.ellipse(w / 2, w * .58, w * .14, w * .12, 0, 0, T); c.fill(); for (const [x, y] of [[.36, .4], [.46, .34], [.56, .34], [.66, .4]]) { c.beginPath(); c.arc(w * x, w * y, w * .05, 0, T); c.fill(); } return; }
    const col = { rojo: '#ff4b5c', oro: '#ffcb3d', azul: '#2e8bff', verde: '#7ee04a' }[tipo] || '#ff4b5c';
    c.save(); c.translate(w / 2, w / 2); c.rotate(-.18);
    c.strokeStyle = col; c.lineWidth = w * .04; c.beginPath(); c.roundRect(-w * .42, -w * .14, w * .84, w * .28, w * .04); c.stroke();
    c.lineWidth = w * .015; c.beginPath(); c.roundRect(-w * .38, -w * .1, w * .76, w * .2, w * .02); c.stroke();
    c.fillStyle = col; c.font = `${Math.round(w * .13)}px "Luckiest Guy", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(tr(tipo === 'oro' ? 'ASCENDIDO' : 'DESPEDIDO'), 0, w * .01, w * .74);
    c.restore();
  }
  function linterna(c, w, col, borde) {
    c.fillStyle = '#120b22'; c.beginPath(); c.roundRect(0, 0, w, w, w * .12); c.fill();
    const g = c.createRadialGradient(w * .2, w * .7, 2, w * .2, w * .7, w * .9); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(w * .2, w * .7); c.lineTo(w * .95, w * .15); c.lineTo(w * .98, w * .65); c.closePath(); c.fill();
    if (borde === 'puntos') c.setLineDash([w * .03, w * .03]);
    if (borde) { c.strokeStyle = col; c.lineWidth = w * .02; c.beginPath(); c.moveTo(w * .2, w * .7); c.lineTo(w * .95, w * .15); c.moveTo(w * .2, w * .7); c.lineTo(w * .98, w * .65); c.stroke(); c.setLineDash([]); }
    if (borde === 'estrellas') for (let k = 1; k < 4; k++) { c.save(); c.translate(w * (.2 + k * .2) - w * .05, w * (.7 - k * .14) - w * .05); ICONOS.xp(c, w * .1); c.restore(); }
    forma(c, gg => gg.roundRect(w * .08, w * .64, w * .16, w * .1, w * .02), '#3d4063', w * .02);
  }
  const COLOR_MARCO = { madera: '#b98a4f', oro: '#ffcb3d', neon: '#39d5e8', cinta: '#f4e6a0', pixel: '#7ee04a', corcho: '#c99a62' };
  // el marco alrededor de lo que haya dentro (dibuja: la galleta del jugador en el perfil; si no, una galleta de siempre)
  function marco(c, w, tipo, dibuja, h = w) {
    const col = COLOR_MARCO[tipo] || COLOR_MARCO.madera;
    if (dibuja) dibuja(c, w, h); else vestida(c, w, h * .9, { esc: w / 100, cara: true });
    c.lineWidth = w * .07; c.strokeStyle = OL; c.strokeRect(w * .1, h * .08, w * .8, h * .84); c.lineWidth = w * .045; c.strokeStyle = col; c.strokeRect(w * .1, h * .08, w * .8, h * .84);
    if (tipo === 'neon') { c.shadowColor = col; c.shadowBlur = w * .08; c.strokeRect(w * .1, h * .08, w * .8, h * .84); c.shadowBlur = 0; }
    if (tipo === 'cinta') { c.fillStyle = 'rgba(244,230,160,.85)'; for (const [x, r] of [[.18, -.6], [.82, .6]]) { c.save(); c.translate(w * x, h * .1); c.rotate(r); c.fillRect(-w * .1, -w * .03, w * .2, w * .06); c.restore(); } }
    if (tipo === 'corcho') for (const [x, y] of [[.1, .08], [.9, .08]]) forma(c, g => g.arc(w * x, h * y, w * .04, 0, T), '#ff4b5c', w * .015);
    if (tipo === 'pixel') { c.fillStyle = OL; for (const [x, y] of [[.1, .08], [.9, .08], [.1, .92], [.9, .92]]) c.fillRect(w * x - w * .04, h * y - w * .04, w * .08, w * .08); }
  }
  function titulo(c, w, txt, col) {
    c.fillStyle = '#160d28'; c.beginPath(); c.roundRect(w * .04, w * .36, w * .92, w * .28, w * .08); c.fill(); c.lineWidth = w * .03; c.strokeStyle = col; c.stroke();
    c.fillStyle = col; c.font = `${Math.round(w * .11)}px "Luckiest Guy", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(tr(txt), w / 2, w * .51, w * .84);
  }
  function gesto(c, w, tipo) {
    vestida(c, w, w, { cara: true });
    c.save(); c.translate(w / 2, w * .96); c.scale(w / 74, w / 74);
    const extra = {
      baile: () => { for (const s of [-1, 1]) { c.save(); c.translate(s * 22 - 4, -54); ICONOS.xp(c, 8); c.restore(); } },
      reverencia: () => forma(c, g => g.arc(0, -66, 4, 0, T), '#ffcb3d', 1.5),
      risa: () => { c.font = '10px "Luckiest Guy", sans-serif'; c.fillStyle = '#ffcb3d'; c.fillText('JA', 14, -56); c.fillText('JA', -26, -50); },
      llorar: () => { c.fillStyle = '#8fe3ff'; c.beginPath(); c.ellipse(-3, -36, 1.4, 2.4, 0, 0, T); c.ellipse(8, -36, 1.4, 2.4, 0, 0, T); c.fill(); },
      selfie: () => forma(c, g => g.roundRect(14, -48, 8, 13, 2), '#3d4063', 1.5),
      cafe: () => { forma(c, g => g.rect(13, -26, 8, 9), '#fff', 1.5); c.strokeStyle = '#c3cbe0'; c.lineWidth = 1; c.beginPath(); c.moveTo(16, -28); c.quadraticCurveTo(18, -32, 16, -35); c.stroke(); },
      saludo: () => { c.font = '9px "Luckiest Guy", sans-serif'; c.fillStyle = '#fff6ea'; c.textAlign = 'center'; c.fillText(tr('¡HOLA!'), 14, -62); },
      dormir: () => { c.font = '10px "Luckiest Guy", sans-serif'; c.fillStyle = '#b48cff'; c.fillText('Z', 14, -56); c.fillText('z', 20, -64); },
    };
    if (extra[tipo]) extra[tipo]();
    c.restore();
  }
  return { humo, rastro, fantasma, congelar, sello, linterna, marco, titulo, gesto, COLOR_MARCO };
})());
