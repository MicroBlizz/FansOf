// Fans of Boom · FÍSICA: el proyectil. Paso fijo y sin azar: el mismo ángulo, potencia y viento dan SIEMPRE el mismo tiro
// (así la IA puede simular y, más adelante, el online solo reparte acciones). Sin DOM.
'use strict';
const FISICA = (() => {
  const C = BOOM.movil, W = BOOM.mundo.ancho, H = BOOM.mundo.alto, DT = BOOM.paso;
  function boca(m) {   // dónde está la boca del cañón y hacia dónde apunta
    const a = m.ang * Math.PI / 180, dx = m.dir * Math.cos(a), dy = -Math.sin(a);
    return { x: m.x + dx * C.boca, y: m.y - C.centro + dy * C.boca, dx, dy };
  }
  // los proyectiles de un tiro: uno, o varios abiertos en abanico (multi). Devuelve una lista.
  function lanza(m, viento, ev, sat) {
    const t = m.def.tiros[m.tiro];
    if (t.satelite) {   // el satélite no vuela: el rayo baja sobre el último dardo (sat.obj) y explota ahí
      const o = sat && sat.obj || { x: m.x, y: m.y };
      return [{ x: o.x, y: o.y, vx: 0, vy: 0, viento: 0, ev: null, demora: 0, alto: false, t: 0, fin: null, ang: 0, dueno: m.id, def: t, traza: [], satelite: true }];
    }
    const n = t.multi ? t.multi.n : 1, lista = [];
    for (let i = 0; i < n; i++) {
      const a = m.ang + (t.multi ? (i - (n - 1) / 2) * t.multi.abanico : 0), b = boca(Object.assign({}, m, { ang: clamp(a, 0, 90) })), v = BOOM.velocidadMax * m.pot / 100;
      lista.push({ x: b.x, y: b.y, vx: b.dx * v, vy: b.dy * v, viento: t.ignoraViento || (ev && ev.def.sinViento) ? 0 : viento * (t.viento || 1), ev: ev || null, demora: 0, alto: false, t: 0, fin: null, ang: m.ang, dueno: m.id, def: t, traza: [] });
    }
    if (m.doble) lista.push(...lista.map(p => Object.assign({}, p, { demora: 0.45, traza: [] })));
    return lista;
  }
  // un paso: devuelve true cuando el proyectil ya ha terminado (p.fin dice cómo: terreno, movil, borde o vacio)
  function paso(p, moviles) {
    if (p.satelite) { p.t += DT; if (p.t < BOOM.satelite.demora) return false; p.fin = { tipo: 'terreno' }; return true; }
    const ed = p.ev && p.ev.def;
    p.vx += (p.viento * BOOM.viento.aceleracion + (ed && ed.ax ? ed.ax * p.ev.dir : 0) + (ed && ed.onda ? ed.onda * Math.sin(p.t * 9) : 0)) * DT; p.vy += (BOOM.gravedad * (p.def.gravedad || 1) + (ed && ed.ay || 0)) * DT;
    const n = Math.max(1, Math.ceil(Math.hypot(p.vx, p.vy) * DT / 4)), sx = p.vx * DT / n, sy = p.vy * DT / n;
    for (let i = 0; i < n; i++) {
      p.x += sx; p.y += sy;
      if (p.y < 0) p.alto = true;
      if (p.x < 0 || p.x >= W) { p.fin = { tipo: 'borde' }; return true; }
      if (p.y >= H + 40) { p.fin = { tipo: 'vacio' }; return true; }
      if (TERRENO.solido(p.x, p.y)) { p.fin = { tipo: 'terreno' }; return true; }
      for (const m of moviles) {
        if (!m.vivo || (m.id === p.dueno && p.t < 0.35)) continue;   // no se golpea a sí mismo nada más disparar
        if (Math.hypot(p.x - m.x, p.y - (m.y - C.centro)) < C.radio) { p.fin = { tipo: 'movil', movil: m.id }; return true; }
      }
    }
    p.t += DT;
    return p.t > 14;   // por si acaso: nunca dura para siempre
  }
  // simula un tiro entero de golpe (lo usa la IA): dónde acaba y si salió por arriba
  function simula(m, viento, moviles, ev, sat) {
    const l = lanza(Object.assign({}, m, { doble: false }), viento, ev, sat), p = l[Math.floor(l.length / 2)];   // con varios, se mide el del centro
    while (!paso(p, moviles)) { /* sigue */ }
    return p;
  }
  return { boca, lanza, paso, simula };
})();
