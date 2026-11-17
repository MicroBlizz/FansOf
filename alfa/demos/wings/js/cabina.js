// Fans of Wings · La cabina (cámara en primera persona). Cada caza tiene la suya: una imagen en pixel art (img/cabina-<caza>-<idioma>.png,
// con el cristal transparente) y, dibujado encima, lo que se mueve: agujas, horizonte artificial, radar, cifras, barras, misiles y la
// palanca con la pata del piloto, que se inclina con el mando. Dónde va cada cosa lo dice cabinas.js.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const U = 720 / 270;                       // un píxel gordo del dibujo, en la pantalla lógica de 720 de alto
  const LETRA = (n) => n + "px 'Press Start 2P', monospace";
  const fotos = {}, mano = { giro: 0, baja: 0 };

  // Las imágenes se piden la primera vez que hacen falta; hasta que llegan no se dibuja la cabina.
  function foto(nombre) {
    if (!fotos[nombre]) { fotos[nombre] = new Image(); fotos[nombre].src = 'img/' + nombre + '.png'; }
    const f = fotos[nombre];
    return f.complete && f.naturalWidth ? f : null;
  }

  function aguja(g, r, v) {
    const an = -2.3 + v * 4.6, sx = Math.sin(an), cy = -Math.cos(an);
    g.lineCap = 'butt';
    g.strokeStyle = '#000'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(r.x + 0.5, r.y + 0.5); g.lineTo(r.x + 0.5 + sx * (r.r - 3.5), r.y + 0.5 + cy * (r.r - 3.5)); g.stroke();
    g.strokeStyle = r.color; g.lineWidth = r.r > 11 ? 1.5 : 1; g.beginPath(); g.moveTo(r.x - sx * 2.5, r.y - cy * 2.5); g.lineTo(r.x + sx * (r.r - 3.5), r.y + cy * (r.r - 3.5)); g.stroke();
    g.fillStyle = '#15161a'; g.beginPath(); g.arc(r.x, r.y, 1.6, 0, 7); g.fill(); g.fillStyle = '#d8dce4'; g.beginPath(); g.arc(r.x, r.y, 1, 0, 7); g.fill();
  }

  // El horizonte artificial: cielo y tierra que giran con el alabeo y suben o bajan con el cabeceo, y las alitas amarillas fijas.
  function horizonte(g, h, d) {
    const w = h.w || h.r, a = h.h || h.r;
    g.save(); g.beginPath();
    if (h.r) g.arc(h.x, h.y, h.r, 0, 7); else g.rect(h.x - w, h.y - a, w * 2, a * 2);
    g.clip(); g.translate(h.x, h.y); g.rotate(-d.alabeo); g.translate(0, d.cabeceo * a * 1.4);
    const L = w * 4;
    g.fillStyle = '#2f6fc8'; g.fillRect(-L, -L, L * 2, L); g.fillStyle = '#4f9be0'; g.fillRect(-L, -a * 0.7, L * 2, a * 0.7); g.fillStyle = '#6fb4ee'; g.fillRect(-L, -a * 0.3, L * 2, a * 0.3);
    g.fillStyle = '#5a3818'; g.fillRect(-L, 0, L * 2, L); g.fillStyle = '#8a5a2c'; g.fillRect(-L, 0, L * 2, a * 0.7); g.fillStyle = '#a8703a'; g.fillRect(-L, 0, L * 2, a * 0.3);
    g.fillStyle = '#fff'; g.fillRect(-L, -0.6, L * 2, 1.2);
    for (let k = -4; k <= 4; k++) if (k) { const m = k % 2 ? w * 0.16 : w * 0.3; g.fillRect(-m, k * a * 0.2 - 0.35, m * 2, 0.7); }
    g.restore();
    g.fillStyle = '#2a1a00'; g.fillRect(h.x - w * 0.6, h.y - 0.5, w * 0.36, 2); g.fillRect(h.x + w * 0.24, h.y - 0.5, w * 0.36, 2);
    g.fillStyle = '#ffd23c'; g.fillRect(h.x - w * 0.6, h.y - 0.5, w * 0.36, 1.5); g.fillRect(h.x + w * 0.24, h.y - 0.5, w * 0.36, 1.5);
    g.fillRect(h.x - w * 0.24, h.y + 1, 1.5, 2.5); g.fillRect(h.x + w * 0.24 - 1.5, h.y + 1, 1.5, 2.5); g.beginPath(); g.arc(h.x, h.y, 1.3, 0, 7); g.fill();
    if (h.r) { g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2; g.beginPath(); g.arc(h.x, h.y, h.r - 1, 0, 7); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 0.8; g.beginPath(); g.arc(h.x, h.y, h.r - 2.5, 3.6, 4.4); g.stroke(); }
  }

  function texto(g, t, d) {
    const v = d[t.de];
    if (v === '') return;
    const s = (t.et ? tr(t.et) + ' ' : '') + (t.de === 'fijado' ? tr(v) : v), tam = t.tam || 5;
    g.font = LETRA(tam); g.textAlign = t.al; g.textBaseline = 'alphabetic';
    if (t.caja) { const x = t.al === 'center' ? t.x - t.caja / 2 : t.x - t.caja + 1.5; g.fillStyle = '#0e0f12'; g.fillRect(x, t.y - tam - 2, t.caja, tam + 4); }
    g.fillStyle = t.color; g.fillText(s, t.x, t.y);
  }

  function barra(g, b, d) {
    const paso = Math.floor((b.w * 2 - 2) / b.n) / 2, n = Math.ceil(d[b.de] * b.n - 0.001);   // mismas medidas que pincel.barra
    for (let i = 0; i < n; i++) {
      g.fillStyle = b.color; g.fillRect(b.x + 1 + i * paso, b.y + 1, paso - 1, b.h - 2);
      g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(b.x + 1 + i * paso, b.y + 1, paso - 1, 0.5);
    }
  }

  // Los misiles que quedan, como misilitos de pie en su caja (los gastados, apagados).
  function misiles(g, m, e) {
    const n = e.caza.misiles, paso = m.w / n, an = Math.min(3, paso - 2);
    for (let i = 0; i < n; i++) {
      const x = m.x + i * paso + (paso - an) / 2, queda = i < e.misiles;
      g.fillStyle = queda ? '#f4f4f0' : '#3a3a3a'; g.fillRect(x, m.y + 3, an, m.h - 6); g.fillRect(x - 1, m.y + m.h - 4, an + 2, 2);
      g.fillStyle = queda ? '#e63a2a' : '#3a3a3a'; g.fillRect(x, m.y + 1, an, 2.5);
    }
  }

  function gases(g, q, d) {
    const n = Math.max(1, Math.round(d.motor * q.n));
    g.fillStyle = q.color;
    for (let i = 0; i < n; i++) g.fillRect(q.x, q.y + (q.n - 1 - i) * q.paso, q.w, q.h);
  }

  // La palanca con la pata: gira sobre su base con el mando a los lados y baja un poco al tirar de ella.
  function palanca(g, p, img, mando) {
    mano.giro += ((mando ? mando.mx : 0) * 0.2 - mano.giro) * 0.25; mano.baja += ((mando ? mando.my : 0) * 2.5 - mano.baja) * 0.25;
    g.save(); g.translate(p.x + p.w / 2, 273); g.rotate(mano.giro);
    g.drawImage(img, -p.w / 2, p.y - 270 + mano.baja, p.w, p.h);
    g.restore();
  }

  function instrumentos(g, c, e, d) {
    horizonte(g, c.horizonte, d);
    for (const r of c.relojes) aguja(g, r, d[r.de]);
    g.save(); g.scale(1 / U, 1 / U); A.ui.radar(g, e, c.radar.x * U, c.radar.y * U, c.radar.r * U); g.restore();   // el radar del HUD dibuja en medidas de pantalla
    for (const b of c.barras) barra(g, b, d);
    if (c.misiles) misiles(g, c.misiles, e);
    if (c.gases) gases(g, c.gases, d);
    for (const t of c.textos) texto(g, t, d);
  }

  // peso = cuánto de la cabina se ve (0 a 1, mientras la cámara entra o sale). mando = la orden del jugador ({ mx, my }).
  A.cabina = function (g, e, peso, W, mando) {
    const cual = e.caza.cabina || e.caza.id, c = A.cabinas[cual];   // un caza sin cabina propia la toma prestada (ajustes.js)
    if (!c) return;
    const idioma = document.documentElement.lang === 'es' ? 'es' : 'en';   // los rótulos van pintados: hay imagen en español y en inglés
    const fondo = foto('cabina-' + cual + '-' + idioma), mango = foto('palanca-' + cual);
    if (peso <= 0.01 || !fondo || !mango) return;
    g.save(); g.globalAlpha = peso; g.imageSmoothingEnabled = false;
    g.translate(W / 2 - 240 * U, 0); g.scale(U, U);
    g.drawImage(fondo, -75, 0, 630, 270);
    instrumentos(g, c, e, A.cabinaDatos(e, new Date()));
    palanca(g, c.palanca, mango, mando);
    g.restore();
  };
})(WINGS);
