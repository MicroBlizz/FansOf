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
};
const costeMejora = m => Math.round(m.base * Math.pow(nivelMejora(m.id) + 1, 1.45));

function pintaTienda() {
  const W = PAN.W, H = PAN.H;
  G.drawImage(FONDO, 0, 0, W, H); oscurece(0.4);
  texto2(tr('MEJORAS'), W / 2, 30, 20, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  pinta('moneda', W / 2 - 18, 50, false, false, 1.3); texto2(String(SAVE.monedas), W / 2 - 9, 50.5, 10, '#ffcf33', 'left');
  const alto = Math.min(44, (H - 130) / CFG.tienda.length - 6);
  CFG.tienda.forEach((m, i) => {
    const T = TIENDA_TXT[m.id], n = nivelMejora(m.id), y = 66 + i * (alto + 6), max = n >= m.max, coste = costeMejora(m), puede = !max && SAVE.monedas >= coste;
    caja(10, y, W - 20, alto, 7, '#2a1610', max ? '#ffd34d' : '#6e4426', 1.4);
    icono(T.icono, 28, y + alto / 2, 13);
    texto2(tr(T.nombre), 44, y + alto * 0.27, 8, '#fff4dc', 'left');
    texto2(tr(T.desc), 44, y + alto * 0.55, 6, '#c9b98a', 'left', FUENTE, 700, 0);
    for (let p = 0; p < m.max; p++) caja(44 + p * 8, y + alto * 0.8 - 2, 6, 4, 1.5, p < n ? '#ffd34d' : '#3a2016', '#120808', 0.8);
    if (max) texto2(tr('MÁX'), W - 34, y + alto / 2, 9, '#ffd34d');
    else boton(W - 62, y + alto / 2 - 11, 46, 22, String(coste), puede ? '#3f9a3a' : '#7a3a22', () => compraMejora(m), 9);
  });
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
  parrafo(tr('Arrastra el dedo por cualquier sitio para moverte: tus armas atacan solas. Sube por el tablero antes de que se derrumbe, recoge plumas doradas para subir de nivel y llenar el Impulso (dos toques para saltar hacia delante). Llega a la casilla 63 y vence a la Oca Madre.'), 22, 228, W - 44, 7, '#e8dcc0');
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
