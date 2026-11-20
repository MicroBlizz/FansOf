// Tiny Fans · AJUSTES · METAS: la escalera de cinco metas del nido, cada una con un material distinto, para que siempre haya «una cosa
// más» que hacer (panel de retención). cuenta: qué se mira: { pieza } = cuántas hay puestas en el nido; { contador } = uno de la partida.
'use strict';
// (probadores) el paquete de mensajería: uno al día; la racha de días seguidos elige el regalo (da la vuelta al llegar al final)
AJUSTES.diario = TN.congela({
  regalos: [{ carton: 10, grapas: 4 }, { carton: 8, migas: 8, pilas: 1 }, { plastico: 8, grapas: 6 }, { carton: 12, plastico: 6, pilas: 1 }, { carton: 15, grapas: 10, migas: 10, plastico: 10, pilas: 2 }],
});
AJUSTES.metas = TN.congela({
  lista: [
    { id: 'paredes', texto: 'Pon 4 paredes de cartón', cuenta: { pieza: 'pared-carton' }, pide: 4 },
    { id: 'puerta', texto: 'Pon una puerta', cuenta: { pieza: 'puerta' }, pide: 1 },
    { id: 'chinchetas', texto: 'Pon unas chinchetas', cuenta: { pieza: 'chinchetas' }, pide: 1 },
    { id: 'plastico', texto: 'Pon 4 paredes de plástico', cuenta: { pieza: 'pared-plastico' }, pide: 4 },
    { id: 'asalto', texto: 'Vuelve de un asalto con botín', cuenta: { contador: 'asaltosConBotin' }, pide: 1 },
    { id: 'muralla', texto: 'Ten 8 paredes de cartón', cuenta: { pieza: 'pared-carton' }, pide: 8 },
    { id: 'veterano', texto: 'Vuelve 10 veces con botín', cuenta: { contador: 'vueltasConBotin' }, pide: 10 },
    { id: 'saqueador', texto: 'Gana 3 asaltos', cuenta: { contador: 'asaltosConBotin' }, pide: 3 },
  ],
});
