// Fans Of Pets · adaptador · MANIQUÍ 3D: monta en three.js el maniquí de una criatura con sus medidas (maniqui.js), le PROYECTA de frente
// su dibujo original (maniqui-proyeccion.js) y lo pinta en el lienzo del juego con su pose (maniqui-poses.js). Cámara ortogonal de frente,
// sombreado de dibujo con tres luces (principal cálida arriba a la izquierda, relleno frío suave y contraluz) y los ojos en su propia capa
// para que parpadee. three.js (js/three.min.js) se carga solo la primera vez que se pide un maniquí; mientras carga, pinta() devuelve
// false y quien llama pinta lo de siempre. De momento solo lo usa la escena DEV de animaciones (docs/pets/animacion-2d.md).
'use strict';
PT.maniqui3d = (() => {
  const LADO = 640, MARGEN = 160, RES = 768;   // el dibujo es de 640; se encuadra con 160 de margen por cada lado
  const LINEA = [44, 26, 22];
  let T = null, render = null, cargando = null;
  const MONTAJES = {};   // id → montaje listo (o 'montando' / 'roto')
  const MONTANDO = {};   // id → la promesa de su montaje

  const tres = () => cargando || (cargando = import(new URL('js/three.min.js', document.baseURI).href).catch(e => { cargando = null; throw e; }).then(m => {
    T = m; render = new T.WebGLRenderer({ canvas: document.createElement('canvas'), antialias: true, alpha: true, preserveDrawingBuffer: true });
    render.setSize(RES, RES, false); render.setClearColor(0x000000, 0);
  }));
  const carga = src => new Promise((bien, mal) => { const i = new Image(); i.onload = () => bien(i); i.onerror = () => mal(new Error('no carga ' + src)); i.src = src; });
  function pixeles(img) { const c = document.createElement('canvas'); c.width = c.height = LADO; const x = c.getContext('2d'); x.drawImage(img, 0, 0, LADO, LADO); return x.getImageData(0, 0, LADO, LADO).data; }
  function texturaDe(rgba) {
    const c = document.createElement('canvas'); c.width = c.height = LADO; c.getContext('2d').putImageData(new ImageData(rgba, LADO, LADO), 0, 0);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.premultiplyAlpha = false; t.generateMipmaps = false; t.minFilter = T.LinearFilter; return t;
  }
  function tonos() { const t = new T.DataTexture(new Uint8Array([212, 236, 250, 255]), 4, 1, T.RedFormat); t.minFilter = t.magFilter = T.NearestFilter; t.needsUpdate = true; return t; }
  function borde(g) {
    const m = new T.MeshBasicMaterial({ color: 0x2a1812, side: T.BackSide });
    m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n transformed += normal * ${g.toFixed(4)};`); };
    return m;
  }
  // una malla de objeto (no proyectada) con su sombreado y su contorno
  const cosaCon = gradiente => (geo, color, padre, pos = [0, 0, 0], opc = {}) => {
    const mat = new T.MeshToonMaterial(opc.map ? { map: opc.map, gradientMap: gradiente } : { color, gradientMap: gradiente });
    if (opc.doble) mat.side = T.DoubleSide;
    const m = new T.Mesh(geo, mat); m.position.set(...pos); padre.add(m);
    if (opc.borde !== false) m.add(new T.Mesh(geo, borde(opc.grosor || 0.012)));
    return m;
  };
  // la geometría de cada pieza: bola, palo (cápsula que cuelga de su base) o palo hueco (oreja larga, plana)
  function geometria(p) {
    if (p.forma === 'bola') return new T.SphereGeometry(1, 64, 40).scale(...p.r);
    if (p.hueca) return new T.SphereGeometry(1, 48, 32).scale(p.grueso, p.largo / 2 + 0.02, 0.04).translate(0, -p.largo / 2, 0);
    return new T.CapsuleGeometry(p.grueso, p.largo, 10, 24).translate(0, -p.largo / 2, 0);
  }
  // los huesos en su sitio (relativos a su padre) y cada pieza colgada del suyo
  function esqueleto(m, gradiente) {
    const raiz = new T.Group(), J = {}, mundo = {};
    for (const h of m.huesos) {
      const n = new T.Group(), padre = h.padre ? J[h.padre] : raiz, pp = h.padre ? mundo[h.padre] : [0, 0, 0];
      n.position.set(h.pos[0] - pp[0], h.pos[1] - pp[1], h.pos[2] - pp[2]); padre.add(n); J[h.nombre] = n; mundo[h.nombre] = h.pos;
    }
    const piezas = m.piezas.map(p => {
      const malla = new T.Mesh(geometria(p), new T.MeshToonMaterial({ color: p.color, gradientMap: gradiente })), hp = mundo[p.hueso];
      if (p.forma === 'palo') { J[p.hueso].rotation.z = p.giro; } else malla.position.set(p.pos[0] - hp[0], p.pos[1] - hp[1], p.pos[2] - hp[2]);
      J[p.hueso].add(malla); malla.userData = p; return malla;
    });
    return { raiz, J, piezas };
  }
  // qué pieza se ve delante en cada píxel del dibujo (de arriba abajo), con una cámara que encaja justo con el dibujo
  function mapaIds(med, raiz, piezas) {
    const [x0, y0] = PT.maniqui.aMundo(med, [0, 0]), [x1, y1] = PT.maniqui.aMundo(med, [LADO, LADO]);
    const cam = new T.OrthographicCamera(x0, x1, y0, y1, 0.01, 100); cam.position.set(0, 0, 10);
    const esc = new T.Scene(), copia = raiz.clone(true); esc.add(copia);
    const porGeo = new Map(piezas.map(p => [p.geometry, p.userData.id]));
    copia.traverse(o => { if (o.isMesh) o.material = new T.MeshBasicMaterial({ color: new T.Color(porGeo.get(o.geometry) / 255, 0, 0) }); });
    const rt = new T.WebGLRenderTarget(LADO, LADO), crudo = new Uint8Array(LADO * LADO * 4), ids = new Uint8Array(LADO * LADO);
    render.setRenderTarget(rt); render.setClearColor(0x000000, 1); render.render(esc, cam); render.readRenderTargetPixels(rt, 0, 0, LADO, LADO, crudo);
    render.setRenderTarget(null); render.setClearColor(0x000000, 0); rt.dispose();
    for (let y = 0; y < LADO; y++) for (let x = 0; x < LADO; x++) ids[y * LADO + x] = crudo[((LADO - 1 - y) * LADO + x) * 4];
    return ids;
  }
  // a cada pieza: su uv proyectada de frente (en reposo), su trozo del dibujo y el sombreado que respeta el dibujo
  function proyecta(med, piezas, rgba, ids) {
    const cerca = PT.maniquiProyeccion.franja(rgba, LADO, 5), v = new T.Vector3();
    for (const p of piezas) {
      const pos = p.geometry.attributes.position, uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(p.matrixWorld); const q = PT.maniqui.uv(med, [v.x, v.y], LADO); uv[i * 2] = q[0]; uv[i * 2 + 1] = q[1]; }
      p.geometry.setAttribute('uv', new T.BufferAttribute(uv, 2));
      p.material.map = texturaDe(PT.maniquiProyeccion.textura({ rgba, ids, cerca, lado: LADO, id: p.userData.id, linea: LINEA }));
      p.material.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>',
        'vec4 dibu = texture2D( map, vMapUv ); if ( dibu.a < 0.3 ) discard; if ( dibu.a > 0.75 ) diffuseColor.rgb = dibu.rgb;'); };
      p.material.needsUpdate = true;
    }
  }
  // los ojos: del propio dibujo (se borran de él y van a su capa) o de las piezas de cara del juego
  async function ojos(med, original) {
    const o = med.ojos;
    if (o.de === 'dibujo') {
      const lienzo = document.createElement('canvas'); lienzo.width = lienzo.height = LADO; const x = lienzo.getContext('2d');
      x.strokeStyle = o.cerrados; x.lineWidth = 7; x.lineCap = 'round';
      for (const [cx, cy] of o.lista) { x.beginPath(); x.arc(cx, cy - 14, 26, 0.2 * Math.PI, 0.8 * Math.PI); x.stroke(); }
      return { rgba: PT.maniquiProyeccion.sinOjos(original, LADO, o.lista, [...o.fondo, 255]), abiertos: texturaDe(PT.maniquiProyeccion.soloOjos(original, LADO, o.lista)),
        cerrados: texturaDe(x.getImageData(0, 0, LADO, LADO).data) };
    }
    const [ab, ce, bo] = await Promise.all([o.abiertos, o.cerrados, o.boca].map(carga));
    const cara = img => { const c = document.createElement('canvas'); c.width = c.height = LADO; const x = c.getContext('2d');
      x.drawImage(img, o.c[0] - img.width / 2, o.c[1] - img.height / 2); x.drawImage(bo, med.boca[0] - bo.width / 2, med.boca[1] - bo.height / 2); return texturaDe(x.getImageData(0, 0, LADO, LADO).data); };
    return { rgba: original, abiertos: cara(ab), cerrados: cara(ce) };
  }
  function luces(esc) {
    esc.add(new T.HemisphereLight(0xfff6ee, 0x8a7aa8, 1.25));
    for (const [c, i, p] of [[0xfff1dd, 1.5, [-1.8, 2.4, 2.2]], [0xdfe8ff, 0.45, [2.2, 0.4, 1.6]], [0xffe6f2, 0.9, [0.4, 1.5, -3]]]) { const l = new T.DirectionalLight(c, i); l.position.set(...p); esc.add(l); }
    // la sombra: una elipse de cara a la cámara, detrás de los pies (la cámara mira de frente: un disco en el suelo se vería de canto)
    const sombra = new T.Mesh(new T.CircleGeometry(0.28, 40), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
    sombra.position.set(0, 0.005, -0.35); sombra.scale.set(1.2, 0.17, 1); esc.add(sombra);
  }
  async function monta(id) {
    await tres();
    const m = PT.maniqui.de(id).valor, med = m.medidas, gradiente = tonos();
    const { raiz, J, piezas } = esqueleto(m, gradiente);
    raiz.updateMatrixWorld(true);
    const cara = await ojos(med, pixeles(await carga(med.dibujo)));
    const ids = mapaIds(med, raiz, piezas);
    proyecta(med, piezas, cara.rgba, ids);
    const cabeza = piezas.find(p => p.userData.cara);
    const capa = new T.Mesh(cabeza.geometry, new T.MeshToonMaterial({ map: cara.abiertos, gradientMap: gradiente, transparent: true, depthWrite: false }));
    capa.scale.setScalar(1.004); cabeza.add(capa);
    const r = cabeza.userData.r, boca = cabeza.worldToLocal(new T.Vector3(...PT.maniqui.aMundo(med, med.boca), 0));
    boca.z = r[2] * Math.sqrt(Math.max(0, 1 - (boca.x / r[0]) ** 2 - (boca.y / r[1]) ** 2)) + 0.03;
    const escena = new T.Scene(); escena.add(raiz); luces(escena);
    const [x0, y0] = PT.maniqui.aMundo(med, [-MARGEN, -MARGEN]), [x1, y1] = PT.maniqui.aMundo(med, [LADO + MARGEN, LADO + MARGEN]);
    const cam = new T.OrthographicCamera(x0, x1, y0, y1, 0.01, 100); cam.position.set(0, 0, 10);
    const reposo = {}; for (const [k, n] of Object.entries(J)) reposo[k] = { p: n.position.clone(), r: n.rotation.clone() };
    // las mallas de cada hueso: al respirar se estiran ellas, no el hueso (así no deforman a los hijos, como los brazos)
    const mallas = {}; for (const p of piezas) (mallas[p.userData.hueso] = mallas[p.userData.hueso] || []).push(p);
    const brazo = piezas.find(p => p.userData.hueso === 'brazo1'), largoMano = brazo ? brazo.userData.largo : 0;
    MONTAJES[id] = { med, escena, cam, raiz, J, reposo, mallas, largoMano, capa, cara, cabeza, boca, piezas, ids, objetos: PT.maniqui3dObjetos.crea(T, cosaCon(gradiente), med.estampado) };
  }
  // la pose sobre los huesos: cada uno vuelve a su reposo y se le suma lo que diga la pose
  function aplica(mo, pose) {
    for (const [k, n] of Object.entries(mo.J)) {
      const q = pose.huesos[k] || {}, rp = mo.reposo[k];
      n.position.set(rp.p.x, rp.p.y + (q.py || 0), rp.p.z + (q.pz || 0)); n.rotation.set(rp.r.x + (q.x || 0), rp.r.y + (q.y || 0), rp.r.z + (q.z || 0));
      const sy = q.sy || 1;
      for (const malla of mo.mallas[k] || []) malla.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy));
    }
    mo.raiz.position.y = pose.sentado;
    mo.capa.material.map = pose.ojos === 'cerrados' ? mo.cara.cerrados : mo.cara.abiertos;
    mo.raiz.updateMatrixWorld(true);
    const brazo = mo.J.brazo1, mano = brazo ? brazo.localToWorld(new T.Vector3(0, -mo.largoMano, 0)) : new T.Vector3();
    PT.maniqui3dObjetos.coloca(T, mo.objetos, mo.escena, pose, mo.cabeza.localToWorld(mo.boca.clone()), mano);
  }
  // monta la criatura una sola vez aunque la pidan a la vez el juego y el visor. Si falla (red, archivo que no está), lo dice por la
  // consola y vuelve a probar a los 10 s
  function asegura(id) {
    if (!MONTANDO[id]) {
      MONTAJES[id] = 'montando';
      MONTANDO[id] = monta(id).catch(e => {
        MONTAJES[id] = 'roto'; console.warn('Pets · maniquí 3D sin montar:', id, e.message);
        setTimeout(() => { delete MONTAJES[id]; delete MONTANDO[id]; }, 10000); throw e;
      });
    }
    return MONTANDO[id];
  }
  // para el visor de desarrollo (herramientas/pets/visor-3d.html): el montaje de una criatura, para mirarlo con su propia cámara.
  // pose(nombre, t) lo pone en esa pose y dice si existe; ids es qué pieza se ve en cada píxel del dibujo (de arriba abajo)
  async function montaje(id) {
    if (!PT.maniqui.tiene(id)) throw new Error('sin maniquí: ' + id);
    await asegura(id);
    const mo = MONTAJES[id];
    return { T, render, escena: mo.escena, piezas: mo.piezas, capa: mo.capa, ids: mo.ids, lado: LADO,
      pose: (nombre, t) => { const p = PT.maniquiPoses.de(nombre, t); if (p.ok) aplica(mo, p.valor); return p.ok; } };
  }
  // pinta el maniquí de la criatura id en la pose nombre, con su dibujo de 640 centrado en (x, y) a lado píxeles (como arte.js: el maniquí
  // en reposo cae justo encima del dibujo). Devuelve false si no hay maniquí para esa criatura o aún se está montando
  function pinta(ctx, id, x, y, lado, t, nombre) {
    if (!PT.maniqui.tiene(id)) return false;
    if (!MONTAJES[id]) asegura(id).catch(() => {});
    const mo = MONTAJES[id], pose = PT.maniquiPoses.de(nombre, t);
    if (typeof mo === 'string' || !pose.ok) return false;
    aplica(mo, pose.valor); render.render(mo.escena, mo.cam);
    const s = lado / LADO, borde = (LADO / 2 + MARGEN) * s;
    ctx.drawImage(render.domElement, x - borde, y - borde, 2 * borde, 2 * borde);
    return true;
  }
  return { pinta, montaje, listo: id => typeof MONTAJES[id] === 'object' };
})();
