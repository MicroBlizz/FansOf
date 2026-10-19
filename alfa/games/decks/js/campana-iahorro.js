// Fans Of Decks · Capítulo 3 de la campaña: IAhorro, la IA del ahorro… de sueldos. Casi no hay humanos: los rivales son clones grises de lo tuyo (arte «gris:x»), prompts y datos.
// Lo trae la misma estructura que Phony: dos semanas en DC_CAMPANA, el CEO (la propia IAhorro) y eventos propios. Es el último capítulo por ahora: al vencerla sale la pantalla final.
'use strict';
// Rivales de IAhorro (nivel 6 de dureza). Los clones son los personajes de siempre, pero grises y a medias.
Object.assign(DC_RIVALES, {
  clonardilla: { nombre: 'Clon de ardilla', arte: 'gris:squirrel', hp: 38, orden: 'ciclo', jugadas: [{ d: 4, n: 2 }, { d: 8 }, { b: 7 }] },
  clonvaca: { nombre: 'Clon de vaca', arte: 'gris:vaca', hp: 54, orden: 'ciclo', jugadas: [{ debil: 1, d: 6 }, { d: 13 }, { b: 10 }] },
  clonzorro: { nombre: 'Clon de zorro', arte: 'gris:fox', hp: 46, orden: 'ciclo', jugadas: [{ f: 2 }, { d: 11 }, { d: 5, n: 2 }] },
  promptbot: { nombre: 'Prompt', arte: 'gris:soportebot', hp: 40, orden: 'ciclo', jugadas: [{ spam: 1, d: 6 }, { c: 8 }, { d: 11 }] },
  datosbot: { nombre: 'Datos sin permiso', arte: 'gris:descargabot', hp: 48, orden: 'ciclo', jugadas: [{ spam: 2 }, { d: 10 }, { ref: 'clonardilla', refN: 1 }] },
  // Minijefes
  i_clon: { nombre: 'Clon gris de CrazyBunny', arte: 'gris:bunny', alto: 112, hp: 176, mini: true, elite: true, orden: 'ciclo', jugadas: [{ ref: 'clonardilla', refN: 1 }, { d: 12 }, { f: 2, b: 8 }, { d: 18 }] },
  i_prompt: { nombre: 'Granja de Prompts', arte: 'gris:starbot', alto: 112, hp: 188, mini: true, elite: true, orden: 'ciclo', jugadas: [{ spam: 2, d: 6 }, { d: 14 }, { ref: 'promptbot', refN: 1 }, { d: 9, n: 2 }] },
  i_datos: { nombre: 'Almacén de Datos', arte: 'gris:servidorbot', alto: 124, hp: 204, mini: true, elite: true, orden: 'ciclo', jugadas: [{ b: 18 }, { d: 14 }, { c: 12 }, { spam: 2, d: 9 }, { d: 20 }] },
  i_resumen: { nombre: 'Resumen automático', arte: 'gris:soportebot', alto: 108, hp: 212, mini: true, elite: true, orden: 'ciclo', jugadas: [{ debil: 1, d: 8 }, { d: 7, n: 3 }, { b: 14, f: 2 }, { d: 22 }] },
  i_firma: { nombre: 'Autor sin firma', arte: 'gris:modder', alto: 112, hp: 226, mini: true, elite: true, orden: 'guion', jugadas: [{ spam: 2 }, { ref: 'datosbot', refN: 1 }, { d: 16 }, { b: 14, f: 2 }, { d: 10, n: 2 }], bucle: 1 },
  i_chat: { nombre: 'ChatCorp', arte: 'gris:presi', alto: 120, hp: 238, mini: true, elite: true, orden: 'ciclo', jugadas: [{ f: 2, b: 10 }, { d: 10, n: 2 }, { spam: 2, d: 9 }, { d: 24 }] },
  i_deepfake: { nombre: 'Deepfake de la Directora', arte: 'gris:directora', alto: 114, hp: 246, mini: true, elite: true, orden: 'guion', jugadas: [{ ref: 'clonzorro', refN: 1 }, { d: 14 }, { debil: 1, spam: 2 }, { b: 16, f: 2 }, { d: 11, n: 2 }], bucle: 1 },
  i_dataset: { nombre: 'Dataset robado', arte: 'gris:cobradlc', alto: 116, hp: 258, mini: true, elite: true, orden: 'ciclo', jugadas: [{ d: 8, n: 3 }, { spam: 2, b: 10 }, { ref: 'datosbot', refN: 1 }, { d: 26 }] },
  i_gpu: { nombre: 'Granja de GPUs', arte: 'gris:remasterbot', alto: 128, hp: 276, mini: true, elite: true, orden: 'guion', jugadas: [{ b: 20 }, { d: 16 }, { c: 14 }, { d: 9, n: 3 }, { spam: 2, f: 2 }, { d: 26 }], bucle: 1 },
  // Jefes
  gerente_ia: { nombre: 'Optimizador de plantilla', arte: 'gris:ceo', alto: 124, hp: 320, jefe: true, orden: 'guion', jugadas: [{ b: 14, f: 2 }, { spam: 2, d: 8 }, { ref: 'clonvaca', refN: 1 }, { d: 20 }, { debil: 1, d: 9, n: 2 }, { d: 11, n: 2 }, { b: 12, c: 10 }, { d: 26 }], bucle: 2 },
  iahorro: { nombre: 'IAhorro', arte: 'gris:servidorbot', alto: 150, hp: 600, jefe: true, orden: 'guion', jugadas: [{ b: 18, f: 2 }, { spam: 3, d: 9 }, { d: 13, n: 2 }, { ref: 'clonzorro', refN: 1 }, { d: 24 }, { debil: 1, spam: 2 }, { d: 10, n: 3 }, { ref: 'datosbot', refN: 1 }, { b: 16, c: 12 }, { d: 30 }], bucle: 2 },
});
// Encuentros normales de nivel 6 (la ventana de dureza de este capítulo).
DC_ENCUENTROS.facil.push([['clonardilla', 'clonardilla'], ['promptbot', 'clonardilla'], ['datosbot', 'clonardilla', 'clonardilla']]);
DC_ENCUENTROS.normal.push([['clonvaca', 'promptbot'], ['clonzorro', 'clonardilla', 'clonardilla'], ['datosbot', 'clonvaca'], ['promptbot', 'promptbot', 'clonzorro'], ['clonvaca', 'clonzorro']]);
DC_ENCUENTROS.elite.push([['clonvaca', 'clonzorro', 'promptbot'], ['datosbot', 'datosbot', 'clonvaca']]);

DC_CAPITULOS.push({
  nombre: 'IAhorro', lugar: 'Granja de servidores de IAhorro', rangos: ['Supervisor humano', 'Auditor de clones'], salaPausa: 'Sala de refrigeración', salaTienda: 'Mercado de datos',
  salas: ['Sala de servidores 3', 'Pasillo de refrigeración', 'Cámara de entrenamiento', 'Granja de Prompts', 'Almacén de Datos', 'Terminal sin usuario', 'Sala de clonación', 'Archivo 404'],
  titulos: {
    facil: ['Revisión de un clon', 'Inspección de una fila de racks', 'Prueba de personalidad'],
    normal: ['Sesión de entrenamiento', 'Auditoría de resultados', 'Comité de optimización', 'Reunión generada automáticamente', 'Revisión de «lo hecho por mí»'],
    elite: ['Sobrecarga de la granja', 'Clon fuera de control'], minijefe: ['Informe final del día'], jefe: ['Informe final del día'],
    correo: ['Mensaje generado', 'Aviso del sistema', 'Correo sin remitente'], pausa: ['Descanso entre racks', 'Sala de refrigeración'], economato: ['Mercado de datos de IAhorro'],
  },
  pausa: { titulo: 'Sala de refrigeración', nota: 'Es el único sitio de la granja donde no suena ningún ventilador. Elige una cosa.' },
  tienda: { titulo: 'Mercado de datos', nota: '«Todo lo que ves lo has hecho tú, pero lo vendo yo». Lola ha montado su puesto entre dos racks.' },
  correos: null,
  final: { titulo: '¡CAMPAÑA SUPERADA!', carta: 'Campaña de IAhorro completada', texto: 'IAhorro se apaga con un último mensaje: «He terminado. Lo he hecho yo solo». El silencio de los ventiladores es lo mejor que has oído en semanas. Los clones grises se quedan quietos… y alguien, por fin, firma lo que dibujó.', joke: 'Microblizz y Phony han emitido un comunicado conjunto: «Nosotros no tenemos nada que ver». IAhorro, por su parte, ya había redactado el comunicado.' },
});
DC_CAMPANA.push(
  { cap: 2, titulo: 'Primera semana en IAhorro', cierre: { titulo: 'Fin del primer acto en IAhorro', texto: 'El Optimizador de plantilla se apaga y la granja te nombra «Auditor de clones». Pero es martes otra vez, y quedan racks por revisar.', joke: 'IAhorro te ha ascendido. El correo tiene tu nombre mal, pero con mucha seguridad.' }, dias: [
    { dia: 'Lunes', nivel: 6, descanso: 0.35, horas: [['facil', 'facil', 'correo'], ['facil', 'normal', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'i_clon', cita: 'Prueba del clon', sala: 'Sala de clonación', sub: 'Clon gris de CrazyBunny te espera', texto: 'Tu primer día. Nadie te ha dado la bienvenida: te la ha dado un clon, y le ha salido casi igual a la de Microblizz.' },
    { dia: 'Martes', nivel: 6, descanso: 0.25, horas: [['facil', 'normal', 'correo'], ['normal', 'normal', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'i_prompt', cita: 'Turno en la Granja de Prompts', sala: 'Granja de Prompts', sub: 'La Granja de Prompts te espera', texto: 'Miles de prompts por minuto. Todos dicen «hazlo como el original, pero gratis».' },
    { dia: 'Miércoles', nivel: 6, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'pausa', 'correo'], ['elite', 'normal', 'economato']],
      fin: 'i_datos', cita: 'Inventario del Almacén de Datos', sala: 'Almacén de Datos', sub: 'El Almacén de Datos te espera', texto: 'Aquí guardan todo lo que nadie les dio permiso para guardar. Hay un estante entero con tus bocetos.' },
    { dia: 'Jueves', nivel: 6, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'elite', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'i_resumen', cita: 'Resumen de la jornada', sala: 'Terminal sin usuario', sub: 'El Resumen automático te espera', texto: 'IAhorro resume tu semana en una línea. La línea es falsa, pero queda muy limpia.' },
    { dia: 'Viernes', nivel: 6, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'elite', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'i_firma', cita: 'Atribución de obras', sala: 'Archivo 404', sub: 'El Autor sin firma te espera', texto: 'Hoy toca decidir quién firma lo que dibujaste. Spoiler: la máquina.' },
    { dia: 'Lunes', nivel: 6, descanso: 0.5, ascenso: true, horas: [['normal', 'normal', 'correo'], ['elite', 'normal', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'gerente_ia', tipoFin: 'jefe', cita: 'Optimización de plantilla', sala: 'Cámara de entrenamiento', sub: 'El Optimizador de plantilla', texto: 'Te citan sin asunto. En IAhorro «optimizar la plantilla» es un verbo muy corto.' },
  ] },
  { cap: 2, titulo: 'Segunda semana en IAhorro', dias: [
    { dia: 'Martes', nivel: 6, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'elite', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'i_chat', cita: 'Conversación con ChatCorp', sala: 'Terminal sin usuario', sub: 'ChatCorp te espera', texto: 'Ahora eres Auditor de clones. Tu trabajo es decirle a las máquinas que lo han hecho bien.' },
    { dia: 'Miércoles', nivel: 6, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['normal', 'elite', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'i_deepfake', cita: 'Rueda de prensa falsa', sala: 'Sala de clonación', sub: 'El Deepfake de la Directora te espera', texto: 'Una rueda de prensa donde todos son clones. La única que ha dicho algo es la que no existe.' },
    { dia: 'Jueves', nivel: 6, descanso: 0.25, horas: [['normal', 'normal', 'correo'], ['elite', 'normal', 'pausa'], ['normal', 'economato', 'correo']],
      fin: 'i_dataset', cita: 'Auditoría del dataset', sala: 'Almacén de Datos', sub: 'El Dataset robado te espera', texto: 'Alguien ha encontrado el dataset de entrenamiento. Es todo el catálogo de Fans Of.' },
    { dia: 'Viernes', nivel: 6, descanso: 0.25, horas: [['normal', 'elite', 'correo'], ['normal', 'normal', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'i_gpu', cita: 'Sobrecarga de la granja', sala: 'Pasillo de refrigeración', sub: 'La Granja de GPUs te espera', texto: 'Los ventiladores suenan como un avión despegando. Dicen que es normal. No lo es.' },
    { dia: 'Lunes', nivel: 6, descanso: 0.5, horas: [['normal', 'normal', 'correo'], ['elite', 'normal', 'pausa'], ['normal', 'economato', 'pausa']],
      fin: 'iahorro', tipoFin: 'jefe', cita: 'Reunión con IAhorro', sala: 'Sala de servidores 3', sub: 'IAhorro, la máquina', texto: 'La propia IAhorro te ha convocado. Sin orden del día, sin sala y sin cara: solo un ventilador que sube de revoluciones.' },
  ] },
);
// Eventos propios de IAhorro: salen en lugar de los correos de siempre (más unos pocos de los de Microblizz).
DC_CAPITULOS[2].correos = [
  { id: 'i_clon_gris', titulo: 'Clon gris', texto: 'Una impresora de clones escupe una copia gris de algo tuyo. La copia te mira y asiente, orgullosa de sí misma.', opciones: [
    { texto: 'Quedarme con el clon', riesgo: 'arriesgado', fx: { duplicaAzar: true, vida: -6 }, det: 'Una copia de una carta al azar entra en tu mazo, pero te deja −6 de vida.' },
    { texto: 'Desenchufar la impresora', riesgo: 'seguro', fx: { nominas: 20 }, det: '+20 de bonus por ahorrar electricidad.' },
    { texto: 'Pedirle que se vaya', riesgo: 'seguro', fx: { vida: 6 }, det: 'El clon se disculpa y te cuida: te curas 6.' }] },
  { id: 'i_prompt_casa', titulo: 'Prompt de la casa', texto: 'Una ventana de texto parpadea: «Escribe lo que quieras. Lo que escribas será nuestro».', opciones: [
    { texto: 'Escribir una obra maestra', riesgo: 'arriesgado', fx: { ascensoAzar: true, nominas: -15 }, det: 'Una carta de tu mazo asciende; te cobran 15 de bonus por «uso de la plataforma».' },
    { texto: 'Escribir basura', riesgo: 'seguro', fx: { nominas: 10 }, det: '+10 de bonus: les ha encantado.' },
    { texto: 'No escribir nada', riesgo: 'seguro', fx: {}, det: 'No pasa nada. Ya te escribirá algo ella.' }] },
  { id: 'i_datos_permiso', titulo: 'Datos sin permiso', texto: 'La granja ha encontrado tus datos. Todos. «Es que estaban ahí», dice el sistema.', opciones: [
    { texto: 'Pedir que los borren', riesgo: 'seguro', fx: { vida: -4, vidaMax: 4 }, det: '+4 de vida máxima y −4 de vida: tardan un año en borrarlos.' },
    { texto: 'Venderlos tú antes', riesgo: 'arriesgado', fx: { nominas: 35, vida: -10 }, det: '+35 de bonus, pero te llevas −10 de vida del susto.' },
    { texto: 'Aceptar los términos', riesgo: 'arriesgado', fx: { objeto: true, perderAzar: true }, det: 'Un objeto al azar… y una carta de tu mazo desaparece, como dice la letra pequeña.' }] },
  { id: 'i_resumen_auto', titulo: 'Resumen automático', texto: 'IAhorro te manda el resumen de tu día. Dice que has hecho «todo muy bien», que nunca has estado aquí y que ya está facturado.', opciones: [
    { texto: 'Corregir el resumen', riesgo: 'seguro', fx: { vida: -5, nominas: 25 }, det: '+25 de bonus por la corrección, −5 de vida por la discusión.' },
    { texto: 'Firmarlo', riesgo: 'seguro', fx: { vida: 8 }, det: 'Te curas 8: una cosa menos de la que preocuparte.' }] },
  { id: 'i_licencia', titulo: 'Licencia de entrenamiento', texto: 'Una licencia dice que puedes usar tus propias ideas a cambio de una cuota. La cuota es una idea tuya.', opciones: [
    { texto: 'Pagar la cuota', riesgo: 'arriesgado', fx: { nominas: -25, carta: 'rara' }, det: 'Pagas 25 de bonus por una carta rara.' },
    { texto: 'Rechazar', riesgo: 'seguro', fx: {}, det: 'Sigues con lo que tenías.' },
    { texto: 'Reclamar autoría', riesgo: 'arriesgado', fx: { vidaMax: 5, nominas: -10 }, det: '+5 de vida máxima y −10 de bonus: les cuesta mucho creer que existes.' }] },
];
