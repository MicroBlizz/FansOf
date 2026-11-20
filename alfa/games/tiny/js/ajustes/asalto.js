// Tiny Fans · AJUSTES · ASALTO: el nido abandonado, fijo y hecho por nosotros (docs/tiny/PROTOTIPO.md, «El asalto», con el nido del panel
// de niveles P3 y las decisiones del integrador). Casillas: col 0..7 (x) y fila 0..7 (z, de lejos a cerca). Dueño: N3 (reglas).
'use strict';
AJUSTES.asalto = TN.congela({
  segundos: 120,                     // (cuaderno) 2 minutos; se entra con la grapadora tal cual y la batería solo baja con los golpes
  bateria: 100,                      // (partida) se entra con la batería llena
  casilla: 1.5,                      // (decisión) una casilla mide 1,5 unidades: medio segundo andando
  alcance: 1.6,                      // (partida) la grapadora rompe lo que tiene justo delante (la casilla de al lado)
  coge: 2,                           // (P3) segundos en el almacén para coger el botín
  // (cuaderno) trampas: se pisan, no se rompen. rafaga: (P3) cada cuánto sopla el ventilador; alcance: casillas que barre
  trampas: {
    chinchetas: { dano: 10 }, ratonera: { dano: 30 }, pegamento: { freno: 0.5 },
    ventilador: { empuja: 2, rafaga: 3, alcance: 4 },
  },
  // (P3) piezas que solo tiene este nido; las demás son las de AJUSTES.nido.piezas
  piezas: { 'puerta-plastico': { clase: 'puerta', aguante: 60 } },
  // (decisión) 60 unidades; se rellena cada 2 expediciones (eso lo lleva la aplicación). Orden al coger (P4): pilas, plástico, grapas…
  botin: { pilas: 3, plastico: 20, grapas: 12, carton: 20, migas: 5 },
  abreTrasVueltasConBotin: 1,        // (partida) se abre tras la primera expedición que vuelve con botín
  rellenaCada: 2,                    // (decisión) expediciones con botín para que el nido abandonado se rellene
  // (P3) el nido abandonado, fila a fila. Leyenda: qué pieza (o trampa) es cada letra; sopla: hacia dónde empuja el ventilador en x
  mapa: [
    'PPPPAPP.',
    '.PPPDPPP',
    '.P.cRPg.',
    '.PV.cP##',
    '.PcgcPg.',
    'PP#d#PPP',
    '.......W',
    '...E....',
  ],
  leyenda: {
    P: { pieza: 'pared-plastico' }, '#': { pieza: 'pared-carton' }, D: { pieza: 'puerta-plastico' }, d: { pieza: 'puerta' },
    c: { pieza: 'chinchetas' }, R: { pieza: 'ratonera' }, g: { pieza: 'pegamento' },
    V: { pieza: 'ventilador', sopla: 1 }, W: { pieza: 'ventilador', sopla: -1 }, A: { pieza: 'almacen' }, E: { pieza: 'entrada' },
  },
});
