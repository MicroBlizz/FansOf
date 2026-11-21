// Fans of Asalto · ADAPTADORES · La ventana de la oleada perdida (HTML sobre el lienzo): sale al perder una oleada normal si aún se
// puede ver el anuncio de reintentarla sin perder la vida (dominio/anuncios.js). Con el anuncio entero, la vida vuelve; cerrándolo o
// con SEGUIR, la vida se queda perdida. En las dos se vuelve a preparar la misma oleada. No decide reglas.
'use strict';
AS.ventanas.perdida = (() => {
  const V = AS.ventanas, btn = V.btn;
  function abre(E) {
    if (!AS.pantalla.activa || V.abierta() || !E.casos.puedeAnuncio('vida')) return;
    const veces = ASALTO.anuncios.vida.veces;
    V.abre(`<h2>${tr('OLEADA PERDIDA')}</h2><p class="as-botin">${V.ico('corazon')} ${tr('-1 vida')}</p>
      <p class="as-nota">${tr('Mira un anuncio y recupera la vida antes de repetir la oleada.')} ${veces === 1 ? tr('Solo una vez por partida.') : tr('{n} veces por partida.', { n: veces })}</p>`
      + btn('as-anu-vida', tr('RECUPERAR LA VIDA · ANUNCIO'), 'as-verde') + btn('as-seguir', tr('SEGUIR'), 'as-azul'));
    V.alPulsar('as-seguir', V.cierra);
    V.alPulsar('as-anu-vida', () => V.anuncio('vida', () => {
      V.cierra();
      if (E.casos.anuncio('vida').ok) { V.premio(tr('+1 vida')); E.vidasRojo = 0; AS.pantalla.cartel(tr('¡VIDA RECUPERADA!'), '', AS.tema.C.verde, 1.2); }
    }));
  }
  return abre;
})();
