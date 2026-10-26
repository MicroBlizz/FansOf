// Fans of Boom · HABILIDADES (dibujo): las formas nuevas (gato gordo, bomba de humo, obús, bomba de la raid, avión), el rayo que barre
// el suelo, el muro de gato que se queda en el terreno y lo que espera al siguiente turno (el humo de la raid, el gatito pegado). Solo dibujo.
'use strict';
const TERRENO_DIBUJOS = {
  gato(c, x, y, rx, ry) {   // el Gato gordo tumbado, convertido en suelo: naranja con rayas, cara de sueño y la cola
    c.lineWidth = 5; c.strokeStyle = OL; c.lineJoin = 'round';
    c.fillStyle = '#ffb347'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.2832); c.fill(); c.stroke();
    c.save(); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.2832); c.clip();
    c.fillStyle = '#e8862a'; for (let i = -3; i <= 3; i++) c.fillRect(x + i * rx * 0.26 - 6, y - ry, 12, ry * 0.9);
    c.fillStyle = '#ffe0b0'; c.beginPath(); c.ellipse(x, y + ry * 0.7, rx * 0.7, ry * 0.45, 0, 0, 6.2832); c.fill();
    c.restore();
    for (const s of [-1, 1]) { c.fillStyle = '#ffb347'; c.beginPath(); c.moveTo(x + rx * 0.55 + s * 16, y - ry * 0.75); c.lineTo(x + rx * 0.55 + s * 22, y - ry * 1.25); c.lineTo(x + rx * 0.55 + s * 4, y - ry * 0.9); c.fill(); c.stroke(); }
    c.lineWidth = 3; c.beginPath(); c.arc(x + rx * 0.45, y - ry * 0.35, 6, 0.2, 2.9); c.moveTo(x + rx * 0.75 + 6, y - ry * 0.35); c.arc(x + rx * 0.75, y - ry * 0.35, 6, 0.2, 2.9); c.stroke();   // ojos cerrados
    c.fillStyle = '#ff8fb8'; c.beginPath(); c.arc(x + rx * 0.6, y - ry * 0.1, 3.5, 0, 6.2832); c.fill();
    c.lineWidth = 5; c.strokeStyle = OL; c.beginPath(); c.moveTo(x - rx * 0.95, y + ry * 0.2); c.quadraticCurveTo(x - rx * 1.3, y - ry * 0.6, x - rx * 1.05, y - ry); c.stroke();
    c.lineWidth = 3; c.strokeStyle = '#ffb347'; c.stroke();
  },
};
Object.assign(PROYECTIL_FORMAS, {
  gatogordo(c, x, y, a, t) {   // un gato enorme hecho bola que cae como un saco
    c.save(); c.translate(x, y); c.rotate(t * 3); c.lineWidth = 3; c.strokeStyle = OL;
    c.fillStyle = '#ffb347'; c.beginPath(); c.arc(0, 0, 16, 0, 6.2832); c.fill(); c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -14); c.lineTo(s * 12, -24); c.lineTo(s * 15, -9); c.fill(); c.stroke(); }
    c.fillStyle = OL; c.fillRect(-7, -4, 4, 4); c.fillRect(3, -4, 4, 4); c.fillStyle = '#e8862a'; c.fillRect(-12, 4, 24, 3);
    c.restore();
  },
  humo(c, x, y, a, t) {   // la bomba de humo morado de la raid, con su mecha
    c.save(); c.translate(x, y); c.rotate(t * 6); c.lineWidth = 3; c.strokeStyle = OL;
    c.fillStyle = '#7a3ad8'; c.beginPath(); c.arc(0, 0, 9, 0, 6.2832); c.fill(); c.stroke(); c.fillStyle = '#ff4bd8'; c.fillRect(-9, -2, 18, 4);
    c.restore(); c.fillStyle = 'rgba(200,170,255,.6)'; c.beginPath(); c.arc(x - 10, y - 6, 5, 0, 6.2832); c.fill();
  },
  obus(c, x, y, a) {   // obús de atrezo, con su estrella de cine
    c.save(); c.translate(x, y); c.rotate(a); c.lineWidth = 3; c.strokeStyle = OL;
    c.fillStyle = '#5b5f66'; c.beginPath(); c.moveTo(-12, -6); c.lineTo(6, -6); c.quadraticCurveTo(16, 0, 6, 6); c.lineTo(-12, 6); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ffcb3d'; c.fillRect(-12, -6, 5, 12); c.restore();
  },
  bomba(c, x, y, a, t) {   // la bomba de la raid, con aletas y un corazón de suscripción
    c.save(); c.translate(x, y); c.rotate(Math.PI / 2 + Math.sin(t * 8) * 0.15); c.lineWidth = 3; c.strokeStyle = OL;
    c.fillStyle = '#3a3a44'; c.beginPath(); c.ellipse(0, 0, 6, 11, 0, 0, 6.2832); c.fill(); c.stroke();
    c.fillStyle = '#ff4bd8'; c.beginPath(); c.moveTo(-6, -10); c.lineTo(6, -10); c.lineTo(0, -16); c.fill(); c.stroke(); c.restore();
  },
});
const HAB_PINTA = (() => {
  const T = 6.2832;
  function avion(c, x, y, d, t) {   // el avión de la raid: morado, con la pantalla de directo en el costado
    c.save(); c.translate(x, y); c.scale(d, 1); c.lineWidth = 3; c.strokeStyle = OL; c.lineJoin = 'round';
    c.fillStyle = '#7a3ad8'; c.beginPath(); c.ellipse(0, 0, 46, 12, 0, 0, T); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-6, 0); c.lineTo(-20, 26); c.lineTo(4, 4); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-38, -4); c.lineTo(-50, -22); c.lineTo(-30, -6); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#bfe8ff'; c.fillRect(22, -7, 14, 7); c.strokeRect(22, -7, 14, 7);
    c.fillStyle = Math.sin(t * 10) > 0 ? '#ff4b5c' : '#fff'; c.beginPath(); c.arc(-8, -2, 3, 0, T); c.fill();
    c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(48, 0, 4 + Math.sin(t * 40) * 2, 0, T); c.fill();   // la hélice
    c.restore();
  }
  // lo que no es un proyectil normal; devuelve true si lo ha dibujado
  function proy(c, p, CAM, t) {
    if (p.demora > 0 && p.tipo !== 'barrido') return p.tipo === 'avion' || p.tipo === 'empuje';
    const x = p.x - CAM.x, y = p.y - CAM.y;
    if (p.tipo === 'barrido') {   // la columna del satélite, que se arrastra por el suelo
      const k = p.demora > 0 ? 1 - p.demora / 0.3 : 1; GOLPE_FORMAS.rayo(c, x, 0, y, k);
      c.fillStyle = 'rgba(124,240,255,.5)'; c.beginPath(); c.ellipse(x, y, 30, 8, 0, 0, T); c.fill(); return true;
    }
    if (p.tipo === 'avion') { avion(c, x, y, p.dir, t); return true; }
    if (p.tipo === 'empuje') return true;
    if (p.tipo === 'pegado') { if (Math.sin(t * 30) > 0) PROYECTIL_FORMAS.gatito(c, x, y, 0, t); return true; }
    return false;
  }
  // lo que espera al siguiente turno de su dueño: el humo morado de la raid y el gatito pegado, con su cuenta atrás
  function pendientes(c, P, CAM, t) {
    for (const n of P.pendientes || []) {
      const d = HABILIDADES.donde(P, n), x = d.x - CAM.x, y = d.y - CAM.y; if (x < -80 || x > PINTAR.V.w + 80) continue;
      if (n.tipo === 'raid') {
        for (let i = 0; i < 5; i++) { const k = (t * 0.5 + i / 5) % 1; c.fillStyle = `rgba(170,110,255,${0.5 * (1 - k)})`; c.beginPath(); c.arc(x + Math.sin(t * 2 + i) * 10, y - 10 - k * 120, 12 + k * 26, 0, T); c.fill(); }
        PINTAR_TXT(c, tr('RAID'), x, y - 150, 16, '#e9a6ff');
      } else if (n.tipo === 'pega') {
        PROYECTIL_FORMAS.gatito(c, x, y, 0, t);
        c.fillStyle = Math.sin(t * 6) > 0 ? '#ff4b5c' : '#ffcb3d'; c.beginPath(); c.arc(x + 8, y - 12, 3.5, 0, T); c.fill();
      }
    }
  }
  return { proy, pendientes };
})();
