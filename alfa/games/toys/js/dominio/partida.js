// Fans of Toys · dominio · PARTIDA: un año fiscal entero. La partida es un dato sin funciones (se puede guardar tal cual) y cada jugada
// devuelve una partida nueva dentro de TY.ok, o TY.error con su nombre. Fases: director (elige la primera mejora) → [noticia] → fabrica →
// resultado → (al cerrar trimestre) mejora o fin. TY.creaJuego(ctx) recibe las reglas y los datos: { reglas, juguetes, mejoras, noticias, frases }.
// Puro: el azar sale del número guardado en la partida (TY.azar), sin reloj ni pantalla.
'use strict';
TY.creaJuego = ctx => {
  const R = ctx.reglas.partida;
  const disponibles = (lista, nivel) => lista.filter(x => x.desde <= nivel);
  const conAzar = (partida, hace) => { const azar = TY.azar(partida.azar); const nueva = hace(azar); return { ...nueva, azar: azar.estado() }; };
  const ficha = partida => TY.Reglas.delMes(partida, ctx.mejoras);
  const ELECCION_MINIMA = { cantidad: 'poca', precio: 'normal', publicidad: 'nada' };

  const ofertaMejoras = (partida, azar) => azar.varios(disponibles(ctx.mejoras, partida.nivel).filter(m => !partida.mejoras.includes(m.id)), R.ofertaMejoras).map(m => m.id);

  // tres juguetes del mes; se repite el sorteo si con el dinero que hay no se puede fabricar ninguno
  const ofertaJuguetes = (partida, azar) => {
    const todos = disponibles(ctx.juguetes, partida.nivel);
    for (let intento = 0; intento < 6; intento++) {
      const oferta = azar.varios(todos, R.ofertaJuguetes).map(j => j.id);
      if (oferta.some(id => (partida.stock[id] || 0) > 0 || TY.Mercado.plan(partida, { juguete: id, ...ELECCION_MINIMA }, ficha(partida), ctx).puede)) return oferta;
    }
    return todos.slice().sort((a, b) => a.molde - b.molde).slice(0, R.ofertaJuguetes).map(j => j.id);
  };

  const abreMes = (anterior, mes) => conAzar(anterior, azar => {
    const estrena = mes % R.mesesPorTrimestre === 0;
    let p = { ...anterior, mes, fase: 'fabrica', efectosMes: {}, juguetePremiado: null, multaMes: 0, ultimo: null, ofertaMejoras: [],
      resaca: anterior.resacaSiguiente, resacaSiguiente: 1, noticiaAnterior: anterior.noticia ? anterior.noticia.id : null, noticia: null,
      beneficioTrimestre: estrena ? 0 : anterior.beneficioTrimestre };
    if (estrena) p.moda = azar.elige([...new Set(disponibles(ctx.juguetes, p.nivel).map(j => j.franquicia))]);
    p.oferta = ofertaJuguetes(p, azar);
    const noticia = TY.Noticias.sortea(p, azar, ctx);
    if (!noticia) return p;
    p.noticia = { id: noticia.id };
    return noticia.opciones ? { ...p, fase: 'noticia' } : TY.Noticias.aplica(p, noticia.efecto, azar, ctx);
  });

  // cómo ha ido el mes, para elegir la reseña y el chat
  const tono = (r, eleccion) => {
    if (r.demanda > r.disponibles * 1.15 && r.disponibles > 0) return 'agotado';
    if (r.sobrantes > r.vendidas) return 'sobra';
    return { caro: 'caro', barato: 'barato' }[eleccion.precio] || 'normal';
  };
  const voces = (r, eleccion, azar) => {
    const t = tono(r, eleccion), F = ctx.frases, indice = lista => Math.floor(azar.uno() * lista.length);
    return { tono: t, resena: indice(F.resena[t]),
      chat: azar.varios(F.chat[t].map((_, i) => i), 2).map(i => ({ usuario: azar.elige(F.usuarios), frase: i })),
      ceo: { tono: r.beneficio > 0 ? 'bien' : 'mal', frase: indice(F.ceo.bien) } };
  };

  const cuentas = (partida, eleccion, azar) => {
    const f = ficha(partida), plan = TY.Mercado.plan(partida, eleccion, f, ctx), j = plan.juguete;
    const d = TY.Mercado.demanda(partida, j, eleccion, f, azar, ctx);
    const vendidas = Math.min(d.unidades, plan.disponibles), sobran = plan.disponibles - vendidas;
    const liquidacion = Math.round(sobran * j.coste * f.liquidacion);
    const stock = { ...partida.stock, [j.id]: f.liquidacion > 0 ? 0 : sobran };
    const almacen = Math.round(Object.values(stock).reduce((n, u) => n + u, 0) * R.almacenPorUnidad * f.almacenCoste);
    const gastos = { produccion: plan.produccion, molde: plan.molde, publicidad: plan.publicidad, almacen, multa: partida.multaMes };
    const ingresos = vendidas * plan.precio;
    const beneficio = ingresos + liquidacion - Object.values(gastos).reduce((n, g) => n + g, 0);
    return { stock, resultado: { juguete: j.id, eleccion, unidades: plan.unidades, disponibles: plan.disponibles, demanda: d.unidades, vendidas, sobrantes: sobran,
      precio: plan.precio, ingresos, liquidacion, gastos, beneficio, factores: d.factores, suerte: d.suerte, anuncioFallido: d.anuncioFallido } };
  };

  const cierre = partida => {
    if ((partida.mes + 1) % R.mesesPorTrimestre) return null;
    const meta = R.metas[TY.Mercado.trimestre(partida, ctx.reglas)];
    return { meta, logrado: partida.beneficioTrimestre, pasa: partida.beneficioTrimestre >= meta };
  };

  const eleccionValida = (partida, e) => !!e && partida.oferta.includes(e.juguete) && e.cantidad in ctx.reglas.cantidades
    && e.precio in ctx.reglas.precios && e.publicidad in ctx.reglas.publicidad;

  return {
    ficha,
    plan: (partida, eleccion) => TY.Mercado.plan(partida, eleccion, ficha(partida), ctx),
    meta: partida => R.metas[TY.Mercado.trimestre(partida, ctx.reglas)],
    trimestre: partida => TY.Mercado.trimestre(partida, ctx.reglas),

    nueva({ semilla, nivel = 0 }) {
      const base = { v: 1, azar: semilla >>> 0, nivel: Math.max(0, Math.min(ctx.reglas.nivelMaximo, nivel | 0)), fase: 'director', mes: -1, dinero: R.dineroInicial,
        stock: {}, moldes: [], mejoras: [], moda: null, oferta: [], ofertaMejoras: [], noticia: null, noticiaAnterior: null, efectosMes: {}, juguetePremiado: null,
        multaMes: 0, resaca: 1, resacaSiguiente: 1, beneficioTrimestre: 0, beneficioTotal: 0, historial: [], ultimo: null, fin: null };
      return conAzar(base, azar => ({ ...base, ofertaMejoras: ofertaMejoras(base, azar) }));
    },

    eligeMejora(partida, id) {
      if (partida.fase !== 'director' && partida.fase !== 'mejora') return TY.error('fuera-de-fase', { fase: partida.fase });
      if (!partida.ofertaMejoras.includes(id)) return TY.error('mejora-no-ofrecida', { id });
      return TY.ok(abreMes({ ...partida, mejoras: [...partida.mejoras, id] }, partida.mes + 1));
    },

    decideNoticia(partida, indice) {
      if (partida.fase !== 'noticia') return TY.error('fuera-de-fase', { fase: partida.fase });
      const noticia = ctx.noticias.find(n => n.id === partida.noticia.id), opcion = noticia.opciones[indice];
      if (!opcion) return TY.error('opcion-no-existe', { indice });
      return TY.ok(conAzar(partida, azar => {
        const sale = azar.segun(opcion.resultados);
        return { ...TY.Noticias.aplica(partida, sale.efecto, azar, ctx), fase: 'fabrica',
          noticia: { id: noticia.id, opcion: indice, resultado: opcion.resultados.indexOf(sale) } };
      }));
    },

    produce(partida, eleccion) {
      if (partida.fase !== 'fabrica') return TY.error('fuera-de-fase', { fase: partida.fase });
      if (!eleccionValida(partida, eleccion)) return TY.error('eleccion-no-valida', { eleccion });
      if (!TY.Mercado.plan(partida, eleccion, ficha(partida), ctx).puede) return TY.error('sin-dinero');
      return TY.ok(conAzar(partida, azar => {
        const { stock, resultado } = cuentas(partida, eleccion, azar);
        const p = { ...partida, fase: 'resultado', stock, dinero: partida.dinero + resultado.beneficio,
          moldes: resultado.unidades ? [...new Set([...partida.moldes, resultado.juguete])] : partida.moldes,
          beneficioTrimestre: partida.beneficioTrimestre + resultado.beneficio, beneficioTotal: partida.beneficioTotal + resultado.beneficio,
          historial: [...partida.historial, resultado.beneficio] };
        return { ...p, ultimo: { ...resultado, voces: voces(resultado, eleccion, azar), cierre: cierre(p) } };
      }));
    },

    sigue(partida) {
      if (partida.fase !== 'resultado') return TY.error('fuera-de-fase', { fase: partida.fase });
      const c = partida.ultimo.cierre, t = TY.Mercado.trimestre(partida, ctx.reglas);
      if (!c) return TY.ok(abreMes(partida, partida.mes + 1));
      if (!c.pasa) return TY.ok({ ...partida, fase: 'fin', fin: { tipo: 'despedido', trimestres: t } });
      if (partida.mes + 1 >= R.meses) return TY.ok({ ...partida, fase: 'fin', fin: { tipo: 'ascendido', trimestres: t + 1 } });
      const oferta = conAzar(partida, azar => ({ ...partida, fase: 'mejora', ofertaMejoras: ofertaMejoras(partida, azar) }));
      return TY.ok(oferta.ofertaMejoras.length ? oferta : abreMes(partida, partida.mes + 1));
    },
  };
};
