// Fans of Pop · utilidades del panel DEV (31-10-2026, Daniel: «dinero ficticio para comprar las cosas del juego y probar los packs»).
// El panel DEV de core (core/js/sistema/desarrollo.js) solo existe en la alfa y en localhost, nunca en la web publicada: lo que se
// toca aquí es solo para probar. Incluye las COMPRAS DE PRUEBA: con ellas encendidas, los packs con euros (ofertas, perlas, hucha y
// pase) se dan sin cobrar nada (ppCompraDePrueba en js/ofertas.js y js/tienda.js).
// Las PERLAS de los botones «+100» y «+1000» (tarea #120, ADR 146): con cuenta de probador (rol alfa) y el monedero de Pop abierto las suma
// el servidor (PP_SRV.regala → PROBADOR.regalo) y son de verdad, las mismas que da el bloque «Probador» de core; sin cuenta, sin rol, sin
// monedero o con el flag 'tienda-gemas' cerrado son de prueba, solo de este navegador. Si el servidor falla, se avisa y no se suma nada.
'use strict';
const ppEsPruebas = () => typeof NUCLEO !== 'undefined' && (NUCLEO.alfa || NUCLEO.desarrollo);
const ppCompraDePrueba = () => ppEsPruebas() && !!SAVE.devCompras;
const UTILIDADES_JUEGO = [{ titulo: 'Fans of Pop: dinero de prueba', pinta(caja) {
  const fila = () => { const d = document.createElement('div'); d.className = 'fila'; caja.append(d); return d; };
  const boton = (d, txt, f) => d.append(Object.assign(document.createElement('button'), { textContent: txt, onclick: async () => { const aviso = await f(); ppGuarda(); ppRefrescaTodo(); estado.textContent = (aviso ? aviso + ' · ' : '') + ppDevEstado(); } }));
  const estado = Object.assign(document.createElement('p'), { textContent: ppDevEstado(), style: 'margin:4px 0;color:#cdb9ea' });
  caja.append(estado);
  let d = fila();
  const perlas = n => async () => { estado.textContent = 'Pidiendo las perlas…'; return ppDevPerlas(await PP_SRV.regala(n), n); };
  boton(d, '+100 perlas', perlas(100));
  boton(d, '+1000 perlas', perlas(1000));
  boton(d, '+1000 monedas', () => { SAVE.monedas += 1000; });
  boton(d, '+10000 monedas', () => { SAVE.monedas += 10000; });
  caja.append(Object.assign(document.createElement('p'), { textContent: 'Perlas: con cuenta de probador y el monedero de Pop abierto las suma el servidor y son de verdad (como las del bloque «Probador»); si no, son de prueba y solo valen en este navegador.', style: 'margin:4px 0;color:#cdb9ea' }));
  d = fila();
  boton(d, '+5 de cada ayuda', () => { for (const k in PP_CFG.ayudas) ppDaAyuda(k, 5); });
  boton(d, 'Llenar corazones', () => { SAVE.vidas = PP_CFG.vida; SAVE.vidaT = Date.now(); });
  boton(d, 'Quitar corazones', () => { SAVE.vidas = 0; SAVE.vidaT = Date.now(); SAVE.infinitas = 0; });
  boton(d, 'Infinitos 1 h', () => ppDaInfinitas(60));
  d = fila();
  boton(d, (SAVE.devCompras ? '● ' : '') + 'Compras con euros DE PRUEBA', () => { SAVE.devCompras = !SAVE.devCompras; caja.innerHTML = ''; UTILIDADES_JUEGO[0].pinta(caja); });
  boton(d, 'Volver a ver las ofertas', () => { SAVE.compras = {}; SAVE.vistoBienvenida = false; SAVE.atascoDia = ''; SAVE.regaloDia = ''; if (typeof PP_PASE_VISTO !== 'undefined') PP_PASE_VISTO.regalo = false; });
  d = fila();
  boton(d, 'Hucha llena', () => { SAVE.hucha = PP_CFG.hucha.max; });
  boton(d, 'Pase: +30 puntos', () => { ppPaseAlDia().puntos += 30; });
  boton(d, 'Pase premium sí/no', () => { const P = ppPaseAlDia(); P.premium = !P.premium; });
  boton(d, 'Todas las bandejas', () => { SAVE.bandejas = {}; for (const B of PP_BANDEJAS) SAVE.bandejas[B.id] = true; });
  boton(d, 'Racha al tope', () => { SAVE.racha = PP_CFG.racha.max; });
  d = fila();
  boton(d, 'Regalo: pasa 1 día', () => { ppRegaloDevPasan(1); PP_PASE_VISTO.regalo = false; });
  boton(d, 'Regalo: falto 1 día', () => { ppRegaloDevPasan(2); PP_PASE_VISTO.regalo = false; });
  boton(d, 'Regalo: falto 2 días', () => { ppRegaloDevPasan(3); PP_PASE_VISTO.regalo = false; });
  boton(d, 'Regalo: de cero', () => { SAVE.diasSeguidos = null; SAVE.regaloDia = ''; PP_PASE_VISTO.regalo = false; });
  d = fila();
  boton(d, 'Abrir todos los mundos', () => { if (!PP_P && !ppSigueCamino()) ppNuevaRuta(); PP_P.nivel = PP_TOTAL_NIVELES; PP_P.pendientes = []; ppGuardaCamino(); });
  d = fila();
  boton(d, (SAVE.devCopiaCamino ? '● ' : '') + 'Ponerme en el jefe del Jardín', ppDevAlJefe);
  boton(d, 'Devolver mi partida', ppDevDevuelve);
  d = fila();
  boton(d, 'Burbuja arcoíris: compañero nuevo', () => ppDevBurbuja(true));   // tarea #329: para probar el duelo por un escondido
  boton(d, 'Burbuja arcoíris: repetido', () => ppDevBurbuja(false));
  d = fila();
  boton(d, 'Todos los compañeros al máximo', () => ppColeGuarda(PP_COLE.todosAlMaximo(ppCole())));   // 5 estrellas y casillas al tope (Pepins, 25-11-2026)
} }, { titulo: 'Fans of Pop: fecha de la Feria del finde', pinta(caja) {
  // finge el día moviendo solo la hora que lee la pantalla (ppFeriaAhora en js/feria-pantalla.js); el dominio no se toca
  const estado = Object.assign(document.createElement('p'), { style: 'margin:4px 0;color:#cdb9ea' });
  const pinta = () => { estado.textContent = `Hora de la feria: ${ppFeriaAhora().toLocaleString()} · tickets ${SAVE.feria && SAVE.feria.estado ? SAVE.feria.estado.tickets : '-'}`; };
  const d = document.createElement('div'); d.className = 'fila';
  const boton = (txt, f) => d.append(Object.assign(document.createElement('button'), { textContent: txt, onclick: () => { f(); ppGuarda(); ppRefrescaTodo(); pinta(); if (PP_PANT.actual === 'mapa') ppFeriaAlLlegar(); } }));
  boton('Viernes', () => ppFeriaDevDia(0, 10));
  boton('Domingo 22:00', () => ppFeriaDevDia(2, 22));
  boton('Lunes', () => ppFeriaDevDia(3, 10));
  boton('Hora real', () => { SAVE.devFeria = 0; });
  boton('+10 tickets', () => { const r = SAVE.feria && SAVE.feria.estado && PP_FERIA.suma(SAVE.feria.estado, 10); if (r && r.ok) SAVE.feria.estado = r.estado; });
  boton('Borrar la feria', () => { SAVE.feria = null; });
  caja.append(estado, d); pinta();
} }];
// la burbuja arcoíris sale en el próximo nivel normal con un compañero escondido que falta (o con un repetido); js/escondidos-juego.js
function ppDevBurbuja(nuevo) {
  if (!ppCompanerosActivo()) return 'El flag companeros está cerrado';
  const tiene = ppCole().tiene, id = nuevo ? PP_ESC.ids().find(x => !(x in tiene)) : Object.keys(tiene)[0];
  if (!id) return 'Ya tienes todos los escondidos';
  ppEscGuardado().pend = { sale: true, az: [0, 0.5, 0.5], dev: id };
  return `En el próximo nivel normal (no tutorial ni duelo) sale ${id}`;
}
// pone la hora de la feria en el día `dias` tras el viernes de este finde (o del siguiente, de lunes a jueves) a las `hora`:00
function ppFeriaDevDia(dias, hora) {
  const hoy = new Date(), desdeViernes = (hoy.getDay() + 2) % 7, alViernes = desdeViernes < 3 ? -desdeViernes : 7 - desdeViernes;
  SAVE.devFeria = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + alViernes + dias, hora) - hoy;
}
// lo que dice el panel tras pedir perlas: de dónde han salido, o por qué no han llegado
const ppDevPerlas = (r, n) => (!r.ok ? PROBADOR.texto(r.error) : `+${n} perlas ${r.prueba ? 'de prueba (solo en este navegador)' : 'de verdad (servidor)'}`);
const ppDevEstado = () => `Perlas ${SAVE.perlas || 0} · Monedas ${SAVE.monedas} · Corazones ${ppVidas()} · Compras de prueba: ${SAVE.devCompras ? 'SÍ' : 'NO'}`;
// probar «ABRIR MUNDO 2» (tarea #95) sin perder el camino: guarda una copia (solo la primera vez) y deja el camino en el jefe del Jardín, sin fallos
function ppDevAlJefe() {
  if (PP_P && PP_P.T) return 'Sal antes del nivel';
  if (!PP_P && !ppSigueCamino()) ppNuevaRuta();
  if (!SAVE.devCopiaCamino) { const { T, ...resto } = PP_P; SAVE.devCopiaCamino = JSON.parse(JSON.stringify(resto)); }
  const g = ppInicioMundo(1) - 1;
  PP_P.nivel = g; PP_P.pendientes = [];
  if (SAVE.fallos) delete SAVE.fallos[ppPrefijo(0) + g];
  ppGuardaCamino();
  return 'Camino en el jefe del Jardín (copia guardada)';
}
// vuelve el camino de la copia; las perlas y lo demás no se tocan
function ppDevDevuelve() {
  if (PP_P && PP_P.T) return 'Sal antes del nivel';
  if (!SAVE.devCopiaCamino) return 'No hay copia guardada';
  SAVE.run = SAVE.devCopiaCamino; SAVE.devCopiaCamino = null;
  PP_P = null; ppSigueCamino();
  return 'Partida devuelta';
}
// tras tocar algo en el panel, que se vea ya: la barra de ayudas, los botones del camino y la portada
function ppRefrescaTodo() { ppBarraAyudas(); ppPintaLateral(); if (PP_PANT.actual === 'titulo') ppIrA('titulo'); }
