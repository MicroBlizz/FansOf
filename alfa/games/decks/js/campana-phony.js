// Fans Of Decks · Capítulo 2 de la campaña: Phony, todo en remoto. Sin salas físicas: el calendario son videollamadas; los correos, la pausa y el Economato cambian de aire
// y hay eventos propios (conexión inestable, suscripción, actualización obligatoria…). Sus dos semanas se suman a DC_CAMPANA; el CEO es Chapman.
'use strict';
DC_CAPITULOS.push({
  nombre: 'Phony', lugar: 'Teletrabajo para Phony', rangos: ['Teletrabajador', 'Senior'], salaPausa: 'Tu sofá', salaTienda: 'Tienda digital',
  salas: ['Sala virtual 12', 'Llamada de tres personas', 'Enlace caducado', 'Sala de espera', 'Canal general', 'Pestaña 14', 'Videollamada sin sonido', 'Sala de Phony Meet'],
  titulos: {
    facil: ['Llamada de equipo', 'Videollamada de bienvenida', 'Reunión con la cámara apagada', 'Stand-up de 40 minutos'],
    normal: ['Llamada de objetivos', 'Taller de sinergias en remoto', 'Retrospectiva por videollamada', 'Comité de producto virtual', 'Llamada que podía ser un correo'],
    elite: ['Junta de suscriptores', 'Auditoría de licencias'], minijefe: ['Llamada final del día'], jefe: ['Llamada final del día'],
    correo: ['Notificación de la PayStation', 'Aviso de Phony', 'Correo de Soporte'], pausa: ['Descanso en el sofá', 'Hueco entre llamadas'], economato: ['Tienda digital de Phony'],
  },
  pausa: { titulo: 'Descanso en el sofá', nota: 'Cinco minutos de paz en el sofá, con el micrófono silenciado. Elige una cosa.' },
  tienda: { titulo: 'Tienda digital de Phony', nota: '«Todo es de alquiler, pero el alquiler lo pongo yo». Lola ha colado su mercadillo en la tienda de Phony.', dlc: true },
  correos: null,   // se rellena abajo con los eventos propios
  cierre: { titulo: '¡Eres la nueva CEO de Phony!', texto: 'Chapman se desconecta con una última videollamada y tú heredas su cuenta, su sillón virtual y 4.000 suscripciones sin cancelar. Los servidores de Phony empiezan a hacer ruidos raros.',
    sig: { titulo: 'Al día siguiente…', texto: 'Antes de tu primera llamada como CEO, IAhorro compra Phony por un euro. Lo hizo sola: redactó el contrato, la oferta y tu carta de despedida. Te contratan igualmente, como «supervisor humano». Es el cargo más corto del organigrama.', joke: 'IAhorro te ha enviado tu nómina: es una captura de pantalla de una nómina.', boton: 'EMPEZAR EN IAHORRO' } },
});
DC_CAMPANA.push(
  { cap: 1, titulo: 'Primera semana en remoto', cierre: { titulo: 'Fin del primer acto en Phony', texto: 'La gerente de suscripciones cancela tu cuenta de prueba y te mueve a la lista de «clientes premium»: es decir, a la de los que pagan. Pero es martes otra vez, y la agenda sigue llena de enlaces.', joke: 'Phony te cobra la cancelación y te regala un mes gratis… de pagar la cancelación.' }, dias: [
    { dia: 'Lunes', nivel: 4, descanso: 0.35, horas: [['facil', 'facil', 'correo'], ['facil', 'normal', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'p_cobra', cita: 'Pack de contenido extra', sala: 'Sala virtual 12', sub: 'CobraDLC te espera', texto: 'Primer día de teletrabajo. Phony te ha enviado un portátil, una silla con suscripción y un manual de 400 páginas, de pago.' },
    { dia: 'Martes', nivel: 4, descanso: 0.25, horas: [['facil', 'normal', 'correo'], ['normal', 'normal', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'p_servidor', cita: 'Incidencia en los servidores', sala: 'Enlace caducado', sub: 'Servidor Caído te espera', texto: 'Se ha caído todo, menos las reuniones. Esas siguen funcionando misteriosamente bien.' },
    { dia: 'Miércoles', nivel: 4, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'pausa', 'correo'], ['elite', 'normal', 'economato']],
      fin: 'p_remaster', cita: 'Presentación del remaster', sala: 'Sala de Phony Meet', sub: 'Remaster 70 € te espera', texto: 'Hoy presentan el remaster del juego de ayer, con los mismos gráficos y un precio nuevo.' },
    { dia: 'Jueves', nivel: 4, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'elite', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'p_progamer', cita: 'Torneo de exclusividad', sala: 'Canal general', sub: 'ProGamer corrupto te espera', texto: 'Phony ha comprado a la Comunidad Gamer. Los torneos ahora son de pago… y de obligado cumplimiento.' },
    { dia: 'Viernes', nivel: 4, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'elite', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'p_directora', cita: 'Estreno de la secuela', sala: 'Videollamada sin sonido', sub: 'La Directora corrupta te espera', texto: 'Viernes de estreno. Otra secuela, otro remake y una rueda de prensa en la que nadie puede hablar.' },
    { dia: 'Lunes', nivel: 5, descanso: 0.5, ascenso: true, horas: [['normal', 'normal', 'correo'], ['elite', 'normal', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'gerente', tipoFin: 'jefe', cita: 'Renovación de tu suscripción', sala: 'Sala de espera', sub: 'La gerente de suscripciones', texto: 'Tu periodo de prueba acaba hoy. La gerente de suscripciones quiere hablar contigo… por videollamada, claro.' },
  ] },
  { cap: 1, titulo: 'Segunda semana en remoto', dias: [
    { dia: 'Martes', nivel: 5, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'elite', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'p_speedrunner', cita: 'Reto de velocidad', sala: 'Pestaña 14', sub: 'SpeedRunner corrupto te espera', texto: 'Ya eres Senior. Eso significa más responsabilidades, el mismo sueldo y tres pestañas más abiertas.' },
    { dia: 'Miércoles', nivel: 5, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'elite', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'p_modder', cita: 'Parche de la comunidad', sala: 'Sala virtual 12', sub: 'Modder corrupto te espera', texto: 'La comunidad hace parches mejores que la empresa. Phony los está prohibiendo uno a uno.' },
    { dia: 'Jueves', nivel: 5, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['elite', 'normal', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'p_deluxe', cita: 'Edición Deluxe', sala: 'Sala de Phony Meet', sub: 'CobraDLC Deluxe te espera', texto: 'Han sacado la edición Deluxe de tu contrato: más cláusulas, más letra pequeña y el mismo sillón.' },
    { dia: 'Viernes', nivel: 5, descanso: 0.25, horas: [['normal', 'elite', 'correo'], ['normal', 'normal', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'p_coleccionista', cita: 'Cierre de servidores', sala: 'Enlace caducado', sub: 'Servidor Caído, edición coleccionista, te espera', texto: 'Hoy cierran los servidores de un juego antiguo. Lo anuncian con un confeti de pago.' },
    { dia: 'Lunes', nivel: 5, descanso: 0.5, horas: [['normal', 'normal', 'correo'], ['elite', 'normal', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'chapman', tipoFin: 'jefe', cita: 'Videollamada con la CEO', sala: 'Sala de Phony Meet', sub: 'Chapman, la CEO de Phony', texto: 'La CEO de Phony te ha enviado una invitación. Dice «sin orden del día», que es peor.' },
  ] },
);
// Eventos propios de Phony: salen en lugar de los correos de siempre (más unos pocos de los de Microblizz).
const DC_CORREOS_PHONY = [
  { id: 'p_lag', titulo: 'Conexión inestable', texto: 'La videollamada se congela con tu cara a medio gesto. Un cartel gira sin parar: «Reconectando…».', opciones: [
    { texto: 'Reconectar', riesgo: 'seguro', fx: { vida: -6, nominas: 25 }, det: '−6 de vida y +25 de bonus: te dan las gracias por la paciencia.' },
    { texto: 'Esperar a que cargue', riesgo: 'seguro', fx: { vida: 8 }, det: 'Te tomas un respiro: te curas 8.' },
    { texto: 'Reiniciar el router a lo bruto', riesgo: 'arriesgado', fx: { vida: -10, objeto: true }, det: 'Un objeto al azar, pero te da calambre: −10 de vida.' }] },
  { id: 'p_suscripcion', titulo: 'Plan Bienestar', texto: 'Phony te ofrece el Plan Bienestar por «solo» 6 de bonus al día. Incluye un cojín. El cojín es una imagen.', opciones: [
    { texto: 'Suscribirme', riesgo: 'arriesgado', fx: { suscripcion: true }, det: 'Cada mañana te curas 8, pero pagas 6 de bonus. Si no puedes pagar, se cancela.' },
    { texto: 'Probar el mes gratis', riesgo: 'seguro', fx: { vida: 5 }, det: 'Te curas 5. Se renueva solo… pero a ti no.' },
    { texto: 'Ignorar el correo', riesgo: 'seguro', fx: {}, det: 'No pasa nada. Ya te llegará otro.' }] },
  { id: 'p_actualizacion', titulo: 'Actualización obligatoria', texto: 'Tu portátil quiere actualizarse justo ahora: «Esto puede tardar unos minutos». Siempre dice lo mismo.', opciones: [
    { texto: 'Actualizar ahora', riesgo: 'arriesgado', fx: { ascensoAzar: true, vida: -8 }, det: 'Una carta de tu mazo asciende, pero el reinicio te deja −8 de vida.' },
    { texto: 'Posponer', riesgo: 'seguro', fx: { nominas: 10 }, det: '+10 de bonus por no molestar a nadie.' },
    { texto: 'Instalar sin leer', riesgo: 'arriesgado', fx: { ascensoAzar: true, perderAzar: true }, det: 'Una carta asciende… y otra desaparece. Nadie lee los términos.' }] },
  { id: 'p_dlc', titulo: 'Contenido descargable', texto: 'Un aviso: «¡Tu contrato tiene contenido nuevo!». Cuesta extra, claro.', opciones: [
    { texto: 'Comprar el pack', riesgo: 'arriesgado', fx: { nominas: -30, carta: 'rara' }, det: 'Pagas 30 de bonus por una carta rara.' },
    { texto: 'Rechazar', riesgo: 'seguro', fx: {}, det: 'Sigues con lo que tenías.' },
    { texto: 'Reclamar el reembolso', riesgo: 'arriesgado', fx: { nominas: 20, vida: -5 }, det: 'Te dan 20 de bonus tras 40 minutos en espera: −5 de vida.' }] },
  { id: 'p_encuesta', titulo: 'Encuesta de satisfacción', texto: '«Del 1 al 5, ¿cuánto recomendarías Phony a un amigo?». Hay una cámara mirándote mientras respondes.', opciones: [
    { texto: 'Poner cinco estrellas', riesgo: 'seguro', fx: { nominas: 15 }, det: '+15 de bonus por «compromiso».' },
    { texto: 'Ser sincero', riesgo: 'arriesgado', fx: { vidaMax: 6, nominas: -10 }, det: '+6 de vida máxima; te descuentan 10 de bonus por «actitud».' }] },
];
DC_CAPITULOS[1].correos = DC_CORREOS_PHONY;
