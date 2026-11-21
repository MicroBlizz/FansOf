// Fans of Pop · ATAQUES DE LOS COMPAÑEROS, lo que se ve y se oye (tarea #160, ADR 197), tras el flag 'ataques-companeros'.
// Con el flag abierto, el compañero que salta vuela por la ruta de su habilidad, se estira al despegar (con su cara de siempre),
// deja una estela de su color llena de sus cositas, golpea con doble onda y una ráfaga de cositas y el tablero tiembla
// (intensidad Fiesta). Las cuentas están en js/ataques.js (PP_ATAQUE). Cada cosita se pinta con img-liso/fx-<pieza>.png si
// Yoshi ya la pintó y llegó; si no, con una gotita de repuesto. Con el flag cerrado todo hace exactamente lo de siempre
// (ppFxImpacto y el sonido ppSalto). Lo engancha js/efectos.js (vuelo y avance), js/pintar.js (dibujo) y js/partida.js (golpe y sonido).
'use strict';
const PP_ATAQUE_FX = (() => {
  const OSC = '#1a1030';   // el contorno de Pop
  const estado = { parts: [], puntos: [], golpes: [] };
  const imgs = {};          // pieza → Image cargada, null mientras llega, false si no existe
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
  // la estela de un vuelo en este paso: un punto de color y las cositas que tocan
  function estela(v, dt) {
    const p = punto(v), e = PP_ATAQUE.emite(v.acc, dt);
    v.acc = e.acc;
    estado.puntos.push({ x: p.x, y: p.y, v: 1, col: v.ataque.color });
    for (let k = 0; k < e.n; k++) estado.parts.push(PP_ATAQUE.cosita(p.x, p.y, v.ataque, Math.random));
  }
  function avanza(dt, vuelos) {
    for (const v of vuelos) if (v.ataque && v.t < v.dur) estela(v, dt);
    estado.parts = PP_ATAQUE.avanzaCositas(estado.parts, dt);
    for (const q of estado.puntos) q.v -= dt * 2.6;
    estado.puntos = estado.puntos.filter(q => q.v > 0);
    for (const g of estado.golpes) g.t += dt;
    estado.golpes = estado.golpes.filter(g => g.t < 0.7);
  }
  // el golpe del compañero `id` al llegar a la burbuja i; con el flag cerrado, el de siempre
  function golpe(T, i, id) {
    if (!activo()) return ppFxImpacto(T, i, id === 'ceo');
    const a = ataqueDe(id), g = PP_ATAQUE.golpe(a.golpe, id === 'ceo'), [x, y] = ppCentro(ppGeom(T.n), i);
    for (const o of g.ondas) estado.golpes.push({ tipo: 'anillo', x, y, t: -o.retraso, k: o.k, col: a.color });
    if (g.extra && g.extra !== 'anillo') estado.golpes.push({ tipo: g.extra, x, y, t: 0, k: g.k, col: a.color });
    estado.parts.push(...PP_ATAQUE.rafaga(x, y, g, a, Math.random));
    PP_FX.temblor = Math.max(PP_FX.temblor, g.temblor);
    ppVibra(id === 'ceo' ? [40, 30, 60] : 30);
  }
  // el sonido al despegar: el de la forma si sonidos.js lo tiene; si no (o con el flag cerrado), el salto de siempre
  function suena(id) {
    const s = activo() ? ataqueDe(id).sonido : null;
    play(s && typeof SFX[s] === 'function' ? s : 'ppSalto');
  }

  /* ---------- dibujo ---------- */
  // la imagen de una pieza si ya llegó; la pide la primera vez (aún no existen: las pinta Yoshi)
  function imagen(pieza) {
    if (pieza in imgs) return imgs[pieza] || null;
    imgs[pieza] = null;
    const im = new Image(), v = typeof VERSION !== 'undefined' ? VERSION : '0';
    im.onload = () => { imgs[pieza] = im; };
    im.onerror = () => { imgs[pieza] = false; };
    im.src = 'img-liso/fx-' + pieza + '.png?v=' + v;
    return null;
  }
  // la gotita de repuesto: redonda, de su color, contorno oscuro grueso y un brillo
  function gotita(c, s, col) {
    c.beginPath(); c.arc(0, 0, s * 0.55, 0, Math.PI * 2); c.fillStyle = col; c.fill();
    c.lineWidth = Math.max(2, s * 0.2); c.strokeStyle = OSC; c.stroke();
    c.beginPath(); c.arc(-s * 0.18, -s * 0.18, s * 0.14, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill();
  }
  function pintaCosita(c, p) {
    const ent = Math.min(1, (p.max - p.vida) / 0.12), s = p.s * (0.5 + 0.5 * ent);
    c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.globalAlpha = Math.max(0, Math.min(1, p.vida / 0.3));
    const im = p.pieza === 'gotita' ? null : imagen(p.pieza);
    if (im) c.drawImage(im, -s, -s, s * 2, s * 2); else gotita(c, s * 1.4, p.color);
    c.restore();
  }
  const GOLPES = {
    // una onda con contorno oscuro y el color de su estela
    anillo(c, g) {
      const e = 1 - Math.pow(1 - Math.min(1, g.t / 0.5), 3);
      c.beginPath(); c.arc(g.x, g.y, (40 + 70 * e) * g.k, 0, Math.PI * 2); c.globalAlpha = 1 - e;
      c.lineWidth = 14 * (1 - e) + 5; c.strokeStyle = OSC; c.stroke();
      c.lineWidth = 9 * (1 - e) + 2.5; c.strokeStyle = g.col; c.stroke();
    },
    // tres arañazos blancos
    zarpa(c, g) {
      const p = Math.min(1, g.t / 0.14), k = g.k * 1.7;
      c.globalAlpha = Math.max(0, g.t > 0.35 ? 1 - (g.t - 0.35) / 0.35 : 1); c.lineCap = 'round';
      for (const off of [-13, 0, 13]) {
        const x0 = g.x + (off - 16) * k, y0 = g.y - 22 * k;
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + 30 * k * p, y0 + 44 * k * p);
        c.lineWidth = 9 * k; c.strokeStyle = OSC; c.stroke(); c.lineWidth = 4.5 * k; c.strokeStyle = '#ffffff'; c.stroke();
      }
    },
    // un destello de cuatro puntas que crece y se va
    destello(c, g) {
      const s = 50 * g.k * Math.sin(Math.min(1, g.t / 0.5) * Math.PI); if (s < 0.5) return;
      const q = s * 0.14;
      c.translate(g.x, g.y); c.rotate(g.t * 2); c.beginPath(); c.moveTo(0, -s);
      c.quadraticCurveTo(q, -q, s, 0); c.quadraticCurveTo(q, q, 0, s); c.quadraticCurveTo(-q, q, -s, 0); c.quadraticCurveTo(-q, -q, 0, -s);
      c.fillStyle = '#fff3a6'; c.fill(); c.lineWidth = 4; c.strokeStyle = OSC; c.stroke();
    },
  };
  function pinta(c) {
    for (const q of estado.puntos) { c.beginPath(); c.arc(q.x, q.y, 20 * q.v * PP_ATAQUE.FIESTA.estela, 0, Math.PI * 2); c.globalAlpha = 0.45 * q.v; c.fillStyle = q.col; c.fill(); }
    c.globalAlpha = 1;
    for (const g of estado.golpes) if (g.t >= 0) { c.save(); GOLPES[g.tipo](c, g); c.restore(); }
    for (const p of estado.parts) pintaCosita(c, p);
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
