// Fans of Panic · Ilustraciones: la portada que se destapa en cada nivel. Si existe img/<mundo>-<n>.jpg (la pinta Yoshi) se usa;
// mientras no, se dibuja un cartel provisional con los colores del mundo. También se dibuja el panel gris de Microblizz que la tapa.
'use strict';

const ILUS = { cache: {}, lienzo: null };

// la imagen del nivel (o null si aún no hay); la carga empieza la primera vez que se pide
function imagenNivel(mundo, n) {
  const k = `${mundo}-${n}`;
  if (!(k in ILUS.cache)) {
    const im = new Image(); ILUS.cache[k] = null;
    im.onload = () => { ILUS.cache[k] = im; };
    im.src = `img/${k}.jpg?v=1`;
  }
  return ILUS.cache[k];
}

// el cartel provisional: fondo degradado del mundo, rayos, el nombre de la ilustradora y su oficio
function pintaCartelProvisional(g, M, n, w, h) {
  const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, M.claro); d.addColorStop(1, M.color);
  g.fillStyle = d; g.fillRect(0, 0, w, h);
  g.save(); g.translate(w / 2, h * 0.45); g.globalAlpha = 0.18; g.fillStyle = '#fff';
  for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(-h * 0.08, -h); g.lineTo(h * 0.08, -h); g.closePath(); g.fill(); }
  g.restore();
  g.fillStyle = 'rgba(255,255,255,.25)';
  for (let i = 0; i < 40; i++) { const x = ((i * 97 + n * 31) % 100) / 100 * w, y = ((i * 57 + n * 13) % 100) / 100 * h, r = 3 + (i % 5) * 3; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = M.fondo; g.beginPath(); g.ellipse(w / 2, h * 0.62, w * 0.22, h * 0.3, 0, 0, Math.PI * 2); g.fill();   // la silueta provisional de la chica
  g.fillStyle = M.claro; g.beginPath(); g.arc(w / 2, h * 0.3, w * 0.13, 0, Math.PI * 2); g.fill();
  g.font = `800 ${Math.round(w * 0.1)}px "Baloo 2", system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = w * 0.02; g.strokeStyle = M.fondo; g.fillStyle = '#fff';
  g.strokeText(M.chica, w / 2, h * 0.86); g.fillText(M.chica, w / 2, h * 0.86);
  g.font = `700 ${Math.round(w * 0.05)}px "Baloo 2", system-ui, sans-serif`;
  g.strokeText(tr(M.oficio) + ' · ' + n, w / 2, h * 0.93); g.fillText(tr(M.oficio) + ' · ' + n, w / 2, h * 0.93);
}

// prepara el lienzo con la ilustración del nivel a las medidas del tablero (se pinta recortada por las casillas destapadas)
function preparaIlustracion(mundo, n, w, h) {
  const c = document.createElement('canvas'); c.width = Math.round(w * PAN.k); c.height = Math.round(h * PAN.k);
  const g = c.getContext('2d'); g.scale(PAN.k, PAN.k);
  const im = imagenNivel(mundo, n);
  if (im) {   // la imagen de Yoshi, recortada a lo que quepa (sin deformar)
    const esc = Math.max(w / im.width, h / im.height), iw = im.width * esc, ih = im.height * esc;
    g.drawImage(im, (w - iw) / 2, (h - ih) / 2, iw, ih);
  } else pintaCartelProvisional(g, MUNDOS[mundo], n, w, h);
  ILUS.lienzo = c; ILUS.conImagen = !!im;
}

// el panel gris de Cumplimiento de Microblizz: la textura de Yoshi (img/panel.png) repetida; mientras no esté, gris con rayas
function pintaPanel(x, y, w, h, t) {
  const tex = sprite('papel') || sprite('panel');   // el papel de Microblizz; si aún no está, el panel de metal
  if (tex) { G.save(); G.fillStyle = G.createPattern(tex, 'repeat'); G.translate(x, y); G.fillRect(0, 0, w, h); G.restore(); return; }
  G.fillStyle = COL.panel; G.fillRect(x, y, w, h);
  G.save(); G.beginPath(); G.rect(x, y, w, h); G.clip();
  G.globalAlpha = 0.12; G.fillStyle = '#fff';
  for (let i = -h; i < w + h; i += 28) { G.beginPath(); G.moveTo(x + i, y); G.lineTo(x + i + 14, y); G.lineTo(x + i + 14 - h, y + h); G.lineTo(x + i - h, y + h); G.closePath(); G.fill(); }
  G.globalAlpha = 0.35; G.translate(x + w / 2, y + h / 2); G.rotate(-0.45);
  G.font = `800 ${Math.round(w * 0.07)}px "Baloo 2", system-ui, sans-serif`; G.textAlign = 'center'; G.textBaseline = 'middle'; G.fillStyle = '#fff';
  for (let f = -3; f <= 3; f++) G.fillText(tr('CUMPLIMIENTO · MICROBLIZZ'), ((f % 2) ? 20 : -20) + Math.sin(t) * 2, f * w * 0.19);
  G.restore();
}
