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
  aparicion: (azar) => (JUEGO.e && !JUEGO.e.planta ? aparicionCerca(azar) : aparicionDistrito(azar)),   // al empezar, por el distrito; luego, cerca de ti
  puntoTrozo: (r, azar) => libreEn(r, azar),
  puntoDentro: (r, azar) => libreDentro(r, azar),
  choca: (x, z, r) => !!choca(x, z, r),
  construido: (x, z) => construido(x, z),
  huecos: () => BARRIO.huecos.map((h) => ({ id: h.id, tipo: h.tipo })),
  huecoCerca: (x, z, r) => { const h = huecoCercaDe(x, z, r); return h && { id: h.id, x: h.x, z: h.z }; },
  posHueco: (id) => BARRIO.porId[id] || null,
  puntoPlanta: (n, azar) => puntoEnPlanta(n, azar),
  flujo: (x, z) => (CAMINOS.flujo ? ZOM.direccionFlujo(CAMINOS.rej, CAMINOS.flujo, x, z) : null),
  alarma: (azar) => { const c = MAPA.contenedores.filter((k) => k.tipo === 'coche'); return c.length ? c[Math.floor(azar() * c.length)] : null; },
};
// la rejilla de los caminos (casillas de medio metro) en una ventana de 76 m alrededor de ti: libre, pared o hueco (puerta o ventana).
// Se rehace al alejarte 10 m de su centro o al cargar o quitar un trozo del mundo; el campo de flujo hacia ti se recalcula unas dos veces
// por segundo en 32 m alrededor (js/caminos.js). Sirve igual en el distrito, en los trozos y en las plantas de la torre
const CAMINOS = { rej: null, flujo: null, t: 0, cx: 0, cz: 0, lado: 76, celda: 0.5 };
function preparaCaminos(cx, cz) {
  const { lado, celda } = CAMINOS, x0 = cx - lado / 2, z0 = cz - lado / 2, w = Math.round(lado / celda), h = w, tipo = new Uint8Array(w * h);
  const huecos = BARRIO.huecos.filter((H) => H.x > x0 - 2 && H.x < x0 + lado + 2 && H.z > z0 - 2 && H.z < z0 + lado + 2);
  for (const H of huecos) H.sol.abierto = true;           // los huecos cuentan como paso (más caro) al hacer la rejilla
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) tipo[j * w + i] = choca(x0 + (i + 0.5) * celda, z0 + (j + 0.5) * celda, 0.32) ? 0 : 1;
  for (const H of huecos) { H.sol.abierto = false; marcaHueco(tipo, w, h, x0, z0, celda, H.sol); }
  CAMINOS.rej = { w, h, x0, z0, celda, tipo }; CAMINOS.cx = cx; CAMINOS.cz = cz; TROZOS.sucio = false;
}
function marcaHueco(tipo, w, h, x0, z0, celda, s) {
  for (let j = Math.max(0, Math.floor((s.z0 - 0.4 - z0) / celda)); j <= Math.min(h - 1, Math.floor((s.z1 + 0.4 - z0) / celda)); j++)
    for (let i = Math.max(0, Math.floor((s.x0 - 0.4 - x0) / celda)); i <= Math.min(w - 1, Math.floor((s.x1 + 0.4 - x0) / celda)); i++) if (tipo[j * w + i]) tipo[j * w + i] = 2;
}
function avanzaCaminos(e, dt) {
  const J = e.jugador;
  if (!CAMINOS.rej || TROZOS.sucio || Math.abs(J.x - CAMINOS.cx) > 10 || Math.abs(J.z - CAMINOS.cz) > 10) { preparaCaminos(Math.round(J.x), Math.round(J.z)); CAMINOS.t = 0; }
  if ((CAMINOS.t -= dt) > 0) return;
  CAMINOS.t = 0.4;
  CAMINOS.flujo = ZOM.campoFlujo(CAMINOS.rej, J.x, J.z, 32, 25);
}
// ¿está dentro de una casa o un edificio? (los fans no aparecen dentro)
const dentroDeCasa = (x, z) => BARRIO.casas.some((C) => x > C.x0 - 0.5 && x < C.x1 + 0.5 && z > C.z0 - 0.5 && z < C.z1 + 0.5);
// ¿se ha construido ya esto? (el distrito siempre; fuera, solo los trozos cargados)
const construido = (x, z) => { const AJ = ZOM.AJ, C = AJ.trozos.centro; if (x > C.x0 && x < C.x1 && z > C.z0 && z < C.z1) return true; const { ci, cj } = ZOM.trozoDe(AJ, x, z); return TROZOS.cargados.has(ZOM.claveTrozo(ci, cj)); };
// un sitio libre al azar dentro de un rectángulo (fuera de casas), o null
function libreEn(r, azar) {
  for (let k = 0; k < 20; k++) { const x = r.x0 + 1 + azar() * (r.x1 - r.x0 - 2), z = r.z0 + 1 + azar() * (r.z1 - r.z0 - 2); if (!choca(x, z, 0.6) && !dentroDeCasa(x, z)) return { x, z }; }
  return null;
}
// las oleadas llegan a 45-85 m de ti, en lo ya construido (en la torre, a la calle, como antes)
function aparicionCerca(azar) {
  const e = JUEGO.e, J = e.jugador;
  for (let k = 0; k < 12; k++) {
    const a = azar() * Math.PI * 2, d = 45 + azar() * 40, x = J.x + Math.sin(a) * d, z = J.z + Math.cos(a) * d;
    if (construido(x, z) && !choca(x, z, 0.6) && !dentroDeCasa(x, z)) return { x, z };
  }
  return aparicionDistrito(azar);
}
const aparicionDistrito = (azar) => libreAlcanzable(MAPA.x0 + 6 + azar() * (MAPA.x1 - MAPA.x0 - 12), MAPA.z0 + 8 + azar() * (MAPA.z1 - MAPA.z0 - 14), 0.6);
// lo que se puede registrar: los contenedores del mapa (menos la verja del despacho) y los cuerpos que deja la ballena
function sitiosRegistrables(e) { return JUEGO.sitios.concat(TORRE.sitios, sitiosTrozos(), sitiosRefugio(e), sitiosCoches(e), e.cuerpos); }
// la puerta o ventana que tienes al lado (para abrir con F o clavar tablas con B)
function huecoDelJugador(e) { const J = e.jugador; return huecoCercaDe(J.x, J.z, 1.6); }
const SITIOS_SIEMPRE = ['fuego', 'cocina', 'escalera', 'torre', 'despensa', 'superviviente'];   // se vuelven a abrir aunque estén vacíos (cocinar, beber, subir)
const esPaso = (s) => s && (s.tipo === 'escalera' || s.tipo === 'torre');
function sitioCerca(e) {
  const J = e.jugador; let mejor = null, dMin = 1.9;
  for (const s of sitiosRegistrables(e)) { const d = ZOM.dist(J.x, J.z, s.x, s.z); if (d < dMin && (!e.registrados[s.id] || (e.contenidos[s.id] || []).length || SITIOS_SIEMPRE.includes(s.tipo) || s.coche || (ZOM.AJ.desmontar.tipos[s.tipo] && !e.desmontados[s.id]))) { dMin = d; mejor = s; } }
  return mejor;
}

function arranca() {
  iniciaMotor(); construyeMapa(); construyeTorre(); preparaEntrada(); preparaEfectos();
  JUEGO.sitios = MAPA.contenedores.filter((c) => c.tipo !== 'verja').map((c, i) => ({ id: 'c' + i, x: c.x, z: c.z, tipo: c.tipo }))
    .concat(MAPA.fuegos.map((f, i) => ({ id: 'f' + i, x: f.x, z: f.z + 0.9, tipo: 'fuego' })));   // los bidones con fuego: para cocinar
  el('carga').hidden = true;
  abreMenu();
  requestAnimationFrame(fotograma);
}
// a dónde se llega andando desde (x, z), contando las puertas y ventanas como paso (si no, desde dentro de casa no se llega a nada)
function alcanceDesde(x, z) {
  for (const H of BARRIO.huecos) H.sol.abierto = true;
  calculaAlcance(x, z);
  for (const H of BARRIO.huecos) H.sol.abierto = false;
}
// los coches del distrito que se conducen (aparcados en las calles del barrio y en la carretera): [x, z, rumbo]
const COCHES_DISTRITO = [[-110, 6.2, Math.PI / 2], [-170, 9.8, -Math.PI / 2], [-146, 22, 0], [-146, -40, Math.PI], [30, 6.2, Math.PI / 2], [-182, 44, Math.PI / 2], [-30, 120, Math.PI / 2]];
function cochesDelDistrito() { return COCHES_DISTRITO.map(([x, z, a], i) => { const p = libreCerca(x, z, 1.8); return { id: 'd' + i, x: p.x, z: p.z, a, color: i % 5 }; }); }
// dónde empiezas: la primera partida (con tutorial), en tu casa del barrio; las demás, dentro de una casa o edificio al azar de todo el mapa
const LUGAR_INICIO = { casa: 'una casa del barrio residencial', nave: 'una nave del polígono', super: 'el supermercado', gasolinera: 'la gasolinera', ferreteria: 'la ferretería', farmacia: 'la farmacia', comisaria: 'la comisaría', colegio: 'el colegio', granero: 'el granero de la granja' };
function puntoDeInicio(conTutorial) {
  if (conTutorial && BARRIO.inicio) return { ...libreCerca(BARRIO.inicio.x, BARRIO.inicio.z, 0.6), lugar: null, casa: BARRIO.inicio.casa };
  for (let k = 0; k < 20; k++) {
    const C = BARRIO.casas[Math.floor(azarJuego() * BARRIO.casas.length)];
    for (let j = 0; j < 30; j++) {
      const x = C.x0 + 1.2 + azarJuego() * (C.x1 - C.x0 - 2.4), z = C.z0 + 1.2 + azarJuego() * (C.z1 - C.z0 - 2.4);
      if (!choca(x, z, 0.7)) return { x, z, lugar: LUGAR_INICIO[C.tipo || 'casa'] || LUGAR_INICIO.casa, casa: C };
    }
  }
  return { ...libreCerca(BARRIO.inicio.x, BARRIO.inicio.z, 0.6), lugar: null, casa: BARRIO.inicio.casa };
}
function empiezaPartida() {
  const conTutorial = !SAVE.tutoHecho, p = puntoDeInicio(conTutorial);
  alcanceDesde(p.x, p.z);
  const r = ZOM.nuevaPartida(ZOM.AJ, { animal: SAVE.animal, dificultad: SAVE.dificultad, x: p.x, z: p.z, azar: azarJuego, mundo: MUNDO, refugio: refugioDe(p.casa), coches: cochesDelDistrito() });
  if (!r.ok) { avisa(tr('No se ha podido empezar la partida.'), 'malo'); return; }
  juega(r.valor);
  avisa(p.lugar ? trf('Día 1. Te despiertas en %1. Busca comida y agua antes de que anochezca y clava tablas en las ventanas (B).', tr(p.lugar)) : tr('Día 1. Estás en tu casa del barrio. Busca comida y agua antes de que anochezca y clava tablas en las ventanas (B).'), 'bien');
  empiezaTutorial(r.valor);
  guardaMundo(r.valor);
}
// seguir la partida guardada (si se puede cargar; si no, se avisa y se borra)
function continuaPartida() {
  const r = ZOM.restaura(ZOM.AJ, leeMundo());
  if (!r.ok) { borraMundo(); abreMenu(); return; }
  const desde = r.valor.planta ? TORRE.calle : r.valor.jugador;   // en la torre, lo alcanzable se cuenta desde la calle (ahí salen las oleadas)
  alcanceDesde(desde.x, desde.z);
  ZOM.preparaHuecos(ZOM.AJ, r.valor, MUNDO.huecos());
  if (!r.valor.refugio) ZOM.ponRefugio(r.valor, refugioDe(BARRIO.inicio.casa));   // las partidas de antes: el refugio es tu casa del barrio
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
function terminaPartida() { ENTRADA.abajo.clear(); descargaTrozos(null); limpiaRescates(); limpiaCoches(); TUTO.activo = false; cierraMochila(); cierraMapa(); limpiaVista(); tejadosFuera(); JUEGO.e = null; el('zb-capa').innerHTML = ''; }

function fotograma(ms) {
  requestAnimationFrame(fotograma);
  const dt = Math.min(0.05, (ms - JUEGO.antes) / 1000 || 0.016); JUEGO.antes = ms; JUEGO.hora += dt;
  vigilaMusica();
  if (JUEGO.e) avanzaJuego(dt);
  else paseoDeFondo(dt);
  limpiaPulsos();
  animaFuegos(JUEGO.hora, MOTOR.x, MOTOR.z);
  sigueSuelo(MOTOR.x, MOTOR.z, !(JUEGO.e && JUEGO.e.planta));
  avanzaMotor(dt, JUEGO.hora);
  pintaEscena();
}
function paseoDeFondo(dt) {
  vigilaEstacion(null);   // el menú, siempre en invierno
  JUEGO.paseo += dt * 0.03;
  camaraEn(Math.sin(JUEGO.paseo) * 40, -14 + Math.sin(JUEGO.paseo * 0.7) * 18); avanzaTapan(9999, 9999, dt);
  luzDeFondo();
}
function avanzaJuego(dt) {
  const e = JUEGO.e, AJ = ZOM.AJ;
  const cerca = sitioCerca(e);
  if (pidePausa() && !e.muerto) { if (VMAPA.abierto) cierraMapa(); else if (VM.abierta) cierraMochila(); else if (JUEGO.pausa) cierraPausa(); else abrePausa(); }
  if (!JUEGO.pausa && !e.muerto) { vigilaMochila(e, cerca); vigilaMapa(dt); }
  if (!JUEGO.pausa && !e.muerto) {
    const hueco = huecoDelJugador(e), ent = leeEntrada(e.jugador, cerca, hueco);
    if (ent.nadaCerca) avisa(tr('No hay nada que registrar aquí.'));
    if (ent.registrar && esPaso(cerca)) { ent.registrar = null; subeBaja(e, cerca); }
    if (ent.registrar && cerca.tipo === 'superviviente') { ent.registrar = null; rescataA(e, cerca); }
    usaCoche(e, ent, cerca);
    avanzaTrozos(e);
    vigilaEstacion(e);
    avanzaCaminos(e, dt);
    ZOM.paso(AJ, e, dt, ent, MUNDO, azarJuego);
    leeEventos(e);
    guardaSiToca(dt);
    avanzaTutorial(e, dt);
  }
  pintaMundo(AJ, e, JUEGO.pausa ? 0 : dt); pintaBarrio(e); pintaRescates(e, JUEGO.pausa ? 0 : dt); pintaCoches(e);
  if ((JUEGO.tHud -= dt) <= 0) { JUEGO.tHud = 0.15; pintaHud(AJ, e, cerca, 0.15, huecoDelJugador(e)); }
  else pintaAccion(e, cerca, huecoDelJugador(e));
  if (e.muerto && JUEGO.pantalla === 'juego') { const m = e.muerto; borraMundo(); setTimeout(() => abreMuerte(m), 1200); JUEGO.pantalla = 'cayendo'; }
}
// las escaleras de la torre (y su puerta en la calle): cambiar de planta
function subeBaja(e, s) {
  const r = ZOM.cambiaPlanta(ZOM.AJ, e, s.a, llegadaPlanta(s.a, s.a < e.planta), MUNDO, azarJuego);
  if (!r.ok) return;
  VISTA.cx = VISTA.cz = null;
  if (!e.planta) alcanceDesde(e.jugador.x, e.jugador.z);
  guardaMundo(e);
}
arranca();
