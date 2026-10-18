// Fans Of Decks · La campaña del mundo 1 (la de Microblizz): semanas de oficina. Cada día es una agenda corta que acaba a las 17:00 con un minijefe;
// la primera semana (lunes a viernes) y el lunes del ascenso terminan en el jefe de departamento (fin del acto 1); la segunda empieza ya en martes
// (un día menos) y el lunes siguiente RR. HH. te manda al CEO (fin del mundo 1). DCP.run.acto y DCP.run.dia dicen dónde vas; el mapa del día se genera al empezarlo.
'use strict';
const DC_HORAS = ['9:00', '11:00', '13:00', '17:00'];   // las tres primeras horas se eligen; la de las 17:00 es la cita con el final del día
// horas: lo que hay a cada hora (se baraja). fin: el rival de las 17:00 (tipo 'minijefe' o 'jefe'). descanso: lo que cura la noche (fracción de la vida máxima).
const DC_CAMPANA = [
  { titulo: 'Primera semana', lugar: 'Oficinas de Microblizz',
    cierre: { titulo: 'Fin del primer acto', texto: 'El jefe de departamento firma tu traslado y desaparece por el pasillo sin mirarte. Pero el calendario no perdona: es martes otra vez y la agenda ya está llena.', joke: 'Microblizz felicita a la plantilla por «completar la semana». Phony cobra la felicitación.' }, dias: [
    { dia: 'Lunes', nivel: 1, descanso: 0, horas: [['facil', 'facil', 'correo'], ['facil', 'normal', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'm_soporte', cita: 'Ticket urgente de un cliente', sala: 'Sala Becario', sub: 'Soporte de nivel 3 te espera', texto: 'Primer día. Microblizz te ha dado una taza, un portátil sin cargador y una agenda que da miedo.' },
    { dia: 'Martes', nivel: 1, descanso: 0.25, horas: [['facil', 'normal', 'correo'], ['normal', 'normal', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'm_descarga', cita: 'Actualización obligatoria', sala: 'Sala Ping-Pong', sub: 'Descarga99 te espera', texto: 'Han actualizado el edificio durante la noche. Los ascensores ahora piden contraseña.' },
    { dia: 'Miércoles', nivel: 2, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'pausa', 'correo'], ['elite', 'normal', 'economato']],
      fin: 'm_licencia', cita: 'Reunión de recortes', sala: 'Sala Alineamiento', sub: 'LicenciaBot te espera', texto: 'A mitad de semana huele a recortes. Y a café quemado, pero eso es siempre.' },
    { dia: 'Jueves', nivel: 2, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'elite', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'm_plus', cita: 'Presentación del plan Plus', sala: 'Pecera', sub: 'PayPlus te espera', texto: 'Hoy toca vender la suscripción de la suscripción. Nadie sabe qué incluye.' },
    { dia: 'Viernes', nivel: 2, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'elite', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'survivalbot', cita: 'Evaluación de desempeño', sala: 'Última planta', sub: 'SurvivalBot te espera', texto: 'Viernes de evaluaciones. RR. HH. ha sacado a pasear a su robot.' },
    { dia: 'Lunes', nivel: 2, descanso: 0.5, ascenso: true, horas: [['normal', 'normal', 'correo'], ['elite', 'normal', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'jefedpto', tipoFin: 'jefe', cita: 'Reunión con tu jefe de departamento', sala: 'Despacho 3B', sub: 'Jefe de departamento', texto: 'Has sobrevivido a una semana entera. Alguien en el piso de arriba se ha dado cuenta.' },
  ] },
  { titulo: 'Segunda semana', lugar: 'Oficinas de Microblizz', dias: [
    { dia: 'Martes', nivel: 3, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'elite', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'm_troll', cita: 'Moderación de la reunión', sala: 'Sala Sinergia', sub: 'TrollBot te espera', texto: 'Ya eres Junior, y los pasillos lo notan. Los de abajo te saludan; los de arriba te vigilan.' },
    { dia: 'Miércoles', nivel: 3, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'elite', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'm_stonks', cita: 'Cierre de cifras', sala: 'Sala Hoja de Cálculo', sub: 'Stonks te espera', texto: 'Las cifras del trimestre siempre suben. Lo que baja es la gente que las firma.' },
    { dia: 'Jueves', nivel: 3, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['elite', 'normal', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'm_presi', cita: 'Visita del presidente de Phony', sala: 'Pecera', sub: 'El presidente de Phony te espera', texto: 'Phony ha venido a «colaborar». Han traído su propia cafetera y han cobrado entrada.' },
    { dia: 'Viernes', nivel: 3, descanso: 0.25, horas: [['normal', 'elite', 'correo'], ['normal', 'normal', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'm_prime', cita: 'Auditoría de producto', sala: 'Última planta', sub: 'StarBot Prime te espera', texto: 'Último día antes del fin de semana. Si nada se rompe, será la primera vez.' },
    { dia: 'Lunes', nivel: 3, descanso: 0.5, rrhh: true, horas: [['normal', 'normal', 'correo'], ['elite', 'normal', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'ceo', tipoFin: 'jefe', cita: 'Reunión con el CEO', sala: 'Última planta', sub: 'El CEO de Microblizz', texto: 'Recursos Humanos te ha llamado a primera hora. «Es solo una charla», dice. Nadie lo cree.' },
  ] },
];
// El rango que lleva el líder en la agenda: sube con el ascenso del lunes.
const DC_RANGOS = ['Becario', 'Junior'];

function dcActo() { return DC_CAMPANA[DCP.run.acto]; }
function dcDia() { return dcActo().dias[DCP.run.dia]; }
function dcEsUltimoDia() { return DCP.run.dia >= dcActo().dias.length - 1; }
function dcEsUltimoActo() { return DCP.run.acto >= DC_CAMPANA.length - 1; }
function dcRango() { return DC_RANGOS[Math.min(DCP.run.rango || 0, DC_RANGOS.length - 1)]; }
function dcNombreRival(id) { const D = DC_RIVALES[id]; return D.nombre ? tr(D.nombre) : tr(CFG.enemyCards[id] ? CFG.enemyCards[id].name : id); }
// El encuentro al azar de un tipo para el nivel del día (sin repetir el último en el mismo día).
function dcEncuentro(tipo, nivel, usados) {
  const l = DC_ENCUENTROS[tipo][Math.min(nivel, DC_ENCUENTROS[tipo].length) - 1]; let k = (Math.random() * l.length) | 0;
  if (l.length > 1 && usados[tipo] === k) k = (k + 1) % l.length; usados[tipo] = k; return l[k].slice();
}
// La agenda del día: tres horas a elegir y, a las 17:00, la cita con el final del día. Los encuentros se fijan al generarla (la partida es reproducible al recargar).
function dcGeneraMapa(dia) {
  const usados = {}, correos = shuffle(DC_CORREOS.map(c => c.id)), salas = shuffle(DC_SALAS.slice()), vistos = {};
  const pisos = dia.horas.map(h => shuffle(h.slice()).map(tipo => ({ tipo, enc: DC_ENCUENTROS[tipo] ? dcEncuentro(tipo, dia.nivel, usados) : null })));
  pisos.push([{ tipo: dia.tipoFin || 'minijefe', enc: [dia.fin], cita: dia.cita, sala: dia.sala, sub: dia.sub }]);
  for (const p of pisos) for (const n of p) {
    if (n.tipo === 'correo') n.correo = correos.pop();
    if (n.cita) continue;
    const T = DC_TITULOS[n.tipo]; vistos[n.tipo] = (vistos[n.tipo] || 0) + 1; n.titulo = (vistos[n.tipo] - 1) % T.length;
    n.sala = n.tipo === 'pausa' ? 'Cafetería' : n.tipo === 'economato' ? 'Almacén' : salas.pop() || pick(DC_SALAS);
  }
  return { pisos, piso: -1, nodo: -1, elegidos: [] };   // elegidos[hora] = índice de la cita a la que se fue
}
// Empieza el día actual: agenda nueva, la noche cura, la pausa vuelve a dejar quitar una carta. Queda pendiente la pantalla del día (por si se recarga).
function dcEmpiezaDia() {
  const r = DCP.run, d = dcDia(), cura = Math.round(r.hpMax * d.descanso);
  r.mapa = dcGeneraMapa(d); r.quitarUsado = false; r.curado = Math.min(cura, r.hpMax - r.hp); r.hp = Math.min(r.hpMax, r.hp + cura); r.ascensoPend = !!d.ascenso;
  r.stats.dias++; r.pendiente = 'dia'; dcGuarda();
}
// Pasa al día siguiente (o al primero del acto siguiente). Devuelve false si no hay más: la campaña ha terminado.
function dcSiguienteDia() {
  const r = DCP.run;
  if (!dcEsUltimoDia()) { r.dia++; dcEmpiezaDia(); return true; }
  if (!dcEsUltimoActo()) { r.acto++; r.dia = 0; dcEmpiezaDia(); return true; }
  return false;
}
