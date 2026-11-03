// Fans of Karts · PvP, LOS OBJETOS NUEVOS POR LA RED: como con el Nerf y el Parche, cada navegador decide solo lo que les pasa a SUS karts (el
// tuyo y los de la máquina que mueve si es el anfitrión). Las Bellotas y la MechaVaca se lanzan en todos los navegadores ('obj') y cada uno mira
// si le dan a los suyos; el Martillo, el Spam, el Lag y la Microtransacción se mandan como golpe ('golpe') al dueño del kart, que lo aplica
// (o lo para con su Reembolso o su Bot) y le cuenta al autor que ha dado ('dado').
'use strict';

const GOLPES_NUEVOS = ['trompo', 'spam', 'lag', 'micro'];
// el número con el que se conoce a un kart en la sala: tu orden, la plaza de la máquina o el orden del rival
const pvpIdKart = k => (k.esJugador ? KPVP.orden : k.plaza != null ? k.plaza : k.remoto ? k.remoto.orden : null);
function pvpKartDe(id) {
  const C = CARRERA; if (id === KPVP.orden) return C.jugador;
  return C.karts.find(x => x.plaza === id) || KPVP.remotos[id] || null;
}

// lanzas Bellotas o la MechaVaca: los demás las ven salir
function pvpLanzaNuevo(o, k) {
  if (!KPVP.activo || k.remoto) return;
  const r1 = n => Math.round(n * 10) / 10, de = k.plaza != null ? k.plaza : KPVP.orden;
  if (o.tipo === 'bellota') pvpManda({ t: 'obj', de, tipo: 'bellota', x: r1(o.x), y: r1(o.y), idx: Math.round(o.idx * 100) / 100, lat: r1(o.lat), dlat: o.dlat, vel: Math.round(o.vel), fase: o.fase });
  else if (o.tipo === 'vacaSuelo') pvpManda({ t: 'obj', de, tipo: 'vaca', a: pvpIdKart(o.objetivo) });
}

// lo que llega de los objetos nuevos: cada uno devuelve true si el mensaje era de un objeto nuevo (y lo atiende); si no, sigue la función de pvp.js
function pvpObjetoNuevo(m, k, C) {
  if (m.tipo !== 'bellota' && m.tipo !== 'vaca') return false;
  if (!k || k.rendido) return true;
  if (m.tipo === 'bellota') C.sueltos.push({ tipo: 'bellota', x: m.x, y: m.y, idx: m.idx, lat: m.lat, dlat: m.dlat, vel: m.vel, autor: k, vida: 3.2, alto: 2, fase: m.fase || 0, mueve: mueveBellota });
  else pvpLlegaVaca(m, k, C);
  return true;
}
function pvpLlegaVaca(m, k, C) {
  const obj = pvpKartDe(m.a); if (!obj) return;
  C.sueltos.push({ tipo: 'vacaSuelo', x: obj.x, y: obj.y, objetivo: obj, t: 1.6, z: 90, autor: k, vida: 2.4, alto: 0, fase: 0, mueve: mueveVaca, pinta: pintaVacaCae });
  play('horn');
  if (obj.esJugador) { aviso('¡MECHAVACA!', 'Mira arriba. No, más arriba.', '#ff8fc8'); comenta(trf('%1 ha llamado a la MechaVaca. Va a por ti.', k.nombre)); }
}
// un golpe de los objetos nuevos que va a uno de mis karts
function pvpGolpeNuevo(m, k) {
  if (!GOLPES_NUEVOS.includes(m.tipo)) return false;
  if (k && !k.rendido) pvpAplicaGolpeNuevo(m, k);
  return true;
}
// el aviso de que has dado con un objeto nuevo
const AVISO_DADO_NUEVO = {
  trompo: nom => { aviso('¡BANEADO!', trf('%1 fuera de la partida (un ratito).', nom), '#5ef27a'); play('laugh'); },
  spam: nom => aviso('¡SPAM!', trf('%1 está enterrado en ventanas.', nom), '#3a7de0'),
  lag: nom => aviso('LAG', trf('A %1 le va a tirones.', nom), '#5ef27a'),
  micro: nom => aviso('¡COBRADO!', trf('%1 ha pagado sin rechistar.', nom), '#5ef27a'),
};
function pvpDadoNuevo(m, k) {
  if (!GOLPES_NUEVOS.includes(m.tipo)) return false;
  if (!k || m.a !== KPVP.orden) return true;
  const nom = m.p && PILOTO[m.p] ? tr(PILOTO[m.p].nombre) : k.nombre;
  misionSuma('tocado');
  AVISO_DADO_NUEVO[m.tipo](nom);
  return true;
}

// un golpe nuevo que va a uno de mis karts (el mío o uno de la máquina que muevo)
function pvpAplicaGolpeNuevo(m, autor) {
  const C = CARRERA, v = m.a === KPVP.orden ? C.jugador : C.karts.find(x => x.plaza === m.a && !x.remoto && x.ia);
  if (!v || v.fin) return;
  const quien = m.q && PILOTO[m.q] ? tr(PILOTO[m.q].nombre) : autor.nombre, yo = v.esJugador;
  let dado = false;
  if (m.tipo === 'trompo') {
    if (!paraBot(v) && golpea(v, 'trompo', autor)) {
      dado = true;
      for (let i = 0; i < 12; i++) chispa(v.x, v.y, 8, azar(-50, 50), azar(-50, 50), azar(40, 90), 0.5, i & 1 ? '#e63946' : '#ffffff', 2);
      if (yo) { aviso('¡BANEADO!', 'Motivo: comportamiento sospechoso.', '#e63946'); comenta(trf('%1 te ha baneado. Puedes apelar en 30 días hábiles.', quien)); }
    }
  } else if (m.tipo === 'spam') {
    dado = true;
    if (yo) { SPAM.t = SPAM.dur; play('deny'); comenta(trf('%1 te ha suscrito a 40 boletines.', quien)); }
    else { v.tResbala = 0.9; v.giroRes = Math.random() < 0.5 ? -1 : 1; }
  } else if (m.tipo === 'lag') {
    if (!(v.tInmune > 0)) { dado = true; v.lag = { n: 3, t: 0.15 }; if (yo) aviso('LAG', 'Ping: 999 ms.', '#ff3348'); }
  } else if (m.tipo === 'micro') {
    const n = Math.min(3, v.monedas || 0);
    if (n) { dado = true; v.monedas -= n; if (yo) aviso('MICROTRANSACCIÓN', trf('%1 te ha cobrado %2 monedas.', quien, n), '#ffcb3d'); }
  }
  if (dado) pvpManda({ t: 'dado', tipo: m.tipo, a: m.de, p: yo ? undefined : v.piloto.id });
}
