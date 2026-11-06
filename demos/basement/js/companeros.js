// Fans of Basement · Compañeros (dominio): como en Well Diver, lo que capturas puede venir contigo. Llevas hasta dos bichos del
// terrario (además de la mascota) que disparan solos a tu lado. Cada especie sube de nivel 1 a 5 con más capturas suyas en el
// terrario y materiales, y cada nivel le abre un talento (los del 2 y el 4, para todos; los del 3 y el 5, propios de su especie).
// Cada uno lleva un accesorio fabricado en el taller. Cifras en ajustes.js (companeros, accesorios).
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const C = (AJ) => AJ.companeros;
  B.nivelCompanero = (AJ, p, id) => (p.terrario[id] > 0 ? Math.max(1, p.companeros[id] || 1) : 0);

  // Los talentos de una especie, nivel a nivel ([{ nivel, nombre, ef?, bala?, aura? }]).
  B.talentosCompanero = function (AJ, id) {
    const E = C(AJ).especies[id], K = C(AJ).comunes;
    return [{ nivel: 1, nombre: 'Compañero' }, { nivel: 2, ...K[2] }, { nivel: 3, ...E.t3 }, { nivel: 4, ...K[4] }, { nivel: 5, ...E.t5 }];
  };

  // Lo que cuesta subir del nivel n al n + 1: capturas en el terrario y materiales.
  B.costeSubirCompanero = function (AJ, n) {
    const S = C(AJ).subir, mat = { tornillo: S.tornillo * n, cable: S.cable * n };
    if (n >= C(AJ).chipDesde) mat.chip = n;
    return { capturas: C(AJ).capturas[n], materiales: mat };
  };

  B.subirCompanero = function (AJ, p, id) {
    if (!C(AJ).especies[id]) return B.error('companeroDesconocido', { id });
    const n = B.nivelCompanero(AJ, p, id);
    if (!n) return B.error('sinCapturar', { id });
    if (n >= 5) return B.error('nivelMaximo', { id });
    const c = B.costeSubirCompanero(AJ, n);
    if ((p.terrario[id] || 0) < c.capturas) return B.error('faltanCapturas', { faltan: c.capturas - (p.terrario[id] || 0) });
    const falta = B.faltaMaterial(p, c.materiales);
    if (Object.keys(falta).length) return B.error('faltanMateriales', falta);
    const q = B.copiaProgreso(p);
    for (const [t, k] of Object.entries(c.materiales)) q.materiales[t] -= k;
    q.companeros[id] = n + 1;
    return B.ok(q);
  };

  // Llevarlo o dejarlo en el terrario.
  B.llevarCompanero = function (AJ, p, id) {
    if (!B.nivelCompanero(AJ, p, id)) return B.error('sinCapturar', { id });
    const q = B.copiaProgreso(p);
    if (q.compEquipados.includes(id)) { q.compEquipados = q.compEquipados.filter((x) => x !== id); return B.ok(q); }
    if (q.compEquipados.length >= C(AJ).huecos) return B.error('sinHueco');
    q.compEquipados.push(id);
    return B.ok(q);
  };

  // Ponerle un accesorio (se fabrican en el taller, taller.js) a un compañero (null = quitárselo). Cada accesorio fabricado lo lleva uno solo.
  const usados = (p, acc, menos) => Object.entries(p.accComp).filter(([c, a]) => a === acc && c !== menos).length;
  B.accesorioLibre = (p, acc, comp) => (p.accesorios[acc] || 0) > usados(p, acc, comp);
  B.ponerAccesorio = function (AJ, p, comp, acc) {
    if (!B.nivelCompanero(AJ, p, comp)) return B.error('sinCapturar', { id: comp });
    if (acc != null && !AJ.accesorios[acc]) return B.error('accesorioDesconocido', { acc });
    if (acc != null && !B.accesorioLibre(p, acc, comp)) return B.error('noLoTienes', { acc });
    const q = B.copiaProgreso(p);
    if (acc == null) delete q.accComp[comp]; else q.accComp[comp] = acc;
    return B.ok(q);
  };

  // Un compañero listo para la bajada: su ataque con sus talentos y su accesorio (y el aura que te da a ti).
  const suma = (a, b) => { for (const [k, v] of Object.entries(b || {})) a[k] = (a[k] || 0) + v; return a; };
  B.companeroDe = function (AJ, p, id, danoBase) {
    const E = C(AJ).especies[id], n = B.nivelCompanero(AJ, p, id), ef = {}, aura = {}, bala = {};
    for (const t of B.talentosCompanero(AJ, id).filter((x) => x.nivel <= n)) { suma(ef, t.ef); suma(aura, t.aura); Object.assign(bala, t.bala); }
    const acc = AJ.accesorios[p.accComp[id]];
    if (acc) { suma(ef, acc.ef); suma(aura, acc.aura); }
    return Object.freeze({ id, nivel: n, dano: Math.round(danoBase * E.dano * (1 + (ef.dano || 0)) * 10) / 10, cadencia: E.cadencia * (1 - Math.min(0.6, ef.cadencia || 0)),
      alcance: E.alcance + (ef.alcance || 0), bala: Object.freeze(bala), aura: Object.freeze(aura) });
  };
})(BAS);
