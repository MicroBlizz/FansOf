// Fans Of Pets · adaptador · MANIQUÍ 3D: los OBJETOS de las poses (bol, cuchara y la cesta redonda con el estampado de cada criatura,
// con su zeta al dormir). No se proyectan: son formas de three.js con su color, sombreado de dibujo y contorno. Los monta maniqui3d.js
// cuando ya tiene three.js cargado (se lo pasa) y los coloca en cada fotograma.
'use strict';
PT.maniqui3dObjetos = (() => {
  // los estampados de la cesta: el motivo pintado en un lienzo que se repite por la pared
  const MOTIVOS = {
    zanahorias: { fondo: '#fff3d6', pinta(x, a, b) { x.fillStyle = '#ff9a3c'; x.beginPath(); x.moveTo(a - 9, b - 6); x.lineTo(a + 9, b - 6); x.lineTo(a, b + 16); x.fill();
      x.fillStyle = '#5cb85c'; x.fillRect(a - 5, b - 14, 4, 8); x.fillRect(a + 1, b - 14, 4, 8); } },
    sushi: { fondo: '#c9a679', pinta(x, a, b) { for (const [r, c] of [[15, '#2b2b2b'], [11, '#ffffff'], [5, '#ff7f50']]) { x.fillStyle = c; x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); } } },
  };
  function estampado(T, nombre) {
    const m = MOTIVOS[nombre] || MOTIVOS.zanahorias, c = document.createElement('canvas'); c.width = 1024; c.height = 256;
    const x = c.getContext('2d'); x.fillStyle = m.fondo; x.fillRect(0, 0, 1024, 256); x.save(); x.scale(2.2, 2.2);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) m.pinta(x, i * 58 + (j % 2) * 29 + 14, 30 + j * 56);
    x.restore();
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2, 1); return t;
  }
  function zeta(T) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.font = 'bold 110px sans-serif'; x.textAlign = 'center'; x.lineWidth = 14; x.strokeStyle = '#3a2228'; x.strokeText('z', 64, 100); x.fillStyle = '#fff'; x.fillText('z', 64, 100);
    const s = new T.Mesh(new T.PlaneGeometry(0.1, 0.1), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false })); return s;
  }
  // monta los objetos de una criatura. cosa(geo, color, padre, pos, opc) la da maniqui3d.js (malla con su sombreado y su contorno)
  function crea(T, cosa, nombreEstampado) {
    const bola = (rx, ry, rz) => new T.SphereGeometry(1, 40, 24).scale(rx, ry, rz);
    const bol = new T.Group();
    cosa(new T.SphereGeometry(0.11, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), 0xffb74a, bol, [0, 0, 0], { doble: true });
    cosa(new T.CircleGeometry(0.1, 32).rotateX(-Math.PI / 2), 0xfff0c8, bol, [0, -0.012, 0], { borde: false });
    bol.rotation.x = 0.35;   // un poco hacia la cámara, para que se vea la comida
    const cuchara = new T.Group();
    cosa(new T.CylinderGeometry(0.012, 0.012, 0.15, 8).translate(0, -0.075, 0), 0xc9ced8, cuchara, [0, 0, 0], { grosor: 0.007 });
    cosa(bola(0.038, 0.045, 0.022), 0xdfe4ec, cuchara, [0, -0.17, 0], { grosor: 0.007 });
    const cesta = new T.Group(), tela = estampado(T, nombreEstampado);
    cosa(new T.CylinderGeometry(0.56, 0.53, 0.26, 64, 1, true), 0, cesta, [0, 0.13, 0], { map: tela, grosor: 0.016, doble: true });
    cosa(new T.TorusGeometry(0.56, 0.05, 16, 64).rotateX(Math.PI / 2), 0, cesta, [0, 0.265, 0], { map: tela, grosor: 0.014 });
    cosa(bola(0.52, 0.09, 0.48), 0xfff9ef, cesta, [0, 0.2, 0], { borde: false });
    cesta.rotation.x = 0.42; cesta.position.set(0, 0.13, 0.05);   // inclinada hacia la cámara: se ve el hueco, como en el dibujo
    return { bol, cuchara, cesta, zeta: zeta(T) };
  }
  // pone en la escena los objetos de la pose. boca: dónde está la boca en el mundo; mano: dónde está la mano del brazo 1
  function coloca(T, o, escena, pose, boca, mano) {
    for (const k of ['bol', 'cuchara', 'cesta', 'zeta']) escena.remove(o[k]);
    const hay = n => pose.objetos.includes(n);
    if (hay('cesta')) { escena.add(o.cesta, o.zeta); o.zeta.position.set(0.18 + 0.08 * pose.f, 0.95 + 0.15 * pose.f, 0.5); o.zeta.material.opacity = 1 - pose.f; }
    if (hay('bol')) { escena.add(o.bol); o.bol.position.set(-0.04, 0.3, 0.32); }
    if (hay('cuchara')) {   // la pala va del bol a la boca; el mango, hacia el puño
      escena.add(o.cuchara);
      const pala = o.bol.position.clone().add(new T.Vector3(0.02, 0.03, 0)).lerp(boca, pose.f), d = pala.clone().sub(mano).normalize();
      o.cuchara.quaternion.setFromUnitVectors(new T.Vector3(0, -1, 0), d); o.cuchara.position.copy(pala).addScaledVector(d, -0.17);
    }
  }
  return { crea, coloca, estampados: () => Object.keys(MOTIVOS) };
})();
