// Fans of Asalto · Los ajustes del regalo diario (calendario de 7 días, tarea #313) y de las misiones del día (tarea #317); aparte de ajustes.js, que ya va lleno.
// Solo datos: las reglas del regalo están en dominio/regalo.js y las misiones las lleva el sistema común de retos de core (RETOSL).
'use strict';
// regalo.dias: el premio de cada día del calendario, en orden; tras el séptimo vuelve al primero. plumas: las que da; cofres: cuántos cofres de equipo
// (el mismo de la Tienda del menú, pero sin pagar plumas). Con un anuncio se puede doblar el premio del día, una vez al día.
ASALTO.regalo = {
  dias: [{ plumas: 20 }, { plumas: 30 }, { cofres: 1 }, { plumas: 40 }, { plumas: 50 }, { plumas: 60 }, { plumas: 100, cofres: 2 }],
};
// retosDia: las misiones del día (se rehacen cada día). ev: el evento de la partida que las hace subir (los contadores de la partida,
// lo cuenta aplicacion/casos.js); goal: la meta; r: las plumas de premio; icono: el de AS.dibujos.
ASALTO.retosDia = [
  { id: 'oleadas', txt: 'Gana {n} oleadas', goal: 5, ev: 'oleadas', r: 15, icono: 'corazon' },
  { id: 'unir', txt: 'Une a {n} héroes', goal: 3, ev: 'unidos', r: 10, icono: 'yunque' },
  { id: 'lineas', txt: 'Haz {n} líneas en el Altar', goal: 2, ev: 'lineas', r: 10, icono: 'reliquia-dado' },
];
