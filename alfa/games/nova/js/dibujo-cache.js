// Fans of Nova · Rendimiento del dibujo: qué cae en pantalla, el fondo a baja resolución, la sombra de la nave y los sprites
// enemigos ya escalados (una vez, no en cada fotograma), y la resolución que baja sola si el móvil no llega a 45 fps.
'use strict';
const NV_CACHE = { fondo: null, sombra: {}, spr: {}, dts: [], ult: 0 };
// Lienzo a 1/4 de resolución para el degradado y las nubes del fondo (borrosos de por sí): un solo volcado a pantalla.
function nvFondoCapa(W, H) {
  let f = NV_CACHE.fondo; const w = Math.max(1, Math.round(W / 4)), h = Math.max(1, Math.round(H / 4));
  if (!f || f.width !== w || f.height !== h) { f = NV_CACHE.fondo = document.createElement('canvas'); f.width = w; f.height = h; }
  return f;
}
// Silueta negra de la nave (alas + casco) para su sombra, una vez por casco y clase: sin `filter`, que es carísimo en móvil.
const NV_SOMBRA_L = 1000;
function nvSombraNave(casco, k) { return nvNaveLienzo(casco, k, true); }
// La nave entera (alas + casco) en un lienzo, en color o en negro; también sirve para los trozos cuando revienta.
function nvNaveImagen(casco, k) { return nvNaveLienzo(casco, k, false); }
function nvNaveLienzo(casco, k, negra) {
  const id = casco + '-' + k + (negra ? '-n' : ''); if (NV_CACHE.sombra[id]) return NV_CACHE.sombra[id];
  if (!NVA.listo) return null;
  const s = document.createElement('canvas'); s.width = s.height = NV_SOMBRA_L; const c = s.getContext('2d');
  c.translate(NV_SOMBRA_L / 2, NV_SOMBRA_L / 2); nvCuerpo(c, casco, k, 'alas'); nvCuerpo(c, casco, k, 'casco');
  if (negra) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#000'; c.fillRect(0, 0, NV_SOMBRA_L, NV_SOMBRA_L); }
  return (NV_CACHE.sombra[id] = s);
}
// Sprite enemigo escalado a su tamaño en pantalla (por escalones de ~19 %): reducir un PNG de 512 px en cada fotograma cuesta mucho.
function nvSpriteEscalado(tipo, im, px) {
  const t = Math.min(im.naturalWidth, Math.max(8, Math.round(Math.pow(2, Math.ceil(Math.log2(Math.max(1, px)) * 4) / 4)))), id = tipo + t;
  let s = NV_CACHE.spr[id];
  if (!s) { s = NV_CACHE.spr[id] = document.createElement('canvas'); s.width = s.height = t; const c = s.getContext('2d'); c.imageSmoothingQuality = 'high'; c.drawImage(im, 0, 0, t, t); }
  return s;
}
// Resolución adaptable: si la media de los últimos 90 fotogramas pasa de 22 ms (< 45 fps), baja un escalón (hasta 3/4: más abajo
// todo se ve borroso); si vuelve a ir holgada (< 13 ms, más de 75 fps), sube otra vez.
function nvMideFotograma() {
  const ahora = performance.now(), dt = ahora - (NV_CACHE.ult || ahora); NV_CACHE.ult = ahora;
  if (dt <= 0 || dt > 200 || NVP.tuto) return;   // pausas, pestaña oculta o ayuda abierta: no cuentan
  const l = NV_CACHE.dts; l.push(dt); if (l.length < 90) return;
  const media = l.reduce((a, b) => a + b, 0) / l.length; l.length = 0;
  const q = NVP.calidad || 1;
  if (media > 22 && q > 0.75) { NVP.calidad = 0.75; nvAjustaLienzo(); }
  else if (media < 13 && q < 1) { NVP.calidad = 1; nvAjustaLienzo(); }
}
