// Fans of Rouflage · LA FOTO DEL CAMUFLAJE: al acabar una partida de colado, el botón COMPARTIR saca una tarjeta con la foto del sitio
// donde te escondiste («¿ME ENCUENTRAS?») para mandarla por WhatsApp, TikTok… y retar a tus amigos a encontrarte. La foto se hace al
// empezar la caza y otra vez al acabar si seguías escondido (fotoHaz, lo llaman cambiaFase y termina), sin luces ni marcas: solo el
// suelo, los muebles y los personajes de alrededor, como los verían los becarios con la luz encendida.
'use strict';
const FOTO = { lado: 230, px: 720, cv: null, camo: 0 };      // lo que se ve del mundo (unidades) y lo que mide la foto (píxeles)

// la foto del sitio donde está `yo`: el suelo, los muebles y los personajes cercanos, de atrás adelante
function fotoHaz(yo) {
  if (!yo || yo.clase !== 'camaleon' || yo.fuera || !MAPA.fondo) return;
  try {
    const L = FOTO.lado, cx = limita(yo.x, L / 2, ANCHO - L / 2), cy = limita(yo.y - 26, L / 2, ALTO - L / 2), x0 = cx - L / 2, y0 = cy - L / 2;
    const cv2 = FOTO.cv || (FOTO.cv = document.createElement('canvas')); cv2.width = cv2.height = FOTO.px;
    const c = cv2.getContext('2d'), k = FOTO.px / L;
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = COLOR_MURO; c.fillRect(0, 0, FOTO.px, FOTO.px);
    c.drawImage(MAPA.fondo, x0 * ESC_FONDO, y0 * ESC_FONDO, L * ESC_FONDO, L * ESC_FONDO, 0, 0, FOTO.px, FOTO.px);
    c.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
    const cosas = [];
    for (const m of MAPA.porY) if (m.dib.x0 < x0 + L && m.dib.x0 + m.dib.w > x0 && m.dib.y0 < y0 + L + 60 && m.dib.y0 + m.dib.h > y0) cosas.push(m);
    for (const e of J.camaleones) if (!e.fuera && !(e.invis > 0) && e.x > x0 - 40 && e.x < x0 + L + 40 && e.y > y0 - 10 && e.y < y0 + L + 80) cosas.push(e);
    cosas.sort((a, b) => a.y - b.y);
    const t = J.t || 0;
    for (const q of cosas) { if (q.T) c.drawImage(q.dibujo.cv, q.dib.x0, q.dib.y0, q.dib.w, q.dib.h); else { pintaAlubia(c, q, t); c.globalAlpha = 1; } }
    FOTO.camo = yo.camo || 0;
    // lo que hace falta para el reto compartido (reto.js): el sitio, la postura y la pintura de este momento
    let png = ''; try { png = yo.piel.toDataURL('image/png'); png = png.slice(png.indexOf(',') + 1); } catch (_) { png = ''; }
    FOTO.reto = png ? { mapa: MAPA.id, x: Math.round(yo.x), y: Math.round(yo.y), postura: yo.postura || 'firmes', animal: yo.tipo, camo: Math.round(yo.camo || 0), piel: png } : null;
    if (typeof RETO !== 'undefined') RETO.creando = null;
    fotoOlvida();
  } catch (err) { console.warn('[foto]', err); FOTO.cv = null; }
}
const fotoHay = () => !!FOTO.cv && J.modo === 'camaleon';

// la tarjeta para compartir: título, la foto y el pie con el juego y el código del reto (si lo hay)
function fotoTarjeta(codigo) {
  const W = 1080, H = 1350, cv2 = document.createElement('canvas'); cv2.width = W; cv2.height = H;
  const c = cv2.getContext('2d');
  c.fillStyle = '#18223a'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 18; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.06)'; c.fillRect(0, i * 75, W, 75); }
  rotulo(c, tr('¿ME ENCUENTRAS?'), W / 2, 120, 96, '#ffcb3d', OL);
  rotulo(c, codigo ? tr('Tienes 20 segundos y 3 disparos') : tr('Estoy escondido en esta foto'), W / 2, 205, 44, '#fff6ea', OL, LETRA_UI);
  const lado = 880, m = (W - lado) / 2, y = 255;
  c.fillStyle = OL; c.fillRect(m - 12, y - 12, lado + 24, lado + 24);
  c.drawImage(FOTO.cv, m, y, lado, lado);
  rotulo(c, tr('Camuflaje: {n} %', { n: FOTO.camo }), W / 2, y + lado + 85, 50, '#7ee04a', OL, LETRA_UI);
  rotulo(c, codigo ? 'Fans of Rouflage · ' + tr('reto {c}', { c: codigo }) : 'Fans of Rouflage', W / 2, H - 55, 40, '#fff6ea', OL, LETRA_UI);
  return cv2;
}
// compartir: primero se guarda el reto (para que la foto lleve su enlace) y luego el menú del móvil con la imagen y el enlace.
// Si el móvil no deja mandar imágenes, el enlace y la imagen por separado; si nada de eso, se copia el enlace y se descarga la imagen.
// El menú de compartir solo se abre poco después de tocar: si el servidor tarda y el móvil lo rechaza, el botón queda listo para un segundo toque al momento
const FOTO_LISTA = { blob: null, url: '', codigo: '' };
async function fotoComparte() {
  if (!fotoHay()) return;
  play('select');
  const b = E('b-foto');
  if (!FOTO_LISTA.blob) {
    b.disabled = true; b.classList.add('cargando');
    const codigo = await retoCrear();
    b.disabled = false; b.classList.remove('cargando');
    FOTO_LISTA.codigo = codigo || ''; FOTO_LISTA.url = codigo ? retoUrl(codigo) : location.origin + location.pathname;
    FOTO_LISTA.blob = await new Promise(r => fotoTarjeta(codigo).toBlob(r, 'image/png'));
    if (!FOTO_LISTA.blob) return;
  }
  misionEvento('comparte');      // misiones y logros (misiones.js)
  const { blob, url, codigo } = FOTO_LISTA;
  const archivo = new File([blob], 'rouflage-me-encuentras.png', { type: 'image/png' });
  const texto = codigo ? tr('Me he escondido. Tienes 20 segundos y 3 disparos. ¿Me encuentras?') : tr('¿Me encuentras? Juega gratis a Fans of Rouflage');
  try {
    if (navigator.canShare && navigator.canShare({ files: [archivo], url })) { await navigator.share({ files: [archivo], title: 'Fans of Rouflage', text: texto, url }); return; }
    if (navigator.share) { await navigator.share({ title: 'Fans of Rouflage', text: texto, url }); return; }
  } catch (e) {
    if (e && e.name === 'AbortError') return;      // lo ha cancelado él
    if (e && e.name === 'NotAllowedError') { b.querySelector('b').textContent = tr('TOCA OTRA VEZ PARA ENVIAR'); return; }      // tardó el servidor: el segundo toque ya va al momento
  }
  try { await navigator.clipboard.writeText(texto + ' ' + url); } catch (_) { /* sin portapapeles */ }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = archivo.name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  avisa(tr('Enlace copiado e imagen guardada: mándaselos a tus amigos'), 'bueno');
}
// cada partida nueva empieza sin foto preparada (lo llama fotoHaz al hacer una foto nueva)
function fotoOlvida() { FOTO_LISTA.blob = null; FOTO_LISTA.url = ''; FOTO_LISTA.codigo = ''; const b = E('b-foto'); if (b && b.querySelector('b')) b.querySelector('b').textContent = tr('COMPARTIR MI ESCONDITE'); }
