// Fans of Cooking · IA-CAMINO: cómo se mueve el compañero IA: distancias por la cocina (BFS entre casillas de suelo), la casilla desde la que se
// llega a cada estación, el camino hasta ella, y el paso de cada fotograma: replanificar con IA.decide, andar, centrarse, mirar al objetivo y
// «pulsar» COGER o USAR como una persona. También los atascos: si los dos cocineros se estorban, uno espera o se aparta. Sin DOM: se prueba con Node.
'use strict';
const IA_CAMINO = (() => {
  const T = COOK.tile;
  const tileDe = c => [Math.floor(c.x / T), Math.floor(c.y / T)];
  const estado = c => (c.ia && c.ia.espera !== undefined) ? c.ia : (c.ia = { plan: null, ruta: null, acc: null, t: 0, claim: null, espera: 0, ultimo: 0, huye: 0, mejor: 1e9, sinAvance: 0 });
  /* ---------- caminos: distancias desde el cocinero a cada casilla de suelo ---------- */
  function distancias(P, c, evitar) {
    const [sx, sy] = tileDe(c), dist = {}, prev = {}, cola = [[sx, sy]]; dist[sx + ',' + sy] = 0;
    if (evitar) dist[evitar[0] + ',' + evitar[1]] = -1;   // la casilla del otro cocinero, cuando nos estorbamos
    while (cola.length) {
      const [x, y] = cola.shift(), d = dist[x + ',' + y];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny, t = PARTIDA.tile(nx, ny);
        if (!t || t.t !== 'suelo' || dist[k] !== undefined) continue;
        dist[k] = d + 1; prev[k] = x + ',' + y; cola.push([nx, ny]);
      }
    }
    return { dist, prev };
  }
  // la casilla de suelo más cercana pegada al objetivo, o null si no se llega
  function acceso(D, t) {
    let mejor = null;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (t.x + dx) + ',' + (t.y + dy), d = D.dist[k]; if (d !== undefined && (!mejor || d < mejor.d)) mejor = { d, x: t.x + dx, y: t.y + dy }; }
    return mejor;
  }
  const alcanzable = (D, t) => !!acceso(D, t);
  function ruta(D, ax, ay) { const r = []; let k = ax + ',' + ay; while (k && D.prev[k]) { const [x, y] = k.split(',').map(Number); r.unshift([x, y]); k = D.prev[k]; } return r; }

  /* ---------- ejecutar: andar hasta la casilla de acceso y pulsar ---------- */
  function paso(P, c, dt) {
    const E = estado(c), e = c.entrada; e.mx = 0; e.my = 0; e.usar = false;
    E.t += dt; E.espera = Math.max(0, E.espera - dt);
    if (E.t >= 0.12 || !E.plan) {   // replanificar
      E.t = 0; const D = distancias(P, c); E.D = D;
      const plan = IA.decide(P, c, D) || { espera: true }; E.claim = plan.claim || null;
      if (plan.espera || !plan.objetivo) { E.plan = { espera: true, claim: plan.claim }; E.ruta = null; }
      else { const a = acceso(D, plan.objetivo); if (!a) { E.plan = { espera: true }; E.ruta = null; } else { const cambia = !E.plan || !E.plan.objetivo || E.plan.objetivo !== plan.objetivo || E.plan.accion !== plan.accion; E.plan = plan; E.acc = a; if (cambia || !E.ruta) { E.ruta = ruta(D, a.x, a.y); E.mejor = 1e9; E.sinAvance = 0; } } }
    }
    const plan = E.plan; if (!plan || plan.espera) { apartarse(P, c, e); return; }
    if (E.espera > 0) { apartarse(P, c, e); return; }
    const [tx, ty] = tileDe(c), a = E.acc;
    // atasco: si no me acerco a mi casilla de acceso en un rato, uno se aparta del otro y el camino evita al otro cocinero
    const dAcc = Math.hypot((a.x + 0.5) * T - c.x, (a.y + 0.5) * T - c.y);
    if (dAcc < (E.mejor === undefined ? 1e9 : E.mejor) - 2) { E.mejor = dAcc; E.sinAvance = 0; } else E.sinAvance = (E.sinAvance || 0) + dt;
    const o = P.cocineros.find(k => k !== c);
    if (E.huye > 0) { E.huye -= dt; if (o) huir(c, o, e); return; }
    if (E.sinAvance > 0.9 && !(tx === a.x && ty === a.y)) {
      E.sinAvance = 0; E.mejor = 1e9;
      if (o && Math.hypot(c.x - o.x, c.y - o.y) < T * 1.3) { if (c.i === 1) E.huye = 0.45; else E.espera = 0.5; }
      E.D = distancias(P, c, o ? tileDe(o) : null); const a2 = acceso(E.D, plan.objetivo); if (a2) { E.acc = a2; E.ruta = ruta(E.D, a2.x, a2.y); }
      E.t = -0.5; return;
    }
    if (tx === a.x && ty === a.y) {
      // en la casilla de acceso: me centro, miro al objetivo y pulso
      // (si el otro me empuja y no consigo centrarme, pulso igual: lo que cuenta es la casilla y hacia dónde miro)
      const cx = (a.x + 0.5) * T, cy = (a.y + 0.5) * T, ox = cx - c.x, oy = cy - c.y;
      if (Math.hypot(ox, oy) > 12 && E.sinAvance < 0.5) { e.mx = Math.sign(ox) * (Math.abs(ox) > 4 ? 1 : 0); e.my = Math.sign(oy) * (Math.abs(oy) > 4 ? 1 : 0); return; }
      c.fx = Math.sign(plan.objetivo.x - a.x); c.fy = Math.sign(plan.objetivo.y - a.y);
      if (plan.accion === 'esperar') return;
      if (plan.accion === 'usar') { e.usar = true; c.accion = c.accion || null; return; }
      if (E.ultimo > 0) { E.ultimo -= dt; return; }
      if (plan.accion === 'coger') e.coger = true; else if (plan.accion === 'lanzar') e.lanzar = true;
      E.ultimo = 0.25; E.t = 0.12;   // y replanificar enseguida
      return;
    }
    // andando: hacia la siguiente casilla del camino
    if (!E.ruta || !E.ruta.length) { E.t = 0.12; return; }
    let [nx, ny] = E.ruta[0]; if (nx === tx && ny === ty) { E.ruta.shift(); if (!E.ruta.length) return; [nx, ny] = E.ruta[0]; }
    const cx = (nx + 0.5) * T, cy = (ny + 0.5) * T, ox = cx - c.x, oy = cy - c.y;
    if (Math.abs(ox) > Math.abs(oy)) { e.mx = Math.sign(ox); e.my = Math.abs(oy) > 10 ? Math.sign(oy) : 0; } else { e.my = Math.sign(oy); e.mx = Math.abs(ox) > 10 ? Math.sign(ox) : 0; }
    if (c.accion) c.accion = null;
  }
  // huir del otro cocinero: hacia la casilla de suelo que más me aleje de él (nunca contra una pared)
  function huir(c, o, e) {
    const [tx, ty] = tileDe(c); let mejor = null, md = -1;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const t = PARTIDA.tile(tx + dx, ty + dy); if (!t || t.t !== 'suelo') continue;
      const d = Math.hypot((tx + dx + 0.5) * T - o.x, (ty + dy + 0.5) * T - o.y); if (d > md) { md = d; mejor = [dx, dy]; }
    }
    if (mejor) { e.mx = mejor[0]; e.my = mejor[1]; }
  }
  // sin nada que hacer: si estoy en el camino del otro cocinero, me quito de en medio
  function apartarse(P, c, e) {
    const o = P.cocineros.find(k => k !== c); if (!o || !o.ia || !o.ia.plan || o.ia.plan.espera || !o.ia.acc) return;
    const [tx, ty] = tileDe(c), estorbo = new Set([o.ia.acc.x + ',' + o.ia.acc.y, ...(o.ia.ruta || []).map(([x, y]) => x + ',' + y)]);
    if (!estorbo.has(tx + ',' + ty) && Math.hypot(c.x - o.x, c.y - o.y) > T * 1.2) return;
    const [ox, oy] = tileDe(o);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = tx + dx, ny = ty + dy, t = PARTIDA.tile(nx, ny);
      if (!t || t.t !== 'suelo' || estorbo.has(nx + ',' + ny) || (nx === ox && ny === oy)) continue;
      e.mx = dx; e.my = dy; return;
    }
  }
  return { distancias, acceso, alcanzable, ruta, paso };
})();
