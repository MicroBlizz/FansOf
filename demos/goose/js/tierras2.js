// Fans of Goose · TIERRAS AL AZAR: hay más tierras de las que caben en el tablero. El Bosque abre siempre y el Castillo cierra siempre;
// las cuatro del medio (casillas 11, 21, 31 y 41) salen cada partida al azar y en otro orden de entre las que tengas abiertas: las
// cuatro de siempre (Pantano, Cementerio, Aldea, Catacumbas) y tres nuevas que se ganan con desafíos (js/desafios.js):
//   · La Feria Abandonada: ocas payaso que rebotan por la casilla y sueltan monedas; la Oca Domadora con su látigo y sus aros de fuego.
//   · El Lago Helado: el hielo resbala (cuesta frenar) y las ocas de las nieves tiran bolas que te frenan; la Oca Yeti.
//   · La Mina Olvidada: caen rocas del techo (mira las sombras) y las ocas mineras salen del suelo; la Oca Capataz y su dinamita.
// Aquí están sus datos (BIOMAS_EXTRA, TIERRAS, MINIJEFES), el sorteo, sus reglas y los PELIGROS del suelo (rocas, dinamita).
'use strict';

const BIOMAS_EXTRA = {
  feria:  { id: 'feria', nombre: 'LA FERIA ABANDONADA', suelo: ['#7a3a2e', '#e8dcc0'], veta: '#3a1a14', fondo: '#140a0e', niebla: '#ff9bbf', adornos: ['carpa', 'globo', 'caballito', 'diana', 'farol'] },
  helada: { id: 'helada', nombre: 'EL LAGO HELADO', suelo: ['#9fc9e0', '#b9dcef'], veta: '#4a6a82', fondo: '#070d16', niebla: '#bfe8ff', adornos: ['pino', 'muneco', 'carambano', 'rocanieve', 'huesos'] },
  mina:   { id: 'mina', nombre: 'LA MINA OLVIDADA', suelo: ['#4a3a30', '#544238'], veta: '#1e1610', fondo: '#0a0806', niebla: '#d9a85a', adornos: ['vagoneta', 'viga', 'cristal', 'pico', 'farol'] },
};
Object.assign(TIERRAS, {
  feria:  { regla: 'Las ocas payaso rebotan sin parar. Al caer sueltan monedas', enemigo: 'payaso', prob: 0.22 },
  helada: { regla: 'El hielo resbala: cuesta frenar. Las bolas de nieve te frenan', enemigo: 'nevada', prob: 0.18 },
  mina:   { regla: 'Caen rocas del techo: aparta de las sombras. Las ocas mineras salen del suelo', enemigo: 'minera', prob: 0.2 },
});
Object.assign(MINIJEFES, {
  feria:  { tipo: 'mj-domador', nombre: 'LA OCA DOMADORA', vida: 300, r: 18, vel: 22, dano: 13 },
  helada: { tipo: 'mj-yeti',    nombre: 'LA OCA YETI',     vida: 380, r: 20, vel: 18, dano: 15 },
  mina:   { tipo: 'mj-capataz', nombre: 'LA OCA CAPATAZ',  vida: 360, r: 19, vel: 20, dano: 14 },
});
// las de siempre (copiadas de BIOMAS al cargar, antes de que el sorteo cambie la lista)
const BIOMAS_FIJOS = {}; for (const b of BIOMAS) BIOMAS_FIJOS[b.id] = Object.assign({}, b);
const TIERRAS_MEDIO = ['pantano', 'cementerio', 'aldea', 'catacumbas', 'feria', 'helada', 'mina'];
const datosTierra = id => BIOMAS_FIJOS[id] || BIOMAS_EXTRA[id];

// el sorteo: cambia BIOMAS por dentro (el resto del juego sigue usando biomaDe, que ya mira la lista nueva)
function sorteaTierras() {
  const abiertas = TIERRAS_MEDIO.filter(id => tierraAbierta(id));
  const medio = barajaCon(abiertas).slice(0, 4);
  const lista = [datosTierra('bosque'), ...medio.map(datosTierra), datosTierra('castillo')];
  BIOMAS.length = 0;
  lista.forEach((b, i) => BIOMAS.push(Object.assign({}, b, { desde: i === 0 ? 1 : 1 + i * 10 })));
  if (typeof preparaAdornosCasillas === 'function' && PAN.k) preparaAdornosCasillas();
}
// barajar con el azar de la partida (el del Tablero del día es igual para todos)
function barajaCon(l) { const a = l.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (azar() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

// --- los enemigos nuevos ---
function mueveTierras2(e, dt, ux, uy, d) {
  const J = JUEGO, yo = J.yo;
  if (e.tipo === 'payaso') {   // rebota en línea recta por la casilla, rapidísimo
    if (!e.fase) { const a = Math.atan2(uy, ux) + (Math.random() - 0.5) * 0.8; e.f2 = Math.cos(a); e.cx = Math.sin(a); e.fase = 1; }
    const cx = centroX(casillaDe(e.y)), w = anchoDe(casillaDe(e.y)) / 2 - 6;
    if ((e.x < cx - w && e.f2 < 0) || (e.x > cx + w && e.f2 > 0)) e.f2 = -e.f2;
    if (Math.abs(e.y - yo.y) > 90) { e.cx = Math.sign(yo.y - e.y) * Math.abs(e.cx || 0.6); }
    return [e.f2 * 1.5, (e.cx || 0.6) * 1.5];
  }
  if (e.tipo === 'nevada') {   // se queda a distancia y tira bolas de nieve que te frenan
    e.cd -= dt;
    if (e.cd <= 0 && d < 140) { e.cd = 2.4 + Math.random(); const b = disparaBala(e.x, e.y, ux * 75, uy * 75, 5, 'nieve', 3.5); if (b) b.frena = 1.6; }
    return d > 70 ? [ux, uy] : [-uy * 0.7, ux * 0.7];
  }
  if (e.tipo === 'minera') {   // bajo tierra (no se le ve ni se le pega) hasta que sale a tu lado
    if (e.fase === 0) { e.fase = 1; e.f2 = 1.4 + Math.random(); e.oculta = true; }
    if (e.fase === 1) {
      e.f2 -= dt; if ((J.cuadro & 3) === 0) particula(e.x, e.y + 4, (Math.random() - 0.5) * 20, -10, 0.4, 2, '#7a5a3a', 30, 0);
      if (e.f2 <= 0 || d < 18) { e.fase = 2; e.oculta = false; estallido(e.x, e.y, 8, '#7a5a3a', 60, 0.4, 2, 0, 50); }
      return [ux * 1.6, uy * 1.6];
    }
    return [ux, uy];
  }
  return null;
}
// la minera escondida no recibe golpes
const ocultaTierras2 = e => !!e.oculta;
// al morir: el payaso suelta monedas
function muereTierras2(e) { if (e.tipo === 'payaso') { suelta('moneda', e.x, e.y, 1); if (Math.random() < 0.4) suelta('moneda', e.x + 4, e.y, 1); } }

// --- el hielo: la velocidad que quieres llega poco a poco (y la que llevas tarda en irse) ---
function hielo(vx, vy, dt) {
  const yo = JUEGO.yo;
  if (!enTierra('helada') || JUEGO.fase !== 'parado' || JUEGO.escena) { yo.ivx = vx; yo.ivy = vy; return [vx, vy]; }
  const k = Math.min(1, dt * 2.2);
  yo.ivx = (yo.ivx || 0) + (vx - (yo.ivx || 0)) * k; yo.ivy = (yo.ivy || 0) + (vy - (yo.ivy || 0)) * k;
  return [yo.ivx, yo.ivy];
}
const frenadoNieve = () => (JUEGO.frenado > 0 ? 0.55 : 1);

// --- los peligros del suelo: rocas que caen (Mina) y dinamita (la Capataz). Primero una sombra que crece; luego, el golpe ---
const PELIGROS = [];
function peligro(x, y, r, t, dano, tipo) { if (PELIGROS.length < 30) PELIGROS.push({ x, y, r, t, max: t, dano, tipo }); }
function avanzaTierras2(dt) {
  const J = JUEGO, yo = J.yo;
  if (J.frenado > 0) J.frenado -= dt;
  // la Mina: rocas del techo cerca de ti (y en la casilla en la que estás)
  if (enTierra('mina') && !J.escena && J.fase !== 'tramo') {
    J.tRoca = (J.tRoca || 2) - dt;
    if (J.tRoca <= 0) { J.tRoca = 1.6 + Math.random() * 1.4; peligro(yo.x + (Math.random() - 0.5) * 70, yo.y + (Math.random() - 0.5) * 60, 12, 1.1, 16, 'roca'); }
  }
  for (let i = PELIGROS.length - 1; i >= 0; i--) {
    const P = PELIGROS[i]; P.t -= dt; if (P.t > 0) continue;
    PELIGROS.splice(i, 1);
    estallido(P.x, P.y, P.tipo === 'roca' ? 10 : 18, P.tipo === 'roca' ? '#8a7a6a' : '#ff9b4d', 90, 0.5, 2.6, 1, 40); tiembla(P.tipo === 'roca' ? 2 : 4);
    if (P.tipo !== 'roca') SONIDO.explota();
    if (J.invul <= 0 && J.salto <= 0 && Math.hypot(yo.x - P.x, yo.y - P.y) < P.r + 4) heridaJugador(P.dano, P.x, P.y);
    const n = enemigosCerca(P.x, P.y, P.r + 10);
    for (let k = 0; k < n; k++) { const e = ENE.lista[CERCA[k]]; if (e.hp > 0 && !e.tipo.startsWith('mj-') && Math.hypot(e.x - P.x, e.y - P.y) < P.r + e.r) danar(e, 40, 0, -1, 80, true); }
  }
}
function pintaPeligros() {
  const J = JUEGO;
  for (const P of PELIGROS) {
    const k = 1 - P.t / P.max;
    G.globalAlpha = 0.25 + k * 0.4; G.fillStyle = '#000'; G.beginPath(); G.ellipse(P.x, P.y, P.r * (0.4 + k * 0.6), P.r * 0.6 * (0.4 + k * 0.6), 0, 0, 6.283); G.fill();
    G.globalAlpha = 0.5 + Math.sin(J.t * 20) * 0.3; G.strokeStyle = '#ff4d4d'; G.lineWidth = 1; G.beginPath(); G.ellipse(P.x, P.y, P.r, P.r * 0.6, 0, 0, 6.283); G.stroke(); G.globalAlpha = 1;
    if (P.tipo === 'roca') { const alto = (1 - k) * 90; G.fillStyle = '#5a4a3e'; G.fillRect(P.x - 4, P.y - 6 - alto, 8, 7); G.fillStyle = '#120808'; G.fillRect(P.x - 4, P.y - 6 - alto, 8, 1); }
    else { G.fillStyle = '#c0302f'; G.fillRect(P.x - 1.5, P.y - 6, 3, 7); G.fillStyle = Math.sin(J.t * 30) > 0 ? '#ffd34d' : '#ff7a2a'; G.fillRect(P.x - 1, P.y - 8, 2, 2); }
  }
}

// --- los minijefes nuevos (los llama mueveMinijefe) ---
function mueveMinijefe2(e, dt, ux, uy, d, furia) {
  const J = JUEGO;
  if (e.tipo === 'mj-domador') {   // latigazo largo hacia ti (avisado) y llama a sus payasos; en furia, aro de fuego
    if (e.f2 <= 0) {
      e.f2 = furia ? 2.2 : 3.2; e.fase = (e.fase + 1) % 3;
      if (e.fase === 1) { for (let i = 0; i < 2; i++) creaEnemigo('payaso', e.x + (i ? 16 : -16), e.y); SONIDO.bandada(); }
      else { const n = furia ? 14 : 9; for (let i = 0; i < n; i++) { const a = i * 6.283 / n; disparaBala(e.x, e.y, Math.cos(a) * 60, Math.sin(a) * 60, 9, 'fuego', 4); } SONIDO.jefeTiro(); }
    }
    return d > 50 ? [ux, uy] : [-uy, ux];
  }
  if (e.tipo === 'mj-yeti') {   // bolas de nieve en abanico y pisotón que te frena
    if (e.f2 <= 0) {
      e.f2 = furia ? 1.8 : 2.8;
      if (d < 50) { anillo(e.x, e.y, 50, '#bfe8ff', 0.4, 4); tiembla(5); if (d < 46) { J.frenado = 2; heridaJugador(e.dano, e.x, e.y); } }
      else { const n = furia ? 5 : 3; for (let i = 0; i < n; i++) { const a = Math.atan2(uy, ux) + (i - (n - 1) / 2) * 0.3; const b = disparaBala(e.x, e.y, Math.cos(a) * 80, Math.sin(a) * 80, 10, 'nieve', 5); if (b) b.frena = 1.6; } SONIDO.jefeTiro(); }
    }
    return [ux, uy];
  }
  if (e.tipo === 'mj-capataz') {   // dinamita donde estás (y, en furia, rocas del techo alrededor)
    if (e.f2 <= 0) {
      e.f2 = furia ? 1.5 : 2.4;
      const yo = J.yo; peligro(yo.x + (Math.random() - 0.5) * 16, yo.y + (Math.random() - 0.5) * 16, 24, 1.3, 18, 'dinamita');
      if (furia) for (let i = 0; i < 3; i++) peligro(yo.x + (Math.random() - 0.5) * 90, yo.y + (Math.random() - 0.5) * 80, 12, 1.2, 14, 'roca');
    }
    return d > 60 ? [ux * 0.8, uy * 0.8] : [-ux * 0.5, -uy * 0.5];
  }
  return null;
}
