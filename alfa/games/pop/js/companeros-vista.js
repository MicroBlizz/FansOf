// Fans of Pop · LO QUE ENSEÑAN EL ÁLBUM Y MI EQUIPO (aplicación pura; tarea #142, ADR 157): cómo se consigue cada compañero (frase en
// español con sus datos, para pasarla por tr()), cómo está cada carta y cada casilla de un equipo y si una página tiene premio por recoger.
// Sin SAVE, DOM ni dibujo: el estado de la colección entra como objeto (js/coleccion.js) y sale lo que hay que pintar. Lo pintan
// js/pantalla-album.js y js/pantalla-equipo.js.
'use strict';
const PP_COMP_VISTA = (() => {
  const C = PP_COMP, K = PP_COLE;
  // cómo se consigue: { texto, datos }; `datos.p` es el id de una página (su nombre se traduce aparte, al pegarlo)
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
  });
  function via(id) {
    if (!K.existe(id)) return null;
    const v = C.INFO[id].via, f = VIAS[v.t];
    return f ? Object.freeze(f(v, id)) : null;
  }
  // una carta del álbum: si lo tienes, sus estrellas y repetidos; su rareza y el modo en el que ayuda
  function carta(e, id) {
    if (!K.existe(id)) return null;
    const x = e.tiene[id];
    return Object.freeze({ id, tiene: !!x, est: x ? x.est : 0, rep: x ? x.rep : 0, rar: C.INFO[id].rar, modo: K.modoDe(id) });
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
  // lo que le falta para la siguiente estrella: 'tope', 'sin_repetido' o el precio en monedas
  function siguienteEstrella(e, id) {
    const c = K.costeEstrella(e, id);
    if (c.ok) return Object.freeze({ puede: true, monedas: c.monedas });
    return Object.freeze({ puede: false, motivo: c.error });
  }
  return Object.freeze({ via, carta, estrellas, casillas, tuyosDe, recoger, siguienteEstrella });
})();
