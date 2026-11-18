// Fans of Asalto · DOMINIO · Un héroe de la partida: qué Animal Loco es, su nivel, su rareza (0 Común… 4 Mítico; multiplica sus cifras), sus cifras propias
// (con cuánta vida y daño de más o de menos le tocó llegar), sus huecos de impronta, las marcas de los que ha absorbido (de ahí salen
// sus herencias), la rama que eligió al ascender y si es un Animal Dorado. Es un valor congelado: absorber o ascender devuelve otro.
// Las reglas: el que absorbe suma los niveles del absorbido, se queda con la rareza más alta de los dos y gana una marca de su clase principal (más las marcas que ya traía);
// con nivel 5 o más puede ascender a una de sus dos clases, una sola vez.
'use strict';
AS.heroe = (() => {
  const congela = h => { Object.freeze(h.marcas); Object.freeze(h.cifras); return Object.freeze(h); };
  const SIN_CIFRAS = () => ({ vida: 1, dano: 1 });
  // una cifra propia vale si está dentro del margen de los ajustes (con margen 10: de 0,9 a 1,1)
  const cifraVale = (datos, v) => Number.isFinite(v) && Math.abs(v - 1) <= datos.niveles.margen / 100 + 1e-9;

  function crea(datos, id, tipo, nivel = 1, dorado = false, rareza = 0) {
    if (!datos.heroes[tipo]) return AS.error('heroe-desconocido', { tipo });
    if (!(nivel >= 1)) return AS.error('nivel-invalido', { nivel });
    if (!Number.isInteger(rareza) || !datos.rarezas[rareza]) return AS.error('rareza-desconocida', { rareza });
    return AS.ok(congela({ id, tipo, nivel: Math.floor(nivel), rareza, cifras: SIN_CIFRAS(), marcas: {}, rama: null, dorado: !!dorado }));
  }
  // el mismo héroe con sus cifras propias: { vida, dano }, cada una un multiplicador dentro del margen
  function conCifras(datos, h, cifras) {
    if (!cifras || !cifraVale(datos, cifras.vida) || !cifraVale(datos, cifras.dano)) return AS.error('cifras-fuera-de-margen');
    return AS.ok(congela({ ...h, marcas: { ...h.marcas }, cifras: { vida: cifras.vida, dano: cifras.dano } }));
  }
  const clases = (datos, h) => datos.heroes[h.tipo].clases;
  // el que queda: suma niveles y marcas (una de la clase principal del absorbido, más las que este traía)
  function absorbe(datos, h, otro) {
    if (h.id === otro.id) return AS.error('a-si-mismo');
    const marcas = { ...h.marcas };
    for (const k in otro.marcas) marcas[k] = (marcas[k] || 0) + otro.marcas[k];
    const principal = clases(datos, otro)[0];
    marcas[principal] = (marcas[principal] || 0) + 1;
    return AS.ok(congela({ ...h, cifras: { ...h.cifras }, nivel: h.nivel + otro.nivel, rareza: Math.max(h.rareza, otro.rareza), marcas, dorado: h.dorado || otro.dorado }));
  }
  // cuántos huecos de impronta tiene abiertos por su nivel (1, 2 al nivel 5 y 3 al nivel 10)
  const huecos = (datos, h) => datos.niveles.huecos.filter(n => h.nivel >= n).length;
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
    return AS.ok(congela({ ...h, cifras: { ...h.cifras }, marcas: { ...h.marcas }, rama: clase }));
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
  function deJSON(datos, j) {
    if (!j) return AS.error('heroe-desconocido', { tipo: undefined });
    const r = crea(datos, j.id, j.tipo, j.nivel, j.dorado, rarezaGuardada(datos, j));
    if (!r.ok) return r;
    const rama = j.rama && clases(datos, r.valor).includes(j.rama) ? j.rama : null;
    return AS.ok(congela({ ...r.valor, cifras: cifrasGuardadas(datos, j), marcas: marcasGuardadas(datos, j), rama }));
  }
  return { crea, conCifras, clases, absorbe, huecos, improntas, herencias, puedeAscender, asciende, puntos, deJSON };
})();
