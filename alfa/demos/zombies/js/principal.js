// Fans of Zombies · PRINCIPAL (composición): arranca el motor y la ciudad, une las reglas (ZOM) con el mundo de Ratkov (choques, vista,
// sitios donde aparecen los fans y coches con alarma), lleva el bucle de cada fotograma y convierte lo que pasa (e.eventos) en sonidos
// y avisos de la radio. En el menú la cámara pasea despacio por la ciudad, de fondo.
'use strict';
const JUEGO = { e: null, pantalla: 'menu', pausa: false, antes: 0, hora: 0, paseo: 0, tHud: 0, sitios: [] };
const azarJuego = Math.random;
// el mundo que piden las reglas: el mapa de Ratkov
const MUNDO = {
  mueve: (o, dx, dz, r) => mueve(o, dx, dz, r),
  seVe: (x0, z0, x1, z1) => seVe(x0, z0, x1, z1),
  aparicion: (azar) => libreAlcanzable(-200 + azar() * 272, -52 + azar() * 104, 0.6),
  huecos: () => BARRIO.huecos.map((h) => ({ id: h.id, tipo: h.tipo })),
  huecoCerca: (x, z, r) => { const h = huecoCercaDe(x, z, r); return h && { id: h.id, x: h.x, z: h.z }; },
  posHueco: (id) => BARRIO.porId[id] || null,
  flujo: (x, z) => (CAMINOS.flujo ? ZOM.direccionFlujo(CAMINOS.rej, CAMINOS.flujo, x, z) : null),
  alarma: (azar) => { const c = MAPA.contenedores.filter((k) => k.tipo === 'coche'); return c.length ? c[Math.floor(azar() * c.length)] : null; },
};
// la rejilla de los caminos (casillas de medio metro): libre, pared o hueco (puerta o ventana), y el campo de flujo hacia ti,
// que se recalcula unas dos veces por segundo en 32 m alrededor (js/caminos.js)
const CAMINOS = { rej: null, flujo: null, t: 0 };
function preparaCaminos() {
  const celda = 0.5, x0 = -212, z0 = -64, w = Math.ceil((94 - x0) / celda), h = Math.ceil((64 - z0) / celda), tipo = new Uint8Array(w * h);
  for (const H of BARRIO.huecos) H.sol.abierto = true;           // los huecos cuentan como paso (más caro) al hacer la rejilla
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) tipo[j * w + i] = choca(x0 + (i + 0.5) * celda, z0 + (j + 0.5) * celda, 0.32) ? 0 : 1;
  for (const H of BARRIO.huecos) {
    const s = H.sol; H.sol.abierto = false;
    for (let j = Math.floor((s.z0 - 0.4 - z0) / celda); j <= Math.floor((s.z1 + 0.4 - z0) / celda); j++) for (let i = Math.floor((s.x0 - 0.4 - x0) / celda); i <= Math.floor((s.x1 + 0.4 - x0) / celda); i++) if (tipo[j * w + i]) tipo[j * w + i] = 2;
  }
  CAMINOS.rej = { w, h, x0, z0, celda, tipo };
}
function avanzaCaminos(e, dt) {
  if (!CAMINOS.rej || (CAMINOS.t -= dt) > 0) return;
  CAMINOS.t = 0.4;
  CAMINOS.flujo = ZOM.campoFlujo(CAMINOS.rej, e.jugador.x, e.jugador.z, 32, 25);
}
// lo que se puede registrar: los contenedores del mapa (menos la verja del despacho) y los cuerpos que deja la ballena
function sitiosRegistrables(e) { return JUEGO.sitios.concat(e.cuerpos); }
// la puerta o ventana que tienes al lado (para abrir con F o clavar tablas con B)
function huecoDelJugador(e) { const J = e.jugador; return huecoCercaDe(J.x, J.z, 1.6); }
const SITIOS_SIEMPRE = ['fuego', 'cocina'];   // se vuelven a abrir aunque estén vacíos (para cocinar o beber)
function sitioCerca(e) {
  const J = e.jugador; let mejor = null, dMin = 1.9;
  for (const s of sitiosRegistrables(e)) { const d = ZOM.dist(J.x, J.z, s.x, s.z); if (d < dMin && (!e.registrados[s.id] || (e.contenidos[s.id] || []).length || SITIOS_SIEMPRE.includes(s.tipo) || (ZOM.AJ.desmontar.tipos[s.tipo] && !e.desmontados[s.id]))) { dMin = d; mejor = s; } }
  return mejor;
}

function arranca() {
  iniciaMotor(); construyeMapa(); preparaEntrada(); preparaEfectos(); preparaCaminos();
  JUEGO.sitios = MAPA.contenedores.filter((c) => c.tipo !== 'verja').map((c, i) => ({ id: 'c' + i, x: c.x, z: c.z, tipo: c.tipo }))
    .concat(MAPA.fuegos.map((f, i) => ({ id: 'f' + i, x: f.x, z: f.z + 0.9, tipo: 'fuego' })));   // los bidones con fuego: para cocinar
  el('carga').hidden = true;
  abreMenu();
  requestAnimationFrame(fotograma);
}
function empiezaPartida() {
  const p = BARRIO.inicio ? libreCerca(BARRIO.inicio.x, BARRIO.inicio.z, 0.6) : libreAlcanzable(-24, 33, 0.6);   // en la casa de partida
  calculaAlcance(p.x, p.z);
  const r = ZOM.nuevaPartida(ZOM.AJ, { animal: SAVE.animal, dificultad: SAVE.dificultad, x: p.x, z: p.z, azar: azarJuego, mundo: MUNDO });
  if (!r.ok) { avisa(tr('No se ha podido empezar la partida.'), 'malo'); return; }
  juega(r.valor);
  avisa(tr('Día 1. Estás en tu casa del barrio. Busca comida y agua antes de que anochezca y clava tablas en las ventanas (B).'), 'bien');
  guardaMundo(r.valor);
}
// seguir la partida guardada (si se puede cargar; si no, se avisa y se borra)
function continuaPartida() {
  const r = ZOM.restaura(ZOM.AJ, leeMundo());
  if (!r.ok) { borraMundo(); abreMenu(); return; }
  calculaAlcance(r.valor.jugador.x, r.valor.jugador.z);
  ZOM.preparaHuecos(ZOM.AJ, r.valor, MUNDO.huecos());
  juega(r.valor);
  avisa(trf('Sigues en el día %1. Bienvenido de vuelta.', ZOM.diaDe(r.valor.min)), 'bien');
}
function juega(e) {
  CAMINOS.flujo = null; CAMINOS.t = 0;
  JUEGO.e = e; JUEGO.pantalla = 'juego'; JUEGO.pausa = false; JUEGO.tGuardar = 60;
  limpiaVista(); montaJugador(e.jugador); montaHud(); musica('ciber');
}
// se guarda sola cada minuto, al pausar y al cerrar o esconder la página
function guardaSiToca(dt) { if ((JUEGO.tGuardar -= dt) > 0) return; JUEGO.tGuardar = 60; guardaMundo(JUEGO.e); }
function guardaAhora() { if (JUEGO.e && !JUEGO.e.muerto) guardaMundo(JUEGO.e); }
addEventListener('pagehide', guardaAhora);
document.addEventListener('visibilitychange', () => { if (document.hidden) guardaAhora(); });
function terminaPartida() { cierraMochila(); limpiaVista(); tejadosFuera(); JUEGO.e = null; el('zb-capa').innerHTML = ''; }

function fotograma(ms) {
  requestAnimationFrame(fotograma);
  const dt = Math.min(0.05, (ms - JUEGO.antes) / 1000 || 0.016); JUEGO.antes = ms; JUEGO.hora += dt;
  vigilaMusica();
  if (JUEGO.e) avanzaJuego(dt);
  else paseoDeFondo(dt);
  limpiaPulsos();
  animaFuegos(JUEGO.hora, MOTOR.x, MOTOR.z);
  avanzaMotor(dt, JUEGO.hora);
  pintaEscena();
}
function paseoDeFondo(dt) {
  JUEGO.paseo += dt * 0.03;
  camaraEn(Math.sin(JUEGO.paseo) * 40, -14 + Math.sin(JUEGO.paseo * 0.7) * 18); avanzaTapan(9999, 9999, dt);
  luzDeFondo();
}
function avanzaJuego(dt) {
  const e = JUEGO.e, AJ = ZOM.AJ;
  const cerca = sitioCerca(e);
  if (pidePausa() && !e.muerto) { if (VM.abierta) cierraMochila(); else if (JUEGO.pausa) cierraPausa(); else abrePausa(); }
  if (!JUEGO.pausa && !e.muerto) vigilaMochila(e, cerca);
  if (!JUEGO.pausa && !e.muerto) {
    const hueco = huecoDelJugador(e), ent = leeEntrada(e.jugador, cerca, hueco);
    if (ent.nadaCerca) avisa(tr('No hay nada que registrar aquí.'));
    avanzaCaminos(e, dt);
    ZOM.paso(AJ, e, dt, ent, MUNDO, azarJuego);
    leeEventos(e);
    guardaSiToca(dt);
  }
  pintaMundo(AJ, e, JUEGO.pausa ? 0 : dt); pintaBarrio(e);
  if ((JUEGO.tHud -= dt) <= 0) { JUEGO.tHud = 0.15; pintaHud(AJ, e, cerca, 0.15, huecoDelJugador(e)); }
  else pintaAccion(e, cerca, huecoDelJugador(e));
  if (e.muerto && JUEGO.pantalla === 'juego') { const m = e.muerto; borraMundo(); setTimeout(() => abreMuerte(m), 1200); JUEGO.pantalla = 'cayendo'; }
}
arranca();
