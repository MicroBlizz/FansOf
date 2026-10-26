// Fans Of Taxi · TROZOS: el mundo se monta por partes. Siempre está lo lejano: el suelo de todo el mundo (un vértice cada 16 m, color
// por vértice), todos los edificios como cajas lisas, todas las carreteras como cintas y los pinos y rocas del campo, en cuatro mallas
// sin contorno (así desde un mirador se ve el mundo entero y nada aparece de golpe). Alrededor del jugador se cargan los trozos de
// 256 m con detalle: el suelo pintado en un lienzo (calles, aceras, río, márgenes) sobre una rejilla con las alturas, y una malla con
// todo lo fijo del trozo (edificios, árboles, rocas, puentes, quitamiedos, túneles, miradores, rampas) más su contorno; lo lejano queda
// escondido dentro o debajo del detalle. Se monta un trozo por fotograma y se descargan los lejanos.
'use strict';
const TROZOS = (() => {
  const M = TAXI.mundo, TR = M.trozo;
  let T, escena, U, lejos, lejosMallas = [], cargados = new Map(), cola = [], ultimo = null;
  const COLOR = { asfalto: '#2a2438', acera: '#8a8399', hierba: '#3f7d3b', tierra: '#6b4f3a', nieve: '#e8e4f2', agua: '#1d3a6e', tunel: '#1a1426', roca: '#6e6478' };
  const colorSuelo = s => COLOR[s] || COLOR.hierba;

  function iniciar(three, esc, util) { T = three; escena = esc; U = util; montaLejos(); }

  // --- el suelo lejano: todo el mundo, sin detalle, con el color de cada suelo en los vértices
  function montaLejos() {
    const R = M.resLejos, nx = Math.ceil(M.ancho / R), nz = Math.ceil(M.largo / R);
    const geo = new T.PlaneGeometry(M.ancho, M.largo, nx, nz); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), c = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + M.ancho / 2, z = pos.getZ(i) + M.largo / 2;
      // siempre por debajo del suelo con detalle (que asomara entre sus vértices): el mínimo de la celda, y un poco más abajo
      let h = CIUDAD.alturaSuelo(x, z); for (const [dx, dz] of [[-R / 2, 0], [R / 2, 0], [0, -R / 2], [0, R / 2], [-R / 2, -R / 2], [R / 2, R / 2]]) h = Math.min(h, CIUDAD.alturaSuelo(x + dx, z + dz));
      pos.setY(i, h - 1.2);
      let s = CIUDAD.suelo(x, z); if (s === 'tierra' && TERRENO.natural(x, z) > M.roca) s = 'roca';
      c.set(colorSuelo(s)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.computeVertexNormals();
    lejos = new T.Mesh(geo, new T.MeshLambertMaterial({ vertexColors: true })); lejos.position.set(M.ancho / 2, 0, M.largo / 2); escena.add(lejos);
    // los edificios de todo el mundo, un poco más pequeños y más bajos que los de verdad (quedan dentro cuando llega el detalle)
    const cajas = [];
    for (const m of CIUDAD.celdas) for (const e of m.edificios) { const y = CIUDAD.alturaSuelo(e.x, e.z) - 4; cajas.push(U.caja(e.color, [e.x, y + (e.h + 3) / 2, e.z], [e.w - 0.8, e.h + 3, e.d - 0.8])); }
    for (const p of CIUDAD.puentes) cajas.push(U.caja(0x4a4060, [p.x, p.y - 0.8, p.z], [p.ancho, 1, p.largo - 1], [0, p.ang, 0]));
    lejosMalla(cajas);
    // el campo: pinos y rocas, más pequeños que los de verdad
    const campo = [];
    for (const o of CIUDAD.campo) { const y = CIUDAD.alturaSuelo(o.x, o.z); if (o.tipo === 'roca') campo.push({ geo: new T.DodecahedronGeometry(o.radio * 0.8, 0), color: 0x6e6478, p: [o.x, y + o.alto * 0.25, o.z], r: [0, o.x, 0] }); else campo.push({ geo: new T.ConeGeometry(o.radio * 1.1, o.alto * 0.7, 5), color: 0x2f6e3a, p: [o.x, y + o.alto * 0.55, o.z] }); }
    lejosMalla(campo);
    // las carreteras: una cinta por tramo (sin los túneles), un poco por debajo del suelo con detalle y por encima del lejano
    const pts = [], col2 = [], c2 = new T.Color(colorSuelo('asfalto')), ct = new T.Color(colorSuelo('tierra')), n = CIUDAD.nodos;
    const cinta = (a, b, ancho, color, hunde) => {
      const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, k = Math.max(1, Math.ceil(L / 24));
      for (let i = 0; i < k; i++) {
        const t0 = i / k, t1 = (i + 1) / k, p0 = [lerp(a.x, b.x, t0), lerp(a.y, b.y, t0) - hunde, lerp(a.z, b.z, t0)], p1 = [lerp(a.x, b.x, t1), lerp(a.y, b.y, t1) - hunde, lerp(a.z, b.z, t1)];
        const ox = -uz * ancho / 2, oz = ux * ancho / 2;
        const v = [[p0[0] - ox, p0[1], p0[2] - oz], [p0[0] + ox, p0[1], p0[2] + oz], [p1[0] + ox, p1[1], p1[2] + oz], [p1[0] - ox, p1[1], p1[2] - oz]];
        for (const q of [0, 1, 2, 0, 2, 3]) { pts.push(...v[q]); col2.push(color.r, color.g, color.b); }
      }
    };
    for (const e of CIUDAD.aristas) if (e.tipo !== 'tunel' && e.margen > 0) cinta(n[e.a], n[e.b], e.ancho + e.margen * 2, ct, 0.5);
    for (const e of CIUDAD.aristas) if (e.tipo !== 'tunel' && e.tipo !== 'rampa') cinta(n[e.a], n[e.b], e.ancho, c2, 0.35);
    const gc = new T.BufferGeometry(); gc.setAttribute('position', new T.BufferAttribute(new Float32Array(pts), 3)); gc.setAttribute('color', new T.BufferAttribute(new Float32Array(col2), 3)); gc.computeVertexNormals();
    const mc = new T.Mesh(gc, new T.MeshLambertMaterial({ vertexColors: true })); escena.add(mc); lejosMallas.push(mc);
  }
  function lejosMalla(piezas) { if (!piezas.length) return; const m = new T.Mesh(U.unir(piezas), new T.MeshLambertMaterial({ vertexColors: true })); escena.add(m); lejosMallas.push(m); }

  // --- qué trozos hacen falta ahora; se monta uno por llamada
  function actualizar(x, z) {
    const ci = Math.floor(x / TR), cj = Math.floor(z / TR);
    if (!ultimo || ultimo.ci !== ci || ultimo.cj !== cj || ultimo.n !== cargados.size) {
      ultimo = { ci, cj, n: cargados.size };
      const quiero = [];
      for (let i = ci - 2; i <= ci + 2; i++) for (let j = cj - 2; j <= cj + 2; j++) {
        if (i < 0 || j < 0 || i >= CIUDAD.NTX || j >= CIUDAD.NTZ) continue;
        const d = Math.hypot(Math.max(i * TR - x, 0, x - (i + 1) * TR), Math.max(j * TR - z, 0, z - (j + 1) * TR));   // distancia al borde del trozo
        if (d < M.radioCarga) quiero.push({ k: i * CIUDAD.NTZ + j, d });
      }
      quiero.sort((a, b) => a.d - b.d);
      cola = quiero.filter(q => !cargados.has(q.k)).map(q => q.k);
      for (const [k, tr] of cargados) if (!quiero.some(q => q.k === k)) { descarga(tr); cargados.delete(k); }
    }
    if (cola.length) { const k = cola.shift(); if (!cargados.has(k)) cargados.set(k, monta(CIUDAD.trozos[k])); }
  }
  function descarga(tr) { for (const m of tr.mallas) { escena.remove(m); if (m.geometry) m.geometry.dispose(); const mat = m.material; if (mat) { if (mat.map) mat.map.dispose(); mat.dispose(); } } }

  // --- el suelo de un trozo: lienzo pintado sobre una rejilla con alturas
  function pinta(t) {
    const ppm = M.texturaPxPorMetro, c = document.createElement('canvas'); c.width = c.height = Math.ceil(TR * ppm);
    const g = c.getContext('2d'); g.scale(ppm, ppm); g.translate(-t.x0, -t.z0);
    // la base: qué suelo hay cada 8 m
    for (let x = t.x0; x < t.x1; x += 8) for (let z = t.z0; z < t.z1; z += 8) { let s = CIUDAD.suelo(x + 4, z + 4); if (s === 'tierra' && TERRENO.natural(x + 4, z + 4) > M.roca) s = 'roca'; g.fillStyle = colorSuelo(s); g.fillRect(x - 0.5, z - 0.5, 9, 9); }
    // el río
    g.strokeStyle = COLOR.agua; g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = 0; i < t.rio.length - 1; i++) { const a = t.rio[i], b = t.rio[i + 1]; if (Math.abs(a.z - b.z) > 45) continue; g.lineWidth = (a.ancho + b.ancho) / 2; g.beginPath(); g.moveTo(a.x, a.z); g.lineTo(b.x, b.z); g.stroke(); }
    // las celdas de las ciudades: acera y dentro
    for (const m of t.celdas) {
      g.fillStyle = COLOR.acera; g.fillRect(m.x0, m.z0, m.x1 - m.x0, m.z1 - m.z0);
      g.fillStyle = m.parque ? COLOR.hierba : CIUDAD.BARRIOS[m.barrio].suelo; g.fillRect(m.muro.x0, m.muro.z0, m.muro.x1 - m.muro.x0, m.muro.z1 - m.muro.z0);
      g.strokeStyle = '#20102c'; g.lineWidth = 0.35; g.strokeRect(m.x0, m.z0, m.x1 - m.x0, m.z1 - m.z0);
    }
    // las carreteras: margen de tierra fuera de las ciudades, asfalto, raya central
    const n = CIUDAD.nodos;
    const traza = (e, ancho, color, cap) => { const a = n[e.a], b = n[e.b]; g.strokeStyle = color; g.lineWidth = ancho; g.lineCap = cap; g.beginPath(); g.moveTo(a.x, a.z); g.lineTo(b.x, b.z); g.stroke(); };
    for (const e of t.aristas) if (e.margen > 0) traza(e, e.ancho + e.margen * 2, COLOR.tierra, 'round');
    for (const e of t.aristas) { if (e.tipo === 'tunel') continue; if (e.tipo === 'mirador') { const b = n[e.b]; g.fillStyle = '#9a93a8'; g.beginPath(); g.arc(b.x, b.z, e.ancho / 2, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#20102c'; g.lineWidth = 0.6; g.stroke(); continue; } traza(e, e.ancho, e.tipo === 'rampa' ? COLOR.tunel : COLOR.asfalto, e.margen > 0 ? 'round' : 'square'); }
    g.setLineDash([3, 3]);
    for (const e of t.aristas) if (e.ancho >= 11 && e.tipo !== 'tunel' && e.tipo !== 'mirador') traza(e, 0.25, '#ffcb3d', 'butt');
    g.setLineDash([]);
    for (const e of t.aristas) if (e.tipo === 'avenida') { traza(e, 0.3, '#fff6ea', 'butt'); }
    // rampas de salto y escondites
    g.fillStyle = '#ff7a1a'; for (const r of t.rampas) { g.save(); g.translate(r.x, r.z); g.rotate(-r.ang); g.fillRect(-r.ancho / 2, 0, r.ancho, r.largo * 0.6); g.restore(); }
    g.strokeStyle = '#4fc3d9'; g.lineWidth = 0.6; for (const e of t.escondites) { g.beginPath(); g.arc(e.x, e.z, e.radio, 0, Math.PI * 2); g.stroke(); }
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4; tex.flipY = false; return tex;
  }
  function suelo(t) {
    const R = M.resSuelo, geo = new T.PlaneGeometry(TR, TR, R, R); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i) + TR / 2, z = pos.getZ(i) + TR / 2; pos.setY(i, CIUDAD.alturaSuelo(t.x0 + x, t.z0 + z)); uv.setXY(i, x / TR, z / TR); }
    geo.computeVertexNormals();
    const m = new T.Mesh(geo, new T.MeshLambertMaterial({ map: pinta(t), polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    m.position.set(t.x0 + TR / 2, 0, t.z0 + TR / 2); return m;
  }

  // --- todo lo fijo del trozo en una malla con color por vértice, más su contorno
  function fijo(t) {
    const piezas = [], tubos = [], cruces = new Set();
    const al = (x, z) => CIUDAD.alturaSuelo(x, z);
    for (const m of t.celdas) {
      for (const e of m.edificios) { const y = al(e.x, e.z) - 5; piezas.push(U.caja(e.color, [e.x, y + (e.h + 5) / 2, e.z], [e.w, e.h + 5, e.d])); }
      for (const a of m.arboles) arbol(piezas, a.x, al(a.x, a.z), a.z, a.radio, a.alto, false);
    }
    for (const o of t.campo) { const y = al(o.x, o.z); if (o.tipo === 'roca') piezas.push({ geo: new T.DodecahedronGeometry(o.radio, 0), color: 0x6e6478, p: [o.x, y + o.alto * 0.3, o.z], r: [0, o.x, 0] }); else arbol(piezas, o.x, y, o.z, o.radio, o.alto, true); }
    for (const p of t.puentes) {
      piezas.push(U.caja(0x4a4060, [p.x, p.y - 0.6, p.z], [p.ancho + 1, 1.2, p.largo], [0, p.ang, 0]));
      for (const lado of [-1, 1]) { const s = Math.sin(p.ang), co = Math.cos(p.ang); piezas.push(U.caja(0xffcb3d, [p.x + co * lado * (p.ancho / 2 + 0.5), p.y + 0.6, p.z - s * lado * (p.ancho / 2 + 0.5)], [0.6, 1.2, p.largo], [0, p.ang, 0])); }
    }
    for (const mi of t.miradores) { piezas.push(U.caja(0xffcb3d, [mi.x, mi.y + 1.6, mi.z], [0.3, 3.2, 0.3]), U.caja(0xff4b5c, [mi.x, mi.y + 3.3, mi.z], [2.2, 1, 0.2], [0, mi.ang + Math.PI / 2, 0])); for (let k = 0; k < 10; k++) { const a = mi.ang - 0.9 + k * 0.2, x = mi.x + Math.cos(a) * mi.radio, z = mi.z + Math.sin(a) * mi.radio; piezas.push(U.caja(0xcdb9ea, [x, mi.y + 0.5, z], [0.3, 1, 0.3])); } }
    for (const r of t.rampas) piezas.push(U.caja(0xff7a1a, [r.x + Math.cos(r.ang) * 0 + Math.sin(r.ang) * r.largo * 0.3, al(r.x, r.z) + 0.5, r.z + Math.cos(r.ang) * r.largo * 0.3], [r.ancho, 0.5, r.largo * 0.62], [-0.32, r.ang, 0]));
    // quitamiedos: una barra blanca con postes cada 8 m
    for (const q of t.quitamiedos) {
      const dx = q.bx - q.ax, dz = q.bz - q.az, L = Math.hypot(dx, dz); if (L < 1) continue; const ang = Math.atan2(dx, dz), incl = Math.atan2(q.yb - q.ya, L);
      piezas.push(U.caja(0xfff6ea, [(q.ax + q.bx) / 2, (q.ya + q.yb) / 2 + 0.8, (q.az + q.bz) / 2], [0.14, 0.3, L], [-incl, ang, 0]));
      for (let s = 4; s < L; s += 8) { const u = s / L; piezas.push(U.caja(0x6a5a86, [lerp(q.ax, q.bx, u), lerp(q.ya, q.yb, u) + 0.45, lerp(q.az, q.bz, u)], [0.2, 0.9, 0.2], [0, ang, 0])); }
    }
    // el portal de cada boca de túnel: un dintel sobre el fondo de la trinchera
    for (const e of t.aristas) if (e.tipo === 'rampa') for (const id of [e.a, e.b]) { const m = CIUDAD.nodos[id]; if (!m.boca || m.x < t.x0 || m.x >= t.x1 || m.z < t.z0 || m.z >= t.z1 || cruces.has('portal' + id)) continue; cruces.add('portal' + id); const o = CIUDAD.nodos[e.a === id ? e.b : e.a], ang = Math.atan2(o.x - m.x, o.z - m.z); piezas.push(U.caja(0x5b5668, [m.x, CIUDAD.natural(m.x, m.z) + 0.8, m.z], [e.ancho + 3.4, 1.6, 1.2], [0, ang, 0])); }
    for (const e of t.escondites) piezas.push(U.caja(0x4fc3d9, [e.x, al(e.x, e.z) + 2.5, e.z - e.radio + 1], [0.3, 5, 0.3]), U.caja(0x4fc3d9, [e.x, al(e.x, e.z) + 5.4, e.z - e.radio + 1], [2.4, 1.4, 0.3]));
    // túneles: un tubo por tramo (se ve por dentro); rampas: paredes a los lados
    const n = CIUDAD.nodos;
    for (const e of t.aristas) {
      if (e.tipo !== 'tunel' && e.tipo !== 'rampa') continue;
      const a = n[e.a], b = n[e.b]; if (a.x < t.x0 - 1 || a.x >= t.x1 + 1 || a.z < t.z0 - 1 || a.z >= t.z1 + 1) continue;   // cada tramo lo monta el trozo de su primer nodo
      const [ra, rb] = e.recorte || [0, 0], L = e.largo - ra - rb; if (L < 2) continue;
      const ux = (b.x - a.x) / e.largo, uz = (b.z - a.z) / e.largo, uy = (b.y - a.y) / e.largo;
      const ax = a.x + ux * ra, az = a.z + uz * ra, ay = a.y + uy * ra, bx = b.x - ux * rb, bz = b.z - uz * rb, by = b.y - uy * rb;
      const ang = Math.atan2(b.x - a.x, b.z - a.z), cx = (ax + bx) / 2, cz = (az + bz) / 2, cy = (ay + by) / 2, inclina = Math.atan2(by - ay, L);
      if (e.tipo === 'tunel') {
        tubos.push(U.cajaAbierta(0x4a3f66, [cx, cy + 4, cz], [e.ancho + 2.4, 8, L + 0.5], [-inclina, ang, 0], [1, 1, 1, 1, 0, 0]));   // sin tapas: por los extremos se sigue
        for (let k = 10; k < L - 5; k += 20) { const q = k / L; piezas.push(U.caja(0xfff1a8, [lerp(ax, bx, q), lerp(ay, by, q) + 7.6, lerp(az, bz, q)], [2.4, 0.3, 1], [0, ang, 0])); }   // luces del techo
        // en un cruce (o en el fondo de una boca) una sala: techo, suelo y pared solo por donde no entra ninguna carretera
        for (const [m, r] of [[a, ra], [b, rb]]) if (r > 0 && (m.tipo === 'tunel' || m.boca) && !cruces.has(m.id)) {
          cruces.add(m.id);
          const caras = [1, 1, 1, !m.boca, 1, 1];
          for (const v of m.vecinos) { const o = n[v], dx = o.x - m.x, dz = o.z - m.z, d = Math.hypot(dx, dz) || 1; if (dx / d > 0.5) caras[0] = 0; if (dx / d < -0.5) caras[1] = 0; if (dz / d > 0.5) caras[4] = 0; if (dz / d < -0.5) caras[5] = 0; }
          tubos.push(U.cajaAbierta(0x4a3f66, [m.x, m.y + 4, m.z], [r * 2, 8, r * 2], null, caras)); piezas.push(U.caja(0xfff1a8, [m.x, m.y + 7.6, m.z], [2.4, 0.3, 2.4]));
        }
      } else {
        const alto = Math.max(CIUDAD.natural(a.x, a.z), CIUDAD.natural(b.x, b.z)) + 1.2, bajo = Math.min(ay, by) - 1.5;
        for (const lado of [-1, 1]) piezas.push(U.caja(0x5b5668, [cx + Math.cos(ang) * lado * (e.ancho / 2 + 0.9), (alto + bajo) / 2, cz - Math.sin(ang) * lado * (e.ancho / 2 + 0.9)], [0.8, alto - bajo, L + 0.5], [0, ang, 0]));
      }
    }
    const mallas = [];
    if (piezas.length) { const g = U.mallaConBorde(U.unir(piezas), 0.12); g.position.set(0, 0, 0); escena.add(g); mallas.push(g.children[0], g.children[1]); g.userData.grupo = true; mallas.push(g); }
    if (tubos.length) { const m = new T.Mesh(U.unir(tubos), new T.MeshLambertMaterial({ vertexColors: true, side: T.BackSide, emissive: 0x2a2440 })); m.userData.tubo = tubos.length; escena.add(m); mallas.push(m); }
    return mallas;
  }
  function arbol(piezas, x, y, z, radio, alto, pino) {
    piezas.push(U.cil(0x7a4a2a, [x, y + alto * 0.25, z], 0.4, alto * 0.5, null, 6));
    if (pino) piezas.push({ geo: new T.ConeGeometry(radio * 1.3, alto * 0.75, 7), color: 0x2f6e3a, p: [x, y + alto * 0.62, z] });
    else piezas.push({ geo: new T.DodecahedronGeometry(radio, 0), color: 0x3f9a3a, p: [x, y + alto * 0.5 + radio * 0.6, z] });
  }
  function monta(t) {
    const s = suelo(t); escena.add(s);
    return { t, mallas: [s, ...fijo(t)] };
  }
  const estado = () => ({ cargados: cargados.size, cola: cola.length, tubos: [...cargados.values()].reduce((a, tr) => a + tr.mallas.reduce((b, m) => b + (m.userData.tubo || 0), 0), 0) });
  return { iniciar, actualizar, estado };
})();
