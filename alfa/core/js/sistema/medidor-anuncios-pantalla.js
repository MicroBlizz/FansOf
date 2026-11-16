// Fans Of · MEDIDOR DE ANUNCIOS (pantalla): la barra con sus niveles, para que el jugador vea cuánto le falta y por qué sube o baja
// (ADR 123, docs/guia/core/anuncios.md). Solo pinta: recibe la configuración validada y lo que devuelve barra() del medidor.
// El juego la coloca donde quiera y carga su hoja (core/css/medidor-anuncios.css); los colores se cambian con variables CSS.
// Uso: raiz.innerHTML = MEDIDOR_ANUNCIOS.pantalla.html(medidor.config, medidor.barra()).
'use strict';
MEDIDOR_ANUNCIOS.pantalla = (() => {
  const texto = (t, d) => (typeof tr === 'function' ? tr(t, d) : t);
  const pct = (puntos, tope) => Math.round(Math.min(1, Math.max(0, puntos / tope)) * 1000) / 10 + '%';
  // una raya en la barra por cada nivel que se alcanza (el primero empieza en 0 y no lleva raya)
  const rayas = cfg => cfg.umbrales.slice(1).map(u => `<s style="left:${pct(u, cfg.tope)}"></s>`).join('');
  const frase = b => (b.fija
    ? texto('Sin anuncios: siempre en el nivel máximo.')
    : texto('Cada anuncio que ves sube la barra. Si recoges un premio sin verlo, baja un poco.'));
  function html(cfg, b) {
    return `<div class="med-an${b.fija ? ' fija' : ''}" data-nivel="${b.nivel}">`
      + `<div class="med-an-cab"><span>${texto('NIVEL DE ANUNCIOS')}</span><b>${texto('Nivel {n} de {m}', { n: b.nivel, m: b.niveles })}</b></div>`
      + `<div class="med-an-barra" role="progressbar" aria-valuemin="0" aria-valuemax="${b.tope}" aria-valuenow="${b.puntos}"><i style="width:${pct(b.puntos, b.tope)}"></i>${rayas(cfg)}</div>`
      + `<small>${frase(b)}</small></div>`;
  }
  return { html };
})();
