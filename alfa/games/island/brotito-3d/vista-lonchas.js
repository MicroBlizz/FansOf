// Fans of Island · prototipo Brotito 3D, lonchas con cámara libre (solo para el visor de comparar): el Brotito en lonchas del juego
// (IS.arte.PILAS_B, o IS.arte.pilaBrotito para las posturas intermedias al suavizar) dibujado con la misma cámara que los dos 3D:
// el giro de la cámara se suma al del Brotito y su altura cambia cuánto se aplasta cada loncha (K = seno de la altura, como en el juego).
// IS.VistaLonchas.crea(lienzo) → { pinta(proto, camara, opciones, dt) }; camara = { yaw, elev }; opciones = { suave, contorno }.
'use strict';
{
  const { K, contorno } = IS.Lonchas;
  const ELEV_JUEGO = Math.asin(K), LADO = 64, CIELO = '#7fd3ff', HIERBA = '#6cc24a';
  const pasos = new Map();   // pilas de las posturas intermedias (redondeadas a centésimas), para no rehacerlas

  function pilaDe(pose) {   // con el suavizado, la postura de cada momento; si es una de las seis, la del juego tal cual
    for (const n in IS.arte.BROTO_POSTURAS) {
      const q = IS.arte.BROTO_POSTURAS[n];
      if (Math.abs(q.sx - pose.sx) + Math.abs(q.sz - pose.sz) + Math.abs(q.a - pose.a) < 0.015) return IS.arte.PILAS_B[n];
    }
    const r = { sx: Math.round(pose.sx * 100) / 100, sz: Math.round(pose.sz * 100) / 100, a: Math.round(pose.a * 100) / 100 };
    const clave = `${r.sx}|${r.sz}|${r.a}`;
    if (!pasos.has(clave)) { if (pasos.size > 300) pasos.clear(); pasos.set(clave, IS.arte.pilaBrotito(r)); }
    return pasos.get(clave);
  }

  // como IS.Lonchas.girada, pero con la altura de la cámara (k y el alto de cada loncha) y el contorno opcional; sin caché: es pequeño
  function apila(p, ang, k, alto, borde) {
    const R = Math.ceil(Math.hypot(p.an, p.fo) / 2) + 2;
    const c = document.createElement('canvas');
    c.width = 2 * R + 2; c.height = Math.ceil(2 * R * k + p.al * alto) + 4;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    const suelo = c.height - Math.ceil(R * k) - 2;
    p.hojas.forEach((h, i) => {
      g.save(); g.translate(c.width / 2, suelo - Math.round(i * alto)); g.scale(1, k); g.rotate(ang);
      g.drawImage(h, -p.an / 2, -p.fo / 2); g.restore();
    });
    if (borde) contorno(c);
    return { c, suelo };
  }

  function fondo(g, y, k) {   // cielo y la hierba de la isla desde la altura de la cámara
    g.fillStyle = CIELO; g.fillRect(0, 0, LADO, LADO);
    const horizonte = Math.round(y - 40 * k - 6);
    g.fillStyle = HIERBA; g.fillRect(0, horizonte, LADO, LADO - horizonte);
  }

  function crea(lienzo) {
    lienzo.width = LADO; lienzo.height = LADO;
    const g = lienzo.getContext('2d');
    let pose = null, camY = null;
    function pinta(proto, camara, opciones, dt) {
      const e = proto.estado.e, objetivo = IS.arte.BROTO_POSTURAS[proto.postura()];
      pose = IS.Brotito3D.sigue(pose || objetivo, objetivo, dt, opciones.suave ? 28 : 0);
      const k = Math.max(0.02, Math.sin(camara.elev)), alto = Math.cos(camara.elev) / Math.cos(ELEV_JUEGO);
      const sueloZ = proto.estado.fis.sueloDe({ x: e.x, z: e.z + 0.5 }, 4);
      const base = sueloZ > -Infinity ? sueloZ : e.z;
      camY = camY === null ? e.z : camY + (e.z - camY) * (1 - Math.exp(-6 * dt));   // como la cámara 3D de cerca: sigue al saltar, con retraso
      const yPies = Math.round(LADO * 0.72 + (camY - e.z) * alto), ySuelo = Math.round(LADO * 0.72 + (camY - base) * alto);
      g.imageSmoothingEnabled = false;
      fondo(g, ySuelo, k);
      if (!proto.visible()) return;
      const r = Math.round(13 * Math.max(0.45, 1 - (e.z - base) / 140));
      g.fillStyle = 'rgba(30,20,50,0.28)';
      g.beginPath(); g.ellipse(LADO / 2, ySuelo, r, Math.max(1, r * k), 0, 0, Math.PI * 2); g.fill();
      const s = apila(pilaDe(pose), e.giro + camara.yaw, k, alto, opciones.contorno);
      g.drawImage(s.c, Math.round(LADO / 2 - s.c.width / 2), yPies - s.suelo);
    }
    return { pinta };
  }
  IS.VistaLonchas = Object.freeze({ crea, ELEV_JUEGO });
}
