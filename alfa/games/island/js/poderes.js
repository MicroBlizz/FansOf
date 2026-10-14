// Fans of Island · PODERES: lo que hace cada transformación mientras dura. FUEGO quema las barreras de hilo al tocarlas (barrera.t === 'barrera'
// en nivel.js). BROTE hace crecer una planta bajo los pies, en suelo de plastelina, que sube al personaje y se marchita al rato.
'use strict';
const IS_PODER_C = { brote: { w: 44, h: 12, sube: 95, tarda: 0.9, dura: 5, usos: 3 }, fuego: { quema: 0.6 }, agua: { alcance: 85, disuelve: 0.8 }, riego: { sube: 105, tarda: 1, dura: 4, ancho: 24 }, vapor: { w: 70, h: 12, sube: 105, tarda: 1.2, dura: 5, cadaVez: 6 } };
const IS_PODERES = {
  fuego(p, inp, dt, m) {
    for (const b of m.plataformas) {
      if (b.t !== 'barrera' || b.quemando) continue;
      if (p.x < b.x + b.w + 5 && p.x + p.w > b.x - 5 && p.y < b.y + b.h && p.y + p.h > b.y) { b.quemando = IS_PODER_C.fuego.quema; b.solida = false; play('boom', 0.35); }
    }
  },
  brote(p, inp, dt, m) {
    if (!inp.accionPulsa || !p.suelo || p.lleva || p.brote) return;
    if (p.companero && isPuedeCoger(p, p.companero)) return;   // con el compañero al lado, la acción es cogerlo: la planta puede esperar
    const bajo = isSueloBajo(p.x + p.w / 2, p.y + p.h, m.plataformas, 4);
    if (!bajo || (bajo.t !== 'suelo' && bajo.t !== 'bloque')) return;
    const K = IS_PODER_C.brote, b = { t: 'brote', id: 'b' + p.def.id + Math.round(m.t * 100), x: p.x + p.w / 2 - K.w / 2, y: p.y + p.h - K.h, w: K.w, h: K.h, x0: 0, y0: p.y + p.h - K.h, solida: false, dx: 0, dy: 0, mov: { brote: true }, edad: 0, dueno: p };
    m.plataformas.push(b); p.brote = b; p.y = b.y - p.h; p.plataforma = b; play('deploy', 0.5);
    p.poder.usos = (p.poder.usos || 0) + 1; inp.accionPulsa = 0;
    if (p.poder.usos >= K.usos) p.poder.resto = Math.min(p.poder.resto, K.dura + 0.5);
  },
};
// IMÁN: mientras se mantiene la acción, el compañero (o su burbuja) vuela hacia quien tiene el poder
IS_PODERES.iman = function (p, inp, dt, m) {
  const c = p.companero; if (!c || !inp.accion || c.llevadoPor || p.lleva) return;
  const K = IS_C.iman, dx = isCentro(p).x - isCentro(c).x, dy = isCentro(p).y - isCentro(c).y;
  if (Math.hypot(dx, dy) > K.alcance || Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
  if (c.estado === 'burbuja') { c.x += dx * Math.min(1, dt * 3); c.y += dy * Math.min(1, dt * 3); return; }
  c.lanzado = true; c.suelo = false; c.plataforma = null; c.flotando = false;
  c.vx = Math.sign(dx) * K.vx; c.vy = clamp(dy * K.vy, -330, 190); c.mira = dx > 0 ? 1 : -1;
  p.anim.iman = 1;
};
// AGUA: mientras se mantiene la acción, un chorro por delante disuelve las manchas de pintura (t: 'mancha') y, si moja a un compañero
// con FUEGO, el vapor forma una nube bajo él que sube a quien esté encima (combo de los dos poderes). Regar el BROTE del compañero lo hace
// crecer el doble y durar más (segundo combo).
IS_PODERES.agua = function (p, inp, dt, m) {
  if (!inp.accion || p.lleva) return;
  const K = IS_PODER_C.agua, chorro = { x: p.mira > 0 ? p.x + p.w : p.x - K.alcance, y: p.y + 5, w: K.alcance, h: p.h - 5 };
  p.anim.agua = 1;
  for (const b of m.plataformas) {
    if (b.t === 'mancha' && !b.quemando && isSolapa(chorro, b)) { b.quemando = K.disuelve; b.solida = false; play('poof'); }
    else if (b.t === 'brote' && !b.regado && b.dueno !== p && isSolapa(chorro, { x: b.x, y: b.y0 - IS_PODER_C.brote.sube, w: b.w, h: b.y0 + b.h - (b.y0 - IS_PODER_C.brote.sube) })) {   // regar la planta del compañero: crece el doble y aguanta más
      const R = IS_PODER_C.riego; b.regado = 0; b.x -= R.ancho / 2; b.w += R.ancho; play('heal');
      if (!IS_P.regadoAvisado) { IS_P.regadoAvisado = true; IS_P.aviso = 4; IS_P.avisoTexto = tr('¡Planta regada! Crece el doble y aguanta más: BROTE + AGUA.'); }
    }
  }
  const c = p.companero;
  if (c && c.estado === 'normal' && c.poder && c.poder.tipo === 'fuego' && isSolapa(chorro, c) && (!c.poder.vaporT || c.poder.vaporT <= 0)) {
    const V = IS_PODER_C.vapor, y0 = c.y + c.h - V.h;
    const nube = { t: 'vapor', id: 'v' + Math.round(m.t * 100), x: c.x + c.w / 2 - V.w / 2, y: y0, w: V.w, h: V.h, x0: 0, y0, solida: false, dx: 0, dy: 0, mov: { brote: true }, edad: 0 };
    m.plataformas.push(nube); c.y = y0 - c.h; c.plataforma = nube; c.suelo = true;
    if (p.suelo && p.x < nube.x + nube.w && p.x + p.w > nube.x) { p.y = y0 - p.h; p.plataforma = nube; }   // si quien rocía está pegado, sube también
    c.poder.vaporT = V.cadaVez; play('heal');
  }
};
// ESCUDO: no hace nada activo; enemigos.js se lo lleva al primer golpe. Si lleva al compañero a cuestas, lo cubre también.
IS_PODERES.escudo = function (p, inp, dt, m) { if (p.lleva && p.lleva.invulnerable < 0.2) p.lleva.invulnerable = 0.2; };
const IS_PODERES_FIN = { brote(p) { /* la planta que esté creciendo sigue hasta marchitarse */ } };
function isBrotesActualiza(m, dt) {   // las plantas y las nubes de vapor suben, aguantan y se deshacen (se quitan de la lista); lo quemado o disuelto se consume
  for (const p of IS_P.jugadores) if (p.poder && p.poder.vaporT > 0) p.poder.vaporT -= dt;
  for (let i = m.plataformas.length - 1; i >= 0; i--) {
    const b = m.plataformas[i];
    if (b.t === 'brote' || b.t === 'vapor') {
      const K = IS_PODER_C[b.t];
      b.edad += dt; const k = Math.min(1, b.edad / K.tarda); let ny = b.y0 - K.sube * (1 - Math.pow(1 - k, 3));
      const R = IS_PODER_C.riego, regado = b.regado !== undefined;
      if (regado) { b.regado += dt; const kr = Math.min(1, b.regado / R.tarda); ny -= R.sube * (1 - Math.pow(1 - kr, 3)); }   // la segunda subida, al regarla
      b.dy = ny - b.y; b.y = ny; b.dx = 0;
      if (b.edad > K.tarda + K.dura + (regado ? R.dura : 0)) { if (b.dueno && b.dueno.brote === b) b.dueno.brote = null; m.plataformas.splice(i, 1); }
    } else if ((b.t === 'barrera' || b.t === 'puerta' || b.t === 'mancha') && b.quemando) { b.quemando -= dt; if (b.quemando <= 0) m.plataformas.splice(i, 1); }
  }
}
