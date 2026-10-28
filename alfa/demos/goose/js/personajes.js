// Fans of Goose · Los cuatro personajes (el mismo viajero con la capa de otro color, cada uno con su arma de salida y su poder) y
// cómo se dibuja el héroe EN CAPAS: el cuerpo (con la capa) tiene su dibujo mirando a cada lado (el de la izquierda lleva el puño
// en la misma mano que el de la derecha: img/c-*-izq.png); el farolillo es otro dibujo aparte que NUNCA se voltea y va colgado
// de ese puño (MANOS). Así el farol no cambia de mano al girarse.
'use strict';

const PERSONAJES = [
  { id: 'rojo', capa: '', color: '#d0342c', nombre: 'El Caminante', arma: 'latigo', poder: 'Corazón de viajero: +25 de vida máxima.' },
  { id: 'verde', capa: 'verde', color: '#3fbf4a', nombre: 'La Druida', arma: 'huevo', poder: 'Savia: recupera vida poco a poco y sus charcos duran la mitad más.' },
  { id: 'azul', capa: 'azul', color: '#3f8ee8', nombre: 'El Plumista', arma: 'plumas', poder: 'Pies de pluma: un 15 % más rápido.' },
  { id: 'amarillo', capa: 'amarillo', color: '#ffc93d', nombre: 'La Tahúr', arma: 'dados', poder: 'Suerte de tahúr: +10 % de crítico y el dado bendito llega antes.' },
];
const personaje = () => PERSONAJES.find(p => p.id === SAVE.personaje) || PERSONAJES[0];

// lo que suma cada uno a las cifras de la partida (lo llama calculaStats)
function poderPersonaje(st) {
  const p = JUEGO.pers || personaje();
  st.charco = 1; st.barra = 1;
  if (p.id === 'rojo') st.vidaMax += 25;
  else if (p.id === 'verde') { st.regen += 0.6; st.charco = 1.5; }
  else if (p.id === 'azul') st.vel *= 1.15;
  else if (p.id === 'amarillo') { st.crit += 0.1; st.barra = 0.6; }
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

// --- el selector de personaje (antes de cada partida) ---
let ELIGE_T = 0;
function abreSelector(despues) { JUEGO.modo = 'elige'; JUEGO.trasElegir = despues || null; ELIGE_T = 0; }
function pintaSelector(dt) {
  const W = PAN.W, H = PAN.H; ELIGE_T += dt;
  G.drawImage(FONDO, 0, 0, W, H); oscurece(0.35);
  texto2(tr('ELIGE PERSONAJE'), W / 2, 28, 16, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  const sel = personaje(), cw = (W - 30) / 2, ch = 112;
  PERSONAJES.forEach((p, i) => {
    const x = 10 + (i % 2) * (cw + 10), y = 46 + Math.floor(i / 2) * (ch + 8), elegido = p.id === sel.id;
    const k = Math.max(0, Math.min(1, ELIGE_T * 5 - i * 0.4)), e = 1 - (1 - k) ** 3;
    G.globalAlpha = e;
    if (elegido) { G.globalAlpha = e * (0.4 + Math.sin(ELIGE_T * 5) * 0.2); caja(x - 3, y - 3, cw + 6, ch + 6, 10, p.color, null); G.globalAlpha = e; }
    caja(x, y + (1 - e) * 20, cw, ch, 8, elegido ? '#3a2214' : '#2a1610', p.color, elegido ? 2.4 : 1.4);
    const yy = y + (1 - e) * 20;
    G.globalAlpha = e * 0.3; G.fillStyle = p.color; G.beginPath(); G.ellipse(x + cw / 2, yy + 52, 22, 6, 0, 0, 6.283); G.fill(); G.globalAlpha = e;
    pintaHeroeQuieto(x + cw / 2, yy + 32 + (elegido ? Math.sin(ELIGE_T * 6) * 1.5 : 0), p.capa, 1);
    texto2(tr(p.nombre), x + cw / 2, yy + 62, 8, p.color, 'center');
    icono(ARMAS[p.arma].icono, x + 14, yy + 76, 8);
    texto2(tr(ARMAS[p.arma].nombre), x + 24, yy + 76.5, 5.5, '#fff4dc', 'left');
    parrafo(tr(p.poder), x + 6, yy + 89, cw - 12, 5.5, '#c9b98a');
    G.globalAlpha = 1;
    BOTONES.push({ x, y, w: cw, h: ch, accion: () => { SAVE.personaje = p.id; guarda(); SONIDO.elige(false); } });
  });
  boton(30, H - 78, W - 60, 32, tr('¡A JUGAR!'), '#e8742a', () => { SONIDO.boton(); const f = JUEGO.trasElegir; JUEGO.trasElegir = null; if (f) f(); else nuevaPartida(); }, 14);
  boton(30, H - 40, W - 60, 24, tr('VOLVER'), '#2f74c0', () => { SONIDO.boton(); JUEGO.modo = 'portada'; }, 9);
}
