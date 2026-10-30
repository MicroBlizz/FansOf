// Fans of Goose · Cada tierra se JUEGA distinto, no solo se ve distinto: su enemigo propio y su regla. Bosque (tutorial), Pantano
// (el barro te frena; ranas que explotan en charco), Cementerio (las ocas vuelven de la tumba si no coges su pluma; el cuervo roba
// plumas), Aldea (ocas con antorcha que dejan fuego; gordas de dos en dos), Catacumbas (oscuridad: solo ves alrededor del farol) y
// Castillo (ocas armadura, solo por la espalda; albatros en abanico). Al cambiar de tierra, un MINIJEFE guarda la puerta (js/minijefes.js).
// Cada partida trae además una MALDICIÓN al azar y baraja las casillas especiales dentro de su tierra.
'use strict';

const TIERRAS = {
  bosque:     { regla: '', enemigo: null },
  pantano:    { regla: 'El barro te frena. Las ranas explotan en charco', enemigo: 'rana', prob: 0.12 },
  cementerio: { regla: 'Las ocas resucitan si no coges su pluma. El cuervo te las roba', enemigo: 'cuervo', prob: 0.1 },
  aldea:      { regla: 'Las ocas aldeanas dejan fuego. Las gordas vienen de dos en dos', enemigo: 'antorcha', prob: 0.2 },
  catacumbas: { regla: 'Oscuridad: solo ves lo que alumbra tu farol', enemigo: null },
  castillo:   { regla: 'Las ocas armadura solo se hieren por la espalda', enemigo: 'armadura', prob: 0.2 },
};
const tierraActual = () => biomaDe(JUEGO.casilla).id;
const enTierra = id => tierraActual() === id;

// --- las maldiciones de partida (una al azar al empezar) ---
const MALDICIONES = [
  { id: 'ninguna', nombre: 'Noche tranquila', desc: 'Sin maldición. Disfrútalo.', peso: 3 },
  { id: 'prisa', nombre: 'Ocas con prisa', desc: 'Las ocas van un 30 % más rápido.', peso: 2 },
  { id: 'sinposada', nombre: 'Posada cerrada', desc: 'La Posada está cerrada: ni cura ni tienda.', peso: 2 },
  { id: 'sinseis', nombre: 'Dado cojo', desc: 'El dado nunca saca un 6.', peso: 2 },
  { id: 'derrumbe', nombre: 'Tablero podrido', desc: 'El derrumbe va más deprisa.', peso: 2 },
  { id: 'avaro', nombre: 'Bolsillos rotos', desc: 'La mitad de monedas, pero el doble de plumas.', peso: 1 },
  { id: 'niebla', nombre: 'Niebla eterna', desc: 'Todo el tablero a oscuras, como en las Catacumbas.', peso: 1 },
];
function eligeMaldicion() {
  const total = MALDICIONES.reduce((s, m) => s + m.peso, 0); let r = azar() * total;
  for (const m of MALDICIONES) { r -= m.peso; if (r <= 0) return m; }
  return MALDICIONES[0];
}
const maldita = id => !!(JUEGO.maldicion && JUEGO.maldicion.id === id);

// --- las casillas especiales se barajan dentro de su tierra (las ocas y el Jardín no se mueven) ---
function barajaCasillas() {
  const C = JUEGO.casillas = {};
  const libre = new Set(); for (let t = 2; t < CFG.jardin - 1; t++) libre.add(t);
  for (const t in CFG.ocaSalta) { libre.delete(+t); libre.delete(CFG.ocaSalta[t]); }
  for (const t of CFG.ocasAdorno) libre.delete(t);
  const toma = (a, b) => { const c = []; for (let t = a; t <= b; t++) if (libre.has(t)) c.push(t); const t = c[(azar() * c.length) | 0]; libre.delete(t); return t; };
  C.puenteDe = toma(4, 8); C.puenteA = C.puenteDe + 6; libre.delete(C.puenteA);
  C.pozo = toma(14, 20); C.dado1 = toma(24, 29); C.posada = toma(30, 35); C.laberinto = toma(40, 46); C.carcel = toma(47, 53); C.dado2 = toma(48, 55);
  C.muerte = 58;
  // las puertas de las tierras: la primera casilla de cada una (del Pantano en adelante) trae un minijefe
  C.puertas = BIOMAS.slice(1).map(b => b.desde);
  JUEGO.extra = {};   // las casillas de los caminos (js/caminos.js), que se ponen al elegir en cada cruce
}
// las consultas que usa el resto del juego (antes miraban CFG a secas)
const casillaEs = {
  pozo: t => t === JUEGO.casillas.pozo, posada: t => t === JUEGO.casillas.posada, carcel: t => t === JUEGO.casillas.carcel,
  laberinto: t => t === JUEGO.casillas.laberinto, dado: t => t === JUEGO.casillas.dado1 || t === JUEGO.casillas.dado2,
  puente: t => t === JUEGO.casillas.puenteDe, puerta: t => JUEGO.casillas.puertas.includes(t), muerte: t => t === CFG.muerte,
};

// --- las reglas en marcha ---
function avanzaTierras(dt) {
  const J = JUEGO, yo = J.yo;
  // Cementerio: las ocas muertas resucitan si su pluma sigue en el suelo 3 s
  if (enTierra('cementerio')) {
    const l = PLUMAS.lista;
    for (let i = 0; i < PLUMAS.n; i++) {
      const p = l[i]; if (p.tipo !== 'xp' || p.atraida || p.t < 3 || p.resu) continue;
      p.resu = true; const e = creaEnemigo('oca', p.x, p.y); if (e) { e.hp = e.hpMax *= 0.6; e.caida = 0.4; estallido(p.x, p.y, 6, '#5a6b5a', 40, 0.5, 2, 3, 40); }
      if (Math.random() < 0.4) SONIDO.muerte();
    }
  }
  // Aldea: el fuego que dejan las antorchas
  if (J.fuegos) for (let i = J.fuegos.length - 1; i >= 0; i--) {
    const f = J.fuegos[i]; f.t -= dt; if (f.t <= 0) { J.fuegos.splice(i, 1); continue; }
    if ((J.cuadro & 3) === 0) particula(f.x + (Math.random() - 0.5) * 10, f.y, (Math.random() - 0.5) * 10, -30, 0.5, 2, Math.random() < 0.5 ? '#ff7a2a' : '#ffd34d', -20, 0);
    if (J.invul <= 0 && Math.hypot(yo.x - f.x, yo.y - f.y) < 9) heridaJugador(6, f.x, f.y + 10);
  }
}
const velTierra = () => (enTierra('pantano') && JUEGO.fase === 'parado' ? 0.82 : 1);   // el barro
const velOcas = () => (maldita('prisa') ? 1.3 : 1);

// qué enemigo sale en esta tierra (lo llama avanzaOleadas)
function enemigoDeTierra() {
  const T = TIERRAS[tierraActual()]; if (T && T.enemigo && Math.random() < T.prob) return T.enemigo;
  const pAlb = JUEGO.casilla >= 6 ? Math.min(0.28, 0.06 + JUEGO.casilla * 0.007) : 0;
  return Math.random() < pAlb ? 'albatros' : 'oca';
}

// el movimiento y el ataque de los enemigos propios de cada tierra. Devuelve [qx, qy] (hacia dónde quiere ir) o null si no es suyo
function muevePropio(e, dt, ux, uy, d) {
  const J = JUEGO, yo = J.yo;
  const nuevo = mueveTierras2(e, dt, ux, uy, d); if (nuevo) return nuevo;   // las de las tierras nuevas (js/tierras2.js)
  if (e.tipo === 'rana') {   // salta a ratos
    e.cd -= dt; if (e.cd <= 0) { e.cd = 1.1 + Math.random() * 0.6; e.kx += ux * 120; e.ky += uy * 120; e.f2 = 0.35; }
    e.f2 -= dt; return [0, 0];
  }
  if (e.tipo === 'cuervo') {   // va a por la pluma más cercana; si la coge, se la lleva volando
    if (e.fase === 1) { e.y -= 90 * dt; e.x += Math.sin(e.t * 5) * 30 * dt; if (e.y < J.camY - 40) e.hp = 0; return [0, 0]; }
    let mejor = null, md = 1e9; const l = PLUMAS.lista;
    for (let i = 0; i < PLUMAS.n; i++) { const p = l[i]; if (p.tipo !== 'xp') continue; const dd = (p.x - e.x) ** 2 + (p.y - e.y) ** 2; if (dd < md) { md = dd; mejor = p; } }
    if (!mejor) return [ux, uy];
    if (md < 36) { mejor.valor = 0; mejor.tipo = 'robada'; e.fase = 1; texto(e.x, e.y - 10, tr('¡Te la roba!'), '#9fe0ff', 6, 0.8); }
    const dd = Math.sqrt(md) || 1; return [(mejor.x - e.x) / dd, (mejor.y - e.y) / dd];
  }
  if (e.tipo === 'antorcha') {   // deja fuego por donde pasa
    e.cd -= dt; if (e.cd <= 0) { e.cd = 0.5; if (!J.fuegos) J.fuegos = []; if (J.fuegos.length < 40) J.fuegos.push({ x: e.x, y: e.y + 6, t: 3 }); }
    return [ux, uy];
  }
  if (e.tipo === 'armadura') { e.mira = ux; return [ux * 0.8, uy * 0.8]; }   // lento, recuerda hacia dónde mira
  return null;
}
// la oca armadura solo se hiere por la espalda (lo mira danar)
function escudoArmadura(e, nx, ny) {
  if (e.tipo !== 'armadura') return 1;
  const yo = JUEGO.yo, ux = (yo.x - e.x), uy = (yo.y - e.y), d = Math.hypot(ux, uy) || 1;
  // el golpe viene de donde está el jugador: si el jugador está delante (hacia donde mira la oca), el escudo lo para
  const frente = (e.mira || 1) * ux / d; return frente > 0.2 ? 0.1 : 1;
}
// al morir: la rana explota en charco tóxico
function muerePropio(e) {
  muereTierras2(e);
  if (e.tipo === 'rana') { let malos = 0; for (let i = 0; i < CHARCOS.n; i++) if (CHARCOS.lista[i].malo) malos++; const c = malos < 4 ? CHARCOS.saca() : null; if (c) { c.x = e.x; c.y = e.y; c.r = 12; c.vida = 2.2; c.dps = 0; c.tic = 0; c.malo = true; } estallido(e.x, e.y, 10, '#8fd36b', 70, 0.5, 2.5, 0); }
}
// los charcos de las ranas te hacen daño a ti (los tuyos, a las ocas)
function charcosMalos(dt) {
  const J = JUEGO, yo = J.yo, l = CHARCOS.lista;
  for (let i = 0; i < CHARCOS.n; i++) { const c = l[i]; if (c.malo && J.invul <= 0 && Math.hypot(yo.x - c.x, yo.y - c.y) < c.r * 0.8) { heridaJugador(4, c.x, c.y + 10); J.invul = Math.max(J.invul, 0.5); } }
}

// --- la oscuridad de las Catacumbas (y la maldición de niebla): solo ves alrededor del farol ---
let OSCURO = null;
function pintaOscuridad() {
  const J = JUEGO;
  if (!(enTierra('catacumbas') || maldita('niebla')) || J.modo !== 'juego') return;
  const W = PAN.W, H = PAN.H, k = PAN.k;
  if (!OSCURO || OSCURO.width !== W * k) { OSCURO = lienzo(W * k, H * k); }
  const o = OSCURO.getContext('2d'); o.setTransform(k, 0, 0, k, 0, 0); o.clearRect(0, 0, W, H);
  o.fillStyle = 'rgba(2,1,6,.93)'; o.fillRect(0, 0, W, H);
  o.globalCompositeOperation = 'destination-out';
  const x = J.yo.x, y = J.yo.y - J.camY, r = (maldita('niebla') && !enTierra('catacumbas') ? 60 : 52) + Math.sin(J.t * 7) * 2;
  // la luz del farol, en anillos de píxeles (cada anillo quita un poco más de oscuridad)
  const anillos = r2 => { for (let q = 0; q < 5; q++) discoEn(o, x, y, r2 * (1 - q * 0.14), 0.45); };
  anillos(r);
  const L = ADORNOS[J.casilla] || [];
  for (const a of L) if (a.vela) for (let q = 0; q < 3; q++) discoEn(o, a.x, a.y - J.camY, 16 * (1 - q * 0.25), 0.35);
  o.globalCompositeOperation = 'source-over';
  G.drawImage(OSCURO, 0, 0, W, H);
}

function pintaFuegos() {
  const J = JUEGO; if (!J.fuegos) return;
  for (const f of J.fuegos) { const s = 0.6 + Math.sin(J.t * 20 + f.x) * 0.2; G.fillStyle = '#ff7a2a'; G.fillRect(f.x - 4 * s, f.y - 5 * s, 8 * s, 6 * s); G.fillStyle = '#ffd34d'; G.fillRect(f.x - 2 * s, f.y - 3 * s, 4 * s, 3 * s); }
}
