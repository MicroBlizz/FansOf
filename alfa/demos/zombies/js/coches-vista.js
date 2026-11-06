// Fans of Zombies · LOS COCHES EN PANTALLA (pantalla y mapa): dibuja los coches que se conducen (cada uno con su malla, que se mueve), les
// pone su choque mientras están aparcados, el cartel (subir, registrar la guantera, repostar con G), el panel del volante (velocidad,
// gasolina y daño) y lo que pasa al subir, bajar, chocar y atropellar. Las reglas están en js/coches.js. ADR 075.
'use strict';
const VCOCHES = { vistas: new Map() };
const COLOR_COCHE = [0x2a6ab8, 0xb8282e, 0x3a3a3e, 0xd8d8d0, 0x3a6a3a];
// la malla de un coche (la misma forma que los de Ratkov, js/mapa-piezas-2.js) en su sitio 0,0, mirando a +x
function montaCoche(color) {
  const o = new Obra();
  o.caja(3.4, 0.8, 1.6, color, 0, 0.6, 0); o.caja(1.9, 0.6, 1.4, 0x1a1c20, -0.2, 1.3, 0); o.caja(1.9, 0.12, 1.4, 0xeef2f6, -0.2, 1.66, 0); o.caja(1.4, 0.1, 1.6, 0xeef2f6, 1.1, 1.05, 0);   // la nieve del techo (en verano, chapa)
  o.caja(0.1, 0.25, 1.2, 0xf8f0c0, 1.72, 0.7, 0); o.caja(0.1, 0.2, 1.2, 0xc82838, -1.72, 0.7, 0);
  for (const [a, b] of [[-1.1, 0.8], [1.1, 0.8], [-1.1, -0.8], [1.1, -0.8]]) o.cil(0.3, 0.3, 0.2, 8, 0x111111, a, 0.3, b, Math.PI / 2);
  return o.hecha();
}
// los coches a menos de 140 m: su malla y, si nadie lo conduce, su choque; los lejanos se quitan
function pintaCoches(e) {
  const J = e.jugador;
  if (VISTA.jug) VISTA.jug.grupo.visible = !J.conduce;
  for (const c of e.coches || []) {
    let v = VCOCHES.vistas.get(c.id);
    const lejos = ZOM.dist(c.x, c.z, J.x, J.z) > 140;
    if (lejos) { if (v) quitaVistaCoche(c.id, v); continue; }
    if (!v) { v = { grupo: montaCoche(COLOR_COCHE[c.color % COLOR_COCHE.length]), sol: null }; tine(v.grupo); MOTOR.escena.add(v.grupo); VCOCHES.vistas.set(c.id, v); }
    v.grupo.position.set(c.x, 0, c.z); v.grupo.rotation.y = c.a - Math.PI / 2;
    ponChoqueCoche(c, v, J.conduce === c.id);
  }
}
function ponChoqueCoche(c, v, conducido) {
  const quieto = v.sol && Math.abs(v.sx - c.x) < 0.01 && Math.abs(v.sz - c.z) < 0.01 && Math.abs(v.sa - c.a) < 0.01;
  if (quieto && !conducido) return;
  if (v.sol) { quitaDeRejilla(v.sol); MAPA.solidos = MAPA.solidos.filter((s) => s !== v.sol); v.sol = null; }
  if (conducido) return;
  v.sol = solidoGirado(c.x, c.z, 3.4, 1.6, c.a - Math.PI / 2, 1.1, 'bajo'); v.sx = c.x; v.sz = c.z; v.sa = c.a;
}
function quitaVistaCoche(id, v) { MOTOR.escena.remove(v.grupo); v.grupo.traverse((m) => m.geometry && m.geometry.dispose()); ponChoqueCoche({}, v, true); VCOCHES.vistas.delete(id); }
function limpiaCoches() { for (const [id, v] of VCOCHES.vistas) quitaVistaCoche(id, v); }
// los coches que tienes cerca, como sitios (subir, o registrar su guantera)
function sitiosCoches(e) {
  const J = e.jugador, out = [];
  for (const c of e.coches || []) if (VCOCHES.vistas.has(c.id) && ZOM.dist(c.x, c.z, J.x, J.z) < 30) out.push({ id: 'car:' + c.id, tipo: 'coche', x: c.x, z: c.z, coche: c.id });
  return out;
}
// F junto a un coche (o al volante): subir, bajar o registrar; G: repostar
function usaCoche(e, ent, cerca) {
  const AJ = ZOM.AJ, J = e.jugador, r = (x) => { if (!x.ok) e.eventos.push({ tipo: 'noPuedes', codigo: x.codigo }); };
  if (J.conduce) { if (ent.registrar || ent.nadaCerca) { r(ZOM.bajaCoche(AJ, e, MUNDO)); ent.registrar = null; ent.nadaCerca = false; } return; }
  if (cerca && cerca.coche && pulsa('reposta')) r(ZOM.reposta(AJ, e, cerca.coche));
  if (ent.registrar && cerca && cerca.coche && (e.llaves || {})[cerca.coche]) { r(ZOM.subeCoche(AJ, e, cerca.coche)); ent.registrar = null; }
}
// el cartel sobre un coche
function textoCoche(e, s) {
  const c = ZOM.cocheDe(e, s.coche);
  if (e.jugador.conduce) return tr('F  BAJAR');
  if (!(e.llaves || {})[s.coche]) return tr(e.registrados[s.id] ? 'F  ABRIR (SIN LLAVE)' : 'F  REGISTRAR LA GUANTERA');
  if (c.dano >= 100) return tr('COCHE ROTO');
  return tr('F  SUBIR') + (ZOM.cuantos(e.jugador.mochila, 'gasolina') && c.gas < 1 ? '   ' + tr('G  REPOSTAR') : '');
}
// el panel del volante (en lugar del arma)
function pintaVolante(e) {
  const p = el('h-coche'), c = e.jugador.conduce && ZOM.cocheDe(e, e.jugador.conduce);
  p.hidden = !c; el('h-arma').hidden = !!c; if (!c) return;
  p.innerHTML = '<span class="lab">' + esc(tr('AL VOLANTE')) + ' · ' + esc(tr('F BAJAR')) + '</span><b>' + Math.round(Math.abs(c.v) * 3.6) + ' km/h</b>' +
    barraHud('GASOLINA', c.gas * 100, '#e8c040', c.gas <= 0 ? 'Sin gasolina' : '') + barraHud('DAÑO', c.dano, '#ff4b5c', c.dano >= 100 ? 'Ya no arranca' : '');
}
