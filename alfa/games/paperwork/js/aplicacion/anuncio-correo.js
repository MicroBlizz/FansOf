// Fans Of Paperwork · aplicación · EL ANUNCIO DEL CORREO: tras abrir un correo del CEO que da oro, durante unos segundos se ofrece ver un
// anuncio que lo multiplica (ADR 123; las reglas del medidor de anuncios son de core: MEDIDOR_ANUNCIOS). El correo ya pagó su oro al
// abrirlo; el anuncio paga la diferencia. No tocar el botón cuenta como recoger sin anuncio y baja un poco la barra; verlo la sube.
// Con «Sin anuncios» comprado no hay botón: el premio llega solo, con el mismo tope de cada día.
// El oro es el de este recorrido: si entre el correo y el final del anuncio hay un Despido (o se borra la partida), no se paga en el nuevo.
// Puertos: medidor (lo que devuelve MEDIDOR_ANUNCIOS.crea), casos { premioAnuncio(oro, mult), partida }, abierto() -> ¿está ya desbloqueado?,
// dura (segundos que se ofrece) y alPagar(resultado) para contar lo que ha llegado sin pulsar nada.
'use strict';
PW.creaAnuncioCorreo = ({ medidor, casos, abierto, dura, alPagar = () => {} }) => {
  const ACCION = 'correo';
  let pendiente = null, viendo = false, serie = 0;   // pendiente: { oro, mult, falta, n }; n distingue una oferta de la siguiente

  // la oferta se va sin tocarla: es recoger sin anuncio
  function pasa() {
    if (!pendiente) return;
    pendiente = null;
    medidor.deja(ACCION);
  }
  // ha llegado un correo con `oro`. Devuelve la oferta que queda en pantalla, o null si no hay (cerrado, tope del día gastado, sin oro,
  // un anuncio en marcha o «Sin anuncios», que paga solo)
  function llega(oro) {
    if (viendo || !abierto() || !(oro > 0)) return null;
    pasa();   // la oferta del correo anterior, si seguía ahí
    const o = medidor.oferta(ACCION);
    if (!o.ok) return null;
    pendiente = { oro, mult: o.valor.mult, falta: dura, n: ++serie, recorrido: casos.partida.r };
    if (!o.valor.sinAnuncios) return oferta();
    acepta().then(alPagar);
    return null;
  }
  // pasan dt segundos: la oferta caduca sola (mientras se ve el anuncio, no)
  function avanza(dt) {
    if (!pendiente || viendo) return;
    pendiente.falta -= dt;
    if (pendiente.falta <= 0) pasa();
  }
  // el jugador pulsa el botón: ve el anuncio y cobra la diferencia. Resultado: PW.ok({ oro, mult }) con lo que suma; errores: 'sin-oferta',
  // 'no_visto' (lo cerró: ni cobra ni baja la barra), 'otro-recorrido' (hubo un Despido por medio) y los del medidor
  async function acepta() {
    if (!pendiente || viendo) return PW.error('sin-oferta');
    const p = pendiente;
    viendo = true;
    let r;
    try { r = await medidor.ver(ACCION); } finally { viendo = false; pendiente = null; }
    if (!r.ok) return PW.error(r.error);
    return casos.partida.r === p.recorrido ? casos.premioAnuncio(p.oro, r.valor.mult) : PW.error('otro-recorrido');
  }
  // lo que pinta el botón: { n, mult, oro (lo que sumaría), falta, dura } o null
  const oferta = () => (pendiente && !viendo ? { n: pendiente.n, mult: pendiente.mult, oro: Math.floor(pendiente.oro * (pendiente.mult - 1)), falta: pendiente.falta, dura } : null);
  return { llega, avanza, acepta, oferta };
};
