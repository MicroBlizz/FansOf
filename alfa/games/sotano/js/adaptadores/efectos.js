// Fans Of Sótano · adaptador · EFECTOS: lo que se ve pasar encima de la escena y no es del juego: números que saltan, astillas al romper,
// carteles («Planta −12», «¡Nivel 20!»), temblor y destellos. Traduce los sucesos del motor y de las órdenes en efectos con su vida corta.
// La escena los pinta con pinta(ctx, t); el tiempo t es el de los fotogramas (segundos).
'use strict';
SO.efectos = (() => {
  const R = SO.REJILLA, numeros = [], astillas = [], carteles = [], golpes = {};
  let temblor = 0, destello = 0, ahora = 0;

  const centro = i => ({ x: R.x + (i % R.cols) * R.paso + R.lado / 2, y: R.y + Math.floor(i / R.cols) * R.paso + R.lado / 2 });
  function numero(x, y, txt, color, grande = false) {
    if (numeros.length > 40) numeros.shift();
    numeros.push({ x: x + (Math.random() - 0.5) * 30, y, txt, color, grande, t0: ahora });
  }
  function astillasDe(i, color, n = 10) {
    const c = centro(i);
    for (let k = 0; k < n; k++) astillas.push({ x: c.x, y: c.y, vx: (Math.random() - 0.5) * 340, vy: -Math.random() * 300 - 60, color, t0: ahora, r: 3 + Math.random() * 4 });
    if (astillas.length > 160) astillas.splice(0, astillas.length - 160);
  }
  function cartel(txt, color = '#ffd23f', dura = 1.6, sub = '') {
    carteles.push({ txt, sub, color, t0: ahora, dura });
    if (carteles.length > 3) carteles.shift();
  }
  const COLOR_GOLPE = { normal: '#ffffff', crit: '#ffd23f', super: '#ff4d8d' };
  // cada suceso, su efecto (los que no salen aquí no se ven)
  const POR_SUCESO = {
    golpe: s => { const c = centro(s.i); golpes[s.i] = ahora; numero(c.x, c.y - 20, SO.txt.num(s.d), COLOR_GOLPE[s.tipo], s.tipo !== 'normal'); },
    ayuda: s => { golpes[s.i] = ahora; },
    roto: s => { astillasDe(s.i, SO.MATERIALES[s.m].color); if (s.n > 1) { const c = centro(s.i); numero(c.x, c.y, '+' + SO.txt.num(s.n), SO.MATERIALES[s.m].color); } },
    planta: s => cartel(tr('Planta −{n}', { n: s.n }), s.especial === 'normal' ? '#ffffff' : s.especial === 'dorada' ? '#ffd23f' : '#ff7ef9', 1.2, s.especial === 'dorada' ? tr('¡Planta dorada!') : s.especial === 'arcoiris' ? tr('¡Planta arcoíris!') : ''),
    nivel: s => cartel(tr('¡Nivel {n}!', { n: s.n }), '#7ef9ff', 1.2),
    dinamita: () => { temblor = 0.5; destello = 0.35; },
    reciclado: s => numero(R.x + R.ancho / 2, R.y - 10, tr('Reciclado x{n}', { n: s.multi }), '#3ddc84'),
    expediente: s => cartel(tr('Expediente de {m}: rango {r}', { m: tr(SO.MATERIALES[s.m].nombre), r: s.rango }), '#b06bff', 2),
    trituradora: s => { temblor = 1; destello = 0.6; cartel(tr('¡Trituradora rota!'), '#ff4d5e', 3, tr('{lider} se une al equipo', { lider: SO.FACCIONES[Math.min(s.nivel, SO.FACCIONES.length - 1)].lider })); },
    'intento-fin': s => cartel(tr('Intento terminado'), '#ffffff', 2, tr('{p} de la Trituradora destrozada', { p: SO.txt.pct(s.parte) })),
    despido: s => cartel(tr('¡DESPEDIDOS!'), '#ff4d5e', 2.5, tr('Indemnización: {n}', { n: SO.txt.num(s.cobra) })),
  };
  function sucesos(lista, t) {
    ahora = t;
    for (const s of lista) if (POR_SUCESO[s.t]) POR_SUCESO[s.t](s);
  }
  // cuánto hace que se golpeó el bloque i (para sacudirlo)
  const golpeado = i => (golpes[i] === undefined ? 9 : ahora - golpes[i]);

  function pintaAstillas(ctx, t) {
    for (let k = astillas.length - 1; k >= 0; k--) {
      const a = astillas[k], dt = t - a.t0;
      if (dt > 0.9) { astillas.splice(k, 1); continue; }
      ctx.globalAlpha = 1 - dt / 0.9;
      ctx.fillStyle = a.color;
      ctx.fillRect(a.x + a.vx * dt - a.r / 2, a.y + a.vy * dt + 520 * dt * dt - a.r / 2, a.r, a.r);
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
      ctx.font = (n.grande ? 30 : 20) + 'px ' + FONT_D;
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
      const y = 200 + k * 64, entra = Math.min(1, dt * 6), a = Math.min(1, (c.dura - dt) * 3);
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      ctx.font = Math.round(40 * entra) + 'px ' + FONT_D;
      ctx.lineWidth = 8; ctx.strokeStyle = OL; ctx.strokeText(c.txt, W / 2, y);
      ctx.fillStyle = c.color; ctx.fillText(c.txt, W / 2, y);
      if (c.sub) { ctx.font = '20px ' + FONT_D; ctx.lineWidth = 5; ctx.strokeText(c.sub, W / 2, y + 30); ctx.fillStyle = '#fff'; ctx.fillText(c.sub, W / 2, y + 30); }
    });
    ctx.globalAlpha = 1;
    while (carteles.length && t - carteles[0].t0 > carteles[0].dura) carteles.shift();
  }
  function pinta(ctx, t, W, H) {
    pintaAstillas(ctx, t);
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
  return { sucesos, pinta, sacudida, golpeado, cartel, centro };
})();
