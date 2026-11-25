// Fans of Asalto · DOMINIO · Las cuentas del panel de probabilidades: qué sale en el Altar y con qué suerte, sacadas de los MISMOS
// pesos que usa la tirada (reglas.pesos, con las mejoras, las reliquias y los objetos de la tienda puestos): cada runa, la línea por
// invocación (exacta, sin simular), la red contra la mala suerte, las tiradas seguras de la Piedra de la suerte, las rarezas (las de
// candado, a 0), las piedras de destino y la máquina elegida. Sin estado ni azar: solo cuentas. Lo enseña adaptadores/ventanas-suerte.js.
'use strict';
AS.suerte = (() => {
  // lo que pesa cada runa sobre el total: [{ runa, p }] en el orden de los datos. Suman 1
  function runas(pesos) {
    const total = Object.values(pesos).reduce((a, b) => a + b, 0);
    return Object.keys(pesos).map(runa => ({ runa, p: pesos[runa] / total }));
  }
  // ¿tres runas (sus números) hacen línea? w = el número del comodín, que vale por cualquiera
  const hace = (w, a, b, c) => { const f = a !== w ? a : b !== w ? b : c; return (a === w || a === f) && (b === w || b === f) && (c === w || c === f); };
  // las runas de la tercera columna que harían línea con las dos primeras en esa fila (o diagonal), como máscara de bits
  function prohibidas(w, n, x, y) {
    let m = 0;
    for (let r = 0; r < n; r++) if (hace(w, x, y, r)) m |= 1 << r;
    return m;
  }
  // la probabilidad de que la tercera columna NO haga línea: ni sus runas en las celdas prohibidas ni ella sola en columna
  function sinLineaTercera(w, p, m0, m1, m2) {
    let s = 0;
    for (let a = 0; a < p.length; a++) if (!(m0 >> a & 1)) for (let b = 0; b < p.length; b++) if (!(m1 >> b & 1))
      for (let c = 0; c < p.length; c++) if (!(m2 >> c & 1) && !hace(w, a, b, c)) s += p[a] * p[b] * p[c];
    return s;
  }
  // la probabilidad de que una tirada traiga al menos una línea, exacta: se recorren las dos primeras columnas y, para la tercera, se
  // suma lo que no hace línea (guardando la cuenta de cada caso de celdas prohibidas, que se repiten mucho)
  function linea(pesos) {
    const lista = runas(pesos), p = lista.map(x => x.p), n = p.length, w = lista.findIndex(x => x.runa === AS.altar.COMODIN), memo = new Map(), K = 2 ** n;
    let nada = 0;
    // la primera columna (a0, a1, a2) sin línea, y luego la segunda (b0, b1, b2) sin línea
    for (let a0 = 0; a0 < n; a0++) for (let a1 = 0; a1 < n; a1++) for (let a2 = 0; a2 < n; a2++) {
      if (hace(w, a0, a1, a2)) continue;
      const pa = p[a0] * p[a1] * p[a2];
      for (let b0 = 0; b0 < n; b0++) for (let b1 = 0; b1 < n; b1++) for (let b2 = 0; b2 < n; b2++) {
        if (hace(w, b0, b1, b2)) continue;
        const m0 = prohibidas(w, n, a0, b0) | prohibidas(w, n, a2, b1), m1 = prohibidas(w, n, a1, b1), m2 = prohibidas(w, n, a2, b2) | prohibidas(w, n, a0, b1);
        const clave = (m0 * K + m1) * K + m2;
        if (!memo.has(clave)) memo.set(clave, sinLineaTercera(w, p, m0, m1, m2));
        nada += pa * p[b0] * p[b1] * p[b2] * memo.get(clave);
      }
    }
    return 1 - nada;
  }
  // la línea de la próxima invocación con la red contra la mala suerte: la base más lo que arregla la red de las que fallan
  const conRed = (base, red, fallos) => base + (1 - base) * AS.altar.probRed(red, fallos);
  // las rarezas: [{ id, nombre, p, candado }]; las de candado van a 0. Suman 1
  const rarezas = (datos, m) => AS.reglas.probRarezas(datos, m).map((p, i) => ({ id: datos.rarezas[i].id, nombre: datos.rarezas[i].nombre, p, candado: i > (m.rarezas || 0) }));
  // las piedras de destino: lo a menudo que toca cada una, su rango, cuánto sube, hasta qué rareza llega con las abiertas, la rareza que
  // da segura aunque no esté abierta (minima: la del comodín, Épico; 0 las demás) y lo que trae además (txt con las cifras de extra; las
  // 3 de siempre no traen nada)
  function piedras(datos, m) {
    const T = datos.piedras.tipos, total = Object.values(T).reduce((a, t) => a + t.peso, 0);
    return Object.keys(T).map(tipo => ({ tipo, nombre: T[tipo].nombre, rango: T[tipo].rango, sube: T[tipo].sube, p: T[tipo].peso / total,
      hasta: AS.piedras.rareza(datos, m.rarezas || 0, 0, tipo), minima: AS.piedras.extra(datos, tipo).rareza || 0, txt: T[tipo].txt || null, extra: T[tipo].extra || null }));
  }
  // la línea de la próxima invocación: segura si quedan cargas de la Piedra de la suerte; si no, la de la red
  const proxima = (base, red, s) => (s.seguras > 0 ? 1 : conRed(base, red, s.fallos || 0));
  // todo el panel. s: { mods, reliquias, objetos (los de la tienda), fallos, seguras (cargas de la Piedra de la suerte), maquina }
  function de(datos, s) {
    const pesos = AS.reglas.pesos(datos, s.mods, s.reliquias, s.objetos), base = linea(pesos), red = datos.altar.red;
    const maq = datos.maquinas[s.maquina] || datos.maquinas.altar;
    return {
      runas: runas(pesos), linea: base, ahora: proxima(base, red, s), fallos: s.fallos || 0, seguras: s.seguras || 0, red: { desde: red.desde, prob: red.prob.slice() },
      repite: s.reliquias.includes('repite'), rarezas: rarezas(datos, s.mods), piedras: piedras(datos, s.mods),
      maquina: { id: datos.maquinas[s.maquina] ? s.maquina : 'altar', nombre: maq.nombre, txt: maq.txt, empujones: AS.reglas.empujones(datos, s.mods, s.reliquias, s.maquina), estallidos: AS.reglas.estallidos(datos, s.maquina) },
    };
  }
  return { runas, linea, conRed, rarezas, piedras, de };
})();
