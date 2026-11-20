// Fans of Toys · pantalla · RESULTADO DEL MES: las cuentas, una detrás de otra. Vendidas x precio = ingresos, lo que se ha gastado, el
// beneficio, la reseña de un cliente, el chat de los fans y el correo del CEO. Si el mes cierra trimestre, dice si se llega a la meta.
'use strict';
(() => {
  const C = TY.crea;
  const GASTOS = { produccion: 'Fabricar', molde: 'Molde', publicidad: 'Publicidad', almacen: 'Almacén', multa: 'Noticia' };
  const frase = (texto, nombre) => tr(texto, { juguete: nombre });

  const cuentaGrande = r => {
    const total = C('b', { textContent: '0' });
    return { total, caja: C('div', { className: 'ty-cuenta' },
      C('div', { className: 'ty-ficha ty-azul' }, C('small', { textContent: tr('Vendidas') }), C('b', { textContent: r.vendidas })),
      C('span', { className: 'ty-por', textContent: 'x' }),
      C('div', { className: 'ty-ficha ty-roja' }, C('small', { textContent: tr('Precio') }), C('b', { textContent: r.precio })),
      C('span', { className: 'ty-por', textContent: '=' }),
      C('div', { className: 'ty-ficha ty-total' }, C('small', { textContent: tr('Ingresos') }), total)) };
  };

  const porque = r => {
    const chips = r.factores.filter(f => Math.abs(f.x - 1) > .01).map(f => C('span', { className: `ty-factor ${f.x > 1 ? 'ty-sube' : 'ty-baja'}`,
      textContent: `${tr(TY.TEXTOS.factores[f.clave])} x${Math.round(f.x * 100) / 100}` }));
    return C('div', { className: 'ty-porque' },
      C('p', { textContent: tr('La gente quería {d}. Tenías {u}.', { d: r.demanda, u: r.disponibles }) + (r.sobrantes ? ' ' + tr('Sobran {n}.', { n: r.sobrantes }) : '') }),
      C('div', { className: 'ty-factores' }, ...chips),
      r.anuncioFallido ? C('p', { className: 'ty-fallo', textContent: tr('El becario publicó algo vergonzoso: el anuncio no sirvió de nada.') }) : null);
  };

  const gastos = r => C('ul', { className: 'ty-gastos' },
    ...Object.keys(GASTOS).filter(k => r.gastos[k]).map(k => C('li', {}, C('span', { textContent: tr(GASTOS[k]) }), C('b', { textContent: `-${r.gastos[k]}` }))),
    r.liquidacion ? C('li', { className: 'ty-a-favor' }, C('span', { textContent: tr('Liquidación') }), C('b', { textContent: `+${r.liquidacion}` })) : null);

  const voces = (r, nombre) => {
    const v = r.voces, F = TY.FRASES;
    return C('div', { className: 'ty-voces' },
      C('blockquote', { className: 'ty-resena' }, frase(F.resena[v.tono][v.resena], nombre), C('cite', { textContent: tr('Reseña de un cliente') })),
      C('div', { className: 'ty-chat' }, C('small', { textContent: tr('Chat de fans') }),
        ...v.chat.map(l => C('p', {}, C('b', { textContent: `${l.usuario}: ` }), frase(F.chat[v.tono][l.frase], nombre)))),
      C('p', { className: 'ty-ceo' }, C('b', { textContent: tr('El CEO:') }), ' ' + tr(F.ceo[v.ceo.tono][v.ceo.frase])));
  };

  const cierre = c => !c ? null : C('div', { className: `ty-cierre ${c.pasa ? 'ty-pasa' : 'ty-no-pasa'}` },
    C('small', { textContent: tr('Trimestre cerrado') }), C('b', { textContent: `${c.logrado} / ${c.meta}` }),
    C('span', { textContent: tr(c.pasa ? 'Meta conseguida' : 'No llegas a la meta') }));

  const textoSeguir = (p, c) => {
    if (!c) return tr('Siguiente mes');
    if (!c.pasa) return tr('Ir al despacho del CEO');
    return p.mes >= AJUSTES.partida.meses - 1 ? tr('Cerrar el año') : tr('Elegir mejora');
  };

  // enseña los bloques uno detrás de otro, con sus sonidos
  const desfila = async (bloques, r, total, beneficio) => {
    for (const b of bloques) b.classList.add('ty-oculto');
    const sale = async (i, ms) => { bloques[i].classList.remove('ty-oculto'); await TY.espera(ms); };
    await sale(0, 250); await sale(1, 200);
    TY.sonido.suena('moneda'); await TY.cuenta(total, r.ingresos, 600);
    await sale(2, 350); await sale(3, 350);
    await sale(4, 100);
    TY.sonido.suena(r.beneficio >= 0 ? 'suma' : 'pierde'); await TY.cuenta(beneficio, Math.abs(r.beneficio), 500);
    beneficio.textContent = (r.beneficio >= 0 ? '+' : '-') + Math.abs(r.beneficio);
    for (let i = 5; i < bloques.length; i++) await sale(i, 300);
    if (r.cierre) { TY.sonido.suena(r.cierre.pasa ? 'meta' : 'despido'); if (r.cierre.pasa) TY.fondo.celebra(); }
  };

  TY.pantallas.registra('resultado', () => {
    const p = TY.sesion.partida, r = p.ultimo, j = TY.JUGUETES.find(x => x.id === r.juguete), nombre = tr(j.nombre);
    const cuenta = cuentaGrande(r), beneficio = C('b', { textContent: '0' });
    const sigue = () => { TY.sonido.suena('boton'); TY.sesion.sigue(); TY.pantallas.sigue(); };
    const bloques = [
      C('div', { className: 'ty-cabeza' }, TY.icono(j.id, 64), C('div', {}, C('h2', { textContent: nombre }), C('p', { textContent: tr('Ventas de {mes}', { mes: tr(TY.TEXTOS.meses[p.mes]) }) }))),
      cuenta.caja, porque(r), gastos(r),
      C('div', { className: `ty-beneficio ${r.beneficio >= 0 ? 'ty-gana' : 'ty-pierde'}` }, C('small', { textContent: tr('Beneficio del mes') }), beneficio),
      voces(r, nombre), cierre(r.cierre),
      C('button', { className: 'ty-boton ty-principal', id: 'ty-seguir', textContent: textoSeguir(p, r.cierre), onclick: sigue }),
    ].filter(Boolean);
    desfila(bloques, r, cuenta.total, beneficio);
    return C('section', { className: 'ty-pantalla ty-resultado' }, TY.hud(p), ...bloques);
  });
})();
