// Fans of Pinball · adaptador · GUÍA (el primer minuto, PROTOTIPO.md): Lola habla SOLO antes de que se mueva la bola, con un globo y una
// frase de 8 palabras como mucho; mientras, dos manos laten a cada lado. El primer toque (en cualquier mitad) quita el globo, suelta la
// bola y ese mismo toque ya sube la pala: ninguno se pierde. Durante el juego no hay texto de ayuda: flechas y luces.
'use strict';
PB.creaGuia = capa => {
  const frase = PB.crea('p');
  const globo = PB.crea('div', { className: 'pb-globo', hidden: true }, PB.crea('b', { textContent: 'LOLA' }), frase);
  const mano = lado => PB.crea('div', { className: 'pb-mano pb-mano-' + lado, hidden: true }, PB.imagen(AJUSTES.arte.imagenes[lado === 'izq' ? 'palaIzquierda' : 'palaDerecha'], 2));
  const manos = [mano('izq'), mano('der')];
  capa.append(globo, ...manos);
  return {
    // frase ya en español (se traduce aquí); '' = solo las manos
    muestra(texto) {
      frase.textContent = texto ? tr(texto) : '';
      globo.hidden = !texto;
      for (const m of manos) m.hidden = false;
    },
    oculta() { globo.hidden = true; for (const m of manos) m.hidden = true; },
    get visible() { return !manos[0].hidden; },
    quita() { globo.remove(); for (const m of manos) m.remove(); },
  };
};
