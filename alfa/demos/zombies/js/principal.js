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
  alarma: (azar) => { const c = MAPA.contenedores.filter((k) => k.tipo === 'coche'); return c.length ? c[Math.floor(azar() * c.length)] : null; },
};
// lo que se puede registrar: los contenedores del mapa (menos la verja del despacho) y los cuerpos que deja la ballena
function sitiosRegistrables(e) { return JUEGO.sitios.concat(e.cuerpos); }
// la puerta o ventana que tienes al lado (para abrir con F o clavar tablas con B)
function huecoDelJugador(e) { const J = e.jugador; return huecoCercaDe(J.x, J.z, 1.6); }
function sitioCerca(e) {
  const J = e.jugador; let mejor = null, dMin = 1.9;
  for (const s of sitiosRegistrables(e)) { const d = ZOM.dist(J.x, J.z, s.x, s.z); if (d < dMin && (!e.registrados[s.id] || (e.contenidos[s.id] || []).length)) { dMin = d; mejor = s; } }
  return mejor;
}

function arranca() {
  iniciaMotor(); construyeMapa(); preparaEntrada(); preparaEfectos();
  JUEGO.sitios = MAPA.contenedores.filter((c) => c.tipo !== 'verja').map((c, i) => ({ id: 'c' + i, x: c.x, z: c.z, tipo: c.tipo }));
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
