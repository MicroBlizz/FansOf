// Fans of Rally · dominio · COPILOTO: canta la próxima curva, como el copiloto de los rallies de recreativa («¡Fácil derecha!»).
// Mira cuánto gira la carretera en el trozo que viene y lo clasifica en fácil, media, fuerte u horquilla, con su lado. Solo avisa
// cuando la curva cambia; las rectas no se cantan. Pura: devuelve la clave del aviso (los textos están en datos/textos.js).
'use strict';
RA.Copiloto = (() => {
  // el giro total (en radianes, con su signo) de las `muestras` siguientes a partir de `desde`
  function giroDelTrozo(pista, desde, muestras) {
    let g = 0;
    for (let k = 0; k < muestras; k++) g += pista.curv[(desde + k) % pista.n] * pista.paso;
    return g;
  }
  const GRADOS = [[2.3, 'horquilla'], [1.35, 'fuerte'], [0.8, 'media'], [0.42, 'facil']];
  function clasifica(giro) {
    const a = Math.abs(giro);
    for (const [minimo, nombre] of GRADOS) if (a >= minimo) return { tipo: nombre, lado: giro > 0 ? 'derecha' : 'izquierda' };
    return null;
  }
  // lo que cantaría mirando desde la muestra i (avisa con unos 160 px de antelación y mira unos 260 px de curva)
  function aviso(pista, i) {
    const antes = Math.round(160 / pista.paso), largo = Math.round(260 / pista.paso);
    const c = clasifica(giroDelTrozo(pista, (i + antes) % pista.n, largo));
    return c ? `${c.tipo}-${c.lado}` : null;
  }
  return { aviso, clasifica, giroDelTrozo };
})();
