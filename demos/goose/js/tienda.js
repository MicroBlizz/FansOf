// Fans of Goose · La tienda de mejoras permanentes (se pagan con las monedas de las partidas y duran para siempre) y las Opciones
// (música, efectos, vibración y la cuenta de core). Las cifras de la tienda están en CFG.tienda (js/ajustes.js).
'use strict';

const TIENDA_TXT = {
  vida:    { nombre: 'Corazón de hierro', desc: '+12 de vida al empezar', icono: 'vida' },
  fuerza:  { nombre: 'Pico afilado', desc: '+6 % de daño', icono: 'fuerza' },
  prisa:   { nombre: 'Botas de pato', desc: '+4 % de velocidad', icono: 'prisa' },
  iman:    { nombre: 'Bolsillos grandes', desc: '+15 % de alcance del imán', icono: 'iman' },
  codicia: { nombre: 'Codicia de Microblizz', desc: '+15 % de monedas', icono: 'moneda' },
  retiro:  { nombre: 'Dado trucado', desc: '+1 «Volver a tirar» por partida', icono: 'dado6' },
  fenix:   { nombre: 'Pluma de fénix', desc: 'Una vez por partida, vuelves con media vida', icono: 'fenix' },
  arsenal: { nombre: 'Arsenal', desc: 'Empiezas con un arma más al azar', icono: 'arsenal' },
  suerte:  { nombre: 'Dado de la suerte', desc: 'El primer dado sale bendito', icono: 'suerte' },
  regateo: { nombre: 'Regateo', desc: 'Posada y Mercader un 15 % más baratos', icono: 'regateo' },
};
// lo que cuesta algo de la Posada o del Mercader (con el Regateo)
const precio = o => Math.max(1, Math.round(o.coste * (1 - 0.15 * nivelMejora('regateo'))));
let TIENDA_PAG = 0;
const costeMejora = m => Math.round(m.base * Math.pow(nivelMejora(m.id) + 1, 1.45));

function pintaTienda() {
  const W = PAN.W, H = PAN.H;
  G.drawImage(FONDO, 0, 0, W, H); oscurece(0.4);
  texto2(tr('MEJORAS'), W / 2, 30, 20, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  pinta('moneda', W / 2 - 18, 50, false, false, 1.3); texto2(String(SAVE.monedas), W / 2 - 9, 50.5, 10, '#ffcf33', 'left');
  // de 5 en 5 por páginas (las filas no se pisan en ningún móvil)
  const alto = 40, gap = 5, caben = Math.max(3, Math.min(CFG.tienda.length, Math.floor((H - 66 - 74) / (alto + gap)))), pags = Math.ceil(CFG.tienda.length / caben);
  TIENDA_PAG = Math.min(TIENDA_PAG, pags - 1);
  CFG.tienda.slice(TIENDA_PAG * caben, TIENDA_PAG * caben + caben).forEach((m, i) => {
    const T = TIENDA_TXT[m.id], n = nivelMejora(m.id), y = 64 + i * (alto + gap), max = n >= m.max, coste = costeMejora(m), puede = !max && SAVE.monedas >= coste;
    caja(8, y, W - 16, alto, 7, '#2a1610', max ? '#ffd34d' : '#6e4426', 1.4);
    icono(T.icono, 24, y + alto / 2 - 2, 13);
    texto2(tr(T.nombre), 40, y + 9, 8, '#fff4dc', 'left');
    parrafo(tr(T.desc), 40, y + 19, W - 112, 7, '#c9b98a');
    for (let p = 0; p < m.max; p++) caja(12 + p * 6, y + alto - 7, 4.5, 3, 1, p < n ? '#ffd34d' : '#3a2016', '#120808', 0.8);
    if (max) texto2(tr('MÁX'), W - 34, y + alto / 2, 9, '#ffd34d');
    else boton(W - 64, y + alto / 2 - 11, 50, 22, String(coste), puede ? '#3f9a3a' : '#7a3a22', () => compraMejora(m), 9);
  });
  if (pags > 1) {
    boton(8, H - 70, (W - 22) / 2, 22, '<', TIENDA_PAG > 0 ? '#e8742a' : '#7a3a22', () => { TIENDA_PAG = Math.max(0, TIENDA_PAG - 1); }, 10);
    boton(14 + (W - 22) / 2, H - 70, (W - 22) / 2, 22, '>', TIENDA_PAG < pags - 1 ? '#e8742a' : '#7a3a22', () => { TIENDA_PAG = Math.min(pags - 1, TIENDA_PAG + 1); }, 10);
    texto2(tr('Página {a} de {b}', { a: TIENDA_PAG + 1, b: pags }), W / 2, H - 76, 7, '#c9b98a');
  }
  boton(30, H - 40, W - 60, 26, tr('VOLVER'), '#2f74c0', () => { SONIDO.boton(); JUEGO.modo = JUEGO.fin ? 'fin' : 'portada'; if (JUEGO.fin) JUEGO.fin.t = 9; }, 10);
}
function compraMejora(m) {
  const coste = costeMejora(m);
  if (nivelMejora(m.id) >= m.max) return;
  if (SAVE.monedas < coste) { toast(tr('Te faltan monedas: juega otra partida')); SONIDO.dadoMalo(); return; }
  SAVE.monedas -= coste; SAVE.mejoras[m.id] = nivelMejora(m.id) + 1; guarda();
  SONIDO.elige(false); destella('#ffd34d', 0.25);
}

function pintaOpciones() {
  const J = JUEGO, W = PAN.W, H = PAN.H;
  G.drawImage(FONDO, 0, 0, W, H); oscurece(0.4);
  texto2(tr('OPCIONES'), W / 2, 34, 20, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  const fila = (y, nombre, activo, cambia) => {
    caja(20, y, W - 40, 28, 7, '#2a1610', '#6e4426', 1.4);
    texto2(nombre, 32, y + 14, 9, '#fff4dc', 'left');
    boton(W - 72, y + 4, 44, 20, activo ? tr('SÍ') : tr('NO'), activo ? '#3f9a3a' : '#c0402f', () => { cambia(); guarda(); SONIDO.boton(); applyVolume(); }, 8);
  };
  fila(64, tr('Música'), SAVE.musica, () => { SAVE.musica = SAVE.musica ? 0 : 1; });
  fila(98, tr('Efectos'), SAVE.efectos, () => { SAVE.efectos = SAVE.efectos ? 0 : 1; });
  fila(132, tr('Vibración'), SAVE.vibrar, () => { SAVE.vibrar = SAVE.vibrar ? 0 : 1; });
  boton(20, 172, W - 40, 26, tr('CUENTA'), '#2f74c0', () => { SONIDO.boton(); if (window.filaCuenta) abreCuenta(); else toast(tr('La cuenta llegará pronto')); }, 9, tr('Guarda tu progreso en la nube'));
  texto2(tr('Cómo se juega'), W / 2, 214, 8, '#ffd34d');
  parrafo(tr('Como en el Juego de la Oca: tira el dado (dos toques o su botón) y avanzas esas casillas a toda prisa; tus armas atacan solas. En cada casilla te defiendes y recoges plumas, pero cuanto más tardes en tirar, más ocas y más cerca el derrumbe. Pares, bendición; impares, maldición. Cuidado con el Puente, el Pozo, la Cárcel y la Muerte; descansa en la Posada. Llega a la casilla 63 y vence a la Oca Madre.'), 22, 228, W - 44, 7, '#e8dcc0');
  boton(30, H - 40, W - 60, 26, tr('VOLVER'), '#e8742a', () => { SONIDO.boton(); J.modo = J.opcionesDe || 'portada'; }, 10);
}
// la cuenta de core se abre en su ventana (la fila de Opciones comunes, dentro de un cuadro)
function abreCuenta() {
  try {
    const html = '<div id="goose-cuenta"></div>';
    confirmBox(tr('CUENTA'), html, null, null, tr('CERRAR'));
    const c = document.getElementById('goose-cuenta'); c.appendChild(window.filaCuenta);
  } catch (e) { toast(tr('La cuenta llegará pronto')); }
}
