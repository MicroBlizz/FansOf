// Fans of Survivors · El dibujo de las mecánicas nuevas (js/mecanicas.js): altares, fuentes y cofres con candado en el suelo,
// la franja de aviso de las embestidas de los mini jefes, las flechas en el borde hacia los sitios y los poderes activos.
// Todo dibujado con formas (contorno grueso y colores de la serie) e iconos pintados; nada de emojis.
'use strict';

const MEC_DIBUJO = (() => {
  const COL = { altar: '#e879f9', fuente: '#7dd3fc', candado: '#ffcb3d' };
  const ICO = { altar: 'estrella', fuente: 'cura', candado: 'moneda' };
  const ICO_PODER = { dano: 'puno', vel: 'cafe', iman: 'iman', recarga: 'reflejos' };

  function altar(c, s) {
    shape(c, rr(s.x - 18, s.y - 34, 36, 34, 5), '#8a5cff');
    shape(c, rr(s.x - 24, s.y - 40, 48, 10, 4), '#b48cff');
    c.globalAlpha = 0.6 + Math.sin(P.t * 5) * 0.3; ICONO.dibuja(c, 'estrella', s.x, s.y - 58, 26, 0, 1, COL.altar); c.globalAlpha = 1;
  }
  function fuente(c, s) {
    const k = s.queda / Math.max(1, MECANICAS.sitios.fuente.capacidad * P.jug.vidaMax);
    shape(c, el(s.x, s.y - 6, 30, 14), '#cdd6e6');
    c.fillStyle = 'rgba(125,211,252,' + (0.3 + 0.6 * k) + ')'; c.beginPath(); c.ellipse(s.x, s.y - 8, 24 * k + 4, 9 * k + 2, 0, 0, Math.PI * 2); c.fill();
    if (k > 0.05) particulas(s.x + rand(-10, 10), s.y - 14, 1, '#bfe9ff', 40, 3, 0.4);
  }
  function candado(c, s) {
    shape(c, rr(s.x - 18, s.y - 26, 36, 24, 4), '#c06a1a'); shape(c, rr(s.x - 19, s.y - 32, 38, 10, 4), '#e08a2a');
    c.lineWidth = 4; c.strokeStyle = OL; c.beginPath(); c.arc(s.x, s.y - 18, 6, Math.PI, 0); c.stroke();
    shape(c, rr(s.x - 7, s.y - 18, 14, 11, 2), '#cdd6e6');
    if (s.prog > 0) {   // el anillo de progreso
      c.lineWidth = 5; c.strokeStyle = OL; c.beginPath(); c.arc(s.x, s.y - 16, 30, 0, Math.PI * 2); c.stroke();
      c.lineWidth = 3; c.strokeStyle = COL.candado; c.beginPath(); c.arc(s.x, s.y - 16, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.prog); c.stroke();
    }
  }
  const FORMAS = { altar, fuente, candado };
  // en el suelo: el círculo de cada sitio y su dibujo (se llama dentro de la cámara)
  function suelo(c) {
    const R = MECANICAS.sitios.radio;
    for (const s of MEC.sitiosVivos()) {
      const parpadeo = s.t < 8 ? 0.5 + 0.5 * Math.sin(P.t * 10) : 1;
      c.globalAlpha = 0.28 * parpadeo; c.fillStyle = COL[s.tipo]; c.beginPath(); c.ellipse(s.x, s.y, R, R * 0.8, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = parpadeo; c.strokeStyle = COL[s.tipo]; c.lineWidth = 2; c.setLineDash([8, 6]); c.lineDashOffset = -P.t * 18; c.stroke(); c.setLineDash([]);
      FORMAS[s.tipo](c, s); c.globalAlpha = 1;
    }
    for (const e of P.enemigos) if (e.emb && e.emb.fase === 'aviso') franja(c, e);
  }
  // la franja roja que avisa de por dónde va a cargar un mini jefe
  function franja(c, e) {
    const E = e.emb, A = MECANICAS.jefes, k = 1 - E.t / A.embestidaAviso, ang = Math.atan2(E.dy, E.dx), w = A.embestidaAncho;
    c.save(); c.translate(e.x, e.y); c.rotate(ang);
    c.globalAlpha = 0.25; c.fillStyle = '#ff4b5c'; c.fillRect(0, -w / 2, E.largo, w);
    c.globalAlpha = 0.55; c.fillRect(0, -w / 2, E.largo * k, w);
    c.globalAlpha = 1; c.strokeStyle = '#ff4b5c'; c.lineWidth = 2; c.strokeRect(0, -w / 2, E.largo, w); c.restore();
  }
  // en la pantalla: flechas en el borde hacia los sitios que no se ven, y los poderes de altar activos
  function marcador(c) {
    const m = 26;
    for (const s of MEC.sitiosVivos()) {
      const dx = s.x - P.cam.x, dy = s.y - P.cam.y;
      if (Math.abs(dx) < VW / 2 - 10 && Math.abs(dy) < VH / 2 - 10) continue;
      const k = Math.min((VW / 2 - m) / Math.abs(dx || 1), (VH / 2 - m - 40) / Math.abs(dy || 1)), x = VW / 2 + dx * k, y = VH / 2 + dy * k, a = Math.atan2(dy, dx);
      c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = COL[s.tipo]; c.strokeStyle = OL; c.lineWidth = 3;
      c.beginPath(); c.moveTo(14, 0); c.lineTo(-8, -10); c.lineTo(-8, 10); c.closePath(); c.fill(); c.stroke(); c.restore();
      ICONO.dibuja(c, ICO[s.tipo], x - Math.cos(a) * 22, y - Math.sin(a) * 22, 22, 0, 1, COL[s.tipo]);
    }
    let x = VW - 44;
    const B = MEC.buffs();
    for (const p in B) {
      if (B[p] <= 0) continue;
      c.fillStyle = 'rgba(20,10,34,.7)'; c.beginPath(); rrPath(c, x, 112, 34, 34, 6); c.fill();
      ICONO.dibuja(c, ICO_PODER[p], x + 17, 126, 24); otxt(c, String(Math.ceil(B[p])), x + 17, 142, 11, '#e879f9'); x -= 38;
    }
  }
  return Object.freeze({ suelo, marcador });
})();
