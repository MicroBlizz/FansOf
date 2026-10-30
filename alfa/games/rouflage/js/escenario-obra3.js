// Fans of Rouflage · CONSTRUIR, parte 3: DÓNDE EMPIEZAN LOS COLADOS (pedido por Daniel el 25-10-2026). Con la herramienta COLADOS tocas la sala
// donde aparecen los colados al empezar (lz.c, una casilla; sin marca, salen lo más lejos de los becarios, escenario-obra.js). No puede ser la
// sala de los becarios: esa se cierra con barreras hasta la caza (barreras.js), así que nadie se puede esconder ahí. Se ve en verde en CONSTRUIR.
'use strict';

function obraColados(lz, p) {
  const i = Math.floor(p.x / 40), j = Math.floor(p.y / 40), k = j * LIENZO.W + i;
  if (!lzDentro(lz, i, j) || lz.g[k] === '#' || lz.g[k] === '+') { play('deny'); escAviso(tr('Toca el suelo de una sala')); return; }
  const z = escMundo(lzSala().id).esperaZona, [x, y] = lzCentro(k);
  if (z && x >= z.px && x < z.px + z.pw && y >= z.py && y < z.py + z.ph) { play('deny'); escAviso(tr('Los colados no pueden empezar en la sala de los becarios')); return; }
  OBRA.pasos.push(lzCopia(lz)); lz.c = k; OBRA.uso.colados = 1; play('pop'); obraRehace(); escGuarda();
  escAviso(tr('Aquí empiezan los colados (en verde)'));
}
// en CONSTRUIR: el corro verde donde salen los colados
function obraPintaColados(c, M) {
  if (!M || !M.salida) return;
  const [x, y] = M.salida;
  c.fillStyle = 'rgba(47,214,160,0.22)'; c.beginPath(); c.arc(x, y - 10, 58, 0, TAU); c.fill();
  c.strokeStyle = '#2fd6a0'; c.lineWidth = 4; c.setLineDash([12, 8]); c.beginPath(); c.arc(x, y - 10, 58, 0, TAU); c.stroke(); c.setLineDash([]);
  rotulo(c, tr('COLADOS'), x, y - 10, 15, '#d6fff0', OL, LETRA_UI);
}
// COMPROBAR: los colados no pueden empezar dentro de la sala de los becarios
function lzProblemaColados(lz, M, z, marca) {
  if (!z || !M.salida) return '';
  const [x, y] = M.salida;
  if (x >= z.px && x < z.px + z.pw && y >= z.py && y < z.py + z.ph) {
    marca(k => { const [cx, cy] = lzCentro(k); return cx >= z.px && cx < z.px + z.pw && cy >= z.py && cy < z.py + z.ph; });
    return tr('Los colados empiezan en la sala de los becarios: marca otra sala con COLADOS');
  }
  return '';
}
