// Fans of Pop · LO QUE ENSEÑAN EL ÁLBUM Y MI EQUIPO (aplicación pura; tarea #142, ADR 157): cómo se consigue cada compañero (frase en
// español con sus datos, para pasarla por tr()), cómo está cada carta y cada casilla de un equipo y si una página tiene premio por recoger.
// Sin SAVE, DOM ni dibujo: el estado de la colección entra como objeto (js/coleccion.js) y sale lo que hay que pintar. Lo pintan
// js/pantalla-album.js y js/pantalla-equipo.js.
'use strict';
const PP_COMP_VISTA = (() => {
  const C = PP_COMP, K = PP_COLE;
  // cómo se consigue: { texto, datos }; `datos.p` es el id de una página y `datos.m`, el índice de un mundo
  // (sus nombres se traducen aparte, al pegarlos)
  const VIAS = Object.freeze({
    serie: () => ({ texto: 'De serie' }),
    rescate: () => ({ texto: 'Rescate en un nivel (solo la primera vez)' }),
    cofre: () => ({ texto: 'Cofre de estrellas' }),
    pase: () => ({ texto: 'Pase de Pop' }),
    paseP: () => ({ texto: 'Pase premium (exclusivo)' }),
    feria: () => ({ texto: 'Feria del finde' }),
    duelos: v => ({ texto: 'Duelos: gana {n} a la máquina', datos: { n: v.n } }),
    jefes: v => ({ texto: 'Duelos: gana a {n} jefes', datos: { n: v.n } }),
    tienda: v => ({ texto: 'Tienda: {n} perlas', datos: { n: v.perlas } }),
    pagina: (v, id) => ({ texto: 'Premio por completar la página {p}', datos: { p: C.INFO[id].pag } }),
    jefe: () => ({ texto: 'Rescate: jefe de un mundo' }),
    // la pista de un escondido (ADR 199): `datos.m` es el índice de su mundo (su nombre se traduce aparte, al pegarlo)
    escondido: (v, id) => {
      const p = PP_ESC.pista(id);
      return { texto: p.momento === 'noche' ? 'Escondido: {m}, de noche' : 'Escondido: {m}, de día', datos: { m: p.mundo } };
    },
  });
  function via(id) {
    if (!K.existe(id)) return null;
    const v = C.INFO[id].via, f = VIAS[v.t];
    return f ? Object.freeze(f(v, id)) : null;
  }
  // la etiqueta corta de color bajo una carta que falta, en vez de «???» (Pepins, tarea 319): { tipo, texto, datos }. `tipo` da el color
  // («Finde» es la Feria del finde, que no se confunda con el mundo Feria; nivel rosa, arco arcoíris, pago dorado, duelo azul, otro turquesa). Un rescate dice su mundo y su nivel (`datos.m`, índice del
  // mundo, y `datos.n`, el nivel; PP_RESCATES de js/tablero.js); un escondido, su mundo (su momento lo dibuja la carta)
  const ETIQUETAS = Object.freeze({
    serie: ['otro', 'De serie'], cofre: ['otro', 'Cofre'], pase: ['pago', 'Pase'], paseP: ['pago', 'Pase'], feria: ['otro', 'Finde'],
    duelos: ['duelo', 'Duelos'], jefes: ['duelo', 'Duelos'], tienda: ['pago', 'Tienda'], pagina: ['otro', 'Premio'], jefe: ['nivel', 'Jefe'],
  });
  function rescateDe(id) {
    for (let m = 0; m < PP_RESCATES.length; m++) {
      const k = PP_RESCATES[m].indexOf(id);
      if (k >= 0 && PP_MUNDOS[m] && PP_MUNDOS[m].amigos[k]) return { m, n: PP_MUNDOS[m].amigos[k] };
    }
    return null;
  }
  function etiqueta(id) {
    if (!K.existe(id)) return null;
    const v = C.INFO[id].via;
    if (v.t === 'escondido') return Object.freeze({ tipo: 'arco', texto: '{m}', datos: { m: PP_ESC.pista(id).mundo } });
    if (v.t === 'rescate') {
      const r = rescateDe(id);
      return Object.freeze(r ? { tipo: 'nivel', texto: '{m} {n}', datos: r } : { tipo: 'nivel', texto: 'Rescate' });
    }
    const e = ETIQUETAS[v.t];
    return e ? Object.freeze({ tipo: e[0], texto: e[1] }) : null;
  }
  // una carta del álbum: si lo tienes, sus estrellas y repetidos; su rareza y el modo en el que ayuda; si es dorado (5 estrellas) y,
  // si es un escondido que te falta (ADR 199), que se enseña su silueta de verdad con su pista (la frase de su vía) y su momento
  function carta(e, id) {
    if (!K.existe(id)) return null;
    const x = e.tiene[id], esc = !x && PP_ESC.esEscondido(id);
    return Object.freeze({
      id, tiene: !!x, est: x ? x.est : 0, rep: x ? x.rep : 0, rar: C.INFO[id].rar, modo: K.modoDe(id), dorado: K.dorado(e, id),
      escondido: esc, momento: esc ? PP_ESC.pista(id).momento : null, pista: esc ? via(id) : null,
    });
  }
  // las estrellas de la ficha: llenas y vacías hasta el tope
  const estrellas = est => Object.freeze({ llenas: Math.max(0, Math.min(K.TOPE_EST, est)), vacias: K.TOPE_EST - Math.max(0, Math.min(K.TOPE_EST, est)) });
  // las casillas de un modo, hasta su tope: 'abierta' (con su compañero o null), 'siguiente' (con su precio) o 'cerrada'
  function casillas(e, m) {
    if (!K.MODOS.includes(m)) return [];
    const tope = Math.max(C.PRECIOS.casillas[m].tope, e.cas[m]), precio = K.precioCasilla(e, m), lista = [];
    for (let i = 0; i < tope; i++) {
      if (i < e.cas[m]) lista.push(Object.freeze({ tipo: 'abierta', id: e.eq[m][i] || null }));
      else if (i === e.cas[m] && precio.ok) lista.push(Object.freeze({ tipo: 'siguiente', monedas: precio.monedas, perlas: precio.perlas }));
      else lista.push(Object.freeze({ tipo: 'cerrada' }));
    }
    return lista;
  }
  // los tuyos que ayudan en un modo, en el orden del álbum
  const tuyosDe = (e, m) => C.IDS.filter(id => e.tiene[id] && K.modoDe(id) === m);
  // ¿hay premio de página por recoger?
  function recoger(e, pid) {
    const p = K.progreso(e, pid);
    return p.ok && p.completa && !p.cobrada;
  }
  // lo que le falta para la siguiente estrella: 'tope', 'sin_repetido' o el precio en monedas y repetidos
  function siguienteEstrella(e, id) {
    const c = K.costeEstrella(e, id), x = e.tiene[id];
    if (c.ok) return Object.freeze({ puede: true, monedas: c.monedas, repetidos: c.repetidos });
    // sin repetidos de sobra: cuántos pide la siguiente estrella, para decir «3/5»
    return Object.freeze({ puede: false, motivo: c.error, repetidos: x ? C.PRECIOS.repetidos[x.est - 1] || 0 : 0 });
  }
  return Object.freeze({ via, etiqueta, carta, estrellas, casillas, tuyosDe, recoger, siguienteEstrella });
})();
