// Fans Of · MEDIDOR DE ANUNCIOS (casos de uso): lo que hace un juego con una acción con anuncio (ADR 123, docs/guia/core/anuncios.md).
// Encima de ANUNCIOS.ver, que no cambia: enseñar la oferta con su multiplicador, ver el anuncio (o darlo al momento con «sin anuncios»),
// sumar o restar en el medidor, guardarlo y devolver el multiplicador que el juego aplica al premio. Las reglas son las del dominio
// (medidor-anuncios.js); aquí no hay DOM y todo lo de fuera entra por puertos:
//   config            la configuración del juego (la forma, en medidor-anuncios.js)
//   anuncios          como ANUNCIOS: ver(sitio) -> promesa de { visto }
//   guardado          { lee() -> lo guardado o null, escribe(estado) }: en la partida del juego
//   hoy()             -> { dia, semana } (MEDIDOR_ANUNCIOS.fechas(new Date()) vale)
//   sinAnuncios()     -> ¿tiene comprado «sin anuncios»? (opcional)
//   alCambiar(barra)  avisa tras cada cambio, para repintar (opcional)
// crea() devuelve un resultado: { ok: true, valor: el medidor } o { ok: false, error } si la configuración no es válida.
'use strict';
// el día y el lunes de su semana, en la hora del aparato, como 'AAAA-MM-DD'
MEDIDOR_ANUNCIOS.fechas = fecha => {
  const texto = f => [f.getFullYear(), String(f.getMonth() + 1).padStart(2, '0'), String(f.getDate()).padStart(2, '0')].join('-');
  const lunes = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() - (fecha.getDay() + 6) % 7);
  return { dia: texto(fecha), semana: texto(lunes) };
};
MEDIDOR_ANUNCIOS.crea = ({ config, anuncios, guardado, hoy, sinAnuncios = () => false, alCambiar = () => {} }) => {
  const D = MEDIDOR_ANUNCIOS.dominio, ok = valor => ({ ok: true, valor }), error = e => ({ ok: false, error: e });
  const cfg = D.configura(config);
  if (!cfg.ok) return cfg;
  const C = cfg.valor;
  let viendo = false;
  // el estado se rehace siempre desde lo guardado: así el cambio de día y una partida cargada de la nube se ven sin avisar
  const estado = () => D.abre(C, guardado.lee(), hoy());
  const barra = () => D.barra(C, estado(), sinAnuncios());
  const guarda = e => { guardado.escribe(e); alCambiar(barra()); };

  // la oferta de ahora de una acción: { mult, quedan, sinAnuncios }. Errores: accion, tope_accion, tope_dia
  function oferta(id) {
    const e = estado(), p = D.puede(C, e, id);
    if (!p.ok) return p;
    return ok({ mult: D.multiplicador(C, e, id, sinAnuncios()).valor, quedan: p.valor, sinAnuncios: !!sinAnuncios() });
  }
  // el jugador elige el anuncio: se ve (con «sin anuncios», se da al momento) y devuelve { mult }, el multiplicador que se le enseñó.
  // Errores: los de oferta(), ocupado (ya hay un anuncio en marcha) y no_visto (lo cerró o falló: ni suma ni resta ni gasta el tope)
  async function ver(id) {
    if (viendo) return error('ocupado');
    const o = oferta(id);
    if (!o.ok) return o;
    if (!o.valor.sinAnuncios && !(await mira(id))) return error('no_visto');
    const r = D.visto(C, estado(), id, o.valor.sinAnuncios);
    if (!r.ok) return r;   // el tope se gastó por otro lado mientras se veía
    guarda(r.valor);
    return ok({ mult: o.valor.mult });
  }
  async function mira(id) {
    viendo = true;
    try { const r = await anuncios.ver(id); return !!(r && r.visto); } finally { viendo = false; }
  }
  // el jugador recoge sin anuncio el premio de una acción que también se ofrecía con anuncio.
  // Errores: accion, no_resta y sin_oferta (los del dominio): en esos casos no cambia nada
  function deja(id) {
    const r = D.dejada(C, estado(), id, sinAnuncios());
    if (r.ok) guarda(r.valor);
    return r.ok ? ok(barra()) : r;
  }
  return ok({ oferta, ver, deja, barra, config: C });
};
