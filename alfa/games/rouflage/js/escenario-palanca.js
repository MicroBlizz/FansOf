// Fans of Rouflage · MI ESCENARIO (la palanca): en PASEAR llevas tu galleta como en la partida. Un dedo arrastrado (o el ratón) saca una palanca
// bajo el dedo y la galleta va hacia donde la empujas, con la cámara detrás; tocar sin arrastrar sigue yendo andando a ese sitio; dos dedos, zoom.
// La galleta se dibuja con el mismo cuerpo que en la partida (pintaAlubia: anda moviendo brazos y piernas, respira y parpadea), vestida con lo del
// armario y con su mascota detrás. Lo usan escenario-camara.js (los dedos), escenario.js (escAnda y escPintaYo). Va después de escenario-camara.js.
'use strict';
const ESCPAL = { el: null, radio: 46 };

function escPalancaPrepara() {
  if (ESCPAL.el) return;
  const d = ESCPAL.el = document.createElement('div');
  d.className = 'esc-palanca'; d.hidden = true; d.innerHTML = '<i></i>';
  E('p-escenario').appendChild(d);
}
// el dedo se mueve: la palanca sale donde empezó y, si te alejas mucho, la base te sigue (como en la partida)
function escPalancaMueve(t, x, y) {
  let p = MIESC.palanca;
  if (!p) p = MIESC.palanca = { x0: t.x0, y0: t.y0, x, y };
  p.x = x; p.y = y;
  const dx = x - p.x0, dy = y - p.y0, d = Math.hypot(dx, dy), max = ESCPAL.radio * 1.4;
  if (d > max) { p.x0 = x - dx / d * max; p.y0 = y - dy / d * max; }
  MIESC.cam.sigue = true; MIESC.camino = null; MIESC.alArmario = false;
  escPalancaPinta();
}
function escPalancaSuelta() { MIESC.palanca = null; escPalancaPinta(); }
function escPalancaPinta() {
  escPalancaPrepara();
  const p = MIESC.palanca, d = ESCPAL.el;
  d.hidden = !p; if (!p) return;
  const dx = p.x - p.x0, dy = p.y - p.y0, l = Math.hypot(dx, dy), k = l > ESCPAL.radio ? ESCPAL.radio / l : 1;
  d.style.left = p.x0 + 'px'; d.style.top = p.y0 + 'px';
  d.firstChild.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
}
// hacia dónde empuja la palanca (para escAnda): [vx, vy] o null si no hay o está en el centro
function escPalancaVector() {
  const p = MIESC.palanca; if (!p) return null;
  const dx = p.x - p.x0, dy = p.y - p.y0; return Math.hypot(dx, dy) < 10 ? null : [dx, dy];
}

// ---------- la galleta, con el cuerpo de la partida ----------
function escYoEnte() {
  const yo = MIESC.yo, ropa = MIESC.ropa || ropaDe(), clave = JSON.stringify(ropa.ids || {});
  let e = MIESC.ente;
  if (!e || e._clave !== clave) {
    const [piel, pctx] = nuevaPiel(BLANCO_PIEL);
    e = MIESC.ente = { clase: 'camaleon', tipo: 'fan', x: 0, y: 0, mira: 1, dir: 0, hielo: 0, piel, pctx, pasos: [], semilla: 3, anda: 0, alerta: 0, ciego: 0, balas: 5, moviendo: false, _clave: clave };
    e.ropa = ropa; ponPapel(e);
  }
  e.mira = yo.dir || 1; e.moviendo = yo.anda > 0.35; if (e.moviendo) e.anda = (yo.paso || 0) / 12;
  return e;
}
function escPintaYo(c) {
  const yo = MIESC.yo, e = escYoEnte(), ropa = MIESC.ropa || {};
  c.save(); c.translate(yo.x, yo.y); c.scale(0.9, 0.9);
  if (ropa.mascota && ARD.MASCOTAS && ARD.MASCOTAS[ropa.mascota]) {      // su mascota, detrás
    c.save(); c.translate(-e.mira * 24, 0); c.scale(e.mira, 1); ARD.MASCOTAS[ropa.mascota](c, { t: MIESC.t, mov: e.moviendo ? 1 : 0, susto: false, sem: 0 }); c.restore();
  }
  pintaAlubia(c, e, MIESC.t);
  c.restore();
}
