// Tiny Fans · dominio · ASALTO: la raíz de un asalto al nido abandonado (2 minutos, sin mejoras, la batería solo baja con los golpes;
// romper paredes y puertas, llegar al almacén, coger lo que quepa y salir). Misma forma que la expedición: paso(entrada) devuelve eventos
// y foto() el estado de solo lectura. Sin trucos escondidos. Puro. Dueño: N11 (dominio del asalto).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.Asalto = class Asalto {
  // datos: { semilla }. Resultado: ok(asalto) o error('asalto-invalido')
  static nuevo(reglas, datos) { return TN.ok(new Asalto()); }
  paso(entrada) { return []; }
  foto() { return { t: 0, paso: 0, fase: 'terminada', fin: null }; }
};
