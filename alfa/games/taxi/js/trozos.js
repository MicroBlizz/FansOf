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
    const R = M.resLejos, A = CIUDAD.ancho, L = CIUDAD.largo, nx = Math.ceil(A / R), nz = Math.ceil(L / R);
    const geo = new T.PlaneGeometry(A, L, nx, nz); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), c = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + A / 2, z = pos.getZ(i) + L / 2;
      // siempre por debajo del suelo con detalle (que asomara entre sus vértices): el mínimo de la celda, y un poco más abajo
      let h = CIUDAD.alturaSuelo(x, z); for (const [dx, dz] of [[-R / 2, 0], [R / 2, 0], [0, -R / 2], [0, R / 2], [-R / 2, -R / 2], [R / 2, R / 2]]) h = Math.min(h, CIUDAD.alturaSuelo(x + dx, z + dz));
      pos.setY(i, h - 1.2);
      let s = CIUDAD.suelo(x, z); if (s === 'tierra' && CIUDAD.natural(x, z) > M.roca) s = 'roca';
      c.set(colorSuelo(s)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.computeVertexNormals();
    lejos = new T.Mesh(geo, recorta(new T.MeshLambertMaterial({ vertexColors: true }))); lejos.position.set(A / 2, 0, L / 2); escena.add(lejos);
    // los edificios de todo el mundo, un poco más pequeños y más bajos que los de verdad (quedan dentro cuando llega el detalle)
    const cajas = [];
    for (const e of [...CIUDAD.celdas.flatMap(m => m.edificios), ...CIUDAD.edificios]) { const y = basePlanta(e) - 1, alto = CIUDAD.alturaSuelo(e.x, e.z) + e.h - 1 - y; cajas.push(U.caja(e.color, [e.x, y + alto / 2, e.z], [e.w - 0.8, alto, e.d - 0.8])); }
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
    const mc = new T.Mesh(gc, recorta(new T.MeshLambertMaterial({ vertexColors: true }))); escena.add(mc); lejosMallas.push(mc);
  }
  function lejosMalla(piezas) { if (!piezas.length) return; const m = new T.Mesh(U.unir(piezas), new T.MeshLambertMaterial({ vertexColors: true })); escena.add(m); lejosMallas.push(m); }

  // el suelo lejano y sus carreteras no se pintan donde ya está el detalle seguro (cerca del jugador, con todo cargado): si no, en las
  // trincheras y los túneles asomaría por dentro (va por debajo, pero sus triángulos de 16 m no siguen un hoyo)
  const tapa = { jugador: { value: null }, radio: { value: 0 } };
  function recorta(mat) {
    tapa.jugador.value = tapa.jugador.value || new T.Vector2();
    mat.onBeforeCompile = sh => {
      sh.uniforms.uJug = tapa.jugador; sh.uniforms.uRad = tapa.radio;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vMundo;').replace('#include <project_vertex>', '#include <project_vertex>\nvMundo = (modelMatrix * vec4(transformed, 1.0)).xz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vMundo;\nuniform vec2 uJug;\nuniform float uRad;').replace('void main() {', 'void main() {\n  if (distance(vMundo, uJug) < uRad) discard;');
    };
    return mat;
  }

  // --- qué trozos hacen falta ahora; se monta uno por llamada
  function actualizar(x, z) {
    const ci = Math.floor(x / TR), cj = Math.floor(z / TR);
    if (!ultimo || ultimo.ci !== ci || ultimo.cj !== cj || ultimo.n !== cargados.size) {
      ultimo = { ci, cj, n: cargados.size, x, z };
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
    // con todo cargado, el detalle cubre hasta radioCarga desde donde se calculó; desde aquí, eso menos lo que se ha movido
    tapa.jugador.value.set(x, z); tapa.radio.value = cola.length ? 0 : Math.max(0, M.radioCarga - 60 - Math.hypot(x - ultimo.x, z - ultimo.z));
  }
  function descarga(tr) { for (const m of tr.mallas) { escena.remove(m); if (m.geometry) m.geometry.dispose(); const mat = m.material; if (mat) { if (mat.map) mat.map.dispose(); mat.dispose(); } } }

  // --- el suelo de un trozo: lienzo pintado sobre una rejilla con alturas
  function pinta(t) {
    const ppm = M.texturaPxPorMetro, c = document.createElement('canvas'); c.width = c.height = Math.ceil(TR * ppm);
    const g = c.getContext('2d'); g.scale(ppm, ppm); g.translate(-t.x0, -t.z0);
    // la base: qué suelo hay cada 8 m, sin las carreteras (pintadas aquí a cuadros de 8 m asomaban dientes de asfalto por los lados)
    for (let x = t.x0; x < t.x1; x += 8) for (let z = t.z0; z < t.z1; z += 8) { let s = CIUDAD.fondo(x + 4, z + 4); if (s === 'tierra' && CIUDAD.natural(x + 4, z + 4) > M.roca) s = 'roca'; g.fillStyle = colorSuelo(s); g.fillRect(x - 0.5, z - 0.5, 9, 9); }
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
    for (const e of t.aristas) { if (e.tipo === 'tunel' || e.tipo === 'viaducto') continue; if (e.tipo === 'mirador') { const b = n[e.b]; g.fillStyle = '#9a93a8'; g.beginPath(); g.arc(b.x, b.z, e.ancho / 2, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#20102c'; g.lineWidth = 0.6; g.stroke(); continue; } traza(e, e.ancho, e.tipo === 'rampa' ? COLOR.tunel : COLOR.asfalto, e.margen > 0 ? 'round' : 'square'); }
    // escondites
    g.strokeStyle = '#4fc3d9'; g.lineWidth = 0.6; for (const e of t.escondites) { g.beginPath(); g.arc(e.x, e.z, e.radio, 0, Math.PI * 2); g.stroke(); }
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4; tex.flipY = false; return tex;
  }
  function suelo(t) {
    // las alturas y el hueco de las trincheras salen de REJILLA (las mismas que pisa la física)
    const r = REJILLA.deTrozo(t), geo = new T.PlaneGeometry(TR, TR, r.divisiones, r.divisiones); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i) + TR / 2, z = pos.getZ(i) + TR / 2; pos.setY(i, r.alto[i]); uv.setXY(i, x / TR, z / TR); }
    if (r.conTrinchera) { const quedan = []; REJILLA.triangulos(t, (a, b, c) => quedan.push(a, b, c)); geo.setIndex(quedan); }
    geo.computeVertexNormals();
    const m = new T.Mesh(geo, new T.MeshLambertMaterial({ map: pinta(t) }));
    m.position.set(t.x0 + TR / 2, 0, t.z0 + TR / 2); return m;
  }

  // --- todo lo fijo del trozo en una malla con color por vértice, más su contorno
  function fijo(t) {
    const piezas = [], cruces = new Set();
    const al = (x, z) => CIUDAD.alturaSuelo(x, z);
    for (const m of t.celdas) {
      for (const e of m.edificios) { const y = basePlanta(e) - 1, alto = al(e.x, e.z) + e.h - y; piezas.push(U.caja(e.color, [e.x, y + alto / 2, e.z], [e.w, alto, e.d])); }
      for (const a of m.arboles) arbol(piezas, a.x, al(a.x, a.z), a.z, a.radio, a.alto, false);
    }
    for (const e of t.edificios) { const y = basePlanta(e) - 1, alto = al(e.x, e.z) + e.h - y; piezas.push(U.caja(e.color, [e.x, y + alto / 2, e.z], [e.w, alto, e.d])); }
    for (const o of t.campo) { const y = al(o.x, o.z); if (o.tipo === 'roca') piezas.push({ geo: new T.DodecahedronGeometry(o.radio, 0), color: 0x6e6478, p: [o.x, y + o.alto * 0.3, o.z], r: [0, o.x, 0] }); else arbol(piezas, o.x, y, o.z, o.radio, o.alto, true); }
    for (const p of t.puentes) {
      piezas.push(U.caja(0x4a4060, [p.x, p.y - 0.6, p.z], [p.ancho + 1, 1.2, p.largo], [0, p.ang, 0]));
      for (const lado of [-1, 1]) { const s = Math.sin(p.ang), co = Math.cos(p.ang); piezas.push(U.caja(0xffcb3d, [p.x + co * lado * (p.ancho / 2 + 0.5), p.y + 0.6, p.z - s * lado * (p.ancho / 2 + 0.5)], [0.6, 1.2, p.largo], [0, p.ang, 0])); }
    }
    for (const mi of t.miradores) { piezas.push(U.caja(0xffcb3d, [mi.x, mi.y + 1.6, mi.z], [0.3, 3.2, 0.3]), U.caja(0xff4b5c, [mi.x, mi.y + 3.3, mi.z], [2.2, 1, 0.2], [0, mi.ang + Math.PI / 2, 0])); for (let k = 0; k < 10; k++) { const a = mi.ang - 0.9 + k * 0.2, x = mi.x + Math.cos(a) * mi.radio, z = mi.z + Math.sin(a) * mi.radio; piezas.push(U.caja(0xcdb9ea, [x, mi.y + 0.5, z], [0.3, 1, 0.3])); } }
    // quitamiedos: una barra blanca con postes cada 8 m
    for (const q of t.quitamiedos) {
      const dx = q.bx - q.ax, dz = q.bz - q.az, L = Math.hypot(dx, dz); if (L < 1) continue; const ang = Math.atan2(dx, dz), incl = Math.atan2(q.yb - q.ya, L);
      piezas.push(U.caja(0xfff6ea, [(q.ax + q.bx) / 2, (q.ya + q.yb) / 2 + 0.8, (q.az + q.bz) / 2], [0.14, 0.3, L], [-incl, ang, 0, 'YXZ']));
      for (let s = 4; s < L; s += 8) { const u = s / L; piezas.push(U.caja(0x6a5a86, [lerp(q.ax, q.bx, u), lerp(q.ya, q.yb, u) + 0.45, lerp(q.az, q.bz, u)], [0.2, 0.9, 0.2], [0, ang, 0])); }
    }
    // el portal de cada boca de túnel: un dintel sobre el fondo de la trinchera
    for (const e of t.aristas) if (e.tipo === 'rampa') for (const id of [e.a, e.b]) { const m = CIUDAD.nodos[id]; if (!m.boca || m.x < t.x0 || m.x >= t.x1 || m.z < t.z0 || m.z >= t.z1 || cruces.has('portal' + id)) continue; cruces.add('portal' + id); const o = CIUDAD.nodos[e.a === id ? e.b : e.a], ang = Math.atan2(o.x - m.x, o.z - m.z); const r = (e.a === id ? e.recorte[0] : e.recorte[1]) || 0, ux = Math.sin(ang), uz = Math.cos(ang), px = m.x + ux * r, pz = m.z + uz * r, techo = m.y + 8, cima = Math.max(techo + 1, CIUDAD.natural(px, pz) + 1.5, CIUDAD.natural(m.x, m.z) + 1.5), fondo = Math.max(2 * r + 1, 9); piezas.push(U.caja(0x5b5668, [px - ux * fondo / 2, (techo + cima) / 2, pz - uz * fondo / 2], [Math.max(e.ancho + 4, 2 * r + 2), cima - techo, fondo], [0, ang, 0]), U.caja(0xffcb3d, [px + ux * 0.1, techo + 0.4, pz + uz * 0.1], [e.ancho + 2, 0.8, 0.4], [0, ang, 0])); }
    for (const e of t.escondites) piezas.push(U.caja(0x4fc3d9, [e.x, al(e.x, e.z) + 2.5, e.z - e.radio + 1], [0.3, 5, 0.3]), U.caja(0x4fc3d9, [e.x, al(e.x, e.z) + 5.4, e.z - e.radio + 1], [2.4, 1.4, 0.3]));
    // las luces del techo de los túneles (el túnel en sí es una cinta, ver js/cintas/)
    for (const e of t.aristas) {
      if (e.tipo !== 'tunel') continue;
      const a = CIUDAD.nodos[e.a], b = CIUDAD.nodos[e.b];
      if (a.x < t.x0 || a.x >= t.x1 || a.z < t.z0 || a.z >= t.z1) continue;   // cada tramo lo pone el trozo de su primer nudo
      const ang = Math.atan2(b.x - a.x, b.z - a.z);
      for (let k = 10; k < e.largo - 5; k += 20) { const q = k / e.largo; piezas.push(U.caja(0xfff1a8, [lerp(a.x, b.x, q), CIUDAD.alturaArista(e, q) + 7.6, lerp(a.z, b.z, q)], [2.4, 0.3, 1], [0, ang, 0])); }
    }
    const mallas = [];
    if (piezas.length) { const g = U.mallaConBorde(U.unir(piezas), 0.12); g.position.set(0, 0, 0); escena.add(g); mallas.push(g.children[0], g.children[1]); g.userData.grupo = true; mallas.push(g); }
    for (const m of CINTAS_MALLA.deTrozo(T, t)) { escena.add(m); mallas.push(m); }
    return mallas;
  }
  // la altura del suelo en la esquina más baja de un edificio (en cuesta, que no quede colgando)
  function basePlanta(e) {
    let y = Infinity;
    for (const sx of [-0.5, 0.5]) for (const sz of [-0.5, 0.5]) y = Math.min(y, CIUDAD.alturaSuelo(e.x + sx * e.w, e.z + sz * e.d));
    return y;
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
