// Fans of Pop · TEMAS DEL PASE (tarea #165, ADR 165; Pepins, 19-11-2026: «un tema al mes»). Cada mes el pase cambia de nombre y
// colores y trae su bandeja y su compañero exclusivos (dorado 40 y 60). Datos puros: el mes entra como número (1 a 12).
// La bandeja de cada tema está en PP_BANDEJAS (js/bandeja.js, `temporada: true`). Los compañeros, de momento, los dos que solo da el
// pase dorado (js/companeros-datos.js); los exclusivos nuevos de cada mes, con su dibujo de Yoshi, llegarán por tandas.
'use strict';
const PP_PASE_TEMAS = (() => {
  const f = Object.freeze;
  const t = (nombre, color, color2, bandeja, companero) => f({ nombre, color, color2, bandeja, companero });
  const MESES = f([
    t('Invierno de gelatina', '#9fd8ff', '#3a8ee6', 'escarcha', 'caballito'),
    t('Corazones de azúcar', '#ff9cc4', '#e2559c', 'corazones', 'luciernaga'),
    t('Primavera de chuche', '#9cf0a0', '#3fc277', 'brote', 'caballito'),
    t('Lluvia de colores', '#a8e4ff', '#2f8fd0', 'charco', 'luciernaga'),
    t('Jardín en flor', '#ffd1ec', '#ff6ec7', 'petalo', 'caballito'),
    t('Verano de helado', '#fff0a0', '#ffb020', 'helado', 'luciernaga'),
    t('Playa de gelatina', '#9ff0e8', '#1fb8a8', 'ola', 'caballito'),
    t('Feria de verano', '#ffd27a', '#ff7a1a', 'farolillo', 'luciernaga'),
    t('Vuelta al cole', '#ffe680', '#e0a000', 'pupitre', 'caballito'),
    t('Otoño de gelatina', '#ffb878', '#d86a1a', 'hojas', 'luciernaga'),
    t('Calabazas dulces', '#ffa860', '#e0601a', 'calabaza', 'caballito'),
    t('Navidad de gelatina', '#ff8a8a', '#d83a3a', 'nieve', 'luciernaga'),
  ]);
  // el tema de una temporada «AAAA-MM»
  const de = temporada => MESES[(Number(String(temporada).slice(5, 7)) || 1) - 1];
  return f({ MESES, de });
})();
