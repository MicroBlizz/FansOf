// Fans of Cooking · PARTIDA: el estado de un nivel y su simulación a paso fijo: la cocina en casillas, los dos cocineros y cómo se mueven,
// los pedidos, los puntos, el fuego, las cintas y los apagones. Lo que hace cada tecla sobre una casilla está en acciones.js. Sin DOM: se prueba con Node.
'use strict';
const PARTIDA = (() => {
  let P = null;
  const TILE = COOK.tile;
  const ESTACIONES = { '=': 'encimera', T: 'tabla', F: 'fogon', O: 'horno', L: 'olla', S: 'fregadero', P: 'platos', W: 'ventanilla', X: 'basura', E: 'extintor', '>': 'cinta', '<': 'cinta', '^': 'cinta', v: 'cinta', '#': 'pared', ' ': 'vacio', '.': 'suelo' };
  const DIRS = { '>': [1, 0], '<': [-1, 0], '^': [0, -1], v: [0, 1] };

  // construye las casillas de un mapa de texto (también lo usa el fondo de las pantallas)
  function construye(mapa) {
    const tiles = [], inicio = [[1, 2], [9, 2]];
    mapa.forEach((fila, y) => { tiles[y] = []; for (let x = 0; x < fila.length; x++) {
      const ch = fila[x], t = { x, y, t: ESTACIONES[ch] || 'suelo', item: null, prog: 0, fuego: 0, humo: 0, apagado: false };
      if (LETRA_ING[ch]) { t.t = 'cajon'; t.ing = LETRA_ING[ch]; }
      if (ch === '1' || ch === '2') inicio[+ch - 1] = [x, y];
      if (DIRS[ch]) t.dir = DIRS[ch];
      if (t.t === 'platos') t.platos = 4;
      if (t.t === 'fregadero') { t.sucios = 0; t.limpios = 0; }
      if (t.t === 'extintor') t.item = { tipo: 'extintor' };
      if (t.t === 'olla') t.ings = [];
      tiles[y][x] = t; } });
    return { tiles, inicio };
  }
  function nueva(cfg) {
    const N = cfg.nivel, R = RANGOS[N.ri], rnd = mulberry32(cfg.semilla || (Date.now() & 0xffff));
    const { tiles, inicio } = construye(N.mapa);
    const cocineros = cfg.cocineros.map((c, i) => ({ i, x: (inicio[i][0] + 0.5) * TILE, y: (inicio[i][1] + 0.5) * TILE, fx: 0, fy: 1, item: null, accion: null, key: c.key, nombre: c.nombre, color: COOK.colores[i ? 'j2' : 'j1'], anda: 0, entrada: { mx: 0, my: 0, coger: false, usar: false, cambiar: false, lanzar: false } }));
    if (cfg.modo === 'ia') cocineros[1].ia = {};   // el segundo lo lleva el compañero IA (ia.js)
    P = { nivel: N, rango: R, modo: cfg.modo, tiles, ancho: N.mapa[0].length, alto: N.mapa.length, cocineros, activo: 0, rnd,
      pedidos: [], siguientePedido: COOK.pedidos.primero, pedidoId: 0, tiempo: N.tiempo, t: 0, puntos: 0, combo: 0, servidos: 0, caducados: 0, fallos: 0,
      vuelven: [], vuelos: [], sucesos: [], fase: 'juego', pausa: false, apagon: 18 + rnd() * 10, cinta: 0, mensajes: [] };
    return P;
  }
  const get = () => P, parar = () => { P = null; };
  const suceso = (t, d) => P.sucesos.push(Object.assign({ t }, d || {}));
  const tile = (x, y) => (P.tiles[y] && P.tiles[y][x]) || null;
  const bloquea = t => !t || (t.t !== 'suelo');
  const cuenta = (tipo) => { let n = 0; for (const f of P.tiles) for (const t of f) if (t.t === tipo) n++; return n; };

  // la casilla que tiene delante un cocinero (la que toca con la mano): la de enfrente si no es suelo; si es suelo con algo tirado, esa
  function delante(c) {
    const cx = Math.floor(c.x / TILE), cy = Math.floor(c.y / TILE);
    const px = Math.floor((c.x + c.fx * TILE * COOK.cocinero.alcance) / TILE), py = Math.floor((c.y + c.fy * TILE * COOK.cocinero.alcance) / TILE);
    let t = tile(px, py);
    if (t && (px !== cx || py !== cy)) { if (t.t !== 'suelo' || t.item) return t; }
    // si delante no hay nada, vale la casilla a la que está más pegado en esa dirección
    const t2 = tile(cx + c.fx, cy + c.fy);
    if (t2 && (t2.t !== 'suelo' || t2.item)) return t2;
    return t && t.t === 'suelo' ? t : null;
  }

  function mueve(c, dt) {
    const e = c.entrada, v = COOK.cocinero.velocidad, r = COOK.cocinero.radio;
    let mx = e.mx, my = e.my; const l = Math.hypot(mx, my);
    if (l > 0.01) {
      mx /= l; my /= l; c.anda += dt * 10;
      if (Math.abs(mx) >= Math.abs(my)) { c.fx = Math.sign(mx); c.fy = 0; } else { c.fx = 0; c.fy = Math.sign(my); }
      const paso = (nx, ny) => {
        for (let ty = Math.floor((ny - r) / TILE); ty <= Math.floor((ny + r) / TILE); ty++) for (let tx = Math.floor((nx - r) / TILE); tx <= Math.floor((nx + r) / TILE); tx++) {
          if (!bloquea(tile(tx, ty))) continue;
          const cx = clamp(nx, tx * TILE, tx * TILE + TILE), cy = clamp(ny, ty * TILE, ty * TILE + TILE);
          if (Math.hypot(nx - cx, ny - cy) < r - 0.01) return false;
        }
        return true;
      };
      const nx = c.x + mx * v * dt, ny = c.y + my * v * dt;
      if (paso(nx, c.y)) c.x = nx; if (paso(c.x, ny)) c.y = ny;
      // los dos cocineros no se pisan
      for (const o of P.cocineros) if (o !== c) { const d = Math.hypot(c.x - o.x, c.y - o.y); if (d < r * 2 && d > 0.01) { const k = (r * 2 - d) / d; const px = (c.x - o.x) * k, py = (c.y - o.y) * k; if (paso(c.x + px, c.y + py)) { c.x += px; c.y += py; } } }
      if (c.accion) c.accion = null;   // andar corta lo que estaba haciendo
    } else c.anda = 0;
    c.x = clamp(c.x, r, P.ancho * TILE - r); c.y = clamp(c.y, r, P.alto * TILE - r);
  }

  function pedidosPaso(dt) {
    const C = COOK.pedidos, N = P.nivel;
    P.siguientePedido -= dt;
    if (P.siguientePedido <= 0 && P.pedidos.length < C.max && P.tiempo > 12) {
      const prev = P.pedidos.length ? P.pedidos[P.pedidos.length - 1].receta : null;
      let r = N.recetas[Math.floor(P.rnd() * N.recetas.length)];
      if (N.recetas.length > 1 && r === prev && P.rnd() < 0.6) r = N.recetas[(N.recetas.indexOf(r) + 1) % N.recetas.length];
      const dura = N.dura || C.dura; P.pedidos.push({ id: ++P.pedidoId, receta: r, t: dura, dura, nuevo: 1 });
      P.siguientePedido = N.cadencia || C.cadencia; suceso('pedido');
    }
    for (const p of P.pedidos) { p.t -= dt; p.nuevo = Math.max(0, p.nuevo - dt); }
    for (const p of P.pedidos.filter(p => p.t <= 0)) { P.pedidos.splice(P.pedidos.indexOf(p), 1); P.puntos += C.caduca; P.caducados++; P.combo = 0; suceso('caduca', { receta: p.receta }); }
    // los platos servidos vuelven sucios al fregadero
    for (const v of P.vuelven) v.t -= dt;
    for (const v of P.vuelven.filter(v => v.t <= 0)) {
      P.vuelven.splice(P.vuelven.indexOf(v), 1);
      const fr = []; for (const f of P.tiles) for (const t of f) if (t.t === 'fregadero') fr.push(t);
      if (fr.length) { fr[0].sucios++; suceso('platoVuelve'); } else { for (const f of P.tiles) for (const t of f) if (t.t === 'platos') { t.platos++; break; } }
    }
  }
  // sirve el plato que lleva un cocinero: si hay un pedido igual, puntos; si no, nadie lo ha pedido
  function sirve(c) {
    const it = c.item; if (!it || it.tipo !== 'plato' || it.sucio || !it.ings.length) return false;
    const r = recetaDe(it.ings); const ped = r && P.pedidos.filter(p => p.receta === r.id).sort((a, b) => a.t - b.t)[0];
    if (!ped) { P.fallos++; suceso('rechazo'); return false; }
    const C = COOK.pedidos, propina = Math.round(C.propinaMax * clamp(ped.t / ped.dura, 0, 1)) + 4 * Math.min(P.combo, C.comboMax - 1);
    P.pedidos.splice(P.pedidos.indexOf(ped), 1); P.puntos += C.base + propina; P.combo++; P.servidos++;
    c.item = null; P.vuelven.push({ t: COOK.tiempos.platoVuelve });
    suceso('sirve', { receta: r.id, puntos: C.base + propina, combo: P.combo, x: c.x, y: c.y });
    return true;
  }

  function cocinaPaso(dt) {
    const T = COOK.tiempos;
    for (const f of P.tiles) for (const t of f) {
      if (t.fuego) { t.fuego += dt; if (t.fuego > COOK.fuego.propaga) { t.fuego = 0.01; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const v = tile(t.x + dx, t.y + dy); if (v && v.t !== 'suelo' && v.t !== 'pared' && v.t !== 'vacio' && v.t !== 'ventanilla' && !v.fuego) { v.fuego = 0.01; suceso('fuego', { x: v.x, y: v.y }); break; } } } continue; }
      if (t.apagado) continue;
      if ((t.t === 'fogon' || t.t === 'horno') && t.item && t.item.tipo !== 'extintor') {
        const it = t.item, listo = t.t === 'fogon' ? T.sarten : T.horno, fin = it.tipo === 'monton' ? 'horneado' : (t.t === 'horno' ? 'horneado' : 'cocinado');
        if (it.estado !== fin && it.estado !== 'quemado') { t.prog += dt; if (t.prog >= listo) { it.estado = fin; if (it.tipo === 'monton') it.ings = it.ings.map(([n]) => [n, 'horneado']); t.prog = 0; suceso('listo', { x: t.x, y: t.y }); } }
        else if (it.estado === fin) { t.prog += dt; if (t.prog >= T.quemar) { it.estado = 'quemado'; if (it.tipo === 'monton') it.ings = it.ings.map(([n]) => [n, 'quemado']); t.prog = 0; t.humo = 0.01; suceso('quema', { x: t.x, y: t.y }); } }
        else if (it.estado === 'quemado') { t.humo += dt; if (t.humo > COOK.fuego.aviso) { t.fuego = 0.01; t.humo = 0; suceso('fuego', { x: t.x, y: t.y }); } }
      }
      // la olla solo arranca cuando lo que lleva es una receta completa (así da tiempo a echar el resto)
      if (t.t === 'olla' && t.ings.length && !t.item) { const nombres = t.ings.map(([n]) => n).sort().join('+'); if (!RECETAS.some(r => r.olla && r.olla.slice().sort().join('+') === nombres)) { t.prog = 0; continue; } t.prog += dt; if (t.prog >= T.olla) { const nombres = t.ings.map(([n]) => n).sort(); t.item = { tipo: 'ing', ing: 'sopa', estado: nombres.join('+'), raro: !RECETAS.some(r => r.olla && r.olla.slice().sort().join('+') === nombres.join('+')) }; t.ings = []; t.prog = 0; suceso('listo', { x: t.x, y: t.y }); } }
      else if (t.t === 'olla' && t.item && t.item.ing === 'sopa' && t.item.estado !== 'quemado') { t.prog += dt; if (t.prog >= T.quemar * 1.6) { t.item.estado = 'quemado'; t.prog = 0; t.humo = 0.01; suceso('quema', { x: t.x, y: t.y }); } }
      else if (t.t === 'olla' && t.item && t.item.estado === 'quemado') { t.humo += dt; if (t.humo > COOK.fuego.aviso * 2) { t.fuego = 0.01; t.humo = 0; suceso('fuego', { x: t.x, y: t.y }); } }
    }
    // las cintas: lo que hay encima avanza una casilla cada poco
    P.cinta += dt;
    if (P.cinta >= 0.8) {
      P.cinta = 0; const movidos = new Set();
      for (const f of P.tiles) for (const t of f) if (t.t === 'cinta' && t.item && !movidos.has(t.item)) {
        const v = tile(t.x + t.dir[0], t.y + t.dir[1]);
        if (v && (v.t === 'cinta' || v.t === 'encimera' || v.t === 'suelo') && !v.item) { v.item = t.item; t.item = null; movidos.add(v.item); }   // al final de la cinta cae al suelo, y de ahí se recoge
      }
    }
    // IAhorro apaga un fogón, horno u olla «para ahorrar luz»
    if (P.rango.apagones) { P.apagon -= dt; if (P.apagon <= 0) { P.apagon = 16 + P.rnd() * 12; const cand = []; for (const f of P.tiles) for (const t of f) if ((t.t === 'fogon' || t.t === 'horno' || t.t === 'olla') && !t.apagado && !t.fuego) cand.push(t); if (cand.length) { const t = cand[Math.floor(P.rnd() * cand.length)]; t.apagado = true; suceso('apagon', { x: t.x, y: t.y }); } } }
  }

  function paso() {
    if (!P || P.fase !== 'juego') return;
    const dt = COOK.paso; P.t += dt; P.tiempo -= dt;
    for (const c of P.cocineros) {
      const e = c.entrada, propio = P.modo === 'dobles' || c.i === P.activo || !!c.ia;
      if (P.modo === 'solo' && e.cambiar && c.i === P.activo) { P.activo = 1 - P.activo; suceso('cambio'); }
      if (c.ia && typeof IA !== 'undefined') IA.paso(P, c, dt);   // el compañero IA decide y «pulsa» sus teclas
      if (propio) { mueve(c, dt); ACCIONES.aplica(c, dt); }
      else { c.anda = 0; ACCIONES.sigue(c, dt); }   // el cocinero que no llevas termina lo que estaba haciendo (cortar, lavar)
      e.coger = false; e.cambiar = false; e.lanzar = false;
    }
    pedidosPaso(dt); cocinaPaso(dt);
    if (P.tiempo <= 0) { P.tiempo = 0; P.fase = 'fin'; P.estrellas = P.nivel.estrellas.filter(u => P.puntos >= u).length; suceso('fin'); }
  }
  const sucesos = () => { const s = P ? P.sucesos : []; if (P) P.sucesos = []; return s; };
  return { nueva, construye, get, parar, paso, sucesos, tile, delante, sirve, suceso, cuenta };
})();
