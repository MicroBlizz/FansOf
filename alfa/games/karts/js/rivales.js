// Fans of Karts (prototipo) · LOS RIVALES: cómo conduce la máquina. Cada rival sigue la vía por su carril (que cambia de vez en cuando),
// apunta a un punto unos metros por delante, frena antes de las curvas que no puede tomar a esa velocidad y esquiva al kart que tiene
// delante. La «goma elástica» (C.goma) hace que corran un poco más si el jugador se escapa y un poco menos si se queda atrás, para que
// la carrera esté siempre reñida. Los de Microblizz (el CEO y SurvivalBot) son los más fuertes.
'use strict';

const IA = {
  nivel: { ceo: 1, survivalbot: 0.985 },      // el resto, entre 0.9 y 0.965 (se reparte al azar en cada carrera)
};
// los tres niveles (se eligen al escoger pista): cuánto corren los rivales y cómo es su goma elástica.
//   goma: [lo que frenan como mucho si van por delante de ti, lo que aprietan como mucho si van por detrás]
//   dist: a cuántas unidades de ti llega la goma a ese tope (cuanto más corta, más pegados van todos al jugador)
//   barandilla: las pistas sin borde (la Nube) llevan barandilla en todas partes
//   abanico: cuánto se separan los rivales flojos de los fuertes (en el nivel fácil, los flojos son muy flojos: se les puede ganar sin derrapar)
const DIFICULTADES = [
  { nombre: 'BECARIO', nivel: 0.8, abanico: 2.6, goma: [0.7, 1.02], dist: 480, barandilla: true },
  { nombre: 'EMPLEADO', nivel: 0.94, abanico: 1.3, goma: [0.78, 1.06], dist: 900, barandilla: false },
  { nombre: 'CEO', nivel: 1, abanico: 1, goma: [0.9, 1.1], dist: 1500, barandilla: false },
];
// en el PvP todos corren con el nivel del medio: así la pista (sin barandillas) y la máquina son iguales para todos
const nivelDif = () => (typeof KPVP !== 'undefined' && KPVP.activo ? 1 : limita(AJUSTES.dificultad | 0, 0, 2));
const dificultad = () => DIFICULTADES[nivelDif()];
function gomaDe(gap) {     // gap: unidades que el rival le saca al jugador (negativo si va por detrás)
  const d = dificultad(), f = limita(Math.abs(gap) / d.dist, 0, 1);
  return gap > 0 ? 1 - (1 - d.goma[0]) * f : 1 + (d.goma[1] - 1) * f;
}
// la curvatura de la vía, suavizada (para saber cuánto hay que frenar antes de cada curva)
function preparaIA(P) {
  const N = P.N; P.curvaS = new Float32Array(N);
  for (let i = 0; i < N; i++) { let s = 0; for (let d = -2; d <= 2; d++) s += P.via[(i + d + N) % N].curva; P.curvaS[i] = Math.abs(s / 5); }
}
function creaIA(k, nivel, i) {
  const d = dificultad();
  nivel = d.nivel * (1 - (1 - nivel) * d.abanico);
  k.ia = { nivel, factor: nivel, carril: (i % 2 ? 0.2 : -0.2), carrilMeta: (i % 2 ? 0.2 : -0.2), tCarril: 1 + Math.random() * 2, tUsa: 0, tSalida: 0.08 + Math.random() * 0.4, torpe: 0 };
}
function piensa(k, dt, C) {
  const P = PISTA, ia = k.ia, c = k.c, N = P.N, i0 = Math.floor(k.idx);
  c.salta = false; c.derrapa = false; c.usa = false;
  if (C.estado !== 'corre' && C.estado !== 'meta') { c.gas = false; c.freno = false; c.giro = 0; return; }
  if (ia.tSalida > 0) { ia.tSalida -= dt; c.gas = false; c.giro = 0; return; }
  // el carril: cambia cada pocos segundos; si hay un kart justo delante, se aparta hacia el lado con más sitio
  ia.tCarril -= dt;
  if (ia.tCarril <= 0) { ia.tCarril = 1.6 + Math.random() * 3; ia.carrilMeta = (Math.random() - 0.5) * 0.58; }
  for (const o of C.karts) {
    if (o === k) continue;
    let d = o.idx - k.idx; if (d < -N / 2) d += N; else if (d > N / 2) d -= N;
    if (d > 0.3 && d < 4.5 && Math.abs(o.lat - k.lat) < 9 && o.v < k.v + 6) { ia.carrilMeta = limita(k.lat / P.via[i0].ancho + (o.lat > k.lat ? -0.3 : 0.3), -0.34, 0.34); ia.tCarril = 1.2; }
  }
  // los Parches del suelo también se esquivan (si los ve a tiempo)
  for (const o of C.sueltos) {
    if (o.tipo !== 'parche') continue;
    let d = o.idx - k.idx; if (d < -N / 2) d += N; else if (d > N / 2) d -= N;
    if (d > 0 && d < 7 && Math.abs(o.lat - k.lat) < 8) { ia.carrilMeta = limita((o.lat + (o.lat > k.lat ? -17 : 17)) / P.via[i0].ancho, -0.36, 0.36); ia.tCarril = 1; }
  }
  ia.carril = acerca(ia.carril, ia.carrilMeta, dt * 0.45);
  // a dónde apunta: un punto de la vía por delante (más lejos cuanto más corre), en su carril
  const lejos = 3 + Math.abs(k.v) / 24, j = (i0 + Math.round(lejos)) % N, v = P.via[j];
  const tx = v.x - v.ty * ia.carril * v.ancho, ty = v.y + v.tx * ia.carril * v.ancho;
  const err = difAng(k.ang, Math.atan2(ty - k.y, tx - k.x));
  c.giro = limita(err * 2.8, -1, 1);
  // la curva más cerrada que viene: no entrar más rápido de lo que el kart puede girar
  let curva = 0; for (let d = 1; d <= 10; d++) { const q = P.curvaS[(i0 + d) % N]; if (q > curva) curva = q; }
  const vCurva = curva > 0.003 ? (k.giroMax * 0.7 * 0.97) / curva : 999;
  const tope = Math.max(40, vCurva * Math.min(1, ia.factor + 0.03));      // en los niveles fáciles también entran más despacio a las curvas
  c.gas = k.v < tope; c.freno = k.v > tope + 16 && k.z <= 0;
  if (Math.abs(err) > 1.3 && k.v > 30) { c.gas = false; }       // muy cruzado (después de un golpe): levanta el pie para enderezarse
  iaUsa(k, dt, C);
}
