// Fans of Asalto · ADAPTADORES · Las metas a la vista durante la partida: la tira de misiones en lo alto de la arena (el icono de cada
// una, por dónde va y su barra; al tocarla se abre la ventana con el detalle) y la cinta de «¡MISIÓN CUMPLIDA!» con su premio, que sale
// cuando la partida avisa de que una se ha cobrado. No decide nada: pinta lo que dice la partida.
'use strict';
AS.pinta = AS.pinta || {};
AS.pinta.misiones = (() => {
  const T = AS.tema, C = T.C, tx = AS.texto.pinta;

  // cómo se reparte la tira entre n misiones y, al final, la losa de las piedras de destino: { w (de cada misión), misiones, piedras }
  function reparto(P, n) {
    const r = P.misiones, w = Math.floor((r.w - 4 * n) / (n + 1)), fin = r.x + n * (w + 4);
    return { w, misiones: { x: r.x, y: r.y, w: fin - 4 - r.x, h: r.h }, piedras: { x: fin, y: r.y, w: r.x + r.w - fin, h: r.h } };
  }
  function tira(g, P, p, E) {
    if (E.batalla && E.batalla.jefe) return;   // ahí va la barra del jefe
    const r = P.misiones, lista = p.misiones, R = reparto(P, lista.length), w = R.w;
    lista.forEach((m, i) => {
      const d = ASALTO.misiones.lista[m.id], x = r.x + i * (w + 4), brilla = E.misionHecha && E.misionHecha.tipo === 'mision' && E.misionHecha.id === m.id && Math.floor(E.t * 8) % 2;
      T.losa(g, x, r.y, w, r.h, m.acabada ? C.verde : brilla ? C.oro : C.madera2);
      AS.dibujos.icono(g, d.icono, x + 22, r.y + Math.round(r.h / 2) - 3, 1);
      tx(g, m.acabada ? tr('HECHA') : m.va + '/' + m.meta, x + 40 + (w - 46) / 2, r.y + Math.round(r.h / 2) - 4, { col: brilla ? C.tinta : C.crema, borde: !brilla, ancla: 'c', max: w - 50 });
      g.fillStyle = C.tinta; g.fillRect(x + 6, r.y + r.h - 11, w - 12, 5);
      g.fillStyle = m.acabada ? C.crema : C.oro; g.fillRect(x + 6, r.y + r.h - 11, Math.round((w - 12) * (m.acabada ? 1 : m.va / m.meta)), 5);
      E.zona({ x, y: r.y, w, h: r.h }, 'misiones');
    });
    AS.pinta.piedras.losa(g, R.piedras, p, E);
  }
  // lo que queda encima de las cintas: la tira de misiones o, si la tapa, la franja de la guía o de un consejo (van debajo de ella)
  const encima = P => (AS.guia.activa ? P.guia : AS.consejos.tapa || P.misiones);
  // una misión cobrada (o un aviso de las piedras de destino): a la cola de las cintas, con su sonido y, si paga, sus monedas al contador
  const avisa = (E, a) => { E.cumplidas.push(a); };
  function cinta(g, P, E, dt) {
    const a = E.cumplidas[0];
    if (!a) { E.misionHecha = null; return; }
    if (E.misionHecha !== a && AS.ventanas.abierta()) return;   // con una ventana delante no se vería: espera
    const DURA = a.tipo === 'mision' ? 2 : 2.8;   // los avisos de piedra traen más que leer
    if (E.misionHecha !== a) {   // empieza a enseñarse ahora
      E.misionHecha = a; a.t = 0;
      AS.suena(a.tipo === 'piedra-caducada' ? 'noVale' : 'mision');
      if (a.oro) AS.fx.monedas(P.W / 2, P.misiones.y + 70, 3 + a.oro, E.destinoOro.x, E.destinoOro.y, () => AS.suena('moneda'));
      if (a.tipo !== 'piedra-caducada') AS.fx.fogonazo(0.18, '#fff3d6');
    }
    a.t += dt;
    if (a.t >= DURA) { E.cumplidas.shift(); return; }
    const k = Math.min(1, a.t / 0.18), w = Math.min(P.W - 16, 440), x = Math.round(P.W / 2 - w / 2), arriba = encima(P), y = arriba.y + arriba.h + 6 - Math.round((1 - k) * 24);
    g.globalAlpha = a.t > DURA - 0.25 ? Math.max(0, (DURA - a.t) / 0.25) : k;
    const c = AS.pinta.piedras.cinta(a) || { titulo: tr('¡MISIÓN CUMPLIDA!'), texto: tr('+{o} de oro · +{p} plumas', { o: a.oro, p: a.plumas }), col: C.verde };
    T.cinta(g, x, y, w, 50, c.col);
    tx(g, c.titulo, P.W / 2, y + 21, { col: C.crema, ancla: 'c', max: w - 50 });
    const m = c.texto2 ? 6 : 30;   // con dos líneas, el pergamino va más ancho
    T.pergamino(g, x + m, y + 46, w - 2 * m, c.texto2 ? 72 : 44);
    tx(g, c.texto, P.W / 2, y + 67, { col: C.tinta, borde: false, ancla: 'c', max: w - 2 * m - 24 });
    if (c.texto2) tx(g, c.texto2, P.W / 2, y + 95, { col: C.sangre, borde: false, ancla: 'c', max: w - 2 * m - 24 });
    g.globalAlpha = 1;
  }
  const pinta = (g, P, p, E, dt) => { tira(g, P, p, E); cinta(g, P, E, dt); };
  pinta.avisa = avisa; pinta.reparto = reparto;
  return pinta;
})();
