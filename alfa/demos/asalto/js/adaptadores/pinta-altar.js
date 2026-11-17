// Fans of Asalto · ADAPTADORES · Pinta lo de abajo de la pantalla de la partida: el Altar de invocación (sus 3 columnas de runas, las
// que asoman arriba y abajo para el empujón, el giro y las líneas en oro), el botón de invocar con lo que cuesta, los empujones que
// quedan, el banquillo, el botón de luchar (o el de la velocidad, en plena batalla) y la pista o el botón de deshacer del pie.
'use strict';
AS.pinta = AS.pinta || {};
AS.pinta.altar = (() => {
  const T = AS.tema, C = T.C, D = AS.dibujos, tx = AS.texto.pinta;
  const RUNAS = Object.keys(ASALTO.altar.pesos);

  function runa(g, r, cx, cy, k) {
    if (r === AS.altar.COMODIN) { D.icono(g, 'gema', cx, cy, k); return; }
    D.icono(g, 'clase-' + r, cx, cy, k);
  }
  // la runa que se ve en (col, i) con i de 0 a 4 (0 y 4 asoman): la del Altar, o una cualquiera mientras la columna gira
  function runaVista(p, E, col, i) {
    const G = E.giro;
    if (G && G.tipo === 'tira' && G.t < G.para[col]) return RUNAS[(Math.floor(G.t / 0.06) * 7 + col * 3 + i * 5) % RUNAS.length];
    return p.altar ? p.altar[col][i] : null;
  }
  // si empujar esa columna hacia ese lado haría línea con lo que ya se ve (la runa que entra por el otro lado no se sabe)
  function daLinea(p, col, dir) {
    const c = p.altar[col], movida = dir === 1 ? ['?', c[0], c[1], c[2], c[3]] : [c[1], c[2], c[3], c[4], '?'];
    return AS.altar.lineasDeColumna(p.altar.map((x, j) => (j === col ? movida : x)), col).length > 0;
  }
  // una flecha gorda de píxeles: s = 1 hacia abajo, -1 hacia arriba
  function flecha(g, cx, cy, s) {
    for (const [col, e] of [[C.tinta, 2], [C.crema, 0]]) {
      g.fillStyle = col;
      for (let i = 0; i < 4; i++) { const w = 16 - i * 4, y = s > 0 ? cy - 6 + i * 3 : cy + 3 - i * 3; g.fillRect(cx - w / 2 - e, y - e, w + e * 2, 3 + e * 2); }
    }
  }
  // una franja de luz que cruza un botón de vez en cuando, para que llame
  function brillo(g, b, t, cada) {
    const k = (t % cada) / 0.45;
    if (k > 1) return;
    g.save(); g.beginPath(); g.rect(b.x + 4, b.y + 3, b.w - 8, b.h - 14); g.clip();
    g.fillStyle = 'rgba(255,255,255,0.3)';
    for (let y = 0; y < b.h; y += 4) g.fillRect(Math.round(b.x - 30 + (b.w + 60) * k - y * 0.4), b.y + y, 18, 4);
    g.restore();
  }
  function asoma(g, P, p, E, col, fila) {
    const l = P.losa(col, fila), dir = fila < 0 ? 1 : -1, r = runaVista(p, E, col, fila < 0 ? 0 : 4);
    const puede = p.fase === 'preparar' && !E.giro && p.altar && p.tiradas > 0 && p.empujones > 0;
    const gana = puede && daLinea(p, col, dir);
    T.losa(g, l.x, l.y, l.w, l.h, gana ? (Math.floor(E.t * 5) % 2 ? C.oro : '#fff0a0') : puede ? C.celeste : C.piedra2);
    g.save(); g.beginPath(); g.rect(l.x + 3, l.y + 3, l.w - 6, l.h - 6); g.clip();
    if (r) runa(g, r, l.x + l.w / 2, fila < 0 ? l.y + l.h - 22 : l.y + 22, 2);
    if (!puede) { g.fillStyle = 'rgba(20,12,8,0.45)'; g.fillRect(l.x, l.y, l.w, l.h); }
    g.restore();
    if (!puede) return;
    flecha(g, l.x + l.w - 16, l.y + l.h / 2, dir);   // hacia dónde se mueve la columna
    if (gana) AS.fx.luz(l.x + l.w / 2, l.y + l.h / 2, 60, [255, 210, 80], 0.1);
    E.zona({ x: l.x, y: l.y - 6, w: l.w, h: l.h + 12 }, 'empuja', { col, dir });
  }
  function columnas(g, P, p, E) {
    const G = E.giro;
    for (let col = 0; col < 3; col++) {
      const bote = G && G.tipo === 'tira' && G.t >= G.para[col] && G.t < G.para[col] + 0.12 ? 4 : 0;   // el golpe al pararse
      asoma(g, P, p, E, col, -1); asoma(g, P, p, E, col, 3);
      for (let f = 0; f < 3; f++) {
        const l = P.losa(col, f), r = runaVista(p, E, col, f + 1), oro = E.celdasOro.has(col + ',' + f), casi = !G && E.casi.has(col + ',' + f) && Math.floor(E.t * 4) % 2;
        T.losa(g, l.x, l.y + bote, l.w, l.h, oro ? C.oro : casi ? '#f0b85a' : r ? C.piedra : C.piedra2);
        if (r) runa(g, r, l.x + l.w / 2, l.y + l.h / 2 + bote, 2);
        else tx(g, '?', l.x + l.w / 2, l.y + l.h / 2, { t: 48, col: '#8a7a58', borde: false, ancla: 'c' });
        if (oro) AS.fx.luz(l.x + l.w / 2, l.y + l.h / 2, 70, [255, 215, 90], 0.08);
      }
    }
  }
  function invocar(g, P, p, E) {
    const b = P.invocar, sitio = AS.equipo.hayHueco(p.equipo), coste = p.coste, llega = p.oro >= coste;
    const vale = p.fase === 'preparar' && !E.giro && sitio && llega, late = vale ? Math.round(Math.abs(Math.sin(E.t * 4)) * 2) : 0;
    T.boton(g, b.x, b.y - late, b.w, b.h, vale ? C.naranja : C.madera, !vale);
    if (vale) brillo(g, { x: b.x, y: b.y - late, w: b.w, h: b.h }, E.t, 2.4);
    const y = b.y - late + (vale ? 0 : 3);
    tx(g, sitio ? tr('INVOCAR') : tr('SIN SITIO'), b.x + b.w / 2, y + Math.round(b.h * 0.33), { t: 48, col: vale ? C.crema : '#d8b890', ancla: 'c', max: b.w - 14 });
    if (coste === 0) tx(g, tr('GRATIS'), b.x + b.w / 2, y + Math.round(b.h * 0.7), { col: '#b8ff7a', ancla: 'c' });
    else { D.icono(g, 'moneda', b.x + b.w / 2 - 20, y + Math.round(b.h * 0.7), 1); tx(g, String(coste), b.x + b.w / 2, y + Math.round(b.h * 0.7), { col: llega ? C.oro : '#ff7a6a' }); }
    if (p.racha >= 2) {   // la racha de invocaciones seguidas con línea, en la esquina del botón
      const w = 54, x = b.x + b.w - w - 8, yy = y + Math.round(b.h * 0.7) - 18;
      T.losa(g, x, yy, w, 34, C.oro);
      tx(g, 'x' + p.racha, x + w / 2, yy + 15, { col: C.tinta, borde: false, ancla: 'c', max: w - 8 });
    }
    E.zona(b, 'invoca');
  }
  function empujon(g, P, p, E) {
    const b = P.empujon, hay = p.empujones > 0;
    T.losa(g, b.x, b.y, b.w, b.h, hay ? C.azul : C.madera2);
    tx(g, tr('EMPUJÓN') + ' ' + p.empujones, b.x + b.w / 2, b.y + b.h / 2, { col: hay ? C.crema : '#c8a878', ancla: 'c', max: b.w - 12 });
    E.zona(b, 'ayuda-empujon');
  }
  function banquillo(g, P, p, E) {
    P.banquillo.forEach((b, i) => {
      const h = p.equipo.banquillo[i], sitio = { donde: 'banquillo', i };
      T.losa(g, b.x, b.y, b.w, b.h, h ? C.perg : C.madera2);
      if (!h) { if (i === p.equipo.banquillo.length) tx(g, tr('BANQUILLO'), b.x + b.w / 2, b.y + b.h / 2, { col: '#c8a878', ancla: 'c', max: b.w - 12 }); E.zona(b, 'hueco', sitio); return; }
      E.zona(b, 'heroe', sitio);
      if (E.ocultos.has(h.id) || (E.arrastre && E.arrastre.h.id === h.id && E.arrastre.movido)) return;
      D.busto(g, h.tipo, { x: b.x + 4, y: b.y + 4, w: Math.round(b.w * 0.58), h: b.h - 9 }, h.dorado);
      ASALTO.heroes[h.tipo].clases.forEach((k, j) => D.icono(g, 'clase-' + k, b.x + b.w - 58 + j * 34, b.y + b.h - 22, 1));   // sus dos clases
      T.losa(g, b.x + b.w - 40, b.y + 5, 34, 30, h.rama ? C.oro : C.crema);
      tx(g, String(h.nivel), b.x + b.w - 23, b.y + 20, { col: C.tinta, borde: false, ancla: 'c', max: 28 });
    });
  }
  function luchar(g, P, p, E) {
    const b = P.luchar;
    if (E.batalla) {
      T.boton(g, b.x, b.y, b.w, b.h, C.azul);
      tx(g, tr('VELOCIDAD x{n}', { n: E.vel }), b.x + b.w / 2, b.y + Math.round((b.h - 8) / 2), { t: 48, col: C.crema, ancla: 'c' });
      E.zona(b, 'velocidad');
      return;
    }
    const vale = p.fase === 'preparar' && !E.giro;
    T.boton(g, b.x, b.y, b.w, b.h, vale ? C.rojo : C.madera, !vale);
    if (vale && (p.oro < p.coste || !AS.equipo.hayHueco(p.equipo))) brillo(g, b, E.t, 1.6);   // ya no se puede invocar más: toca luchar
    tx(g, tr('¡A LUCHAR!'), b.x + b.w / 2, b.y + Math.round((b.h - 8) / 2) + (vale ? 0 : 3), { t: 64, col: C.crema, ancla: 'c', max: b.w - 30 });
    E.zona(b, 'lucha');
  }
  function pie(g, P, p, E) {
    if (p.puedeDeshacer && !E.batalla) {
      const w = 260, b = { x: Math.round(P.W / 2 - w / 2), y: P.pie - 21, w, h: 44 };
      T.boton(g, b.x, b.y, b.w, b.h, C.naranja);
      tx(g, tr('DESHACER'), P.W / 2, b.y + 19, { col: C.crema, ancla: 'c' });
      E.zona(b, 'deshace');
      return;
    }
    if (E.pista) tx(g, E.pista, P.W / 2, P.pie, { col: C.crema, ancla: 'c', max: P.W - 16 });
  }
  return (g, P, p, E) => {
    const a = P.altar, y0 = P.arena.y + P.arena.h;
    g.fillStyle = C.noche; g.fillRect(0, y0, P.W, P.H - y0);
    g.fillStyle = C.tinta; g.fillRect(0, y0, P.W, 4); g.fillStyle = C.oro2; g.fillRect(0, y0 + 4, P.W, 2);
    T.tabla(g, a.x, a.y, a.w, a.h);
    columnas(g, P, p, E); invocar(g, P, p, E); empujon(g, P, p, E); banquillo(g, P, p, E); luchar(g, P, p, E); pie(g, P, p, E);
  };
})();
