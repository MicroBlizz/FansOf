// Fans of Boom · FÍSICA: el proyectil. Paso fijo y sin azar: el mismo ángulo, potencia y viento dan SIEMPRE el mismo tiro
// (así la IA puede simular y, más adelante, el online solo reparte acciones). Sin DOM.
'use strict';
const FISICA = (() => {
  const C = BOOM.movil, W = BOOM.mundo.ancho, H = BOOM.mundo.alto, DT = BOOM.paso;
  function boca(m) {   // dónde está la boca del cañón y hacia dónde apunta
    const a = m.ang * Math.PI / 180, dx = m.dir * Math.cos(a), dy = -Math.sin(a);
    return { x: m.x + dx * C.boca, y: m.y - C.centro + dy * C.boca, dx, dy };
  }
  // un proyectil: sale de (x, y) con esa velocidad; def = el tiro (o el trozo) que lleva
  const nuevo = (x, y, vx, vy, viento, ev, dueno, ang, def) => ({ x, y, vx, vy, viento, ev: ev || null, demora: 0, alto: false, t: 0, fin: null, ang, dueno, def, traza: [], atraviesa: 0, veces: 0 });
  // los proyectiles de un tiro: uno, o varios abiertos en abanico (multi). Devuelve una lista.
  function lanza(m, viento, ev) {
    const t = m.def.tiros[m.tiro], n = t.multi ? t.multi.n : 1, lista = [];
    for (let i = 0; i < n; i++) {
      const a = m.ang + (t.multi ? (i - (n - 1) / 2) * t.multi.abanico : 0), b = boca(Object.assign({}, m, { ang: clamp(a, 0, 90) })), v = BOOM.velocidadMax * m.pot / 100;
      lista.push(nuevo(b.x, b.y, b.dx * v, b.dy * v, t.ignoraViento || (ev && ev.def.sinViento) ? 0 : viento * (t.viento == null ? 1 : t.viento), ev, m.id, m.ang, t));
    }
    if (m.doble) lista.push(...lista.map(p => Object.assign({}, p, { demora: 0.45, traza: [] })));
    return lista;
  }
  // un paso: devuelve true cuando el proyectil ya ha terminado (p.fin dice cómo: terreno, movil, borde o vacio)
  function paso(p, moviles) {
    const ed = p.ev && p.ev.def, ef = p.def.efecto;
    const subia = p.vy < 0;
    if (p.bajo) {   // bajo tierra: sin viento, flota hacia arriba y se frena; con mucha velocidad baja más antes de dar la vuelta
      p.vy += BOOM.gravedad * (1 - ef.flota) * DT; p.vx *= 1 - ef.freno * DT; p.vy *= 1 - ef.freno * DT;
    } else {
      p.vx += (p.viento * BOOM.viento.aceleracion + (ed && ed.ax ? ed.ax * p.ev.dir : 0) + (ed && ed.onda ? ed.onda * Math.sin(p.t * 9) : 0)) * DT; p.vy += (BOOM.gravedad * (p.def.gravedad || 1) + (ed && ed.ay || 0)) * DT;
    }
    p.cima = subia && p.vy >= 0;   // justo ahora llega a lo más alto (ahí se abre el racimo o salta el glitch)
    if (p.cima && ef && ef.tipo === 'glitch' && !p.glitch) {   // se teletransporta hacia delante; si cae dentro del suelo, explota ahí
      p.glitch = { x: p.x, y: p.y }; p.x = clamp(p.x + Math.sign(p.vx || 1) * ef.salto, 1, W - 1); p.traza = [];
    }
    const n = Math.max(1, Math.ceil(Math.hypot(p.vx, p.vy) * DT / 4)), sx = p.vx * DT / n, sy = p.vy * DT / n;
    for (let i = 0; i < n; i++) {
      p.x += sx; p.y += sy;
      if (p.y < 0 && !p.def.cae) p.alto = true;   // lo que ya cae del cielo (obuses, bombas) no cuenta como tiro alto
      if (p.x < 0 || p.x >= W) { p.fin = { tipo: 'borde' }; return true; }
      if (p.y >= H + 40) { p.fin = { tipo: 'vacio' }; return true; }
      const suelo = p.atraviesa <= 0 && TERRENO.solido(p.x, p.y);
      if (p.bajo && !suelo) { p.fin = { tipo: 'terreno' }; return true; }   // vuelve a salir del terreno, por donde sea: explota ahí
      if (suelo) {
        if (ef && (ef.tipo === 'fantasma' || ef.tipo === 'taladro')) p.bajo = true;   // estos siguen por dentro del suelo
        else { p.fin = { tipo: 'terreno' }; return true; }
      }
      for (const m of moviles) {
        if (!m.vivo || p.atraviesa > 0 || (m.id === p.dueno && p.t < 0.35)) continue;   // no se golpea a sí mismo nada más disparar
        if (Math.hypot(p.x - m.x, p.y - (m.y - C.centro)) < C.radio) { p.fin = { tipo: 'movil', movil: m.id }; return true; }
      }
    }
    if (p.atraviesa > 0) p.atraviesa -= DT;
    p.t += DT;
    return p.t > 14;   // por si acaso: nunca dura para siempre
  }
  // simula un tiro entero de golpe (lo usa la IA): dónde acaba y si salió por arriba
  function simula(m, viento, moviles, ev) {
    const l = lanza(Object.assign({}, m, { doble: false }), viento, ev), p = l[Math.floor(l.length / 2)];   // con varios, se mide el del centro
    while (!paso(p, moviles)) { /* sigue */ }
    return p;
  }
  // la trayectoria que seguirá el tiro (para el modo Entrenamiento): un punto cada dos pasos y dónde acaba
  function traza(m, viento, moviles, ev) {
    const l = lanza(Object.assign({}, m, { doble: false }), viento, ev), p = l[Math.floor(l.length / 2)], puntos = [];
    for (let i = 0; !paso(p, moviles); i++) if (i % 2 === 0) puntos.push(p.x, p.y);
    puntos.push(p.x, p.y);
    return { puntos, p };
  }
  return { boca, lanza, paso, simula, traza, nuevo };
})();
