// Fans of Asalto · DOMINIO · Un héroe de la partida: qué Animal Loco es, su nivel, su rareza (0 Común… 4 Mítico; multiplica sus cifras), sus cifras propias
// (con cuánta vida y daño de más o de menos le tocó llegar), sus huecos de impronta, las marcas de los que ha absorbido (de ahí salen
// sus herencias), la rama que eligió al ascender y si es un Animal Dorado. Es un valor congelado: absorber o ascender devuelve otro.
// Las reglas: el que absorbe suma los niveles del absorbido, se queda con la rareza más alta de los dos y gana una marca de su clase principal (más las marcas que ya traía);
// con nivel 5 o más puede ascender a una de sus dos clases, una sola vez.
// Tarea #109: si es legendario (dominio/legendario.js) lleva también sus cartas de Despertar (`cartas`), la marca `legendario` y, si
// salió de unir dos legendarios, `ser` ({ clave, padres }). La carta «hambre» dobla el nivel que suma al absorber y «hueco» da un hueco más.
// Tarea #156: si salió de unir la pareja de legendarios de un dios, `dios` es su id (ajustes-dioses.js); si no, null.
'use strict';
AS.heroe = (() => {
  const congela = h => {
    Object.freeze(h.marcas); Object.freeze(h.cifras); Object.freeze(h.cartas);
    if (h.ser) { Object.freeze(h.ser.padres); Object.freeze(h.ser); }
    return Object.freeze(h);
  };
  // el mismo héroe con estos campos cambiados (otro valor congelado); lo usa también dominio/legendario.js
  const con = (h, cambios) => congela({ ...h, cifras: { ...h.cifras }, marcas: { ...h.marcas }, cartas: h.cartas.slice(), ...cambios });
  const tiene = (h, carta) => h.cartas.includes(carta);
  const juntaCartas = (a, b) => [...a, ...b.filter(c => !a.includes(c))];
  const SIN_CIFRAS = () => ({ vida: 1, dano: 1 });
  // una cifra propia vale si está dentro del margen de los ajustes (con margen 10: de 0,9 a 1,1)
  const cifraVale = (datos, v) => Number.isFinite(v) && Math.abs(v - 1) <= datos.niveles.margen / 100 + 1e-9;

  function crea(datos, id, tipo, nivel = 1, dorado = false, rareza = 0) {
    if (!datos.heroes[tipo]) return AS.error('heroe-desconocido', { tipo });
    if (!(nivel >= 1)) return AS.error('nivel-invalido', { nivel });
    if (!Number.isInteger(rareza) || !datos.rarezas[rareza]) return AS.error('rareza-desconocida', { rareza });
    return AS.ok(congela({ id, tipo, nivel: Math.floor(nivel), rareza, cifras: SIN_CIFRAS(), marcas: {}, rama: null, dorado: !!dorado, cartas: [], legendario: false, ser: null, dios: null }));
  }
  // el mismo héroe con sus cifras propias: { vida, dano }, cada una un multiplicador dentro del margen
  function conCifras(datos, h, cifras) {
    if (!cifras || !cifraVale(datos, cifras.vida) || !cifraVale(datos, cifras.dano)) return AS.error('cifras-fuera-de-margen');
    return AS.ok(con(h, { cifras: { vida: cifras.vida, dano: cifras.dano } }));
  }
  const clases = (datos, h) => datos.heroes[h.tipo].clases;
  // el que queda: suma niveles (el doble con la carta «hambre»), marcas (una de la clase principal del absorbido, más las que este traía)
  // y cartas de Despertar (sin repetir)
  function absorbe(datos, h, otro) {
    if (h.id === otro.id) return AS.error('a-si-mismo');
    const marcas = { ...h.marcas };
    for (const k in otro.marcas) marcas[k] = (marcas[k] || 0) + otro.marcas[k];
    const principal = clases(datos, otro)[0];
    marcas[principal] = (marcas[principal] || 0) + 1;
    const nivel = h.nivel + otro.nivel * (tiene(h, 'hambre') ? 2 : 1);
    return AS.ok(con(h, { nivel, rareza: Math.max(h.rareza, otro.rareza), marcas, dorado: h.dorado || otro.dorado, cartas: juntaCartas(h.cartas, otro.cartas) }));
  }
  // cuántos huecos de impronta tiene abiertos por su nivel (1, 2 al nivel 5 y 3 al nivel 10), más uno con la carta «hueco»
  const huecos = (datos, h) => datos.niveles.huecos.filter(n => h.nivel >= n).length + (tiene(h, 'hueco') ? 1 : 0);
  // el mismo héroe con una carta de Despertar más
  function conCarta(datos, h, carta) {
    if (!datos.legendarios.cartas[carta]) return AS.error('carta-desconocida', { carta });
    if (tiene(h, carta)) return AS.error('carta-repetida', { carta });
    return AS.ok(con(h, { cartas: [...h.cartas, carta] }));
  }
  // sus improntas: las clases grabadas en sus huecos, por orden de llegada (la primera clase que absorbió, la segunda…)
  const improntas = (datos, h) => Object.keys(h.marcas).slice(0, huecos(datos, h));
  // los grados de cada herencia: { clase: grado }. Solo cuentan las clases que tienen hueco
  function herencias(datos, h) {
    const N = datos.niveles, g = {};
    for (const k of improntas(datos, h)) { const grado = Math.min(N.tope, Math.floor(h.marcas[k] / N.marcas)); if (grado > 0) g[k] = grado; }
    return g;
  }
  const puedeAscender = (datos, h) => !h.rama && h.nivel >= datos.niveles.ascenso;
  function asciende(datos, h, clase) {
    if (h.rama) return AS.error('ya-ascendido');
    if (h.nivel < datos.niveles.ascenso) return AS.error('nivel-bajo', { hace_falta: datos.niveles.ascenso });
    if (!clases(datos, h).includes(clase)) return AS.error('clase-ajena', { clase });
    return AS.ok(con(h, { rama: clase }));
  }
  // los puntos de clase que da en el campo: 1 a cada una de sus dos clases y 2 a la de su rama
  function puntos(datos, h) {
    const p = {};
    for (const k of clases(datos, h)) p[k] = k === h.rama ? 2 : 1;
    return p;
  }
  // de la partida guardada: o un héroe válido o un error (nunca uno a medias). Lo que venga roto se queda en su valor de salida:
  // sin rareza (o con una que no existe), Común; unas cifras fuera de margen, 1; una rama que no es suya, ninguna
  const rarezaGuardada = (datos, j) => (Number.isInteger(j.rareza) && datos.rarezas[j.rareza] ? j.rareza : 0);
  function cifrasGuardadas(datos, j) {
    const c = j.cifras || {};
    return { vida: cifraVale(datos, c.vida) ? c.vida : 1, dano: cifraVale(datos, c.dano) ? c.dano : 1 };
  }
  function marcasGuardadas(datos, j) {
    const marcas = {};
    for (const k in (j.marcas || {})) if (datos.clases[k] && j.marcas[k] > 0) marcas[k] = Math.floor(j.marcas[k]);
    return marcas;
  }
  // las cartas que existen, sin repetir; un ser cuya clave y padres existen (si no, ninguno)
  function cartasGuardadas(datos, j) {
    const cartas = Array.isArray(j.cartas) ? j.cartas : [];
    return cartas.filter((c, i) => typeof c === 'string' && datos.legendarios.cartas[c] && cartas.indexOf(c) === i);
  }
  function serGuardado(datos, j) {
    const L = datos.legendarios, s = j.ser;
    if (!s || typeof s.clave !== 'string' || !L.seres[s.clave] || !Array.isArray(s.padres) || s.padres.length !== 2) return null;
    if (!s.padres.every(p => typeof p === 'string' && L.lista[p])) return null;
    return { clave: s.clave, padres: s.padres.slice() };
  }
  // un dios que existe (si no, ninguno)
  const diosGuardado = (datos, j) => (typeof j.dios === 'string' && datos.dioses && Object.hasOwn(datos.dioses.lista, j.dios) ? j.dios : null);
  // legendario solo si lo es de verdad: un ser o un dios, o ascendido y con el nivel de legendario
  const legendarioGuardado = (datos, j, rama, ser, dios) => !!ser || !!dios || (j.legendario === true && !!rama && j.nivel >= datos.legendarios.nivel);
  function deJSON(datos, j) {
    if (!j) return AS.error('heroe-desconocido', { tipo: undefined });
    const r = crea(datos, j.id, j.tipo, j.nivel, j.dorado, rarezaGuardada(datos, j));
    if (!r.ok) return r;
    const rama = j.rama && clases(datos, r.valor).includes(j.rama) ? j.rama : null, ser = serGuardado(datos, j), dios = diosGuardado(datos, j);
    return AS.ok(con(r.valor, { cifras: cifrasGuardadas(datos, j), marcas: marcasGuardadas(datos, j), rama, cartas: cartasGuardadas(datos, j), ser, dios,
      legendario: legendarioGuardado(datos, j, rama, ser, dios) }));
  }
  return { crea, con, conCifras, conCarta, tiene, clases, absorbe, huecos, improntas, herencias, puedeAscender, asciende, puntos, deJSON };
})();
