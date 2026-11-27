// Fans of Pop · OPCIONES POR BLOQUES (tarea 430, boceto B de Pepins): qué bloques lleva la ventana de Opciones, con qué filas y en qué orden.
// Solo datos y reglas, sin DOM ni SAVE: la ventana la pinta js/opciones-pantalla.js. «empezar» (EMPEZAR DE NUEVO) solo sale con un camino
// empezado, como en la columna de siempre; un bloque que se queda sin filas no sale.
'use strict';
const PP_OPC_BLOQUES = (() => {
  const BLOQUES = Object.freeze([
    { titulo: 'SONIDO', filas: ['sonido', 'vibracion'] },
    { titulo: 'JUEGO', filas: ['idioma', 'ahorro', 'consejos'] },
    { titulo: 'CUENTA', filas: ['cuenta'] },
    { titulo: 'AYUDA Y MÁS', filas: ['ayuda', 'legal', 'empezar'] },
  ]);
  // estado: { caminoEmpezado } → [{ titulo, filas: [id…] }]
  function bloques(estado) {
    const sale = id => id !== 'empezar' || !!(estado && estado.caminoEmpezado);
    return BLOQUES.map(b => ({ titulo: b.titulo, filas: b.filas.filter(sale) })).filter(b => b.filas.length > 0);
  }
  return { bloques };
})();
