// Fans of Basement · Ajustes del árbol de talentos de la FORMACIÓN (las ramas, lo que cuesta cada fila, el reinicio, los cursos de
// antes para devolverlos y los 33 talentos). Va aparte de ajustes.js para que ningún archivo pase de 25 KB; se carga antes y
// ajustes.js lo mete en BAS.AJ.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
BAS.AJ_FORMACION = {
  // La FORMACIÓN es un árbol de talentos con tres ramas (columnas) de 7 filas. Un talento se puede comprar si tienes alguno de la fila
  // de encima de su rama (los de la fila 1, siempre). En las filas 2 y 4 se pueden tener los dos; en las filas clave (3 y 6), los dos
  // del mismo `grupo` se excluyen: eliges uno. `reinicio` = lo que cuesta deshacer el árbol (te devuelve todo lo gastado).
  // Efectos: cafe/caja/alcance/iman/taza = se suman; dano/vel/valor = % más; cadencia/gasto/crunch = % menos; espera = segundos menos;
  // multi = una grapa más por disparo; blindaje = % menos de golpe; rebote = rebotes; critico = % más de golpe crítico; redes = redes.
  columnas: ['bienestar', 'logistica', 'productividad'],
  nombreColumna: { bienestar: 'BIENESTAR', logistica: 'LOGÍSTICA', productividad: 'PRODUCTIVIDAD' },
  reinicio: 150,
  // Lo que costaban los cursos de la formación de antes (hasta la 0.11.0), para devolverlo si una partida vieja trae uno que ya no vale.
  cursosAntiguos: { mindfulness: 20, barista: 50, siesta: 120, pulmones: 260, cafetera: 500, inmune: 900, intravenoso: 1500, tetris: 20, doblefondo: 50,
    iman: 120, carro: 260, expres: 500, contenedor: 900, tasador: 1500, excel: 25, titanio: 55, atajos: 125, punteria: 265, doble: 505, horasextra: 905, industrial: 1505 },
  costeFila: [30, 70, 150, 300, 550, 900, 1500],
  formacion: [
    { id: 'mindfulness', col: 'bienestar', fila: 1, nombre: 'Mindfulness en el baño', ef: { cafe: 15 } },
    { id: 'barista', col: 'bienestar', fila: 2, nombre: 'Curso de barista', ef: { cafe: 10, taza: 6 } },
    { id: 'siesta', col: 'bienestar', fila: 2, nombre: 'Siesta estratégica', ef: { cafe: 20 } },
    { id: 'pulmones', col: 'bienestar', fila: 3, grupo: 'b3', nombre: 'Pulmones de becario', ef: { gasto: 0.15 } },
    { id: 'cafetera', col: 'bienestar', fila: 3, grupo: 'b3', nombre: 'Cafetera industrial', ef: { cafe: 35 } },
    { id: 'inmune', col: 'bienestar', fila: 4, nombre: 'Inmune al crunch', ef: { crunch: 0.5 } },
    { id: 'yoga', col: 'bienestar', fila: 4, nombre: 'Yoga de escritorio', ef: { blindaje: 0.1 } },
    { id: 'termo', col: 'bienestar', fila: 5, nombre: 'Termo de acero', ef: { taza: 10, cafe: 15 } },
    { id: 'intravenoso', col: 'bienestar', fila: 6, grupo: 'b6', nombre: 'Café intravenoso', ef: { cafe: 40 } },
    { id: 'zen', col: 'bienestar', fila: 6, grupo: 'b6', nombre: 'Becario zen', ef: { gasto: 0.15, blindaje: 0.1 } },
    { id: 'indefinido', col: 'bienestar', fila: 7, nombre: 'Contrato indefinido', ef: { cafe: 30, blindaje: 0.1 } },
    { id: 'tetris', col: 'logistica', fila: 1, nombre: 'Tetris de mudanzas', ef: { caja: 6 } },
    { id: 'iman', col: 'logistica', fila: 2, nombre: 'Imán de nevera', ef: { iman: 25 } },
    { id: 'carro', col: 'logistica', fila: 2, nombre: 'Carro de la compra', ef: { caja: 6 } },
    { id: 'expres', col: 'logistica', fila: 3, grupo: 'l3', nombre: 'Ascensor exprés', ef: { espera: 1 } },
    { id: 'tasador', col: 'logistica', fila: 3, grupo: 'l3', nombre: 'Tasador experto', ef: { valor: 0.15 } },
    { id: 'contenedor', col: 'logistica', fila: 4, nombre: 'Contenedor de obra', ef: { caja: 10 } },
    { id: 'zapatillas', col: 'logistica', fila: 4, nombre: 'Zapatillas de oficina', ef: { vel: 0.1 } },
    { id: 'redcables', col: 'logistica', fila: 5, nombre: 'Red de cables extra', ef: { redes: 1, caja: 6 } },
    { id: 'llavevip', col: 'logistica', fila: 6, grupo: 'l6', nombre: 'Llave del ascensor VIP', ef: { espera: 1, vel: 0.1 } },
    { id: 'subastador', col: 'logistica', fila: 6, grupo: 'l6', nombre: 'Subastador', ef: { valor: 0.25 } },
    { id: 'jefelogistica', col: 'logistica', fila: 7, nombre: 'Jefe de logística', ef: { caja: 12, valor: 0.1 } },
    { id: 'excel', col: 'productividad', fila: 1, nombre: 'Excel avanzado', ef: { dano: 0.15 } },
    { id: 'titanio', col: 'productividad', fila: 2, nombre: 'Grapas de titanio', ef: { dano: 0.15 } },
    { id: 'atajos', col: 'productividad', fila: 2, nombre: 'Atajos de teclado', ef: { cadencia: 0.1 } },
    { id: 'doble', col: 'productividad', fila: 3, grupo: 'p3', nombre: 'Grapadora doble', ef: { multi: 1 } },
    { id: 'punteria', col: 'productividad', fila: 3, grupo: 'p3', nombre: 'Puntería de becario', ef: { alcance: 30, dano: 0.15 } },
    { id: 'horasextra', col: 'productividad', fila: 4, nombre: 'Horas extra', ef: { cadencia: 0.1 } },
    { id: 'saltarinas', col: 'productividad', fila: 4, nombre: 'Grapas saltarinas', ef: { rebote: 1 } },
    { id: 'industrial', col: 'productividad', fila: 5, nombre: 'Grapadora industrial', ef: { dano: 0.25 } },
    { id: 'auditor', col: 'productividad', fila: 6, grupo: 'p6', nombre: 'Ojo de auditor', ef: { critico: 0.12 } },
    { id: 'pianista', col: 'productividad', fila: 6, grupo: 'p6', nombre: 'Dedos de pianista', ef: { cadencia: 0.15 } },
    { id: 'vision', col: 'productividad', fila: 7, nombre: 'Visión de CEO', ef: { dano: 0.25, critico: 0.05 } },
  ],
};
