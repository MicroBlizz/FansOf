// Fans of Asalto · Los ajustes de las piedras de destino y de sus misiones con plazo (aparte de ajustes.js, que ya va lleno): cuándo
// sale una misión de piedra, cuántas piedras caben en la bolsa, qué sube cada piedra y qué pide cada misión. Solo datos: las reglas
// están en dominio/piedras.js.
'use strict';
// primera: la oleada en la que sale la primera misión de piedra; cada: cada cuántas oleadas sale otra (si no hay una en marcha y cabe
// otra piedra); bolsa: cuántas piedras se pueden guardar.
// tipos: sube = cuántos niveles de rareza sube a los héroes de su tirada (nunca por encima de las rarezas abiertas); plazo = las
// oleadas que da su misión para cumplirla; peso = lo a menudo que toca esa piedra; col = el color con el que se dibuja.
// misiones: txt corto (tiene que caber en la cinta a tamaño grande: unas 27 letras); stat = el contador de la partida que miran (cuenta desde que sale la misión); meta = cuánto piden según la piedra que dan.
ASALTO.piedras = {
  primera: 2, cada: 3, bolsa: 3,
  tipos: {
    menor: { nombre: 'Piedra menor', sube: 1, plazo: 2, peso: 60, col: '#c98a4a' },
    mayor: { nombre: 'Piedra mayor', sube: 2, plazo: 3, peso: 30, col: '#3f8ae8' },
    gran:  { nombre: 'Gran piedra',  sube: 3, plazo: 4, peso: 10, col: '#ffd23a' },
  },
  misiones: {
    lineas: { txt: 'Haz {n} líneas en el Altar', stat: 'lineas', meta: { menor: 3, mayor: 5, gran: 7 } },
    bajas:  { txt: 'Derrota a {n} enemigos', stat: 'bajas', meta: { menor: 12, mayor: 25, gran: 45 } },
    limpia: { txt: '{n} oleadas sin perder vidas', stat: 'limpias', meta: { menor: 2, mayor: 3, gran: 4 } },
    une:    { txt: 'Une a {n} héroes', stat: 'absorbidos', meta: { menor: 2, mayor: 3, gran: 5 } },
    doble:  { txt: 'Consigue {n} ¡DOBLE! o más', stat: 'dobles', meta: { menor: 1, mayor: 2, gran: 3 } },
  },
};
