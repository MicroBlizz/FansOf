// Fans of Panic · Final del nivel: al ganar, la ilustración destapada con sus estrellas, las fichas y una frase de Lola;
// al perder, qué te ha matado y SEGUIR (por fichas o con un anuncio de mentira, hasta que haya anuncios de verdad).
'use strict';

function pintaFin(W, H) {
  const J = JUEGO, f = J.fin, M = MUNDOS[J.mundo], tf = Math.min(1, J.tFin * 2);
  G.fillStyle = `rgba(13,5,22,${0.75 * tf})`; G.fillRect(0, 0, W, H);
  if (f.gana) pintaGana(W, H, M, tf); else pintaPierde(W, H, M, tf);
}

function pintaGana(W, H, M, tf) {
  const J = JUEGO, f = J.fin, cy = 70;
  letra(tr('¡DESTAPADA!'), W / 2, cy, 34 * tf, COL.oro);
  letra(`${Math.round(J.pct * 100)} %`, W / 2, cy + 36, 20, COL.blanco);
  // la ilustración entera, pequeña
  if (ILUS.lienzo) { const w = 150, h = 200; caja(W / 2 - w / 2 - 4, cy + 56, w + 8, h + 8, 8, COL.blanco, COL.tinta, 2); G.drawImage(ILUS.lienzo, W / 2 - w / 2, cy + 60, w, h); }
  for (let k = 0; k < 3; k++) { const on = k < f.est && J.tFin > 0.6 + k * 0.3; estrella(W / 2 - 40 + k * 40, cy + 290, on ? 18 + Math.max(0, 4 - (J.tFin - 0.6 - k * 0.3) * 20) : 14, on); }
  letra(tr('Puntos: {n}', { n: J.puntos }) + (f.bonus ? `  (+${f.bonus} ${tr('tiempo')})` : ''), W / 2, cy + 322, 14, COL.blanco);
  ficha(W / 2 - 30, cy + 348, 10); letra(`+${f.fichas}`, W / 2 - 14, cy + 349, 16, COL.oro, 'left');
  parrafo('Lola: ' + tr(CHARLA[J.mundo][J.n - 1]), W / 2, cy + 380, W - 50, 12, M.claro);
  const sig = J.n < M.niveles.length ? () => entraNivel(J.mundo, J.n + 1) : () => { alMenu('mapa'); MAPA.mundo = Math.min(ORDEN_MUNDOS.length - 1, ORDEN_MUNDOS.indexOf(J.mundo) + 1); };
  botonUI(J.n < M.niveles.length ? tr('SIGUIENTE') : tr('AL MAPA'), W / 2 - 100, H - 100, 200, 48, sig, COL.rosa, COL.tinta, 18); UI.enter = sig;
  botonUI(tr('REPETIR'), W / 2 - 100, H - 46, 96, 34, () => entraNivel(J.mundo, J.n), COL.panel, COL.blanco, 13);
  botonUI(tr('MAPA'), W / 2 + 4, H - 46, 96, 34, () => { alMenu('mapa'); MAPA.mundo = ORDEN_MUNDOS.indexOf(J.mundo); }, COL.panel, COL.blanco, 13);
  UI.atras = () => alMenu('mapa');
}

function pintaPierde(W, H, M, tf) {
  const J = JUEGO, f = J.fin, cy = H * 0.3;
  letra(f.motivo === 'tiempo' ? tr('¡SE ACABÓ EL TURNO!') : tr('¡TAPADA!'), W / 2, cy, 30 * tf, '#ff6b6b');
  letra(`${Math.round(J.pct * 100)} % ${tr('de')} ${Math.round(AJUSTES.objetivo * 100)} %`, W / 2, cy + 36, 18, COL.blanco);
  parrafo(f.motivo === 'tiempo' ? tr('Microblizz ha cerrado la oficina. Mañana más.') : f.motivo === 'becario' ? tr('Un becario-robot te ha pillado en el borde.') : f.motivo === 'mecha' ? tr('La mecha ha llegado al cúter.') : tr('El Inspector ha tocado tu corte.'), W / 2, cy + 70, W - 60, 13, COL.blanco);
  if (puedeSeguir()) {
    letra(tr('SEGUIR: +15 s, escudo y una vida'), W / 2, cy + 120, 13, COL.oro);
    const conFichas = () => { if (SAVE.fichas < AJUSTES.seguirFichas) { toast(tr('Te faltan fichas')); return; } SAVE.fichas -= AJUSTES.seguirFichas; guarda(); sigue(); };
    botonUI(tr('{n} FICHAS', { n: AJUSTES.seguirFichas }), W / 2 - 110, cy + 140, 106, 44, conFichas, SAVE.fichas >= AJUSTES.seguirFichas ? COL.rosa : COL.panel, SAVE.fichas >= AJUSTES.seguirFichas ? COL.tinta : COL.gris, 14);
    if (J.seguidos === 0) botonUI(tr('VER ANUNCIO'), W / 2 + 4, cy + 140, 106, 44, () => { toast(tr('(Anuncio de mentira: aquí irá uno de verdad)')); sigue(); }, COL.verde, COL.tinta, 13);
  }
  botonUI(tr('REPETIR'), W / 2 - 100, H - 100, 200, 48, () => entraNivel(J.mundo, J.n), COL.oro, COL.tinta, 18); UI.enter = () => entraNivel(J.mundo, J.n);
  botonUI(tr('AL MAPA'), W / 2 - 100, H - 46, 200, 34, () => { alMenu('mapa'); MAPA.mundo = ORDEN_MUNDOS.indexOf(J.mundo); }, COL.panel, COL.blanco, 13);
  UI.atras = () => alMenu('mapa');
}
