// Fans of Jump · Los objetos que salen encima de algunos troncos (desde los 50 m) y se cogen al caer en ellos:
// · mirilla: 5 saltos en los que se ve el salto entero y dónde caes (también en el kit de sabotaje: 8 saltos)
// · imán: 10 s en los que las zanahorias de los troncos cercanos vienen solas
// · supersalto: 3 saltos que llegan mucho más lejos
// · escudo: la próxima vez que te pille la ola, la ola rebota y sigues
// También la vibración del móvil (vibra), que se quita en la hoja de reclamaciones.
'use strict';

const OBJETOS = {
  mirilla: { color: PASTEL.lila, txt: '¡Mirilla! {n} saltos', n: 5 },
  iman: { color: '#ff7a8a', txt: '¡Imán de zanahorias!', n: 10 },
  super: { color: PASTEL.oro, txt: '¡Supersalto! {n} saltos', n: 3 },
  escudo: { color: PASTEL.menta, txt: '¡Escudo contra el barro!', n: 1 },
};
const OBJETOS_RIO = ['mirilla', 'iman', 'super', 'escudo'];
const SUPER_LEJOS = 1.45;

const vibra = patron => { if (GUARDA.vibra && navigator.vibrate) try { navigator.vibrate(patron); } catch (e) { /* sin vibración */ } };

/* ---------- los iconos ---------- */
function iconoMirilla(x, y, r) {
  elipse(x, y, r, r, vol(x, y, r, r, PASTEL.lila), OLC, Math.max(0.5, r * 0.14));
  elipse(x, y, r * 0.62, r * 0.62, '#ffffff', null);
  const l = r * 0.14;
  for (const [a, b, c, d] of [[x - r * 0.95, y, x - r * 0.3, y], [x + r * 0.3, y, x + r * 0.95, y], [x, y - r * 0.95, x, y - r * 0.3], [x, y + r * 0.3, x, y + r * 0.95]]) trazo(a, b, c, d, l * 1.4, OLC, null);
  elipse(x, y, r * 0.18, r * 0.18, '#ff7aa8', null);
}
// el imán: una U roja con las puntas blancas
function iconoIman(x, y, r) {
  const w = r * 0.42;
  G.beginPath(); G.arc(x, y - r * 0.05, r * 0.72, 0, Math.PI); G.lineWidth = w + Math.max(0.5, r * 0.14) * 2; G.strokeStyle = OLC; G.lineCap = 'butt'; G.stroke();
  G.beginPath(); G.moveTo(x - r * 0.72, y - r * 0.75); G.lineTo(x - r * 0.72, y - r * 0.05); G.moveTo(x + r * 0.72, y - r * 0.75); G.lineTo(x + r * 0.72, y - r * 0.05); G.stroke();
  G.beginPath(); G.arc(x, y - r * 0.05, r * 0.72, 0, Math.PI); G.lineWidth = w; G.strokeStyle = '#ff5a6e'; G.stroke();
  G.beginPath(); G.moveTo(x - r * 0.72, y - r * 0.45); G.lineTo(x - r * 0.72, y - r * 0.05); G.moveTo(x + r * 0.72, y - r * 0.45); G.lineTo(x + r * 0.72, y - r * 0.05); G.stroke();
  G.beginPath(); G.moveTo(x - r * 0.72, y - r * 0.75); G.lineTo(x - r * 0.72, y - r * 0.45); G.moveTo(x + r * 0.72, y - r * 0.75); G.lineTo(x + r * 0.72, y - r * 0.45); G.strokeStyle = '#ffffff'; G.stroke();
}
// el supersalto: una bota con alas, en dorado (dos flechas hacia arriba)
function iconoSuper(x, y, r) {
  for (const d of [0.35, -0.35]) forma([x - r * 0.8, y + r * (0.45 + d), x, y + r * (-0.35 + d), x + r * 0.8, y + r * (0.45 + d), x + r * 0.45, y + r * (0.75 + d), x, y + r * (0.25 + d), x - r * 0.45, y + r * (0.75 + d)], vol(x, y, r, r, PASTEL.oro), OLC, Math.max(0.5, r * 0.13));
}
// el escudo: verde menta con un corazón
function iconoEscudo(x, y, r) {
  forma([x - r * 0.8, y - r * 0.75, x + r * 0.8, y - r * 0.75, x + r * 0.78, y + r * 0.05, x, y + r * 0.95, x - r * 0.78, y + r * 0.05], vol(x, y, r, r, PASTEL.menta), OLC, Math.max(0.5, r * 0.14));
  corazonForma(x, y - r * 0.05, r * 0.36, '#ff7aa8');
}
const ICONOS = { mirilla: iconoMirilla, iman: iconoIman, super: iconoSuper, escudo: iconoEscudo };
const iconoObjeto = (id, x, y, r) => ICONOS[id](x, y, r);

/* ---------- cogerlos y usarlos ---------- */
function cogeObjeto(t, x, wy) {
  const J = JUEGO, id = t.objeto, o = OBJETOS[id];
  t.objeto = null;
  if (id === 'escudo') J.escudo = true; else J[id] = (J[id] || 0) + o.n;
  aviso(tr(o.txt, { n: o.n }), x, wy + 30, o.color, 10); estrellas(x, wy); SONIDO.zana(); vibra(30);
}
// cada fotograma: el imán atrae las zanahorias cercanas y se gasta
function avanzaObjetos(dt) {
  const J = JUEGO, c = J.conejo;
  if (J.iman > 0) {
    J.iman = Math.max(0, J.iman - dt);
    for (const t of RIO.troncos) if (t.zanas && Math.hypot(t.x - c.x, t.wy - c.wy) < 90) cogeZanas(t, t.x, t.wy);
  }
}
// la ola te pilla: con el escudo, rebota
function usaEscudo() {
  const J = JUEGO, c = J.conejo;
  if (!J.escudo) return false;
  J.escudo = false; OLA.wy = c.wy - 130; OLA.pala = Math.min(OLA.pala, OLA.wy - 10);
  bandera(tr('¡El escudo aguanta!'), PASTEL.menta); salpica(PAN.W / 2, OLA.wy + 30, 20, '#9a6a40'); vibra([30, 40, 30]);
  return true;
}
// los que llevas, en el marcador (debajo de los metros)
function pintaObjetosMarcador() {
  const J = JUEGO, W = PAN.W;
  let y = 44;
  for (const id of OBJETOS_RIO) {
    const n = id === 'escudo' ? (J.escudo ? 1 : 0) : id === 'iman' ? Math.ceil(J.iman || 0) : J[id] || 0;
    if (!n) continue;
    iconoObjeto(id, W - 22, y, 4.5);
    if (id !== 'escudo') letras((id === 'iman' ? '' : '×') + n + (id === 'iman' ? ' s' : ''), W - 15, y + 0.5, 8, PASTEL.texto, { alin: 'left', borde: '#ffffff', bw: 2 });
    y += 12;
  }
}
