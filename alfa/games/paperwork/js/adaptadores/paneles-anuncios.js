// Fans Of Paperwork · adaptador · PANELES DEL MEDIDOR DE ANUNCIOS (ADR 123): el botón que sale unos segundos tras abrir un correo del CEO
// (ver un anuncio y multiplicar su oro) y la sección «Nivel de anuncios» de la pestaña Méritos, con la barra de core y la oferta
// «Sin anuncios». Mismo contrato que paneles.js: solo HTML con data-acc. La barra y la oferta las pinta core (MEDIDOR_ANUNCIOS).
'use strict';
PW.panelesAnuncios = (() => {
  const ACCION = 'correo';
  // o: lo que devuelve PW.anuncioCorreo.oferta() (o null). La raya de abajo se vacía sola en lo que dura la oferta
  function oferta(o) {
    if (!o) return '';
    return `<button class="pw-anuncio ol" data-acc="anuncio-correo" data-arg="" data-n="${o.n}" style="--dura:${o.dura}s">`
      + `<b>${tr('VER ANUNCIO')} ×${o.mult}</b><small>${tr('+{n} de oro', { n: PW.txt.num(o.oro) })}</small><i></i></button>`;
  }
  // lo que da ahora el anuncio del correo y cuántos quedan hoy
  function hoy(medidor) {
    const o = medidor.oferta(ACCION);
    if (!o.ok) return tr('Hoy ya no quedan anuncios en los correos del CEO: vuelven mañana.');
    return tr('Correo del CEO: ×{m} con anuncio. Quedan {q} hoy.', { m: o.valor.mult, q: o.valor.quedan });
  }
  // la sección de la pestaña Méritos (nada mientras no esté abierto)
  function seccion(e, medidor, tienda) {
    if (!PW.desbloqueos.tiene(e, 'anuncios')) return '';
    return `<h4 class="pw-sub">${tr('Nivel de anuncios')}</h4>`
      + `<div class="pw-medidor">${MEDIDOR_ANUNCIOS.pantalla.html(medidor.config, medidor.barra())}<p class="pw-nota">${hoy(medidor)}</p>`
      + `${tienda.html('data-acc="sin-anuncios" data-arg=""')}</div>`;
  }
  return { oferta, seccion };
})();
