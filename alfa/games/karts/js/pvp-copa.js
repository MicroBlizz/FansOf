// Fans of Karts · PvP, LA COPA ONLINE (salas con amigos: el anfitrión elige COPA DE 4 CARRERAS): la pista votada y las otras tres de su
// mundo, en el mismo canal de la sala. Los puntos se cuentan en cada navegador con lo que ha visto (los de la copa de siempre). Al acabar
// una carrera, el anfitrión (el de menor número que siga) pasa a la siguiente: con su botón o solo a los 20 s; si se ha ido, cualquiera a
// los 35 s. Solo la primera carrera va al servidor (las salas con amigos no dan puntos de liga). Ganar la copa da 150 de oro.
'use strict';

const KCOPA = { espera: 20, esperaCualquiera: 35, premio: 150 };
// la pista votada primero y luego las otras de su mundo
function pvpPistasCopa(id) {
  const d = PISTAS.find(p => p.id === id); if (!d) return [id];
  return [id, ...pistasDe(d.mundo - 1, !!d.premium).map(p => p.id).filter(x => x !== id)].slice(0, 4);
}
const pvpSoyAnfitrionCopa = () => KPVP.orden === Math.min(...KPVP.jugadores.filter(j => j.orden === KPVP.orden || !KPVP.salidos[j.orden]).map(j => j.orden));
const pvpCopaFin = () => !!KPVP.copa && KPVP.carrera >= KPVP.copa.pistas.length - 1 && !KPVP.activo;

// al acabar cada carrera online: las misiones y, en la copa, sus puntos
const abreResultadosSinRed = abreResultados;
abreResultados = () => {
  const C = CARRERA;
  if (C.pvp) {
    const yo = C.orden.indexOf(C.jugador) + 1;
    misionSuma('carreras'); if (yo === 1) misionSuma('gana'); if (yo <= 3) misionSuma('podio');
    if (KPVP.copa) pvpCopaSuma(C);
  }
  abreResultadosSinRed();
};
function pvpCopaSuma(C) {
  const Q = KPVP.copa; if (Q.sumada === KPVP.carrera) return;
  Q.sumada = KPVP.carrera; Q.ultimos = {}; Q.tSig = 0; Q.nombres = Q.nombres || {};
  C.orden.forEach((k, i) => {
    const id = pvpIdKart(k); if (id == null) return;
    const p = PUNTOS_COPA[i] || 0;
    Q.puntos[id] = (Q.puntos[id] || 0) + p; Q.ultimos[id] = p;
    Q.nombres[id] = { nombre: k.esJugador ? null : k.nombre || tr(k.piloto.nombre), piloto: k.piloto.id, yo: k.esJugador };
  });
}
// quien se va en plena copa (o se queda sin red) ya no cuenta para elegir anfitrión
const pvpTerminaSinCopa = pvpTermina;
pvpTermina = () => { if (KPVP.salidos) for (const k of pvpRivales()) if (k.ido) KPVP.salidos[k.remoto.orden] = true; pvpTerminaSinCopa(); };

// ---------- pasar a la siguiente ----------
function pvpCopaSiguiente() {
  if (!KPVP.copa || KPVP.activo || pvpCopaFin()) return;
  const i = KPVP.carrera + 1;
  [0, 250, 500].forEach(ms => setTimeout(() => pvpManda({ t: 'sigue', i }), ms));      // por si se pierde uno
  pvpCopaInicia(i);
}
function pvpCopaSigue(i) {
  if (!KPVP.copa || !(i > KPVP.carrera) || i >= KPVP.copa.pistas.length) return;
  if (PANT.id === 'resultado' || PANT.id === 'pvp-copa') pvpCopaInicia(i); else KPVP.copaPendiente = i;      // aún en la meta: en cuanto veas los resultados
}
function pvpCopaInicia(i) {
  const Q = KPVP.copa; KPVP.copaPendiente = null; Q.tSig = 0;
  KPVP.carrera = i;
  Object.assign(KPVP, { activo: true, listoYo: false, listos: {}, salida: false, tEnvio: 0, tEspera: 0, n: 0, cerrado: false, resultado: null, remotos: {} });
  pvpReparte({ semilla: (KPVP.semilla | 0) + i * 7919 });
  const ip = PISTAS.findIndex(p => p.id === Q.pistas[i]); PANT.pista = ip >= 0 ? ip : 0;
  musica('menu'); empiezaCarga();
}
// cada fotograma (pvp-sala.js): la cuenta para seguir
function pvpCopaPaso(dt) {
  const Q = KPVP.copa;
  if (!Q || KPVP.activo || !KPVP.canal || (PANT.id !== 'resultado' && PANT.id !== 'pvp-copa')) return;
  Q.tSig = (Q.tSig || 0) + dt;
  if (KPVP.copaPendiente != null && Q.tSig > 3) { pvpCopaInicia(KPVP.copaPendiente); return; }
  if (pvpCopaFin()) return;
  if ((pvpSoyAnfitrionCopa() && Q.tSig > KCOPA.espera) || Q.tSig > KCOPA.esperaCualquiera) pvpCopaSiguiente();
}
// salir de la sala (desde los resultados o la copa)
function pvpSalirSala() {
  if (KPVP.copa && !pvpCopaFin()) { pvpManda({ t: 'rendir' }); pvpManda({ t: 'rendir' }); }
  musica('menu'); KPVP.copa = null; pvpCierraCanal(); ve('pvp');
}
function pvpOtraCarrera() {
  musica('menu'); KPVP.copa = null; pvpCierraCanal();
  if (KPVP.privada) { KPVP.error = ''; ve('pvp-amigos'); } else { ve('pvp'); pvpBuscar(); }
}
// los botones de los resultados del PvP
function pvpBotonesResultado() {
  if (KPVP.copa) {
    boton(pvpCopaFin() ? 'COPA: FINAL' : 'VER LA COPA', 4, 144, 114, () => ve('pvp-copa'), 13, '#5ef27a');
    boton('SALIR', 122, 144, 114, pvpSalirSala, 13);
  } else {
    boton(KPVP.privada ? 'OTRA SALA' : 'OTRA CARRERA', 4, 144, 114, pvpOtraCarrera, 13, '#ff5c8a');
    boton('MENÚ', 122, 144, 114, pvpSalirSala, 13);
  }
}

// ---------- la clasificación de la copa ----------
function pantallaPvpCopa() {
  const Q = KPVP.copa; if (!Q) { ve('pvp'); return; }
  paseo(18, 34); velo(0.7); marco(4, 4, 232, 136);
  const fin = pvpCopaFin(), N = Q.pistas.length;
  escribeB(lx, tr(fin ? 'COPA ONLINE: FINAL' : 'COPA ONLINE'), PW / 2, 8, '#5ef27a', '#1c1028', 'centro');
  mini(lx, trf('CARRERA %1 DE %2', KPVP.carrera + 1, N), PW / 2, 20, '#ffffff', '#1c1028', 'centro');
  const T = Object.entries(Q.puntos).map(([id, p]) => ({ id, p, n: Q.nombres[id], mas: Q.ultimos[id] || 0 })).sort((a, b) => b.p - a.p);
  T.slice(0, 8).forEach((t, i) => {
    const y = 30 + i * 11;
    if (t.n.yo) { lx.fillStyle = '#4a2f72'; lx.fillRect(8, y - 2, 224, 11); }
    escribe(lx, puestoTxt(i + 1), 12, y, COLOR_PUESTO[Math.min(i, 3)], '#1c1028');
    lx.fillStyle = (PILOTO[t.n.piloto] || PILOTO.ceo).color; lx.fillRect(36, y + 1, 4, 5);
    escribe(lx, t.n.yo ? tr('TÚ') : String(t.n.nombre || '').slice(0, 14), 44, y, t.n.yo ? '#ffffff' : '#d8d2ea', '#1c1028');
    if (t.mas) mini(lx, '+' + t.mas, 190, y + 1, '#5ef27a', null, 'der');
    escribe(lx, String(t.p), 226, y, '#ffcb3d', '#1c1028', 'der');
  });
  if (fin) {
    const yo = T.findIndex(t => t.n.yo) + 1;
    if (!Q.premiado) { Q.premiado = true; if (yo === 1) { avisaPremio('¡COPA ONLINE!', [daPremio({ oro: KCOPA.premio })], '#5ef27a'); guardaPartida(); } }
    mini(lx, yo === 1 ? tr('¡Copa tuya! Microblizz ya está preparando el nerf.') : trf('Has quedado %1 en la copa.', puestoTxt(yo)), PW / 2, 124, '#ffe9a8', '#1c1028', 'centro');
    boton(KPVP.privada ? 'OTRA SALA' : 'OTRA CARRERA', 4, 144, 114, pvpOtraCarrera, 13, '#ff5c8a');
    boton('MENÚ', 122, 144, 114, pvpSalirSala, 13);
  } else {
    const sig = PISTAS.find(p => p.id === Q.pistas[KPVP.carrera + 1]), anf = pvpSoyAnfitrionCopa();
    mini(lx, trf('SIGUIENTE: %1', sig ? tr(sig.nombre) : '?'), PW / 2, 120, '#ffe9a8', '#1c1028', 'centro');
    mini(lx, anf ? trf('Sigue sola en %1 s', Math.max(0, Math.ceil(KCOPA.espera - (Q.tSig || 0)))) : tr('El anfitrión decide cuándo seguir.'), PW / 2, 129, '#bdb6d6', '#1c1028', 'centro');
    boton('SALIR', 4, 144, 72, pvpSalirSala, 13);
    boton('RESULTADOS', 80, 144, 72, () => ve('resultado'), 13);
    if (anf) boton('SIGUIENTE', 156, 144, 80, pvpCopaSiguiente, 13, '#5ef27a');
  }
  PANT.atras = () => ve('resultado');
}
