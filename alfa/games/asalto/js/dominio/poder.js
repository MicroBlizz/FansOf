// Fans of Asalto · DOMINIO · El poder de un héroe en la batalla: sus cifras de base (ajustes), por su nivel y su rareza, sus herencias, la rama de
// su ascenso, el equipo puesto (en % para todos), las reliquias de la partida, los objetos de la tienda y las clases activas del campo. Devuelve las cifras ya
// hechas con las que la batalla crea su unidad. Puro: solo cuentas.
'use strict';
AS.poder = (() => {
  // lo que suma cada herencia, por grado, a los multiplicadores
  const HERENCIA = {
    vida: (m, v) => { m.vida *= 1 + v; }, dano: (m, v) => { m.dano *= 1 + v; }, critico: (m, v) => { m.critico += v; }, prisa: (m, v) => { m.prisa *= 1 + v; },
    salpica: (m, v) => { m.salpica += v; }, regenera: (m, v) => { m.regenera += v * 100; }, roba: (m, v) => { m.roba += v; },
  };
  // lo que da cada rama del ascenso
  const RAMA = {
    tanque: m => { m.vida *= 1.4; m.provoca = true; },
    luchador: m => { m.torbellino = 56; },
    asesino: m => { m.critico += 0.25; m.danoCrit += 1; },
    tirador: m => { m.dobleTiro = 0.6; },
    mago: m => { m.estalla = 64; },
    sanador: m => { m.curaArea = 0.5; },
    brujo: m => { m.maldice = 4; },
  };
  // las reliquias que cambian las cifras de un héroe; cada una mira sus clases
  const RELIQUIA = {
    coraza: m => { m.vida *= 1.25; }, zelote: m => { m.dano *= 1.1; }, botas: m => { m.paso *= 1.35; },
    mortal: m => { m.critico += 0.15; }, reflejo: m => { m.reflejo += 0.1; },
    tenacidad: (m, cl) => { if (cl.includes('luchador')) m.vida *= 1.25; },
    esprint: (m, cl) => { if (cl.includes('asesino')) { m.prisa *= 1.3; m.paso *= 1.3; } },
    espinas: (m, cl) => { if (cl.includes('tanque')) m.reflejo += 0.2; },
    escondite: (m, cl) => { if (cl.includes('sanador')) m.esquiva = 0.3; },
  };
  // lo que suma un objeto de la tienda (v en %), según su stat
  const OBJETO = {
    vida: (m, v) => { m.vida *= 1 + v / 100; }, dano: (m, v) => { m.dano *= 1 + v / 100; }, prisa: (m, v) => { m.prisa *= 1 + v / 100; },
    critico: (m, v) => { m.critico += v / 100; }, defensa: (m, v) => { m.defensa += v / 100; }, reflejo: (m, v) => { m.reflejo += v / 100; },
    danoCrit: (m, v) => { m.danoCrit += v / 100; }, regenera: (m, v) => { m.regenera += v; }, todo: (m, v) => { m.vida *= 1 + v / 100; m.dano *= 1 + v / 100; },
  };
  // los objetos comprados: [{ id, nivel }]; los que piden clase, solo a los héroes que la tienen
  function conObjetos(datos, m, cl, objetos) {
    for (const o of (objetos || [])) {
      const d = datos.objetos[o.id];
      if (d && (!d.clases || d.clases.some(k => cl.includes(k)))) OBJETO[d.stat](m, d.v[o.nivel - 1]);
    }
  }
  const base = () => ({ vida: 1, dano: 1, prisa: 1, paso: 1, defensa: 0, critico: 0, danoCrit: 0, reflejo: 0, esquiva: 0, salpica: 0, regenera: 0, roba: 0 });

  function conEquipo(m, E) {
    if (!E) return;
    m.vida *= 1 + (E.vida || 0) / 100; m.dano *= 1 + (E.ataque || 0) / 100; m.prisa *= 1 + (E.velAtaque || 0) / 100; m.paso *= 1 + (E.velMov || 0) / 100;
    m.defensa += (E.defensa || 0) / 100; m.critico += (E.critico || 0) / 100; m.danoCrit += (E.danoCrit || 0) / 100; m.reflejo += (E.reflejo || 0) / 100;
  }
  function conClases(datos, m, cl, nivel) {
    const v = k => (nivel && nivel[k] ? datos.clases[k].v[nivel[k] - 1] : 0);
    if (cl.includes('luchador')) m.dano *= 1 + v('luchador') / 100;
    if (cl.includes('tirador')) m.prisa *= 1 + v('tirador') / 100;
  }
  // ctx: { equipo: { vida: 5, ataque: 2… } en %, reliquias: ['zelote'…], objetos: [{ id, nivel }] (los de la tienda), nivel: { tanque: 1… } (las clases activas) }
  function deHeroe(datos, h, ctx) {
    const d = datos.heroes[h.tipo], cl = d.clases, m = base(), c = ctx || {};
    const sube = 1 + datos.niveles.porNivel * (h.nivel - 1);
    const fuerza = sube * (h.dorado ? 1.25 : 1) * datos.rarezas[h.rareza].mult;
    m.vida *= fuerza; m.dano *= fuerza;
    const g = AS.heroe.herencias(datos, h);
    for (const k in g) { const her = datos.herencias[k]; HERENCIA[her.stat](m, her.v * g[k] / 100); }
    if (h.rama) RAMA[h.rama](m);
    conEquipo(m, c.equipo);
    for (const r of (c.reliquias || [])) if (RELIQUIA[r]) RELIQUIA[r](m, cl);
    conObjetos(datos, m, cl, c.objetos);
    conClases(datos, m, cl, c.nivel);
    return Object.freeze({
      tipo: h.tipo, vida: Math.round(d.vida * m.vida * h.cifras.vida), dano: d.dano * m.dano * h.cifras.dano, cada: d.cada / m.prisa, alcance: d.alcance, vel: d.vel * m.paso,
      area: Math.max(d.area || 0, m.estalla || 0), ataque: d.ataque, salto: !!d.salto, clases: cl, rama: h.rama, improntas: Object.freeze(AS.heroe.improntas(datos, h)), dorado: h.dorado, nivel: h.nivel, rareza: h.rareza,
      defensa: Math.min(0.7, m.defensa), critico: m.critico, danoCrit: m.danoCrit, reflejo: m.reflejo, esquiva: m.esquiva, salpica: m.salpica, regenera: m.regenera, roba: m.roba,
      provoca: !!m.provoca, torbellino: m.torbellino || 0, dobleTiro: m.dobleTiro || 0, curaArea: m.curaArea || 0, maldice: m.maldice || 0,
    });
  }
  return { deHeroe };
})();
