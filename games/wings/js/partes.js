// Fans of Wings · Pantallas de la misión, con el estilo militar de estilo.js: la pausa (seguir, ajustes, reintentar, abandonar y el
// estado de la misión con su mapa) y el parte final (resultado, puntos y RANGO, con «otra misión» y «volver al hangar»). Igual que
// en menu.js, cada una tiene zonas(est) y pintar(g, est, zonas, cursor).
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const UI = A.ui, E = A.estilo, C = E.C, P = UI.pantallas, M = (s) => E.may(tr(s));

  // ---------- pausa ----------
  const OPC_PAUSA = { seguir: ['SEGUIR VOLANDO', ''], ajustes: ['AJUSTES', 'PALANCA · SONIDO'], reintentar: ['REINTENTAR MISIÓN', ''], abandonar: ['ABANDONAR', 'VUELVE AL HANGAR'] };
  const anchoEstado = () => Math.min(524, UI.W - 560);
  P.pausa = {
    zonas: () => UI.columna(['seguir', 'ajustes', 'reintentar', 'abandonar'], 62, 182, Math.min(560, UI.W - anchoEstado() - 140), 52),
    pintar(g, est, zonas, cursor) {
      const W = UI.W;
      E.tinte(g, W, 'todo'); E.marco(g, W);
      E.t(g, M('TRANSMISIÓN EN ESPERA // MISIÓN 01 EN CURSO'), 62, 56, 11, C.cian);
      E.t(g, M('PAUSA'), 62, 124, 54, C.amb, 'left', C.fondo);
      E.linea(g, 62, 150, Math.min(580, W - 520));
      zonas.forEach((z, k) => E.opcion(g, z, M(OPC_PAUSA[z.id][0]), OPC_PAUSA[z.id][1] ? M(OPC_PAUSA[z.id][1]) : '', k === cursor, z.id === 'abandonar'));
      estado(g, est.e, W - 36 - anchoEstado(), 106, anchoEstado());
      E.pie(g, W, UI.ayuda(est, [['ESC', 'SEGUIR']]));
    },
  };
  function estado(g, e, x, y, w) {
    const j = e.aire.jugador, cy = E.panel(g, x, y, w, 520, M('ESTADO DE LA MISIÓN'), E.reloj(e.t)), n = Math.max(6, Math.min(10, Math.floor((w - 290) / 18)));
    const enemigos = e.aire.enemigos.concat(e.aire.jefe ? [e.aire.jefe] : []).map((en) => ({ x: en.pos.x, z: en.pos.z }));
    E.mapa(g, x + 18, cy + 14, w - 36, 250, { pos: { x: j.pos.x, z: j.pos.z }, rumbo: A.vuelo.rumbo(j), enemigos, zona: null, alcance: 3600 });
    const barra = (nombre, v, color, k) => {
      const fy = cy + 304 + k * 34;
      E.t(g, M(nombre), x + 18, fy, 12, C.claro); E.segs(g, x + 190, fy - 14, n, v, color);
      E.t(g, Math.round(v * 100) + '%', x + w - 18, fy, 12, C.amb, 'right');
    };
    barra('ESCUDO', e.escudo / e.caza.escudo, C.verde, 0); barra('COMBUSTIBLE', e.combustible / e.aj.combustible.max, C.amb, 1);
    E.fila(g, x + 18, cy + 388, w - 36, M('DERRIBOS'), Math.min(e.derribos, e.aj.aire.derribos) + ' / ' + e.aj.aire.derribos);
    E.fila(g, x + 18, cy + 420, w - 36, M('MISILES'), String(e.misiles).padStart(2, '0'));
    E.fila(g, x + 18, cy + 452, w - 36, M('PUNTOS'), String(e.puntos).padStart(6, '0'), C.amb);
  }

  // ---------- parte final ----------
  const POR_QUE = { derribado: 'Los becarios lo celebran con café. Vuelve a intentarlo.', estrellado: '¡Te has estrellado! Vigila la altura y tira de la palanca a tiempo.',
    combustible: 'Sin combustible. Los enemigos derribados sueltan bidones: recógelos.' };
  const anchoRango = () => Math.min(520, Math.round(UI.W * 0.36));
  P.final = {
    zonas() { const w = Math.min(520, (UI.W - 170) / 2); return [{ id: 'otra', x: 70, y: 594, w, h: 70 }, { id: 'alHangar', x: 70 + w + 30, y: 594, w: Math.min(400, w), h: 70 }]; },
    pintar(g, est, zonas, cursor) {
      const W = UI.W, e = est.e, bien = e.fin === 'cumplida', wr = anchoRango(), c = e.caza;
      E.tinte(g, W, 'todo'); E.marco(g, W);
      g.fillStyle = 'rgba(6,18,42,.9)'; g.fillRect(0, 54, W, 112); g.fillStyle = C.cian; g.fillRect(0, 54, W, 3); g.fillRect(0, 163, W, 3);
      E.emblema(g, 70, 70, 3.4);
      E.t(g, M(bien ? 'MISIÓN CUMPLIDA' : 'MISIÓN FALLIDA'), 184, 122, Math.min(46, (W - 240) / 16), bien ? C.amb : C.rojo, 'left', '#000');
      E.t(g, M('INFORME DE COMBATE') + ' // ' + e.aj.codigos[c.id] + ' ' + M(c.nombre) + ' // ' + M('PILOTO') + ' ' + E.may(c.piloto), 184, 150, Math.min(11, (W - 240) / 66), C.cian);
      E.franja(g, 0, 174, W, 9);
      resultado(g, e, 70, 204, W - 170 - wr, bien);
      rango(g, est, W - 70 - wr, 204, wr);
      if (e.finT > 1.2) {
        E.boton(g, zonas[0], M('OTRA MISIÓN'), true, Math.min(22, zonas[0].w / 16));
        E.boton(g, zonas[1], M('VOLVER AL HANGAR'), false, Math.min(13, zonas[1].w / 22));
        UI.cursor(g, zonas[cursor], est);
      }
      E.sello(g, M('ARCHIVADO'), W - 150, 630, -0.1, 13);
      E.pie(g, W, UI.ayuda(est));
    },
  };
  function resultado(g, e, x, y, w, bien) {
    const cy = E.panel(g, x, y, w, 360, M('RESULTADO'), M('MISIÓN') + ' 01 · ' + M('SECTOR') + ' ' + e.aj.sector), total = e.aj.aire.derribos + 1, n = Math.max(5, Math.min(10, Math.floor((w - 420) / 18)));
    const tam = Math.min(13, w / 42), ancho = w - 44, fx = x + 22;
    const conBarra = (nombre, v, k) => {
      E.fila(g, fx, cy + 42 + k * 44, ancho, M(nombre), Math.round(v * 100) + '%', C.blanco, tam);
      E.segs(g, fx + ancho - 70 - n * 18, cy + 28 + k * 44, n, v, C.cian);
    };
    E.fila(g, fx, cy + 42, ancho, M('AVIONES DERRIBADOS'), Math.min(e.derribos, total) + ' / ' + total, C.blanco, tam);
    conBarra('PUNTERÍA', e.disparos ? e.aciertos / e.disparos : 0, 1);
    conBarra(bien ? 'ESCUDO AL ATERRIZAR' : 'ESCUDO', e.escudo / e.caza.escudo, 2);
    if (bien) {
      E.fila(g, fx, cy + 174, ancho, M('BONUS DE ESCUDO Y PUNTERÍA'), '+' + (e.bonus || 0), C.blanco, tam);
      E.fila(g, fx, cy + 218, ancho, M('BONUS DE TIEMPO') + ' (' + E.reloj(e.t) + ')', '+' + (e.bonusTiempo || 0), C.blanco, tam);
    } else E.lineas(g, tr(POR_QUE[e.finMotivo] || POR_QUE.derribado), ancho, 11).forEach((l, k) => E.t(g, l, fx, cy + 178 + k * 22, 11, C.rojo));
    E.t(g, M('PUNTOS'), fx, cy + 292, 20, C.amb, 'left', C.fondo);
    E.t(g, String(e.puntos).padStart(6, '0'), fx + ancho, cy + 296, 28, C.amb, 'right', C.fondo);
  }
  function rango(g, est, x, y, w) {
    const e = est.e, r = e.rango, cy = E.panel(g, x, y, w, 360, M('RANGO'), est.record ? M('NUEVO RÉCORD') : ''), cx = x + w / 2;
    const entra = Math.min(1, Math.max(0, (e.finT - 0.5) / 0.35));   // la letra entra de golpe, como un sello
    E.emblema(g, cx - 150, cy + 50, 5.4);
    g.save(); g.translate(cx + 80, cy + 178); g.scale(2 - entra, 2 - entra); g.globalAlpha = entra;
    E.t(g, r.letra, 0, 0, 120, r.letra === 'C' ? C.claro : C.amb, 'center', C.fondo);
    g.restore();
    if (r.siguiente) {
      E.fila(g, x + 22, cy + 252, w - 44, M('SIGUIENTE RANGO'), r.siguiente, C.blanco, Math.min(12, w / 36));
      E.fila(g, x + 22, cy + 290, w - 44, M(e.fin === 'cumplida' ? 'FALTAN' : 'HAY QUE'), e.fin === 'cumplida' ? r.faltan + ' ' + M('PUNTOS') : M('CUMPLIR LA MISIÓN'), C.amb, Math.min(12, w / 36));
    } else E.fila(g, x + 22, cy + 270, w - 44, M('RANGO MÁXIMO'), M('TODO DERRIBADO Y A TODA PRISA'), C.amb, Math.min(11, w / 44));
  }
})(WINGS);
