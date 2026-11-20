// Fans of Toys · pantalla · FÁBRICA: la decisión del mes. Tres cartas de juguete y tres filas de botones (cantidad, precio y
// publicidad). Debajo, lo que vas a gastar y la previsión de ventas, que cambian con cada toque, y el botón de producir.
'use strict';
(() => {
  const C = TY.crea;
  const ctx = () => ({ reglas: AJUSTES, juguetes: TY.JUGUETES });
  const juguete = id => TY.TODOS.find(j => j.id === id);
  // lo que se suele vender con esa jugada, sin contar la suerte
  const prevision = (p, e) => Math.round(TY.Mercado.factores(p, juguete(e.juguete), e, TY.juego.ficha(p), ctx()).reduce((n, f) => n * f.x, juguete(e.juguete).demanda));
  // el primer juguete que se puede fabricar con lo que hay
  const preferido = p => p.oferta.find(id => TY.juego.plan(p, { juguete: id, cantidad: 'media', precio: 'normal', publicidad: 'nada' }).puede) || p.oferta[0];

  const cartaJuguete = (p, e, id, elige) => {
    const j = juguete(id), stock = p.stock[id] || 0, pagado = p.moldes.includes(id);
    const dorado = TY.sesion.datos.coleccion.oro.includes(id);
    const sellos = [
      j.raro ? C('span', { className: 'ty-sello ty-s-raro', textContent: tr('Edición limitada') }) : null,
      dorado ? C('span', { className: 'ty-sello ty-s-oro', textContent: tr('Dorada') }) : null,
      j.franquicia === p.moda ? C('span', { className: 'ty-sello ty-s-moda', textContent: tr('De moda') }) : null,
      p.juguetePremiado && p.juguetePremiado.id === id ? C('span', { className: 'ty-sello ty-s-fiebre', textContent: tr('Fiebre') }) : null,
      stock ? C('span', { className: 'ty-sello ty-s-stock', textContent: tr('Almacén: {n}', { n: stock }) }) : null];
    return C('button', { className: `ty-carta ty-juguete${e.juguete === id ? ' ty-elegida' : ''}${j.raro ? ' ty-raro' : ''}${dorado ? ' ty-es-oro' : ''}`, onclick: () => elige(id) },
      TY.icono(id, 56), C('h3', { textContent: tr(j.nombre) }),
      C('p', { className: 'ty-dato', textContent: tr('Hacerlo: {n}', { n: j.coste }) }),
      C('p', { className: 'ty-dato', textContent: tr('Se vende a: {n}', { n: j.precio }) }),
      C('p', { className: `ty-dato ${pagado || j.raro ? 'ty-pagado' : 'ty-molde'}`, textContent: j.raro ? tr('Sin molde') : pagado ? tr('Molde pagado') : tr('Molde: {n}', { n: j.molde }) }),
      C('div', { className: 'ty-sellos' }, ...sellos));
  };

  // una fila de botones para una de las tres decisiones; `pie(nivel)` es el número pequeño de cada botón
  const fila = (p, e, clave, titulo, textos, pie, cambia) => C('div', { className: `ty-fila ty-f-${clave}` },
    C('span', { className: 'ty-rotulo', textContent: tr(titulo) }),
    ...Object.keys(textos).map(nivel => {
      const cara = !TY.juego.plan(p, { ...e, [clave]: nivel }).puede;
      return C('button', { className: `ty-opcion${e[clave] === nivel ? ' ty-elegida' : ''}${cara ? ' ty-no-llega' : ''}`, onclick: () => cambia(clave, nivel) },
        C('b', { textContent: tr(textos[nivel]) }), C('small', { textContent: pie(nivel) }));
    }));

  const resumen = (p, e, plan) => {
    const ventas = prevision(p, e), partes = [[plan.produccion, 'fabricar {n}'], [plan.molde, 'molde {n}'], [plan.publicidad, 'anuncio {n}']]
      .filter(x => x[0]).map(x => tr(x[1], { n: x[0] })).join(' + ');
    const pista = !plan.disponibles ? '' : ventas > plan.disponibles * 1.15 ? tr('Te vas a quedar corto.') : plan.disponibles > ventas * 1.3 ? tr('Te va a sobrar.') : tr('Vas bien de cantidad.');
    return C('div', { className: 'ty-resumen' },
      C('p', {}, C('b', { className: 'ty-gasto', textContent: tr('Gastas {n}', { n: plan.total }) }), partes ? C('small', { textContent: ` (${partes})` }) : null),
      C('p', { textContent: tr('Tendrás {u} para vender a {p} cada uno.', { u: plan.disponibles, p: plan.precio }) }),
      C('p', {}, C('b', { className: 'ty-prevision', textContent: tr('Previsión: unas {n} ventas.', { n: ventas }) }), ' ', C('span', { className: 'ty-pista', textContent: pista })));
  };

  const noticia = p => {
    if (!p.noticia) return null;
    const n = TY.NOTICIAS.find(x => x.id === p.noticia.id);
    const nota = p.noticia.opcion === undefined ? n.texto : n.opciones[p.noticia.opcion].resultados[p.noticia.resultado].nota;
    return C('button', { className: 'ty-banda', onclick: () => TY.aviso(tr('Pasó de verdad:'), tr(n.real)) }, C('b', { textContent: tr(n.titulo) }),
      C('span', { textContent: tr(nota) + (p.multaMes ? ' ' + tr('Te cuesta {n}.', { n: p.multaMes }) : '') }));
  };

  const textoBoton = (plan, e, p) => {
    if (!plan.puede) return tr('No te llega el dinero');
    if (e.cantidad !== 'nada') return tr('Producir');
    return (p.stock[e.juguete] || 0) ? tr('Vender lo del almacén') : tr('Pasar el mes');
  };

  TY.pantallas.registra('fabrica', () => {
    const p = TY.sesion.partida, e = { juguete: preferido(p), cantidad: 'media', precio: 'normal', publicidad: 'nada' };
    const raiz = C('section', { className: 'ty-pantalla ty-fabrica' });
    // con algo que fabricar, antes sale el minijuego del mes (que se puede saltar); sin nada, el mes pasa directo
    const produce = () => {
      if (e.cantidad !== 'nada' && TY.juego.plan(p, e).puede) { TY.jugada = { ...e }; TY.sonido.suena('boton'); return TY.pantallas.ve('minijuego'); }
      const r = TY.sesion.produce(e);
      if (!r.ok) return TY.sonido.suena('pierde');
      TY.sonido.suena('produce'); TY.pantallas.sigue();
    };
    const pinta = () => {
      const plan = TY.juego.plan(p, e), j = plan.juguete, t = TY.juego.trimestre(p) + 1;
      const cambia = (clave, nivel) => { e[clave] = nivel; TY.sonido.suena('boton'); pinta(); };
      const elige = id => { e.juguete = id; TY.sonido.suena('carta'); pinta(); };
      raiz.replaceChildren(...[TY.hud(p), noticia(p),
        C('div', { className: 'ty-mano' }, ...p.oferta.map(id => cartaJuguete(p, e, id, elige))),
        fila(p, e, 'cantidad', 'Cantidad', TY.TEXTOS.cantidades, n => (n === 'nada' ? '0' : String(TY.Mercado.lote(j, n, AJUSTES))), cambia),
        fila(p, e, 'precio', 'Precio', TY.TEXTOS.precios, n => String(TY.juego.plan(p, { ...e, precio: n }).precio), cambia),
        fila(p, e, 'publicidad', 'Publicidad', TY.TEXTOS.publicidad, n => String(Math.round(AJUSTES.publicidad[n].coste * t * TY.juego.ficha(p).publicidadCoste)), cambia),
        resumen(p, e, plan),
        C('button', { className: 'ty-boton ty-principal ty-producir', id: 'ty-producir', disabled: !plan.puede, textContent: textoBoton(plan, e, p), onclick: produce })].filter(Boolean));
    };
    pinta();
    return raiz;
  });
})();
