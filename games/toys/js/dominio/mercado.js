// Fans of Toys · dominio · MERCADO: las cuentas de un mes. `plan` dice, sin azar, cuánto se fabricará, a qué precio y cuánto costará
// (lo que la pantalla enseña antes de producir); `demanda` dice cuántas unidades quiere la gente, con la lista de factores que la mueven
// para poder explicarla. Puro: las reglas (`ctx.reglas`) y la ficha del mes (TY.Reglas.delMes) llegan de fuera.
'use strict';
TY.Mercado = (() => {
  const trimestre = (partida, reglas) => Math.floor(partida.mes / reglas.partida.mesesPorTrimestre);
  const esLujo = (juguete, reglas) => juguete.molde >= reglas.lujo.molde;
  const esCaro = (juguete, reglas) => juguete.precio >= reglas.lujo.precio;

  // cuántas unidades tiene un lote: múltiplos de 5, y al menos 5 si se fabrica algo
  const lote = (juguete, cantidad, reglas) => {
    const factor = reglas.cantidades[cantidad].lote;
    return factor ? Math.max(5, Math.round(juguete.demanda * factor / 5) * 5) : 0;
  };

  // `bonus` (opcional) es lo que sacó el jugador en el minijuego: sube el precio o regala unidades (TY.Minijuegos.efecto)
  const plan = (partida, eleccion, ficha, ctx, bonus) => {
    const { reglas } = ctx, juguete = ctx.juguetes.find(j => j.id === eleccion.juguete), premio = TY.Minijuegos.efecto(bonus, reglas);
    const unidades = lote(juguete, eleccion.cantidad, reglas), extra = Math.round(unidades * premio.unidades);
    const costeUnidad = juguete.coste * ficha.costeUnidad;
    const produccion = Math.round(unidades * costeUnidad);
    const molde = partida.moldes.includes(juguete.id) || !unidades ? 0 : Math.round(juguete.molde * ficha.moldeCoste);
    const publicidad = Math.round(reglas.publicidad[eleccion.publicidad].coste * (trimestre(partida, reglas) + 1) * ficha.publicidadCoste);
    const precio = Math.max(1, Math.round(juguete.precio * reglas.precios[eleccion.precio].precio * (esLujo(juguete, reglas) ? ficha.precioLujo : 1) * premio.precio));
    const total = produccion + molde + publicidad;
    return { juguete, unidades, extra, produccion, molde, publicidad, precio, total, disponibles: unidades + extra + (partida.stock[juguete.id] || 0),
      puede: total <= Math.max(0, partida.dinero) || total === 0 };
  };

  // cada factor que mueve la demanda, con su nombre: la pantalla enseña los que no valen 1
  const factores = (partida, juguete, eleccion, ficha, ctx, bonus) => {
    const { reglas } = ctx, nivel = reglas.precios[eleccion.precio];
    const mejorado = { barato: ficha.baratoDemanda, caro: ficha.caroDemanda }[eleccion.precio];   // una mejora o una noticia puede subirlo, nunca bajarlo
    const deModa = juguete.franquicia === partida.moda && !ficha.sinModa;
    const premiado = partida.juguetePremiado && partida.juguetePremiado.id === juguete.id ? partida.juguetePremiado.x : 1;
    const lista = [
      { clave: 'precio', x: Math.max(nivel.demanda, mejorado ?? 0) },
      { clave: 'publicidad', x: reglas.publicidad[eleccion.publicidad].demanda },
      { clave: 'temporada', x: Math.max(reglas.partida.temporada[partida.mes], ficha.mesMinimo) },
      { clave: 'moda', x: deModa ? ficha.moda ?? reglas.partida.moda : 1 },
      { clave: 'empresa', x: ficha.demanda * (esCaro(juguete, reglas) ? ficha.demandaLujo : 1) * premiado },
      { clave: 'resaca', x: partida.resaca },
    ];
    return bonus ? [...lista, { clave: 'minijuego', x: TY.Minijuegos.efecto(bonus, reglas).demanda }] : lista;
  };

  const demanda = (partida, juguete, eleccion, ficha, azar, ctx, bonus) => {
    const lista = factores(partida, juguete, eleccion, ficha, ctx, bonus);
    const fallo = eleccion.publicidad !== 'nada' && ficha.publicidadFallo > 0 && azar.pasa(ficha.publicidadFallo);
    if (fallo) lista[1] = { clave: 'publicidad', x: 1 };
    const baile = ctx.reglas.partida.azar * (juguete.azar || 1);
    const suerte = 1 + azar.entre(Math.max(-baile, ficha.azarMinimo * baile), baile);
    const unidades = Math.max(0, Math.round(lista.reduce((n, f) => n * f.x, juguete.demanda) * suerte));
    return { unidades, factores: lista, suerte, anuncioFallido: fallo };
  };

  return { trimestre, lote, plan, demanda, factores, esLujo, esCaro };
})();
