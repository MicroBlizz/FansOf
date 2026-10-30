// Fans Of Taxi · ESCENA: lo que se ve, con three.js (la copia recortada del boceto 3D de Rumble) y el mismo estilo de dibujo animado: tres
// tonos de luz, contorno oscuro. El mundo lo montan TROZOS (suelo lejano y trozos con detalle) y FONDO (cielo y mar); aquí van los
// coches (cada uno UNA malla con el color en los vértices más su contorno), los pasajeros, las salidas de los eventos, el camino de puntos
// y la cámara, que va detrás del coche, sigue las cuestas y abre el campo de visión con la velocidad. La lógica no toca nada de aquí.
'use strict';
const ESCENA = (() => {
  const CONTORNO = 0x20102c;
  let T, render, escena, camara, jugadorMalla, puntos, destinoMalla, anillos = [], coches = new Map(), caidas = [], pasajeroMallas = new Map(), cache = {}, lienzo;
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
      const g = pz.geo.index ? pz.geo.toNonIndexed() : pz.geo; const m = _m();
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
  // una caja sin algunas caras (túneles abiertos por donde entra la carretera): `caras` dice cuáles quedan, en el orden px nx py ny pz nz
  function cajaAbierta(color, p, [w, h, d], r, caras) {
    const g = new T.BoxGeometry(w, h, d).toNonIndexed(), P = g.attributes.position.array, N = g.attributes.normal.array, pos = [], nor = [];
    for (let f = 0; f < 6; f++) if (caras[f]) for (let i = f * 18; i < f * 18 + 18; i++) { pos.push(P[i]); nor.push(N[i]); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(new Float32Array(pos), 3)); geo.setAttribute('normal', new T.BufferAttribute(new Float32Array(nor), 3));
    return { geo, color, p, r };
  }

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
  function mallaCoche(tipo, color) { const g = mallaConBorde(geoCoche(tipo, color), 0.07); g.rotation.order = 'YXZ'; escena.add(g); return g; }
  // --- un pasajero: cuerpo de color de su personaje, cabeza, y su anillo en el suelo
  function geoPasajero(color) {
    const k = 'p' + color; if (cache[k]) return cache[k];
    return (cache[k] = unir([cil(color, [0, 0.8, 0], 0.42, 1.2, null, 10), { geo: new T.SphereGeometry(0.42, 10, 8), color: 0xffe0c0, p: [0, 1.75, 0] }, caja(0x20102c, [0.15, 1.8, 0.36], [0.1, 0.1, 0.1]), caja(0x20102c, [-0.15, 1.8, 0.36], [0.1, 0.1, 0.1])]));
  }
  function anillo(color, radio = 2.4) { const m = new T.Mesh(new T.RingGeometry(radio * 0.7, radio, 28), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: T.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.y = 0.06; escena.add(m); return m; }

  // --- las salidas de los eventos (letrero y coches aparcados), el camino de puntos y el destino
  function montaEventos() {
    // las salidas de los eventos: letrero y, si hace falta, coches aparcados
    for (const s of EVENTOS.salidas) {
      const col = s.tipo === 'turno' ? 0xffcb3d : s.tipo === 'sprint' ? 0x7ee04a : 0x2e8bff;
      anillo(col, 5).position.set(s.x, s.y + 0.06, s.z);
      const poste = mallaConBorde(unir([caja(0xcdb9ea, [0, 1.6, 0], [0.2, 3.2, 0.2]), caja(col, [0, 3.4, 0], [1.8, 1, 0.2])]), 0.05); poste.position.set(s.x + (s.tipo === 'turno' ? 4 : -4), s.y, s.z); escena.add(poste);
      if (s.tipo === 'sprint') for (let i = 0; i < 3; i++) { const m = mallaCoche('rival', [0xff4b5c, 0x7ee04a, 0x8a6fe0][i]); const x = s.nodo.x - 4 + i * 4, z = s.nodo.z - 12 - (i % 2) * 5; m.position.set(x, CIUDAD.altura(x, z, s.y), z); m.rotation.y = 0.2; m.userData.fijo = true; }
      if (s.tipo === 'huida') { const m = mallaCoche('policia', 0xb8b4c4); const x = s.nodo.x - 5, z = s.nodo.z - 8; m.position.set(x, CIUDAD.altura(x, z, s.y), z); m.rotation.y = -0.6; }
    }
    // los puntos del camino y el destino
    const pg = new T.CylinderGeometry(0.6, 0.6, 0.15, 10);
    puntos = new T.InstancedMesh(pg, new T.MeshBasicMaterial({ color: 0xffcb3d }), 80); puntos.count = 0; escena.add(puntos);
    destinoMalla = new T.Group(); destinoMalla.add(new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 40, 10, 1, true), new T.MeshBasicMaterial({ color: 0xffcb3d, transparent: true, opacity: 0.35, side: T.DoubleSide }))); destinoMalla.children[0].position.y = 20; destinoMalla.add(anillo(0xffcb3d, 5)); destinoMalla.visible = false; escena.add(destinoMalla);
  }

  function iniciar(canvas) {
    T = window.THREE; lienzo = canvas;
    render = new T.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    resMax = Math.min(devicePixelRatio || 1, 1.5); res = resMax; render.setPixelRatio(res);
    escena = new T.Scene(); FONDO.montar(T, escena, toon, CONTORNO);   // cielo, mar, montañas y la niebla del horizonte
    camara = new T.PerspectiveCamera(TAXI.camara.fov[0], 1, 0.5, 2600);
    escena.add(new T.HemisphereLight(0xcdb9ea, 0x4a3a6a, 2.2));
    const sol = new T.DirectionalLight(0xfff1e0, 1.6); sol.position.set(60, 120, 40); escena.add(sol);
    TROZOS.iniciar(T, escena, { toon, unir, mallaConBorde, caja, cajaAbierta, cil, CONTORNO });
    montaEventos();
    jugadorMalla = mallaCoche('taxi', 0xffcb3d);
    tamaño(); window.addEventListener('resize', tamaño);
  }
  // --- la cámara dentro de un túnel: alrededor solo hay roca, así que no puede salirse del tubo (ni a los lados ni por arriba)
  const TECHO_CAMARA = CINTAS.estilo.medidas.techoTunel - 2.5;
  // el túnel (o la trinchera de su boca) por el que va el coche, o null
  function tuboDe(j) {
    const c = CIUDAD.carreteraEn(j.x, j.z, j.y, false);
    return c && (c.e.tipo === 'tunel' || c.e.tipo === 'rampa') && c.d <= c.e.ancho / 2 + 1 ? c.e : null;
  }
  // ¿puede ir la cámara en (x, z)? fuera de los edificios y, si el coche va por un túnel, entre sus paredes
  function cabeCamara(x, z, j, tubo) {
    if (!CIUDAD.libre(x, z, j.y + 2)) return false;
    if (!tubo) return true;
    const c = CIUDAD.carreteraEn(x, z, j.y, false);
    return !!c && (c.e.tipo === 'tunel' || c.e.tipo === 'rampa') && c.d < c.e.ancho / 2 - 1;
  }
  function tamaño() { const w = innerWidth, h = innerHeight; render.setSize(w, h, false); camara.aspect = w / h; camara.updateProjectionMatrix(); }
  // coloca una malla de coche en su estado
  function pon(m, c, dt) {
    if (c.rot) { m.position.set(c.x, c.y, c.z); m.quaternion.set(c.rot.x, c.rot.y, c.rot.z, c.rot.w); return; }   // coche con física de verdad: su giro, tal cual
    m.position.set(c.x, c.y, c.z); m.rotation.y = c.ang + (c.derrapando ? clamp(c.vl * 0.04, -0.5, 0.5) : 0);
    m.rotation.z = lerp(m.rotation.z, -c.giro * 0.08 - c.vl * 0.012, Math.min(1, 10 * dt));
    m.rotation.x = lerp(m.rotation.x, c.aire ? clamp(-c.vy * 0.03, -0.4, 0.4) : -Math.atan(c.pendiente || 0), Math.min(1, 8 * dt));   // morro arriba en las cuestas
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
      if (!m) { m = mallaConBorde(geoPasajero(p.tipo.color), 0.05); m.position.set(p.x, p.y, p.z); m.rotation.y = p.mira; escena.add(m); m.userData.anillo = anillo(p.tramo.color); m.userData.anillo.position.set(p.x, p.y + 0.06, p.z); pasajeroMallas.set(p, m); }
      m.position.y = p.y + (p.subiendo > 0 ? Math.sin(p.subiendo * 12) * 0.15 : Math.abs(Math.sin(p.t * 3)) * 0.12);
    }
    for (const [p, m] of pasajeroMallas) if (!esp.has(p)) { escena.remove(m); escena.remove(m.userData.anillo); pasajeroMallas.delete(p); }
    // el camino de puntos y el destino
    const cam = estado.camino || [];
    const mm = _m(), q = new T.Quaternion(), s = _v().set(1, 1, 1), p = _v(); let n = 0;
    for (let i = 0; i < cam.length - 1 && n < puntos.count + 80; i++) {
      const a = cam[i], b = cam[i + 1], d = Math.hypot(b.x - a.x, b.z - a.z), pasos = Math.max(1, Math.floor(d / 8));
      for (let k = 0; k < pasos && n < 80; k++) { const t = k / pasos; const x = lerp(a.x, b.x, t), z = lerp(a.z, b.z, t); p.set(x, CIUDAD.altura(x, z, lerp(a.y, b.y, t)) + 0.12, z); mm.compose(p, q, s); puntos.setMatrixAt(n++, mm); }
    }
    puntos.count = n; puntos.instanceMatrix.needsUpdate = true;
    if (estado.destino) { destinoMalla.visible = true; destinoMalla.position.set(estado.destino.x, estado.destino.y || CIUDAD.altura(estado.destino.x, estado.destino.z), estado.destino.z); destinoMalla.children[1].material.color.set(estado.destino.color || 0xffcb3d); } else destinoMalla.visible = false;
    // la cámara: detrás y arriba, mirando por delante; abre con la velocidad
    const K = TAXI.camara, f = COCHE.adelante(j), vel = clamp(Math.abs(j.v) / TAXI.coche.vmax, 0, 1);
    const tubo = tuboDe(j);
    let atras = K.atras + vel * 3;
    while (atras > 3 && !cabeCamara(j.x - f.x * atras, j.z - f.z * atras, j, tubo)) atras -= 1;   // que no se meta en un edificio ni en la roca
    const cx = j.x - f.x * atras, cz = j.z - f.z * atras;
    const objetivo = _v().set(cx, j.y + K.alto + (K.atras - atras) * 0.5, cz);
    if (tubo) objetivo.y = Math.min(objetivo.y, j.y + TECHO_CAMARA);
    const yAntes = camara.position.y;
    camara.position.lerp(objetivo, Math.min(1, (K.suave + Math.abs(j.v) * 0.25) * dt));   // a más velocidad, menos retraso: el coche no se aleja
    camara.position.y = lerp(yAntes, objetivo.y, Math.min(1, K.suaveAlto * dt));   // la altura, más suave: los botes de la suspensión no mueven la vista
    if (tubo && !cabeCamara(camara.position.x, camara.position.z, j, tubo)) camara.position.copy(objetivo);   // el retraso no la saca del túnel
    if (tubo) camara.position.y = Math.min(camara.position.y, j.y + TECHO_CAMARA);
    const suelo = CIUDAD.altura(camara.position.x, camara.position.z, j.y) + 1.6; if (camara.position.y < suelo) camara.position.y = suelo;   // ni bajo el suelo (cuestas)
    camara.lookAt(j.x + f.x * K.mira, 1 + j.y, j.z + f.z * K.mira);
    camara.fov = lerp(camara.fov, lerp(K.fov[0], K.fov[1], vel) + (j.usandoNitro ? 6 : 0), Math.min(1, 4 * dt)); camara.updateProjectionMatrix();
    if (estado.temblor > 0) { camara.position.x += (Math.random() - 0.5) * estado.temblor; camara.position.y += (Math.random() - 0.5) * estado.temblor; }
    ajustaResolucion(dt); TROZOS.actualizar(j.x, j.z); FONDO.sigue(camara); render.render(escena, camara);
  }
  // una captura pequeña (jpeg) para los reportes de prueba: se vuelve a dibujar y se copia reducida (el lienzo WebGL no conserva el fotograma)
  function captura() {
    if (!render) return null; render.render(escena, camara);
    const c = document.createElement('canvas'), w = 720, h = Math.round(720 * render.domElement.height / render.domElement.width); c.width = w; c.height = h;
    c.getContext('2d').drawImage(render.domElement, 0, 0, w, h); return c.toDataURL('image/jpeg', 0.6);
  }
  const info = () => (render ? { calls: render.info.render.calls, tris: render.info.render.triangles, res } : { calls: 0, tris: 0, res: 1 });
  // resolución adaptativa: si no llega a 45 fps baja la resolución un escalón (hasta la mitad); si sobra, la sube. Cada 3 s
  let res = 1, resMax = 1, fpsAcum = 0, fpsN = 0, resT = 0;
  function ajustaResolucion(dt) {
    fpsAcum += dt; fpsN++; resT += dt; if (resT < 3) return;
    const fps = fpsN / fpsAcum; fpsAcum = fpsN = resT = 0;
    const antes = res;
    if (fps < 45 && res > 0.5) res = Math.max(0.5, res - 0.25); else if (fps > 57 && res < resMax) res = Math.min(resMax, res + 0.25);
    if (res !== antes) render.setPixelRatio(res);
  }
  return { iniciar, sincroniza, info, captura };
})();
