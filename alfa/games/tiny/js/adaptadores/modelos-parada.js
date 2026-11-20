// Tiny Fans · adaptador · MODELOS · PARADA: el suelo de la parada de la máquina de café (moqueta azul con su rodapié), las franjas de sol
// de la persiana, el río de café, los puentes y los muebles de reglas.mapa.muebles. Un mueble de un tipo sin modelo propio se pinta como
// una caja o un cilindro de su tamaño. Todo es fijo: se monta una vez por expedición.
'use strict';
(() => {
  const P = TN.piezas3d, T = THREE;
  let semilla = 7;
  const rnd = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  function ruido(x, w, h, base, cols, n) { x.fillStyle = base; x.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { x.fillStyle = cols[(rnd() * cols.length) | 0]; x.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 1, 1); } }
  let TX = null;
  const texturas = () => TX || (TX = {
    moqueta: P.textura(16, 16, (x, w, h) => { ruido(x, w, h, '#5f86b0', ['#5b82ac', '#638ab4'], 60); x.fillStyle = '#58809f'; x.fillRect(0, 0, w, 1); x.fillRect(0, 0, 1, h); }),
    baldosa: P.textura(16, 16, (x, w, h) => { ruido(x, w, h, '#f3e3c2', ['#f0dfbc'], 20); x.fillStyle = '#d9c39a'; x.fillRect(0, 0, w, 1); x.fillRect(0, 0, 1, h); }),
    cafe: P.textura(16, 32, (x, w, h) => { x.fillStyle = '#6b3f1f'; x.fillRect(0, 0, w, h); x.fillStyle = '#8a5a30'; for (let i = 0; i < 5; i++) x.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 2, 5); x.fillStyle = '#e8cfa0'; for (let i = 0; i < 3; i++) x.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 1, 3); }),
  });
  // cada tipo de mueble: su color y, si lo tiene, su dibujo propio (a = alto del mueble). Lo que no esté aquí sale como caja de cartón
  const TIPOS = {
    'maquina-cafe': { color: 0xc8443a, extra(g, m, a) { const f = m.fondo / 2; P.caja(g, 0x2b2118, m.ancho * .78, a * .25, 1.6, 0, a * .2, f - .6); P.caja(g, 0x2e7d32, m.ancho * .36, a * .06, .2, -2, a * .68, f + .06, null, { emissive: 0x1d6a22 }); P.caja(g, 0x2b2118, m.ancho + .6, 1.4, m.fondo + .6, 0, a + .7, 0); P.halo(g, 0x9bd67a, 2, -2, a * .68, f + .5); for (const [c, x] of [[0xf5b800, 3.2], [0x7cc4f2, 4.8], [0xffffff, 6.4]]) P.caja(g, c, 1.1, 1.1, .3, x, a * .68, f + .1, null, { emissive: c }); } },
    'bandeja-goteo': { color: 0x9aa7b2 }, cajonera: { color: 0xb98a52, extra(g, m, a) { for (let i = 0; i < 3; i++) { P.caja(g, 0x9c7340, m.ancho * .9, a * .26, .3, 0, a * (.18 + i * .31), m.fondo / 2 + .1); P.caja(g, 0xf5b800, 3, .6, .5, 0, a * (.18 + i * .31), m.fondo / 2 + .4); } } },
    'lateral-cajon': { color: 0x9c7340 }, papelera: { color: 0x58a05c, extra(g, m, a) { for (let i = -2; i <= 2; i++) P.caja(g, 0x3f7f45, .5, a * .8, .2, i * m.ancho / 5, a / 2, m.fondo / 2 + .08); P.bola(g, 0xfff7d1, 2.2, 1.6, 2, 1, a + .6, 0); } },
    taza: { color: 0xfff7d1, extra(g, m, a) { P.cilindro(g, 0x6b3f1f, m.radio * .86, m.radio * .86, .2, 0, a + .02, 0, null, 16); P.caja(g, 0xe2452f, m.radio * 2.02, a * .25, .3, 0, a * .5, m.radio * .96); } },
    maceta: { color: 0xc4643a, extra(g, m, a) { const r = m.radio; for (let i = 0; i < 6; i++) { const b = i * 1.05; P.bola(g, i % 2 ? 0x5a9a3c : 0x6fb04a, r * .5, r * 1.2, r * .2, Math.cos(b) * r * .5, a + r * .9, Math.sin(b) * r * .5, [0, -b, .5]); } P.cilindro(g, 0x4a3020, r * .9, r * .9, .3, 0, a, 0, null, 14); } },
    'pata-mesa': { color: 0xd8b06a }, lapiz: { color: 0xf5b800, extra(g, m, a) { P.caja(g, 0xf2a0a0, m.ancho, a, 2, 0, a / 2, -m.fondo / 2 + 1); P.caja(g, 0x2b2118, m.ancho * .6, a * .6, 1.4, 0, a / 2, m.fondo / 2 + .5); } },
    'taco-notas': { color: 0xffe98a }, terrones: { color: 0xfbf7ef, extra(g, m, a) { P.caja(g, 0xffffff, m.ancho * .5, a * .8, m.fondo * .5, .6, a * 1.4, -.4, [0, .5, 0]); } },
    'pila-gigante': { color: 0x2e7d32, extra(g, m, a) { P.caja(g, 0xf5b800, m.ancho * .22, a + .04, m.fondo + .04, m.ancho * .39, a / 2, 0); P.caja(g, 0xb9c9d6, .6, a * .5, m.fondo * .4, m.ancho / 2 + .3, a / 2, 0); } },
    'chincheta-guirnalda': { color: 0xb9c9d6, extra(g, m, a) { P.cilindro(g, 0xe2452f, 1, 1, .5, 0, a, 0, null, 12); P.cilindro(g, 0xe2452f, .5, .6, .9, 0, a + .6, 0, null, 10); P.halo(g, 0xffc46b, 1.4, 0, a + .4, 0); } },
  };
  TN.modelos.mueble = m => {
    const g = P.grupo(), t = TIPOS[m.tipo] || { color: 0xc9a063 }, alto = Math.min(m.alto || 4, 60);   // lo muy alto (la pata de la mesa) se corta: la cámara no lo ve entero
    if (m.forma === 'circulo') P.cilindro(g, t.color, m.radio, m.radio * .92, alto, 0, alto / 2, 0, null, 16);
    else P.caja(g, t.color, m.ancho, alto, m.fondo, 0, alto / 2, 0);
    if (t.extra) t.extra(g, m, alto);
    g.position.set(m.x, 0, m.z); g.rotation.y = m.giro || 0;
    return g;
  };
  // el río: una cinta por los puntos [[x, z]…] con el café corriendo; y sus puentes (reglas sobre gomas)
  function rio(g, r) {
    const tx = texturas().cafe.clone(); tx.needsUpdate = true;
    const mat = new T.MeshToonMaterial({ map: tx, gradientMap: P.rampa, side: T.DoubleSide }), pos = [], uv = [], idx = [];
    const curva = new T.CatmullRomCurve3(r.puntos.map(p => new T.Vector3(p[0], .06, p[1]))), N = Math.max(20, r.puntos.length * 14);
    let dist = 0, prev = null;
    for (let i = 0; i <= N; i++) {
      const p = curva.getPoint(i / N), tg = curva.getTangent(i / N), nx = -tg.z, nz = tg.x, w = r.ancho / 2;
      if (prev) dist += p.distanceTo(prev); prev = p;
      pos.push(p.x + nx * w, .06, p.z + nz * w, p.x - nx * w, .06, p.z - nz * w); uv.push(0, dist / 2, 1, dist / 2);
      if (i) { const a = 2 * (i - 1); idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const ge = new T.BufferGeometry(); ge.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); ge.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); ge.setIndex(idx); ge.computeVertexNormals();
    const m = new T.Mesh(ge, mat); m.receiveShadow = true; g.add(m);
    return dt => { tx.offset.y -= dt * .35; };
  }
  // un puente: una regla sobre dos gomas, cruzada sobre el río (se orienta con el tramo de río más cercano)
  function puente(g, p, rio) {
    let giro = 0, mejor = Infinity;
    for (let i = 1; i < rio.puntos.length; i++) { const [ax, az] = rio.puntos[i - 1], [bx, bz] = rio.puntos[i], d = Math.hypot((ax + bx) / 2 - p.x, (az + bz) / 2 - p.z); if (d < mejor) { mejor = d; giro = Math.atan2(bx - ax, bz - az) + Math.PI / 2; } }
    const pu = P.grupo(), largo = rio.ancho + 3.4, ancho = p.radio * 1.3; pu.position.set(p.x, 0, p.z); pu.rotation.y = giro;
    for (const s of [-1, 1]) P.caja(pu, 0xf2a0a0, ancho, .42, 1, 0, .21, s * (largo / 2 - .5));
    P.caja(pu, 0xf2d06b, ancho, .14, largo, 0, .49, 0);
    for (let i = 0; i < largo - 1; i += 1) P.caja(pu, 0x2b2118, i % 4 ? .4 : .8, .02, .08, -ancho / 2 + .5, .57, -largo / 2 + i + .5);
    g.add(pu);
  }
  // toda la parada con los datos del mapa. Devuelve el grupo; grupo.userData.anima(t, dt) mueve el café
  TN.modelos.parada = mapa => {
    const g = P.grupo(), L = mapa.lado, H = L / 2, tx = texturas(), vivos = [];
    P.suelo(g, tx.moqueta, L + 60, L + 60, 0, 0, 0, 3);
    for (const z of mapa.baldosas || []) P.suelo(g, tx.baldosa, z.ancho, z.fondo, z.x, z.z, .04, 2);
    // el rodapié por los cuatro lados; detrás (lejos de la cámara), pared alta
    for (const [x, z, w, d, alto] of [[0, -H - 1, L + 4, 2, 26], [-H - 1, 0, 2, L + 4, 26], [0, H + 1, L + 4, 2, 1.2], [H + 1, 0, 2, L + 4, 1.2]]) P.caja(g, alto > 2 ? 0xe9dcc0 : 0xb9a988, w, alto, d, x, alto / 2, z);
    if (mapa.rio) vivos.push(rio(g, mapa.rio));
    for (const p of mapa.puentes || []) puente(g, p, mapa.rio);
    for (const t of mapa.telas || []) { const tela = TN.modelos.tela(t.radio); tela.position.set(t.x, 0, t.z); g.add(tela); }
    for (const s of mapa.sitios || []) P.aro(g, 0xffd23f, s.radio, s.x, s.z);
    for (const m of mapa.muebles) g.add(TN.modelos.mueble(m));
    // las franjas de sol de la persiana, repetidas por toda la moqueta
    const franja = new T.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: .08, depthWrite: false, blending: T.AdditiveBlending });
    for (let i = -8; i <= 8; i++) { const f = new T.Mesh(new T.PlaneGeometry(L * 1.6, 1.3), franja); f.rotation.set(-Math.PI / 2, 0, .62); f.position.set(i * 1.2, .09, i * 7.5); g.add(f); }
    g.userData.anima = (t, dt) => { for (const f of vivos) f(dt); };
    return g;
  };
})();
