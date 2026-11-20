// Tiny Fans · adaptador · PIEZAS 3D: las ayudas para montar muñecos con cajas, bolas, cilindros, conos y palos, con el material de dibujo
// plano de 4 tonos del boceto 4 (materiales y geometrías compartidos). Aquí nace TN.modelos, donde cada archivo modelos-*.js cuelga los
// suyos. También las texturas pixeladas pintadas por código (TN.piezas3d.textura).
'use strict';
TN.piezas3d = (() => {
  const T = THREE, mats = new Map(), geos = new Map(), a = new T.Vector3(), b = new T.Vector3();
  // rampa de 4 tonos: una sola banda de sombra y casi todo en su color de paleta
  const rampa = new T.DataTexture(new Uint8Array([105, 105, 105, 255, 150, 150, 150, 255, 255, 255, 255, 255, 255, 255, 255, 255]), 4, 1, T.RGBAFormat);
  rampa.minFilter = rampa.magFilter = T.NearestFilter; rampa.needsUpdate = true;
  const CAJA = new T.BoxGeometry(1, 1, 1), BOLA = new T.SphereGeometry(1, 10, 7);
  function material(color, opciones) {
    const k = color + (opciones ? JSON.stringify(opciones) : '');
    if (!mats.has(k)) mats.set(k, new T.MeshToonMaterial(Object.assign({ color, gradientMap: rampa }, opciones || {})));
    return mats.get(k);
  }
  const geo = (k, f) => { if (!geos.has(k)) geos.set(k, f()); return geos.get(k); };
  function pon(g, ge, mat, x, y, z, giro, escala, sinSombra) {
    const m = new T.Mesh(ge, mat); m.position.set(x || 0, y || 0, z || 0);
    if (giro) m.rotation.set(giro[0], giro[1], giro[2]);
    if (escala) m.scale.set(escala[0], escala[1], escala[2]);
    m.castShadow = !sinSombra && !mat.transparent; m.receiveShadow = !sinSombra; g.add(m); return m;
  }
  const yo = {
    rampa, material,
    grupo: () => new T.Group(),
    caja: (g, c, ancho, alto, fondo, x, y, z, giro, o) => pon(g, CAJA, material(c, o), x, y, z, giro, [ancho, alto, fondo]),
    bola: (g, c, rx, ry, rz, x, y, z, giro, o) => pon(g, BOLA, material(c, o), x, y, z, giro, [rx, ry, rz]),
    cilindro: (g, c, ra, rb, alto, x, y, z, giro, lados, o) => pon(g, geo(`c${ra}_${rb}_${alto}_${lados || 10}`, () => new T.CylinderGeometry(ra, rb, alto, lados || 10)), material(c, o), x, y, z, giro),
    cono: (g, c, radio, alto, x, y, z, giro, lados, o) => pon(g, geo(`k${radio}_${alto}_${lados || 8}`, () => new T.ConeGeometry(radio, alto, lados || 8)), material(c, o), x, y, z, giro),
    // un palo entre dos puntos (patas, antenas, cables)
    palo(g, c, grosor, ax, ay, az, bx, by, bz, o) {
      g.updateWorldMatrix(true, false); a.set(ax, ay, az); b.set(bx, by, bz);
      const m = pon(g, CAJA, material(c, o), (ax + bx) / 2, (ay + by) / 2, (az + bz) / 2, null, [grosor, grosor, a.distanceTo(b)]);
      m.lookAt(g.localToWorld(b.clone())); return m;
    },
    // patas de bicho a los dos lados: zs, dónde nace cada par
    patas(g, c, grosor, ancho, y, zs, largo, rodilla) {
      for (const z of zs) for (const s of [-1, 1]) {
        yo.palo(g, c, grosor, s * ancho, y, z, s * (ancho + largo * .5), rodilla, z * 1.5);
        yo.palo(g, c, grosor, s * (ancho + largo * .5), rodilla, z * 1.5, s * (ancho + largo), 0, z * 2.1);
      }
    },
    // un aro plano en el suelo, con filo claro para que contraste con la moqueta
    aro(g, color, radio, x, z) {
      const grupo = new T.Group(), plano = (ri, re, c, op) => {
        const m = new T.Mesh(geo(`a${ri}_${re}`, () => new T.RingGeometry(ri, re, 20)), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false }));
        m.rotation.x = -Math.PI / 2; grupo.add(m); return m;
      };
      plano(radio * .8, radio, color, .95); plano(radio, radio * 1.12, 0xfff7d1, .9);
      grupo.position.set(x || 0, .04, z || 0); g.add(grupo); return grupo;
    },
    // un disco plano en el suelo (sombras de aviso, charcos)
    disco(g, color, radio, x, z, opacidad) {
      const m = new T.Mesh(geo('d' + radio, () => new T.CircleGeometry(radio, 24)), new T.MeshBasicMaterial({ color, transparent: true, opacity: opacidad === undefined ? .5 : opacidad, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(x || 0, .03, z || 0); g.add(m); return m;
    },
    // un halo de luz suave alrededor de algo que brilla
    halo(g, color, radio, x, y, z) {
      return pon(g, BOLA, new T.MeshBasicMaterial({ color, transparent: true, opacity: .16, depthWrite: false, blending: T.AdditiveBlending }), x, y, z, null, [radio, radio, radio], true);
    },
    // una textura pixelada pintada por código: pinta(ctx, ancho, alto)
    textura(ancho, alto, pinta) {
      const c = document.createElement('canvas'); c.width = ancho; c.height = alto; pinta(c.getContext('2d'), ancho, alto);
      const t = new T.CanvasTexture(c); t.magFilter = t.minFilter = T.NearestFilter; t.generateMipmaps = false; t.wrapS = t.wrapT = T.RepeatWrapping; return t;
    },
    // un plano del suelo con una textura que se repite
    suelo(g, textura, ancho, fondo, x, z, y, repite) {
      const tx = textura.clone(); tx.needsUpdate = true; tx.repeat.set(ancho / repite, fondo / repite);
      const m = new T.Mesh(new T.PlaneGeometry(ancho, fondo), new T.MeshToonMaterial({ map: tx, gradientMap: rampa }));
      m.rotation.x = -Math.PI / 2; m.position.set(x, y || 0, z); m.receiveShadow = true; g.add(m); return m;
    },
  };
  return yo;
})();
// Cada modelo es una función que devuelve un THREE.Group nuevo, con el suelo en y = 0 y mirando a +z. Si se mueve, lleva
// grupo.userData.anima(t, datos): t en segundos; datos, lo que haga falta (andando, golpeado…)
TN.modelos = {};
