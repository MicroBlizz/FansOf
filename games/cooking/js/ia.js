// Fans of Cooking · IA: el compañero de cocina (y los bots de las pruebas de equilibrio): lo que DECIDE. Cada paso mira la cocina y decide qué hacer
// con los pedidos, del más urgente al más nuevo: apagar fuegos, encender lo apagado, ir a por ingredientes, cortar, cocinar, emplatar, servir, lavar o mandar cosas por la
// cinta si lo que necesita está al otro lado. Camina por un camino (BFS) hasta la casilla de al lado del objetivo y pulsa COGER o USAR como una persona.
// Andar hasta el objetivo y pulsar está en ia-camino.js (se carga antes). Sin DOM: se prueba con Node. Las decisiones se recalculan cada pocos pasos.
'use strict';
const IA = (() => {
  const T = COOK.tile, { distancias, acceso, alcanzable, ruta } = IA_CAMINO;
  const estado = c => (c.ia && c.ia.espera !== undefined) ? c.ia : (c.ia = { plan: null, ruta: null, acc: null, t: 0, claim: null, espera: 0, ultimo: 0, huye: 0, mejor: 1e9, sinAvance: 0 });
  const tileDe = c => [Math.floor(c.x / T), Math.floor(c.y / T)];
  const esMulti = (sub, lista) => { const m = {}; for (const [a, b] of lista) m[a + ':' + b] = (m[a + ':' + b] || 0) + 1; for (const [a, b] of sub) { if (!m[a + ':' + b]) return false; m[a + ':' + b]--; } return true; };
  const resta = (lista, sub) => { const r = lista.slice(); for (const [a, b] of sub) { const i = r.findIndex(([x, y]) => x === a && y === b); if (i >= 0) r.splice(i, 1); } return r; };

  /* ---------- buscar cosas en la cocina ---------- */
  const casillas = P => P.tiles.flat();
  const lista = (P, f) => casillas(P).filter(f);
  const libre = t => (t.t === 'encimera' || t.t === 'tabla') && !t.item && !t.fuego;
  const masCerca = (D, ts) => { let m = null, md = 1e9; for (const t of ts) { const a = acceso(D, t); if (a && a.d < md) { md = a.d; m = t; } } return m; };
  const conItem = (P, f) => lista(P, t => t.item && t.t !== 'cinta' && f(t.item, t));   // lo que va por la cinta está en tránsito
  const esIng = (it, ing, est) => it.tipo === 'ing' && it.ing === ing && it.estado === est;
  const INGS = ing => INGREDIENTES[ing] || {};
  // el estado en que sale del cajón o de la tabla, y a dónde va luego, para un [ingrediente, estado final]
  function pasos(ing, est) {
    const I = INGS(ing), p = [];
    if (I.cortar) p.push('tabla');
    if (est === 'cocinado') p.push('fogon');
    return p;
  }

  /* ---------- qué hacer: devuelve { objetivo: tile, accion: 'coger'|'usar'|'lanzar', claim } o { espera } ---------- */
  function decide(P, c, D) {
    const otro = P.cocineros.find(o => o !== c), claimOtro = otro && otro.ia ? otro.ia.claim : null, m = c.item;
    const propio = (clave) => claimOtro !== clave;
    // 1. fuego: a por el extintor y a apagar
    const fuegos = lista(P, t => t.fuego && alcanzable(D, t));
    if (fuegos.length) {
      if (m && m.tipo === 'extintor') return { objetivo: masCerca(D, fuegos), accion: 'usar', claim: 'fuego' };
      const ext = conItem(P, (it, t) => it.tipo === 'extintor' && alcanzable(D, t));
      if (ext.length && propio('fuego')) { if (m) return soltar(P, c, D); return { objetivo: masCerca(D, ext), accion: 'coger', claim: 'fuego' }; }
    }
    if (m && m.tipo === 'extintor') { const sitio = lista(P, t => t.t === 'extintor' && !t.item && alcanzable(D, t)); if (sitio.length) return { objetivo: masCerca(D, sitio), accion: 'coger' }; return soltar(P, c, D); }
    // 2. lo apagado se enciende
    const apagados = lista(P, t => t.apagado && !t.fuego && alcanzable(D, t));
    if (apagados.length) return { objetivo: masCerca(D, apagados), accion: 'lanzar' };
    // 3. lo quemado, a la basura
    if (m && m.estado === 'quemado') { const b = lista(P, t => t.t === 'basura' && alcanzable(D, t)); if (b.length) return { objetivo: masCerca(D, b), accion: 'coger' }; }
    const quemados = conItem(P, (it, t) => it.estado === 'quemado' && (t.t === 'fogon' || t.t === 'horno' || t.t === 'olla') && !t.fuego && alcanzable(D, t));
    if (quemados.length && !m) return { objetivo: masCerca(D, quemados), accion: 'coger' };
    // 4. los pedidos, del más urgente al más nuevo: si con uno solo puedo esperar (se está cocinando), adelanto el siguiente
    const peds = P.pedidos.slice().sort((a, b) => a.t - b.t);
    if (!peds.length) return ocio(P, c, D);
    let primero = null;
    for (const ped of peds) { const r = pedido(P, c, D, ped); if (!r) continue; if (!r.espera) return r; if (!primero) primero = r; }
    return primero || ocio(P, c, D);
  }
  // qué hacer por un pedido concreto (o { espera } si por él no puedo hacer nada ahora)
  function pedido(P, c, D, ped) {
    const otro = P.cocineros.find(o => o !== c), claimOtro = otro && otro.ia ? otro.ia.claim : null, m = c.item, miClaim = c.ia ? c.ia.claim : null;
    // una tarea es mía si el otro no la tiene pedida; si los dos la pedimos a la vez, se la queda el cocinero 1 y el 2 cede (así no se intercambian sin parar)
    const propio = (clave) => claimOtro !== clave || (c.i === 0 && miClaim === clave);
    const R = RECETA[ped.receta], F = recetaFinal(R);
    // mi plato: en la mano o en una encimera a mi alcance, con cosas que valen para este pedido (el más completo)
    const platos = conItem(P, (it, t) => it.tipo === 'plato' && !it.sucio && esMulti(it.ings, F) && (t.t === 'encimera' || t.t === 'tabla' || t.t === 'suelo') && alcanzable(D, t)).sort((a, b) => b.item.ings.length - a.item.ings.length);
    const miPlatoEnMano = m && m.tipo === 'plato' && !m.sucio && esMulti(m.ings, F);
    const om = otro && otro.item, platoOtro = om && om.tipo === 'plato' && !om.sucio && esMulti(om.ings, F) ? { item: om, otro: true } : null;
    const plato = miPlatoEnMano ? { item: m, mano: true } : platos.length ? { item: platos[0].item, tile: platos[0] } : platoOtro;
    const faltan = plato ? resta(F, plato.item.ings) : F.slice();
    const vent = lista(P, t => t.t === 'ventanilla');
    // plato completo: a servir (o a la cinta si la ventanilla está al otro lado)
    if (plato && !faltan.length) {
      if (plato.otro) return ocio(P, c, D);   // lo lleva el otro: que lo sirva
      if (!plato.mano) { if (m) return soltar(P, c, D); return { objetivo: plato.tile, accion: 'coger' }; }
      const v = masCerca(D, vent); if (v) return { objetivo: v, accion: 'coger' };
      return enviar(P, c, D);
    }
    // si llevo algo que no es mi plato ni sirve para lo que falta: si vale para otro pedido, paso a ese; si no, lo dejo
    if (m && !miPlatoEnMano) {
      if (!sirvePara(m, R, faltan)) { if (P.pedidos.some(p2 => p2 !== ped && sirvePara(m, RECETA[p2.receta], recetaFinal(RECETA[p2.receta])))) return null; return soltar(P, c, D); }
    }
    // sopa: la olla
    if (R.olla) return sopa(P, c, D, R, plato, F);
    // receta normal sin plato todavía: primero el plato, que es la «base» en una encimera a la que van los ingredientes
    if (!plato && !R.horno && !R.olla && !m && propio('plato:' + ped.id)) {
      const algoListo = F.some(([ing, est]) => conItem(P, (it, t) => esIng(it, ing, est) && alcanzable(D, t)).length);
      if (algoListo) { const pl = platoLimpio(P, D); if (pl) return Object.assign(pl, { claim: 'plato:' + ped.id }); }
    }
    if (R.horno) return horneado(P, c, D, R, plato, F);
    // receta normal: cada ingrediente que falta, por orden; el otro bot no repite el mismo
    const tareas = faltan.map(([ing, est], i) => ({ ing, est, clave: ped.id + ':' + ing + ':' + faltan.slice(0, i).filter(([a]) => a === ing).length }));
    // primero lo que ya tenía pedido, luego lo que llevo en la mano: así no cambio de tarea a cada paso
    tareas.sort((a, b) => (b.clave === miClaim) - (a.clave === miClaim) || ((m && m.tipo === 'ing') ? (b.ing === m.ing) - (a.ing === m.ing) : 0));
    const listoYa = (ing, est) => conItem(P, (it, t) => esIng(it, ing, est) && alcanzable(D, t)).length > 0;
    for (const { ing, est, clave } of tareas) {
      // lo que ya está listo lo recoge quien lleva el plato, aunque lo preparase el otro
      if (!propio(clave) && !(plato && plato.mano && listoYa(ing, est))) continue;
      const r = ingrediente(P, c, D, ing, est, plato, clave); if (r) return r;
    }
    if (plato && plato.mano && m) return soltar(P, c, D);   // con el plato en la mano y nada que recoger: lo dejo y ayudo
    return ocio(P, c, D);
  }
  // ¿lo que llevo vale para esta receta (o para lo que le falta al plato)?
  function sirvePara(m, R, faltan) {
    if (m.tipo === 'ing') return faltan.some(([a, b]) => a === m.ing && (b === m.estado || pasos(m.ing, b).length)) || (!!R.olla && R.olla.includes(m.ing)) || (!!R.horno && R.ings.some(([a]) => a === m.ing));
    if (m.tipo === 'monton') return !!R.horno && esMulti(m.ings, R.ings);
    return false;
  }
  // consigue [ing, est] y llévalo al plato. Mira primero si ya hay uno listo o a medias.
  function ingrediente(P, c, D, ing, est, plato, clave) {
    const m = c.item, I = INGS(ing);
    // llevo justo ese ingrediente listo: al plato (si el plato está en la mano del otro, a una encimera)
    if (m && esIng(m, ing, est)) return alPlato(P, c, D, plato, clave);
    // listo en una estación (fogón) o en una encimera, tabla, suelo o cinta
    const listos = conItem(P, (it, t) => esIng(it, ing, est) && alcanzable(D, t) && !t.fuego);
    // el plato lo lleva el otro: lo que ya está listo lo recoge él; yo solo preparo lo que falte
    if (plato && plato.otro && listos.length) return { espera: true, claim: clave };
    // con el plato en la mano: si el ingrediente ya está listo en algún sitio, voy a recogerlo con el plato; si se está haciendo, espero al lado; si no, dejo el plato y lo preparo
    const cocinando = conItem(P, (it, t) => it.tipo === 'ing' && it.ing === ing && t.t === 'fogon' && it.estado !== 'cocinado' && it.estado !== 'quemado' && alcanzable(D, t));
    if (plato && plato.mano) {
      if (listos.length) return { objetivo: masCerca(D, listos), accion: 'coger', claim: clave };
      if (cocinando.length && est === 'cocinado') return { objetivo: masCerca(D, cocinando), accion: 'esperar', claim: clave };
      return null;   // nada que recoger de este: a ver el siguiente (y si no hay nada, pedido() deja el plato y ayuda)
    }
    const enEstacion = listos.filter(t => t.t === 'fogon' || t.t === 'olla' || t.t === 'horno'), sueltos = listos.filter(t => t.t !== 'fogon' && t.t !== 'olla' && t.t !== 'horno');
    if (enEstacion.length) {   // con el plato en la mano se recoge directamente
      if (plato && plato.mano) return { objetivo: masCerca(D, enEstacion), accion: 'coger', claim: clave };
      if (plato && plato.tile) { if (m) return soltar(P, c, D, clave); return { objetivo: plato.tile, accion: 'coger', claim: clave }; }
      if (!m && !plato) { const pl = platoLimpio(P, D); if (pl) return pl; }
      if (!m) return { objetivo: masCerca(D, enEstacion), accion: 'coger', claim: clave };
    }
    if (sueltos.length) {
      if (m) return soltar(P, c, D, clave);
      if (!plato && sueltos.every(t => t.t !== 'tabla')) return { espera: true, claim: clave };   // ya está listo en una encimera y no hay plato aún: se queda ahí hasta que llegue
      return { objetivo: masCerca(D, sueltos), accion: 'coger', claim: clave };
    }
    // a medias: cocinándose (espero), o crudo en la tabla (corto), o cortado y hay que cocinarlo
    if (cocinando.length && est === 'cocinado') {   // se está haciendo: voy a por el plato y espero al lado para sacarlo a tiempo
      if (plato && plato.mano) return { objetivo: masCerca(D, cocinando), accion: 'esperar', claim: clave };
      if (plato && plato.tile) { if (m) return soltar(P, c, D, clave); return { objetivo: plato.tile, accion: 'coger', claim: clave }; }
      if (!m && !plato) { const pl = platoLimpio(P, D); if (pl) return Object.assign(pl, { claim: clave }); }
      if (m) return soltar(P, c, D, clave);
      return { espera: true, claim: clave };
    }
    if (I.cortar) {
      const enTabla = conItem(P, (it, t) => t.t === 'tabla' && esIng(it, ing, 'crudo') && alcanzable(D, t));
      if (enTabla.length) { if (m) return soltar(P, c, D, clave); return { objetivo: masCerca(D, enTabla), accion: 'usar', claim: clave }; }
      const cortados = conItem(P, (it, t) => esIng(it, ing, 'cortado') && t.t !== 'fogon' && alcanzable(D, t));
      if (est === 'cocinado' && cortados.length) { if (m && !esIng(m, ing, 'cortado')) return soltar(P, c, D, clave); if (!m) return { objetivo: masCerca(D, cortados), accion: 'coger', claim: clave }; }
    }
    if (m && esIng(m, ing, 'cortado') && est === 'cocinado') return aEstacion(P, c, D, 'fogon', clave);
    if (m && esIng(m, ing, 'crudo')) {
      if (I.cortar) return aEstacion(P, c, D, 'tabla', clave);
      if (est === 'cocinado') return aEstacion(P, c, D, 'fogon', clave);
      return alPlato(P, c, D, plato, clave);
    }
    // empezar: uno crudo que ande suelto (llegado por la cinta, por ejemplo) o el cajón, con las manos vacías
    if (m) return soltar(P, c, D, clave);
    const crudos = conItem(P, (it, t) => esIng(it, ing, 'crudo') && t.t !== 'tabla' && t.t !== 'fogon' && t.t !== 'horno' && alcanzable(D, t));
    if (crudos.length) return { objetivo: masCerca(D, crudos), accion: 'coger', claim: clave };
    if (yaEnviados(P, c, D, ing) >= hacenFalta(P, ing)) return { espera: true, claim: clave };   // ya hay bastantes de ese al otro lado o de camino
    const cajones = lista(P, t => t.t === 'cajon' && t.ing === ing && alcanzable(D, t));
    if (cajones.length) return { objetivo: masCerca(D, cajones), accion: 'coger', claim: clave };
    return null;   // no está a mi alcance: que lo haga el otro
  }
  function aEstacion(P, c, D, tipo, clave) {
    const libres = lista(P, t => t.t === tipo && !t.item && !t.fuego && (tipo !== 'olla' || !t.ings.length || t.ings.length < 3) && alcanzable(D, t));
    if (libres.length) return { objetivo: masCerca(D, libres), accion: 'coger', claim: clave };
    const hay = lista(P, t => t.t === tipo);
    if (hay.length && !hay.some(t => alcanzable(D, t))) {   // está al otro lado: por la cinta (si no va ya de camino lo que piden)
      if (c.item && c.item.tipo === 'ing' && yaEnviados(P, c, D, c.item.ing) >= hacenFalta(P, c.item.ing)) return { espera: true, claim: clave };
      return enviar(P, c, D, clave);
    }
    if (tipo === 'tabla' && c.item) {   // la tabla está ocupada: si hay encimera libre dejo lo mío y corto lo que haya; si no, espero a que se libere
      const enc = lista(P, t => t.t === 'encimera' && !t.item && !t.fuego && alcanzable(D, t)); if (enc.length) return soltar(P, c, D, clave);
      const atascada = lista(P, t => t.t === 'tabla' && alcanzable(D, t)).every(t => t.item && t.item.estado !== 'crudo');
      return atascada ? soltar(P, c, D, clave) : { espera: true, claim: clave };
    }
    if (tipo === 'tabla' && !c.item) { const ocupadas = lista(P, t => t.t === 'tabla' && t.item && t.item.estado !== 'crudo' && alcanzable(D, t)); if (ocupadas.length) return { objetivo: masCerca(D, ocupadas), accion: 'coger', claim: clave }; }
    return { espera: true, claim: clave };
  }
  function alPlato(P, c, D, plato, clave) {
    if (plato && plato.otro) return soltar(P, c, D, clave);   // el plato lo lleva el otro: se lo dejo en una encimera y lo recoge
    if (plato && !plato.mano) return { objetivo: plato.tile, accion: 'coger', claim: clave };
    if (plato && plato.mano) return null;
    // no hay plato: dejo el ingrediente en una encimera y voy a por uno; si los platos están al otro lado, lo mando por la cinta
    const pl = platoLimpio(P, D); if (!pl) { const Pt = lista(P, t => t.t === 'platos' || t.t === 'fregadero'); if (Pt.length && !Pt.some(t => alcanzable(D, t))) return enviar(P, c, D, clave); }
    return soltar(P, c, D, clave);
  }
  function platoLimpio(P, D) {
    const sitios = lista(P, t => ((t.t === 'platos' && t.platos > 0) || (t.t === 'fregadero' && t.limpios > 0)) && alcanzable(D, t));
    if (sitios.length) return { objetivo: masCerca(D, sitios), accion: 'coger' };
    const sueltos = conItem(P, (it, t) => it.tipo === 'plato' && !it.sucio && !it.ings.length && alcanzable(D, t));
    if (sueltos.length) return { objetivo: masCerca(D, sueltos), accion: 'coger' };
    const lavar = lista(P, t => t.t === 'fregadero' && t.sucios > 0 && alcanzable(D, t));
    if (lavar.length) return { objetivo: masCerca(D, lavar), accion: 'usar' };
    return null;
  }
  function sopa(P, c, D, R, plato, F) {
    const m = c.item, ollas = lista(P, t => t.t === 'olla' && !t.fuego && alcanzable(D, t));
    const hecha = ollas.filter(t => t.item && t.item.ing === 'sopa' && t.item.estado === R.olla.slice().sort().join('+'));
    if (hecha.length) {
      if (plato && plato.mano) return { objetivo: masCerca(D, hecha), accion: 'coger' };
      if (m) return soltar(P, c, D);
      if (plato) return { objetivo: plato.tile, accion: 'coger' };
      return platoLimpio(P, D) || { espera: true };
    }
    const raras = ollas.filter(t => t.item && t.item.ing === 'sopa'); if (raras.length && !m) return { objetivo: masCerca(D, raras), accion: 'coger' };
    // qué falta en la olla (la que más tenga de esta receta)
    const olla = ollas.filter(t => !t.item && t.ings.every(([n]) => R.olla.includes(n))).sort((a, b) => b.ings.length - a.ings.length)[0];
    if (!olla) {   // la olla está al otro lado (o todas ocupadas con otra cosa)
      if (ollas.length) return { espera: true };
      if (m) {
        if (m.tipo === 'plato') return enviar(P, c, D, 'plato:cinta');
        if (m.tipo === 'ing' && R.olla.includes(m.ing)) { const est = INGS(m.ing).cortar ? 'cortado' : 'crudo', clave = 'cinta:' + m.ing; if (m.estado === est) return enviar(P, c, D, clave); return ingrediente(P, c, D, m.ing, est, null, clave) || soltar(P, c, D); }
        return soltar(P, c, D);
      }
      return mandarPlato(P, c, D, 'olla') || enviarIngs(P, c, D, R.olla.map(n => [n, INGS(n).cortar ? 'cortado' : 'crudo']), 'olla');
    }
    const faltan = R.olla.slice(); for (const [n] of olla.ings) { const i = faltan.indexOf(n); if (i >= 0) faltan.splice(i, 1); }
    const otro = P.cocineros.find(o => o !== c), claimOtro = otro && otro.ia ? otro.ia.claim : null;
    if (!faltan.length) return esperarCon(P, c, D, olla, plato, m, claimOtro);   // se está haciendo: a por el plato y a esperar al lado
    for (const ing of faltan) {
      const est = INGS(ing).cortar ? 'cortado' : 'crudo', clave = 'olla:' + ing; if (claimOtro === clave) continue;
      if (m && esIng(m, ing, est)) return { objetivo: olla, accion: 'coger', claim: clave };
      const r = ingrediente(P, c, D, ing, est, { tile: olla, item: { ings: [] } }, clave); if (r) return r;
    }
    return ocio(P, c, D);
  }
  function horneado(P, c, D, R, plato, F) {
    const m = c.item, hornos = lista(P, t => t.t === 'horno' && !t.fuego && alcanzable(D, t));
    const hecho = hornos.filter(t => t.item && t.item.tipo === 'monton' && t.item.estado === 'horneado' && claveIngs(t.item.ings) === claveIngs(F));
    if (hecho.length) {
      if (plato && plato.mano) return { objetivo: masCerca(D, hecho), accion: 'coger' };
      if (m) return soltar(P, c, D);
      if (plato) return { objetivo: plato.tile, accion: 'coger' };
      return platoLimpio(P, D) || { espera: true };
    }
    if (!hornos.length && lista(P, t => t.t === 'horno').length && !m) { const r = mandarPlato(P, c, D, 'horno'); if (r) return r; }
    const cociendo = hornos.filter(t => t.item && t.item.estado !== 'quemado');
    if (cociendo.length) {   // se está haciendo: si llevo otro montón, a otro horno; si no, a por el plato y a esperar al lado
      if (m && m.tipo === 'monton') return aEstacion(P, c, D, 'horno', 'horno');
      const otro = P.cocineros.find(o => o !== c);
      return esperarCon(P, c, D, masCerca(D, cociendo), plato, m, otro && otro.ia ? otro.ia.claim : null);
    }
    // el montón: en la mano o en una encimera
    const completo = ings => claveIngs(ings) === claveIngs(R.ings);
    if (m && m.tipo === 'monton' && completo(m.ings)) return aEstacion(P, c, D, 'horno', 'horno');
    // el montón puede ser un montón de verdad o un solo ingrediente de la receta esperando en una encimera
    const ingsDe = it => it.tipo === 'monton' ? it.ings : [[it.ing, it.estado]];
    const montones = conItem(P, (it, t) => ((it.tipo === 'monton' && it.estado === 'crudo') || (it.tipo === 'ing' && t.t === 'encimera')) && esMulti(ingsDe(it), R.ings) && (t.t === 'encimera' || t.t === 'tabla' || t.t === 'suelo') && alcanzable(D, t)).sort((a, b) => ingsDe(b.item).length - ingsDe(a.item).length);
    const mont = m && m.tipo === 'monton' ? { item: { ings: m.ings }, mano: true } : montones.length ? { item: { ings: ingsDe(montones[0].item) }, tile: montones[0] } : null;
    if (mont && completo(mont.item.ings) && !mont.mano) { if (m) return soltar(P, c, D); return { objetivo: mont.tile, accion: 'coger' }; }
    const faltan = resta(R.ings, mont ? mont.item.ings : []);
    const otro = P.cocineros.find(o => o !== c), claimOtro = otro && otro.ia ? otro.ia.claim : null;
    for (const [ing, est] of faltan) {
      const clave = 'horno:' + ing; if (claimOtro === clave) continue;
      if (m && esIng(m, ing, est)) {
        if (mont && !mont.mano) return { objetivo: mont.tile, accion: 'coger', claim: clave };
        if (mont && mont.mano) return null;
        // no hay montón: este ingrediente empieza uno en una encimera libre
        const libres = lista(P, t => t.t === 'encimera' && !t.item && !t.fuego && alcanzable(D, t)); if (libres.length) return { objetivo: masCerca(D, libres), accion: 'coger', claim: clave };
        return enviar(P, c, D, clave);
      }
      if (m && m.tipo === 'monton' && mont && mont.mano) {   // llevo el montón y el ingrediente que falta está suelto: lo dejo y voy a por él
        const sueltos = conItem(P, (it, t) => esIng(it, ing, est) && alcanzable(D, t)); if (sueltos.length) return soltar(P, c, D);
        return { espera: true };
      }
      const r = ingrediente(P, c, D, ing, est, mont ? { tile: mont.tile, item: { ings: [] }, mano: mont.mano } : null, clave); if (r) return r;
    }
    return ocio(P, c, D);
  }
  // algo se está cocinando en `t` (olla u horno): quien lleve el plato espera al lado; si nadie lo lleva, uno va a por él
  function esperarCon(P, c, D, t, plato, m, claimOtro) {
    if (plato && plato.mano) return { objetivo: t, accion: 'esperar', claim: 'plato:' + t.t };
    if (!m && !plato && claimOtro !== 'plato:' + t.t) { const pl = platoLimpio(P, D); if (pl) return Object.assign(pl, { claim: 'plato:' + t.t }); }
    return { espera: true };
  }
  // deja lo que llevo en una encimera libre (o en la cinta si no hay)
  function soltar(P, c, D, clave) {
    const m = c.item; if (!m) return null;
    const r = soltarDonde(P, c, D, m); if (r && clave) r.claim = clave; return r;
  }
  function soltarDonde(P, c, D, m) {
    const encimeras = lista(P, t => t.t === 'encimera' && !t.item && !t.fuego && alcanzable(D, t)); if (encimeras.length) return { objetivo: masCerca(D, encimeras), accion: 'coger' };
    if (m.tipo !== 'plato') { const libres = lista(P, t => libre(t) && alcanzable(D, t)); if (libres.length) return { objetivo: masCerca(D, libres), accion: 'coger' }; }
    const cintas = lista(P, t => t.t === 'cinta' && !t.item && alcanzable(D, t) && seAleja(P, D, t)); if (cintas.length) return { objetivo: masCerca(D, cintas), accion: 'coger' };
    if (m.tipo === 'plato' && !m.ings.length) { const pl = lista(P, t => t.t === 'platos' && alcanzable(D, t)); if (pl.length) return { objetivo: masCerca(D, pl), accion: 'coger' }; }
    if (m.tipo !== 'plato') { const b = lista(P, t => t.t === 'basura' && alcanzable(D, t)); if (b.length) return { objetivo: masCerca(D, b), accion: 'coger' }; }
    return { espera: true };
  }
  // lo que llevo va al otro lado: a una cinta libre
  function enviar(P, c, D, clave) {
    const cintas = lista(P, t => t.t === 'cinta' && !t.item && alcanzable(D, t) && seAleja(P, D, t)); if (cintas.length && c.item) return { objetivo: masCerca(D, cintas), accion: 'coger', claim: clave };
    return { espera: true, claim: clave };
  }
  // ¿esta cinta lleva las cosas al otro lado? Sigue la cinta hasta donde suelta y mira si esa casilla no es mía
  function seAleja(P, D, t) {
    let x = t.x, y = t.y;
    for (let i = 0; i < 20; i++) { const u = PARTIDA.tile(x, y); if (!u || u.t !== 'cinta') return !!u && (u.t === 'suelo' || u.t === 'encimera') && D.dist[x + ',' + y] === undefined && !alcanzable(D, u); x += u.dir[0]; y += u.dir[1]; }
    return false;
  }
  // la estación está al otro lado y allí no tienen plato limpio ni va uno por la cinta: les mando uno
  function mandarPlato(P, c, D, tipo) {
    const otro = P.cocineros.find(o => o !== c); if (!otro || !otro.ia || !otro.ia.D) return null;
    const cocinando = lista(P, t => t.t === tipo && (t.item || (t.ings && t.ings.length))); if (!cocinando.length) return null;
    if (platoLimpio(P, otro.ia.D) || (otro.item && otro.item.tipo === 'plato')) return null;
    if (lista(P, t => t.t === 'cinta' && t.item && t.item.tipo === 'plato').length) return null;
    const pl = platoLimpio(P, D); if (pl && pl.accion === 'coger') return Object.assign(pl, { claim: 'plato:cinta' });
    return null;
  }
  // desde el lado de los cajones: preparar ingredientes y mandarlos por la cinta (olla al otro lado)
  function enviarIngs(P, c, D, lista_, tipo) {
    for (const [ing, est] of lista_) {
      if (yaEnviados(P, c, D, ing) >= hacenFalta(P, ing)) continue;   // ya va de camino lo que piden
      const r = ingrediente(P, c, D, ing, est, null, 'cinta:' + ing); if (r && !r.espera) return r;
    }
    return ocio(P, c, D);
  }
  // cuántos de ese ingrediente ya están al otro lado, en la cinta, en la mano del otro o dentro de una olla
  function yaEnviados(P, c, D, ing) {
    const otro = P.cocineros.find(o => o !== c); let n = 0;
    for (const t of casillas(P)) {
      if (t.item && t.item.tipo === 'ing' && t.item.ing === ing && t.item.estado !== 'quemado' && (t.t === 'cinta' || !alcanzable(D, t))) n++;
      if (t.ings) for (const [a] of t.ings) if (a === ing) n++;
    }
    if (otro && otro.item && otro.item.tipo === 'ing' && otro.item.ing === ing) n++;
    return n;
  }
  // cuántos de ese ingrediente piden los pedidos de ahora, quitando los platos, sopas y horneados que ya lo llevan
  function hacenFalta(P, ing) {
    let n = 0; for (const p of P.pedidos) { const R = RECETA[p.receta]; n += (R.olla || R.ings.map(([a]) => a)).filter(a => a === ing).length; }
    for (const t of casillas(P)) { const it = t.item; if (!it) continue; if (it.tipo === 'ing' && it.ing === 'sopa' && it.estado !== 'quemado') n -= it.estado.split('+').filter(a => a === ing).length; else if ((it.tipo === 'plato' || it.tipo === 'monton') && it.estado !== 'quemado') n -= it.ings.filter(([a]) => a === ing).length; }
    for (const c of P.cocineros) { const it = c.item; if (it && (it.tipo === 'plato' || it.tipo === 'monton')) n -= it.ings.filter(([a]) => a === ing).length; }
    return Math.max(0, n);
  }
  // sin nada que hacer: lavar platos, recoger lo que llegue por la cinta o quedarse quieto
  function ocio(P, c, D) {
    if (c.item) return soltar(P, c, D);
    // lo que llega por la cinta se queda en el suelo y la atasca: lo recojo y lo dejo en una encimera
    const llegados = conItem(P, (it, t) => t.t === 'suelo' && alcanzable(D, t)); if (llegados.length && lista(P, t => t.t === 'encimera' && !t.item && alcanzable(D, t)).length) return { objetivo: masCerca(D, llegados), accion: 'coger' };
    const lavar = lista(P, t => t.t === 'fregadero' && t.sucios > 0 && alcanzable(D, t)); if (lavar.length) return { objetivo: masCerca(D, lavar), accion: 'usar' };
    return { espera: true };
  }

  return { paso: IA_CAMINO.paso, decide, distancias };
})();
