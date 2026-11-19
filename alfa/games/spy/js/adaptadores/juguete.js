// Fans of Spy · ADAPTADORES · La animación de «figura de juguete» (Daniel, 19-11-2026): los modelos de Yoshi son de una sola pieza,
// sin brazos ni piernas sueltos, así que se mueven como un muñeco de vinilo que alguien lleva por el tablero: al andar dan saltitos
// y se balancean de lado a lado, se aplastan un poco al tocar el suelo y se estiran en el aire, de puntillas van agachados y
// aplastados, al correr se inclinan hacia delante, y quietos respiran. Para los Becarios (siempre en su patinete) es un vaivén más
// suave. Solo cuentas: devuelve { bote, balanceo, inclina, ancho, alto } y escena.js lo convierte en la matriz del personaje.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  // Cómo se mueve el agente en cada modo: altura del saltito, balanceo (radianes), inclinación hacia delante, cuánto se aplasta
  // al tocar el suelo y lo agachado que va (1 = de pie).
  const AGENTE = {
    anda: { salto: 0.09, balanceo: 0.12, inclina: 0, aplasta: 0.07, agachado: 1 },
    corre: { salto: 0.12, balanceo: 0.08, inclina: -0.22, aplasta: 0.09, agachado: 1 },
    puntillas: { salto: 0.03, balanceo: 0.06, inclina: 0, aplasta: 0.03, agachado: 0.86 },
  };
  const QUIETO = { bote: 0, balanceo: 0, inclina: 0 };

  // Ancho a partir del alto, para que el muñeco no gane ni pierda volumen al aplastarse.
  const conVolumen = (r, alto) => Object.freeze({ ...r, alto, ancho: 1 / Math.sqrt(alto) });

  // Quieto: respira (sube y baja un pelo) y se mece muy despacio. `t` es el reloj de la vista en segundos.
  function respira(t) {
    return conVolumen({ ...QUIETO, balanceo: Math.sin(t * 1.2) * 0.02 }, 1 + Math.sin(t * 2.4) * 0.012);
  }

  // El agente. `modo` = quieto | anda | corre | puntillas; `fase` avanza al andar (medio paso cada π).
  function agente(modo, fase, t) {
    const m = AGENTE[modo];
    if (!m) return respira(t);
    const arriba = Math.abs(Math.sin(fase));
    // En el suelo (arriba = 0) se aplasta; en lo alto del saltito se estira.
    const alto = m.agachado * (1 - m.aplasta * Math.cos(fase * 2));
    return conVolumen({ bote: arriba * m.salto, balanceo: Math.sin(fase) * m.balanceo, inclina: m.inclina }, alto);
  }

  // Un Becario en su patinete: si avanza, se inclina un poco hacia delante y vibra; si no, respira.
  function guardia(anda, fase, t) {
    if (!anda) return respira(t + 1.7);
    return conVolumen({ bote: Math.abs(Math.sin(fase * 2)) * 0.012, balanceo: Math.sin(fase) * 0.04, inclina: -0.08 }, 1);
  }

  S.juguete = Object.freeze({ agente, guardia });
})(SPY);
