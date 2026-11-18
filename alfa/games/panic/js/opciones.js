// Fans of Panic · Opciones (y la pausa del nivel): música, efectos, vibración, cómo se juega, salir al mapa y empezar de nuevo.
'use strict';

const OPC = { abierto: false, t: 0, botones: [], ayuda: false };

function abreOpciones() { OPC.abierto = true; OPC.t = 0; OPC.ayuda = false; }
function cierraOpciones() { OPC.abierto = false; applyVolume(); }

function pintaOpciones(W, H) {
  OPC.botones = [];
  G.fillStyle = 'rgba(13,5,22,.8)'; G.fillRect(0, 0, W, H);
  if (OPC.ayuda) { pintaAyuda(W, H); return; }
  const x = 40, w = W - 80; let y = 90;
  letra(JUEGO.modo === 'juego' ? tr('PAUSA') : tr('OPCIONES'), W / 2, 54, 28, COL.rosa);
  const fila = (txt, on, accion) => { OPC.botones.push(botonUI(`${txt}: ${on ? tr('SÍ') : tr('NO')}`, x, y, w, 44, accion, on ? COL.verde : COL.panel, on ? COL.tinta : COL.blanco, 15)); y += 54; };
  fila(tr('MÚSICA'), SAVE.musica, () => { SAVE.musica = SAVE.musica ? 0 : 1; guarda(); applyVolume(); });
  fila(tr('EFECTOS'), SAVE.efectos, () => { SAVE.efectos = SAVE.efectos ? 0 : 1; guarda(); });
  fila(tr('VIBRACIÓN'), SAVE.vibra, () => { SAVE.vibra = SAVE.vibra ? 0 : 1; guarda(); });
  OPC.botones.push(botonUI(tr('CÓMO SE JUEGA'), x, y, w, 44, () => { OPC.ayuda = true; }, COL.oro, COL.tinta, 15)); y += 54;
  if (JUEGO.modo === 'juego') { OPC.botones.push(botonUI(tr('SALIR AL MAPA'), x, y, w, 44, () => { cierraOpciones(); alMenu('mapa'); }, COL.panel, COL.blanco, 15)); y += 54; }
  else { OPC.botones.push(botonUI(tr('EMPEZAR DE NUEVO'), x, y, w, 44, borraTodo, COL.panel, COL.blanco, 15)); y += 54; }
  const seguir = () => cierraOpciones();
  OPC.botones.push(botonUI(JUEGO.modo === 'juego' ? tr('SEGUIR') : tr('VOLVER'), x, y + 10, w, 50, seguir, COL.rosa, COL.tinta, 18)); UI.enter = seguir;
}

function pintaAyuda(W, H) {
  letra(tr('CÓMO SE JUEGA'), W / 2, 54, 24, COL.oro);
  const lineas = [tr('Desliza el dedo: el cúter va hacia allí y no para hasta que deslices otra vez (un toque lo para).'), tr('Por el borde destapado vas seguro. Entra en el panel gris y vuelve al borde: lo que cierres sin el Inspector dentro se destapa.'), tr('Si el Inspector toca tu corte, o un becario te pilla, pierdes una vida. Si te paras a medio corte, arde la mecha.'), tr('Destapa el 80 % de la ilustración para ganar; el 90 % y el 100 % dan más estrellas. Acorrala al Inspector y lo destapas todo.'), tr('Cortes seguidos hacen COMBO. Los objetos del panel se cogen destapándolos: Hielo, Escudo y Tijera.')];
  let y = 90;
  for (const l of lineas) { y += parrafo(l, W / 2, y, W - 60, 13, COL.blanco) + 14; }
  const volver = () => { OPC.ayuda = false; };
  OPC.botones.push(botonUI(tr('VOLVER'), 40, H - 80, W - 80, 48, volver, COL.rosa, COL.tinta, 16)); UI.enter = volver;
}

function toqueOpciones(x, y) { toqueUI(x, y); }

function borraTodo() {
  confirmBox(tr('EMPEZAR DE NUEVO'), tr('Se borran las estrellas, las fichas y la galería de este navegador.'), tr('BORRAR'), () => {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* da igual */ }
    location.reload();
  });
}
