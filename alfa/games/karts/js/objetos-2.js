// Fans of Karts · LOS OBJETOS NUEVOS (se suman a los de objetos.js y salen en la misma ruleta; también en el PvP, por la red: pvp-objetos.js):
//   ataque: Martillo de baneo (al de delante), Bellotas de MadSquirrel (tres, en abanico, rebotan) y MechaVaca (cae encima del primero)
//   molestar: Spam (ventanas emergentes a los de delante) y Lag (los de cerca dan saltos hacia atrás)
//   defensa: Reembolso (escudo de un golpe) y Bot de emparejamiento (se come el próximo proyectil)
//   velocidad y monedas: Tren del hype (te lleva solo, a tope), Influencer (atrae monedas) y Microtransacción (cobra 3 al de delante)
'use strict';

// ---------- a quién le toca ----------
// el que va delante más cerca (como mucho a `max` unidades)
function delanteDe(k, C, max) {
  let mejor = null, d0 = max / PASO_VIA;
  for (const o of C.karts) { if (o === k || o.fin || o.estado === 'cae') continue; const d = o.avance - k.avance; if (d > 0 && d < d0) { d0 = d; mejor = o; } }
  return mejor;
}
const cercaDe = (k, C, max) => C.karts.filter(o => o !== k && !o.fin && Math.hypot(o.x - k.x, o.y - k.y) < max);
const nombreDe = k => k.nombre || tr(k.piloto.nombre);
// el bot de emparejamiento se come lo que venga (proyectiles y martillazos)
function paraBot(k) {
  if (!(k.tBot > 0)) return false;
  k.tBot = 0; for (let i = 0; i < 10; i++) chispa(k.x, k.y, 6, azar(-40, 40), azar(-40, 40), azar(30, 80), 0.5, i & 1 ? '#22e3ff' : '#c3cbe0', 2);
  if (k.esJugador) aviso('¡BLOQUEADO!', 'Tu bot se ha comido el golpe.', '#22e3ff');
  suena(k, 'poof'); return true;
}

// ---------- lo que hace cada uno ----------
function usaMartillo(k, C, yo, quien) {
  k.tMartillo = 0.45; suena(k, 'golpe');
  const o = delanteDe(k, C, 34);
  if (!o || Math.abs(o.lat - k.lat) > 26) { if (yo) aviso('¡FALLO!', 'No había nadie a quien banear.', '#9aa0ad'); return; }
  if (paraBot(o)) return;
  if (golpea(o, 'trompo', k)) {
    for (let i = 0; i < 12; i++) chispa(o.x, o.y, 8, azar(-50, 50), azar(-50, 50), azar(40, 90), 0.5, i & 1 ? '#e63946' : '#ffffff', 2);
    if (o.esJugador) { aviso('¡BANEADO!', 'Motivo: comportamiento sospechoso.', '#e63946'); comenta(trf('%1 te ha baneado. Puedes apelar en 30 días hábiles.', quien)); }
    else if (yo) { aviso('¡BANEADO!', trf('%1 fuera de la partida (un ratito).', nombreDe(o)), '#5ef27a'); play('laugh'); }
  }
}
function usaBellotas(k, C, yo) {
  for (const d of [-1, 0, 1]) { const o = { tipo: 'bellota', x: k.x, y: k.y, idx: k.idx + 1.2, lat: k.lat + d * 4, dlat: d * 26, vel: Math.max(k.v, 60) + 95, autor: k, vida: 3.2, alto: 2, fase: d, mueve: mueveBellota }; C.sueltos.push(o); if (C.pvp) pvpLanzaNuevo(o, k); }
  suena(k, 'missile'); if (yo) comenta('MadSquirrel te presta sus bellotas. Las quiere de vuelta.');
}
function mueveBellota(o, C, dt) {
  const P = PISTA, N = P.N;
  o.idx += (o.vel * dt) / PASO_VIA; o.lat += o.dlat * dt;
  const i = ((Math.floor(o.idx) % N) + N) % N, t = o.idx - Math.floor(o.idx), a = P.via[i], b = P.via[(i + 1) % N];
  if (Math.abs(o.lat) > a.ancho / 2 - 3) { o.lat = Math.sign(o.lat) * (a.ancho / 2 - 3); o.dlat = -o.dlat; suena(o.autor, 'tick'); }      // rebota en el borde
  o.x = a.x + (b.x - a.x) * t - a.ty * o.lat; o.y = a.y + (b.y - a.y) * t + a.tx * o.lat;
  o.alto = 2 + Math.abs(Math.sin(o.vida * 9)) * 3;
  for (const k of C.karts) {
    if (k === o.autor || k.z > 6 || k.remoto) continue;      // al rival del PvP le da (o no) en su navegador
    if ((k.x - o.x) ** 2 + (k.y - o.y) ** 2 < 49) {
      if (!paraBot(k) && golpea(k, 'trompo', o.autor)) {
        if (k.esJugador) aviso('¡BELLOTAZO!', 'Cortesía de MadSquirrel.', '#c98a4b');
        else if (o.autor.esJugador) { aviso('¡BELLOTAZO!', nombreDe(k), '#5ef27a'); play('laugh'); }
      }
      o.vida = 0; return;
    }
  }
}
function usaVaca(k, C, yo, quien) {
  const obj = C.orden[0] === k ? C.orden[1] : C.orden[0];
  if (!obj) return;
  const o = { tipo: 'vacaSuelo', x: obj.x, y: obj.y, objetivo: obj, t: 1.6, z: 90, autor: k, vida: 2.4, alto: 0, fase: 0, mueve: mueveVaca, pinta: pintaVacaCae };
  C.sueltos.push(o); if (C.pvp) pvpLanzaNuevo(o, k);
  play('horn');
  if (obj.esJugador) { aviso('¡MECHAVACA!', 'Mira arriba. No, más arriba.', '#ff8fc8'); comenta(trf('%1 ha llamado a la MechaVaca. Va a por ti.', quien)); }
  else if (yo) aviso('¡MECHAVACA!', trf('Rumbo a %1.', nombreDe(obj)), '#ff8fc8');
}
function mueveVaca(o, C, dt) {
  o.t -= dt;
  if (o.t > 0) { o.x = o.objetivo.x; o.y = o.objetivo.y; o.z = 90 * Math.min(1, o.t / 0.7); return; }      // sigue al objetivo y baja
  if (!o.aterriza) {
    o.aterriza = true; o.z = 0; play('golpe');
    for (let i = 0; i < 16; i++) chispa(o.x, o.y, 2, azar(-60, 60), azar(-60, 60), azar(30, 90), 0.6, i & 1 ? '#ff8fc8' : '#ffffff', 2.4);
    for (const k of C.karts) if (Math.hypot(k.x - o.x, k.y - o.y) < 16 && k !== o.autor && !k.remoto) {
      if (golpea(k, k === o.objetivo ? 'parado' : 'trompo', o.autor) && k.esJugador) aviso('¡MUUU!', 'La MechaVaca ha aterrizado encima.', '#ff8fc8');
    }
  }
}
function pintaVacaCae(o, sx, sy, e) {
  const sombra = o.t > 0 ? 1 - Math.min(1, o.t / 1.6) : 1;
  if (e > 0.3) pintaSombra(sx, sy, 22 * (0.4 + sombra * 0.6) * e);
  figCosa('vacaSuelo').pinta(lx, Math.round(sx), Math.round(sy - o.z * e), e * 1.3, BASE_COSA, RELOJ * 3);
}
const SPAM = { t: 0, dur: 2.6 };      // las ventanas tapan tu pantalla 2,6 s
function usaSpam(k, C, yo, quien) {
  let n = 0;
  for (const o of C.karts) if (o !== k && o.avance > k.avance && !o.fin) {
    n++;
    if (o.remoto) pvpGolpeaRemoto(o, 'spam', k);
    else if (o.esJugador) { SPAM.t = SPAM.dur; play('deny'); comenta(trf('%1 te ha suscrito a 40 boletines.', quien)); }
    else { o.tResbala = 0.9; o.giroRes = Math.random() < 0.5 ? -1 : 1; }
  }
  if (yo) aviso('¡SPAM!', n ? 'Los de delante, enterrados en ventanas.' : 'No había nadie delante.', '#3a7de0');
}
function usaLag(k, C, yo) {
  let n = 0;
  for (const o of cercaDe(k, C, 75)) { n++; if (o.remoto) { pvpGolpeaRemoto(o, 'lag', k); continue; } o.lag = { n: 3, t: 0.15 }; if (o.esJugador) aviso('LAG', 'Ping: 999 ms.', '#ff3348'); }
  if (yo) aviso('LAG', n ? 'Los de cerca van a tirones.' : 'Nadie cerca. El lag es solo tuyo.', '#5ef27a');
}
function usaReembolso(k, C, yo) { k.escudo = 10; suena(k, 'premio'); if (yo) comenta('Reembolso activado: el próximo golpe se devuelve. Plazo: 10 segundos.'); }
function usaBot(k, C, yo) { k.tBot = 14; suena(k, 'premio'); if (yo) comenta('Bot de emparejamiento: te acompaña y se come lo que venga. No habla.'); }
function usaTren(k, C, yo) {
  k.tTren = 4; k.tInmune = Math.max(k.tInmune, 4.4); daTurbo(k, 4, 1.42, true);
  if (yo && !k.ia) { creaIA(k, 1.2, 0); k.ia.tSalida = 0; k.trenLleva = true; }
  if (yo) { aviso('¡TREN DEL HYPE!', 'Siéntate y disfruta. Conduce el marketing.', '#ff3df0'); play('hype'); }
}
function usaIman(k, C, yo) { k.tIman = 6; suena(k, 'premio'); if (yo) comenta('Influencer: las monedas vienen solas. Como los seguidores.'); }
function usaMicro(k, C, yo, quien) {
  const o = delanteDe(k, C, 400);
  if (!o || !o.monedas) { if (yo) aviso('MICROTRANSACCIÓN', 'Rechazada: el de delante no tiene saldo.', '#9aa0ad'); return; }
  const n = Math.min(3, o.monedas); o.monedas -= n; if (o.remoto) pvpGolpeaRemoto(o, 'micro', k);      // el rival se lo descuenta en su navegador k.monedas = Math.min(AJ.maxMonedas, k.monedas + n);
  for (let i = 0; i < n * 3; i++) chispa(o.x, o.y, 6, (k.x - o.x) * 1.4 + azar(-12, 12), (k.y - o.y) * 1.4 + azar(-12, 12), azar(30, 60), 0.7, '#ffcb3d', 2);
  suena(k, 'moneda');
  if (o.esJugador) { aviso('MICROTRANSACCIÓN', trf('%1 te ha cobrado %2 monedas.', quien, n), '#ffcb3d'); }
  else if (yo) aviso('¡COBRADO!', trf('+%1 monedas de %2', n, nombreDe(o)), '#5ef27a');
}

// ---------- cuándo los usa la máquina ----------
const iaDelante = max => (k, C) => { const o = delanteDe(k, C, max); return !!o && Math.abs(o.lat - k.lat) < 30; };
const iaVarios = (n, max) => (k, C) => C.karts.filter(o => o !== k && !o.fin && o.avance > k.avance && (o.avance - k.avance) * PASO_VIA < max).length >= n;
const iaRecta = k => PISTA.curvaS[(Math.floor(k.idx) + 6) % PISTA.N] < 0.006;

// ---------- la lista (se añade a la ruleta) ----------
const OBJETOS_2 = {
  martillo: { nombre: 'Martillo de baneo', fig: 'martillo', reparto: [10, 12, 8], usa: usaMartillo, ia: iaDelante(30) },
  bellotas: { nombre: 'Bellotas', fig: 'bellota', reparto: [8, 12, 12], usa: usaBellotas, ia: iaDelante(70) },
  vaca: { nombre: 'MechaVaca', fig: 'vacaSuelo', reparto: [0, 2, 10], usa: usaVaca },
  spam: { nombre: 'Spam', fig: 'spam', reparto: [0, 4, 5], usa: usaSpam, ia: iaVarios(2, 260) },      // la máquina, solo con al menos dos delante y cerca
  lag: { nombre: 'Lag', fig: 'lag', reparto: [4, 8, 8], usa: usaLag, ia: (k, C) => cercaDe(k, C, 60).length > 0 },
  reembolso: { nombre: 'Reembolso', fig: 'reembolso', reparto: [14, 8, 4], usa: usaReembolso },
  bot: { nombre: 'Bot', fig: 'botmini', reparto: [10, 8, 4], usa: usaBot },
  tren: { nombre: 'Tren del hype', fig: 'tren', reparto: [0, 0, 10], usa: usaTren, ia: iaRecta },
  iman: { nombre: 'Influencer', fig: 'influencer', reparto: [10, 10, 8], usa: usaIman },
  micro: { nombre: 'Microtransacción', fig: 'tarjeta', reparto: [4, 10, 10], usa: usaMicro, ia: iaDelante(400) },
};
for (const [id, o] of Object.entries(OBJETOS_2)) { OBJETOS[id] = Object.assign({ nuevo: true }, o); REPARTO[id] = o.reparto; LISTA_OBJETOS.push(id); }

// ---------- el escudo del reembolso y el bot (antes de que un golpe cuente) ----------
const golpeaSinEscudo = golpea;
golpea = (k, tipo, autor) => {
  if (k.tInmune > 0 || k.estado === 'cae' || k.fin) return false;
  if (k.escudo > 0) {
    k.escudo = 0; k.monedas = Math.min(AJ.maxMonedas, k.monedas + 1);
    for (let i = 0; i < 12; i++) chispa(k.x, k.y, 5, azar(-40, 40), azar(-40, 40), azar(30, 70), 0.5, i & 1 ? '#5ef27a' : '#ffffff', 2);
    if (k.esJugador) aviso('¡REEMBOLSADO!', 'Ese golpe no cuenta. Y te devolvemos una moneda.', '#5ef27a');
    suena(k, 'premio'); k.tInmune = 0.8; return false;
  }
  if (tipo === 'nerf' && paraBot(k)) return false;
  return golpeaSinEscudo(k, tipo, autor);
};

// ---------- cada paso de la carrera: los efectos que duran ----------
function pasoObjetos2(C, dt) {
  if (SPAM.t > 0) SPAM.t -= dt;
  for (const k of C.karts) {
    if (k.escudo > 0) k.escudo -= dt;
    if (k.tBot > 0) k.tBot -= dt;
    if (k.tMartillo > 0) k.tMartillo -= dt;
    if (k.tTren > 0) {
      k.tTren -= dt;
      if (Math.random() < 0.7) chispa(k.x - Math.cos(k.ang) * 7, k.y - Math.sin(k.ang) * 7, 6, azar(-14, 14), azar(-14, 14), azar(20, 50), 0.5, Math.random() < 0.5 ? '#ff3df0' : '#ffe14d', 2.6, 30);
      if (k.tTren <= 0 && k.trenLleva) { k.trenLleva = false; if (!k.fin && !PANT.auto) k.ia = null; }
    }
    if (k.lag) {
      k.lag.t -= dt;
      if (k.lag.t <= 0) {
        const nx = k.x - Math.cos(k.dir) * 9, ny = k.y - Math.sin(k.dir) * 9, s = supEn(PISTA, nx, ny);
        if (!ES_MURO(s) && s !== S_VACIO) { k.x = nx; k.y = ny; }
        for (let i = 0; i < 5; i++) chispa(k.x, k.y, 6, azar(-20, 20), azar(-20, 20), azar(10, 30), 0.3, i & 1 ? '#ff3348' : '#22e3ff', 2.2, 20);
        k.lag.n--; k.lag.t = 0.4; if (k.lag.n <= 0) k.lag = null;
      }
    }
    if (k.tIman > 0) {
      k.tIman -= dt;
      for (const m of PISTA.monedas) if (m.t <= 0 && Math.hypot(m.x - k.x, m.y - k.y) < 48) {
        m.t = 9; if (k.monedas < AJ.maxMonedas) k.monedas++; suena(k, 'moneda');
        for (let i = 0; i < 4; i++) chispa(m.x, m.y, 4, (k.x - m.x) * 2, (k.y - m.y) * 2, azar(20, 40), 0.35, '#ffcb3d', 2);
      }
    }
  }
}

// ---------- lo que se ve: el bot que da vueltas y el martillazo (la burbuja, el lag, el influencer y el tren: efectos-objetos.js) ----------
const pintaKartSinExtras = pintaKart;
pintaKart = (k, sx, sy, e) => {
  pintaKartSinExtras(k, sx, sy, e);
  if (k.tBot > 0) { const a = RELOJ * 4 + k.idx; figCosa('botmini').pinta(lx, Math.round(sx + Math.cos(a) * 11 * e), Math.round(sy - (2 + Math.abs(Math.sin(a * 2))) * e), e * 0.8, BASE_COSA, a); }
  if (k.tMartillo > 0) figCosa('martillo').pinta(lx, Math.round(sx), Math.round(sy - (k.z + 18) * e), e * 1.2, BASE_COSA, (0.45 - k.tMartillo) * 14);
};

// ---------- el spam en tu pantalla (encima del marcador) ----------
const VENTANAS_SPAM = [['¡OFERTA!', 'Solo hoy: aire.'], ['ACTUALIZA YA', '48 GB. Ahora no.'], ['1 MENSAJE NUEVO', 'Es publicidad.'], ['¡HAS GANADO!', 'Haz clic. O no.']];
function pintaEfectos(C) {
  if (SPAM.t <= 0) return;
  const t = SPAM.dur - SPAM.t;
  VENTANAS_SPAM.forEach(([a, b], i) => {
    if (t < i * 0.35 || SPAM.t < (3 - i) * 0.25) return;
    const x = [26, 120, 40, 132][i], y = [44, 58, 92, 100][i], w = 98, h = 30;
    marco(x, y, w, h, '#f4f4f8', '#1c1028', '#a8b0c8');
    lx.fillStyle = '#3a7de0'; lx.fillRect(x + 2, y + 2, w - 4, 8);
    mini(lx, tr(a), x + 4, y + 3, '#ffffff');
    lx.fillStyle = '#e63946'; lx.fillRect(x + w - 10, y + 2, 8, 8); mini(lx, 'X', x + w - 7, y + 3, '#ffffff');
    mini(lx, tr(b), x + w / 2, y + 17, '#2b2d3a', null, 'centro');
  });
}
