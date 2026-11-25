// Fans of Asalto · Los ajustes de las piedras de destino y de sus misiones con plazo (aparte de ajustes.js, que ya va lleno): cuándo
// sale una misión de piedra, cuántas piedras caben en la bolsa, qué hace cada una de las 15 piedras y qué pide cada misión. Solo datos:
// las reglas están en dominio/piedras.js (misiones y bolsa) y dominio/piedras-efectos.js (lo que hace la tirada de cada piedra).
'use strict';
// primera: la oleada en la que sale la primera misión de piedra; cada: cada cuántas oleadas sale otra (si no hay una en marcha y cabe
// otra piedra); bolsa: cuántas piedras se pueden guardar.
// tipos: todas son una tirada gratis con línea segura. sube = cuántos niveles de rareza sube a los héroes de su tirada (nunca por encima
// de las rarezas abiertas); rango = 1, 2 o 3 (lo que pide su misión y a cuál sube con la Brújula del destino); plazo = las oleadas que
// da su misión; peso = lo a menudo que toca (las 12 nuevas, más raras que las 3 de siempre); col = su color; txt = lo que trae además
// (con las cifras de `extra`). extra: oro, esencia y vidas = lo que da al usarla; nivel = el nivel con el que llega el héroe; elige =
// se elige la clase de la línea; marcas = improntas de una clase al azar; suerte = cuántas invocaciones siguientes traen línea segura;
// mercader = la próxima oferta de la tienda trae un épico; verdugo = % de vida de menos del próximo jefe; gemela = llega otro igual;
// comodin = la línea de la tirada es de comodines; rareza = la rareza mínima del héroe (aunque no esté abierta).
// misiones: txt corto (tiene que caber en la cinta a tamaño grande: unas 27 letras); stat = el contador de la partida que miran (cuenta
// desde que sale la misión); meta = cuánto piden según el rango de la piedra que dan; piedras = las piedras que puede dar.
ASALTO.piedras = {
  primera: 2, cada: 3, bolsa: 3,
  tipos: {
    menor:    { nombre: 'Piedra menor',       sube: 1, rango: 1, plazo: 2, peso: 60, col: '#c98a4a' },
    mayor:    { nombre: 'Piedra mayor',       sube: 2, rango: 2, plazo: 3, peso: 30, col: '#3f8ae8' },
    gran:     { nombre: 'Gran piedra',        sube: 3, rango: 3, plazo: 4, peso: 10, col: '#ffd23a' },
    oro:      { nombre: 'Piedra de oro',      sube: 1, rango: 1, plazo: 2, peso: 7, col: '#ff8c1a', extra: { oro: 10 }, txt: 'Además, {oro} de oro' },
    vida:     { nombre: 'Piedra de la vida',  sube: 1, rango: 1, plazo: 2, peso: 6, col: '#e23a4a', extra: { vidas: 1 }, txt: 'Además, recupera {vidas} vida' },
    esencia:  { nombre: 'Piedra de esencia',  sube: 1, rango: 1, plazo: 2, peso: 6, col: '#2ec4b6', extra: { esencia: 3 }, txt: 'Además, {esencia} de esencia' },
    veterana: { nombre: 'Piedra veterana',    sube: 1, rango: 1, plazo: 2, peso: 6, col: '#8c9a3a', extra: { nivel: 3 }, txt: 'El héroe llega a nivel {nivel}' },
    clase:    { nombre: 'Piedra de la clase', sube: 1, rango: 2, plazo: 3, peso: 5, col: '#2fae4a', extra: { elige: true }, txt: 'Eliges la clase del héroe que llega' },
    impronta: { nombre: 'Piedra de la impronta', sube: 1, rango: 2, plazo: 3, peso: 4, col: '#f06aa8', extra: { marcas: 2 }, txt: 'El héroe llega con {marcas} improntas de una clase al azar' },
    suerte:   { nombre: 'Piedra de la suerte', sube: 1, rango: 2, plazo: 3, peso: 4, col: '#a8f04a', extra: { suerte: 3 }, txt: 'Tus {suerte} invocaciones siguientes traen línea segura' },
    mercader: { nombre: 'Piedra del mercader', sube: 1, rango: 2, plazo: 3, peso: 4, col: '#7fd8ff', extra: { mercader: true }, txt: 'La próxima oferta de la tienda trae un objeto épico' },
    verdugo:  { nombre: 'Piedra del verdugo', sube: 1, rango: 2, plazo: 3, peso: 4, col: '#2a3150', extra: { verdugo: 15 }, txt: 'El próximo jefe empieza con un {verdugo} % menos de vida' },
    gemela:   { nombre: 'Piedra gemela',      sube: 1, rango: 3, plazo: 4, peso: 3, col: '#eef2ff', extra: { gemela: true }, txt: 'Llegan dos héroes iguales' },
    ascenso:  { nombre: 'Piedra del ascenso', sube: 1, rango: 3, plazo: 4, peso: 3, col: '#b0204a', extra: { nivel: 5 }, txt: 'El héroe llega a nivel {nivel}, listo para ascender' },
    comodin:  { nombre: 'Piedra del comodín', sube: 1, rango: 3, plazo: 4, peso: 2, col: '#6dffb3', extra: { comodin: true, rareza: 2 }, txt: 'Una línea de comodines: héroe épico seguro' },
  },
  misiones: {
    lineas: { txt: 'Haz {n} líneas en el Altar', stat: 'lineas', meta: { 1: 3, 2: 5, 3: 7 }, piedras: ['menor', 'mayor', 'gran', 'clase', 'suerte', 'comodin', 'gemela'] },
    bajas:  { txt: 'Derrota a {n} enemigos', stat: 'bajas', meta: { 1: 12, 2: 25, 3: 45 }, piedras: ['menor', 'mayor', 'gran', 'oro', 'verdugo', 'veterana', 'ascenso'] },
    limpia: { txt: '{n} oleadas sin perder vidas', stat: 'limpias', meta: { 1: 2, 2: 3, 3: 4 }, piedras: ['menor', 'mayor', 'gran', 'vida', 'esencia', 'mercader'] },
    une:    { txt: 'Une a {n} héroes', stat: 'absorbidos', meta: { 1: 2, 2: 3, 3: 5 }, piedras: ['menor', 'mayor', 'gran', 'veterana', 'impronta', 'gemela', 'ascenso'] },
    doble:  { txt: 'Consigue {n} ¡DOBLE! o más', stat: 'dobles', meta: { 1: 1, 2: 2, 3: 3 }, piedras: ['menor', 'mayor', 'gran', 'oro', 'suerte', 'clase', 'comodin', 'esencia'] },
  },
};
