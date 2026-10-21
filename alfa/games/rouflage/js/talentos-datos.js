// Fans of Rouflage · LOS TALENTOS (datos y cuentas): dos niveles separados, de 1 a 20, uno de BECARIO y otro de COLADO, que suben con la experiencia de
// las partidas jugadas en ese papel (más si se juega bien). Cada nivel señalado desbloquea una HABILIDAD de ese papel; antes de cada partida se
// elige UNA (talentos-pantalla.js) y en la partida se usa con su botón (talentos-partida.js). Nada se compra: solo jugando.
// Guardado: SAVE.talentos = { xp: { becario, colado }, eleg: { becario, colado }, todo } en la partida local. Con cuenta, la experiencia la guarda y
// la sube el servidor (rf_talento_xp, servidor/61-rouflage-talentos.sql: estado.talentos = { becario, colado, … }) y aquí se usa la suya (TAL.srv).
'use strict';

// las habilidades: nv (nivel que la desbloquea), usos por partida, espera entre usos (s), dura (s del efecto). titulo: premio de presumir del armario
const HABILIDADES = [
  { id: 'contador', papel: 'becario', nv: 1, n: 'Contador de sala', d: 'Te dice cuántos colados hay en la sala donde estás.', usos: 2, espera: 18 },
  { id: 'dron', papel: 'becario', nv: 3, n: 'Dron de rastreo', d: 'Vuela hasta la sala de un colado y lo marca con su nombre. Si tira la granada, señal perdida.', usos: 1, dura: 5 },
  { id: 'silbato', papel: 'becario', nv: 6, n: 'Silbato del jefe', d: 'Pitas y todos los colados silban a la vez.', usos: 1 },
  { id: 'uv', papel: 'becario', nv: 10, n: 'Linterna ultravioleta', d: 'Durante 5 s, la pintura de los colados que alumbras brilla.', usos: 1, dura: 5 },
  { id: 'cafe', papel: 'becario', nv: 15, n: 'Café doble', d: 'Corres más rápido durante 8 s.', usos: 2, espera: 12, dura: 8 },
  { id: 'jefe', papel: 'becario', nv: 20, n: 'Jefe de becarios', d: 'El título del armario para presumir: «Jefe de becarios».', titulo: true },
  { id: 'granada', papel: 'colado', nv: 1, n: 'Granada de humo', d: 'Invisible 7 s, y los becarios de cerca, medio ciegos.', usos: 1 },
  { id: 'senuelo', papel: 'colado', nv: 3, n: 'Señuelo pintado', d: 'Deja una galleta falsa pintada como tú (quien la despida, falla) y tus garabatos llegan más lejos.', usos: 1 },
  { id: 'rapida', papel: 'colado', nv: 6, n: 'Pintura rápida mejorada', d: 'Tu pintura rápida camufla mejor y recarga antes. Va sola, sin botón.', pasiva: true },
  { id: 'gato', papel: 'colado', nv: 10, n: 'Pasos de gato', d: 'Durante 10 s andas sin que los becarios bot noten que te mueves.', usos: 2, espera: 15, dura: 10 },
  { id: 'cambiazo', papel: 'colado', nv: 15, n: 'Cambiazo', d: 'Te cambias de sitio (y de pintura) con otro colado. A los dos os llega el aviso.', usos: 1 },
  { id: 'maestro', papel: 'colado', nv: 20, n: 'Maestro del camuflaje', d: 'El título del armario para presumir: «Maestro del camuflaje».', titulo: true },
];
// cifras: la experiencia (por partida y topes), la curva y lo que hace cada habilidad
const TALENTOS = {
  max: 20, base: 40, gana: 15, topePartida: 110, linea: 1.5,
  despido: 10, fallo: 5, limpio: 10,              // becario: por despido, menos por despido improcedente y si fallas 1 o menos
  vive: 25, camoDesde: 60, camoPaso: 4, camoMax: 10, aguantePaso: 12, aguanteMax: 10,      // colado: si no le pillan, camuflaje alto y segundos aguantados
  // lo que cuesta pasar del nivel n al n+1 (n = 1…19): 60 + 40·n^1,42, redondeado a 5. En total 23 010 XP: unas 330 partidas de ese papel
  // (unas semanas). El 2 llega con 2 partidas y el 3 con unas 4 (la primera tarde)
  paso: n => Math.round((60 + 40 * Math.pow(n, 1.42)) / 5) * 5,
  rapidaMeta: 6, rapidaEspera: 30,                // pintura rápida mejorada: +6 de camuflaje máximo y 30 s de espera (en vez de 45)
  cafeVel: 1.35, dronVuela: 3.6, dronBarre: 1.1, uvVista: 1.9,
  senAlcance: 1.4, senPaso: 0.25,                 // el señuelo pintado: los garabatos (senuelos.js) llegan un 40 % más lejos y su tinta sube un 25 % cada 5 niveles de colado (nv 20: +100 %)
};
const alcanceSen = e => SEN.alcance * (e && e.hab === 'senuelo' ? TALENTOS.senAlcance : 1);
const extraSen = nivel => TALENTOS.senPaso * Math.floor(Math.min(TALENTOS.max, nivel || 1) / 5);      // 0; 0,25 (nv 5); 0,5 (nv 10)…
const tintaSen = e => Math.round(SEN.max * (1 + (e && e.hab === 'senuelo' ? extraSen(e.habNivel) : 0)));
TALENTOS.acum = [0, 0]; for (let n = 1; n < TALENTOS.max; n++) TALENTOS.acum.push(TALENTOS.acum[n] + TALENTOS.paso(n));      // acum[n]: experiencia para llegar al nivel n

const TAL = { srv: null };
// ¿hay talentos en esta partida? Contra bots, siempre; en el PvP, según la sala (AJUSTES_SALA.t de modos.js: CON TALENTOS o CLÁSICO)
const talOn = () => !J.pvp || ajusteSala(MODO.a, 't') === 1;
// la cola de BUSCAR PARTIDA que eligió el jugador (talentos-pantalla.js) para pvpBuscar
const talColaOpc = () => ({ talentos: !!talEstado().pvp });      // lo que dice el servidor (con cuenta): { becario, colado }
const papelDe = clase => (clase === 'cazador' ? 'becario' : 'colado');
const habDef = id => HABILIDADES.find(h => h.id === id) || null;
const habsDe = papel => HABILIDADES.filter(h => h.papel === papel);
function talEstado() {
  const t = SAVE.talentos = SAVE.talentos && typeof SAVE.talentos === 'object' ? SAVE.talentos : {};
  if (!t.xp || typeof t.xp !== 'object') t.xp = { becario: 0, colado: 0 };
  if (!t.eleg || typeof t.eleg !== 'object') t.eleg = { becario: 'contador', colado: 'granada' };
  if (t.todo && !arPruebasVisibles()) t.todo = false;      // los talentos a tope de DESBLOQUEAR TODO solo valen en la alfa y en localhost (ajustes.js)
  return t;
}
const talXp = papel => Math.max(0, Math.floor(TAL.srv && typeof TAL.srv[papel] === 'number' ? TAL.srv[papel] : +talEstado().xp[papel] || 0));
function talNivelDe(xp) { let n = 1; while (n < TALENTOS.max && xp >= TALENTOS.acum[n + 1]) n++; return n; }
const talNivel = papel => (talEstado().todo && arPruebasVisibles() ? TALENTOS.max : talNivelDe(talXp(papel)));
const habAbierta = (h, nivel) => !!h && (nivel == null ? talNivel(h.papel) : nivel) >= h.nv;
// la elegida de ese papel (si ya no vale, la primera: contador o granada)
function talElegida(papel) {
  const id = talEstado().eleg[papel], h = habDef(id);
  return h && h.papel === papel && !h.titulo && habAbierta(h) ? id : habsDe(papel)[0].id;
}
function talElige(papel, id) {
  const h = habDef(id); if (!h || h.papel !== papel || h.titulo || !habAbierta(h)) return false;
  talEstado().eleg[papel] = id; guardaPartida(); return true;
}
// los bots: un nivel al azar (más a menudo bajo) y una de las que tendrían. Con semilla, la misma en todos los navegadores (PvP)
function talBot(papel, semilla) {
  let s = semilla == null ? Math.random() * 1e9 : semilla;
  const az = () => { s = (s * 16807 + 11) % 2147483647; return s / 2147483647; };
  const nivel = 1 + Math.floor(Math.pow(az(), 0.8) * TALENTOS.max), op = habsDe(papel).filter(h => !h.titulo && habAbierta(h, nivel));
  TAL.nivelBot = nivel;      // (el nivel simulado: lo usa habPon para la tinta del señuelo)
  return op[Math.floor(az() * op.length)].id;
}
// la alfa: el botón DESBLOQUEAR TODO de MI PERFIL (armario.js) lo llama para probar: true pone los dos niveles a 20; false vuelve a lo real
function talentosDesbloqueaTodo(si) {
  talEstado().todo = !!si; guardaPartida();
  if (typeof talentosRefresca === 'function') talentosRefresca();
}
// con cuenta: la experiencia que guarda el servidor (la llama RFS.aplica con el estado)
function talentosDelServidor(e) {
  const t = e && e.talentos;
  TAL.srv = t && typeof t === 'object' ? { becario: +t.becario || 0, colado: +t.colado || 0 } : null;
  if (TAL.srv) talentosTitulos();
}
// el título del nivel 20 de cada papel: se apunta en la colección (con cuenta, también lo da el servidor)
function talentosTitulos() {
  if (typeof armarioEstado !== 'function') return;
  const a = armarioEstado(); if (!a || !Array.isArray(a.tengo)) return;
  for (const [papel, id] of [['becario', 'jefe'], ['colado', 'maestro']]) if (talNivelDe(talXp(papel)) >= TALENTOS.max && !a.tengo.includes('titulos:' + id)) a.tengo.push('titulos:' + id);
}

// la experiencia de una partida para el papel que jugaste (con las cifras de TALENTOS). Devuelve { papel, xp, detalle }
function talPuntos(r, yo) {
  const T = TALENTOS, papel = papelDe(yo.clase), k = yo.pts || {};
  let extra = 0;
  if (papel === 'becario') extra = Math.max(0, Math.min(5, k.aciertos || 0) * T.despido - (k.fallos || 0) * T.fallo + ((k.fallos || 0) <= 1 && (k.aciertos || 0) > 0 ? T.limpio : 0));
  else extra = (yo.fuera ? 0 : T.vive) + Math.max(0, Math.min(T.camoMax, Math.round(((yo.camo || 0) - T.camoDesde) / T.camoPaso))) + Math.min(T.aguanteMax, Math.floor((k.aguante || 0) / T.aguantePaso));
  const publica = J.pvp && !(RFP.info && RFP.info.privada);
  const xp = Math.round(Math.min(T.topePartida, T.base + (r.victoria ? T.gana : 0) + extra) * (publica ? T.linea : 1));
  return { papel, xp };
}
