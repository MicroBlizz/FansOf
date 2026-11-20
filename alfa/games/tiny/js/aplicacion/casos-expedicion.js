// Tiny Fans · aplicación · CASOS DE USO DE LA EXPEDICIÓN: salir, dar un paso, elegir mejora, gastar una pila y terminar (volver: el botín
// pasa al almacén del nido; caer: la mochila se queda en el suelo). No tienen reglas: piden al dominio, anuncian los eventos y guardan.
// Puertos: { reglas, sesion, reloj, eventos }. Dueño: N9 (expedición jugable).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.creaCasosExpedicion = ({ reglas, sesion, reloj, eventos }) => ({
  get enCurso() { return false; },
  // empieza una salida (escenario: solo en pruebas). Resultado: ok(foto) o el error del dominio
  sale(escenario) { return TN.error('sin-expedicion'); },
  // un paso de simulación; anuncia y devuelve sus eventos
  paso(entrada) { return []; },
  foto() { return null; },
  eligeMejora(id) { return TN.error('sin-expedicion'); },
  usaPila() { return TN.error('sin-expedicion'); },
});
