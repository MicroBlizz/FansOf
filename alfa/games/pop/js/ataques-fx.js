// Fans of Pop · ATAQUES DE LOS COMPAÑEROS, lo que se ve y se oye (tarea #160, ADR 197), tras el flag 'ataques-companeros'.
// Con el flag abierto, el compañero que salta vuela por su ruta PROPIA (revisión del 21-11-2026: un ataque por compañero), se
// estira al despegar (con su cara de siempre), deja una estela de su color llena de sus cositas, golpea con doble aro de luz,
// su golpe propio y una ráfaga de cositas y confeti, y el tablero se mece un poco (intensidad Fiesta), todo cozy y sin
// contorno, en el estilo fijo del compañero (hada o acuarela). Las cuentas están en js/ataques.js (PP_ATAQUE), el dibujo de
// cada estilo en js/ataques-estilos.js (PP_ATAQUE_ESTILO, con las piezas de js/ataques-piezas.js o los dibujos
// img-liso/fx-<pieza>.png de Yoshi si ya llegaron) y los golpes en js/ataques-golpes.js. Con el flag cerrado todo hace
// exactamente lo de siempre (ppFxImpacto y el sonido ppSalto). Lo engancha js/efectos.js (vuelo y avance), js/pintar.js
// (dibujo) y js/partida.js (golpe y sonido).
'use strict';
const PP_ATAQUE_FX = (() => {
  const estado = { parts: [], puntos: [], golpes: [] };
  const activo = () => NUCLEO.flag('ataques-companeros', 'Pop: ataques de los compañeros con estela y golpe propios (tarea #160)', false);
  // el ataque de un compañero: su habilidad (la ficha del álbum) y su color, por si no tiene fila de cositas
  function ataqueDe(id) {
    const info = PP_COMP.INFO[id], sl = ppSlimeDe(id) || {};
    return PP_ATAQUE.de(id, info ? info.hab : null, sl.color2 || sl.color || '#ffffff');
  }
  function limpia() { estado.parts = []; estado.puntos = []; estado.golpes = []; }
  // un vuelo nuevo (lo crea ppFxVuelo): con el flag abierto lleva su ataque; cerrado no se toca
  function prepara(v) { if (activo()) { v.ataque = ataqueDe(v.id); v.acc = 0; } }
  const punto = v => PP_ATAQUE.ruta(v.ataque.vuelo, { x: v.x0, y: v.y0 }, { x: v.x1, y: v.y1 }, v.t / v.dur);
  // la estela de un vuelo en este paso: un punto de luz (o de aguada) y las cositas que tocan, cada una con su mota de polvo
  function estela(v, dt) {
    const p = punto(v), e = PP_ATAQUE.emite(v.acc, dt), a = v.ataque;
    v.acc = e.acc;
    estado.puntos.push({ x: p.x, y: p.y, v: 1, rot: Math.random() * Math.PI * 2, col: PP_ATAQUE_ESTILO.pastel(a.color), estilo: a.estilo });
    for (let k = 0; k < e.n; k++) estado.parts.push(PP_ATAQUE.cosita(p.x, p.y, a, Math.random), PP_ATAQUE.polvo(p.x, p.y, a, Math.random));
  }
  function avanza(dt, vuelos) {
    for (const v of vuelos) if (v.ataque && v.t < v.dur) estela(v, dt);
    estado.parts = PP_ATAQUE.avanzaCositas(estado.parts, dt);
    for (const q of estado.puntos) q.v -= dt * PP_ATAQUE_ESTILO.DESVANECE[q.estilo];
    estado.puntos = estado.puntos.filter(q => q.v > 0);
    for (const g of estado.golpes) g.t += dt;
    estado.golpes = estado.golpes.filter(g => g.t < g.dur);
  }
  // el golpe del compañero `id` al llegar a la burbuja i; con el flag cerrado, el de siempre
  function golpe(T, i, id) {
    if (!activo()) return ppFxImpacto(T, i, id === 'ceo');
    const a = ataqueDe(id), g = PP_ATAQUE.golpe(a.golpe, id === 'ceo'), [x, y] = ppCentro(ppGeom(T.n), i);
    estado.golpes.push(...PP_ATAQUE_GOLPES.golpes(x, y, g, a, Math.random));
    estado.parts.push(...PP_ATAQUE.rafaga(x, y, g, a, Math.random));
    PP_FX.temblor = Math.max(PP_FX.temblor, g.temblor);
    ppVibra(id === 'ceo' ? [40, 30, 60] : 30);
  }
  // el sonido al despegar: el de la forma si sonidos.js lo tiene; si no (o con el flag cerrado), el salto de siempre
  function suena(id) {
    const s = activo() ? ataqueDe(id).sonido : null;
    play(s && typeof SFX[s] === 'function' ? s : 'ppSalto');
  }

  /* ---------- dibujo (en el estilo de cada compañero: js/ataques-estilos.js) ---------- */
  // detrás el manchón de aguada; luego la estela, las cositas y delante los aros y el dibujo propio de cada golpe
  function pinta(c) {
    const E = PP_ATAQUE_ESTILO, G = PP_ATAQUE_GOLPES;
    for (const g of estado.golpes) if (g.fondo) G.pinta(c, g);
    for (const q of estado.puntos) E.pintaPunto(c, q);
    for (const p of estado.parts) E.pintaCosita(c, p);
    for (const g of estado.golpes) if (!g.fondo) G.pinta(c, g);
  }
  // el compañero en el aire: por su ruta, girando lo que diga y estirado al despegar, con su cara de siempre
  function pintaVuelo(c, v, t) {
    const u = Math.min(1, v.t / v.dur), p = punto(v), [sx, sy] = PP_ATAQUE.estira(u);
    c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.scale(sx, sy);
    ppSlimeRepuestoOImagen(c, v.id, 0, 0, 34 + Math.sin(u * Math.PI) * 10, t, 1);
    c.restore();
  }
  return Object.freeze({ activo, ataqueDe, limpia, prepara, avanza, golpe, suena, pinta, pintaVuelo, estado });
})();
