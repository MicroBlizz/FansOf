// Fans of Rouflage · LA CÁMARA DEL SEÑUELO: con la herramienta señuelo la cámara enfoca de entrada la zona a la que llega el brazo, y se puede
// hacer zoom (rueda del ratón o pellizco) y mover la cámara (dos dedos, o botón derecho/central del ratón) sin que se mueva el personaje.
// La cámara no sale de la zona del señuelo. Con un solo dedo o el botón izquierdo se sigue pintando.
'use strict';

const SENCAM = { toques: new Map(), gesto: false, pan: null, z0: 0.45, zMax: 3 };
const senCamActiva = () => TALLER.abierto && TALLER.herr === 'senuelo' && !!J.yo && !!TALLER.libre;

// pone la cámara del taller dentro de los límites: el punto del mundo que queda en el centro del hueco libre no sale del alcance del brazo
function senCamPon(x, y, z) {
  const yo = J.yo, [sx, sy, lw, lh] = TALLER.libre; z = limita(z, SENCAM.z0, SENCAM.zMax);
  let fx = x + (sx - VW / 2) / z, fy = y + (sy - VH / 2) / z;
  const cx = yo.x, cy = yo.y - 20, r = SEN.alcance + 8, hw = lw / z / 2, hh = lh / z / 2;      // lo que se ve no sale del cuadrado del área del señuelo
  fx = hw >= r ? cx : limita(fx, cx - r + hw, cx + r - hw); fy = hh >= r ? cy : limita(fy, cy - r + hh, cy + r - hh);
  TALLER.cam = [fx - (sx - VW / 2) / z, fy - (sy - VH / 2) / z, z];
}
// zoom alrededor de un punto de la pantalla
function senCamZoom(px, py, factor) {
  const [x, y, z] = TALLER.cam, wx = x + (px - VW / 2) / z, wy = y + (py - VH / 2) / z, z2 = limita(z * factor, SENCAM.z0, SENCAM.zMax);
  senCamPon(wx - (px - VW / 2) / z2, wy - (py - VH / 2) / z2, z2);
}
function senCamPan(dx, dy) { const [x, y, z] = TALLER.cam; senCamPon(x - dx / z, y - dy / z, z); }

// devuelve true si el gesto es de la cámara y el taller no debe pintar con él
function senCamPuntero(ev, tipo) {
  if (!senCamActiva()) { SENCAM.toques.clear(); SENCAM.gesto = false; SENCAM.pan = null; return false; }
  const id = ev.pointerId, p = [ev.clientX, ev.clientY];
  if (tipo === 'abajo') {
    if (ev.pointerType === 'mouse' && ev.button !== 0) { SENCAM.pan = { id, x: p[0], y: p[1] }; return true; }
    SENCAM.toques.set(id, p);
    if (SENCAM.toques.size >= 2) { SEN.pinta = null; senueloFlush(); SENCAM.gesto = true; return true; }
    return false;
  }
  if (tipo === 'mueve') {
    if (SENCAM.pan && SENCAM.pan.id === id) { senCamPan(p[0] - SENCAM.pan.x, p[1] - SENCAM.pan.y); SENCAM.pan.x = p[0]; SENCAM.pan.y = p[1]; return true; }
    const antes = SENCAM.toques.get(id); if (!antes) return SENCAM.gesto;
    if (SENCAM.toques.size >= 2) {
      const [a, b] = Array.from(SENCAM.toques.values()), d0 = Math.hypot(a[0] - b[0], a[1] - b[1]), c0 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      SENCAM.toques.set(id, p);
      const [a1, b1] = Array.from(SENCAM.toques.values()), d1 = Math.hypot(a1[0] - b1[0], a1[1] - b1[1]), c1 = [(a1[0] + b1[0]) / 2, (a1[1] + b1[1]) / 2];
      senCamPan(c1[0] - c0[0], c1[1] - c0[1]); if (d0 > 8) senCamZoom(c1[0], c1[1], d1 / d0);
      return true;
    }
    SENCAM.toques.set(id, p); return SENCAM.gesto;
  }
  // arriba
  if (SENCAM.pan && SENCAM.pan.id === id) { SENCAM.pan = null; return true; }
  const estaba = SENCAM.toques.delete(id), gesto = SENCAM.gesto;
  if (!SENCAM.toques.size) SENCAM.gesto = false;
  return estaba && gesto;
}
// si la rueda está sobre el panel y el panel se desplaza (pantalla pequeña), se deja desplazar
function senCamPanelScroll(t) { const p = document.getElementById('taller'); return !!(p && t && p.contains(t) && p.scrollHeight > p.clientHeight + 2); }
// en el documento entero (no solo en el lienzo) para que la rueda funcione también sobre el HUD; el panel de herramientas sigue pudiendo desplazarse
document.addEventListener('wheel', ev => { if (!senCamActiva() || senCamPanelScroll(ev.target)) return; ev.preventDefault(); senCamZoom(ev.clientX, ev.clientY, Math.exp(-ev.deltaY * (ev.deltaMode === 1 ? 33 : 1) * 0.0015)); }, { passive: false });
cv.addEventListener('contextmenu', ev => { if (TALLER.abierto) ev.preventDefault(); });
