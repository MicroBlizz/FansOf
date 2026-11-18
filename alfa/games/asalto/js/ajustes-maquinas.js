// Fans of Asalto · Los ajustes de las máquinas de invocar y de las dificultades de cada zona (aparte de ajustes.js, que ya va lleno).
// Solo datos: las reglas están en dominio/altar.js (el Estallido), dominio/oleadas.js (la fuerza) y dominio/progreso.js (abrirlas).
'use strict';
// Las máquinas: se elige una ANTES de la partida (en el menú) y vale para toda ella. La primera es la de siempre y ya viene abierta.
// plumas y zona: lo que cuesta abrirla y la zona que hay que haber superado (su número en `zonas`). empujones: los que suma o quita a
// los de cada oleada. estallidos: cuántos Estallidos da por oleada (rompe todas las runas de la clase que más se repite y caen nuevas).
ASALTO.maquinas = {
  altar:     { nombre: 'Altar de runas', txt: 'El de siempre: un empujón en cada oleada.' },
  estallido: { nombre: 'Altar del Estallido', txt: 'Sin el empujón de salida. A cambio, un ESTALLIDO por oleada: rompe la clase que más se repite y caen runas nuevas.',
    plumas: 200, zona: 0, empujones: -1, estallidos: 1 },
};
// Las dificultades de cada zona, de menos a más: cada una se abre al superar la anterior EN ESA ZONA. fuerza multiplica la de los
// enemigos (jefe incluido); plumas, las que da la partida por oleada, por cofre y por jefe. El modo sin fin va siempre en la primera.
ASALTO.dificultades = [
  { id: 'normal',    nombre: 'Normal',    fuerza: 1,    plumas: 1 },
  { id: 'dificil',   nombre: 'Difícil',   fuerza: 1.6, plumas: 1.5 },
  { id: 'pesadilla', nombre: 'Pesadilla', fuerza: 2.3,  plumas: 2.2 },
];
