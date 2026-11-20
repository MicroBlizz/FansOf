// Fans Of · /gestion · TABLERO · dominio · QUÉ MIRAR (tarea #235, ADR 182): los pasos de «Qué mirar» de una tarea y cuáles ha marcado ya quien la revisa.
// Las marcas se guardan en el servidor por persona (SQL 177) y un paso se reconoce por su texto: si Claude reescribe la lista, lo que no cambió sigue
// marcado y lo nuevo sale vacío. Funciones puras, sin pantalla ni red.
'use strict';
// Los pasos de un texto de «Qué mirar»: uno por línea, sin la viñeta o el número del principio ni las líneas vacías
TABLERO.pasosQueMirar = texto => Object.freeze(String(texto || '').split('\n')
  .map(l => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean));
TABLERO.TOPE_PASO = 1500;   // el mismo tope que el servidor (SQL 177) y que el campo que_mirar (SQL 169)
TABLERO.esPaso = paso => typeof paso === 'string' && paso.length >= 1 && paso.length <= TABLERO.TOPE_PASO;
// Las tareas (json) con los pasos que quien mira ya ha marcado (`mirados`, lista de textos), a partir de la lista del servidor ({ tarea, paso, cuando })
TABLERO.conMirados = (tareas, lista) => {
  const de = new Map();
  (Array.isArray(lista) ? lista : []).forEach(m => { if (m && Number.isInteger(m.tarea) && TABLERO.esPaso(m.paso)) de.set(m.tarea, [...(de.get(m.tarea) || []), m.paso]); });
  return tareas.map(t => ({ ...t, mirados: Object.freeze(de.get(t.id) || []) }));
};
// La tarea con ese paso marcado o desmarcado (sin repetirlo); el resto, igual
TABLERO.conPasoMirado = (t, paso, mirado) => {
  const sin = (t.mirados || []).filter(p => p !== paso);
  return { ...t, mirados: Object.freeze(mirado ? [...sin, paso] : sin) };
};
// Los pasos de la tarea en orden, cada uno con si ya está mirado: [{ texto, mirado }]. Las marcas de pasos que ya no están en la lista no cuentan
TABLERO.pasosConMarca = t => Object.freeze(TABLERO.pasosQueMirar(t.que_mirar)
  .map(texto => Object.freeze({ texto, mirado: (t.mirados || []).includes(texto) })));
// Cuántos pasos tiene y cuántos lleva mirados: { total, mirados }
TABLERO.cuentaMirados = t => {
  const pasos = TABLERO.pasosConMarca(t);
  return Object.freeze({ total: pasos.length, mirados: pasos.filter(p => p.mirado).length });
};
