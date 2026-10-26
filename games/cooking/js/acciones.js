// Fans of Cooking · ACCIONES: lo que pasa cuando un cocinero pulsa COGER o USAR delante de una casilla: coger y soltar, juntar ingredientes en un
// plato o en un montón, meter en la sartén, el horno o la olla, cortar, lavar, apagar fuegos, tirar a la basura, servir y lanzar por los aires.
'use strict';
const ACCIONES = (() => {
  const T = () => COOK.tiempos;
  const S = (t, d) => PARTIDA.suceso(t, d);
  const copia = it => JSON.parse(JSON.stringify(it));
  const esIng = it => it && it.tipo === 'ing';
  const listoParaPlato = it => esIng(it) ? it.estado !== 'crudo' || !INGREDIENTES[it.ing] || (!INGREDIENTES[it.ing].cortar && !INGREDIENTES[it.ing].sarten && !INGREDIENTES[it.ing].olla) : it && it.tipo === 'monton' && it.estado === 'horneado';
  const parDe = it => it.tipo === 'ing' ? [[it.ing, it.estado]] : it.ings;
  const quemado = it => it && (it.estado === 'quemado');

  // junta lo que lleva la mano con lo que hay en la casilla. Devuelve true si ha pasado algo.
  function junta(c, t) {
    const m = c.item, s = t.item; if (!m || !s) return false;
    if (quemado(m) || quemado(s)) return false;
    // un plato recibe comida lista (de la mano o de la casilla)
    const plato = m.tipo === 'plato' ? m : s.tipo === 'plato' ? s : null, comida = plato === m ? s : m;
    if (plato && comida.tipo !== 'plato' && comida.tipo !== 'extintor') {
      if (plato.sucio || !listoParaPlato(comida)) return false;
      const nuevo = plato.ings.concat(parDe(comida)); if (!cabeEnReceta(nuevo)) return false;
      plato.ings = nuevo; if (plato === m) t.item = null; else c.item = null;
      if (t.t === 'olla') t.prog = 0; if (t.t === 'fogon' || t.t === 'horno') t.prog = 0;
      S('junta', { x: t.x, y: t.y }); return true;
    }
    // dos ingredientes (o un montón) en una encimera: se montan para el horno
    if ((t.t === 'encimera' || t.t === 'tabla') && m.tipo !== 'plato' && s.tipo !== 'plato' && m.tipo !== 'extintor' && s.tipo !== 'extintor') {
      const nuevo = parDe(m).concat(parDe(s)); if (!cabeEnReceta(nuevo, true)) return false;
      t.item = { tipo: 'monton', ings: nuevo, estado: 'crudo' }; c.item = null; S('junta', { x: t.x, y: t.y }); return true;
    }
    return false;
  }
  function recetaHorno(it) { const k = claveIngs(parDe(it)); return RECETAS.find(r => r.horno && claveIngs(r.ings) === k) || null; }

  function coger(c) {
    const t = PARTIDA.delante(c); if (!t) return;
    const m = c.item;
    if (t.fuego) return;
    if (!m) {   // mano vacía: coger
      if (t.t === 'cajon') { c.item = { tipo: 'ing', ing: t.ing, estado: 'crudo' }; S('coge'); return; }
      if (t.t === 'platos') { if (t.platos > 0) { t.platos--; c.item = { tipo: 'plato', ings: [], sucio: false }; S('coge'); } return; }
      if (t.t === 'fregadero') { if (t.limpios > 0) { t.limpios--; c.item = { tipo: 'plato', ings: [], sucio: false }; S('coge'); } return; }
      if (t.t === 'olla') { if (t.item) { c.item = t.item; t.item = null; t.prog = 0; t.humo = 0; S('coge'); } return; }
      if (t.item) { c.item = t.item; t.item = null; t.prog = 0; t.humo = 0; S('coge'); }
      return;
    }
    // con algo en la mano
    switch (t.t) {
      case 'ventanilla': if (m.tipo === 'plato') PARTIDA.sirve(c); return;
      case 'basura':
        if (m.tipo === 'extintor') return;
        if (m.tipo === 'plato') { if (m.ings.length) { PARTIDA.get().puntos += COOK.tirar; m.ings = []; S('tira'); } return; }
        c.item = null; S('tira'); return;
      case 'fregadero': if (m.tipo === 'plato' && m.sucio) { t.sucios++; c.item = null; S('suelta'); } return;
      case 'platos': if (m.tipo === 'plato' && !m.sucio && !m.ings.length) { t.platos++; c.item = null; S('suelta'); } return;
      case 'extintor': if (m.tipo === 'extintor' && !t.item) { t.item = m; c.item = null; S('suelta'); } return;
      case 'cajon':
        if (m.tipo === 'plato' && !m.sucio) { const nuevo = m.ings.concat([[t.ing, 'crudo']]); if (cabeEnReceta(nuevo)) { m.ings = nuevo; S('junta', { x: t.x, y: t.y }); } return; }
        if (m.tipo === 'ing' && m.estado === 'crudo') { const nuevo = parDe(m).concat([[t.ing, 'crudo']]); if (cabeEnReceta(nuevo, true)) { c.item = { tipo: 'monton', ings: nuevo, estado: 'crudo' }; S('junta', { x: t.x, y: t.y }); } }
        return;
      case 'fogon': {
        if (t.apagado && !t.item) { /* se puede meter igual; no cocina hasta encenderlo */ }
        if (t.item) { junta(c, t); return; }
        const I = esIng(m) && INGREDIENTES[m.ing];
        if (I && I.sarten && m.estado === (I.cortar ? 'cortado' : 'crudo')) { t.item = m; c.item = null; t.prog = 0; S('suelta'); }
        return; }
      case 'horno': {
        if (t.item) { junta(c, t); return; }
        if (m.tipo === 'extintor' || m.tipo === 'plato') return;
        if (m.estado === 'crudo' && recetaHorno(m)) { t.item = m.tipo === 'ing' ? { tipo: 'monton', ings: parDe(m), estado: 'crudo' } : m; c.item = null; t.prog = 0; S('suelta'); }
        else S('falta', { x: t.x, y: t.y });
        return; }
      case 'olla': {
        if (t.item) { junta(c, t); return; }
        const I = esIng(m) && INGREDIENTES[m.ing];
        if (I && I.olla && m.estado === (I.cortar ? 'cortado' : 'crudo') && t.ings.length < 3) {
          const nombres = t.ings.map(([n]) => n).concat(m.ing).sort();
          if (RECETAS.some(r => r.olla && nombres.every(n => r.olla.includes(n)) && nombres.length <= r.olla.length && nombres.filter(n => n === m.ing).length <= r.olla.filter(n => n === m.ing).length)) { t.ings.push([m.ing, 'cortado']); c.item = null; if (t.ings.length === 1) t.prog = 0; S('suelta'); }
          else S('falta', { x: t.x, y: t.y });
        }
        return; }
      case 'tabla': case 'encimera': case 'cinta': case 'suelo':
        if (t.item) { junta(c, t); return; }
        if (t.t === 'suelo') return;
        t.item = m; c.item = null; S('suelta'); return;
      default: return;
    }
  }

  // lanzar: lo que llevas vuela hacia delante hasta la primera casilla que lo acepte (encimera o cinta vacías); si choca, cae al suelo
  function lanza(c) {
    const m = c.item; if (!m || m.tipo === 'extintor') return;
    const P = PARTIDA.get(), T0 = COOK.tile;
    let x = Math.floor(c.x / T0), y = Math.floor(c.y / T0), ultimo = null;
    for (let i = 0; i < COOK.cocinero.lanzar; i++) {
      x += c.fx; y += c.fy; const t = PARTIDA.tile(x, y); if (!t) break;
      if (t.t === 'suelo') { if (!t.item) ultimo = t; continue; }
      if ((t.t === 'encimera' || t.t === 'cinta' || t.t === 'tabla') && !t.item) { ultimo = t; }
      break;
    }
    if (!ultimo) return;
    const otro = P.cocineros.find(o => o !== c && Math.floor(o.x / T0) === ultimo.x && Math.floor(o.y / T0) === ultimo.y && !o.item);
    if (otro) { otro.item = m; } else ultimo.item = m;
    c.item = null; P.vuelos.push({ it: copia(m), x0: c.x, y0: c.y - 30, x1: (ultimo.x + 0.5) * T0, y1: (ultimo.y + 0.5) * T0 - (ultimo.t === 'suelo' ? 0 : 22), t: 0, dur: 0.12 + 0.07 * Math.hypot(ultimo.x - c.x / T0, ultimo.y - c.y / T0) });
    S('lanza', { x: c.x, y: c.y });
  }

  // qué acción continua admite la casilla de delante (cortar, lavar, apagar): la que se hace manteniendo USAR
  function accionDe(c, t) {
    if (!t) return null;
    if (t.fuego) return c.item && c.item.tipo === 'extintor' ? 'apagar' : null;
    if (t.t === 'tabla' && t.item && esIng(t.item) && t.item.estado === 'crudo' && INGREDIENTES[t.item.ing] && INGREDIENTES[t.item.ing].cortar && !c.item) return 'cortar';
    if (t.t === 'fregadero' && t.sucios > 0 && !c.item) return 'lavar';
    return null;
  }
  function avanza(c, dt) {
    const a = c.accion, t = a.tile, D = { cortar: T().cortar, lavar: T().lavar, apagar: T().apagar }[a.tipo];
    if (accionDe(c, t) !== a.tipo) { c.accion = null; t.prog = 0; return; }
    a.t += dt; t.prog = a.t / D;
    if (a.t >= D) {
      if (a.tipo === 'cortar') { t.item.estado = 'cortado'; S('corta', { x: t.x, y: t.y }); }
      else if (a.tipo === 'lavar') { t.sucios--; t.limpios++; S('lava', { x: t.x, y: t.y }); }
      else if (a.tipo === 'apagar') { t.fuego = 0; t.humo = 0; S('apagado', { x: t.x, y: t.y }); }
      t.prog = 0; c.accion = null;
    }
  }
  function aplica(c, dt) {
    const e = c.entrada;
    if (e.coger) coger(c);
    const t = PARTIDA.delante(c);
    if (e.lanzar) {
      if (t && t.apagado && !t.fuego && (t.t === 'fogon' || t.t === 'horno' || t.t === 'olla')) { t.apagado = false; S('enciende', { x: t.x, y: t.y }); }
      else if (!accionDe(c, t) && c.item) lanza(c);
    }
    if (e.usar) {
      const tipo = accionDe(c, t);
      if (tipo && (!c.accion || c.accion.tile !== t || c.accion.tipo !== tipo)) c.accion = { tipo, tile: t, t: 0 };
      if (!tipo && c.accion) { c.accion.tile.prog = 0; c.accion = null; }
    } else if (c.accion && c.accion.tipo !== 'cortar' && c.accion.tipo !== 'lavar') { c.accion.tile.prog = 0; c.accion = null; }
    if (c.accion) avanza(c, dt);
  }
  // el cocinero que no se lleva (solitario) sigue cortando o lavando hasta terminar
  function sigue(c, dt) { if (c.accion && (c.accion.tipo === 'cortar' || c.accion.tipo === 'lavar')) avanza(c, dt); else if (c.accion) { c.accion.tile.prog = 0; c.accion = null; } }
  return { aplica, sigue, accionDe };
})();
