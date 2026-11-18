// Fans of Asalto · ADAPTADORES · Pinta lo de arriba de la pantalla de la partida: el marcador (oleada, vidas, oro, esencia y el botón de pausa),
// la tira de oleadas de la zona (las hechas, la de ahora, las de élite y el jefe) y las clases del equipo con sus puntos.
'use strict';
AS.pinta = AS.pinta || {};
AS.pinta.marcador = (() => {
  const T = AS.tema, C = T.C, tx = AS.texto.pinta;

  function cabecera(g, P, p, E) {
    const m = P.marcador;
    T.marco(g, m.x, m.y, m.w, m.h);
    const titulo = p.sinFin ? tr('OLEADA {n}', { n: p.oleada }) : tr('OLEADA {n}/{de}', { n: p.oleada, de: p.oleadas });
    tx(g, titulo, m.x + 16, m.y + 25, { col: C.crema });
    const vx = m.x + Math.round(m.w * 0.41);
    AS.dibujos.icono(g, 'corazon', vx, m.y + 25, 1);
    tx(g, String(p.vidas), vx + 20, m.y + 25, { col: E.vidasRojo > 0 ? '#ff7a6a' : C.crema });
    const ox = m.x + Math.round(m.w * 0.56);
    AS.dibujos.icono(g, 'moneda', ox, m.y + 25, 1);
    tx(g, String(Math.round(E.oroVisto)), ox + 20, m.y + 25, { col: C.oro });
    E.destinoOro = { x: ox, y: m.y + 25 };
    const ex = m.x + Math.round(m.w * 0.74);   // la esencia: la moneda de la tienda
    AS.dibujos.icono(g, 'gema', ex, m.y + 25, 1);
    tx(g, String(p.esencia), ex + 20, m.y + 25, { col: C.celeste });
    const b = { x: m.x + m.w - 50, y: m.y + 5, w: 44, h: 40 };
    T.boton(g, b.x, b.y, b.w, b.h + 5, C.naranja);
    g.fillStyle = C.crema; g.fillRect(b.x + 13, b.y + 10, 6, 20); g.fillRect(b.x + 25, b.y + 10, 6, 20);
    E.zona(b, 'pausa');
  }
  // la tira de oleadas: en una zona, todas; en el modo sin fin, las 12 siguientes
  function tira(g, P, p) {
    const o = P.oleadas, total = p.sinFin ? 12 : p.oleadas, desde = p.sinFin ? p.oleada : 1;
    const paso = Math.floor(o.w / total), w = Math.min(34, paso - 3), x0 = o.x + Math.floor((o.w - paso * total) / 2);
    for (let i = 0; i < total; i++) {
      const n = desde + i, tipo = p.tipoDeOleada(n), x = x0 + i * paso;
      const col = n < p.oleada ? C.verde : n === p.oleada ? C.oro : tipo === 'jefe' ? C.noche : tipo === 'elite' ? C.rojo : C.madera3;
      T.losa(g, x, o.y, w, 30, col);
      if (tipo === 'jefe') AS.dibujos.icono(g, 'sala-jefe', x + w / 2, o.y + 15, 1);
      else if (tipo === 'elite' && n >= p.oleada) AS.dibujos.icono(g, 'sala-combate', x + w / 2, o.y + 15, 1);
      else if (n === p.oleada) { g.fillStyle = C.tinta; g.fillRect(x + w / 2 - 4, o.y + 11, 8, 8); }
    }
  }
  function clases(g, P, p, E) {
    const r = P.clases, s = p.sinergias, vivas = Object.keys(ASALTO.clases).filter(k => s.puntos[k]);
    const w = Math.min(86, Math.floor(r.w / Math.max(4, vivas.length)) - 4);
    vivas.forEach((k, i) => {
      const d = ASALTO.clases[k], x = r.x + i * (w + 4), nivel = s.nivel[k], falta = d.umbral[Math.min(nivel, d.umbral.length - 1)];
      // cada clase, con su escudo de armas (a color si está activa) y su cuenta en la placa de al lado
      T.losa(g, x + 14, r.y + 5, w - 14, r.h - 12, nivel ? d.col : C.madera2);
      T.escudo(g, x, r.y, 38, r.h, nivel ? T.tono(d.col, 0.35) : C.madera3);
      AS.dibujos.icono(g, 'clase-' + k, x + 19, r.y + 18, 1);
      tx(g, s.puntos[k] + '/' + falta, x + 36 + (w - 36) / 2, r.y + 20, { col: nivel ? C.crema : '#c8a878', ancla: 'c' });
      E.zona({ x, y: r.y, w, h: r.h }, 'clase', k);
    });
  }
  return (g, P, p, E) => { cabecera(g, P, p, E); tira(g, P, p); clases(g, P, p, E); };
})();
