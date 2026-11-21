// Fans of Toys · AJUSTES: lo que core necesita saber del juego (nombre y clave de la partida) y todas las cifras de las reglas.
// Son valores de partida del prototipo (tarea #259): se ajustan al probar, con el robot de tests/toys/integracion/equilibrio.test.mjs.
// El dominio nunca lee AJUSTES por su cuenta: lo recibe como `reglas`.
'use strict';
const AJUSTES = {
  id: '',                       // sin id a propósito (como Tiny): la cuenta de core queda apagada y el récord vive solo en este móvil
  nombre: 'Fans of Toys',
  guardado: 'for-toys-v1',      // la clave del récord en este navegador
  sinFeedback: true,            // la pestaña de feedback de core necesita cuenta: en el prototipo no sale
};
// el año fiscal: 12 meses en 4 trimestres, cada uno con su meta de beneficio
AJUSTES.partida = TY.congela({
  dineroInicial: 600,
  meses: 12,
  mesesPorTrimestre: 3,
  metas: [600, 1150, 1350, 2500],                                             // beneficio que pide el consejo en cada trimestre
  temporada: [0.8, 0.8, 0.9, 1, 1, 0.9, 0.8, 0.9, 1.1, 1.3, 1.8, 3],        // cuánto se vende cada mes: diciembre es Navidad
  azar: 0.2,                    // la demanda baila un 20 % arriba o abajo
  ofertaJuguetes: 3,            // juguetes entre los que se elige cada mes
  ofertaMejoras: 3,             // mejoras entre las que se elige al pasar un trimestre
  almacenPorUnidad: 1,          // lo que cuesta al mes cada unidad que sobra
  moda: 1.5,                    // lo que vende de más la franquicia de moda del trimestre
  probEvento: 0.65,             // probabilidad de que un mes traiga noticia
  mesesSinEvento: 1,            // el primer mes no trae noticia: se aprende a jugar sin sustos
});
// los tres botones de cada decisión del mes
AJUSTES.cantidades = TY.congela({ nada: { lote: 0 }, poca: { lote: 0.6 }, media: { lote: 1 }, mucha: { lote: 1.8 } });
AJUSTES.precios = TY.congela({ barato: { precio: 0.75, demanda: 1.5 }, normal: { precio: 1, demanda: 1 }, caro: { precio: 1.35, demanda: 0.6 } });
AJUSTES.publicidad = TY.congela({ nada: { coste: 0, demanda: 1 }, redes: { coste: 40, demanda: 1.3 }, tele: { coste: 130, demanda: 1.7 } });   // el coste se multiplica por el trimestre
AJUSTES.lujo = TY.congela({ molde: 200, precio: 22 });   // desde qué molde un juguete es «de coleccionista» y desde qué precio es «caro»
// los minijuegos del mes: uno por mes, rotando; la nota (0 a 1) que saques da un bonus de hasta esto
AJUSTES.minijuegos = TY.congela({
  orden: ['calidad', 'prensa', 'likes'],
  calidad: { precio: 0.12 },      // la nota máxima sube el precio de venta un 12 %
  prensa: { unidades: 0.25 },     // y regala hasta un 25 % más de unidades fabricadas
  likes: { demanda: 0.25 },       // y sube hasta un 25 % la demanda
});
// la vitrina: la edición dorada llega al vender `oroVentas` veces la demanda normal del juguete en un año; el raro sale a veces desde `raroDesde`
AJUSTES.coleccion = TY.congela({ oroVentas: 3, raroProb: 0.18, raroDesde: 1 });
// lo que se va abriendo de una partida a otra: el nivel es el trimestre más lejano al que se ha llegado (0 a 4)
AJUSTES.nivelMaximo = 4;
