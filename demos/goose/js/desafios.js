// Fans of Goose · DESAFÍOS Y DESBLOQUEOS, y el TABLERO DEL DÍA.
// · Desafíos: retos de partida («llega a la 30», «vence a la Parca», «gana en la Noche 3»…). Cada uno abre algo nuevo para siempre:
//   una tierra (que entra en el sorteo de js/tierras2.js), un arma (js/armas2.js), un personaje o monedas. Se repasan al acabar cada
//   partida (repasaDesafios) y se ven en su pantalla (pintaDesafios). Es propio de Goose: los RETOS de core son misiones diarias con oro.
// · Tablero del día: una partida al día igual para todos: el mismo sorteo de tierras, las mismas casillas, la misma maldición, la misma
//   Noche 3, el mismo personaje y la misma secuencia de dados (azar con semilla = la fecha). Guarda tu mejor puntuación del día y la
//   puedes compartir. La primera partida del día paga el doble.
'use strict';

const DESAFIOS = [
  { id: 'feria', txt: 'Llega a la casilla 30', premio: 'tierra', que: 'feria', ok: J => J.mejorCasilla >= 30 },
  { id: 'helada', txt: 'Vence a 3 minijefes en una partida', premio: 'tierra', que: 'helada', ok: J => (J.mjHechos || 0) >= 3 },
  { id: 'mina', txt: 'Vence a la Oca Parca', premio: 'tierra', que: 'mina', ok: J => J.parcaHecha },
  { id: 'campana', txt: 'Gana con dos personajes distintos', premio: 'arma', que: 'campana', ok: () => (SAVE.ganadoCon || []).length >= 2 },
  { id: 'tirachinas', txt: 'Tumba 1.000 ocas en una partida', premio: 'arma', que: 'tirachinas', ok: J => J.bajas >= 1000 },
  { id: 'negro', txt: 'Gana en la Noche 3', premio: 'personaje', que: 'negro', ok: (J, gana) => gana && !J.diario && J.noche >= 3 },
  { id: 'blanco', txt: 'Llega a la 63 en el Tablero del día', premio: 'personaje', que: 'blanco', ok: (J, gana) => gana && J.diario },
  { id: 'combo', txt: 'Haz un combo de x600', premio: 'monedas', que: 250, ok: J => J.mejorCombo >= 600 },
  { id: 'sinposada', txt: 'Gana sin comprar en la Posada ni en el Mercader', premio: 'monedas', que: 400, ok: (J, gana) => gana && !J.compro },
  { id: 'peligro', txt: 'Elige el camino del peligro en las cinco tierras', premio: 'monedas', que: 300, ok: J => Object.values(J.ruta || {}).filter(r => r === 'peligro').length >= 5 },
  { id: 'noche5', txt: 'Gana en la Noche 5', premio: 'monedas', que: 600, ok: (J, gana) => gana && !J.diario && J.noche >= 5 },
  { id: 'noche10', txt: 'Gana en la Noche 10', premio: 'monedas', que: 1500, ok: (J, gana) => gana && !J.diario && J.noche >= 10 },
];
const hecho = id => !!(SAVE.desafios && SAVE.desafios[id]);
const tierraAbierta = id => !DESAFIOS.some(d => d.premio === 'tierra' && d.que === id) || hecho(id);
const armaAbierta = id => !DESAFIOS.some(d => d.premio === 'arma' && d.que === id) || hecho(id);
const personajeAbierto = id => !DESAFIOS.some(d => d.premio === 'personaje' && d.que === id) || hecho(id);
const desafioDe = (premio, que) => DESAFIOS.find(d => d.premio === premio && d.que === que);
function textoPremio(d) {
  if (d.premio === 'tierra') return tr('Tierra nueva: {n}', { n: tr(BIOMAS_EXTRA[d.que].nombre) });
  if (d.premio === 'arma') return tr('Arma nueva: {n}', { n: tr(ARMAS[d.que].nombre) });
  if (d.premio === 'personaje') { const p = PERSONAJES.find(x => x.id === d.que); return tr('Personaje nuevo: {n}', { n: tr(p.nombre) }); }
  return tr('{n} monedas', { n: d.que });
}

// al acabar la partida: los que se cumplen ahora (y su premio). Devuelve la lista para la pantalla del final
function repasaDesafios(gana) {
  const J = JUEGO; if (J.carrera) return [];
  if (gana && J.pers) { SAVE.ganadoCon = SAVE.ganadoCon || []; if (!SAVE.ganadoCon.includes(J.pers.id)) SAVE.ganadoCon.push(J.pers.id); }
  SAVE.desafios = SAVE.desafios || {};
  const nuevos = [];
  for (const d of DESAFIOS) if (!hecho(d.id) && d.ok(J, gana)) { SAVE.desafios[d.id] = 1; if (d.premio === 'monedas') SAVE.monedas += d.que; nuevos.push(d); }
  return nuevos;
}

// --- el azar de la partida: Math.random, o el de la semilla del Tablero del día (dos hilos: el tablero y el dado) ---
function semillaAzar(s) { return () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const azar = () => (JUEGO.rnd ? JUEGO.rnd() : Math.random());
const azarDado = () => (JUEGO.rndDado ? JUEGO.rndDado() : Math.random());
function hoy() { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
const fechaHoy = () => { const d = new Date(); return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear(); };
const NOCHE_DIA = 3;
const personajeDelDia = () => PERSONAJES[hoy() % 4];   // uno de los cuatro de salida
function diarioHoy() { if (!SAVE.diario || SAVE.diario.dia !== hoy()) SAVE.diario = { dia: hoy(), mejor: 0, casilla: 0, intentos: 0 }; return SAVE.diario; }
const puntosPartida = (J, gana) => J.mejorCasilla * 100 + J.bajas + (gana ? 3000 + Math.max(0, 1200 - Math.floor(J.t)) * 2 : 0);

// prepara la partida del día (lo llama nuevaPartida con JUEGO.diario = true)
function preparaDiario() {
  const J = JUEGO, s = hoy();
  J.rnd = semillaAzar(s * 7 + 1); J.rndDado = semillaAzar(s * 13 + 5); J.noche = NOCHE_DIA;
}
function empiezaDiario() { JUEGO.diarioPedido = true; nuevaPartida(); }
function terminaDiario(gana) {
  const J = JUEGO, D = diarioHoy(), pts = puntosPartida(J, gana), primera = D.intentos === 0;
  D.intentos++; const record = pts > D.mejor; if (record) { D.mejor = pts; D.casilla = gana ? CFG.jardin : J.mejorCasilla; }
  return { pts, record, primera };
}
async function compartirDiario() {
  const D = diarioHoy(), txt = tr('Fans of Goose · Tablero del día {f}: {p} puntos (casilla {c} de 63). ¿Me ganas?', { f: fechaHoy(), p: D.mejor, c: D.casilla }) + ' https://fansof.games/demos/goose/';
  try { if (navigator.share) { await navigator.share({ text: txt }); return; } } catch (e) { /* cancelado */ }
  try { await navigator.clipboard.writeText(txt); toast(tr('Copiado: pégalo a tus amigos')); } catch (e) { toast(txt); }
}

// --- pantalla del Tablero del día ---
function pintaDiario() {
  const W = PAN.W, H = PAN.H, D = diarioHoy(), p = personajeDelDia();
  G.drawImage(FONDO, 0, 0, W, H); oscurece(0.45);
  texto2(tr('TABLERO DEL DÍA'), W / 2, 30, 15, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  texto2(fechaHoy(), W / 2, 46, 8, '#f1e6c8');
  caja(16, 58, W - 32, 128, 8, '#24120c', '#ffd34d', 1.6);
  parrafo(tr('Hoy, todos jugáis el mismo tablero: mismas tierras, mismas casillas, misma maldición y los mismos dados. Noche {n}.', { n: NOCHE_DIA }), 26, 70, W - 52, 6, '#f1e6c8');
  pintaHeroeQuieto(W / 2, 120, p.capa, 1);
  texto2(tr('Personaje del día: {n}', { n: tr(p.nombre) }), W / 2, 144, 7, p.color);
  texto2(D.intentos ? tr('Tu mejor de hoy: {p} puntos', { p: D.mejor }) : tr('La primera partida de hoy paga el doble'), W / 2, 162, 7, D.intentos ? '#7dff6b' : '#ffcf33');
  if (D.intentos) texto2(tr('Casilla {c} · {n} intentos', { c: D.casilla, n: D.intentos }), W / 2, 174, 6, '#c9b98a');
  boton(30, H - 112, W - 60, 32, tr('¡A JUGAR!'), '#e8742a', () => { SONIDO.boton(); empiezaDiario(); }, 14);
  if (D.intentos) boton(30, H - 72, W - 60, 24, tr('COMPARTIR'), '#1f9a8a', () => { SONIDO.boton(); compartirDiario(); }, 9, tr('Reta a tus amigos'));
  boton(30, H - 40, W - 60, 24, tr('VOLVER'), '#2f74c0', () => { SONIDO.boton(); JUEGO.modo = 'portada'; }, 9);
}

// --- pantalla de desafíos ---
let DESAFIOS_SCROLL = 0;
function pintaDesafios() {
  const W = PAN.W, H = PAN.H;
  G.drawImage(FONDO, 0, 0, W, H); oscurece(0.5);
  const hechos = DESAFIOS.filter(d => hecho(d.id)).length;
  texto2(tr('DESAFÍOS'), W / 2, 26, 15, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  texto2(tr('{a} de {b} cumplidos', { a: hechos, b: DESAFIOS.length }), W / 2, 40, 7, '#f1e6c8');
  const alto = 29, y0 = 50, caben = Math.floor((H - y0 - 80) / (alto + 3));
  DESAFIOS_SCROLL = Math.max(0, Math.min(DESAFIOS.length - caben, DESAFIOS_SCROLL));
  DESAFIOS.slice(DESAFIOS_SCROLL, DESAFIOS_SCROLL + caben).forEach((d, i) => {
    const y = y0 + i * (alto + 3), ok = hecho(d.id), c = d.premio === 'monedas' ? '#ffcf33' : d.premio === 'tierra' ? '#7dff6b' : d.premio === 'arma' ? '#ff9b4d' : '#6bf2ff';
    caja(10, y, W - 20, alto, 6, ok ? '#1a2a12' : '#24120c', ok ? '#7dff6b' : '#6e4426', 1.2);
    texto2(tr(d.txt), 18, y + 10, 6.5, ok ? '#c9f0b0' : '#fff4dc', 'left');
    texto2((ok ? tr('Conseguido') + ' · ' : '') + textoPremio(d), 18, y + 21, 5.5, ok ? '#7dff6b' : c, 'left', FUENTE, 700, 0);
    if (ok) { G.fillStyle = '#7dff6b'; G.fillRect(W - 26, y + 12, 3, 5); G.fillRect(W - 23, y + 15, 3, 3); G.fillRect(W - 21, y + 9, 3, 7); }
  });
  if (DESAFIOS.length > caben) {
    boton(10, H - 72, (W - 30) / 2, 22, '<', '#e8742a', () => { DESAFIOS_SCROLL -= caben; }, 10);
    boton(20 + (W - 30) / 2, H - 72, (W - 30) / 2, 22, '>', '#e8742a', () => { DESAFIOS_SCROLL += caben; }, 10);
  }
  boton(30, H - 40, W - 60, 24, tr('VOLVER'), '#2f74c0', () => { SONIDO.boton(); JUEGO.modo = 'portada'; }, 9);
}
