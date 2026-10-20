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

/* ---------- los iconos (dibujos 3D del estudio: mirilla_icono, iman_icono, super_icono, escudo_icono) ---------- */
// el icono del objeto «id», centrado en (x, y) y de radio r (como mucho)
const iconoObjeto = (id, x, y, r) => spriteEnCaja(id + '_icono', x - r * 1.25, y - r * 1.25, r * 2.5, r * 2.5, 0);

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
