// Fans of Island · prototipo Brotito 3D, lonchas con cámara libre (solo para el visor de comparar): el Brotito en lonchas del juego
// (IS.arte.PILAS_B, o IS.arte.pilaBrotito para las posturas intermedias al suavizar) dibujado con la misma cámara que los dos 3D:
// el giro de la cámara se suma al del Brotito y su altura cambia cuánto se aplasta cada loncha (K = seno de la altura, como en el juego).
// Con `escala` mayor que 1 es la versión en alta resolución: las mismas fórmulas del dibujo pintadas con más píxeles (las seis posturas,
// que se fabrican poco a poco al abrir; sin posturas intermedias, que tardarían demasiado).
// IS.VistaLonchas.cortadas(png, json, giro) da las lonchas que Yoshi corta de un modelo 3D (lonchas.png, una fila por postura, y su lonchas.json),
// para pasarlas a crea como `pilas`: sin posturas intermedias, cada postura del juego usa la suya. `giro` (radianes) las pone mirando
// hacia donde mira el Brotito del juego (+x), porque el modelo no tiene por qué mirar allí.
// IS.VistaLonchas.crea(lienzo, escala = 1, pilas) → { pinta(proto, camara, opciones, dt), lista() }; camara = { yaw, elev }; opciones = { suave, contorno }.
'use strict';
{
  const { K, contorno } = IS.Lonchas;
  const ELEV_JUEGO = Math.asin(K), LADO = 64, CIELO = '#7fd3ff', HIERBA = '#6cc24a';
  const cerca = (p, q) => Math.abs(q.sx - p.sx) + Math.abs(q.sz - p.sz) + Math.abs(q.a - p.a);

  function pilasJuego() {   // tamaño del juego: las seis del juego y, al suavizar, la de cada postura intermedia (redondeada a centésimas)
    const pasos = new Map();
    return pose => {
      for (const n in IS.arte.BROTO_POSTURAS) if (cerca(pose, IS.arte.BROTO_POSTURAS[n]) < 0.015) return IS.arte.PILAS_B[n];
      const r = { sx: Math.round(pose.sx * 100) / 100, sz: Math.round(pose.sz * 100) / 100, a: Math.round(pose.a * 100) / 100 };
      const clave = `${r.sx}|${r.sz}|${r.a}`;
      if (!pasos.has(clave)) { if (pasos.size > 300) pasos.clear(); pasos.set(clave, IS.arte.pilaBrotito(r)); }
      return pasos.get(clave);
    };
  }
  function pilasGrandes(escala) {   // alta resolución: las seis posturas, una por turno para no parar la página; da la más parecida ya hecha
    const hechas = {}, faltan = Object.keys(IS.arte.BROTO_POSTURAS);
    const sigue = () => { const n = faltan.shift(); if (!n) return; hechas[n] = IS.arte.pilaBrotito(IS.arte.BROTO_POSTURAS[n], IS.arte.EB * escala); setTimeout(sigue, 30); };
    setTimeout(sigue, 30);
    const de = pose => {
      let mejor = null, d = Infinity;
      for (const n in hechas) { const x = cerca(pose, IS.arte.BROTO_POSTURAS[n]); if (x < d) { d = x; mejor = hechas[n]; } }
      return mejor;
    };
    de.lista = () => !faltan.length;
    return de;
  }

  function cortadas(png, json, giro = 0) {   // las de Yoshi: en cada fila de png, las lonchas de la del suelo a la de arriba, de ancho x fondo
    const pilas = {};
    const de = pose => {
      let mejor = null, d = Infinity;
      for (const n in IS.arte.BROTO_POSTURAS) { const x = cerca(pose, IS.arte.BROTO_POSTURAS[n]); if (pilas[n] && x < d) { d = x; mejor = pilas[n]; } }
      return mejor;
    };
    de.cargadas = Promise.all([fetch(json).then(r => { if (!r.ok) throw new Error(json + ' ' + r.status); return r.json(); }),
      new Promise((ok, mal) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => mal(new Error('no se pudo leer ' + png)); im.src = png; })])
      .then(([meta, im]) => meta.posturas.forEach((nombre, fila) => {
        const hojas = [];
        for (let i = 0; i < meta.lonchas; i++) {
          const h = document.createElement('canvas'); h.width = meta.ancho; h.height = meta.fondo;
          h.getContext('2d').drawImage(im, i * meta.ancho, fila * meta.fondo, meta.ancho, meta.fondo, 0, 0, meta.ancho, meta.fondo);
          hojas.push(h);
        }
        pilas[nombre.replace(/-\d+$/, '')] = { hojas, an: meta.ancho, fo: meta.fondo, al: meta.lonchas, giro };
      }));
    de.lista = () => Object.keys(pilas).length > 0;
    return de;
  }

  // como IS.Lonchas.girada, pero con la altura de la cámara (k y el alto de cada loncha) y el contorno opcional (de `borde` píxeles)
  function apila(p, ang, k, alto, borde) {
    const R = Math.ceil(Math.hypot(p.an, p.fo) / 2) + 2 + borde;
    const c = document.createElement('canvas');
    c.width = 2 * R + 2; c.height = Math.ceil(2 * R * k + p.al * alto) + 4 + 2 * borde;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    const suelo = c.height - Math.ceil(R * k) - 2 - borde;
    p.hojas.forEach((h, i) => {
      g.save(); g.translate(c.width / 2, suelo - Math.round(i * alto)); g.scale(1, k); g.rotate(ang);
      g.drawImage(h, -p.an / 2, -p.fo / 2); g.restore();
    });
    for (let i = 0; i < borde; i++) contorno(c);
    return { c, suelo };
  }

  function crea(lienzo, escala = 1, pilas = null) {
    const E = escala, L = LADO * E;
    lienzo.width = L; lienzo.height = L;
    const g = lienzo.getContext('2d'), pilaDe = pilas || (E > 1 ? pilasGrandes(E) : pilasJuego());
    let pose = null, camY = null, ultima = { clave: '', s: null };
    function apilada(p, ang, k, alto, borde) {   // la misma imagen mientras no cambien la pila ni la cámara
      const clave = [ang.toFixed(3), k.toFixed(3), borde].join('|');
      if (ultima.p !== p || ultima.clave !== clave) ultima = { p, clave, s: apila(p, ang, k, alto, borde) };
      return ultima.s;
    }
    function pinta(proto, camara, opciones, dt) {
      const e = proto.estado.e, objetivo = IS.arte.BROTO_POSTURAS[proto.postura()];
      pose = IS.Brotito3D.sigue(pose || objetivo, objetivo, dt, opciones.suave ? 28 : 0);
      const k = Math.max(0.02, Math.sin(camara.elev)), alto = Math.cos(camara.elev) / Math.cos(ELEV_JUEGO);
      const sueloZ = proto.estado.fis.sueloDe({ x: e.x, z: e.z + 0.5 }, 4);
      const base = sueloZ > -Infinity ? sueloZ : e.z;
      camY = camY === null ? e.z : camY + (e.z - camY) * (1 - Math.exp(-6 * dt));   // como la cámara 3D de cerca: sigue al saltar, con retraso
      const yPies = Math.round(L * 0.72 + (camY - e.z) * alto * E), ySuelo = Math.round(L * 0.72 + (camY - base) * alto * E);
      g.imageSmoothingEnabled = false;
      g.fillStyle = CIELO; g.fillRect(0, 0, L, L);
      const horizonte = Math.round(ySuelo - (40 * k + 6) * E);
      g.fillStyle = HIERBA; g.fillRect(0, horizonte, L, L - horizonte);
      const p = pilaDe(pose);
      if (!proto.visible() || !p) return;
      const r = Math.round(13 * E * Math.max(0.45, 1 - (e.z - base) / 140));
      g.fillStyle = 'rgba(30,20,50,0.28)';
      g.beginPath(); g.ellipse(L / 2, ySuelo, r, Math.max(1, r * k), 0, 0, Math.PI * 2); g.fill();
      const s = apilada(p, e.giro + camara.yaw + (p.giro || 0), k, alto, opciones.contorno ? Math.max(1, Math.round(E / 2)) : 0);
      g.drawImage(s.c, Math.round(L / 2 - s.c.width / 2), yPies - s.suelo);
    }
    return { pinta, lista: () => !pilaDe.lista || pilaDe.lista() };
  }
  IS.VistaLonchas = Object.freeze({ crea, cortadas, ELEV_JUEGO });
}
