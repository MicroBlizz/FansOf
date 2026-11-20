// Fans of Toys · datos · RAROS: los errores de fábrica que a veces salen en el mes, de edición limitada. Cuestan poco, no llevan molde y
// se venden a precio de coleccionista, pero casi nadie los quiere: la demanda es pequeña. Fabricar uno lo guarda en la vitrina para siempre.
// `base` es el juguete del que sale su dibujo. TY.TODOS junta los juguetes normales y los raros (lo que recibe el dominio).
'use strict';
TY.RAROS = TY.congela([
  { id: 'raro-bunny', base: 'bunny', raro: true, nombre: 'Peluche con tres orejas', franquicia: 'animales', coste: 8, precio: 30, molde: 0, demanda: 7, desde: 0,
    texto: 'Salió con una oreja de más. Los coleccionistas dicen que es la buena.' },
  { id: 'raro-becario', base: 'becario', raro: true, nombre: 'Becario con el brazo al revés', franquicia: 'oficina', coste: 6, precio: 20, molde: 0, demanda: 7, desde: 0,
    texto: 'Control de calidad lo dio por válido: «tampoco se queja».' },
  { id: 'raro-zombi', base: 'zombi', raro: true, nombre: 'No-muerto que huele a fresa', franquicia: 'nomuertos', coste: 5, precio: 15, molde: 0, demanda: 7, desde: 0,
    texto: 'Se les cayó el perfume en la cinta. Ahora nadie quiere abrazarlo.' },
  { id: 'raro-lola', base: 'lola', raro: true, nombre: 'Lola en «reunión que podía ser un correo»', franquicia: 'oficina', coste: 12, precio: 45, molde: 0, demanda: 7, desde: 0,
    texto: 'Trae un reloj que se para a los cinco minutos. Como las reuniones de verdad, al revés.' },
  { id: 'raro-streamer', base: 'streamer', raro: true, nombre: 'Streamer con el aro de luz fundido', franquicia: 'streamers', coste: 16, precio: 55, molde: 0, demanda: 7, desde: 0,
    texto: 'Directo cancelado por «problemas técnicos». Cuesta más que el normal.' },
  { id: 'raro-ceo', base: 'ceo', raro: true, nombre: 'Figura del CEO sin maletín', franquicia: 'oficina', coste: 24, precio: 100, molde: 0, demanda: 4, desde: 3,
    texto: 'Hacienda le ha embargado el maletín. Solo hay unas pocas en el mundo.' },
]);
TY.TODOS = TY.congela([...TY.JUGUETES, ...TY.RAROS]);
