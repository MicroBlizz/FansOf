// Fans of Beams · Mini tutorial de 3 páginas: sale solo la primera vez que juegas y se puede volver a ver desde el título.
'use strict';
const TUTO_PAGS = () => {
  const tac = mostrarTactil() && !PAD.hay, mv = ['arr', 'izq', 'abj', 'der'].map(a => nombreTecla(OPC.teclas[a].filter(Boolean).sort((x, y) => x.length - y.length)[0])), mover = mv.some(x => x.length > 3) ? 'las FLECHAS' : mv.join(' ');
  return [
    { t: 'MOVERTE Y DISPARAR', col: '#7fe8ff', l: tac
      ? ['Arrastra el pulgar izquierdo: la palanca flota donde lo pongas.', 'Pulsa el botón de DISPARO de la derecha para disparar.', 'Si prefieres que dispare solo: Opciones > Táctil > Disparo automático.', 'Esquiva las balas: el escudo, tus aliados y tu clase te protegen antes de perder una vida.']
      : ['Mueve la nave con ' + mover + '.', 'Dispara con ' + tk('disp') + ' (mantén pulsado).', 'Esquiva las balas: el escudo, tus aliados y tu clase te protegen antes de perder una vida.', 'Pausa con ' + tk('pausa') + '. Todas las teclas se cambian en Opciones.'] },
    { t: 'CAPTURA: HAZ AMIGOS', col: '#8dff9a', l: [(tac ? 'Botón CAPTURA' : tk('capt')) + ' lanza una bola de captura.', 'Si toca un enemigo común, pasa a ser tu aliado y te protege.', 'Los minijefes hay que debilitarlos antes (menos de la mitad de vida):', 'si lo capturas, te presta su habilidad: misiles, onda o rayo.'] },
    { t: 'SUPER RAYO Y MEJORAS', col: '#ffd03c', l: [(tac ? 'Botón RAYO' : tk('rayo')) + ': un aliado se sacrifica y lanza un rayo gigante.', 'Recoge la burbuja azul: te protege de un golpe.', 'El núcleo de evolución sube tu nave de clase (Caza hasta Nave jefe).', 'Encadena bajas para subir el combo y la puntuación. ¡Suerte, piloto!'] }
  ];
};
function envuelve(s, n) { const o = []; let l = ''; for (const w of s.split(' ')) { if ((l + ' ' + w).trim().length > n) { o.push(l); l = w; } else l = (l + ' ' + w).trim(); } if (l) o.push(l); return o; }
function empiezaTuto(vuelta) { S.tutoVuelta = vuelta; S.tutoPag = 0; S.estado = 'tuto'; }
function tutoFin() { OPC.tuto.visto = true; guardaOpc(); S.estado = S.tutoVuelta === 'titulo' ? 'titulo' : 'jugando'; }
function tutoSig() { if (S.tutoPag >= TUTO_PAGS().length - 1) tutoFin(); else S.tutoPag++; }
function dibujaTuto() {
  const P3 = TUTO_PAGS(), pg = P3[S.tutoPag], x0 = W / 2 - 340;
  c.save(); c.fillStyle = 'rgba(4,7,18,0.78)'; c.fillRect(0, 0, W, H); c.restore();
  panel(x0, 70, 680, 360, pg.col, 14, 0.82);
  txt('TUTORIAL ' + (S.tutoPag + 1) + '/' + P3.length, W / 2, 104, 14, '#8ab4ff', 'center', { f: 'mini' });
  txt(pg.t, W / 2, 148, 34, pg.col, 'center', { f: 'logo' });
  let y = 198; pg.l.forEach((s, i) => { for (const ln of envuelve(s, 62)) { txt(ln, x0 + 36, y, 17, i === 0 ? '#ffffff' : '#cfe0ff', 'left'); y += 24; } y += 11; });
  for (let i = 0; i < P3.length; i++) { c.fillStyle = i === S.tutoPag ? pg.col : 'rgba(255,255,255,0.25)'; c.beginPath(); c.arc(W / 2 - 20 + i * 20, 416, 5, 0, 6.283); c.fill(); }
  boton(x0 + 380, 446, 300, 56, S.tutoPag === P3.length - 1 ? 'A JUGAR' : 'SIGUIENTE', tutoSig, { tam: 24, borde: '#ffe9a3', nav: false });
  boton(x0, 454, 150, 42, 'SALTAR', tutoFin, { tam: 16, nav: false });
}
