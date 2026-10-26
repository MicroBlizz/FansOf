// Fans Of Taxi · lo que rodea la ciudad para que no flote en el vacío: cielo de noche con degradado, estrellas y luna,
// la isla de tierra con su barrera, el mar de la bahía, montañas al norte y al oeste y siluetas de ciudades lejanas al este.
// Todo con pocas llamadas de dibujo (mallas instanciadas) y fuera de la niebla para que el horizonte se vea siempre.
'use strict';

const FONDO = (() => {
  const HORIZONTE = 0x3a1f5c;   // el color de la niebla y de la parte baja del cielo: así lo lejano se funde
  let cielo = null;

  function texturaCielo(T) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const g = c.getContext('2d'), az = mulberry32(11);
    const d = g.createLinearGradient(0, 0, 0, 512);
    d.addColorStop(0, '#07040f'); d.addColorStop(0.3, '#160b2e'); d.addColorStop(0.44, '#4a2170');
    d.addColorStop(0.49, '#ff6f9f'); d.addColorStop(0.5, '#3a1f5c'); d.addColorStop(1, '#3a1f5c');
    g.fillStyle = d; g.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 260; i++) {   // estrellas, más en lo alto
      const y = Math.pow(az(), 1.6) * 220, x = az() * 1024, r = az() < 0.1 ? 1.6 : 0.8;
      g.globalAlpha = 0.4 + az() * 0.6; g.fillStyle = '#fff6ea'; g.fillRect(x, y, r, r);
    }
    g.globalAlpha = 1;
    // la luna, con su contorno grueso como todo en la serie
    g.fillStyle = '#fff1c4'; g.strokeStyle = '#20102c'; g.lineWidth = 4;
    g.beginPath(); g.arc(300, 110, 26, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = '#e9d7a4'; g.beginPath(); g.arc(292, 104, 6, 0, Math.PI * 2); g.arc(309, 120, 4, 0, Math.PI * 2); g.fill();
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  }

  function montar(T, escena, toon, contorno) {
    const W = CIUDAD.ancho, L = CIUDAD.largo, cx = W / 2, cz = L / 2, az = mulberry32(5);
    escena.background = new T.Color(HORIZONTE); escena.fog = new T.Fog(HORIZONTE, 140, 430);
    // cielo: una esfera por dentro que sigue a la cámara
    cielo = new T.Mesh(new T.SphereGeometry(900, 24, 12), new T.MeshBasicMaterial({ map: texturaCielo(T), side: T.BackSide, fog: false, depthWrite: false }));
    cielo.renderOrder = -1; escena.add(cielo);
    // mar de la bahía
    const mar = new T.Mesh(new T.PlaneGeometry(4000, 4000), new T.MeshLambertMaterial({ color: 0x1d3a6e }));
    mar.rotation.x = -Math.PI / 2; mar.position.set(cx, -2, cz); escena.add(mar);
    // la isla: un bloque de tierra bajo la ciudad con borde de acantilado
    const M = 70, isla = new T.Mesh(new T.BoxGeometry(W + M * 2, 4, L + M * 2), toon({ color: 0x3b3550 }));
    isla.position.set(cx, -2.03, cz); escena.add(isla);
    // la barrera de la circunvalación (donde el coche ya no puede seguir)
    const barreras = [[cx, -0.6, W + 1.2, 1.2], [cx, L + 0.6, W + 1.2, 1.2], [-0.6, cz, 1.2, L], [W + 0.6, cz, 1.2, L]];
    const bg = new T.BoxGeometry(1, 1, 1);
    for (const [x, z, sx, sz] of barreras) {
      const b = new T.Mesh(bg, toon({ color: 0xffcb3d })); b.position.set(x, 0.6, z); b.scale.set(sx, 1.2, sz); escena.add(b);
      const o = new T.Mesh(bg, new T.MeshBasicMaterial({ color: contorno, side: T.BackSide })); o.position.copy(b.position); o.scale.set(sx + 0.3, 1.5, sz + 0.3); escena.add(o);
    }
    // montañas al norte y al oeste (la del triángulo entre ciudades, en grande) y ciudades lejanas al este
    const montes = [], cimas = [];
    const pon = (x, z, r, h) => { montes.push({ x, z, r, h }); if (h > 110) cimas.push({ x, z, r: r * 0.37, h: h * 0.36, y: h * 0.66 }); };
    pon(-260, L + 260, 230, 260);   // la gran montaña
    for (let i = 0; i < 14; i++) { const a = Math.PI * (0.5 + az() * 0.75), d = 420 + az() * 260; pon(cx + Math.cos(a) * d, cz + Math.sin(a) * d, 80 + az() * 110, 70 + az() * 150); }
    const monteMat = new T.MeshLambertMaterial({ flatShading: true, fog: false }), m4 = new T.Matrix4(), q = new T.Quaternion(), col = new T.Color();
    const conos = (lista, color, geo) => {
      const im = new T.InstancedMesh(geo, monteMat, lista.length);
      lista.forEach((e, i) => { m4.compose(new T.Vector3(e.x, (e.y || 0) - 2, e.z), q, new T.Vector3(e.r, e.h, e.r)); im.setMatrixAt(i, m4); im.setColorAt(i, col.set(color(e, i))); });
      escena.add(im);
    };
    const cono = new T.ConeGeometry(1, 1, 7); cono.translate(0, 0.5, 0);
    conos(montes, (e, i) => [0x2b1d4a, 0x33245a, 0x24183f][i % 3], cono);
    conos(cimas, () => 0xd9d2ee, cono);
    const torres = [];
    for (let i = 0; i < 40; i++) {   // al este: el puerto de Phony y la ciudad de IAhorro, solo siluetas
      const a = -Math.PI * 0.35 + az() * Math.PI * 0.7, d = 520 + az() * 140;
      torres.push({ x: cx + Math.cos(a) * d, z: cz + Math.sin(a) * d, r: 8 + az() * 14, h: 30 + az() * (a > 0 ? 140 : 60) });
    }
    const caja = new T.BoxGeometry(1, 1, 1); caja.translate(0, 0.5, 0);
    const im = new T.InstancedMesh(caja, new T.MeshBasicMaterial({ fog: false }), torres.length);
    torres.forEach((e, i) => { m4.compose(new T.Vector3(e.x, -2, e.z), q, new T.Vector3(e.r, e.h, e.r)); im.setMatrixAt(i, m4); im.setColorAt(i, col.set(i % 4 ? 0x241238 : 0x2e1748)); });
    escena.add(im);
  }

  // el cielo va con la cámara: nunca se llega al borde
  function sigue(camara) { if (cielo) cielo.position.copy(camara.position); }
  return { montar, sigue };
})();
