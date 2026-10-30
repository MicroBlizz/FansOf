// Fans of Karts (prototipo) · LA ESCENA: pinta lo que hay de pie sobre la pista en este instante (adornos, carteles, monedas, regalos,
// karts, Nerfs y Parches), cada cosa en su sitio y a su tamaño. La cámara va detrás del kart del jugador y tarda un pelín en girar.
'use strict';

function pintaCosa(c, sx, sy, e, d) {
  if (c.dmin && d < c.dmin) return;      // el arco de meta, al pasar por debajo, no tapa la pantalla
  if (c.soloAbajo && CAPA_VISTA !== 'abajo') return;      // el puente visto desde abajo (desde encima se pisa, no se ve)
  if (c.cartel) {
    // de cerca, a cuadraditos; de lejos se suaviza para que las letras no se deshagan
    const s = c.cartel, f = e / BASE_CARTEL, w = Math.round(s.w * f), h = Math.round(s.h * f);
    if (h >= 3) { lx.imageSmoothingEnabled = f < 0.95; lx.drawImage(s.c, Math.round(sx - w / 2), Math.round(sy - h), w, h); lx.imageSmoothingEnabled = false; }
    return;
  }
  if (c.cae) { pintaCaida(c, sx, sy, e); return; }
  if (c.baila) { pintaVaca(c, sx, sy, e); return; }      // la MechaVaca mascota (bichos.js)
  const fl = c.flota ? (c.flota + Math.sin(RELOJ * 2.2 + c.fase) * 1.2) * e : 0;
  if (c.r && e > 0.5) pintaSombra(sx, sy, c.fig.def.medio * 1.5 * e);
  c.fig.pinta(lx, Math.round(sx), Math.round(sy - fl), e, BASE_COSA, 0);
}
function pintaMoneda(m, sx, sy, e) {
  if (e > 0.5) pintaSombra(sx, sy, 4.5 * e);
  figCosa('moneda').pinta(lx, Math.round(sx), Math.round(sy - (1.6 + Math.sin(RELOJ * 4 + m.fase) * 0.7) * e), e, BASE_COSA, RELOJ * 3.2 + m.fase);
}
function pintaRegalo(c, sx, sy, e) {
  if (e > 0.5) pintaSombra(sx, sy, 6 * e);
  figCosa(envoltorio() + c.col).pinta(lx, Math.round(sx), Math.round(sy - (2.4 + Math.sin(RELOJ * 3 + c.fase) * 1.1) * e), e, BASE_COSA, 0);
}
function pintaSuelto(o, sx, sy, e) {   // un Nerf volando o un Parche en el suelo
  if (o.pinta) { o.pinta(o, sx, sy, e); return; }      // los nuevos con su propio dibujo (objetos-2.js)
  if (e > 0.5) pintaSombra(sx, sy, 5 * e);
  figCosa(o.tipo).pinta(lx, Math.round(sx), Math.round(sy - (o.alto || 0) * e), e, BASE_COSA, RELOJ * (o.tipo === 'nerf' ? 9 : 2.4) + o.fase);
}
function pintaKart(k, sx, sy, e) {
  if (k.tInmune > 0 && k.estado === 'normal' && ((RELOJ * 15) & 1)) return;             // parpadea mientras no se le puede dar
  const ee = e * k.tam, alza = alzaPuente(k);
  if (alza === null) return;      // va por debajo del puente y lo miras desde arriba
  if (alza) sy -= alza * e;
  if (k.estado !== 'cae') pintaSombra(sx, sy, 11.5 * ee * (1 - Math.min(0.45, k.z * 0.02)));
  const rel = k.angVis - Math.atan2(k.y - CAM.y, k.x - CAM.x);
  k.fig.pinta(lx, Math.round(sx), Math.round(sy - k.z * e), ee, BASE_KART, -rel);
  // lo que lleva encima: el cono de «en mantenimiento», el reloj de la cola o el dron que lo devuelve a la pista
  const arriba = sy - (k.z + 17 * k.tam) * e;
  if (k.estado === 'parado') figCosa('cono').pinta(lx, Math.round(sx), Math.round(arriba), e * 0.8, BASE_COSA, 0);
  else if (k.tCola > 0) figCosa('reloj').pinta(lx, Math.round(sx), Math.round(arriba), e * 0.8, BASE_COSA, RELOJ * 5);
  else if (k.tDron > 0) figCosa('dron').pinta(lx, Math.round(sx), Math.round(arriba + 4 * e), e, BASE_COSA, 0);
  // el nombre del que va justo delante del jugador (para saber a quién se persigue)
  if (e > 0.9 && e < 2.8 && k.puesto === CARRERA.jugador.puesto - 1 && k.estado === 'normal' && CARRERA.estado === 'corre') enUI(f => mini(lx, k.nombre || k.piloto.corto, Math.round(sx * f), Math.round(arriba * f - 7), '#ffffff', '#1c1028', 'centro'));
}

// ---------- la cámara: detrás del jugador; sigue su giro con un poco de retraso y se abre en los derrapes ----------
const VISTA = { ang: 0, listo: false };
function sigueCamara(k, dt) {
  const meta = k.ang - k.derrape * 0.16;
  if (!VISTA.listo) { VISTA.ang = meta; VISTA.listo = true; VISTA.hz = HZ; }
  VISTA.ang += difAng(VISTA.ang, meta) * Math.min(1, dt * (k.estado === 'trompo' ? 3 : 9));
  ponCamara(k.x - Math.cos(VISTA.ang) * CAM_ATRAS, k.y - Math.sin(VISTA.ang) * CAM_ATRAS, VISTA.ang);
  // las cuestas: si la pista de delante sube más que la de aquí, el horizonte sube (y al revés). Solo se ve: el suelo sigue siendo un plano.
  const P = PISTA, f = k.idx / P.N, aqui = pendiente(P, f), alante = (pendiente(P, f + 60 / P.largo) + pendiente(P, f + 120 / P.largo)) / 2;
  VISTA.hz = (VISTA.hz === undefined ? HZ : VISTA.hz) + (HZ - (alante - aqui) * FOCO * 1.6 - (VISTA.hz === undefined ? HZ : VISTA.hz)) * Math.min(1, dt * 4);
  HZV = limita(Math.round(VISTA.hz), HZ - 14, HZ + 12);
}
// la altura de la pista en un punto de la vuelta (colinas suaves; cada pista dice cuántas y cómo de altas) y su pendiente
function alturaPista(P, f) { const c = P.def.colinas, b = P.puente ? alturaPuente(P, f) : 0; if (!c) return b; return b + c.a * (0.6 * Math.sin(TAU * f * c.n1 + c.p1) + 0.4 * Math.sin(TAU * f * c.n2 + c.p2)); }
function pendiente(P, f) { const d = 8 / P.largo; return (alturaPista(P, f + d) - alturaPista(P, f - d)) / 16; }

// ---------- todo lo que se ve en la carrera ----------
function pintaCarrera(P, C) {
  puenteAntesDePintar(P, C.jugador);      // el suelo del cruce según el piso del jugador (puente.js)
  pintaMundo(P, RELOJ);
  pintaVoladores(P);
  for (const c of P.cosas) apunta(c.x, c.y, pintaCosa, c, c.fig ? c.fig.def.medio : 20);
  for (const m of P.monedas) if (m.t <= 0) apunta(m.x, m.y, pintaMoneda, m, 4);
  for (const c of P.regalos) if (c.t <= 0) apunta(c.x, c.y, pintaRegalo, c, 5);
  for (const o of C.sueltos) apunta(o.x, o.y, pintaSuelto, o, 5);
  for (const k of C.karts) apunta(k.x, k.y, pintaKart, k, 10);
  if (C.fantasmas && C.fantasmas.length) pintaFantasmas(C);
  apuntaMariposas(P, C.karts);      // bichos.js      // la contrarreloj (crono.js)
  pintaVistos();
  pintaChispas();
  modoUI();
}
