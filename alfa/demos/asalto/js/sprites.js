// Fans of Asalto · SPRITES: carga las tiras de img/ (pixel art de Yoshi, reducido con herramientas/comfyui/asalto/sprites.py) y pinta
// a cada muñeco en su animación: reposo, andar, ataque, golpe y muerte. Si a un personaje aún le falta algún fotograma, se suple
// moviendo su dibujo por código (botar, estirarse, embestir, parpadear). Nunca se voltea un dibujo: los héroes miran a la derecha
// y los enemigos a la izquierda, así el arma no cambia de mano. Todo se pinta al doble (AS_PX) y sin suavizar.
'use strict';
const AS_PX = 2;
const AS_IMG = {};
const AS_BLANCO = {};   // la misma tira en blanco, para el destello al recibir un golpe
function asCargaImagenes(listo) {
  const nombres = Object.keys(AS_TIRAS).concat(['arena', 'portada']);
  let faltan = nombres.length;
  const uno = () => { if (--faltan === 0) listo(); };
  for (const n of nombres) {
    const im = new Image();
    im.onload = () => { AS_IMG[n] = im; uno(); };
    im.onerror = uno;
    im.src = 'img/' + n + '.png?v=' + NUCLEO.version;
  }
}
function asHay(tipo) { return !!(AS_IMG[tipo] && AS_TIRAS[tipo]); }
function asBlanco(tipo) {
  if (AS_BLANCO[tipo]) return AS_BLANCO[tipo];
  const im = AS_IMG[tipo], cv = document.createElement('canvas');
  cv.width = im.width; cv.height = im.height;
  const c = cv.getContext('2d'); c.drawImage(im, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height);
  return (AS_BLANCO[tipo] = cv);
}
// el fotograma que toca: el nombre en la tira (o el más parecido que haya) y el movimiento por código si falta el suyo
const AS_ANIM = {
  reposo: { f: ['reposo-1', 'reposo-2'], t: 0.45, bucle: true },
  andar: { f: ['andar-1', 'andar-2', 'andar-3', 'andar-4'], t: 0.12, bucle: true },
  ataque: { f: ['ataque-1', 'ataque-2', 'ataque-3', 'ataque-4'], t: 0, bucle: false },   // t lo pone la duración del ataque
  golpe: { f: ['golpe-1'], t: 0.22, bucle: false },
  muerte: { f: ['muerte-1', 'muerte-2'], t: 0.22, bucle: false },
};
function asCuadro(tipo, anim, tiempo, dura) {
  const d = AS_TIRAS[tipo], a = AS_ANIM[anim] || AS_ANIM.reposo, paso = a.t || (dura || 0.4) / a.f.length;
  let i = Math.floor(tiempo / paso);
  i = a.bucle ? i % a.f.length : Math.min(a.f.length - 1, i);
  const nombre = a.f[i], j = d.f.indexOf(nombre);
  return { i: j >= 0 ? j : 0, propio: j >= 0, fase: i, de: a.f.length };
}
// Pinta un muñeco con los pies en (x, y). u: { tipo, anim, tAnim, dura, destello, escala, alfa, lado }.
function asPintaMuneco(c, u, x, y, t) {
  if (!asHay(u.tipo)) return;
  const d = AS_TIRAS[u.tipo], esc = AS_PX * (u.escala || 1), w = d.w * esc, h = d.h * esc;
  const f = asCuadro(u.tipo, u.anim, u.tAnim || 0, u.dura);
  const hacia = u.lado === 'heroe' ? 1 : -1;
  // movimiento por código cuando falta el fotograma propio (y un poco siempre, para que no se vea rígido)
  let dx = 0, dy = 0, sx = 1, sy = 1, giro = 0;
  const fase = (u.tAnim || 0) + (u.id || 0) * 0.37;
  if (u.anim === 'reposo') { const r = Math.sin(fase * 3.2); if (!f.propio || d.f.length < 2) { sy = 1 + r * 0.03; sx = 1 - r * 0.02; } }
  else if (u.anim === 'andar') { if (!f.propio) { dy = -Math.abs(Math.sin(fase * 11)) * 3 * esc / 2; giro = Math.sin(fase * 11) * 0.06; } }
  else if (u.anim === 'ataque') {
    const p = Math.min(1, (u.tAnim || 0) / (u.dura || 0.4));
    if (!f.propio) {   // embestida: echarse atrás, lanzarse y volver
      const emb = p < 0.35 ? -p / 0.35 * 0.4 : p < 0.6 ? -0.4 + (p - 0.35) / 0.25 * 1.4 : 1 - (p - 0.6) / 0.4;
      dx = emb * 7 * hacia * esc / 2; giro = emb * 0.12 * hacia; sx = 1 + Math.max(0, emb) * 0.08; sy = 1 - Math.max(0, emb) * 0.05;
    }
  } else if (u.anim === 'golpe') { if (!f.propio) { dx = -3 * hacia; giro = -0.1 * hacia; } }
  else if (u.anim === 'muerte') { if (!f.propio) { const p = Math.min(1, (u.tAnim || 0) / 0.5); giro = -p * 1.4 * hacia; dy = p * 4; } }
  c.save();
  c.globalAlpha = u.alfa === undefined ? 1 : u.alfa;
  c.translate(Math.round(x + dx), Math.round(y + dy));
  // sombra
  c.fillStyle = 'rgba(60,30,10,0.28)'; c.beginPath(); c.ellipse(0, 0, w * 0.32, 4 * (u.escala || 1), 0, 0, Math.PI * 2); c.fill();
  c.rotate(giro); c.scale(sx, sy);
  c.imageSmoothingEnabled = false;
  c.drawImage(AS_IMG[u.tipo], f.i * d.w, 0, d.w, d.h, Math.round(-w / 2), Math.round(-h), w, h);
  if (u.destello > 0) { c.globalAlpha *= Math.min(1, u.destello * 6); c.drawImage(asBlanco(u.tipo), f.i * d.w, 0, d.w, d.h, Math.round(-w / 2), Math.round(-h), w, h); }
  c.restore();
}
// El alto en pantalla de un muñeco (para la barra de vida y los números)
function asAltoMuneco(tipo, escala) { return asHay(tipo) ? AS_TIRAS[tipo].h * AS_PX * (escala || 1) : 50; }
// Un retrato quieto (tienda, ventanas): el primer fotograma cabido en una caja de lado L
function asRetrato(c, tipo, cx, cy, L) {
  if (!asHay(tipo)) return;
  const d = AS_TIRAS[tipo], k = Math.max(1, Math.floor(Math.min(L / d.w, L / d.h)));
  c.imageSmoothingEnabled = false;
  c.drawImage(AS_IMG[tipo], 0, 0, d.w, d.h, Math.round(cx - d.w * k / 2), Math.round(cy - d.h * k / 2), d.w * k, d.h * k);
}
