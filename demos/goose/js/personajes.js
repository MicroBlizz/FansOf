// Fans of Goose · Los personajes (el mismo viajero con la capa de otro color, cada uno con su arma de salida y su poder: cuatro de
// salida y dos que se ganan con desafíos) y el selector (antes de cada partida, con la Noche) y
// cómo se dibuja el héroe EN CAPAS: el cuerpo (con la capa) tiene su dibujo mirando a cada lado (el de la izquierda lleva el puño
// en la misma mano que el de la derecha: img/c-*-izq.png); el farolillo es otro dibujo aparte que NUNCA se voltea y va colgado
// de ese puño (MANOS). Así el farol no cambia de mano al girarse.
'use strict';

const PERSONAJES = [
  { id: 'rojo', capa: '', color: '#d0342c', nombre: 'El Caminante', arma: 'latigo', poder: 'Corazón de viajero: +25 de vida máxima.' },
  { id: 'verde', capa: 'verde', color: '#3fbf4a', nombre: 'La Druida', arma: 'huevo', poder: 'Savia: recupera vida poco a poco y sus charcos duran la mitad más.' },
  { id: 'azul', capa: 'azul', color: '#3f8ee8', nombre: 'El Plumista', arma: 'plumas', poder: 'Pies de pluma: un 15 % más rápido.' },
  { id: 'amarillo', capa: 'amarillo', color: '#ffc93d', nombre: 'La Tahúr', arma: 'dados', poder: 'Suerte de tahúr: +10 % de crítico y el dado bendito llega antes.' },
  { id: 'negro', capa: 'negro', color: '#8a7a9a', nombre: 'El Sepulturero', arma: 'campana', poder: 'Pala vieja: las ocas le dan un 25 % más de plumas.' },
  { id: 'blanco', capa: 'blanco', color: '#efe4c4', nombre: 'La Peregrina', arma: 'tirachinas', poder: 'Fe de peregrina: +1 «Volver a tirar» y un 20 % más de monedas.' },
];
const personaje = () => { const p = PERSONAJES.find(x => x.id === SAVE.personaje); return p && personajeAbierto(p.id) ? p : PERSONAJES[0]; };

// lo que suma cada uno a las cifras de la partida (lo llama calculaStats)
function poderPersonaje(st) {
  const p = JUEGO.pers || personaje();
  st.charco = 1; st.barra = 1;
  if (p.id === 'rojo') st.vidaMax += 25;
  else if (p.id === 'verde') { st.regen += 0.6; st.charco = 1.5; }
  else if (p.id === 'azul') st.vel *= 1.15;
  else if (p.id === 'amarillo') { st.crit += 0.1; st.barra = 0.6; }
  else if (p.id === 'negro') st.plumas = 1.25;
  else if (p.id === 'blanco') st.monedas *= 1.2;
}
const plumasDado = () => CFG.impulso.lleno * ((JUEGO.st && JUEGO.st.barra) || 1);

// --- el héroe en capas ---
// la mano (donde va el asa del farolillo) en cada pose, en píxeles desde el centro del dibujo mirando a la derecha
const MANOS = { 'c-cuerpo': [17.8, 1.9], 'c-paso': [18.2, 3.5], 'c-golpe': [19.5, 1.4], 'c-cuerpo-izq': [7.8, 7.9], 'c-paso-izq': [3.2, 6.5], 'c-golpe-izq': [5.5, 7.4] };
const capasListas = () => !!(SPR['c-cuerpo'] && SPR['c-farol']);

// dibuja al héroe: pose = 'c-cuerpo' | 'c-paso' | 'c-golpe'; dir = 1 (derecha) o -1 (izquierda); balanceo del farolillo en radianes
function pintaHeroeCapas(x, y, pose, dir, capa, esc, alfa, blanco, balanceo) {
  const lado = dir < 0 ? '-izq' : '', nombre = (capa ? pose + '-' + capa : pose) + lado, body = SPR[nombre] || SPR[pose + lado] || SPR[pose];
  if (!body) return;
  const k = PAN.k, m = MANOS[pose + lado] || MANOS[pose] || MANOS['c-cuerpo'];
  // 1. el cuerpo: su dibujo de cada lado (nunca se voltea por código)
  if (alfa !== 1) G.globalAlpha = alfa;
  const w = body.w * esc, h = body.h * esc;
  G.drawImage(blanco ? body.b : body.n, x - w / 2, y - h / 2, w, h);
  // 2. el farolillo: colgado del puño de ese dibujo, que está siempre en la misma mano
  const f = SPR['c-farol'], hx = x + (m[0] / k) * esc, hy = y + (m[1] / k) * esc;
  G.save(); G.translate(hx, hy); G.rotate(balanceo || 0);
  const fw = f.w * esc, fh = f.h * esc;
  G.drawImage(blanco ? f.b : f.n, -fw / 2, -1, fw, fh);
  G.restore();
  if (alfa !== 1) G.globalAlpha = 1;
  return [hx, hy + fh / 2];
}
// para las pantallas (selector, sala): el héroe quieto con la capa de un color
function pintaHeroeQuieto(x, y, capa, esc, dir = 1) {
  if (capasListas()) pintaHeroeCapas(x, y, 'c-cuerpo', dir, capa, esc, 1, false, Math.sin(performance.now() / 500) * 0.08);
  else pinta('heroe', x, y, false, false, esc);
}

// --- el selector de personaje (antes de cada partida): seis tarjetas, la ficha del elegido y la Noche ---
let ELIGE_T = 0;
function abreSelector(despues) { JUEGO.modo = 'elige'; JUEGO.trasElegir = despues || null; ELIGE_T = 0; }
function pintaSelector(dt) {
  const W = PAN.W, H = PAN.H; ELIGE_T += dt;
  G.drawImage(FONDO, 0, 0, W, H); oscurece(0.35);
  texto2(tr('ELIGE PERSONAJE'), W / 2, 22, 14, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  const sel = personaje(), cw = (W - 28) / 3, ch = 62;
  PERSONAJES.forEach((p, i) => {
    const x = 8 + (i % 3) * (cw + 6), y = 34 + Math.floor(i / 3) * (ch + 6), elegido = p.id === sel.id, abierto = personajeAbierto(p.id);
    const k = Math.max(0, Math.min(1, ELIGE_T * 5 - i * 0.3)), e = 1 - (1 - k) ** 3, yy = y + (1 - e) * 16;
    G.globalAlpha = e;
    if (elegido) { G.globalAlpha = e * (0.4 + Math.sin(ELIGE_T * 5) * 0.2); caja(x - 2, yy - 2, cw + 4, ch + 4, 9, p.color, null); G.globalAlpha = e; }
    caja(x, yy, cw, ch, 7, elegido ? '#3a2214' : '#2a1610', abierto ? p.color : '#4a3020', elegido ? 2.2 : 1.2);
    G.globalAlpha = e * 0.3; G.fillStyle = p.color; G.beginPath(); G.ellipse(x + cw / 2, yy + 40, 16, 4, 0, 0, 6.283); G.fill(); G.globalAlpha = e * (abierto ? 1 : 0.35);
    pintaHeroeQuieto(x + cw / 2, yy + 24 + (elegido ? Math.sin(ELIGE_T * 6) * 1.2 : 0), p.capa, 1);
    G.globalAlpha = e;
    if (!abierto) { G.fillStyle = '#120808'; G.fillRect(x + cw / 2 - 5, yy + 20, 10, 8); G.fillStyle = '#c9b98a'; G.fillRect(x + cw / 2 - 4, yy + 21, 8, 6); G.strokeStyle = '#c9b98a'; G.lineWidth = 1.4; G.beginPath(); G.arc(x + cw / 2, yy + 20, 3, Math.PI, 0); G.stroke(); }
    texto2(tr(p.nombre), x + cw / 2, yy + 53, 5.5, abierto ? p.color : '#6e4426', 'center');
    G.globalAlpha = 1;
    BOTONES.push({ x, y, w: cw, h: ch, accion: () => { if (!abierto) { const d = desafioDe('personaje', p.id); toast(tr('Para jugar con él: {t}', { t: tr(d.txt) })); SONIDO.dadoMalo(); return; } SAVE.personaje = p.id; guarda(); SONIDO.elige(false); } });
  });
  // la ficha del elegido: su arma y su poder
  const fy = 34 + 2 * (ch + 6) + 2;
  caja(8, fy, W - 16, 42, 7, '#24120c', sel.color, 1.4);
  icono(ARMAS[sel.arma].icono, 20, fy + 12, 8);
  texto2(tr(sel.nombre) + ' · ' + tr(ARMAS[sel.arma].nombre), 30, fy + 12.5, 6.5, sel.color, 'left');
  parrafo(tr(sel.poder), 14, fy + 24, W - 28, 5.5, '#c9b98a');
  // la noche (solo en partida normal: con amigos se juega la Noche 1)
  let yb = fy + 48;
  if (!JUEGO.trasElegir) {
    const n = pintaSelectorNoche(8, yb, W - 16);
    if (n > 1) parrafo(reglaNoche(n), 12, yb + 32, W - 24, 5.5, '#ff8a6b');
  }
  boton(30, H - 62, W - 60, 28, tr('¡A JUGAR!'), '#e8742a', () => { SONIDO.boton(); const f = JUEGO.trasElegir; JUEGO.trasElegir = null; if (f) f(); else nuevaPartida(); }, 13);
  boton(30, H - 30, W - 60, 22, tr('VOLVER'), '#2f74c0', () => { SONIDO.boton(); JUEGO.modo = 'portada'; }, 9);
}
