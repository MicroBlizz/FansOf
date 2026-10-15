// Fans of Rouflage · LOS EVENTOS DE CADA MAPA: la «gracia» propia de cada escenario durante la caza (los faros de un coche en el
// parking, la niebla de las cloacas, los aspersores del jardín, el vecino que se asoma, el carrito del hotel). Cada mapa dice cuál
// lleva (`evento` en defineMapa, con su configuración); el evento en sí está en EVENTOS, definido en el archivo de dibujo del mapa.
// El reloj es repetible: en el PvP sale de la semilla de la sala y en todos los navegadores pasa lo mismo a la misma hora de la caza.
// Un evento: { primero, cada, dura (segundos), nuevo(cfg, azar) → estado, empieza(est, azar, k), avanza(est, dt, t), termina(est),
//   focos(est, t) → [{ x, y, dir, ang, largo }] (luces que delatan), visibilidad(est, t) → 0..1 (lo lejos que ven las linternas),
//   pintaSuelo(c, est, t), pintaEncima(c, est, t) (bajo la oscuridad), pintaVelo(c, est, t) (por encima de todo) }
'use strict';

const EVENTOS = {};
const EV = { def: null, cfg: null, est: null, t: 0, en: false, tEn: 0, prox: 0, k: 0, azar: Math.random };

// mulberry32: azar repetible a partir de un número (el mismo que usa el PvP para repartir plazas)
const azarDe = semilla => { let a = (semilla | 0) + 91; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

// al empezar una partida (semilla: la de la sala en el PvP; al azar en solitario)
function eventosPrepara(semilla) {
  EV.def = null; EV.est = null; EV.en = false; EV.t = 0; EV.tEn = 0; EV.k = 0;
  EV.azar = azarDe(semilla === undefined ? (Math.random() * 2147483647) | 0 : semilla + 7);
  const cfg = MAPA_ACT && MAPA_ACT.evento; if (!cfg || !EVENTOS[cfg.tipo]) return;
  EV.def = EVENTOS[cfg.tipo]; EV.cfg = cfg; EV.est = EV.def.nuevo(cfg, EV.azar); EV.prox = EV.def.primero;
}
// cada paso de la caza: arranca el evento cuando toca y lo hace avanzar mientras dura
function eventosAvanza(dt) {
  if (!EV.def || J.fase !== 'caza') return;
  EV.t += dt;
  if (!EV.en && EV.t >= EV.prox) { EV.en = true; EV.tEn = 0; EV.def.empieza(EV.est, EV.azar, EV.k++); }
  if (EV.en) {
    EV.tEn += dt; EV.def.avanza(EV.est, dt, EV.tEn);
    if (EV.tEn >= EV.def.dura) { EV.en = false; if (EV.def.termina) EV.def.termina(EV.est); EV.prox = EV.t + EV.def.cada; }
  }
}
const eventoFocos = () => (EV.def && EV.en && EV.def.focos ? EV.def.focos(EV.est, EV.tEn) : []);
const eventoVisibilidad = () => (EV.def && EV.en && EV.def.visibilidad ? EV.def.visibilidad(EV.est, EV.tEn) : 1);
function eventosPintaSuelo(c, t) { if (EV.def && EV.def.pintaSuelo) EV.def.pintaSuelo(c, EV.est, EV.en ? EV.tEn : -1, t); }
function eventosPintaEncima(c, t) { if (EV.def && EV.def.pintaEncima) EV.def.pintaEncima(c, EV.est, EV.en ? EV.tEn : -1, t); }
function eventosPintaVelo(c, t) { if (EV.def && EV.def.pintaVelo) EV.def.pintaVelo(c, EV.est, EV.en ? EV.tEn : -1, t); }      // por encima de la oscuridad (la niebla)

// ¿alumbra algún foco de evento el punto (x, y)? (dentro del cono y sin muro en medio)
function focoAlumbra(x, y) {
  for (const f of eventoFocos()) {
    const d = lejos(f.x, f.y, x, y); if (d > f.largo) continue;
    if (Math.abs(giro(f.dir, Math.atan2(y - f.y, x - f.x))) > f.ang) continue;
    if (seVen(f.x, f.y, x, y)) return true;
  }
  return false;
}
// el abanico de un foco, para recortarlo de la oscuridad (como el de una linterna)
function abanicoFoco(f, pts) {
  pts.length = 0; pts.push(f.x, f.y);
  const n = 24;
  for (let k = 0; k <= n; k++) {
    const a = f.dir - f.ang + (2 * f.ang * k) / n, dx = Math.cos(a), dy = Math.sin(a);
    let d = rayo(f.x, f.y, dx, dy, f.largo);
    if (RAYO.cara && dy < -0.08) d = Math.min(f.largo, d + Math.min(76, 62 / -dy));
    pts.push(f.x + dx * d, f.y + dy * d);
  }
  return pts;
}

/* ---------- lo que un evento le puede hacer a alguien ---------- */
// ¿le toca a este personaje lo que pasa aquí? Solo a los que lleva este navegador: yo y, si soy el anfitrión (o juego solo), la máquina
const eventoLeToca = e => !e.fuera && !e.remoto && (e.jugador || (e.bot && (!J.pvp || rfpSoyAnfitrion())));
// quitarle a alguien parte de la pintura (de 0 a 1): manchas blancas grandes, como si se le hubiera corrido
function lavaPiel(e, cuanto) {
  const c = e.pctx; if (!c) return;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL); c.fillStyle = BLANCO_PIEL;
  for (let k = 0; k < 6 + cuanto * 10; k++) { c.beginPath(); c.ellipse(rand(4, CAJA_W - 4), rand(4, CAJA_H - 4), rand(5, 11), rand(6, 14), rand(0, TAU), 0, TAU); c.fill(); }
  c.restore(); e.pz = null;
}
// un colado al que le ha pasado algo (lavado, empujado): se descongela y tiene que volver a pintarse; los bots lo hacen solos
function eventoMolesta(e, texto) {
  if (!e.congelado) return;
  descongela(e);
  if (e.jugador) { avisa(texto, 'malo'); play('pop'); fxTexto(e.x, e.y - 70, tr('¡Ay!'), '#fff6ea'); }
  else if (e.bot) { e.bot.estado = 'pintar'; e.bot.t = 0; e.bot.tPinta = rand(1.5, 3.5); e.pintado = false; }
}
