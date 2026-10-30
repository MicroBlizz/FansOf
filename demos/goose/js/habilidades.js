// Fans of Goose · LA HABILIDAD DE CADA PERSONAJE: un botón abajo a la derecha (o la tecla E) con su recarga. El Caminante hace un
// Torbellino de latigazos, la Druida echa Raíces que atrapan y curan, el Plumista da una Ráfaga (un salto rapidísimo que atraviesa), la
// Tahúr juega a Doble o nada (doble daño unos segundos), el Sepulturero da el Toque de difuntos (una onda que remata a las débiles) y la
// Peregrina pide una Bendición (escudo y cura). Las cifras están en HABILIDADES.
'use strict';

const HABILIDADES = {
  rojo:     { id: 'torbellino', nombre: 'Torbellino', desc: 'Giras dando latigazos alrededor durante 2,5 s.', recarga: 20 },
  verde:    { id: 'raices', nombre: 'Raíces', desc: 'Las ocas cercanas quedan atrapadas 3 s y te curas un 15 %.', recarga: 26 },
  azul:     { id: 'rafaga', nombre: 'Ráfaga', desc: 'Un salto rapidísimo hacia donde vas que atraviesa y pega a las ocas.', recarga: 12 },
  amarillo: { id: 'doble', nombre: 'Doble o nada', desc: 'Doble daño durante 6 s.', recarga: 24 },
  negro:    { id: 'difuntos', nombre: 'Toque de difuntos', desc: 'Una onda enorme que pega fuerte y remata a las ocas heridas.', recarga: 22 },
  blanco:   { id: 'bendicion', nombre: 'Bendición', desc: 'Nada te hace daño durante 4 s y te curas un 30 %.', recarga: 26 },
};
const habilidad = () => HABILIDADES[(JUEGO.pers || personaje()).id] || HABILIDADES.rojo;

function usaHabilidad() {
  const J = JUEGO, H = habilidad(), yo = J.yo;
  if (J.modo !== 'juego' || J.muerto > 0 || J.caida > 0 || J.salto > 0 || J.t < (J.habT || 0)) return false;
  J.habT = J.t + H.recarga;
  aviso(tr(H.nombre).toUpperCase(), '#ffd34d', 1.2); vibra(40); SONIDO.evolucion();
  if (H.id === 'torbellino') J.torbellino = 2.5;
  else if (H.id === 'raices') {
    const n = enemigosCerca(yo.x, yo.y, 85);
    for (let k = 0; k < n; k++) { const e = ENE.lista[CERCA[k]]; if (e.hp > 0 && Math.hypot(e.x - yo.x, e.y - yo.y) < 85) e.raiz = 3; }
    J.vida = Math.min(J.st.vidaMax, J.vida + J.st.vidaMax * 0.15 * J.mod.cura); anillo(yo.x, yo.y, 85, '#7dff6b', 0.6, 4); SONIDO.cura();
  } else if (H.id === 'rafaga') {
    const mx = ENTRADA.mx || yo.miraX, my = ENTRADA.my || yo.miraY, d = Math.hypot(mx, my) || 1;
    J.rafaga = { vx: mx / d * 330, vy: my / d * 330, t: 0.22 }; J.invul = Math.max(J.invul, 0.5);
  } else if (H.id === 'doble') { J.dado.efecto = 6; J.dado.quedan = 6; destella('#ffd34d', 0.4); }
  else if (H.id === 'difuntos') {
    const n = enemigosCerca(yo.x, yo.y, 110);
    for (let k = 0; k < n; k++) { const e = ENE.lista[CERCA[k]]; if (e.hp <= 0 || e.oculta) continue; const dx = e.x - yo.x, dy = e.y - yo.y, dd = Math.hypot(dx, dy) || 1; if (dd > 105) continue; danar(e, e.hp < e.hpMax * 0.3 && !e.tipo.startsWith('mj-') && e.tipo !== 'parca' && e.tipo !== 'jefe' ? e.hp + 1 : 80 * J.st.dano, dx / dd, dy / dd, 300, true); }
    anillo(yo.x, yo.y, 110, '#c9a0ff', 0.7, 5); tiembla(6);
  } else if (H.id === 'bendicion') { J.invul = Math.max(J.invul, 4); J.bendicion = 4; J.vida = Math.min(J.st.vidaMax, J.vida + J.st.vidaMax * 0.3 * J.mod.cura); anillo(yo.x, yo.y, 60, '#fff6c2', 0.8, 4); SONIDO.cura(); }
  return true;
}

// lo que dura (lo llama avanzaPartida)
function avanzaHabilidad(dt) {
  const J = JUEGO, yo = J.yo;
  if (J.torbellino > 0) { J.torbellino -= dt; J.tTorb = (J.tTorb || 0) - dt; if (J.tTorb <= 0) { J.tTorb = 0.16; azote(J.t * 9, 3.3, 52 * multiArea(), 22 * J.st.dano * multiDado(), true); } }
  if (J.bendicion > 0) J.bendicion -= dt;
  if (J.rafaga) {
    const R = J.rafaga; R.t -= dt; yo.x += R.vx * dt; yo.y += R.vy * dt;
    if (J.fase === 'parado' && !J.escena) { const t = J.casilla, top = -t * TH + 6, bottom = -(t - 1) * TH - 6; yo.y = clamp(yo.y, top, bottom); }   // por delante y por detrás no se pasa
    const n = enemigosCerca(yo.x, yo.y, 18);
    for (let k = 0; k < n; k++) { const e = ENE.lista[CERCA[k]]; if (e.hp > 0 && !e.oculta && Math.hypot(e.x - yo.x, e.y - yo.y) < 16 && !(R.golpes || (R.golpes = new Set())).has(e.id)) { R.golpes.add(e.id); danar(e, 40 * J.st.dano, R.vx / 330, R.vy / 330, 200); } }
    particula(yo.x, yo.y, -R.vx * 0.1, -R.vy * 0.1, 0.3, 3, '#6bf2ff', 0, 0);
    if (R.t <= 0) J.rafaga = null;
  }
}

// el botón (abajo a la derecha): su icono de Yoshi y la recarga en píxeles
function pintaHabilidad() {
  const J = JUEGO; if (J.modo !== 'juego' || (J.carrera && J.carrera.caido) || (J.escena && (J.escena.tipo === 'posada' || J.escena.tipo === 'mercader'))) return;
  const H = habilidad(), W = PAN.W, Hh = PAN.H, x = W - 26, y = Hh - 60, falta = Math.max(0, (J.habT || 0) - J.t), lista = falta <= 0;
  disco(x, y, 17, 17, '#120808'); disco(x, y, 15.5, 15.5, lista ? '#e8742a' : '#3a2016');
  if (lista) { G.globalAlpha = 0.3 + Math.sin(J.t * 6) * 0.2; aro(x, y, 19, 1.5, '#ffd34d'); G.globalAlpha = 1; }
  G.globalAlpha = lista ? 1 : 0.45; icono(H.id, x, y, 14); G.globalAlpha = 1;
  if (!lista) { arcoPixel(x, y, 15.5, -1.57, -1.57 + 6.283 * (1 - falta / H.recarga), 2, '#ffd34d'); texto2(String(Math.ceil(falta)), x, y + 1, 9, '#fff4dc'); }
  BOTONES.push({ x: x - 20, y: y - 20, w: 40, h: 40, accion: () => usaHabilidad() });
  if (J.bendicion > 0) { G.globalAlpha = 0.35 + Math.sin(J.t * 10) * 0.15; aro(J.yo.x, J.yo.y - J.camY, 16, 2, '#fff6c2'); G.globalAlpha = 1; }
}
