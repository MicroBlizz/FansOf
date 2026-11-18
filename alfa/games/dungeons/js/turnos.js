// Fans of Dungeons · El estado de la partida (J) y el motor de turnos: cada acción del héroe da un turno a todos los
// enemigos de la planta (con su contador de velocidad), luego pasan los efectos de estado, se recupera Café y escudo, llegan
// refuerzos si te entretienes, y se recalcula la visión. También: empezar partida, subir de planta, morir y ganar.
'use strict';

const J = {
  modo: 'titulo', panel: null, semilla: 0, planta: 0, mapa: null, heroe: null, enemigos: [], aliados: [], objetos: [], restos: [],
  tienda: null, turno: 0, turnosPlanta: 0, log: [], campoHeroe: null, limpia: false, jefeMuerto: false, monedasVistas: 0,
  cam: { x: 0, y: 0, listo: false }, fin: null, tiempo: 0,
  hitstop: 0, mods: [], diario: false, aspecto: null, ident: [],   // congelado tras un golpe, reto del día, objetos sin identificar
};

function log(texto, color = '#d9d2e0') { J.log.push({ t: texto, c: color, n: J.turno }); if (J.log.length > 60) J.log.shift(); }

function nuevaPartida(clase, semilla, diario = false) {
  J.semilla = semilla || Math.floor(Math.random() * 2147483647);
  J.diario = !!diario; J.mods = diario ? modsDelDia(J.semilla) : []; J.aspecto = repartirAspectos(J.semilla); J.ident = [];
  J.heroe = nuevoHeroe(clase);
  if (hayMod('carga')) for (let i = 0; i < 3; i++) J.heroe.mochila.push({ id: 'cafe_solo', rar: 0 });
  J.stats = nuevasCuentas(); aplicaMeta(J.heroe);
  recalcula(J.heroe); J.planta = 0; J.turno = 0; J.log = []; J.monedasVistas = 0; J.fin = null; J.aliados = [];
  J.modo = 'juego'; J.panel = null;
  log(fmt(tr('{c} entra en la Torre de Microblizz. Semilla {s}.'), { c: CLASES[clase].nombre, s: J.semilla }), '#ffd040');
  if (J.diario) { log(tr('Reto del día: la misma torre para todos hoy.'), '#c8a040'); for (const id of J.mods) log(tr(MODS[id].nombre) + ': ' + tr(MODS[id].desc), '#c8a040'); }
  subePlanta();
}
// la siguiente planta (o la victoria si no hay más)
function subePlanta() {
  const h = J.heroe;
  if (J.planta >= PLANTA_FINAL) { victoria(); return; }
  J.planta++;
  const g = generaPlanta(J.planta, J.semilla);
  if (!g) { log(tr('La planta no ha salido bien (semilla rara). Se vuelve a intentar.'), '#ff9aa4'); J.semilla = (J.semilla * 31 + 7) | 0; J.planta--; subePlanta(); return; }
  const fieles = J.aliados.filter(a => a.fiel && a.vida > 0);   // MadSquirrel sube contigo
  J.mapa = g.m; J.objetos = g.objetos; J.tienda = g.tienda || null; J.aliados = []; J.restos = []; J.maldita = null;
  J.enemigos = g.enemigos.map(d => nuevoEnemigo(d.tipo, d.x, d.y, J.planta, d.elite, { llave: d.llave }));
  J.limpia = false; J.jefeMuerto = false; J.turnosPlanta = 0; J.refuerzos = 0;
  h.x = J.mapa.llegada.x; h.y = J.mapa.llegada.y; h.camino = []; h.explorando = false; h.dx = 0; h.dy = 0;
  if (fieles.length) {   // tus compañeros llegan contigo: en las casillas libres más cercanas a la escalera
    const campo = campoM(J.mapa, [[h.x, h.y]], 6), sitios = [];
    for (let y = h.y - 6; y <= h.y + 6; y++) for (let x = h.x - 6; x <= h.x + 6; x++) if (dentroM(J.mapa, x, y) && campo[y * J.mapa.w + x] > 0 && pasableM(J.mapa, x, y)) sitios.push([campo[y * J.mapa.w + x], x, y]);
    sitios.sort((p, q) => p[0] - q[0]);
    for (const a of fieles) { const s = sitios.find(([, x, y]) => !quienHay(x, y) && !J.enemigos.some(e => e.x === x && e.y === y)); if (!s) break; a.x = s[1]; a.y = s[2]; a.vida = a.vidaMax; a.energia = 0; J.aliados.push(a); }
  }
  J.cam.listo = false;
  calculaVision(J.mapa, h.x, h.y, h.vision);
  const Z = ZONAS[J.mapa.zona];
  fxRotulo(fmt(tr('PLANTA {n}'), { n: J.planta }), '#ffffff', 1.6);
  log(fmt(tr('Planta {n}: {z}.'), { n: J.planta, z: tr(Z.nombre) }), '#ffd040');
  if (PLANTAS[J.planta].jefe) log(tr('Un Jefe de planta vigila la escalera.'), '#ff9aa4');
  if (J.planta === 5) hito('planta5'); if (J.planta === 9) hito('planta9');
  if (J.planta === 1) iniciaTuto();
  if (J.planta === ZONAS[J.mapa.zona].desde) abreEscena(J.mapa.zona);
  if (nivelMeta('plano')) { const s = J.mapa.salida; for (const [dx, dy] of DIRS8.concat([[0, 0]])) if (dentroM(J.mapa, s.x + dx, s.y + dy)) J.mapa.vis[(s.y + dy) * J.mapa.w + s.x + dx] = Math.max(1, J.mapa.vis[(s.y + dy) * J.mapa.w + s.x + dx]); }
  if (J.planta > 1 && tieneEf(h, 'lupa')) { const o = h.mochila.find(q => !conocido(q)); if (o) identifica(o); }
  guardaPartida();
}
// después de cada acción del héroe. coste: turnos que gasta (1 normal)
function accion(coste = 1) {
  const h = J.heroe;
  J.ruta = null;
  for (let n = 0; n < coste; n++) faseDelMundo();
  // si el héroe tiene un bug (congelado), pierde turnos: el mundo sigue sin él
  while (tieneEstado(h, 'bug') && h.vida > 0 && J.modo === 'juego') { h.estados.bug--; if (h.estados.bug === 0) recalcula(h); fxNumero(h.x, h.y, tr('bug'), '#6aa878'); faseDelMundo(); }
  if (J.turno % 10 === 0) guardaPartida();
}
function faseDelMundo() {
  const h = J.heroe;
  if (h.vida <= 0 || J.modo !== 'juego') return;
  J.turno++; J.turnosPlanta++;
  // aliados
  for (const a of J.aliados.slice()) { if (!a.fiel) a.turnos--; if (a.turnos <= 0) { log(tr('El bug se evapora. Era un parche temporal.'), '#6aa878'); muere(a, 'tiempo'); } else turnoAliado(a); }
  // enemigos, por orden de cercanía, con su contador de velocidad
  J.campoHeroe = campoM(J.mapa, [[h.x, h.y]], 40);
  const lista = J.enemigos.slice().sort((a, b) => pasos(a.x, a.y, h.x, h.y) - pasos(b.x, b.y, h.x, h.y));
  for (const e of lista) {
    if (e.vida <= 0 || h.vida <= 0) continue;
    e.energia += e.vel * 100 / h.vel;
    let veces = 0;
    while (e.energia >= 100 && e.vida > 0 && h.vida > 0 && veces++ < 3) { e.energia -= 100; turnoEnemigo(e); }
  }
  if (h.vida <= 0) return;
  // estados y recuperación
  ticEstados(h);
  for (const e of J.enemigos.slice()) if (ticEstados(e)) { /* muere() ya lo ha quitado */ }
  for (const a of J.aliados.slice()) ticEstados(a);
  if (J.turno % 2 === 0 && h.cafe < h.cafeMax) h.cafe += h.equipo.accesorio && h.equipo.accesorio.id === 'termo' ? 2 : 1;
  h.cafe = Math.min(h.cafe, h.cafeMax);
  if (h.escudoMax) { h.sinGolpes++; if (h.sinGolpes >= 3 && h.escudo < h.escudoMax) { h.escudo++; if (h.escudo === h.escudoMax && h.sinGolpes === 3 + h.escudoMax) log(tr('Escudo de plasma recargado.'), '#4a9aa8'); } }
  if (h.enfria > 0) h.enfria--;
  // refuerzos de Recursos Humanos si te entretienes demasiado en la planta
  if (J.turnosPlanta % 50 === 0 && J.refuerzos < 6 && !PLANTAS[J.planta].jefe) {
    const Z = ZONAS[J.mapa.zona], tipo = D.elige(Z.enemigos.filter(t => t !== 'cajabotin'));
    for (const [dx, dy] of D.baraja(DIRS8)) { const x = J.mapa.llegada.x + dx, y = J.mapa.llegada.y + dy; if (pasableM(J.mapa, x, y) && !quienHay(x, y) && pasos(x, y, h.x, h.y) > 3) { const e = nuevoEnemigo(tipo, x, y, J.planta, false); e.despierto = true; e.ultimo = { x: h.x, y: h.y }; J.enemigos.push(e); J.refuerzos++; log(tr('Recursos Humanos manda refuerzos por la escalera.'), '#ff9aa4'); break; } }
  }
  revisaMaldita();
  calculaVision(J.mapa, h.x, h.y, h.vision);
}
// el bug aliado: va a por el enemigo más cercano y muerde
function turnoAliado(a) {
  if (a.fiel && J.turno % 3 === 0 && a.vida < a.vidaMax && !J.enemigos.some(e => rey(e.x, e.y, a.x, a.y) <= 1)) a.vida++;   // se recuperan poco a poco
  let obj = null, md = 999;
  for (const e of J.enemigos) { const k = pasos(a.x, a.y, e.x, e.y); if (k < md && k <= 8) { md = k; obj = e; } }
  if (obj && rey(a.x, a.y, obj.x, obj.y) <= 1) { ataca(a, obj); return; }
  if (obj) { pasoHacia(a, obj.x, obj.y); return; }
  if (pasos(a.x, a.y, J.heroe.x, J.heroe.y) > 2) pasoHacia(a, J.heroe.x, J.heroe.y);
}

// el fin: la muerte del héroe. Se guarda el registro de despidos y la puntuación
function finPartida(causa, origen) {
  const h = J.heroe;
  J.modo = 'fin';
  const quien = origen ? tr(origen.nombre) : causa === 'trampa' ? tr('una trampa') : causa === 'quemado' ? tr('el café quemado') : causa === 'veneno' ? tr('el veneno') : tr('Microblizz');
  const puntos = puntuacion(J.planta, h.monedas, h.muertes, h.jefes);
  J.fin = { diario: J.diario, quien, puntos, planta: J.planta, turno: J.turno, clase: h.clase, semilla: J.semilla, nivel: h.nivel };
  fxExplosion(h.x, h.y, 1.6, '#ff4b5c'); fxEscombros(h.x, h.y, 14, h.fig); sonido('muerte');
  TEMBLOR.t = 0.5; TEMBLOR.f = 6;
  GUARDA.registro.unshift({ clase: h.clase, planta: J.planta, turno: J.turno, quien, puntos, fecha: Date.now() });
  if (GUARDA.registro.length > 12) GUARDA.registro.length = 12;
  GUARDA.record = Math.max(GUARDA.record || 0, puntos); apuntaDiario(puntos); J.fin.bonus = ganaBonus(puntos, h.jefes);
  GUARDA.partidas = (GUARDA.partidas || 0) + 1;
  guardaMeta(); borraPartida();
  log(fmt(tr('Te despide {q} en la planta {p}, turno {t}.'), { q: quien, p: J.planta, t: J.turno }), '#ff4b5c');
}
// la victoria: el CEO cae
function victoria() {
  const h = J.heroe;
  J.modo = 'victoria';
  const puntos = puntuacion(PLANTA_FINAL, h.monedas, h.muertes, h.jefes) + 2000;
  J.fin = { diario: J.diario, quien: '', puntos, planta: J.planta, turno: J.turno, clase: h.clase, semilla: J.semilla, nivel: h.nivel, victoria: true };
  GUARDA.registro.unshift({ clase: h.clase, planta: J.planta, turno: J.turno, quien: tr('nadie: ganaste'), puntos, fecha: Date.now(), victoria: true });
  GUARDA.record = Math.max(GUARDA.record || 0, puntos); apuntaDiario(puntos); J.fin.bonus = ganaBonus(puntos, h.jefes); GUARDA.victorias = (GUARDA.victorias || 0) + 1;
  hito('ceo'); guardaMeta(); borraPartida(); sonido('nivel');
}
// el tutorial de Lola: tres avisos en la planta 1
function tutorialLola() {
  GUARDA.tutorial = true; guardaMeta();
  log(tr('Lola: «Toca una casilla para ir; toca a un enemigo pegado a ti para pegarle. Cada paso es un turno».'), '#ffb0e0');
  log(tr('Lola: «La escalera está lejos. Los cafés curan. Y no abras cofres con dientes».'), '#ffb0e0');
}
