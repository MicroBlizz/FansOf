// Fans of Snakes · El anuncio con premio (de PRUEBA): siempre voluntario, nunca a la fuerza ni en mitad de la partida. Por ahora
// solo sale en la alfa y en desarrollo; en la web de verdad el botón no aparece hasta que estén AdMob y el sí de Arkioner.
// verAnuncio(alAcabar): 5 segundos con un mensaje de «nuestros patrocinadores» y, al tocar RECOGER, el premio.
'use strict';

const PUBLI = { activo: false, t: 0, alAcabar: null };
const SEG_ANUNCIO = 5;
const hayAnuncios = () => !!(NUCLEO.alfa || NUCLEO.desarrollo);

function verAnuncio(alAcabar) { Object.assign(PUBLI, { activo: true, t: 0, alAcabar }); }
function toqueAnuncio() {
  if (PUBLI.t < SEG_ANUNCIO) return;
  PUBLI.activo = false; SONIDO.boton();
  const f = PUBLI.alAcabar; PUBLI.alAcabar = null; if (f) f();
}

function pintaAnuncioPremio(W, H, dt) {
  if (!PUBLI.activo) return;
  PUBLI.t += dt;
  const listo = PUBLI.t >= SEG_ANUNCIO, w = W - 40, h = 160, x = 20, y = H / 2 - h / 2;
  G.fillStyle = 'rgba(20,10,35,0.9)'; G.fillRect(0, 0, W, H);
  caja(x, y, w, h, 8, '#3b1466', '#d36bff', 2);
  caja(x + 8, y - 6, 62, 12, 4, '#ffd54a', '#06110a', 1); letra(tr('ANUNCIO DE PRUEBA'), x + 39, y + 0.5, 5.5, '#06110a', 'center', null, 0);
  // una serpiente bailando con gafas de sol (el «producto»)
  for (let i = 0; i < 9; i++) { const sx = W / 2 - 32 + i * 8, sy = y + 40 + Math.sin(PUBLI.t * 6 + i * 0.8) * 5; caja(sx - 3.5, sy - 3.5, 7, 7, 2, colorPiel(8 - i, 9, PUBLI.t, i === 8), '#06110a', 0.8); }
  const hx = W / 2 + 32, hy = y + 40 + Math.sin(PUBLI.t * 6 + 8 * 0.8) * 5; G.fillStyle = '#06110a'; G.fillRect(hx - 4, hy - 2, 8, 2.5);
  letra(tr('FANS OF SNAKES PREMIUM'), W / 2, y + 66, 10, '#ffd54a', 'center', '#06110a', 2.5);
  G.font = '700 7.5px "Baloo 2", system-ui, sans-serif';
  lineas(tr('Un mensaje de nuestros patrocinadores… que somos nosotros.'), w - 24, 7.5).slice(0, 2).forEach((l, i) => letra(l, W / 2, y + 82 + i * 9, 7.5, '#fff', 'center', null, 0, 700));
  const k = Math.min(1, PUBLI.t / SEG_ANUNCIO);
  caja(x + 14, y + 104, w - 28, 5, 2.5, '#1a0f2a', null); G.fillStyle = '#d36bff'; G.fillRect(x + 14, y + 104, (w - 28) * k, 5);
  const bw = 120, bx = W / 2 - bw / 2, by = y + 118;
  caja(bx, by, bw, 20, 6, listo ? '#3ddc84' : '#2a2140', '#06110a', 1.5);
  letra(listo ? tr('RECOGER PREMIO') : tr('El premio llega en {t}…', { t: Math.ceil(SEG_ANUNCIO - PUBLI.t) }), W / 2, by + 10.5, 8, listo ? '#06110a' : '#cbb6ff', 'center', null, 0);
}
