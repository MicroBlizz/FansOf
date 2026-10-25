// Fans of Boom · PINTAR: el mundo (cielo, suelo, móviles, proyectil) y la cámara. El aspecto de la interfaz sobre el lienzo (viento, orden,
// minimapa) está en hud.js. Todo se dibuja en coordenadas lógicas: ancho fijo 960, alto según la pantalla.
'use strict';
function PINTAR_TXT(c, s, x, y, tam, col, alinea, fuente) {   // texto con contorno grueso, el estilo de la serie
  c.font = `800 ${tam}px ${fuente || '"Baloo 2", "Trebuchet MS", system-ui, sans-serif'}`; c.textAlign = alinea || 'center'; c.textBaseline = 'middle';
  c.lineJoin = 'round'; c.lineWidth = Math.max(3, tam / 5); c.strokeStyle = OL; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y);
}
const PINTAR = (() => {
  const C = BOOM.movil, WW = BOOM.mundo.ancho, WH = BOOM.mundo.alto;
  const V = { w: 960, h: 540 };   // lo que se ve del mundo, en píxeles lógicos
  const CAM = { x: 0, y: 0, ox: 0, oy: 0, libre: 0 };
  const NUBES = Array.from({ length: 9 }, (_, i) => ({ x: (i * 521) % 3400, y: 30 + (i * 97) % 240, r: 26 + (i * 13) % 26 }));

  function enfoca(x, y, ya) {   // a dónde mira la cámara (centrada en ese punto); ya = saltar sin deslizar
    CAM.ox = clamp(x - V.w / 2, 0, WW - V.w); CAM.oy = clamp(y - V.h / 2, 0, Math.max(0, WH - V.h));
    if (ya) { CAM.x = CAM.ox; CAM.y = CAM.oy; }
  }
  function sigue(P, dt) {
    if (CAM.libre > 0) CAM.libre -= dt;
    else if (P.fase === 'vuelo' && P.proys.some(p => !p.hecho)) { const p = P.proys.find(q => !q.hecho); enfoca(p.x, p.y - 40); }
    else if (P.actual && P.fase !== 'despues' && P.fase !== 'fin') enfoca(P.actual.x, P.actual.y - 100);
    const k = Math.min(1, dt * (P.fase === 'vuelo' ? 9 : 4.5));
    CAM.x += (CAM.ox - CAM.x) * k; CAM.y += (CAM.oy - CAM.y) * k;
  }
  function tamano(w, h) { V.w = w; V.h = h; enfoca(CAM.x + w / 2, CAM.y + h / 2, true); }

  function fondo(c, mapa) {
    const g = c.createLinearGradient(0, 0, 0, V.h); g.addColorStop(0, mapa.cielo[0]); g.addColorStop(1, mapa.cielo[1]);
    c.fillStyle = g; c.fillRect(0, 0, V.w, V.h);
    for (const [par, alfa, alt] of [[0.25, 0.16, 360], [0.5, 0.22, 300]]) {   // dos capas de colinas lejanas
      c.fillStyle = `rgba(255,255,255,${alfa})`; c.beginPath(); c.moveTo(0, V.h);
      for (let x = 0; x <= V.w; x += 16) c.lineTo(x, WH - alt - CAM.y * par * 0.5 + Math.sin((x + CAM.x * par) / 130) * 40 + Math.sin((x + CAM.x * par) / 47) * 14 - CAM.y * 0.0);
      c.lineTo(V.w, V.h); c.fill();
    }
    c.fillStyle = 'rgba(255,255,255,.8)';
    for (const n of NUBES) {
      const x = ((n.x - CAM.x * 0.3) % 3400 + 3400) % 3400 - 200, y = n.y - CAM.y * 0.3;
      c.beginPath(); c.arc(x, y, n.r, 0, 6.2832); c.arc(x + n.r * 1.1, y + 6, n.r * 0.8, 0, 6.2832); c.arc(x - n.r, y + 8, n.r * 0.7, 0, 6.2832); c.fill();
    }
  }
  function vacio(c) {   // por debajo del mapa no hay nada: un degradado morado que se traga lo que cae
    const y = WH - CAM.y; if (y >= V.h) return;
    const g = c.createLinearGradient(0, y, 0, y + 200); g.addColorStop(0, '#2b1446'); g.addColorStop(1, '#0d0618'); c.fillStyle = g; c.fillRect(0, y, V.w, V.h - y + 1);
  }

  function movil(c, m, P, t) {
    const sx = m.x - CAM.x, sy = m.y - CAM.y;
    if (sx < -80 || sx > V.w + 80 || sy < -120 || sy > V.h + 120) return;
    const E = BOOM.equipos[m.equipo], activo = P.actual === m && P.fase !== 'fin';
    const incl = m.cayendo ? 0 : MOVIL.inclinacion(m); m.rot = (m.rot || 0) + (clamp(incl, -0.9, 0.9) - (m.rot || 0)) * 0.25;
    c.save(); c.translate(sx, sy); c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, 1, 26, 5, 0, 0, 6.2832); c.fill();
    c.rotate(m.rot); c.scale(m.dir, 1); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = OL;
    VEHICULOS.dibuja(c, m, E, t);
    c.restore();
    // el cañón NO se inclina con la cuesta: el ángulo del tiro se mide siempre desde el horizonte, desde el mismo punto que usa la física (FISICA.boca)
    c.save(); c.translate(sx, sy - C.centro); c.scale(m.dir, 1); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = OL;
    c.save(); c.rotate(-m.ang * Math.PI / 180); c.fillStyle = '#5b4b6e'; c.beginPath(); rrPath(c, -2, -4, C.boca + 2, 8, 3); c.fill(); c.stroke(); c.restore();
    c.fillStyle = E.claro; c.beginPath(); c.arc(0, -1, 8, 0, 6.2832); c.fill(); c.stroke();
    c.restore();
    const ancho = 54, vida = clamp(m.vida / m.vidaMax, 0, 1), by = sy - 54 - (activo ? Math.sin(t * 6) * 2 : 0);
    c.fillStyle = OL; c.beginPath(); rrPath(c, sx - ancho / 2 - 2, by - 2, ancho + 4, 11, 5); c.fill();
    c.fillStyle = vida > 0.5 ? '#6fd04a' : vida > 0.25 ? '#ffcb3d' : '#ff4b5c'; c.beginPath(); rrPath(c, sx - ancho / 2, by, Math.max(2, ancho * vida), 7, 3.5); c.fill();
    c.fillStyle = OL; c.fillRect(sx - ancho / 2, by + 11, ancho, 5); c.fillStyle = m.caos >= BOOM.caos.max ? '#ff4bd8' : '#b86bff'; c.fillRect(sx - ancho / 2 + 1, by + 12, (ancho - 2) * m.caos / BOOM.caos.max, 3);
    PINTAR_TXT(c, m.nombre, sx, by - 12, 15, activo ? '#ffffff' : E.claro);
    if (activo && (P.fase === 'apunta' || P.fase === 'cartel')) {   // flecha que bota sobre quien tira
      const ay = by - 34 + Math.sin(t * 7) * 4; c.fillStyle = E.color; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); c.moveTo(sx, ay + 12); c.lineTo(sx - 9, ay); c.lineTo(sx + 9, ay); c.closePath(); c.fill(); c.stroke();
    }
  }
  function marca(c, P) {   // la marca gris de dónde cayó el tiro anterior de quien tira: para corregir con ángulo y potencia
    const m = P.actual; if (!m || !m.marca || P.fase === 'vuelo') return;
    const x = m.marca.x - CAM.x, y = m.marca.y - CAM.y; if (x < -20 || x > V.w + 20) return;
    c.strokeStyle = 'rgba(32,16,44,.6)'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 9, y - 9); c.lineTo(x + 9, y + 9); c.moveTo(x + 9, y - 9); c.lineTo(x - 9, y + 9); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2.5; c.stroke();
  }
  function guia(c, P) {   // una rayita corta hacia donde apunta el cañón, más larga con más potencia (no es la trayectoria)
    const m = P.actual; if (!m || P.fase !== 'apunta' || m.ia) return;
    const b = FISICA.boca(m), l = 14 + m.pot * 0.55;
    c.setLineDash([2, 7]); c.lineCap = 'round'; c.lineWidth = 5; c.strokeStyle = 'rgba(255,255,255,.85)';
    c.beginPath(); c.moveTo(b.x - CAM.x, b.y - CAM.y); c.lineTo(b.x - CAM.x + b.dx * l, b.y - CAM.y + b.dy * l); c.stroke(); c.setLineDash([]);
  }
  function proyectil(c, p) {
    PROYECTIL_FORMAS.estela(c, p, CAM.x, CAM.y);
    const x = p.x - CAM.x, y = p.y - CAM.y;
    if (y < -6) {   // fuera de pantalla por arriba: una flechita en el borde que dice dónde va
      c.fillStyle = '#fff'; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 8); c.lineTo(x - 9, 26); c.lineTo(x + 9, 26); c.closePath(); c.fill(); c.stroke();
      PINTAR_TXT(c, Math.round(-p.y) + ' m', x, 40, 15, '#fff'); return;
    }
    PROYECTIL_FORMAS[p.def.forma || 'bola'](c, x, y, Math.atan2(p.vy, p.vx), p.t);
  }

  function satelite(c, P, t) {   // el satélite compartido de los CyberMarine: arriba a la izquierda, con su carga; y un aro donde cayó el último dardo
    if (!P.sat || !P.moviles.some(m => m.vivo && m.def.tiros.some(q => q.satelite))) return;
    const x = 238, y = 100 + Math.sin(t * 2) * 3;
    c.save(); c.translate(x, y); c.rotate(-0.3); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = OL;
    c.fillStyle = '#58e0a0'; c.beginPath(); rrPath(c, -22, -5, 14, 10, 2); rrPath(c, 8, -5, 14, 10, 2); c.fill(); c.stroke();
    c.fillStyle = '#e8f4ff'; c.beginPath(); rrPath(c, -8, -8, 16, 16, 4); c.fill(); c.stroke(); c.restore();
    for (let i = 0; i < BOOM.satelite.max; i++) { c.fillStyle = i < P.sat.carga ? '#58e0a0' : 'rgba(32,16,44,.7)'; c.strokeStyle = OL; c.lineWidth = 2; c.beginPath(); c.arc(x - 14 + i * 14, y + 20, 5, 0, 6.2832); c.fill(); c.stroke(); }
    const o = P.sat.obj; if (o && P.sat.carga > 0) {
      const ox = o.x - CAM.x, oy = o.y - CAM.y; if (ox > -20 && ox < V.w + 20) { c.strokeStyle = '#58e0a0'; c.lineWidth = 3; c.setLineDash([5, 5]); c.beginPath(); c.arc(ox, oy, 18 + Math.sin(t * 6) * 2, 0, 6.2832); c.stroke(); c.setLineDash([]); }
    }
  }
  function frame(c, P, dt, t) {
    sigue(P, dt);
    const sh = EFECTOS.FX.temblor, sx = sh ? (Math.random() - 0.5) * sh : 0, sy = sh ? (Math.random() - 0.5) * sh : 0;
    fondo(c, TERRENO.mapa());
    c.save(); c.translate(sx, sy);
    const cv = TERRENO.canvas();
    if (cv) c.drawImage(cv, CAM.x, CAM.y, V.w, V.h, 0, 0, V.w, V.h);
    vacio(c); marca(c, P);
    for (const m of P.moviles) if (m.vivo) movil(c, m, P, t);
    guia(c, P);
    for (const p of P.proys || []) if (!p.hecho) proyectil(c, p);
    EFECTOS.pinta(c, CAM.x, CAM.y);
    c.restore();
    satelite(c, P, t);
  }
  return { V, CAM, frame, enfoca, tamano };
})();
