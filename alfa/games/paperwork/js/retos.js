// Fans Of Paperwork · RETOS: los datos de las misiones diarias, semanales y logros, para el sistema común de retos ligeros de core (RETOSL,
// core/js/sistema/retos-ligero.js). Cada uno: id, txt (lo que pide), goal (cuántas veces), ev (el aviso que lo cuenta: lo dan los casos de
// uso, aplicacion/casos.js) y r (el premio, en Indemnización). Los logros se miden contra el total de toda la vida.
'use strict';
PW.DIARIAS = [
  { id: 'd-archivadores', txt: 'Vacía 500 archivadores', goal: 500, ev: 'archivadores', r: 4 },
  { id: 'd-toques', txt: 'Rebusca tú en 100 archivadores', goal: 100, ev: 'toques', r: 3 },
  { id: 'd-estanteria', txt: 'Haz que el castor vuelque la estantería 10 veces', goal: 10, ev: 'estanterias', r: 3 },
  { id: 'd-correos', txt: 'Abre 5 correos del CEO', goal: 5, ev: 'correos', r: 4 },
  { id: 'd-cofres', txt: 'Abre 3 cofres', goal: 3, ev: 'cofres', r: 3 },
  { id: 'd-mejoras', txt: 'Compra 25 mejoras', goal: 25, ev: 'mejoras', r: 3 },
  { id: 'd-urgentes', txt: 'Entrega algo urgente a tiempo 3 veces', goal: 3, ev: 'urgentes', r: 4 },
  { id: 'd-pedidos', txt: 'Cumple un pedido del CEO', goal: 1, ev: 'pedidos', r: 4 },
  { id: 'd-ataque', txt: 'Intenta atascar la Trituradora', goal: 1, ev: 'atascos', r: 3 },
];
PW.SEMANALES = [
  { id: 's-archivadores', txt: 'Vacía 10.000 archivadores', goal: 10000, ev: 'archivadores', r: 25 },
  { id: 's-despidos', txt: 'Despídete 5 veces', goal: 5, ev: 'despidos', r: 30 },
  { id: 's-correos', txt: 'Abre 40 correos del CEO', goal: 40, ev: 'correos', r: 25 },
  { id: 's-sindicato', txt: 'Abre 10 paquetes del sindicato', goal: 10, ev: 'sindicatos', r: 25 },
];
PW.LOGROS = [
  { id: 'l-primer', txt: 'Vacía tu primer archivador', goal: 1, ev: 'archivadores', r: 2 },
  { id: 'l-mil', txt: 'Vacía 1.000 archivadores', goal: 1000, ev: 'archivadores', r: 5 },
  { id: 'l-cienmil', txt: 'Vacía 100.000 archivadores', goal: 100000, ev: 'archivadores', r: 40 },
  { id: 'l-p10', txt: 'Llega a la planta 10', goal: 10, ev: 'planta', r: 3 },
  { id: 'l-p30', txt: 'Llega a la planta 30', goal: 30, ev: 'planta', r: 8 },
  { id: 'l-p50', txt: 'Llega a la planta 50', goal: 50, ev: 'planta', r: 20 },
  { id: 'l-p80', txt: 'Llega a la planta 80', goal: 80, ev: 'planta', r: 60 },
  { id: 'l-n20', txt: 'Llega al nivel 20', goal: 20, ev: 'nivel', r: 4 },
  { id: 'l-n50', txt: 'Llega al nivel 50', goal: 50, ev: 'nivel', r: 30 },
  { id: 'l-trit1', txt: 'Atasca un nivel de la Trituradora', goal: 1, ev: 'trituradora', r: 10 },
  { id: 'l-trit5', txt: 'Atasca cinco niveles de la Trituradora', goal: 5, ev: 'trituradora', r: 40 },
  { id: 'l-trit10', txt: 'Atasca la Trituradora del todo', goal: 10, ev: 'trituradora', r: 200 },
  { id: 'l-despido', txt: 'Que te despidan por primera vez', goal: 1, ev: 'despidos', r: 5 },
  { id: 'l-cartas', txt: 'Elige 10 cartas de recomendación', goal: 10, ev: 'cartas', r: 10 },
  { id: 'l-pedidos', txt: 'Cumple 25 pedidos del CEO', goal: 25, ev: 'pedidos', r: 20 },
  { id: 'l-despido25', txt: 'Que te despidan 25 veces', goal: 25, ev: 'despidos', r: 40 },
  { id: 'l-estanteria', txt: 'Vuelca 100 estanterías', goal: 100, ev: 'estanterias', r: 10 },
  { id: 'l-correos', txt: 'Abre 100 correos del CEO', goal: 100, ev: 'correos', r: 15 },
  { id: 'l-cofres', txt: 'Abre 50 cofres', goal: 50, ev: 'cofres', r: 15 },
  { id: 'l-especialidad', txt: 'Sube 10 rangos de especialidad', goal: 10, ev: 'especialidad', r: 15 },
  { id: 'l-recuerdos', txt: 'Compra 20 Recuerdos', goal: 20, ev: 'recuerdos', r: 15 },
  { id: 'l-carrera', txt: 'Completa 6 nodos del plan de carrera', goal: 6, ev: 'carrera', r: 20 },
];
