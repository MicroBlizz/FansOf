// Fans of Goose · Las pantallas de jugar con amigos: elegir (crear sala o entrar con código), la sala de espera (el código grande,
// compartir el enlace, quién hay y EMPEZAR para el anfitrión) y la clasificación al acabar la Carrera. La red está en js/carrera.js.
'use strict';

function pintaAmigos() {
  const W = PAN.W, H = PAN.H;
  G.drawImage(FONDO, 0, 0, W, H); oscurece(0.35);
  texto2(tr('CON AMIGOS'), W / 2, 34, 19, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  texto2(tr('De 2 a 4 personas, cada una con su móvil'), W / 2, 54, 8, '#f6e7b8');
  parrafo(tr('CARRERA: salís a la vez y gana quien llegue antes a la 63; tus combos les mandan bandadas a los demás. COOPERATIVO: el mismo dado y el mismo derrumbe para todos, la Oca Madre con la vida compartida y podéis revivir a los compañeros.'), 22, 70, W - 44, 7, '#e8dcc0');
  const y = 130;
  if (SALAS.puede()) {
    boton(30, y, W - 60, 32, tr('CREAR SALA'), '#e8742a', () => { SONIDO.boton(); creaSala(); }, 12);
    boton(30, y + 42, W - 60, 28, tr('ENTRAR CON CÓDIGO'), '#3f9a3a', () => { SONIDO.boton(); pideCodigo(); }, 10);
  } else {
    boton(30, y, W - 60, 30, tr('ENTRAR CON TU CUENTA'), '#2f74c0', () => { SONIDO.boton(); if (window.filaCuenta) abreCuenta(); else toast(tr('La cuenta llegará pronto')); }, 10);
  }
  if (AMIGOS.cargando) texto2(tr('Conectando…'), W / 2, y + 90, 8, '#9fe0ff');
  if (AMIGOS.error) parrafo(AMIGOS.error, 24, y + 92, W - 48, 7.5, '#ff8a6b');
  boton(30, H - 46, W - 60, 26, tr('VOLVER'), '#2f74c0', () => { SONIDO.boton(); JUEGO.modo = 'portada'; }, 10);
}

function pintaSala() {
  const W = PAN.W, H = PAN.H, s = AMIGOS.sala;
  G.drawImage(FONDO, 0, 0, W, H); oscurece(0.35);
  texto2(tr('SALA'), W / 2, 30, 16, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  if (!s) { texto2(tr('Conectando…'), W / 2, 90, 9, '#9fe0ff'); boton(30, H - 46, W - 60, 26, tr('SALIR'), '#c0402f', () => { saleSala(); JUEGO.modo = 'amigos'; }, 10); return; }
  caja(40, 44, W - 80, 40, 8, '#2a1610', '#ffd34d', 1.8);
  texto2(s.codigo, W / 2, 65, 26, '#ffd34d', 'center', FUENTE, 700, 0.2);
  boton(40, 92, W - 80, 24, tr('COMPARTIR ENLACE'), '#3f9a3a', () => { SONIDO.boton(); compartirSala(); }, 9);
  texto2(tr('Jugadores ({n} de 4)', { n: s.jugadores.length }), W / 2, 130, 8, '#c9b98a');
  const lista = s.jugadores.slice().sort((a, b) => a.orden - b.orden);
  for (let i = 0; i < 4; i++) {
    const j = lista[i], y = 140 + i * 30;
    caja(30, y, W - 60, 24, 6, j ? '#2a1610' : '#160b08', j ? COLORES[i] : '#3a2016', 1.5);
    if (j) {
      pinta('heroe', 44, y + 12, false, false, 0.8);
      texto2((j.nombre || tr('Rival')) + (j.yo ? ' (' + tr('tú') + ')' : ''), 58, y + 12.5, 8, '#fff4dc', 'left');
      if (i === 0) texto2(tr('ANFITRIÓN'), W - 36, y + 12.5, 6, '#ffd34d', 'right');
    } else texto2(tr('Libre'), W / 2, y + 12.5, 7, '#6e4426', 'center', FUENTE, 700, 0);
  }
  const yb = 268;
  const listos = s.jugadores.length >= 2;
  if (s.anfitrion) {
    boton(20, yb, (W - 50) / 2, 32, tr('CARRERA'), listos ? '#e8742a' : '#7a3a22', () => { SONIDO.boton(); empiezaSala('carrera'); }, 10, tr('el primero a la 63'));
    boton(30 + (W - 50) / 2, yb, (W - 50) / 2, 32, tr('COOPERATIVO'), listos ? '#1f9a8a' : '#7a3a22', () => { SONIDO.boton(); empiezaSala('coop'); }, 9, tr('todos juntos'));
  }
  else texto2(tr('Esperando a que el anfitrión empiece…'), W / 2, yb + 16, 8, '#9fe0ff');
  if (s.anfitrion && !listos) texto2(tr('Comparte el código: hace falta alguien más'), W / 2, yb + 40, 7, '#9fe0ff');
  if (AMIGOS.error) parrafo(AMIGOS.error, 24, yb + 40, W - 48, 7, '#ff8a6b');
  boton(30, H - 46, W - 60, 26, tr('SALIR DE LA SALA'), '#c0402f', () => { SONIDO.boton(); saleSala(); JUEGO.modo = 'amigos'; }, 10);
}

// la clasificación de la Carrera en la pantalla final
function pintaClasificacion(y0, k) {
  const J = JUEGO, C = J.carrera, W = PAN.W;
  C.clasificacion.forEach((f, i) => {
    const y = y0 + i * 24, ki = Math.max(0, Math.min(1, k * 4 - 1 - i * 0.4)); if (!ki) return;
    G.globalAlpha = ki;
    caja(24, y, W - 48, 20, 6, f.yo ? '#4a2a08' : '#2a1610', f.color, f.yo ? 2 : 1.2);
    texto2((i + 1) + 'º', 36, y + 10.5, 10, i === 0 ? '#ffd34d' : '#f6e7b8', 'center', FUENTE_G, 400, 0.25);
    texto2(f.nombre, 50, y + 10.5, 8, '#fff4dc', 'left');
    texto2(f.llega !== null ? Math.floor(f.llega / 60) + ':' + String(Math.floor(f.llega) % 60).padStart(2, '0') : tr('casilla {n}', { n: f.c }), W - 32, y + 10.5, 7, f.llega !== null ? '#7dff6b' : '#c9b98a', 'right');
    G.globalAlpha = 1;
  });
}

// si la dirección trae ?sala=XXXX, se entra directo
function miraEnlaceSala() {
  const c = SALAS.codigoUrl(); if (!c) return;
  JUEGO.modo = 'amigos';
  if (SALAS.puede()) uneteSala(c); else AMIGOS.error = tr('Para jugar con amigos entra con tu cuenta.');
}
