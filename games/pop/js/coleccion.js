// Fans of Pop · COLECCIÓN DE COMPAÑEROS (dominio; tarea #142, ADR 157): qué compañeros tienes, sus estrellas y repetidos, el equipo de
// cada modo (N Niveles, P Pesadilla, D Duelos) con sus casillas, el premio de cada página del álbum, los contadores de las vías por
// logros y lo que hace cada uno según sus estrellas. Funciones puras: sin SAVE, reloj, azar, red ni dibujo; el estado entra y sale
// como objeto nuevo (nunca se cambia el que llega). Los errores son resultados con nombre (ver ERRORES). Datos: js/companeros-datos.js.
'use strict';
const PP_COLE = (() => {
  const C = PP_COMP, MODOS = Object.freeze(['N', 'P', 'D']), TOPE_EST = 5;
  const ok = v => Object.freeze({ ok: true, ...v });
  const error = e => Object.freeze({ ok: false, error: e });
  const ERRORES = Object.freeze(['no_existe', 'no_tiene', 'modo', 'otro_modo', 'ya_esta', 'lleno', 'no_esta', 'tope', 'sin_repetido', 'monedas', 'incompleta', 'ya_cobrada', 'pagina']);
  const existe = id => Object.prototype.hasOwnProperty.call(C.INFO, id);
  const modoDe = id => C.HAB[C.INFO[id].hab].modo;
  const copia = e => ({
    v: 1, tiene: Object.fromEntries(Object.entries(e.tiene).map(([k, x]) => [k, { est: x.est, rep: x.rep }])),
    eq: { N: [...e.eq.N], P: [...e.eq.P], D: [...e.eq.D] }, cas: { ...e.cas }, pags: { ...e.pags }, cont: { ...e.cont },
  });
  // un estado nuevo: Lola de serie (en el equipo de Niveles) y las casillas de serie de cada modo
  function nuevo() {
    const c = C.PRECIOS.casillas;
    return { v: 1, tiene: { lola: { est: 1, rep: 0 } }, eq: { N: ['lola'], P: [], D: [] }, cas: { N: c.N.serie, P: c.P.serie, D: c.D.serie }, pags: {}, cont: { duelos: 0, jefes: 0 } };
  }
  // lo guardado (o nada) → un estado válido: lo que no existe o no cuadra se descarta, nunca se rompe la partida
  function lee(g) {
    if (!g || g.v !== 1 || typeof g.tiene !== 'object') return nuevo();
    const e = nuevo();
    for (const [id, x] of Object.entries(g.tiene || {})) if (existe(id)) e.tiene[id] = { est: entero(x && x.est, 1, TOPE_EST), rep: entero(x && x.rep, 0, 99) };
    for (const m of MODOS) e.cas[m] = entero(g.cas && g.cas[m], C.PRECIOS.casillas[m].serie, topeDe(m, (g.cas || {})[m]));
    for (const m of MODOS) e.eq[m] = [...new Set((g.eq && g.eq[m]) || [])].filter(id => e.tiene[id] && modoDe(id) === m).slice(0, e.cas[m]);
    for (const p of C.PAGINAS) if (g.pags && g.pags[p.id]) e.pags[p.id] = true;
    e.cont = { duelos: entero(g.cont && g.cont.duelos, 0, 1e6), jefes: entero(g.cont && g.cont.jefes, 0, 1e6) };
    return e;
  }
  function entero(x, min, max) { const n = Math.floor(Number(x)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min; }
  // el tope de casillas de un modo; quien compró el 6.º hueco de antes lo conserva en Niveles
  const topeDe = (m, actual) => Math.max(C.PRECIOS.casillas[m].tope, m === 'N' ? Math.min(6, actual || 0) : 0);
  // lo de antes del álbum: los amigos vistos, el equipo del camino y los huecos comprados (SAVE.huecos)
  function desdeViejo(vistos, equipo, huecos) {
    const e = nuevo();
    for (const id of Object.keys(vistos || {})) if (existe(id) && !e.tiene[id]) e.tiene[id] = { est: 1, rep: 0 };
    e.cas.N = Math.min(6, C.PRECIOS.casillas.N.serie + entero(huecos, 0, 3));
    const eqN = (equipo || []).filter(id => e.tiene[id] && modoDe(id) === 'N');
    e.eq.N = (eqN.length ? [...new Set(eqN)] : e.eq.N).slice(0, e.cas.N);
    return e;
  }
  // conseguir un compañero: nuevo, o un repetido para subirle estrellas (si ya no le hacen falta, `sobra`: monedas)
  function gana(e, id) {
    if (!existe(id)) return error('no_existe');
    const n = copia(e), x = n.tiene[id];
    if (!x) { n.tiene[id] = { est: 1, rep: 0 }; return ok({ estado: n, nuevo: true, sobra: 0 }); }
    if (x.est + x.rep >= TOPE_EST) return ok({ estado: n, nuevo: false, sobra: C.PRECIOS.sobra });
    x.rep++;
    return ok({ estado: n, nuevo: false, sobra: 0 });
  }
  // el rescate de un nivel solo da el compañero la primera vez en tu vida (Pepins, 19-11-2026): reiniciar el camino no da repetidos
  function rescata(e, id) {
    if (!existe(id)) return error('no_existe');
    if (e.tiene[id]) return ok({ estado: copia(e), nuevo: false, sobra: 0 });
    return gana(e, id);
  }
  // cuánto cuesta la siguiente estrella
  function costeEstrella(e, id) {
    if (!existe(id)) return error('no_existe');
    const x = e.tiene[id];
    if (!x) return error('no_tiene');
    if (x.est >= TOPE_EST) return error('tope');
    if (x.rep < 1) return error('sin_repetido');
    return ok({ monedas: C.PRECIOS.estrellas[x.est - 1] });
  }
  function subeEstrella(e, id, monedas) {
    const c = costeEstrella(e, id);
    if (!c.ok) return c;
    if (monedas < c.monedas) return error('monedas');
    const n = copia(e);
    n.tiene[id].est++; n.tiene[id].rep--;
    return ok({ estado: n, gasta: c.monedas });
  }
  // el equipo de cada modo
  const valeModo = m => MODOS.includes(m);
  function pon(e, m, id) {
    if (!valeModo(m)) return error('modo');
    if (!existe(id)) return error('no_existe');
    if (!e.tiene[id]) return error('no_tiene');
    if (modoDe(id) !== m) return error('otro_modo');
    if (e.eq[m].includes(id)) return error('ya_esta');
    if (e.eq[m].length >= e.cas[m]) return error('lleno');
    const n = copia(e); n.eq[m].push(id);
    return ok({ estado: n });
  }
  function quita(e, m, id) {
    if (!valeModo(m)) return error('modo');
    if (!e.eq[m].includes(id)) return error('no_esta');
    const n = copia(e); n.eq[m] = n.eq[m].filter(k => k !== id);
    return ok({ estado: n });
  }
  // la siguiente casilla de un modo: { monedas, perlas } (perlas null si no se vende con perlas); error 'tope' si no quedan
  function precioCasilla(e, m) {
    if (!valeModo(m)) return error('modo');
    const p = C.PRECIOS.casillas[m], k = e.cas[m] - p.serie;
    if (e.cas[m] >= p.tope) return error('tope');
    return ok({ monedas: p.monedas[k], perlas: p.perlas ? p.perlas[k] : null });
  }
  function abreCasilla(e, m) {
    const p = precioCasilla(e, m);
    if (!p.ok) return p;
    const n = copia(e); n.cas[m]++;
    return ok({ estado: n, precio: p });
  }
  // las páginas del álbum: cuántos tienes y si ya cobraste su premio
  const pagina = pid => C.PAGINAS.find(p => p.id === pid);
  const idsDe = pid => C.IDS.filter(id => C.INFO[id].pag === pid);
  function progreso(e, pid) {
    if (!pagina(pid)) return error('pagina');
    const ids = idsDe(pid), tengo = ids.filter(id => e.tiene[id]).length;
    // el premio de una página puede ser uno de sus compañeros (Panda): se completa con todos los demás
    const premio = pagina(pid).premio.companero, falta = ids.filter(id => !e.tiene[id] && id !== premio).length;
    return ok({ tengo, total: ids.length, completa: falta === 0, cobrada: !!e.pags[pid] });
  }
  function cobraPagina(e, pid) {
    const p = progreso(e, pid);
    if (!p.ok) return p;
    if (p.cobrada) return error('ya_cobrada');
    if (!p.completa) return error('incompleta');
    let n = copia(e); n.pags[pid] = true;
    const premio = pagina(pid).premio;
    if (premio.companero) n = gana(n, premio.companero).estado;
    return ok({ estado: n, premio });
  }
  // los logros de duelos: cuenta una victoria contra la máquina (y si era un jefe) y da los compañeros que ya tocan
  function cuentaDuelo(e, jefe) {
    let n = copia(e); n.cont.duelos++; if (jefe) n.cont.jefes++;
    const nuevos = [];
    for (const id of C.IDS) {
      const v = C.INFO[id].via, llega = (v.t === 'duelos' && n.cont.duelos >= v.n) || (v.t === 'jefes' && n.cont.jefes >= v.n);
      if (llega && !n.tiene[id]) { n = gana(n, id).estado; nuevos.push(id); }
    }
    return ok({ estado: n, nuevos });
  }
  // las vías del juego. Los que pueden salir atrapados en un nivel: los de rescate que aún no tienes (da igual el equipo)
  const deVia = t => C.IDS.filter(id => C.INFO[id].via.t === t);
  const atrapables = e => deVia('rescate').filter(id => !e.tiene[id]);
  // el compañero de un cofre de estrellas: al azar entre los de cofre que te faltan; si ya los tienes todos, un repetido al azar.
  // `azar`: una función en [0, 1) (Math.random en el juego): es azar ganado jugando, nunca comprado (ADR 004)
  function deCofre(e, azar) {
    const todos = deVia('cofre'), faltan = todos.filter(id => !e.tiene[id]), bolsa = faltan.length ? faltan : todos;
    return bolsa[Math.min(bolsa.length - 1, Math.floor(azar() * bolsa.length))];
  }
  // el de un jefe nuevo (MechaVaca), si aún no lo tienes; si no, null
  const deJefe = e => deVia('jefe').find(id => !e.tiene[id]) || null;
  // el compañero que da un escalón `k` del pase (gratis o premium) o un tramo `k` de la Feria; null si no da ninguno
  const delPase = (k, premium) => C.VIAS.pase[premium ? 'premium' : 'gratis'][k] || null;
  const deFeria = k => C.VIAS.feria[k] || null;
  // lo que hace un compañero con sus estrellas: con 1, lo mismo que hoy; cada estrella lo mejora un poco (Pepins: poca ventaja)
  const MEJORA = Object.freeze({
    salta: (v, s) => Math.max(4, v - Math.floor((s - 1) / 2)),
    golpes: (v, s) => (s >= TOPE_EST ? v + 1 : v),
    monedas: (v, s) => Math.round((v + 0.1 * (s - 1)) * 10) / 10,
    limpia: (v, s) => v + (s - 1),
    dMonedas: (v, s) => v + 2 * (s - 1),
    dFallo: (v, s) => Math.round((v + 0.02 * (s - 1)) * 100) / 100,
  });
  function fxDe(e, id) {
    if (!existe(id)) return error('no_existe');
    const base = (C.NUEVOS[id] || PP_SLIMES[id]).fx, s = e.tiene[id] ? e.tiene[id].est : 1, fx = {};
    for (const [k, v] of Object.entries(base)) fx[k] = MEJORA[k] ? MEJORA[k](v, s) : v;
    return ok({ fx: Object.freeze(fx) });
  }
  return Object.freeze({ MODOS, TOPE_EST, ERRORES, nuevo, lee, desdeViejo, gana, rescata, costeEstrella, subeEstrella, pon, quita, precioCasilla, abreCasilla, progreso, cobraPagina, cuentaDuelo, fxDe, modoDe, existe, idsDe, deVia, atrapables, deCofre, deJefe, delPase, deFeria });
})();
