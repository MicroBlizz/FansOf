// Tiny Fans · AJUSTES · METAS: la escalera de cinco metas del nido, cada una con un material distinto, para que siempre haya «una cosa
// más» que hacer (panel de retención). cuenta: qué se mira: { pieza } = cuántas hay puestas en el nido; { contador } = uno de la partida.
'use strict';
AJUSTES.metas = TN.congela({
  lista: [
    { id: 'paredes', texto: 'Pon 4 paredes de cartón', cuenta: { pieza: 'pared-carton' }, pide: 4 },
    { id: 'puerta', texto: 'Pon una puerta', cuenta: { pieza: 'puerta' }, pide: 1 },
    { id: 'chinchetas', texto: 'Pon unas chinchetas', cuenta: { pieza: 'chinchetas' }, pide: 1 },
    { id: 'plastico', texto: 'Pon 4 paredes de plástico', cuenta: { pieza: 'pared-plastico' }, pide: 4 },
    { id: 'asalto', texto: 'Vuelve de un asalto con botín', cuenta: { contador: 'asaltosConBotin' }, pide: 1 },
  ],
});
