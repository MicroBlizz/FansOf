// Fans of Spy · APLICACIÓN · Los casos de uso: lo que el jugador puede hacer, uno por función. Empezar una planta (guiada por
// Lola o libre), jugar una carta, gastarla para andar, acabar el turno y seguir el guion. Cada caso pregunta a la guía si toca,
// llama al dominio y devuelve SPY.ok({ eventos, rebobina, fin }) o SPY.error('codigo'). En el tutorial, si salta la alarma, la
// partida vuelve a la foto del último paso (Lola rebobina). Es lo único que toca el almacén (el progreso: tutorial hecho, notas
// y Clips). Se monta en principal.js con sus puertos: { aj, plantas, azar, almacen: { carga(), guarda(progreso) } }.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
SPY.creaCasos = function ({ aj, plantas, azar, almacen }) {
  const S = SPY, P = S.partida, GU = S.guia, NOTAS = 'CBAS';
  const guardado = almacen.carga() || {};
  const prog = { tutorial: !!guardado.tutorial, notas: { ...(guardado.notas || {}) }, clips: Number(guardado.clips) || 0 };
  let c = null, guia = null, foto = null, nivel = null;

  const retrata = () => { foto = JSON.stringify({ p: c.p, guia }); };
  function rebobina() {
    const d = JSON.parse(foto);
    c = P.contexto(aj, plantas, d.p, azar); guia = d.guia;
  }

  // Empieza la planta `id`. Guiada: con el mazo preparado y el guion de Lola. Libre: con el mazo del agente, barajado.
  function empieza(id, guiada) {
    const r = P.nueva(aj, plantas, id, guiada ? { azar, mazo: GU.MAZO, barajar: false } : { azar });
    if (!r.ok) return r;
    nivel = id; c = P.contexto(aj, plantas, r.valor, azar);
    guia = guiada ? GU.nueva() : null; foto = null;
    if (guia) retrata();
    return S.ok(c.p);
  }

  // Al llegar a la puerta: suma los Clips y se queda con la mejor nota de la planta.
  function apunta(fin) {
    if (fin.como !== 'meta') return;
    prog.clips += fin.clips;
    if (NOTAS.indexOf(fin.nota) > NOTAS.indexOf(prog.notas[nivel] || '')) prog.notas[nivel] = fin.nota;
    if (guia) prog.tutorial = true;
    almacen.guarda(prog);
  }

  // Lo que pasa tras una acción que ha salido bien: en el tutorial, rebobinar si lo han visto o pasar al paso siguiente.
  function despues(eventos) {
    if (guia && eventos.some((e) => e.t === 'alerta')) { rebobina(); return { eventos, rebobina: true, fin: null }; }
    const fin = c.p.fin;
    if (fin) apunta(fin);
    if (guia && !GU.libre(guia)) { GU.avanza(guia); retrata(); }
    return { eventos, rebobina: false, fin };
  }

  // Una acción del jugador: la guía dice si toca, el dominio la hace y `despues` saca las consecuencias.
  function accion(que, i, objetivo, hace) {
    if (!c) return S.error('sin-partida');
    const no = guia ? GU.permite(guia, { que, carta: i === null ? null : c.p.baraja.mano[i], objetivo }) : null;
    if (no) return S.error(no);
    const r = hace();
    return r.ok ? S.ok(despues(r.valor.eventos)) : r;
  }

  return Object.freeze({
    empieza,
    sigue: () => accion('seguir', null, null, () => S.ok({ eventos: [] })),
    juega: (i, objetivo) => accion('carta', i, objetivo, () => P.juega(c, i, objetivo)),
    anda: (i, destino) => accion('andar', i, destino, () => P.anda(c, i, destino)),
    acaba: () => accion('acabar', null, null, () => P.acaba(c)),
    opciones: (i) => (c ? P.opciones(c, i) : S.error('sin-partida')),
    prevision: (destino, pasos, radio) => S.prevision.camino(c, destino, pasos, radio),
    oyen: (radio) => S.prevision.oyen(c, c.p.agente, radio),
    conos: () => S.prevision.conos(c),
    orden: (previsto) => S.turnos.orden(aj, c.p, previsto),
    paso: () => (guia ? GU.paso(guia) : null),
    senala: () => (guia ? GU.senala(guia) : null),
    guiada: () => !!guia,
    progreso: () => ({ ...prog, notas: { ...prog.notas } }),
    get p() { return c ? c.p : null; },
    get planta() { return c ? c.planta : null; },
    get nivel() { return nivel; },
  });
};
