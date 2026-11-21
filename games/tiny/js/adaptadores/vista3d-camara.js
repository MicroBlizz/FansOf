// Tiny Fans · adaptador · VISTA 3D · CÁMARA: la cámara ortográfica anclada a la rejilla de píxeles, sus encuadres, el seguimiento suave
// y las cuentas de mundo a pantalla y de pantalla a mundo. Lo usa vista3d.js: TN.vistaCamara.crea(reglasVista, lejos).
'use strict';
TN.vistaCamara = {
  crea(reglas, lejos) {
    const T = THREE, cam = new T.OrthographicCamera(-1, 1, 1, -1, .1, lejos);
    const dir = new T.Vector3(), R = new T.Vector3(), U = new T.Vector3(), F = new T.Vector3(), sigue = new T.Vector3(), meta = new T.Vector3(), ideal = new T.Vector3();
    let nombre = '', anterior = '', vuelveEn = 0, alto = 20, altoMeta = 20, az = 0, el = 0, azMeta = 0, elMeta = 0, porCss = 1;
    function orienta() {
      dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
      cam.position.copy(dir).multiplyScalar(100); cam.lookAt(0, 0, 0); cam.updateMatrixWorld();
      R.set(1, 0, 0).applyQuaternion(cam.quaternion); U.set(0, 1, 0).applyQuaternion(cam.quaternion); F.set(0, 0, -1).applyQuaternion(cam.quaternion);
    }
    const yo = {
      camara: cam,
      get encuadreActual() { return nombre; },
      // cambia de encuadre; con segundos, vuelve solo al anterior. salto: sin transición
      encuadre(n, segundos, salto) {
        const e = reglas.encuadres[n]; if (!e) return;
        if (segundos) { anterior = nombre || n; vuelveEn = segundos; } else vuelveEn = 0;
        nombre = n; altoMeta = e.alto; azMeta = e.az; elMeta = e.el;
        if (salto || !alto) { alto = altoMeta; az = azMeta; el = elMeta; }
        orienta();
      },
      sigue(x, z, salto) { meta.set(x, .6, z); if (salto) sigue.copy(meta); },
      // avanza y coloca la cámara. ancho y alto: los de la textura pequeña; escala y dpr, para pasar a píxeles de CSS. Devuelve el resto { x, y }
      paso(dt, anchoTx, altoTx, escala, dpr) {
        if (vuelveEn > 0 && (vuelveEn -= dt) <= 0) yo.encuadre(anterior);
        const k = 1 - Math.exp(-reglas.sigue * dt), k2 = 1 - Math.exp(-4 * dt);
        sigue.lerp(meta, k); alto += (altoMeta - alto) * k2; az += (azMeta - az) * k2; el += (elMeta - el) * k2; orienta();
        const asp = anchoTx / altoTx, px = alto / altoTx;
        porCss = px / escala * dpr;
        cam.top = alto / 2; cam.bottom = -alto / 2; cam.left = -alto * asp / 2; cam.right = alto * asp / 2; cam.updateProjectionMatrix();
        ideal.copy(sigue).addScaledVector(dir, 100);
        const x = ideal.dot(R), y = ideal.dot(U), z = ideal.dot(F), sx = Math.round(x / px) * px, sy = Math.round(y / px) * px;
        cam.position.set(0, 0, 0).addScaledVector(R, sx).addScaledVector(U, sy).addScaledVector(F, z);
        return { x: (x - sx) / px, y: (y - sy) / px };
      },
      // un punto del mundo en píxeles de CSS (ancho y alto de la caja en CSS)
      aPantalla(x, y, z, ancho, altoCss) {
        const dx = (x - sigue.x) * R.x + (y - sigue.y) * R.y + (z - sigue.z) * R.z, dy = (x - sigue.x) * U.x + (y - sigue.y) * U.y + (z - sigue.z) * U.z;
        const px = ancho / 2 + dx / porCss, py = altoCss / 2 - dy / porCss;
        return { x: px, y: py, visible: px >= 0 && px <= ancho && py >= 0 && py <= altoCss };
      },
      // un toque en el punto del suelo (y = 0) que señala
      deToque(px, py, ancho, altoCss) {
        const ox = (px - ancho / 2) * porCss, oy = (altoCss / 2 - py) * porCss;
        const o = new T.Vector3().copy(sigue).addScaledVector(dir, 100).addScaledVector(R, ox).addScaledVector(U, oy), t = F.y ? -o.y / F.y : 0;
        return { x: o.x + F.x * t, z: o.z + F.z * t };
      },
      // un vector de pantalla (y hacia arriba) en dirección del suelo, del mismo largo
      aSuelo(vx, vy) {
        const rl = Math.hypot(R.x, R.z) || 1, ul = Math.hypot(U.x, U.z) || 1;
        return { x: vx * R.x / rl + vy * U.x / ul, z: vx * R.z / rl + vy * U.z / ul };
      },
      // cuántas unidades del mundo mide un píxel de CSS (para los marcadores que flotan)
      get porCss() { return porCss; },
      get centro() { return { x: sigue.x, z: sigue.z }; },
    };
    return yo;
  },
};
