// Fans Of Paperwork · adaptador · EFECTOS: lo que se ve pasar encima de la escena y no es del juego: números que saltan, papeles que vuelan al
// vaciar un archivador, los sellos («CONFIDENCIAL», «¡URGENTE!»), carteles («Planta −12», «¡Nivel 20!»), temblor y destellos. Traduce los
// sucesos del motor y de las órdenes en efectos con su vida corta. La escena los pinta con pinta(ctx, t); t es el de los fotogramas (segundos).
'use strict';
PW.efectos = (() => {
  const R = PW.REJILLA, numeros = [], papeles = [], carteles = [], vistazos = {};
  let temblor = 0, destello = 0, ahora = 0;

  const centro = i => ({ x: R.x + (i % R.cols) * R.paso + R.lado / 2, y: R.y + Math.floor(i / R.cols) * R.paso + R.lado / 2 });
  function numero(x, y, txt, color, grande = false) {
    if (numeros.length > 40) numeros.shift();
    numeros.push({ x: x + (Math.random() - 0.5) * 30, y, txt, color, grande, t0: ahora });
  }
  // las hojas que salen volando del archivador i: la mitad blancas y la mitad del color de su documento
  function papelesDe(i, color, n = 10) {
    const c = centro(i);
    for (let k = 0; k < n; k++) papeles.push({ x: c.x, y: c.y, vx: (Math.random() - 0.5) * 340, vy: -Math.random() * 300 - 60, color: k % 2 ? color : '#fff6ea', t0: ahora, r: 6 + Math.random() * 5, giro: Math.random() * 6 });
    if (papeles.length > 160) papeles.splice(0, papeles.length - 160);
  }
  function cartel(txt, color = '#ffd23f', dura = 1.6, sub = '') {
    carteles.push({ txt, sub, color, t0: ahora, dura });
    if (carteles.length > 3) carteles.shift();
  }
  // el sello de un archivador vaciado: su texto y su color (el papel normal no dice nada)
  const SELLO = { confidencial: ['CONFIDENCIAL', '#ff4d5e'], secreto: ['ALTO SECRETO', '#ff4d8d'], urgente: ['¡URGENTE!', '#ff9a3c'], caducado: ['Caducado', '#9aa0a8'] };
  const PLANTA = { normal: ['#ffffff', ''], jefe: ['#ffd23f', '¡El archivo del jefe!'], ceo: ['#ff7ef9', '¡El archivo del CEO!'] };
  function vacio(s) {
    const c = centro(s.i), D = PW.DOCUMENTOS[s.m], sello = SELLO[s.sello];
    papelesDe(s.i, D.color);
    if (sello) numero(c.x, c.y - 14, tr(sello[0]), sello[1], s.sello !== 'caducado');
    if (s.n > 1) numero(c.x, c.y + 12, '+' + PW.txt.num(s.n), D.color);
  }
  // cada suceso, su efecto (los que no salen aquí no se ven)
  const POR_SUCESO = {
    vistazo: s => { const c = centro(s.i); vistazos[s.i] = ahora; numero(c.x, c.y - 20, PW.txt.num(Math.max(1, s.d)), s.duro ? '#9aa0a8' : '#ffffff'); },
    trabaja: s => { vistazos[s.i] = ahora; },
    vacio,
    planta: s => cartel(tr('Planta −{n}', { n: s.n }), PLANTA[s.especial][0], 1.2, tr(PLANTA[s.especial][1])),
    nivel: s => cartel(tr('¡Nivel {n}!', { n: s.n }), '#7ef9ff', 1.2),
    estanteria: () => { temblor = 0.5; destello = 0.35; },
    clasificado: s => numero(R.x + R.ancho / 2, R.y - 10, tr('Clasificado x{n}', { n: s.multi }), '#3ddc84'),
    'urgente-tarde': () => numero(R.x + R.ancho / 2, R.y - 10, tr('Se pasó el plazo'), '#9aa0a8'),
    especialidad: s => cartel(tr('Especialidad en {m}: rango {r}', { m: tr(PW.DOCUMENTOS[s.m].nombre), r: s.rango }), '#b06bff', 2),
    trituradora: s => { temblor = 1; destello = 0.6; cartel(tr('¡Trituradora atascada!'), '#ff4d5e', 3, tr('{lider} se une al equipo', { lider: PW.FACCIONES[Math.min(s.nivel, PW.FACCIONES.length - 1)].lider })); },
    'intento-fin': s => cartel(tr('Intento terminado'), '#ffffff', 2, tr('{p} de la Trituradora atascada', { p: PW.txt.pct(s.parte) })),
    'pedido-ok': s => cartel(tr('¡Pedido cumplido!'), '#3ddc84', 2.2, tr('{n} de oro y un cofre', { n: PW.txt.num(s.oro) })),
    'pedido-mal': s => cartel(tr('Pedido sin cumplir'), '#ff4d5e', 2.4, tr('Sanción: {p} menos en tu próximo Despido', { p: PW.txt.pct(s.sancion) })),
    requisa: s => cartel(tr('IAhorro se lleva {n} archivadores', { n: s.n }), '#9aa0a8', 2.2),
    despido: s => cartel(tr('¡DESPEDIDOS!'), '#ff4d5e', 2.5, tr('Indemnización: {n}', { n: PW.txt.num(s.cobra) })),
  };
  function sucesos(lista, t) {
    ahora = t;
    for (const s of lista) if (POR_SUCESO[s.t]) POR_SUCESO[s.t](s);
  }
  // cuánto hace que alguien rebuscó en el archivador i (para sacudirlo)
  const rebuscado = i => (vistazos[i] === undefined ? 9 : ahora - vistazos[i]);

  function pintaPapeles(ctx, t) {
    for (let k = papeles.length - 1; k >= 0; k--) {
      const a = papeles[k], dt = t - a.t0;
      if (dt > 0.9) { papeles.splice(k, 1); continue; }
      ctx.save();
      ctx.globalAlpha = 1 - dt / 0.9;
      ctx.translate(a.x + a.vx * dt, a.y + a.vy * dt + 520 * dt * dt);
      ctx.rotate(a.giro + dt * 7);
      ctx.fillStyle = a.color;
      ctx.fillRect(-a.r / 2, -a.r * 0.7, a.r, a.r * 1.4);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  function pintaNumeros(ctx, t) {
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    for (let k = numeros.length - 1; k >= 0; k--) {
      const n = numeros[k], dt = t - n.t0;
      if (dt > 0.9) { numeros.splice(k, 1); continue; }
      ctx.globalAlpha = Math.min(1, 2 * (1 - dt / 0.9));
      ctx.font = (n.grande ? 26 : 20) + 'px ' + FONT_D;
      ctx.lineWidth = 5;
      ctx.strokeStyle = OL;
      ctx.strokeText(n.txt, n.x, n.y - dt * 70);
      ctx.fillStyle = n.color;
      ctx.fillText(n.txt, n.x, n.y - dt * 70);
    }
    ctx.globalAlpha = 1;
  }
  function pintaCarteles(ctx, t, W) {
    carteles.forEach((c, k) => {
      const dt = t - c.t0;
      if (dt > c.dura) return;
      const y = R.y + 110 + k * 64, entra = Math.min(1, dt * 6), a = Math.min(1, (c.dura - dt) * 3);
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      ctx.font = '40px ' + FONT_D;
      const cabe = Math.min(1, (W - 28) / ctx.measureText(c.txt).width);   // un cartel largo se encoge hasta caber en el ancho
      ctx.font = Math.round(40 * entra * cabe) + 'px ' + FONT_D;
      ctx.lineWidth = 8; ctx.strokeStyle = OL; ctx.strokeText(c.txt, W / 2, y);
      ctx.fillStyle = c.color; ctx.fillText(c.txt, W / 2, y);
      if (c.sub) { ctx.font = '20px ' + FONT_D; ctx.lineWidth = 5; ctx.strokeText(c.sub, W / 2, y + 30); ctx.fillStyle = '#fff'; ctx.fillText(c.sub, W / 2, y + 30); }
    });
    ctx.globalAlpha = 1;
    while (carteles.length && t - carteles[0].t0 > carteles[0].dura) carteles.shift();
  }
  function pinta(ctx, t, W, H) {
    pintaPapeles(ctx, t);
    pintaNumeros(ctx, t);
    pintaCarteles(ctx, t, W);
    if (destello > 0) { ctx.fillStyle = `rgba(255,240,200,${destello})`; ctx.fillRect(0, 0, W, H); destello = Math.max(0, destello - 0.03); }
  }
  // el desplazamiento de la cámara por el temblor (se gasta solo)
  function sacudida() {
    if (temblor <= 0 || REDUCED) return [0, 0];
    temblor = Math.max(0, temblor - 0.03);
    return [(Math.random() - 0.5) * 18 * temblor, (Math.random() - 0.5) * 18 * temblor];
  }
  return { sucesos, pinta, sacudida, rebuscado, cartel, centro };
})();
