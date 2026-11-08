// Fans of Panic · Portada: el título, la historia en dos líneas, las fichas y los corazones, y los botones JUGAR, GALERÍA y OPCIONES.
'use strict';

// un fondo de Yoshi a pantalla completa (recortado sin deformar); si no está, el color liso del juego
function pintaFondo(nombre, W, H, col = COL.fondo) {
  const im = sprite(nombre);
  G.fillStyle = col; G.fillRect(0, 0, W, H);
  if (!im) return false;
  const esc = Math.max(W / im.width, H / im.height), iw = im.width * esc, ih = im.height * esc;
  G.drawImage(im, (W - iw) / 2, (H - ih) / 2, iw, ih);
  return true;
}

function pintaPortada(W, H) {
  const t = JUEGO.t;
  pintaFondo('portada-fondo', W, H);
  if (sprite('logo')) pintaSprite('logo', W / 2, H * 0.2 + Math.sin(t * 3) * 2, H * 0.24);
  else { letra('FANS OF', W / 2, H * 0.17, 26, COL.blanco); letra('PANIC', W / 2 + Math.sin(t * 3) * 2, H * 0.17 + 48, 70, COL.rosa, 'center', COL.tinta, 8); }
  caja(W / 2 - 110, H * 0.17 + 92, 220, 22, 11, COL.oro, COL.tinta, 2);
  letra(tr('RECORTA · ESQUIVA · DESTAPA'), W / 2, H * 0.17 + 104, 13, COL.tinta, 'center', null, 0);
  parrafo(tr('Microblizz ha tapado las portadas de la revista PANIC! con paneles grises. Tú tienes el cúter.'), W / 2, H * 0.17 + 140, W - 50, 14, COL.blanco);
  // fichas y corazones
  ficha(W / 2 - 60, H * 0.5, 11); letra(String(SAVE.fichas), W / 2 - 42, H * 0.5 + 1, 16, COL.blanco, 'left');
  for (let i = 0; i < AJUSTES.vidas; i++) corazon(W / 2 + 14 + i * 22, H * 0.5, 8, i < SAVE.vidas);
  const sv = segundosVida(); if (sv) letra(`${Math.floor(sv / 60)}:${String(sv % 60).padStart(2, '0')}`, W / 2 + 66, H * 0.5 + 20, 11, COL.gris);
  const jugar = () => { alMenu('mapa'); };
  botonUI(tr('JUGAR'), W / 2 - 110, H * 0.58, 220, 56, jugar, COL.rosa, COL.tinta, 24); UI.enter = jugar;
  botonUI(tr('GALERÍA'), W / 2 - 110, H * 0.58 + 70, 106, 44, () => alMenu('galeria'), COL.oro, COL.tinta, 15);
  botonUI(tr('OPCIONES'), W / 2 + 4, H * 0.58 + 70, 106, 44, abreOpciones, COL.panel, COL.blanco, 15);
  letra(tr('Récord: {n}', { n: SAVE.record }), W / 2, H - 28, 12, COL.gris);
}
