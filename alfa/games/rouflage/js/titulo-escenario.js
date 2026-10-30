// Fans of Rouflage · MI ESCENARIO EN EL TÍTULO (pedido por Daniel el 25-10-2026: «Mi escenario es bastante importante ahora»). Una tarjeta ancha
// debajo de EN LÍNEA con una foto pequeña de TU escenario de verdad (el suelo, la pintura, las pegatinas y los muebles, como en el editor) y que
// abre el editor. Antes solo se llegaba desde el PERFIL. La foto se rehace al volver al título solo si el escenario ha cambiado.
// La llama refrescaTitulo (titulo.js). Estilos en estilo-ayuda.css.
'use strict';

const TIT_ESC = { clave: '' };

function titEscPrepara() {
  if (E('b-tit-esc')) return;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'tit-esc'; b.id = 'b-tit-esc';
  b.innerHTML = '<canvas width="208" height="132"></canvas><span class="tit-esc-txt"><b class="ol"></b><span></span></span><i data-icono="flecha"></i>';
  ponIcono(b.querySelector('i'), 'flecha');
  b.onclick = () => { play('select'); abreEscenario(); };
  const pvp = document.querySelector('#p-titulo .tit-pvp-caja'); if (pvp) pvp.after(b);
}
// la foto: el trozo con más muebles (o la entrada, si aún no hay), del tamaño justo para que se vea bien
function titEscFoto(cv) {
  const sala = escenarioSala(), M = escMundo(sala.id), c = cv.getContext('2d');
  const clave = JSON.stringify(escenarioDatos()); if (clave === TIT_ESC.clave) return; TIT_ESC.clave = clave;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0b0f1c'; c.fillRect(0, 0, cv.width, cv.height);
  const ms = sala.muebles || [];
  let cx, cy;
  if (ms.length) {      // el mueble con más muebles cerca: ahí se ve mejor lo que has hecho
    const mejor = ms.map(m => [m, ms.filter(o => Math.hypot(o.x - m.x, o.y - m.y) < 220).length]).sort((a, b) => b[1] - a[1])[0][0];
    cx = mejor.x; cy = mejor.y - 30;
  }
  else { const s = M.salida || [M.origen[0] + 200, M.origen[1] + 200]; cx = s[0]; cy = s[1]; }
  const ancho = 400, s = cv.width / ancho, alto = cv.height / s;
  cx = Math.max(ancho / 2, Math.min(M.W - ancho / 2, cx)); cy = Math.max(alto / 2, Math.min(M.H - alto / 2, cy));
  const R = { x0: cx - ancho / 2, y0: cy - alto / 2, x1: cx + ancho / 2, y1: cy + alto / 2 };
  c.setTransform(s, 0, 0, s, -R.x0 * s, -R.y0 * s);
  try {
    escPintaTrozo(c, M, R, sala.pint, escKs(s));
    pegPintaSala(c, sala, R);
    salaPintaCosas(c, sala, R, { k: escKs(s), personajes: [], sel: null, pops: {} });
  } catch (_) { TIT_ESC.clave = ''; }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
function titEscPinta() {
  titEscPrepara(); const b = E('b-tit-esc'); if (!b) return;
  b.querySelector('b').textContent = tr('MI ESCENARIO');
  b.querySelector('.tit-esc-txt > span').textContent = tr('Decóralo, constrúyelo y juega ahí con tus amigos');
  try { titEscFoto(b.querySelector('canvas')); } catch (_) { /* sin foto: la tarjeta sirve igual */ }
}
