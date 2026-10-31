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
  coraza:  { nombre: 'Coraza de hojalata', desc: '-5 % de daño recibido', icono: 'coraza' },
  regen:   { nombre: 'Caldo de la abuela', desc: 'Te curas un poco cada segundo', icono: 'regen' },
  critico: { nombre: 'Ojo de halcón', desc: '+3 % de golpe crítico', icono: 'critico' },
  sabio:   { nombre: 'Libro de la Oca', desc: '+6 % de experiencia', icono: 'sabio' },
  botin:   { nombre: 'Botín pirata', desc: '+20 % de monedas en los cofres', icono: 'botin' },
  redado:  { nombre: 'Segunda tirada', desc: 'Una vez por partida, tira otra vez el dado si no te gusta', icono: 'redado' },
  maldicion: { nombre: 'Maldición', desc: 'Ocas más duras y rápidas: +15 % de monedas por nivel', icono: 'maldicion' },
  horda:   { nombre: 'Horda', desc: 'Más ocas y más seguido: +10 % de monedas por nivel', icono: 'horda' },
  destierro: { nombre: 'Destierro', desc: 'Quita para siempre una carta que no quieres (por partida)', icono: 'destierro' },
  saltar:  { nombre: 'Saltar', desc: 'Sáltate una subida de nivel y gana 15 monedas (por partida)', icono: 'saltar' },
  auto:    { nombre: 'Elección automática', desc: 'Al subir de nivel se elige sola la mejor carta, sin parar', icono: 'auto' },
};
// lo que cuesta algo de la Posada o del Mercader (con el Regateo)
const precio = o => Math.max(1, Math.round(o.coste * (1 - 0.15 * nivelMejora('regateo'))));
let TIENDA_PAG = 0, TIENDA_TAB = 'mejoras';   // la pestaña: 'mejoras' o 'aspecto' (js/aspecto.js)
const costeMejora = m => Math.round(m.base * 1.5 * Math.pow(nivelMejora(m.id) + 1, 1.7));   // cada nivel cuesta bastante más (31-10-2026, Daniel)

function pintaTienda() {
  const W = PAN.W, H = PAN.H;
  G.drawImage(FONDO, 0, 0, W, H); oscurece(0.4);
  texto2(tr('MEJORAS'), W / 2, 30, 20, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  pinta('moneda', W / 2 - 18, 50, false, false, 1.3); texto2(String(SAVE.monedas), W / 2 - 9, 50.5, 10, '#ffcf33', 'left');
  // las dos pestañas
  const pest = (x, id, txt) => boton(x, 60, (W - 22) / 2, 20, txt, TIENDA_TAB === id ? '#e8742a' : '#5a3418', () => { SONIDO.boton(); TIENDA_TAB = id; TIENDA_PAG = 0; }, 8);
  pest(8, 'mejoras', tr('MEJORAS')); pest(14 + (W - 22) / 2, 'aspecto', tr('ASPECTO'));
  if (TIENDA_TAB === 'aspecto') { pintaAspecto(); botonVolverTienda(); return; }
  // de 5 en 5 por páginas (las filas no se pisan en ningún móvil)
  const alto = 40, gap = 5, caben = Math.max(3, Math.min(CFG.tienda.length, Math.floor((H - 88 - 74) / (alto + gap)))), pags = Math.ceil(CFG.tienda.length / caben);
  TIENDA_PAG = Math.min(TIENDA_PAG, pags - 1);
  CFG.tienda.slice(TIENDA_PAG * caben, TIENDA_PAG * caben + caben).forEach((m, i) => {
    const T = TIENDA_TXT[m.id], n = nivelMejora(m.id), y = 86 + i * (alto + gap), max = n >= m.max, coste = costeMejora(m), puede = !max && SAVE.monedas >= coste;
    caja(8, y, W - 16, alto, 7, '#2a1610', max ? '#ffd34d' : '#6e4426', 1.4);
    icono(T.icono, 24, y + alto / 2 - 2, 13);
    texto2(tr(T.nombre), 40, y + 9, 8, '#fff4dc', 'left');
    parrafo(tr(T.desc), 40, y + 19, W - 112, 7, '#c9b98a');
    for (let p = 0; p < m.max; p++) caja(12 + p * (m.max > 5 ? 3.4 : 6), y + alto - 7, m.max > 5 ? 2.6 : 4.5, 3, 1, p < n ? '#ffd34d' : '#3a2016', '#120808', 0.8);
    const ajustable = (m.id === 'maldicion' || m.id === 'horda') && n > 0, yb = ajustable ? y + 3 : y + alto / 2 - 11, hb = ajustable ? 17 : 22;
    if (max) texto2(tr('MÁX'), W - 39, ajustable ? y + 11 : y + alto / 2, 9, '#ffd34d');
    else boton(W - 64, yb, 50, hb, String(coste), puede ? '#3f9a3a' : '#7a3a22', () => compraMejora(m), 9);
    if (ajustable) { const a = nivelActivo(m.id); boton(W - 64, y + 22, 50, 15, a ? tr('PUESTA {n}', { n: a }) : tr('APAGADA'), a ? '#c0402f' : '#5a3418', () => cambiaActivo(m.id), 6.5); }   // js/maldicion.js
  });
  if (pags > 1) {
    boton(8, H - 70, (W - 22) / 2, 22, '<', TIENDA_PAG > 0 ? '#e8742a' : '#7a3a22', () => { TIENDA_PAG = Math.max(0, TIENDA_PAG - 1); }, 10);
    boton(14 + (W - 22) / 2, H - 70, (W - 22) / 2, 22, '>', TIENDA_PAG < pags - 1 ? '#e8742a' : '#7a3a22', () => { TIENDA_PAG = Math.min(pags - 1, TIENDA_PAG + 1); }, 10);
    texto2(tr('Página {a} de {b}', { a: TIENDA_PAG + 1, b: pags }), W / 2, H - 76, 7, '#c9b98a');
  }
  botonVolverTienda();
}
function botonVolverTienda() {
  const W = PAN.W, H = PAN.H;
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
  const dy = nivelMejora('auto') ? 34 : 0;
  if (dy) fila(166, tr('Elección automática'), SAVE.autoElegir !== 0, () => { SAVE.autoElegir = SAVE.autoElegir === 0 ? 1 : 0; });   // js/maldicion.js
  boton(20, 172 + dy, W - 40, 26, tr('CUENTA'), '#2f74c0', () => { SONIDO.boton(); if (window.filaCuenta) abreCuenta(); else toast(tr('La cuenta llegará pronto')); }, 9, tr('Guarda tu progreso en la nube'));
  texto2(tr('Cómo se juega'), W / 2, 214 + dy, 8, '#ffd34d');
  parrafo(tr('Como en el Juego de la Oca: tira el dado (dos toques o su botón) y se abren las barreras hasta esa casilla; ve tú andando a tu ritmo, tus armas atacan solas. Cada barrera se cierra a tu espalda y, cuanto más tardes en tirar, más ocas te rodean. Pares, bendición; impares, maldición. Cuidado con el Puente, el Pozo, la Cárcel y la Muerte; descansa en la Posada. Llega a la casilla 63 y vence a la Oca Madre.'), 22, 228 + dy, W - 44, 7, '#e8dcc0');
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
