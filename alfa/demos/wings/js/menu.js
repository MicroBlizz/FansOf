// Fans of Wings · Menús de antes de volar, con el estilo militar de estilo.js y el caza volando detrás: el título (iniciar misión,
// hangar, ajustes, partes y novedades, y el briefing con el mapa), el hangar (lista de cazas, piloto, ficha técnica, palanca y
// DESPEGAR), los ajustes (palanca y sonido) y los partes y novedades. Cada pantalla tiene zonas(est), que dice qué se puede pulsar
// y dónde, y pintar(g, est, zonas, cursor). Las de la misión (pausa y parte final) están en partes.js.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const UI = A.ui, E = A.estilo, C = E.C, M = (s) => E.may(tr(s));
  const P = UI.pantallas = {};
  const version = () => (typeof NEWS !== 'undefined' && NEWS.length ? NEWS[0].v : '');
  const mejor = (est) => (est.mejor ? String(est.mejor).padStart(6, '0') + (est.mejorRango ? ' · ' + M('RANGO') + ' ' + est.mejorRango : '') : '------');

  // Una columna de opciones de menú, una debajo de otra.
  UI.columna = (ids, x, y, w, h) => ids.map((id, k) => ({ id, x, y: y + k * (h + 11), w, h }));
  // El cursor del teclado y del ratón (solo en PC): un recuadro blanco alrededor de lo que se va a pulsar.
  UI.cursor = function (g, z, est) {
    if (est.tactil || !z) return;
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.setLineDash([10, 6]); g.strokeRect(z.x - 6, z.y - 6, z.w + 12, z.h + 12); g.setLineDash([]);
  };
  const AYUDA_PC = [['FLECHAS', 'ELEGIR'], ['ENTER', 'ACEPTAR']];
  UI.ayuda = (est, mas) => (est.tactil ? [[M('TOCA'), M('ELEGIR')]] : UI.teclas(AYUDA_PC.concat(mas || [])));

  // ---------- título ----------
  const OPC_TITULO = { iniciar: ['INICIAR MISIÓN', () => '01'], hangar: ['HANGAR', () => '3 ' + M('CAZAS')], ajustes: ['AJUSTES', () => M('PALANCA') + ' · ' + M('SONIDO')], novedades: ['PARTES Y NOVEDADES', version] };
  P.titulo = {
    zonas: () => UI.columna(['iniciar', 'hangar', 'ajustes', 'novedades'], 52, 228, Math.min(560, UI.W - 560), 52),
    pintar(g, est, zonas, cursor) {
      const W = UI.W, tam = Math.max(26, Math.min(54, (W - 700) / 13));
      E.tinte(g, W, 'lado'); E.marco(g, W);
      E.emblema(g, 52, 50, 5.2);
      E.t(g, M('ESCUADRÓN 01 «ANIMALES LOCOS» // BASE LA MADRIGUERA'), 198, 56, 11, C.cian);
      E.t(g, 'FANS OF', 198, 120, tam, '#fff', 'left', C.fondo);
      E.t(g, 'WINGS', 198 + E.ancho(g, 'FANS OF ', tam), 120, tam, C.amb, 'left', C.fondo);
      E.t(g, M('OPERACIÓN CIELO LIMPIO · CONTRA LA FUERZA AÉREA DE MICROBLIZZ'), 198, 148, 10, C.claro);
      E.linea(g, 52, 183, Math.min(730, W - 520)); E.franja(g, 52, 198, 210, 9);
      zonas.forEach((z, k) => E.opcion(g, z, M(OPC_TITULO[z.id][0]), OPC_TITULO[z.id][1](), k === cursor));
      if (W > 1150) E.sello(g, M('CONFIDENCIAL · SOLO PILOTOS'), W / 2 + 30, 566, -0.09, 12);
      briefing(g, est, W - 460, 212);
      E.pie(g, W, UI.ayuda(est, [['WASD', 'VOLAR'], ['ESPACIO', 'CAÑÓN'], ['M', 'MISIL'], ['MAYÚS', 'TURBO'], ['Q', 'FRENO'], ['C', 'CÁMARA']]));
    },
  };
  function briefing(g, est, x, y) {
    const w = 424, cy = E.panel(g, x, y, w, 436, 'BRIEFING 01', M('SECTOR') + ' ' + A.AJ.sector);
    E.mapa(g, x + 18, cy + 14, w - 36, 240, { pos: { x: 0, z: 0 }, rumbo: 0, enemigos: [], zona: { x: 500, z: 2600, nombre: M('ZONA') + ' A' }, alcance: 4600 });
    E.fila(g, x + 18, cy + 286, w - 36, M('OBJETIVO'), A.AJ.aire.derribos + ' ' + M('DRONES') + ' + ' + M('JEFE'));
    E.fila(g, x + 18, cy + 318, w - 36, M('MEJOR MISIÓN'), mejor(est), C.amb);
    E.fila(g, x + 18, cy + 350, w - 36, M('MISIONES VOLADAS'), est.partes.misiones);
  }

  // ---------- hangar ----------
  const medidasHangar = () => { const lado = Math.min(424, Math.round((UI.W - 72) * 0.34)); return { lado, xd: UI.W - 36 - lado }; };
  P.hangar = {
    zonas() {
      const { lado, xd } = medidasHangar();
      return UI.columna(A.AJ.cazas.map((c) => 'caza:' + c.id), 36, 108, lado, 72)
        .concat([{ id: 'palanca', x: xd, y: 446, w: lado, h: 62 }, { id: 'despegar', x: xd, y: 562, w: lado, h: 96 }, { id: 'volver', x: UI.W - 236, y: 24, w: 200, h: 46 }]);
    },
    pintar(g, est, zonas, cursor) {
      const W = UI.W, { lado, xd } = medidasHangar(), c = A.AJ.cazas.find((q) => q.id === est.sel.caza) || A.AJ.cazas[0], z = (id) => zonas.find((q) => q.id === id);
      E.tinte(g, W, 'lado'); E.marco(g, W);
      E.emblema(g, 44, 22, 2.6);
      E.t(g, M('HANGAR 01 // ASIGNACIÓN DE AERONAVE'), 118, 42, 11, C.cian);
      E.t(g, M('BASE LA MADRIGUERA'), 118, 66, 11, C.claro);
      E.linea(g, 44, 88, Math.min(700, W - 320));
      for (const q of A.AJ.cazas) E.opcion(g, z('caza:' + q.id), M(q.nombre), A.AJ.codigos[q.id], q.id === c.id);
      piloto(g, est, c, 36, 362, lado);
      ficha(g, c, xd, 100, lado);
      E.boton(g, z('palanca'), M('PALANCA') + ': ' + M(est.sel.normal ? 'NORMAL' : 'AVIÓN'), false, Math.min(15, lado / 26));
      E.franja(g, xd, 532, lado, 9);
      E.boton(g, z('despegar'), M('DESPEGAR'), true, Math.min(30, lado / 12), Math.floor(est.t * 2) % 2 === 0);
      E.boton(g, z('volver'), '< ' + M('VOLVER'), false, 12);
      UI.cursor(g, zonas[cursor], est);
      E.pie(g, W, est.tactil ? [[M('TOCA'), M('ELEGIR')]] : UI.teclas([['< >', 'CAMBIAR CAZA'], ['ENTER', 'DESPEGAR'], ['ESC', 'VOLVER']]), est.ips + ' IPS');
    },
  };
  function piloto(g, est, c, x, y, w) {
    const cy = E.panel(g, x, y, w, 300, M('PILOTO ASIGNADO'), '0' + (A.AJ.cazas.indexOf(c) + 1) + '/0' + A.AJ.cazas.length);
    E.t(g, E.may(c.piloto), x + 18, cy + 40, Math.min(18, w / 22), C.amb, 'left', C.fondo);
    E.fila(g, x + 18, cy + 76, w - 36, M('DERRIBOS'), String(est.partes.derribos[c.id] || 0).padStart(3, '0'));
    E.fila(g, x + 18, cy + 108, w - 36, M('MISIONES CUMPLIDAS'), est.partes.cumplidas);
    E.lineas(g, tr(c.texto), w - 36, 11).slice(0, 6).forEach((l, k) => E.t(g, l, x + 18, cy + 148 + k * 22, 11, C.blanco));
  }
  function ficha(g, c, x, y, w) {
    const cy = E.panel(g, x, y, w, 320, M('FICHA TÉCNICA'), A.AJ.codigos[c.id]), max = { vel: 1.3, escudo: 150, misiles: 8, bombas: 12 }, n = Math.max(5, Math.min(10, Math.floor((w - 250) / 18)));
    const filas = [['VELOCIDAD', c.vel / max.vel, Math.round(c.vel * 100)], ['ESCUDO', c.escudo / max.escudo, c.escudo], ['MISILES', c.misiles / max.misiles, c.misiles], ['BOMBAS', c.bombas / max.bombas, c.bombas]];
    filas.forEach(([nombre, v, valor], k) => {
      const fy = cy + 42 + k * 38;
      E.t(g, M(nombre), x + 18, fy, 12, C.claro);
      E.segs(g, x + 164, fy - 14, n, v, C.cian);
      E.t(g, String(valor).padStart(2, '0'), x + w - 18, fy, 12, C.amb, 'right');
    });
    E.fila(g, x + 18, cy + 206, w - 36, M('ARMAMENTO'), M('CAÑÓN') + ' · ' + M('MISIL') + ' · ' + M('BOMBA'), C.blanco, Math.min(11, w / 38));
    E.fila(g, x + 18, cy + 240, w - 36, M('ESTADO'), M('LISTO PARA DESPEGAR'), C.verde, Math.min(11, w / 38));
  }

  // ---------- ajustes (encima del título o de la pausa) ----------
  P.ajustes = {
    zonas: () => UI.columna(['palanca', 'sonido', 'volver'], UI.W / 2 - 300, 250, 600, 60),
    pintar(g, est, zonas, cursor) {
      const W = UI.W, x = W / 2 - 340;
      E.tinte(g, W, 'todo');
      E.panel(g, x, 170, 680, 380, M('AJUSTES'), 'v' + version());
      const texto = { palanca: [M('PALANCA') + ': ' + M(est.sel.normal ? 'NORMAL' : 'AVIÓN'), ''], sonido: [M('SONIDO') + ': ' + M(est.mudo ? 'NO' : 'SÍ'), ''], volver: [M('VOLVER'), ''] };
      zonas.forEach((z, k) => E.opcion(g, z, texto[z.id][0], texto[z.id][1], k === cursor));
      E.t(g, tr(est.sel.normal ? 'Arriba sube el morro' : 'Hacia ti sube el morro'), W / 2, 500, 11, C.claro, 'center');
      E.pie(g, W, UI.ayuda(est, [['ESC', 'VOLVER']]));
    },
  };

  // ---------- partes y novedades ----------
  const sinEtiquetas = (s) => String(s).replace(/<[^>]+>/g, '');
  P.novedades = {
    zonas: () => [{ id: 'volver', x: UI.W - 236, y: 24, w: 200, h: 46 }],
    pintar(g, est, zonas, cursor) {
      const W = UI.W, wi = Math.min(430, Math.round(W * 0.3)), xd = 52 + wi + 28, wd = W - xd - 36, Q = est.partes;
      E.tinte(g, W, 'todo'); E.marco(g, W);
      E.t(g, M('ARCHIVO DEL ESCUADRÓN'), 52, 56, 11, C.cian);
      E.t(g, M('PARTES Y NOVEDADES'), 52, 104, Math.min(34, (W - 340) / 19), C.amb, 'left', C.fondo);
      E.linea(g, 52, 128, Math.min(730, W - 320));
      const cy = E.panel(g, 52, 156, wi, 300, M('PARTE DEL ESCUADRÓN'));
      const derribos = Object.values(Q.derribos).reduce((a, b) => a + b, 0);
      [['MEJOR MISIÓN', est.mejor ? String(est.mejor).padStart(6, '0') : '------'], ['MEJOR RANGO', est.mejorRango || '-'], ['MISIONES VOLADAS', Q.misiones], ['MISIONES CUMPLIDAS', Q.cumplidas], ['DERRIBOS', derribos]]
        .forEach(([n, v], k) => E.fila(g, 70, cy + 44 + k * 44, wi - 36, M(n), v, C.amb, Math.min(12, wi / 32)));
      const ny = E.panel(g, xd, 156, wd, 500, M('NOVEDADES'), 'v' + version());
      let y = ny + 34;
      for (const n of (typeof NEWS !== 'undefined' ? NEWS : [])) {
        const lineas = E.lineas(g, E.sinTilde(sinEtiquetas(tr(n.real[0]))), wd - 40, 11);
        if (y + 26 + lineas.length * 20 > 646) break;
        E.t(g, 'v' + n.v, xd + 20, y, 13, C.amb); y += 26;
        for (const l of lineas) { E.t(g, l, xd + 20, y, 11, C.blanco); y += 20; }
        y += 18;
      }
      E.boton(g, zonas[0], '< ' + M('VOLVER'), false, 12);
      UI.cursor(g, zonas[cursor], est);
      E.pie(g, W, est.tactil ? [[M('TOCA'), M('VOLVER')]] : UI.teclas([['ESC', 'VOLVER']]));
    },
  };
})(WINGS);
