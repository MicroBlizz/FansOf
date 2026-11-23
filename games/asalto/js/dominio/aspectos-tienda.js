// Fans of Asalto · DOMINIO · Los aspectos de héroe de la tienda (ADR 200): se compran con Coronas a precio fijo, sin azar, y solo cambian
// cómo se ve el héroe (nunca una cifra del combate: ni la vida, ni el daño, ni el poder). Cada tipo de héroe lleva puesto a lo sumo uno.
// El del que ya tiene dueño se puede poner y quitar; el exclusivo (coronas: null) no se vende: lo da el Pack de inicio. Cada función devuelve
// un progreso nuevo o un error con nombre: aspecto-desconocido, ya-lo-tienes, no-se-vende, sin-coronas, no-lo-tienes, sin-aspecto.
'use strict';
AS.aspectosTienda = (() => {
  const lista = v => (Array.isArray(v) ? v : []);
  // lo guardado, siempre válido: solo aspectos que existen y sin repetir; cada puesto, de un aspecto que tiene y del héroe que es
  function lee(datos, j) {
    const aspectos = lista(j && j.aspectos).filter((id, i, l) => !!datos.aspectos[id] && l.indexOf(id) === i), pieles = {};
    const puestos = (j && j.pieles && typeof j.pieles === 'object') ? j.pieles : {};
    for (const tipo of Object.keys(puestos)) { const id = puestos[tipo]; if (aspectos.includes(id) && datos.aspectos[id].heroe === tipo) pieles[tipo] = id; }
    return { aspectos, pieles };
  }
  // lo que enseña el escaparate: todos, con su precio, si es tuyo, si lo llevas y si se vende con Coronas
  const escaparate = (datos, p) => Object.keys(datos.aspectos).map(id => {
    const a = datos.aspectos[id];
    return Object.freeze({ id, heroe: a.heroe, nombre: a.nombre, coronas: a.coronas, vende: a.coronas > 0, tienes: p.aspectos.includes(id), puesto: p.pieles[a.heroe] === id });
  });
  // el aspecto que lleva puesto un tipo de héroe (su ficha de ASALTO.aspectos con el id), o null
  function puesto(datos, p, tipo) {
    const id = p.pieles[tipo];
    return id && p.aspectos.includes(id) && datos.aspectos[id] ? { id, ...datos.aspectos[id] } : null;
  }
  function compra(datos, p, id) {
    const a = datos.aspectos[id];
    if (!a) return AS.error('aspecto-desconocido');
    if (p.aspectos.includes(id)) return AS.error('ya-lo-tienes');
    if (!(a.coronas > 0)) return AS.error('no-se-vende');
    const g = AS.coronas.gasta(p, a.coronas);
    return g.ok ? AS.ok({ ...g.valor, aspectos: [...p.aspectos, id] }) : g;
  }
  // lo regala un pack: no cobra, y si ya lo tiene se queda igual
  function da(datos, p, id) {
    if (!datos.aspectos[id]) return AS.error('aspecto-desconocido');
    return AS.ok(p.aspectos.includes(id) ? p : { ...p, aspectos: [...p.aspectos, id] });
  }
  function pon(datos, p, id) {
    const a = datos.aspectos[id];
    if (!a) return AS.error('aspecto-desconocido');
    if (!p.aspectos.includes(id)) return AS.error('no-lo-tienes');
    return AS.ok({ ...p, pieles: { ...p.pieles, [a.heroe]: id } });
  }
  function quita(datos, p, tipo) {
    if (!p.pieles[tipo]) return AS.error('sin-aspecto');
    const pieles = { ...p.pieles };
    delete pieles[tipo];
    return AS.ok({ ...p, pieles });
  }
  return { lee, escaparate, puesto, compra, da, pon, quita };
})();
