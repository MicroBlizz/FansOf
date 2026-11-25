// Fans of Asalto · DOMINIO · El poder de un héroe en la batalla: sus cifras de base (ajustes), por su nivel y su rareza, sus herencias, la rama de
// su ascenso, el equipo puesto (en % para todos), las reliquias de la partida, los objetos de la tienda, las clases activas del campo y, si es legendario,
// lo suyo (conLegendario). Devuelve las cifras ya
// hechas con las que la batalla crea su unidad. Puro: solo cuentas.
'use strict';
AS.poder = (() => {
  // lo que suma cada herencia, por grado, a los multiplicadores
  const HERENCIA = {
    vida: (m, v) => { m.vida *= 1 + v; }, dano: (m, v) => { m.dano *= 1 + v; }, critico: (m, v) => { m.critico += v; }, prisa: (m, v) => { m.prisa *= 1 + v; },
    salpica: (m, v) => { m.salpica += v; }, regenera: (m, v) => { m.regenera += v * 100; }, roba: (m, v) => { m.roba += v; },
  };
  // lo que da cada rama del ascenso (su bonus: la vida, en tanto de más; lo demás se suma)
  const BONO_RAMA = Object.freeze({ tanque: { vida: 0.4 }, luchador: { torbellino: 56 }, asesino: { critico: 0.25, danoCrit: 1 }, tirador: { dobleTiro: 0.6 },
    mago: { estalla: 64 }, sanador: { curaArea: 0.5 }, brujo: { maldice: 4 } });
  function conRama(m, rama) {
    const b = BONO_RAMA[rama];
    for (const k in b) { if (k === 'vida') m.vida *= 1 + b.vida; else m[k] = (m[k] || 0) + b[k]; }
    if (rama === 'tanque') m.provoca = true;
  }
  // tarea #156, el dios «direccion»: el bonus de rama de una unidad de la batalla, ya hecha, otra vez (`veces` = 2: el doble de su bonus).
  // La vida pasa de ×(1 + bono) a ×(1 + veces·bono) y lo que se suma se suma (veces − 1) veces más; el mago, un área `veces` más grande
  function doblaRama(u, veces) {
    const b = BONO_RAMA[u.rama], extra = veces - 1;
    if (!b || extra <= 0) return;
    for (const k in b) {
      if (k === 'vida') { const f = (1 + veces * b.vida) / (1 + b.vida); u.max = Math.round(u.max * f); u.vida = Math.round(u.vida * f); }
      else if (k === 'estalla') u.area = Math.max(u.area, b.estalla * veces);
      else u[k] += b[k] * extra;
    }
  }
  // las reliquias que cambian las cifras de un héroe; cada una mira sus clases
  const RELIQUIA = {
    coraza: m => { m.vida *= 1.25; }, zelote: m => { m.dano *= 1.1; }, botas: m => { m.paso *= 1.35; },
    mortal: m => { m.critico += 0.15; }, reflejo: m => { m.reflejo += 0.1; },
    tenacidad: (m, cl) => { if (cl.includes('luchador')) m.vida *= 1.25; },
    esprint: (m, cl) => { if (cl.includes('asesino')) { m.prisa *= 1.3; m.paso *= 1.3; } },
    espinas: (m, cl) => { if (cl.includes('tanque')) m.reflejo += 0.2; },
    escondite: (m, cl) => { if (cl.includes('sanador')) m.esquiva = 0.3; },
  };
  // lo que suma un objeto de la tienda (v en %; w, la segunda cifra si la tiene), según su stat. Los de `ex` son lo que el héroe hace al
  // pegar, al curar o al recibir (la batalla los lee en batalla-objetos.js). k: { ctx, h } para los que miran la partida o al héroe
  const ex = (clave, div) => (m, v) => { m.ex[clave] = (m.ex[clave] || 0) + v / (div || 100); };
  const vidaYDano = (m, p) => { m.vida *= 1 + p / 100; m.dano *= 1 + p / 100; };
  const OBJETO = {
    vida: (m, v) => { m.vida *= 1 + v / 100; }, dano: (m, v) => { m.dano *= 1 + v / 100; }, prisa: (m, v) => { m.prisa *= 1 + v / 100; },
    critico: (m, v) => { m.critico += v / 100; }, defensa: (m, v) => { m.defensa += v / 100; }, reflejo: (m, v) => { m.reflejo += v / 100; },
    danoCrit: (m, v) => { m.danoCrit += v / 100; }, regenera: (m, v) => { m.regenera += v; }, todo: vidaYDano,
    roba: (m, v) => { m.roba += v; }, esquiva: (m, v) => { m.esquiva += v / 100; }, salpica: (m, v) => { m.salpica += v; },
    tambor: (m, v) => { m.prisa *= 1 + v / 100; m.paso *= 1 + v / 100; }, ojo: (m, v, w) => { m.critico += v / 100; m.danoCrit += w / 100; },
    plomo: (m, v, w, k) => { m.vida *= 1 + v / 100; m.paso *= k.datos.efectosObjetos.plomo; },
    cetro: (m, v, w, k) => { if (k.h.rareza >= 2) vidaYDano(m, v); },
    bandera: (m, v, w, k) => vidaYDano(m, v * (k.ctx.distintas || 0)),
    becario: (m, v, w, k) => { m.dano *= 1 + Math.min(v, (k.ctx.ganadas || 0) * k.datos.efectosObjetos.becario) / 100; },
    primero: ex('primero'), primeroCrit: ex('primeroCrit'), quema: ex('quema'), envenena: ex('envenena'), atonta: ex('atonta'), frena: ex('frena'),
    cadena: ex('cadena', 1), espejo: ex('espejo'), lupa: ex('lupa'), rabia: ex('rabia'), vela: ex('vela'), cura: ex('cura'),
  };
  // los objetos comprados: [{ id, nivel }]; los que piden clase, solo a los héroes que la tienen. Los de `efecto` no tocan las cifras
  function conObjetos(datos, m, cl, k) {
    for (const o of (k.ctx.objetos || [])) {
      const d = datos.objetos[o.id], i = o.nivel - 1;
      if (d && d.stat && (!d.clases || d.clases.some(c => cl.includes(c)))) OBJETO[d.stat](m, d.v[i], d.w ? d.w[i] : 0, k);
    }
  }
  const base = () => ({ vida: 1, dano: 1, prisa: 1, paso: 1, defensa: 0, critico: 0, danoCrit: 0, reflejo: 0, esquiva: 0, salpica: 0, regenera: 0, roba: 0, ex: {} });

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
  // tarea #109: lo que da ser legendario (efectos en batalla-legendarios.js). La cumbre de cada rama que tiene (la suya; un ser, las de
  // sus dos padres), sus habilidades y sus cartas. Un ser es más grande y fuerte; Bastión da reflejo, Gigante vida y escala, Sed robo de vida.
  // Tarea #156: un dios no tiene cumbres ni habilidades (solo su poder divino, `dios`: batalla-dioses.js) y es aún más grande y fuerte
  function grado(datos, h, info) {
    if (h.dios) return { cumbres: [], habilidades: [], escala: datos.dioses.escala, mult: datos.dioses.mult };
    if (h.ser) return { cumbres: info.cumbres, habilidades: info.habilidades, escala: datos.legendarios.ser.escala, mult: datos.legendarios.ser.mult };
    return { cumbres: [h.rama].filter(Boolean), habilidades: info ? [info.habilidad] : [], escala: 1, mult: 1 };
  }
  function conLegendario(datos, h, m) {
    if (!AS.legendario.es(datos, h)) return null;
    const E = datos.legendarios.efectos, gr = grado(datos, h, AS.legendario.datosDe(datos, h));
    let escala = gr.escala;
    m.vida *= gr.mult; m.dano *= gr.mult;
    if (gr.cumbres.includes('tanque')) m.reflejo += E.bastion.reflejo;
    if (h.cartas.includes('gigante')) { m.vida *= E.gigante.vida; escala *= E.gigante.escala; }
    if (h.cartas.includes('sed')) m.roba += E.sed;
    return { legendario: true, serClave: h.ser ? h.ser.clave : null, dios: h.dios || null, cumbres: Object.freeze(gr.cumbres.slice()), habilidades: Object.freeze(gr.habilidades.slice()),
      cartas: Object.freeze(h.cartas.slice()), escala };
  }
  // ctx: { equipo: { vida: 5, ataque: 2… } en %, reliquias: ['zelote'…], objetos: [{ id, nivel }] (los de la tienda), nivel: { tanque: 1… } (las clases activas),
  // ganadas (oleadas ganadas en la partida), distintas (clases distintas en el campo) }
  // lo que solo traen algunos (por reliquias, ramas u objetos de la tienda; `ex`, lo que lee batalla-objetos.js): si no, 0 o vacío
  const extras = m => ({ provoca: !!m.provoca, torbellino: m.torbellino || 0, dobleTiro: m.dobleTiro || 0, curaArea: m.curaArea || 0, maldice: m.maldice || 0,
    ex: Object.freeze({ ...m.ex }) });
  function deHeroe(datos, h, ctx) {
    const d = datos.heroes[h.tipo], cl = d.clases, m = base(), c = ctx || {};
    const sube = 1 + datos.niveles.porNivel * (h.nivel - 1);
    const fuerza = sube * (h.dorado ? 1.25 : 1) * datos.rarezas[h.rareza].mult;
    m.vida *= fuerza; m.dano *= fuerza;
    const g = AS.heroe.herencias(datos, h);
    for (const k in g) { const her = datos.herencias[k]; HERENCIA[her.stat](m, her.v * g[k] / 100); }
    if (h.rama) conRama(m, h.rama);
    conEquipo(m, c.equipo);
    for (const r of (c.reliquias || [])) if (RELIQUIA[r]) RELIQUIA[r](m, cl);
    conObjetos(datos, m, cl, { ctx: c, h, datos });
    conClases(datos, m, cl, c.nivel);
    const leg = conLegendario(datos, h, m);
    return Object.freeze({
      tipo: h.tipo, vida: Math.round(d.vida * m.vida * h.cifras.vida), dano: d.dano * m.dano * h.cifras.dano, cada: d.cada / m.prisa, alcance: d.alcance, vel: d.vel * m.paso,
      area: Math.max(d.area || 0, m.estalla || 0), ataque: d.ataque, salto: !!d.salto, clases: cl, rama: h.rama, improntas: Object.freeze(AS.heroe.improntas(datos, h)), dorado: h.dorado, nivel: h.nivel, rareza: h.rareza,
      defensa: Math.min(0.7, m.defensa), critico: m.critico, danoCrit: m.danoCrit, reflejo: m.reflejo, esquiva: m.esquiva, salpica: m.salpica, regenera: m.regenera, roba: m.roba,
      ...extras(m), ...leg,
    });
  }
  // los stats que entiende un objeto de la tienda (para comprobar los ajustes)
  const STATS = Object.freeze(Object.keys(OBJETO));
  return { deHeroe, doblaRama, STATS };
})();
