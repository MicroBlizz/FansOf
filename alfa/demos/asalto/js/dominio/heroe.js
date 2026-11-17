// Fans of Asalto · DOMINIO · Un héroe de la partida: qué Animal Loco es, su nivel, las marcas de los que ha absorbido (de ahí salen
// sus herencias), la rama que eligió al ascender y si es un Animal Dorado. Es un valor congelado: absorber o ascender devuelve otro.
// Las reglas: el que absorbe suma los niveles del absorbido y una marca de su clase principal (más las marcas que ya traía);
// con nivel 5 o más puede ascender a una de sus dos clases, una sola vez.
'use strict';
AS.heroe = (() => {
  const congela = h => { Object.freeze(h.marcas); return Object.freeze(h); };

  function crea(datos, id, tipo, nivel = 1, dorado = false) {
    if (!datos.heroes[tipo]) return AS.error('heroe-desconocido', { tipo });
    if (!(nivel >= 1)) return AS.error('nivel-invalido', { nivel });
    return AS.ok(congela({ id, tipo, nivel: Math.floor(nivel), marcas: {}, rama: null, dorado: !!dorado }));
  }
  const clases = (datos, h) => datos.heroes[h.tipo].clases;
  // el que queda: suma niveles y marcas (una de la clase principal del absorbido, más las que este traía)
  function absorbe(datos, h, otro) {
    if (h.id === otro.id) return AS.error('a-si-mismo');
    const marcas = { ...h.marcas };
    for (const k in otro.marcas) marcas[k] = (marcas[k] || 0) + otro.marcas[k];
    const principal = clases(datos, otro)[0];
    marcas[principal] = (marcas[principal] || 0) + 1;
    return AS.ok(congela({ ...h, nivel: h.nivel + otro.nivel, marcas, dorado: h.dorado || otro.dorado }));
  }
  // los grados de cada herencia: { clase: grado }
  function herencias(datos, h) {
    const N = datos.niveles, g = {};
    for (const k in h.marcas) { const grado = Math.min(N.tope, Math.floor(h.marcas[k] / N.marcas)); if (grado > 0) g[k] = grado; }
    return g;
  }
  const puedeAscender = (datos, h) => !h.rama && h.nivel >= datos.niveles.ascenso;
  function asciende(datos, h, clase) {
    if (h.rama) return AS.error('ya-ascendido');
    if (h.nivel < datos.niveles.ascenso) return AS.error('nivel-bajo', { hace_falta: datos.niveles.ascenso });
    if (!clases(datos, h).includes(clase)) return AS.error('clase-ajena', { clase });
    return AS.ok(congela({ ...h, marcas: { ...h.marcas }, rama: clase }));
  }
  // los puntos de clase que da en el campo: 1 a cada una de sus dos clases y 2 a la de su rama
  function puntos(datos, h) {
    const p = {};
    for (const k of clases(datos, h)) p[k] = k === h.rama ? 2 : 1;
    return p;
  }
  // de la partida guardada: o un héroe válido o un error (nunca uno a medias)
  function deJSON(datos, j) {
    const r = crea(datos, j && j.id, j && j.tipo, j && j.nivel, j && j.dorado);
    if (!r.ok) return r;
    const marcas = {};
    for (const k in (j.marcas || {})) if (datos.clases[k] && j.marcas[k] > 0) marcas[k] = Math.floor(j.marcas[k]);
    const rama = j.rama && clases(datos, r.valor).includes(j.rama) ? j.rama : null;
    return AS.ok(congela({ ...r.valor, marcas, rama }));
  }
  return { crea, clases, absorbe, herencias, puedeAscender, asciende, puntos, deJSON };
})();
