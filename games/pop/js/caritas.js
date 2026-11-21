// Fans of Pop · las caritas de las burbujas (tarea #110): con el estilo del mundo, la burbuja levantada está despierta y parpadea
// a su ritmo; la hundida se duerme («u u» y una z que sube). Dominio puro arriba (el tiempo entra como parámetro), dibujo abajo.
'use strict';

const PP_CARITA = Object.freeze({ parpadeo: 0.15, periodoMin: 2.5, periodoMax: 5.5, zPorSegundo: 0.6 });

/* ---------- dominio: sin reloj, azar ni DOM ---------- */
// un número entre 0 y 1 fijo para cada burbuja (hash entero de i y una sal)
function ppHashCarita(i, sal) {
  let x = Math.imul(((i | 0) + 1) ^ sal, 0x9e3779b1);
  x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
  return (x >>> 0) % 10007 / 10007;
}
// apertura de los ojos de la burbuja i en el segundo t: 1 abiertos, 0 cerrados (un parpadeo corto cada 2,5–5,5 s)
function ppParpadeo(i, t) {
  const periodo = PP_CARITA.periodoMin + ppHashCarita(i, 0x51) * (PP_CARITA.periodoMax - PP_CARITA.periodoMin);
  const desfase = ppHashCarita(i, 0xa7) * periodo;
  const fase = (((t + desfase) % periodo) + periodo) % periodo, mitad = PP_CARITA.parpadeo / 2;
  if (fase >= PP_CARITA.parpadeo) return 1;
  return Math.min(1, Math.abs(fase - mitad) / mitad);
}
// qué cara lleva: despierta la levantada, dormida la hundida; ninguna en la doble/triple, con amigo atrapado o especial (o trampa)
function ppCaraDe(up, conAmigo, especial) {
  if (conAmigo || especial) return null;
  if (up === 1) return 'despierta';
  if (up === 0) return 'dormida';
  return null;
}

/* ---------- dibujo ---------- */
function ppCaritaOjo(c, x, y, r, abre, color = '#3a1a1a') {
  const alto = r * Math.max(0.12, abre);
  c.beginPath(); c.ellipse(x, y, r * 0.8, alto, 0, 0, Math.PI * 2); c.fillStyle = color; c.fill();
  if (abre > 0.5) { c.beginPath(); c.arc(x - r * 0.25, y - alto * 0.4, r * 0.28, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); }
}
function ppCaritaColoretes(c, r) {
  c.fillStyle = 'rgba(255,120,150,0.55)';
  for (const lado of [-1, 1]) { c.beginPath(); c.ellipse(lado * r * 0.62, r * 0.22, r * 0.2, r * 0.12, 0, 0, Math.PI * 2); c.fill(); }
}
function ppCaritaDespierta(c, r, abre) {
  ppCaritaColoretes(c, r);
  ppCaritaOjo(c, -r * 0.36, -r * 0.08, r * 0.2, abre); ppCaritaOjo(c, r * 0.36, -r * 0.08, r * 0.2, abre);
  c.beginPath(); c.arc(0, r * 0.12, r * 0.2, Math.PI * 0.15, Math.PI * 0.85); c.lineWidth = Math.max(2, r * 0.1); c.strokeStyle = '#3a1a1a'; c.stroke();
}
// la z dibujada con trazos (no es texto): sube y se desvanece en bucle
function ppCaritaZ(c, r, k) {
  const s = r * 0.16 * (0.7 + 0.5 * k), x = r * 0.55 + k * r * 0.2, y = -r * 0.35 - k * r * 0.7;
  c.save(); c.globalAlpha = 1 - k; c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x - s, y - s); c.lineTo(x + s, y - s); c.lineTo(x - s, y + s); c.lineTo(x + s, y + s);
  c.lineWidth = Math.max(3, r * 0.14); c.strokeStyle = '#3a1a1a'; c.stroke();
  c.lineWidth = Math.max(1.5, r * 0.06); c.strokeStyle = '#fff'; c.stroke();
  c.restore();
}
function ppCaritaDormida(c, r, t, i) {
  ppCaritaColoretes(c, r);
  c.lineWidth = Math.max(2, r * 0.09); c.strokeStyle = '#3a1a1a'; c.lineCap = 'round';
  for (const lado of [-1, 1]) { c.beginPath(); c.arc(lado * r * 0.36, -r * 0.1, r * 0.14, Math.PI * 0.1, Math.PI * 0.9); c.stroke(); }
  c.beginPath(); c.ellipse(0, r * 0.18, r * 0.07, r * 0.05, 0, 0, Math.PI * 2); c.fillStyle = '#3a1a1a'; c.fill();
  ppCaritaZ(c, r, (((t * PP_CARITA.zPorSegundo + ppHashCarita(i, 0x3c)) % 1) + 1) % 1);
}
// la carita en (cx, cy) con radio r; abre = apertura de los ojos (ppParpadeo)
function ppPintaCarita(c, cx, cy, r, cara, abre, t, i = 0) {
  if (!cara) return;
  c.save(); c.translate(cx, cy);
  if (cara === 'despierta') ppCaritaDespierta(c, r, abre);
  else ppCaritaDormida(c, r, t, i);
  c.restore();
}
// dónde va la cara según el estilo del mundo (js/estilo-mundo.js): [desplazamiento vertical, radio], en radios de la burbuja.
// 'tapa' = sobre la tapa de arriba del macaron (visto de lado); 'centro' = en medio del botón (visto desde arriba)
const PP_CARITA_SITIO = Object.freeze({
  tapa: Object.freeze({ arriba: [-0.32, 0.55], abajo: [-0.34, 0.48] }),
  centro: Object.freeze({ arriba: [0.03, 0.74], abajo: [0.08, 0.64] }),
});
// la cara ya colocada: variada (una distinta por burbuja y nivel, js/caritas-variadas.js) o la de siempre
function ppCaritaSegunEstilo(c, y, r, cara, i, T, t, caritas) {
  if (caritas && caritas.variadas) {
    const tinta = cara === 'dormida' && caritas.tintaPulsada ? caritas.tintaPulsada : PP_CARA_TINTA;   // el botón pulsado es oscuro
    ppPintaCaraVariada(c, 0, y, r, ppCaraVariada(cara, i, T.d ? T.d.g : 0), ppParpadeo(i, t), t, i, tinta);
  }
  else ppPintaCarita(c, 0, y, r, cara, ppParpadeo(i, t), t, i);
}
// la carita de la burbuja i del tablero T, en el sitio que dice el estilo de su mundo y siguiendo su animación (ppBurbuja)
function ppCaritaEnBurbuja(c, cx, cy, r, i, T, t, caritas = null) {
  const cara = ppCaraDe(T.up[i], !!T.slimes[i], !!(T.esp && T.esp[i]) || T.trampas.has(i));   // la trampa lleva su «!»: sin cara
  if (!cara) return;
  const [sx, sy, h] = ppAnim(i, T.up[i]), sitio = PP_CARITA_SITIO[caritas ? caritas.sitio : 'tapa'];
  c.save(); c.translate(cx, cy);
  if (h > 0.05) {
    const rr = r * (0.85 + 0.15 * h);
    c.scale(sx, sy); ppCaritaSegunEstilo(c, -4 * h + rr * sitio.arriba[0], rr * sitio.arriba[1], cara, i, T, t, caritas);
  } else {
    c.scale(sx, 1); ppCaritaSegunEstilo(c, r * sitio.abajo[0], r * sitio.abajo[1], cara, i, T, t, caritas);
  }
  c.restore();
}
