// Fans of Jump · Los objetos que salen encima de algunos troncos (desde los 50 m) y se cogen al caer en ellos:
// · mirilla: 5 saltos en los que se ve el salto entero y dónde caes (también en el kit de sabotaje: 8 saltos)
// · imán: 10 s en los que las zanahorias de los troncos cercanos vienen solas
// · supersalto: 3 saltos que llegan mucho más lejos
// · escudo: la próxima vez que te pille la ola, la ola rebota y sigues
// · reloj de arena: 5 s a cámara lenta (la ola y los troncos van despacio)
// · cohete zanahoria: te lanza solo cuatro troncos más allá, con estela de fuego
// · estrella arcoíris: enciende la Fiebre arcoíris al momento
// · silbato: los amigos atrapados cerca (hasta 3) saltan solos hasta ti y se suben a cuestas
// También la vibración del móvil (vibra), que se quita en la hoja de reclamaciones.
'use strict';

const OBJETOS = {
  mirilla: { color: PASTEL.lila, txt: '¡Mirilla! {n} saltos', n: 5 },
  iman: { color: '#ff7a8a', txt: '¡Imán de zanahorias!', n: 10 },
  super: { color: PASTEL.oro, txt: '¡Supersalto! {n} saltos', n: 3 },
  escudo: { color: PASTEL.menta, txt: '¡Escudo contra el barro!', n: 1 },
  reloj: { color: '#9fe3ff', txt: '¡Cámara lenta!', n: 5 },
  cohete: { color: '#ff9a3c', txt: '¡Cohete zanahoria!', n: 1 },
  estrella: { color: '#ff9ac8', txt: '¡Estrella arcoíris!', n: 1 },
  silbato: { color: PASTEL.oro, txt: '¡Silbato! Vienen tus amigos', n: 1 },
};
const OBJETOS_RIO = ['mirilla', 'iman', 'super', 'escudo', 'reloj', 'cohete', 'estrella', 'silbato'];
const VIENEN = [];   // los amigos que vienen volando al tocar el silbato
const SUPER_LEJOS = 1.45;

const vibra = patron => { if (GUARDA.vibra && navigator.vibrate) try { navigator.vibrate(patron); } catch (e) { /* sin vibración */ } };

/* ---------- los iconos (dibujos 3D del estudio: mirilla_icono, iman_icono, super_icono, escudo_icono) ---------- */
// el icono del objeto «id», centrado en (x, y) y de radio r (como mucho)
const iconoObjeto = (id, x, y, r) => spriteEnCaja(id + '_icono', x - r * 1.25, y - r * 1.25, r * 2.5, r * 2.5, 0);

/* ---------- cogerlos y usarlos ---------- */
function cogeObjeto(t, x, wy) {
  const J = JUEGO, id = t.objeto, o = OBJETOS[id];
  t.objeto = null;
  if (id === 'escudo') J.escudo = true;
  else if (id === 'cohete') J.cohete = true;   // sale en cuanto estés quieto en el tronco (avanzaObjetos)
  else if (id === 'estrella') { if (J.fiebre > 0) J.fiebre = FIEBRE_SEG; else enciendeFiebre(); J.cadena = Math.max(J.cadena, 3); }
  else if (id === 'silbato') tocaSilbato();
  else J[id] = (J[id] || 0) + o.n;
  aviso(tr(o.txt, { n: o.n }), x, wy + 30, o.color, 10); estrellas(x, wy); SONIDO.zana(); vibra(30);
}
// el silbato: hasta 3 amigos atrapados por delante salen volando hacia ti
function tocaSilbato() {
  const J = JUEGO, c = J.conejo;
  RIO.troncos.filter(t => t.amigo && t.wy > c.wy && t.wy < c.wy + 320).sort((a, b) => a.wy - b.wy).slice(0, 3).forEach((t, i) => {
    VIENEN.push({ id: t.amigo, x: t.x, wy: t.wy, t: -i * 0.15 }); t.amigo = null;
  });
  SONIDO.silbato();
}
// el cohete: un salto enorme hasta el tronco que está unos cuatro más allá
function lanzaCohete() {
  const J = JUEGO, c = J.conejo;
  const t = RIO.troncos.filter(o => troncoPisable(o) && !o.final && o.wy > c.wy + 170 && o.wy < c.wy + 300).sort((a, b) => Math.abs(a.wy - c.wy - 240) + Math.abs(a.x - c.x) * 0.5 - Math.abs(b.wy - c.wy - 240) - Math.abs(b.x - c.x) * 0.5)[0];
  J.cohete = false;
  if (!t) return;
  c.salto = { x0: c.x, wy0: c.wy, x1: t.x, wy1: t.wy, t: 0, T: 1.1, alto: 60, cohete: true };
  if (c.tronco) { c.tronco.hunde = 1; onda(c.x, c.wy, c.tronco.r); }
  c.tronco = null; c.ang = giroDe(Math.atan2(t.x - c.x, t.wy - c.wy));
  SONIDO.cohete(); vibra([20, 20, 60]); J.temblor = GUARDA.suave ? 0 : 0.15;
}
// cada fotograma: el imán atrae las zanahorias cercanas y se gasta; el cohete despega; los del silbato llegan
function avanzaObjetos(dt) {
  const J = JUEGO, c = J.conejo;
  if (J.cohete && c.tronco && !c.salto) lanzaCohete();
  if (c.salto && c.salto.cohete && Math.random() < dt * 40) FX.push({ t: 'estrella', x: c.x + azar(-3, 3), wy: c.wy - 4, vx: azar(-10, 10), vy: -30, r: azar(1.5, 2.6), giro: 0, color: Math.random() < 0.5 ? '#ffd84a' : '#ff7a1a', v: 0.5, v0: 0.5 });
  for (const v of VIENEN) {
    v.t += dt / 0.7;
    if (v.t >= 1 && !v.llego) {
      v.llego = true;
      J.cuestas.push(v.id); J.rescatados++; if (!J.liberados.includes(v.id)) J.liberados.push(v.id); J.maxCuestas = Math.max(J.maxCuestas, J.cuestas.length);
      GUARDA.visto[v.id] = true; aviso(tr('¡{n}!', { n: nombreAmigo(v.id) }), c.x, c.wy + 40, '#9fe3ff', 12); corazones(c.x, c.wy + 10); SONIDO.rescate();
    }
  }
  for (let i = VIENEN.length - 1; i >= 0; i--) if (VIENEN[i].llego) VIENEN.splice(i, 1);
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
  for (const id of ['mirilla', 'iman', 'super', 'escudo', 'reloj']) {
    const seg = id === 'iman' || id === 'reloj', n = id === 'escudo' ? (J.escudo ? 1 : 0) : seg ? Math.ceil(J[id] || 0) : J[id] || 0;
    if (!n) continue;
    iconoObjeto(id, W - 22, y, 4.5);
    if (id !== 'escudo') letras((seg ? '' : '×') + n + (seg ? ' s' : ''), W - 15, y + 0.5, 8, PASTEL.texto, { alin: 'left', borde: '#ffffff', bw: 2 });
    y += 12;
  }
}
// los amigos del silbato, volando en arco hasta tu espalda
function pintaVienen() {
  const c = JUEGO.conejo;
  for (const v of VIENEN) {
    const k = Math.max(0, Math.min(1, v.t)), e = k * k * (3 - 2 * k), x = v.x + (c.x - v.x) * e, wy = v.wy + (c.wy - v.wy) * e;
    if (v.t >= 0) sprite(v.id + '_anima' + (Math.floor(k * 8) % 2), x, pantY(wy) - Math.sin(Math.PI * k) * 40, 10, Math.sin(k * 12) * 0.2);
  }
}
