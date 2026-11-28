// Fans of Pop · RAID, el jefe CEO en pantalla (adaptador de pantalla, tarea 448, nodo n4; Pepins 28-11-2026: «tenemos una imagen del CEO slime»):
// pinta el dibujo del CEO slime de Pop (sl-ceo) y le pone el humor por encima (PP_RAID_CEO), al estilo del juego: se mece, se aplasta cuando le
// dan, tiembla y saca venitas de enfado, suda gotitas si está nervioso y le dan vueltas las estrellas cuando pierde.
// · pinta(c, { x, y, tam, humor, t, golpe, imagen }): centrado en (x, y), `tam` = lado en píxeles de diseño, `t` en segundos, `golpe` de 1 (le
//   acaban de dar) a 0, `imagen(k)` da un dibujo de Pop o null. · caja({ x, y, tam }) → { x, y, w, h }: dónde tocarle.
'use strict';
const PP_RAID_CEO_PINTA = (() => {
  // lo que lleva encima cada humor: venitas de enfado, gotas de sudor, temblor y estrellas de mareo
  const GESTOS = Object.freeze({
    chulo: {}, gana: { brillo: true }, molesto: { venas: 1 }, nervioso: { sudor: true, temblor: 0.5 },
    furioso: { venas: 2, temblor: 1 }, pelea: { venas: 2, temblor: 1 }, vencido: { mareo: true, caido: true },
  });
  // una venita de enfado (la cruz roja de los dibujos), que late
  function vena(c, x, y, r, t) {
    const k = 1 + Math.sin(t * 9) * 0.15;
    c.save(); c.translate(x, y); c.scale(k, k);
    c.strokeStyle = '#ff4a6a'; c.lineWidth = r * 0.34; c.lineCap = 'round';
    for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { c.beginPath(); c.arc(sx * r, sy * r, r * 0.72, Math.atan2(-sy, -sx) - 0.75, Math.atan2(-sy, -sx) + 0.75); c.stroke(); }
    c.restore();
  }
  function gota(c, x, y, r) {
    c.fillStyle = '#8fd4ff'; c.strokeStyle = '#fff'; c.lineWidth = r * 0.3;
    c.beginPath(); c.moveTo(x, y - r * 1.5); c.quadraticCurveTo(x + r * 1.2, y + r * 0.4, x, y + r); c.quadraticCurveTo(x - r * 1.2, y + r * 0.4, x, y - r * 1.5); c.fill(); c.stroke();
  }
  function adornos(c, g, tam, t, imagen) {
    const u = tam / 100;
    if (g.venas) vena(c, 30 * u, -34 * u, 7 * u, t);
    if (g.venas > 1) vena(c, -34 * u, -22 * u, 5.5 * u, t + 0.4);
    if (g.sudor) for (const [sx, d] of [[-40, 0], [40, 0.5]]) gota(c, sx * u, (-22 + ((t + d) % 1) * 26) * u, 5 * u);
    const estrella = imagen('fx-estrellita') || imagen('i-estrella');
    if (g.mareo && estrella) for (let k = 0; k < 3; k++) { const a = t * 3 + k * 2.1; c.drawImage(estrella, Math.cos(a) * 30 * u - 8 * u, -46 * u + Math.sin(a) * 7 * u - 8 * u, 16 * u, 16 * u); }
    if (g.brillo && estrella) c.drawImage(estrella, 30 * u, -44 * u + Math.sin(t * 4) * 3 * u, 14 * u, 14 * u);
  }
  // sin dibujo cargado: un slime liso con sus mofletes, para no dejar el hueco
  function repuesto(c, tam) {
    c.fillStyle = '#5a5f73'; c.beginPath(); c.arc(0, 0, tam * 0.42, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffb3d9'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * tam * 0.24, tam * 0.08, tam * 0.07, 0, Math.PI * 2); c.fill(); }
  }

  function pinta(c, { x, y, tam, humor, t, golpe = 0, imagen }) {
    const g = GESTOS[humor] || GESTOS.chulo, im = imagen('sl-ceo');
    const tiembla = (g.temblor || 0) * Math.sin(t * 34) * tam * 0.018 + (golpe ? Math.sin(t * 70) * tam * 0.05 * golpe : 0);
    const respira = Math.sin(t * 2.4) * 0.03;
    c.save();
    c.fillStyle = 'rgba(196, 58, 132, 0.22)';
    c.beginPath(); c.ellipse(x, y + tam * 0.46, tam * 0.36, tam * 0.07, 0, 0, Math.PI * 2); c.fill();
    c.translate(x + tiembla, y + tam * 0.5);   // se aplasta y se estira desde los pies
    c.rotate(g.caido ? 0.22 : Math.sin(t * 1.6) * 0.03);
    c.scale(1 + respira + golpe * 0.14, 1 - respira - golpe * 0.14);
    c.translate(0, -tam * 0.5);
    c.imageSmoothingEnabled = true;
    if (im) c.drawImage(im, -tam / 2, -tam / 2, tam, tam); else repuesto(c, tam);
    adornos(c, g, tam, t, imagen);
    c.restore();
  }
  const caja = ({ x, y, tam }) => ({ x: x - tam * 0.42, y: y - tam * 0.45, w: tam * 0.84, h: tam * 0.95 });

  return Object.freeze({ GESTOS, pinta, caja });
})();
