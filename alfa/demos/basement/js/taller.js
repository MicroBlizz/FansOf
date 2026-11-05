// Fans of Basement · Taller (dominio): con los materiales que traes de los muebles rotos fabricas el arma o la pieza de equipo que
// quieras, sin azar, subes de nivel tus armas y fabricas accesorios para tus compañeros. Una receta es { tipo: 'arma', id },
// { tipo: 'equipo', hueco, rareza } o { tipo: 'accesorio', id } (se pueden fabricar varios: cada uno lo lleva un compañero). Lo que
// cuesta depende de la rareza (ajustes.js, taller); mejorar un arma cuesta una parte de fabricarla por el nivel que ya tiene.
// Las reglas devuelven BAS.ok(progreso nuevo) o BAS.error(codigo).
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const escala = (coste, k) => Object.fromEntries(Object.entries(coste).map(([t, n]) => [t, Math.max(1, Math.round(n * k))]));

  // Qué se haría con esa receta (fabricar o mejorar) y cuánto cuesta; o el error si no se puede.
  B.recetaTaller = function (AJ, p, r) {
    if (r && r.tipo === 'arma') return recetaArma(AJ, p, r.id);
    if (r && r.tipo === 'equipo') return recetaEquipo(AJ, p, r.hueco, r.rareza);
    if (r && r.tipo === 'accesorio') return AJ.accesorios[r.id] ? B.ok({ accion: 'fabricar', coste: AJ.accesorios[r.id].coste }) : B.error('accesorioDesconocido', { id: r.id });
    return B.error('recetaDesconocida');
  };
  function recetaArma(AJ, p, id) {
    const d = AJ.armas[id];
    if (!d || !d.rareza) return B.error('armaDesconocida', { id });
    const nivel = p.armas[id] || 0, base = AJ.taller.fabricar[d.rareza];
    if (!nivel) return B.ok({ accion: 'fabricar', coste: base });
    if (nivel >= AJ.nivelArma.max) return B.error('nivelMaximo', { id });
    return B.ok({ accion: 'mejorar', coste: escala(base, AJ.taller.mejora * nivel), nivel });
  }
  function recetaEquipo(AJ, p, hueco, rareza) {
    if (!AJ.equipo[hueco] || !AJ.equipo[hueco][rareza]) return B.error('piezaDesconocida', { hueco, rareza });
    if (p.equipo.tiene[hueco + ':' + rareza]) return B.error('yaLaTienes', { hueco, rareza });
    return B.ok({ accion: 'fabricar', coste: AJ.taller.fabricar[rareza] });
  }

  // Lo que falta de cada material para pagar `coste` (vacío si llega).
  B.faltaMaterial = (p, coste) => Object.fromEntries(Object.entries(coste).filter(([t, n]) => (p.materiales[t] || 0) < n).map(([t, n]) => [t, n - (p.materiales[t] || 0)]));

  // Lo que te llevas de cada tipo de receta (q = el progreso nuevo, ya pagado).
  const ENTREGA = {
    arma(AJ, p, q, r) {
      const mejor = !p.armas[r.id] && B.armaMejor(AJ, q, r.id, 1);
      q.armas[r.id] = (q.armas[r.id] || 0) + 1;
      if (mejor) q.arma = r.id;   // nueva y mejor que la que llevas: te la pones
    },
    equipo(AJ, p, q, r) {
      q.equipo.tiene[r.hueco + ':' + r.rareza] = true;
      const puesta = q.equipo.puesto[r.hueco];
      if (!puesta || AJ.rarezas.indexOf(puesta) < AJ.rarezas.indexOf(r.rareza)) q.equipo.puesto[r.hueco] = r.rareza;
    },
    accesorio(AJ, p, q, r) { q.accesorios[r.id] = (q.accesorios[r.id] || 0) + 1; },
  };

  // Fabrica o mejora: paga los materiales y te da el arma (o el nivel) o la pieza. Lo nuevo te lo pones si es mejor que lo que llevas.
  B.usarTaller = function (AJ, p, r) {
    const rec = B.recetaTaller(AJ, p, r);
    if (!rec.ok) return rec;
    const falta = B.faltaMaterial(p, rec.valor.coste);
    if (Object.keys(falta).length) return B.error('faltanMateriales', falta);
    const q = B.copiaProgreso(p);
    for (const [t, n] of Object.entries(rec.valor.coste)) q.materiales[t] -= n;
    ENTREGA[r.tipo](AJ, p, q, r);
    return B.ok(q);
  };
})(BAS);
