// Fans of Pop · la partida guardada: el récord (salas superadas), las victorias, los slimes vistos, el sonido y, desde la fase 2,
// los corazones, las monedas, los huecos comprados y el récord de estrellas de cada nivel.
// El camino a medias se guarda en `run` (ppGuardaCamino en partida.js) y los tutoriales de Lola ya vistos en `tuto`.
'use strict';
const PP_NUEVA = () => ({ v: 1, record: 0, victorias: 0, partidas: 0, vistos: {}, estrellas: 0, vol: 1, mus: 0.5, ayuda: false, tuto: {}, run: null, pixel: false,
  vidas: 5, vidaT: 0, monedas: 0, huecos: 0, huecosV: 2, mejor: {}, cofres: 0, dentro: false,
  cofreDia: '', cofreHoy: 0,   // los corazones de hoy de la Caja de botín (js/monedero.js, tarea #236)
  perlas: 0, anuncioDia: '', anunciosHoy: 0,                                                    // fase 3: la moneda de pago y los anuncios del día (js/tienda.js)
  duelo: { gan: 0, per: 0, fallo: 0.45, dia: '', hoy: 0 },                                    // el duelo contra el CEO (js/duelo.js)
  memoria: { record: 0, partidas: 0, dia: '', hoy: 0, records: {}, mundo: 0, dif: 'normal' },   // records: Fácil y Difícil; mundo y dif: lo último elegido (tarea #141)
  reto: null,        // el reto del día de hoy (js/reto-dia.js, tarea 367): { dia, jugados, mejor, subido, cobradas }; null = sin jugar nunca
  // «copiarnos de Candy Crush» (js/potenciadores.js, ofertas.js y pase.js): ayudas, fallos por nivel, racha, hucha, pase, regalo, compras y bandejas
  ayudas: {}, fallos: {}, racha: 0, hucha: 0, pase: null, regaloDia: '', diasSeguidos: null, infinitas: 0, atasco: 0, atascoDia: '', compras: {}, vistoBienvenida: false, bandeja: 'arcoiris', bandejas: {},
  raidVista: '',     // el lunes de la última raid que abriste: hasta abrirla, el botón del camino lleva punto rojo (js/raid/adaptadores/camino.js)
  raid: null,      // la raid entre todos (js/raid/adaptadores/sucesos.js, tarea 448): { firma de la raid, cofres ya cobrados en ella }
  feria: null,       // la Feria del finde (js/feria-pantalla.js): { estado (de PP_FERIA), bienvenida: id del finde ya saludado, entregados: premios dados solos aún sin contar }
  primeros: 'nueva', estrenos: {},   // primeros pasos (js/primeros-pasos-juego.js, tarea #140): 'nueva' desde que existen; lo ya estrenado
  edad: '',          // 'menor' o 'adulto' (nunca el año): la pregunta de js/edad-juego.js, tarea #254; '' = aún no se sabe
  cuentaInv: 0,      // la invitación a crear cuenta (js/cuenta-invitacion-juego.js, tarea #155): 0 sin ver, 1 vista, 2 recordada
  mundos: null,      // los mundos ya presentados (js/mundo-presenta-juego.js, tarea #272); null = partida de antes: solo el de ahora
  cole: null,        // la colección de compañeros (tarea #142, js/coleccion-juego.js), creada la primera vez con el flag companeros
  amigosLola: '' });   // el último día (AAAA-MM-DD de España) en que se abrió el regalo de Lola de la pestaña Amigos (tarea #145, js/pantalla-amigos.js)
const PP_VOL = VOLUMEN.crear({ musicaBase: 0.3 });   // la mezcla de Pop: la música a la mitad suena a 0,15
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = PP_NUEVA();
  if (!s || typeof s !== 'object') return n;
  // 02-11-2026: el equipo pasa de 4 huecos de serie a 3. Quien ya jugaba antes se queda con el 4.º gratis (Daniel): un hueco comprado más
  if (s.huecosV === undefined) { s.huecos = (s.huecos || 0) + 1; s.huecosV = 2; }
  if (s.primeros === undefined) s.primeros = 'vieja';   // 19-11-2026: una partida de antes de los primeros pasos lo ve todo (tarea #140)
  for (const k in n) if (s[k] === undefined) s[k] = n[k];
  return PP_VOL.migra(s);
})();
function ppGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } if (typeof CUENTA !== 'undefined') CUENTA.cambio(); }
// lo que pide el motor de sonido de core
function sonidoApagado() { return PP_VOL.apagado(SAVE); }
function volGeneral() { return PP_VOL.general(SAVE); }
function volMusica() { return PP_VOL.musica(SAVE); }
function musicUpdate() { /* la música la elige ppMusica (js/sonidos.js) */ }
