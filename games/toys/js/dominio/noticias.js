// Fans of Toys · dominio · NOTICIAS: sortea la noticia del mes y aplica su efecto a la partida. Claves de un efecto: las de la ficha del
// mes (TY.Reglas: demanda, costeUnidad, baratoDemanda, sinModa, demandaLujo) y además: demandaOferta (un juguete de los tres del mes
// vende más), multa (parte del dinero), multaFija (por el trimestre), pierdeStock (vacía el almacén) y resaca (la demanda del mes que
// viene). Puro: devuelve una partida nueva, no cambia la que recibe.
'use strict';
TY.Noticias = (() => {
  const MULTA_MINIMA = 20;
  const cuesta = (partida, efecto, ctx) => {
    const t = TY.Mercado.trimestre(partida, ctx.reglas) + 1;
    const rebaja = TY.Reglas.delMes({ mejoras: partida.mejoras }, ctx.mejoras).eventoCoste;
    const parte = efecto.multa ? Math.max(MULTA_MINIMA * t, Math.max(0, partida.dinero) * efecto.multa) : 0;
    return Math.round((parte + (efecto.multaFija || 0) * t) * rebaja);
  };
  return {
    // la noticia que toca este mes, o null
    sortea(partida, azar, ctx) {
      const r = ctx.reglas.partida;
      if (partida.mes < r.mesesSinEvento || !azar.pasa(r.probEvento)) return null;
      const sinStock = !Object.values(partida.stock).some(n => n > 0);
      const posibles = ctx.noticias.filter(n => n.id !== partida.noticiaAnterior && !(n.id === 'iman' && sinStock));
      return azar.elige(posibles);
    },
    // la partida con el efecto ya aplicado a este mes
    aplica(partida, efecto, azar, ctx) {
      const efectosMes = { ...partida.efectosMes };
      for (const clave of Object.keys(efecto)) if (TY.Reglas.COMBINA[clave]) efectosMes[clave] = efecto[clave];
      return {
        ...partida, efectosMes,
        juguetePremiado: efecto.demandaOferta ? { id: azar.elige(partida.oferta), x: efecto.demandaOferta } : partida.juguetePremiado,
        multaMes: partida.multaMes + cuesta(partida, efecto, ctx),
        stock: efecto.pierdeStock ? {} : partida.stock,
        resacaSiguiente: efecto.resaca || partida.resacaSiguiente,
      };
    },
  };
})();
