// Tiny Fans · dominio · EXPEDICIÓN: la raíz de una salida. paso(entrada) avanza un paso fijo (1 / reglas.simulacion.pasosPorSegundo
// segundos) y devuelve la lista de eventos de ese paso; foto() da el estado de solo lectura que leen los adaptadores. No sabe de pantalla,
// reloj ni azar propio. Dueño: N3 (dominio de la expedición).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.Expedicion = class Expedicion {
  // datos: { semilla, escenario, mochilaCaida: { x, z, huecos } | null }. Resultado: ok(expedicion) o error('escenario-invalido')
  static nueva(reglas, datos) { return TN.ok(new Expedicion()); }
  // entrada: { mx, mz }, el movimiento en ejes del mundo (largo de 0 a 1). Devuelve los eventos del paso (TN.EVENTOS)
  paso(entrada) { return []; }
  // el estado, de solo lectura (su forma: la ficha, «La foto de la expedición»)
  foto() { return { t: 0, paso: 0, fase: 'terminada', fin: null }; }
  // elegir una de las mejoras ofrecidas. Resultado: ok(eventos) o error('no-toca' | 'mejora-desconocida')
  eligeMejora(id) { return TN.error('no-toca'); }
  // gastar una pila de la mochila. Resultado: ok(eventos) o error('sin-pilas' | 'bateria-llena' | 'expedicion-terminada')
  usaPila() { return TN.error('sin-pilas'); }
};
