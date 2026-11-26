// Fans of Pop · LO QUE SE APRENDE DE LA BURBUJA ARCOÍRIS (aplicación; tarea #329, ADR 205). Cada vez que sale la burbuja de un compañero
// escondido se manda, anónima, la ficha del encuentro: quién era (compañero y rareza), si era nuevo, repetido o ya al máximo, de día o
// de noche y en qué mundo, y cómo acabó, con los duelos jugados y perdidos. Sirve para ajustar la rareza y lo difícil del duelo con datos
// de verdad. La manda core/js/sistema/telemetria.js a servidor/193-pop-escondidos-datos.sql: sin nombre ni cuenta (cada encuentro es un
// UUID al azar), solo con sesión iniciada, con el flag «companeros» abierto (se mide siempre que hay compañeros) y si el jugador no ha apagado «Datos de partida
// anónimos». Las burbujas forzadas desde el panel DEV no mandan nada.
// Desenlaces: escapada (la primera acción fue otra), regalo (ya al máximo: monedas), ahora-no, red, ganada, dejada (perdió, o salió del
// duelo, y se fue), sin-tocar (salió del nivel sin tocar nada y, al volver, la burbuja ya era otra o no estaba) y duelo (aún peleando:
// si se queda así, se cerró el juego en medio del duelo).
'use strict';
// el mismo flag y la misma descripción que ppCompanerosActivo (js/coleccion-juego.js): TELEMETRIA lo pregunta con NUCLEO.flag
TELEMETRIA.configurar({ rpc: 'enviar_pop_escondidos', flag: 'companeros', descripcion: 'Pop: álbum de compañeros y un equipo por modo (tarea #142, ADR 157)' });
const PP_ESC_DATOS = (() => {
  // los desenlaces que ya no cambian: con ellos se da la ficha por acabada
  const FINALES = Object.freeze(['escapada', 'regalo', 'ahora-no', 'red', 'ganada', 'dejada', 'sin-tocar']);
  // cómo sigue o acaba el encuentro (sin ficha, como en las partidas guardadas de antes de esto o en las burbujas del panel DEV, nada)
  function estado(dato, que) {
    if (!dato || !dato.id) return;
    TELEMETRIA.estado(dato.id, { estado: que, intentos: dato.intentos, perdidos: dato.perdidos }, FINALES.includes(que));
  }
  return Object.freeze({
    FINALES,
    // la ficha de un encuentro: { id, comp, mundo, momento, intentos, perdidos }, que se guarda con la tirada. Se manda «vista» con lo
    // que se sabe de entrada
    nueva(comp, lleno, d, momento) {
      const dato = { id: TELEMETRIA.nueva(), comp: comp.id, mundo: d.mundo, momento, intentos: 0, perdidos: 0 };
      TELEMETRIA.estado(dato.id, { estado: 'vista', version: typeof VERSION !== 'undefined' ? String(VERSION) : '', alfa: !!NUCLEO.alfa,
        comp: comp.id, rar: PP_COMP.INFO[comp.id].rar, tipo: comp.nuevo ? 'nuevo' : (lleno ? 'lleno' : 'repetido'),
        momento, mundo: d.mundo, intentos: 0, perdidos: 0 });
      return dato;
    },
    // ¿es la ficha de este mismo encuentro? (la tirada puede volver en otro nivel, de otro mundo o de noche, con otro compañero)
    esDe: (dato, comp, d, momento) => !!dato && dato.comp === comp.id && dato.mundo === d.mundo && dato.momento === momento,
    estado,
    // un duelo más (al entrar en él) o uno perdido (al perderlo o al salir de él, que cuesta lo mismo)
    jugado(dato) { if (dato) dato.intentos++; estado(dato, 'duelo'); },
    perdido(dato, que = 'duelo') { if (dato) dato.perdidos++; estado(dato, que); },
  });
})();
