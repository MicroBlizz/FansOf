// Fans Of Decks · La campaña: capítulos (Microblizz, Phony…) y, dentro de cada uno, semanas de oficina. Cada día es una agenda corta que acaba a las 17:00 con un minijefe;
// la primera semana (lunes a viernes) y el lunes del ascenso terminan en el jefe de departamento; la segunda empieza ya en martes (un día menos) y el lunes siguiente se
// lucha contra el CEO, que cierra el capítulo. DCP.run.acto (la semana, en DC_CAMPANA) y DCP.run.dia dicen dónde vas; el mapa del día se genera al empezarlo.
// Los capítulos van en DC_CAPITULOS (su lugar, rangos, textos de cierre y adornos); el de Phony y sus semanas están en campana-phony.js.
'use strict';
const DC_HORAS = ['11:00', '13:00', '17:00'];   // las dos primeras horas se eligen (reunión, correo, pausa o Economato); la de las 17:00 es la cita con el final del día
// horas: lo que hay a cada hora (se baraja). fin: el rival de las 17:00 (tipo 'minijefe' o 'jefe'). descanso: lo que cura la noche (fracción de la vida máxima).
const DC_CAMPANA = [
  { cap: 0, titulo: 'Primera semana',
    cierre: { titulo: 'Fin del primer acto', texto: 'El jefe de departamento firma tu traslado y desaparece por el pasillo sin mirarte. Pero el calendario no perdona: es martes otra vez y la agenda ya está llena.', joke: 'Microblizz felicita a la plantilla por «completar la semana». Phony cobra la felicitación.' }, dias: [
    { dia: 'Lunes', nivel: 1, descanso: 0, horas: [['facil', 'facil', 'correo'], ['normal', 'economato', 'pausa']],
      fin: 'm_soporte', cita: 'Ticket urgente de un cliente', sala: 'Sala Becario', sub: 'Soporte de nivel 3 te espera', texto: 'Primer día. Microblizz te ha dado una taza, un portátil sin cargador y una agenda que da miedo.' },
    { dia: 'Martes', nivel: 1, descanso: 0.25, horas: [['facil', 'normal', 'correo'], ['normal', 'economato', 'pausa']],
      fin: 'm_descarga', cita: 'Actualización obligatoria', sala: 'Sala Ping-Pong', sub: 'Descarga99 te espera', texto: 'Han actualizado el edificio durante la noche. Los ascensores ahora piden contraseña.' },
    { dia: 'Miércoles', nivel: 2, descanso: 0.25, horas: [['normal', 'elite', 'correo'], ['normal', 'economato', 'pausa']],
      fin: 'm_licencia', cita: 'Reunión de recortes', sala: 'Sala Alineamiento', sub: 'LicenciaBot te espera', texto: 'A mitad de semana huele a recortes. Y a café quemado, pero eso es siempre.' },
    { dia: 'Jueves', nivel: 2, descanso: 0.25, horas: [['normal', 'elite', 'correo'], ['normal', 'economato', 'pausa']],
      fin: 'm_plus', cita: 'Presentación del plan Plus', sala: 'Pecera', sub: 'PayPlus te espera', texto: 'Hoy toca vender la suscripción de la suscripción. Nadie sabe qué incluye.' },
    { dia: 'Viernes', nivel: 2, descanso: 0.25, horas: [['normal', 'elite', 'correo'], ['normal', 'economato', 'pausa']],
      fin: 'survivalbot', cita: 'Evaluación de desempeño', sala: 'Última planta', sub: 'SurvivalBot te espera', texto: 'Viernes de evaluaciones. RR. HH. ha sacado a pasear a su robot.' },
    { dia: 'Lunes', nivel: 2, descanso: 0.5, ascenso: true, horas: [['normal', 'elite', 'correo'], ['normal', 'economato', 'pausa']],
      fin: 'jefedpto', tipoFin: 'jefe', cita: 'Reunión con tu jefe de departamento', sala: 'Despacho 3B', sub: 'Jefe de departamento', texto: 'Has sobrevivido a una semana entera. Alguien en el piso de arriba se ha dado cuenta.' },
  ] },
  { cap: 0, titulo: 'Segunda semana', dias: [
    { dia: 'Martes', nivel: 3, descanso: 0.25, horas: [['normal', 'elite', 'correo'], ['normal', 'economato', 'pausa']],
      fin: 'm_troll', cita: 'Moderación de la reunión', sala: 'Sala Sinergia', sub: 'TrollBot te espera', texto: 'Ya eres Junior, y los pasillos lo notan. Los de abajo te saludan; los de arriba te vigilan.' },
    { dia: 'Miércoles', nivel: 3, descanso: 0.25, horas: [['normal', 'elite', 'correo'], ['normal', 'economato', 'pausa']],
      fin: 'm_stonks', cita: 'Cierre de cifras', sala: 'Sala Hoja de Cálculo', sub: 'Stonks te espera', texto: 'Las cifras del trimestre siempre suben. Lo que baja es la gente que las firma.' },
    { dia: 'Jueves', nivel: 3, descanso: 0.25, horas: [['normal', 'elite', 'correo'], ['normal', 'economato', 'pausa']],
      fin: 'm_fallen', cita: 'Revisión de proyecto', sala: 'Pecera', sub: 'FallenHero te espera', texto: 'Hoy toca revisar el proyecto con el director. Trae la armadura, la de la empresa, no la de metal.' },
    { dia: 'Viernes', nivel: 3, descanso: 0.25, horas: [['normal', 'elite', 'correo'], ['normal', 'economato', 'pausa']],
      fin: 'm_prime', cita: 'Auditoría de producto', sala: 'Última planta', sub: 'StarBot Prime te espera', texto: 'Último día antes del fin de semana. Si nada se rompe, será la primera vez.' },
    { dia: 'Lunes', nivel: 3, descanso: 0.5, rrhh: true, horas: [['normal', 'elite', 'correo'], ['normal', 'economato', 'pausa']],
      fin: 'ceo', tipoFin: 'jefe', cita: 'Reunión con el CEO', sala: 'Última planta', sub: 'El CEO de Microblizz', texto: 'Recursos Humanos te ha llamado a primera hora. «Es solo una charla», dice. Nadie lo cree.' },
  ] },
];
// Los capítulos: cada uno es una empresa y se juega en una o más semanas de DC_CAMPANA (las que llevan su `cap`). Sus campos opcionales cambian el adorno del calendario
// (títulos y salas de las citas, correos, pausa y economato). cierre: lo que se cuenta al vencer al CEO y empezar el siguiente capítulo; final: la pantalla si es el último.
const DC_CAPITULOS = [
  { nombre: 'Microblizz', lugar: 'Oficinas de Microblizz', rangos: ['Becario', 'Junior'],
    cierre: { titulo: '¡Eres el nuevo CEO!', texto: 'El CEO se marcha con una caja de cartón y tú te sientas en su sillón. Tienes un despacho enorme, un ventanal y ni idea de qué hacer con todo eso.',
      sig: { titulo: 'Al día siguiente…', texto: 'Llegas a tu primer día de CEO y la junta de accionistas ya está esperando. Diez minutos después Microblizz ha cerrado: «No es un despido, es una optimización de la empresa». Pero el calendario sigue lleno… y Phony tiene vacantes.', joke: 'Phony te ha escrito antes de que acabara la reunión. El correo incluye una suscripción de bienvenida y no se puede cancelar.', boton: 'EMPEZAR EN PHONY' } } },
];
// El rango que lleva el líder en la agenda: sube con el ascenso del lunes.
function dcActo() { return DC_CAMPANA[DCP.run.acto]; }
function dcDia() { return dcActo().dias[DCP.run.dia]; }
function dcEsUltimoDia() { return DCP.run.dia >= dcActo().dias.length - 1; }
function dcEsUltimoActo() { return DCP.run.acto >= DC_CAMPANA.length - 1; }
function dcCap() { return DC_CAPITULOS[dcActo().cap]; }
function dcRango() { return dcCap().rangos[Math.min(DCP.run.rango || 0, dcCap().rangos.length - 1)]; }
// Lo que cambia por capítulo (con lo de Microblizz por defecto).
function dcTitulosCap() { return dcCap().titulos || DC_TITULOS; }
function dcSalasCap() { return dcCap().salas || DC_SALAS; }
function dcCorreosCap() { return dcCap().correos ? dcCap().correos.concat(shuffle(DC_CORREOS.slice()).slice(0, 3)) : DC_CORREOS; }
function dcBuscaCorreo(id) { return DC_CORREOS.concat(...DC_CAPITULOS.map(k => k.correos || [])).find(c => c.id === id) || DC_CORREOS[0]; }
// La última semana de su capítulo (la que acaba en el CEO).
function dcFinDeCapitulo() { const A = DC_CAMPANA, i = DCP.run.acto; return !A[i + 1] || A[i + 1].cap !== A[i].cap; }
function dcNombreRival(id) { const D = DC_RIVALES[id]; return D.nombre ? tr(D.nombre) : tr(CFG.enemyCards[id] ? CFG.enemyCards[id].name : id); }
// El encuentro al azar de un tipo para el nivel del día (sin repetir el último en el mismo día).
function dcEncuentro(tipo, nivel, usados) {
  const l = DC_ENCUENTROS[tipo][Math.min(nivel, DC_ENCUENTROS[tipo].length) - 1]; let k = (Math.random() * l.length) | 0;
  if (l.length > 1 && usados[tipo] === k) k = (k + 1) % l.length; usados[tipo] = k; return l[k].slice();
}
// La agenda del día: dos horas a elegir y, a las 17:00, la cita con el final del día. Los encuentros se fijan al generarla (la partida es reproducible al recargar).
function dcGeneraMapa(dia) {
  const usados = {}, T0 = dcTitulosCap(), cap = dcCap(), correos = shuffle(dcCorreosCap().map(c => c.id)), salas = shuffle(dcSalasCap().slice()), vistos = {};
  const pisos = dia.horas.map(h => shuffle(h.slice()).map(tipo => ({ tipo, enc: DC_ENCUENTROS[tipo] ? dcEncuentro(tipo, dia.nivel, usados) : null })));
  pisos.push([{ tipo: dia.tipoFin || 'minijefe', enc: [dia.fin], cita: dia.cita, sala: dia.sala, sub: dia.sub }]);
  for (const p of pisos) for (const n of p) {
    if (n.tipo === 'correo') n.correo = correos.pop();
    if (n.cita) continue;
    const T = T0[n.tipo]; vistos[n.tipo] = (vistos[n.tipo] || 0) + 1; n.titulo = (vistos[n.tipo] - 1) % T.length;
    n.sala = n.tipo === 'pausa' ? (cap.salaPausa || 'Cafetería') : n.tipo === 'economato' ? (cap.salaTienda || 'Almacén') : salas.pop() || pick(dcSalasCap());
  }
  return { pisos, piso: -1, nodo: -1, elegidos: [] };   // elegidos[hora] = índice de la cita a la que se fue
}
// Empieza el día actual: agenda nueva, la noche cura, la pausa vuelve a dejar quitar una carta. Queda pendiente la pantalla del día (por si se recarga).
function dcEmpiezaDia() {
  const r = DCP.run, d = dcDia(), cura = Math.round(r.hpMax * d.descanso);
  r.sub = null;
  if (r.suscripcion) { if (r.nominas >= r.suscripcion.cuota) { r.nominas -= r.suscripcion.cuota; r.sub = 'pagada'; r.hp = Math.min(r.hpMax, r.hp + r.suscripcion.cura); } else { r.suscripcion = null; r.sub = 'cancelada'; } }   // el Plan Bienestar de Phony
  r.mapa = dcGeneraMapa(d); r.quitarUsado = false; r.curado = Math.min(cura, r.hpMax - r.hp); r.hp = Math.min(r.hpMax, r.hp + cura); r.ascensoPend = !!d.ascenso;
  r.stats.dias++; r.pendiente = 'dia'; dcGuarda();
}
// Pasa al día siguiente (o al primero del acto siguiente). Devuelve false si no hay más: la campaña ha terminado.
function dcSiguienteDia() {
  const r = DCP.run;
  if (!dcEsUltimoDia()) { r.dia++; dcEmpiezaDia(); return true; }
  if (!dcEsUltimoActo()) { if (dcFinDeCapitulo()) r.rango = 0; r.acto++; r.dia = 0; dcEmpiezaDia(); return true; }
  return false;
}
