// Fans of Snakes · Opciones: la ventana con la música, los efectos, los colores para daltónicos (manzanas azules) y el control
// del dedo (Toques, Palanca o Deslizar).
// Se abre con el botón de pausa del marcador (js/hud.js) o con el botón OPCIONES de la portada. Lo elegido se guarda en SAVE.
'use strict';

const CONTROLES = [
  { id: 'toques', nombre: 'TOQUES', texto: 'Toca arriba, abajo, a la izquierda o a la derecha de la pantalla' },
  { id: 'palanca', nombre: 'PALANCA', texto: 'Sale una palanca donde pones el dedo; arrastra hacia donde quieras ir' },
  { id: 'deslizar', nombre: 'DESLIZAR', texto: 'Desliza el dedo hacia donde quieras girar' },
];
const OPC = { abierto: false, antes: 'menu', t: 0, botones: [], confirma: false };   // confirma: el aviso de salir al menú

function abreOpciones() {
  OPC.abierto = true; OPC.antes = JUEGO.modo; OPC.t = 0; OPC.confirma = false;
  if (JUEGO.modo === 'juego') { JUEGO.modo = 'pausa'; sueltaPalanca(); JUEGO.pend = []; }
}
function cierraOpciones() {
  OPC.abierto = false;
  if (JUEGO.modo === 'pausa') { JUEGO.modo = 'juego'; JUEGO.acum = -0.5; }   // un respiro antes de seguir
  guarda(); SONIDO.boton();
}


function pintaOpciones(W, H) {
  if (!OPC.abierto) return;
  if (OPC.confirma) { pintaConfirmaSalir(W, H); return; }
  const enJuego = JUEGO.modo === 'pausa';
  const k = Math.min(1, OPC.t / 0.2), x = 10, w = W - 20, h = enJuego ? 318 : 292, y = (H - h) / 2 + (1 - k) * 20;
  G.fillStyle = `rgba(6,17,10,${0.75 * k})`; G.fillRect(0, 0, W, H);
  caja(x, y + 3, w, h, 10, '#06110a', null);
  caja(x, y, w, h, 10, '#0f2a1b', '#3ddc84', 2);
  letra(tr('OPCIONES'), W / 2, y + 16, 14, '#3ddc84', 'center', '#06110a', 3);
  OPC.botones = [];
  // música y efectos: interruptores
  const fila = (txt, on, yy, id) => {
    letra(tr(txt), x + 14, yy, 10, '#fff', 'left', '#06110a', 2.5);
    const bx = x + w - 52, r = { x: bx, y: yy - 9, w: 40, h: 18 };
    caja(r.x, r.y, r.w, r.h, 9, on ? '#3ddc84' : '#2a3a30', '#06110a', 1.5);
    circulo(on ? bx + 31 : bx + 9, yy, 7, '#fff', '#06110a', 1.2);
    letra(on ? tr('SÍ') : tr('NO'), on ? bx + 13 : bx + 27, yy + 0.5, 6.5, on ? '#06110a' : '#9fb3a6', 'center', null, 0);
    OPC.botones.push({ ...r, id });
  };
  fila('Música', SAVE.musica === 1, y + 42, 'musica');
  fila('Efectos', SAVE.efectos === 1, y + 66, 'efectos');
  fila('Colores para daltónicos', SAVE.daltonico === 1, y + 90, 'daltonico');
  // los controles
  letra(tr('Controles'), x + 14, y + 116, 10, '#fff', 'left', '#06110a', 2.5);
  CONTROLES.forEach((c, i) => {
    const yy = y + 128 + i * 40, on = SAVE.control === c.id, r = { x: x + 10, y: yy, w: w - 20, h: 35 };
    caja(r.x, r.y, r.w, r.h, 7, on ? '#1f5a36' : '#10251a', on ? '#9cff6b' : '#2a4a36', on ? 2 : 1.2);
    circulo(r.x + 11, yy + 11, 5, on ? '#9cff6b' : null, '#9cff6b', 1.5);
    letra(tr(c.nombre), r.x + 21, yy + 11, 9, on ? '#9cff6b' : '#cfe', 'left', '#06110a', 2);
    G.font = `700 6.5px "Baloo 2", system-ui, sans-serif`;
    lineas(tr(c.texto), r.w - 20).slice(0, 2).forEach((l, j) => letra(l, r.x + 10, yy + 22 + j * 7, 6.5, '#cfe', 'left', null, 0, 700));
    OPC.botones.push({ ...r, id: 'control-' + c.id });
  });
  // en la pausa de una partida: seguir o salir al menú (con aviso); fuera de la partida, cerrar
  if (enJuego) {
    const rb = { x: x + 12, y: y + h - 58, w: w - 24, h: 22 };
    boton(tr('SEGUIR JUGANDO'), rb.x, rb.y, rb.w, rb.h);
    OPC.botones.push({ ...rb, id: 'cerrar' });
    const rs = { x: x + 30, y: y + h - 30, w: w - 60, h: 18 };
    boton(tr('SALIR AL MENÚ'), rs.x, rs.y, rs.w, rs.h, '#ff6b6b');
    OPC.botones.push({ ...rs, id: 'salir' });
  } else {
    const rb = { x: W / 2 - 45, y: y + h - 32, w: 90, h: 22 };
    boton(tr('VOLVER'), rb.x, rb.y, rb.w, rb.h);
    OPC.botones.push({ ...rb, id: 'cerrar' });
  }
}

// el aviso de siempre antes de salir de una partida a medias
function pintaConfirmaSalir(W, H) {
  const w = W - 40, h = 124, x = 20, y = H / 2 - h / 2;
  G.fillStyle = 'rgba(6,17,10,0.85)'; G.fillRect(0, 0, W, H);
  caja(x, y + 3, w, h, 10, '#06110a', null);
  caja(x, y, w, h, 10, '#2a0f14', '#ff6b6b', 2);
  letra(tr('¿SALIR AL MENÚ?'), W / 2, y + 18, 12, '#ff6b6b', 'center', '#06110a', 3);
  G.font = '700 8px "Baloo 2", system-ui, sans-serif';
  lineas(tr('¿Seguro? Perderás todo el progreso de esta partida.'), w - 24).slice(0, 2).forEach((l, i) => letra(l, W / 2, y + 40 + i * 11, 8, '#fff', 'center', null, 0, 700));
  OPC.botones = [];
  const r1 = { x: x + 10, y: y + h - 32, w: (w - 30) / 2, h: 22 }, r2 = { x: x + 20 + (w - 30) / 2, y: y + h - 32, w: (w - 30) / 2, h: 22 };
  boton(tr('SALIR'), r1.x, r1.y, r1.w, r1.h, '#ff6b6b'); OPC.botones.push({ ...r1, id: 'salir-si' });
  boton(tr('SEGUIR'), r2.x, r2.y, r2.w, r2.h); OPC.botones.push({ ...r2, id: 'salir-no' });
}
function salirAlMenu() {
  OPC.abierto = false; OPC.confirma = false;
  terminaTutorial(); guarda();
  alMenu(PARTIDA.tipo === 'mundo' ? 'mapa' : 'menu');
}

function toqueOpciones(x, y) {
  if (OPC.t < 0.2) return;
  const b = OPC.botones.find(r => dentro(r, x, y)); if (!b) return;
  if (b.id === 'cerrar' || b.id === 'salir-no') { if (OPC.confirma) { OPC.confirma = false; SONIDO.boton(); } else cierraOpciones(); return; }
  if (b.id === 'salir') { OPC.confirma = true; SONIDO.boton(); return; }
  if (b.id === 'salir-si') { SONIDO.boton(); salirAlMenu(); return; }
  if (b.id === 'musica') { SAVE.musica = SAVE.musica ? 0 : 1; applyVolume(); }
  else if (b.id === 'efectos') SAVE.efectos = SAVE.efectos ? 0 : 1;
  else if (b.id === 'daltonico') SAVE.daltonico = SAVE.daltonico ? 0 : 1;
  else SAVE.control = b.id.slice(8);
  guarda(); SONIDO.boton();
}
