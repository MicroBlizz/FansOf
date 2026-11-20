// Tiny Fans · AJUSTES · ASALTO: el nido abandonado, fijo y hecho por nosotros (docs/tiny/PROTOTIPO.md, «El asalto»).
// Dueño: N11 (dominio del asalto), con el nido del panel de niveles.
'use strict';
AJUSTES.asalto = TN.congela({
  segundos: 120,                     // (cuaderno) 2 minutos; se entra con la grapadora tal cual y la batería solo baja con los golpes
  trampas: {                         // (cuaderno)
    chinchetas: { dano: 10 }, ratonera: { dano: 30 }, pegamento: { freno: 0.5 }, ventilador: { empuja: 2 },
  },
  botin: { carton: 30, plastico: 20, grapas: 20, migas: 10, pilas: 3 },   // (partida) lo que guarda el nido abandonado
  abreTrasVueltasConBotin: 1,        // (partida) se abre tras la primera expedición que vuelve con botín
  // el nido abandonado: [{ pieza, col, fila }], con las piezas de AJUSTES.nido.piezas y las trampas de arriba. Provisional (N1): vacío
  nido: [],
});
