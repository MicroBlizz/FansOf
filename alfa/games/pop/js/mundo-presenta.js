// Fans of Pop · LA PRESENTACIÓN DE UN MUNDO NUEVO (dominio puro; tarea #272, boceto A de Pepins, 20-11-2026: «He pasado de mundo, falta
// una introducción o explicación de por dónde vamos»): qué mundos ya se han presentado, si toca presentar uno y la fila de bolitas
// de mundos («vas por el 3 de 10»). Sin DOM, sin SAVE y sin reloj: lo pinta js/mundo-presenta-juego.js.
'use strict';
const PP_PRESENTA = Object.freeze((() => {
  const entero = n => Number.isInteger(n) && n >= 0;
  // los mundos ya presentados. Una partida de antes de la tarea (sin lista, `null`) da por vistos los que ya ha dejado atrás: solo se le
  // presenta el mundo en el que está. El mundo 1 nunca se presenta (lo abren los primeros pasos de Lola).
  const vistos = (guardados, actual) => Object.freeze(Array.isArray(guardados) ? guardados.filter(entero)
    : Array.from({ length: entero(actual) ? actual : 0 }, (_, k) => k));
  // ¿toca presentar el mundo m al llegar al camino? Solo si ya está abierto (m <= actual), no es el primero y no se ha presentado
  const toca = (m, actual, lista) => entero(m) && entero(actual) && m > 0 && m <= actual && !lista.includes(m);
  // la lista después de presentar m (sin repetir)
  const marca = (lista, m) => Object.freeze(lista.includes(m) ? [...lista] : [...lista, m]);
  // la fila de bolitas: 'hecho' los mundos de antes (salvo un jefe pendiente, tarea #95), 'aqui' el que se presenta y 'falta' el resto
  const tira = (m, total, pendientes = []) => Object.freeze(Array.from({ length: total },
    (_, k) => (k === m ? 'aqui' : k < m && !pendientes.includes(k) ? 'hecho' : 'falta')));
  return { vistos, toca, marca, tira };
})());
if (typeof module !== 'undefined') module.exports = PP_PRESENTA;
