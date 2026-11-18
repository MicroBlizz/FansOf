// Fans of Spy · APLICACIÓN · La guía del tutorial del parking: el mazo preparado (siempre sale la carta que toca) y el guion de
// Lola. Cada paso dice lo que cuenta Lola por radio y lo ÚNICO que se puede hacer en ese paso: seguir, jugar una carta concreta
// (a veces en una casilla concreta), gastar una carta para andar o acabar el turno. El último paso es libre: el jugador acaba la
// planta por su cuenta y, si lo ven, la partida rebobina al principio de ese paso. La guía no toca la partida: solo dice sí o no.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const MAZO = ['puntillas', 'golpe', 'caja', 'carrera', 'agenda', 'puntillas', 'puntillas', 'cafe', 'puntillas', 'carrera',
    'puntillas', 'golpe', 'caja', 'puntillas', 'agenda', 'puntillas', 'cafe', 'puntillas', 'carrera', 'puntillas'];

  const PASOS = [
    { id: 'gafas', pide: { que: 'seguir' },
      lola: 'Soy Lola. Ponte estas gafas: con ellas ves lo que mira cada guardia. Lo azul es lo que vigila el de la garita.' },
    { id: 'puntillas', pide: { que: 'carta', cartas: ['puntillas'], en: { x: 5, y: 8 } },
      lola: 'Los coches tapan la vista. Toca «Paso de puntillas» y ponte detrás de ese coche.' },
    { id: 'golpe', pide: { que: 'carta', cartas: ['golpe'] },
      lola: 'El vigilante no quita ojo del hueco de la barrera. Juega «Golpe en la pared» para que venga a mirar aquí.' },
    { id: 'acaba-1', pide: { que: 'acabar' },
      lola: 'Está en amarillo: sospecha. Ya has jugado 2 cartas, el tope del turno. Pulsa «Acabar turno» y mira cómo se mueven ellos.' },
    { id: 'andar', pide: { que: 'andar', cartas: ['carrera', 'agenda'], en: { x: 2, y: 8 } },
      lola: 'Ha salido de la garita. Cualquier carta vale también para andar 3 casillas: toca la «Agenda» o la «Carrera», elige «Andar» y ve hasta la marca.' },
    { id: 'hueco', pide: { que: 'carta', cartas: ['puntillas'], en: { x: 1, y: 6 } },
      lola: 'Ahora, de puntillas, cruza por el hueco de la barrera.' },
    { id: 'acaba-2', pide: { que: 'acabar' },
      lola: 'Dentro. Acaba el turno.' },
    { id: 'pasillo', pide: { que: 'carta', cartas: ['puntillas'], en: { x: 2, y: 4 } },
      lola: 'Arriba patrulla un Becario en patinete. Sube de puntillas hasta ese hueco entre los coches.' },
    { id: 'caja', pide: { que: 'carta', cartas: ['caja'] },
      lola: 'Viene hacia aquí. Juega «Caja de mudanza»: dentro y quieto, no te ve.' },
    { id: 'acaba-3', pide: { que: 'acabar' },
      lola: 'Quieto ahí. Acaba el turno y deja que pase.' },
    { id: 'libre', pide: { que: 'libre' },
      lola: 'Ha pasado de largo. Ahora tú: sal por detrás de él, espera a que la cámara mire a otro lado y llega a la puerta verde. Si te ven, rebobino.' },
  ];
  const REBOBINA = 'Te han visto. No pasa nada: rebobino. Mira bien los conos antes de moverte.';
  const FINAL = 'Planta superada. Sabía que podía contar contigo. Arriba nos esperan las oficinas.';
  const igual = (a, b) => !!a && !!b && a.x === b.x && a.y === b.y;

  // Una guía nueva: { i } = el paso por el que va.
  const nueva = () => ({ i: 0 });
  const paso = (g) => PASOS[g.i] || null;

  // ¿Deja la guía hacer esta acción? accion = { que: 'seguir' | 'carta' | 'andar' | 'acabar', carta, objetivo }. null = sí.
  function permite(g, accion) {
    const p = paso(g);
    if (!p || p.pide.que === 'libre') return accion.que === 'seguir' ? 'no-toca' : null;
    if (p.pide.que !== accion.que) return 'no-toca';
    if (p.pide.cartas && !p.pide.cartas.includes(accion.carta)) return 'otra-carta';
    if (p.pide.en && !igual(p.pide.en, accion.objetivo)) return 'otra-casilla';
    return null;
  }
  // Lo que la pantalla tiene que señalar en este paso: qué cartas valen, para qué (efecto o andar), la casilla y si toca acabar.
  function senala(g) {
    const p = paso(g);
    if (!p || p.pide.que === 'libre') return null;
    return { que: p.pide.que, cartas: p.pide.cartas || null, en: p.pide.en || null };
  }
  // Tras una acción permitida: pasa al siguiente paso (el paso libre no avanza: dura hasta el final de la planta).
  function avanza(g) {
    const p = paso(g);
    if (p && p.pide.que !== 'libre') g.i++;
    return g;
  }

  S.guia = Object.freeze({ MAZO: Object.freeze(MAZO), PASOS: S.congela(PASOS), REBOBINA, FINAL, nueva, paso, permite, senala, avanza, libre: (g) => !!paso(g) && paso(g).pide.que === 'libre' });
})(SPY);
