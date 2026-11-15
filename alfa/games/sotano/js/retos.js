// Fans Of Sótano · RETOS: los datos de las misiones diarias, semanales y logros, para el sistema común de retos ligeros de core (RETOSL,
// core/js/sistema/retos-ligero.js). Cada uno: id, txt (lo que pide), goal (cuántas veces), ev (el aviso que lo cuenta: lo dan los casos de
// uso, aplicacion/casos.js) y r (el premio, en Indemnización). Los logros se miden contra el total de toda la vida.
'use strict';
SO.DIARIAS = [
  { id: 'd-bloques', txt: 'Rompe 500 bloques', goal: 500, ev: 'bloques', r: 4 },
  { id: 'd-toques', txt: 'Toca 100 bloques', goal: 100, ev: 'toques', r: 3 },
  { id: 'd-dinamita', txt: 'Lanza la dinamita 10 veces', goal: 10, ev: 'dinamitas', r: 3 },
  { id: 'd-correos', txt: 'Abre 5 correos del CEO', goal: 5, ev: 'correos', r: 4 },
  { id: 'd-cofres', txt: 'Abre 3 cofres', goal: 3, ev: 'cofres', r: 3 },
  { id: 'd-mejoras', txt: 'Compra 25 mejoras', goal: 25, ev: 'mejoras', r: 3 },
  { id: 'd-ataque', txt: 'Ataca a la Trituradora', goal: 1, ev: 'ataques', r: 3 },
];
SO.SEMANALES = [
  { id: 's-bloques', txt: 'Rompe 10.000 bloques', goal: 10000, ev: 'bloques', r: 25 },
  { id: 's-despidos', txt: 'Despídete 5 veces', goal: 5, ev: 'despidos', r: 30 },
  { id: 's-correos', txt: 'Abre 40 correos del CEO', goal: 40, ev: 'correos', r: 25 },
  { id: 's-sindicato', txt: 'Abre 10 paquetes del sindicato', goal: 10, ev: 'sindicatos', r: 25 },
];
SO.LOGROS = [
  { id: 'l-primer', txt: 'Rompe tu primer bloque', goal: 1, ev: 'bloques', r: 2 },
  { id: 'l-mil', txt: 'Rompe 1.000 bloques', goal: 1000, ev: 'bloques', r: 5 },
  { id: 'l-cienmil', txt: 'Rompe 100.000 bloques', goal: 100000, ev: 'bloques', r: 40 },
  { id: 'l-p10', txt: 'Llega a la planta 10', goal: 10, ev: 'planta', r: 3 },
  { id: 'l-p30', txt: 'Llega a la planta 30', goal: 30, ev: 'planta', r: 8 },
  { id: 'l-p50', txt: 'Llega a la planta 50', goal: 50, ev: 'planta', r: 20 },
  { id: 'l-p80', txt: 'Llega a la planta 80', goal: 80, ev: 'planta', r: 60 },
  { id: 'l-n20', txt: 'Llega al nivel 20', goal: 20, ev: 'nivel', r: 4 },
  { id: 'l-n50', txt: 'Llega al nivel 50', goal: 50, ev: 'nivel', r: 30 },
  { id: 'l-trit1', txt: 'Rompe un nivel de la Trituradora', goal: 1, ev: 'trituradora', r: 10 },
  { id: 'l-trit5', txt: 'Rompe cinco niveles de la Trituradora', goal: 5, ev: 'trituradora', r: 40 },
  { id: 'l-trit10', txt: 'Destroza la Trituradora entera', goal: 10, ev: 'trituradora', r: 200 },
  { id: 'l-despido', txt: 'Que te despidan por primera vez', goal: 1, ev: 'despidos', r: 5 },
  { id: 'l-despido25', txt: 'Que te despidan 25 veces', goal: 25, ev: 'despidos', r: 40 },
  { id: 'l-dinamita', txt: 'Lanza 100 dinamitas', goal: 100, ev: 'dinamitas', r: 10 },
  { id: 'l-correos', txt: 'Abre 100 correos del CEO', goal: 100, ev: 'correos', r: 15 },
  { id: 'l-cofres', txt: 'Abre 50 cofres', goal: 50, ev: 'cofres', r: 15 },
  { id: 'l-expediente', txt: 'Sube 10 expedientes de rango', goal: 10, ev: 'expedientes', r: 15 },
  { id: 'l-recuerdos', txt: 'Compra 20 Recuerdos', goal: 20, ev: 'recuerdos', r: 15 },
  { id: 'l-carrera', txt: 'Completa 6 nodos del plan de carrera', goal: 6, ev: 'carrera', r: 20 },
];
