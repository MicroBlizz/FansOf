// Fans of Roguelite · El tutorial: la primera vez de cada cosa, el juego se para, oscurece la pantalla y señala con una flecha
// lo que hay que mirar (el mapa, la casita para volver a La Madriguera, la barra del Zanahorazo, el nivel de despido), con
// una explicación corta. Un toque lo cierra y el juego sigue. Cada uno sale una sola vez (se apunta en GUARDA.consejos).
'use strict';

const TUTO_TEXTO = {
  mapa: 'Este es el mapa del capítulo: cada casilla es un día y la cabeza del conejo marca dónde estás. La banderita es el final del capítulo.',
  casa: 'La casita te lleva a La Madriguera cuando quieras: tócala dos veces. Tu partida queda guardada y luego sigues con «Continuar».',
  zana: '¡Zanahorazo listo! La barra naranja está llena: toca la pantalla y CrazyBunny suelta un golpe x3. También puedes guardarlo para el jefe.',
  despido: 'El nivel de despido es la dificultad: cámbialo con < y >. Cuanto más alto, enemigos más duros y más monedas. Ganando un mundo se abre el siguiente.',
  nivelPartida: 'Arriba pone el nivel de despido de esta partida. Lo eliges en Jugar, antes de empezar.',
};
let TUTO = null;            // el que se ve ahora: { id, t0, vel, ok }
const TUTO_SITIO = {};      // dónde está cada cosa en la pantalla (lo apuntan al pintarse): { x, y, w, h }

// enseña uno (si no se ha visto ya); devuelve una promesa que se cumple al cerrarlo
function tutorial(id) {
  if (TUTO || GUARDA.consejos['t_' + id] || !TUTO_TEXTO[id]) return Promise.resolve();
  GUARDA.consejos['t_' + id] = 1; guarda();
  sonido('alerta');
  return new Promise(ok => { TUTO = { id, t0: performance.now(), vel: RELOJ.vel, ok }; RELOJ.vel = 0; });
}
// un toque con el tutorial abierto lo cierra (nada más: no pulsa lo de debajo)
function cierraTutorial() {
  if (!TUTO || performance.now() - TUTO.t0 < 450) return !!TUTO;
  const t = TUTO; TUTO = null; RELOJ.vel = t.vel || 1; sonido('toque'); t.ok();
  return true;
}

function pintaTutorial(ctx, W, alto) {
  if (!TUTO) return;
  const r = TUTO_SITIO[TUTO.id === 'nivelPartida' ? 'nivel' : TUTO.id], t = (performance.now() - TUTO.t0) / 1000;
  // lo señalado se guarda antes de oscurecer y se vuelve a poner encima: se ve con su color, lo demás, apagado
  const foto = r ? ctx.getImageData(r.x, r.y, r.w, r.h) : null;
  ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#0c0614'; ctx.fillRect(0, 0, W, alto); ctx.restore();
  let yc = alto / 2;
  if (r) {   // el marco que parpadea alrededor de lo señalado y la flecha que salta
    const c = Math.floor(t * 4) % 2 ? '#fff6ea' : COL.oro;
    ctx.fillStyle = OL; ctx.fillRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6);
    ctx.fillStyle = c; ctx.fillRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4);
    ctx.fillStyle = OL; ctx.fillRect(r.x - 1, r.y - 1, r.w + 2, r.h + 2);
    ctx.putImageData(foto, r.x, r.y);
    const abajo = r.y + r.h / 2 < alto / 2, bote = Math.round(Math.sin(t * 7) * 2);
    const fx = Math.max(10, Math.min(W - 10, Math.round(r.x + r.w / 2))), fy = abajo ? r.y + r.h + 6 + bote : r.y - 6 - bote;
    for (let i = 0; i < 5; i++) {   // flecha de píxeles hacia lo señalado
      const y = abajo ? fy + i : fy - i;
      ctx.fillStyle = OL; ctx.fillRect(fx - i - 1, y, i * 2 + 3, 1);
      ctx.fillStyle = c; ctx.fillRect(fx - i, y, i * 2 + 1, 1);
    }
    ctx.fillStyle = OL; ctx.fillRect(fx - 2, abajo ? fy + 5 : fy - 9, 5, 5); ctx.fillStyle = c; ctx.fillRect(fx - 1, abajo ? fy + 5 : fy - 9, 3, 5);
    yc = abajo ? fy + 14 : fy - 14;
  }
  // la explicación, en su caja (debajo de lo señalado si está arriba, encima si está abajo)
  const ls = envuelve(tr(TUTO_TEXTO[TUTO.id]), W - 28), h = ls.length * LINEA + 20;
  const arriba = r && r.y + r.h / 2 >= alto / 2, y = Math.max(4, Math.min(alto - h - 4, arriba ? yc - h : yc));
  marco(ctx, 6, y, W - 12, h, '#26143c', COL.oro);
  ls.forEach((l, i) => escribe(ctx, l, 12, y + 5 + i * LINEA, { c: COL.tinta }));
  if (t > 0.45 && Math.floor(t * 2) % 2 === 0) { const s = tr('TOCA PARA SEGUIR'); escribeMini(ctx, s, W / 2 - Math.round(anchoMini(s) / 2), y + h - 10, COL.oro); }
}
