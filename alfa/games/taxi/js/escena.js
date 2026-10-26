// Fans Of Taxi · ESCENA: lo que se ve, con three.js (la copia recortada del boceto 3D de Rumble) y el mismo estilo de dibujo animado: tres
// tonos de luz, contorno oscuro. La ciudad es un suelo pintado en un lienzo (calles, aceras, parques) más los edificios y los árboles como
// mallas instanciadas (pocas llamadas de dibujo). Cada coche es UNA malla (sus cajas unidas, con el color en los vértices) más su contorno.
// La cámara va detrás del coche y abre el campo de visión con la velocidad. La lógica no toca nada de aquí: `sincroniza` lee el estado.
'use strict';
const ESCENA = (() => {
  const CONTORNO = 0x20102c;
  let T, render, escena, camara, suelo, jugadorMalla, puntos, destinoMalla, anillos = [], coches = new Map(), caidas = [], pasajeroMallas = new Map(), cache = {}, lienzo;
  const _m = () => new T.Matrix4(), _v = () => new T.Vector3();

  function gradiente() {
    if (!cache.grad) { cache.grad = new T.DataTexture(new Uint8Array([105, 182, 255]), 3, 1, T.RedFormat); cache.grad.minFilter = cache.grad.magFilter = T.NearestFilter; cache.grad.needsUpdate = true; }
    return cache.grad;
  }
  const toon = extra => new T.MeshToonMaterial({ gradientMap: gradiente(), ...extra });
  function contorno(grosor = 0.08) {
    const m = new T.MeshBasicMaterial({ color: CONTORNO, side: T.BackSide });
    m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n\ttransformed += normal * ${grosor.toFixed(3)};`); };
    m.customProgramCacheKey = () => 'contorno-' + grosor; return m;
  }
  // unir cajas con color en una sola geometría: [{ geo, color, p:[x,y,z], r:[rx,ry,rz] }]
  function unir(piezas) {
    const pos = [], nor = [], col = [];
    for (const pz of piezas) {
      const g = pz.geo.toNonIndexed(); const m = _m();
      if (pz.r) m.makeRotationFromEuler(new T.Euler(...pz.r)); if (pz.p) m.setPosition(...pz.p);
      g.applyMatrix4(m);
      const c = new T.Color(pz.color), p = g.attributes.position.array, n = g.attributes.normal.array;
      for (let i = 0; i < p.length; i += 3) { pos.push(p[i], p[i + 1], p[i + 2]); nor.push(n[i], n[i + 1], n[i + 2]); col.push(c.r, c.g, c.b); }
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(new Float32Array(pos), 3));
    geo.setAttribute('normal', new T.BufferAttribute(new Float32Array(nor), 3));
    geo.setAttribute('color', new T.BufferAttribute(new Float32Array(col), 3));
    return geo;
  }
  function mallaConBorde(geo, grosor) {
    const g = new T.Group();
    g.add(new T.Mesh(geo, toon({ vertexColors: true }))); g.add(new T.Mesh(geo, contorno(grosor)));
    return g;
  }
  const caja = (color, p, [w, h, d], r) => ({ geo: new T.BoxGeometry(w, h, d), color, p, r });
  const cil = (color, p, radio, alto, r, lados = 10) => ({ geo: new T.CylinderGeometry(radio, radio, alto, lados), color, p, r });

  // --- los coches: taxi, tráfico, policía, rival. Geometría por tipo y color (se reutiliza)
  function geoCoche(tipo, color) {
    const k = tipo + color; if (cache[k]) return cache[k];
    const piezas = [
      caja(color, [0, 0.55, 0], [2, 0.7, 4.3]),
      caja(tipo === 'policia' ? 0xfff6ea : color, [0, 1.15, -0.3], [1.7, 0.6, 2.1]),
      caja(0x9be7ff, [0, 1.15, 0.78], [1.5, 0.45, 0.1]),   // parabrisas
      caja(0xfff1a8, [-0.7, 0.55, 2.16], [0.4, 0.25, 0.05]), caja(0xfff1a8, [0.7, 0.55, 2.16], [0.4, 0.25, 0.05]),   // faros
      caja(0xff4b5c, [-0.7, 0.55, -2.16], [0.4, 0.2, 0.05]), caja(0xff4b5c, [0.7, 0.55, -2.16], [0.4, 0.2, 0.05]),
    ];
    for (const [x, z] of [[-1, 1.4], [1, 1.4], [-1, -1.4], [1, -1.4]]) piezas.push(cil(0x2a2438, [x, 0.38, z], 0.38, 0.4, [0, 0, Math.PI / 2], 12), cil(0xcdb9ea, [x * 1.05, 0.38, z], 0.2, 0.36, [0, 0, Math.PI / 2], 8));
    if (tipo === 'taxi') piezas.push(caja(0xffcb3d, [0, 1.6, -0.3], [0.9, 0.3, 0.4]), caja(0xffcb3d, [-0.45, 1.3, 0.45], [0.18, 0.7, 0.1], [0.4, 0, 0]), caja(0xffcb3d, [0.45, 1.3, 0.45], [0.18, 0.7, 0.1], [0.4, 0, 0]));   // letrero y orejas de conejo
    if (tipo === 'policia') piezas.push(caja(0x2e8bff, [-0.3, 1.55, -0.3], [0.35, 0.2, 0.3]), caja(0xff4b5c, [0.3, 1.55, -0.3], [0.35, 0.2, 0.3]), caja(0x1d3f8a, [0, 0.56, 0], [2.04, 0.3, 4.34]));
    if (tipo === 'rival') piezas.push(caja(0x20102c, [0, 1.05, -2.0], [1.9, 0.08, 0.5]), caja(0x20102c, [-0.8, 0.95, -2.0], [0.1, 0.25, 0.3]), caja(0x20102c, [0.8, 0.95, -2.0], [0.1, 0.25, 0.3]));   // alerón
    return (cache[k] = unir(piezas));
  }
  function mallaCoche(tipo, color) { const g = mallaConBorde(geoCoche(tipo, color), 0.07); escena.add(g); return g; }
  // --- un pasajero: cuerpo de color de su personaje, cabeza, y su anillo en el suelo
  function geoPasajero(color) {
    const k = 'p' + color; if (cache[k]) return cache[k];
    return (cache[k] = unir([cil(color, [0, 0.8, 0], 0.42, 1.2, null, 10), { geo: new T.SphereGeometry(0.42, 10, 8), color: 0xffe0c0, p: [0, 1.75, 0] }, caja(0x20102c, [0.15, 1.8, 0.36], [0.1, 0.1, 0.1]), caja(0x20102c, [-0.15, 1.8, 0.36], [0.1, 0.1, 0.1])]));
  }
  function anillo(color, radio = 2.4) { const m = new T.Mesh(new T.RingGeometry(radio * 0.7, radio, 28), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: T.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.y = 0.06; escena.add(m); return m; }

  // --- el suelo pintado: la ciudad entera en un lienzo
  function pintaSuelo() {
    const ppm = TAXI.ciudad.texturaPxPorMetro, c = document.createElement('canvas'); c.width = Math.ceil(CIUDAD.ancho * ppm); c.height = Math.ceil(CIUDAD.largo * ppm);
    const g = c.getContext('2d'); g.scale(ppm, ppm);
    g.fillStyle = '#2a2438'; g.fillRect(0, 0, CIUDAD.ancho, CIUDAD.largo);
    // carriles: línea discontinua por el centro de cada calle
    g.strokeStyle = '#ffcb3d'; g.lineWidth = 0.25; g.setLineDash([3, 3]);
    for (const n of CIUDAD.nodos) { if (n.i === 0) { g.beginPath(); g.moveTo(0, n.z); g.lineTo(CIUDAD.ancho, n.z); g.stroke(); } if (n.j === 0) { g.beginPath(); g.moveTo(n.x, 0); g.lineTo(n.x, CIUDAD.largo); g.stroke(); } }
    g.setLineDash([]);
    for (const m of CIUDAD.manzanas) {
      g.fillStyle = '#8a8399'; g.fillRect(m.x0, m.z0, m.x1 - m.x0, m.z1 - m.z0);   // la acera
      g.fillStyle = m.parque ? '#3c7a3a' : CIUDAD.BARRIOS[m.barrio].suelo; g.fillRect(m.muro.x0, m.muro.z0, m.muro.x1 - m.muro.x0, m.muro.z1 - m.muro.z0);
      g.strokeStyle = '#20102c'; g.lineWidth = 0.35; g.strokeRect(m.x0, m.z0, m.x1 - m.x0, m.z1 - m.z0);
    }
    g.fillStyle = '#ff7a1a'; for (const r of CIUDAD.rampas) { g.save(); g.translate(r.x, r.z); g.rotate(-r.ang); g.fillRect(-r.ancho / 2, 0, r.ancho, r.largo * 0.6); g.restore(); }
    g.strokeStyle = '#4fc3d9'; g.lineWidth = 0.6; for (const e of CIUDAD.escondites) { g.beginPath(); g.arc(e.x, e.z, e.radio, 0, Math.PI * 2); g.stroke(); }
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
    const s = new T.Mesh(new T.PlaneGeometry(CIUDAD.ancho, CIUDAD.largo), new T.MeshLambertMaterial({ map: tex }));
    s.rotation.x = -Math.PI / 2; s.position.set(CIUDAD.ancho / 2, 0, CIUDAD.largo / 2); s.scale.y = -1;   // el lienzo crece hacia abajo; el mundo hacia +z
    escena.add(s); return s;
  }
  // --- edificios y árboles instanciados (un cuerpo y un contorno cada tipo)
  function instancia(geo, lista, color, escalaBorde) {
    const cuerpo = new T.InstancedMesh(geo, toon({ color: 0xffffff }), lista.length), borde = new T.InstancedMesh(geo, new T.MeshBasicMaterial({ color: CONTORNO, side: T.BackSide }), lista.length);
    const m = _m(), q = new T.Quaternion(), p = _v(), s = _v(), col = new T.Color();
    lista.forEach((e, i) => {
      p.set(e.x, e.y || 0, e.z); s.set(e.sx, e.sy, e.sz); m.compose(p, q, s); cuerpo.setMatrixAt(i, m); cuerpo.setColorAt(i, col.set(color(e)));
      s.multiplyScalar(escalaBorde); p.y -= (escalaBorde - 1) * e.sy / 2; m.compose(p, q, s); borde.setMatrixAt(i, m);
    });
    cuerpo.instanceColor.needsUpdate = true; escena.add(cuerpo); escena.add(borde);
  }
  function montaCiudad() {
    const cajaBase = new T.BoxGeometry(1, 1, 1); cajaBase.translate(0, 0.5, 0);
    const ed = CIUDAD.manzanas.flatMap(m => m.edificios.map(e => ({ x: e.x, z: e.z, sx: e.w, sy: e.h, sz: e.d, color: e.color })));
    instancia(cajaBase, ed, e => e.color, 1.03);
    const tronco = new T.CylinderGeometry(0.35, 0.45, 1, 7); tronco.translate(0, 0.5, 0);
    instancia(tronco, CIUDAD.arboles.map(a => ({ x: a.x, z: a.z, sx: 1, sy: a.alto * 0.5, sz: 1 })), () => 0x7a4a2a, 1.25);
    const copa = new T.DodecahedronGeometry(1, 0); copa.translate(0, 0.6, 0);
    instancia(copa, CIUDAD.arboles.map(a => ({ x: a.x, z: a.z, y: a.alto * 0.5, sx: a.radio, sy: a.radio * 0.9, sz: a.radio })), () => 0x3f9a3a, 1.06);
    // las rampas (una cuña: caja inclinada) y los escondites
    for (const r of CIUDAD.rampas) { const g = mallaConBorde(unir([caja(0xff7a1a, [0, 0.5, r.largo * 0.3], [r.ancho, 0.5, r.largo * 0.62], [-0.32, 0, 0])]), 0.06); g.position.set(r.x, 0, r.z); g.rotation.y = r.ang; escena.add(g); }
    for (const e of CIUDAD.escondites) { const g = mallaConBorde(unir([caja(0x4fc3d9, [0, 2.5, 0], [0.3, 5, 0.3]), caja(0x4fc3d9, [0, 5.4, 0], [2.4, 1.4, 0.3])]), 0.06); g.position.set(e.x, 0, e.z - e.radio + 1); escena.add(g); }
    // las salidas de los eventos: letrero y, si hace falta, coches aparcados
    for (const s of EVENTOS.salidas) {
      const col = s.tipo === 'turno' ? 0xffcb3d : s.tipo === 'sprint' ? 0x7ee04a : 0x2e8bff;
      anillo(col, 5).position.set(s.x, 0.06, s.z);
      const poste = mallaConBorde(unir([caja(0xcdb9ea, [0, 1.6, 0], [0.2, 3.2, 0.2]), caja(col, [0, 3.4, 0], [1.8, 1, 0.2])]), 0.05); poste.position.set(s.x + (s.tipo === 'turno' ? 4 : -4), 0, s.z); escena.add(poste);
      if (s.tipo === 'sprint') for (let i = 0; i < 3; i++) { const m = mallaCoche('rival', [0xff4b5c, 0x7ee04a, 0x8a6fe0][i]); m.position.set(s.nodo.x - 4 + i * 4, 0, s.nodo.z - 12 - (i % 2) * 5); m.rotation.y = 0.2; m.userData.fijo = true; }
      if (s.tipo === 'huida') { const m = mallaCoche('policia', 0xb8b4c4); m.position.set(s.nodo.x - 5, 0, s.nodo.z - 8); m.rotation.y = -0.6; }
    }
    // los puntos del camino y el destino
    const pg = new T.CylinderGeometry(0.6, 0.6, 0.15, 10);
    puntos = new T.InstancedMesh(pg, new T.MeshBasicMaterial({ color: 0xffcb3d }), 80); puntos.count = 0; escena.add(puntos);
    destinoMalla = new T.Group(); destinoMalla.add(new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 40, 10, 1, true), new T.MeshBasicMaterial({ color: 0xffcb3d, transparent: true, opacity: 0.35, side: T.DoubleSide }))); destinoMalla.children[0].position.y = 20; destinoMalla.add(anillo(0xffcb3d, 5)); destinoMalla.visible = false; escena.add(destinoMalla);
  }

  function iniciar(canvas) {
    T = window.THREE; lienzo = canvas;
    render = new T.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    render.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    escena = new T.Scene(); escena.background = new T.Color(0x150b21); escena.fog = new T.Fog(0x150b21, 90, 220);
    camara = new T.PerspectiveCamera(TAXI.camara.fov[0], 1, 0.5, 400);
    escena.add(new T.HemisphereLight(0xcdb9ea, 0x4a3a6a, 2.2));
    const sol = new T.DirectionalLight(0xfff1e0, 1.6); sol.position.set(60, 120, 40); escena.add(sol);
    suelo = pintaSuelo(); montaCiudad();
    jugadorMalla = mallaCoche('taxi', 0xffcb3d);
    tamaño(); window.addEventListener('resize', tamaño);
  }
  function tamaño() { const w = innerWidth, h = innerHeight; render.setSize(w, h, false); camara.aspect = w / h; camara.updateProjectionMatrix(); }
  // coloca una malla de coche en su estado
  function pon(m, c, dt) {
    m.position.set(c.x, c.y, c.z); m.rotation.y = c.ang + (c.derrapando ? clamp(c.vl * 0.04, -0.5, 0.5) : 0);
    m.rotation.z = lerp(m.rotation.z, -c.giro * 0.08 - c.vl * 0.012, Math.min(1, 10 * dt)); m.rotation.x = c.aire ? clamp(-c.vy * 0.03, -0.4, 0.4) : 0;
  }
  function sincroniza(estado, dt) {
    const j = estado.jugador; pon(jugadorMalla, j, dt);
    // los coches que hay ahora (tráfico, policía, rivales): una malla por conductor, se crean y se quitan según aparecen
    const vivos = new Set();
    for (const c of estado.conductores) {
      vivos.add(c);
      let m = coches.get(c); if (!m) { m = mallaCoche(c.tipo === 'policia' ? 'policia' : c.tipo === 'rival' ? 'rival' : 'trafico', c.tipo === 'policia' ? 0xb8b4c4 : c.color); coches.set(c, m); }
      pon(m, c.coche, dt); if (c.tipo === 'policia' && c.persigue) { m.children[0].material.emissive = m.children[0].material.emissive || new T.Color(0); }
    }
    for (const [c, m] of coches) if (!vivos.has(c)) { escena.remove(m); coches.delete(c); }
    // las patrullas caídas: giradas y hundiéndose
    for (const ca of estado.caidas) { let m = ca.malla; if (!m) { m = ca.malla = mallaCoche('policia', 0x6a5a86); } m.position.set(ca.x, -Math.max(0, 2.5 - ca.t) * 0.8, ca.z); m.rotation.set(0, ca.ang, Math.PI * (1 - ca.t / 2.5) * 0.5); if (ca.t < 0.05) escena.remove(m); }
    // los pasajeros: cuerpo y anillo
    const esp = new Set();
    for (const p of estado.pasajeros) {
      esp.add(p); let m = pasajeroMallas.get(p);
      if (!m) { m = mallaConBorde(geoPasajero(p.tipo.color), 0.05); m.position.set(p.x, 0, p.z); m.rotation.y = p.mira; escena.add(m); m.userData.anillo = anillo(p.tramo.color); m.userData.anillo.position.set(p.x, 0.06, p.z); pasajeroMallas.set(p, m); }
      m.position.y = p.subiendo > 0 ? Math.sin(p.subiendo * 12) * 0.15 : Math.abs(Math.sin(p.t * 3)) * 0.12;
    }
    for (const [p, m] of pasajeroMallas) if (!esp.has(p)) { escena.remove(m); escena.remove(m.userData.anillo); pasajeroMallas.delete(p); }
    // el camino de puntos y el destino
    const cam = estado.camino || [];
    const mm = _m(), q = new T.Quaternion(), s = _v().set(1, 1, 1), p = _v(); let n = 0;
    for (let i = 0; i < cam.length - 1 && n < puntos.count + 80; i++) {
      const a = cam[i], b = cam[i + 1], d = Math.hypot(b.x - a.x, b.z - a.z), pasos = Math.max(1, Math.floor(d / 8));
      for (let k = 0; k < pasos && n < 80; k++) { const t = k / pasos; p.set(lerp(a.x, b.x, t), 0.08, lerp(a.z, b.z, t)); mm.compose(p, q, s); puntos.setMatrixAt(n++, mm); }
    }
    puntos.count = n; puntos.instanceMatrix.needsUpdate = true;
    if (estado.destino) { destinoMalla.visible = true; destinoMalla.position.set(estado.destino.x, 0, estado.destino.z); destinoMalla.children[1].material.color.set(estado.destino.color || 0xffcb3d); } else destinoMalla.visible = false;
    // la cámara: detrás y arriba, mirando por delante; abre con la velocidad
    const K = TAXI.camara, f = COCHE.adelante(j), vel = clamp(Math.abs(j.v) / TAXI.coche.vmax, 0, 1);
    let atras = K.atras + vel * 3;
    while (atras > 3 && !CIUDAD.enCalle(j.x - f.x * atras, j.z - f.z * atras)) atras -= 1;   // que la cámara no se meta en un edificio
    const objetivo = _v().set(j.x - f.x * atras, K.alto + j.y * 0.5 + (K.atras - atras) * 0.5, j.z - f.z * atras);
    camara.position.lerp(objetivo, Math.min(1, K.suave * dt)); if (camara.position.y < 1.5) camara.position.y = 1.5;
    camara.lookAt(j.x + f.x * K.mira, 1 + j.y, j.z + f.z * K.mira);
    camara.fov = lerp(camara.fov, lerp(K.fov[0], K.fov[1], vel) + (j.usandoNitro ? 6 : 0), Math.min(1, 4 * dt)); camara.updateProjectionMatrix();
    if (estado.temblor > 0) { camara.position.x += (Math.random() - 0.5) * estado.temblor; camara.position.y += (Math.random() - 0.5) * estado.temblor; }
    render.render(escena, camara);
  }
  const info = () => (render ? { calls: render.info.render.calls, tris: render.info.render.triangles } : { calls: 0, tris: 0 });
  return { iniciar, sincroniza, info };
})();
