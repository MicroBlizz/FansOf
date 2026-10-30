// Fans Of Decks · La reunión (el combate): reglas puras, sin pantalla. Un estado C con tu líder, tu mano y los rivales; combate-ui.js lo pinta.
// Turno: robas 5 y recibes 3 de CAOS; juegas cartas; fin de turno; los rivales hacen lo que anunciaban; el bloqueo se va. Hora de cierre: a partir del turno
// DC_CIERRE el CAOS es el doble y los rivales pegan un 50 % más. Vulnerable: recibe +50 %. Débil: pega −25 %. Aturdido: pierde el turno.
'use strict';
const DC_MANO = 5, DC_MANO_MAX = 10, DC_CAOS = 3, DC_CIERRE = 6;
const DC_OBJETIVOS = { ataque: 'uno' };

function dcRival(id) {
  const D = DC_RIVALES[id];
  return dcEqEscala(dcParoEscala({ id, nombre: D.nombre ? tr(D.nombre) : tr(CFG.enemyCards[id] ? CFG.enemyCards[id].name : id), hp: D.hp, hpMax: D.hp, bloqueo: 0, fuerza: 0, vulnerable: 0, debil: 0, aturdido: 0, idx: 0, ultimo: -1, jug: null }));   // paro.js: los niveles de paro los endurecen; equipo.js, los que sois
}
// Qué anuncia el rival para su próximo turno.
function dcAnuncia(C, r) {
  const D = DC_RIVALES[r.id], J = D.jugadas;
  let k;
  if (D.orden === 'guion') { k = r.idx < J.length ? r.idx : (D.bucle || 0) + (r.idx - (D.bucle || 0)) % (J.length - (D.bucle || 0)); r.idx++; }
  else if (D.orden === 'ciclo') { k = r.idx % J.length; r.idx++; }
  else { do { k = (Math.random() * J.length) | 0; } while (J.length > 1 && k === r.ultimo); r.ultimo = k; }
  r.jug = J[k];
}
const DC_MAX_RIVALES = 5;
function dcTipoJugada(j) { return j.d ? 'ataque' : j.ref ? 'refuerzo' : j.spam ? 'spam' : j.b ? 'defensa' : j.c ? 'cura' : j.f ? 'fuerza' : 'debil'; }
// El daño que hará un rival si no cambia nada (para enseñarlo encima).
function dcDanoRival(C, r, j) { j = j || r.jug; if (!j || !j.d || dcGancho('sinAtaque', C)) return 0; let d = j.d + r.fuerza; if (r.debil) d = Math.floor(d * 0.75); if (C.turno >= C.cierre) d = Math.floor(d * 1.5); return d; }

// ---------- empezar ----------
function dcCombateNuevo(encuentro, tramo) {
  const r = DCP.run, L = DC_LIDERES[r.lider];
  const C = { tramo, rivales: encuentro.map(dcRival), bloqueo: 0, blindaje: 0, fuerza: 0, fuerzaTurno: 0, debil: 0, vulnerable: 0, caos: 0, poderes: {}, pila: shuffle(r.mazo.map(c => Object.assign({}, c))), mano: [], descartes: [], despedidas: [],
    turno: 0, tropasTurno: 0, tiposTurno: {}, ataques: 0, saltoCarga: 0, cierre: DC_CIERRE + (dcObjeto('pausa') ? dcObjeto('pausa').cierre : 0), fase: 'jugador', resultado: null, log: [], eventos: [], objetivo: null, meriendasUsadas: [] };
  // C.eventos: lo que pasó desde el último dibujo ({ t: 'dano'|'cura'|'bloqueo'|'esquiva', r: índice del rival o -1 si es el líder, n }); combate-ui los pinta como cifras flotantes y los vacía.
  // los madrugadores van arriba del mazo: salen siempre en la mano inicial
  const mad = C.pila.filter(c => dcFx(c).madrugador); if (mad.length) C.pila = C.pila.filter(c => !dcFx(c).madrugador).concat(mad);
  C.salto = Object.assign({}, L.jugada); if (dcObjeto('zanahoriaoro')) C.salto.carga = Math.max(2, C.salto.carga - dcObjeto('zanahoriaoro').carga);
  if (dcVentaja() && dcVentaja().carga) C.salto.carga = Math.max(2, C.salto.carga - dcVentaja().carga);
  C.companeros = []; C.protocolos = []; dcGancho('alSalto', C);   // los compañeros que se quedan en la mesa y los protocolos armados
  // La jugada del líder es gratis: se carga con el CAOS gastado en cartas (C.saltoCarga) y se dispara cuando llega a C.salto.carga.
  for (const rv of C.rivales) dcAnuncia(C, rv);
  if (dcObjeto('alfombrilla')) C.bloqueo += dcObjeto('alfombrilla').bloqueoInicial;
  dcVentajaReunion(C);   // ventajas.js: bloqueo y Fuerza de salida
  dcEmpiezaTurno(C);
  if (dcObjeto('cofre') && C.pila.length) { const c = C.pila.pop(); C.log.push(tr('El cofre juega {carta} gratis', { carta: dcNombre(c) })); dcResuelve(C, c, dcPrimerRival(C), true); }
  return C;
}
function dcPrimerRival(C) { return C.rivales.findIndex(r => r.hp > 0); }
function dcRoba(C, n) {
  for (let i = 0; i < n; i++) {
    if (!C.pila.length) { if (!C.descartes.length) return; C.pila = shuffle(C.descartes); C.descartes = []; }
    const c = C.pila.pop(); C.mano.push(c);
    const fx = dcFx(c); if (fx.alRobar === 'caos-1') { C.caos = Math.max(0, C.caos - 1); C.log.push(tr('{carta} te quita 1 CAOS', { carta: dcNombre(c) })); }
  }
}
function dcEmpiezaTurno(C) {
  C.turno++; DCP.run.stats.turnos++;
  // Blindaje (regla de Arkioner, 18-10-2026): mientras quede, el bloqueo no se pierde al empezar el turno; gasta un punto por turno
  if (C.turno > 1) { if (C.blindaje > 0) C.blindaje--; else C.bloqueo = 0; }
  C.fuerzaTurno = 0; C.tropasTurno = 0; C.tiposTurno = {}; C.renacido = false;
  if (C.debil) C.debil--; if (C.vulnerable) C.vulnerable--;
  C.caos = C.turno >= C.cierre ? DC_CAOS * 2 : DC_CAOS;
  if (C.turno === 1 && dcObjeto('taza')) C.caos += dcObjeto('taza').caosTurno1;
  if (C.poderes.nido) C.bloqueo += C.poderes.nido;
  if (C.turno === C.cierre) C.log.push(tr('¡HORA DE CIERRE! CAOS doble y los rivales pegan más'));
  // la mano: primero las cartas de primera hora, luego hasta llenar
  const inic = C.turno === 1 ? C.pila.filter(c => dcFx(c).primeraHora) : [];
  for (const c of inic) { C.pila.splice(C.pila.indexOf(c), 1); C.mano.push(c); }
  const V = dcVentaja();
  if (C.turno === 1 && V && V.caosInicial) C.caos += V.caosInicial;
  // Contrato indefinido: lo que se quedó en la mano no quita robo; se roban las 5 de siempre (hasta 10 en la mano)
  const extra = C.turno === 1 ? (dcObjeto('mochila') ? dcObjeto('mochila').manoInicial : 0) + (V && V.manoInicial ? V.manoInicial : 0) : 0, roba = DC_MANO + extra - (C.turno === 1 ? C.mano.length : 0);
  dcRoba(C, Math.max(0, Math.min(roba, DC_MANO_MAX - C.mano.length)));
  dcGancho('alTurno', C);
  C.fase = 'jugador';
}

// ---------- jugar ----------
function dcPuedeJugar(C, c) { const fx = dcFx(c); return C.fase === 'jugador' && !fx.injugable && dcCoste(c) <= C.caos; }
function dcNecesitaObjetivo(C, c) { const fx = dcFx(c); return (fx.dano || fx.vulnerable || fx.debil || fx.aturde) && !fx.companero && !fx.protocolo && fx.obj !== 'todos' && fx.cond !== 'atacantes' && C.rivales.filter(r => r.hp > 0).length > 1; }
// Los rivales que van a atacar este turno (para las cartas que defienden embistiendo).
function dcAtacantes(C) { return C.rivales.filter(r => r.hp > 0 && !r.aturdido && dcTipoJugada(r.jug) === 'ataque'); }
// La pasiva de la facción del líder. Animales Locos, Racha salvaje (idea de Arkioner, 19-10-2026): cada carta de un tipo jugada
// en el turno suma +1 a las cifras (daño, bloqueo, cura) de la siguiente de ese mismo tipo, hasta el tope.
function dcFaccion() { const L = DCP.run && DC_LIDERES[DCP.run.lider]; return L ? DC_FACCIONES[L.faccion] : null; }
function dcRacha(C, tipo) { const F = dcFaccion(); return F && F.racha ? Math.min(F.tope, (C.tiposTurno[tipo] || 0) * F.racha) : 0; }
// Renacer (No-Muertos): la primera carta con Despedida que juegas cada turno no se va, vuelve al descarte. Devuelve true si ha renacido.
function dcRenace(C, c) { const F = dcFaccion(); if (!F || !F.renacer || C.renacido) return false; C.renacido = true; C.log.push(tr('Renacer: {carta} vuelve', { carta: dcNombre(c) })); return true; }
// La última carta despedida (que no sea Spam) vuelve a la mano; siempre la misma, nunca al azar.
function dcResucita(C) { for (let i = C.despedidas.length - 1; i >= 0; i--) if (DC_CARTAS[C.despedidas[i].id].tipo !== 'spam') { C.mano.push(C.despedidas.splice(i, 1)[0]); return; } }
function dcDanoA(C, r, base, esTropa) {
  let d = base + C.fuerza + (esTropa ? C.fuerzaTurno + (dcObjeto('teclado') ? dcObjeto('teclado').tropaDano : 0) : 0);
  if (C.ataques === 0 && dcObjeto('gorra')) d += dcObjeto('gorra').primerAtaque;
  if (C.debil) d = Math.floor(d * 0.75);
  if (r.vulnerable) d = Math.floor(d * 1.5);
  return Math.max(0, d);
}
function dcGolpea(C, r, d, perfora) {
  const vivo = r.hp > 0, b = perfora ? 0 : Math.min(r.bloqueo, d); r.bloqueo -= b; d -= b; r.hp = Math.max(0, r.hp - d); r.golpe = (r.golpe || 0) + 1;
  C.eventos.push({ t: d > 0 ? 'dano' : 'esquiva', r: C.rivales.indexOf(r), n: d });
  if (r.hp <= 0) C.log.push(tr('{rival} cae', { rival: r.nombre }));
  if (vivo && r.hp <= 0) dcGancho('alBaja', C, r);
  return d;
}
// Juega la carta i de la mano sobre el rival `obj` (índice) si hace falta.
function dcJugar(C, i, obj) {
  const c = C.mano[i]; if (!c || !dcPuedeJugar(C, c)) return false;
  C.caos -= dcCoste(c); C.saltoCarga += dcCoste(c); C.mano.splice(i, 1);
  dcResuelve(C, c, obj, false);
  dcCompruebaFin(C);
  return true;
}
function dcResuelve(C, c, obj, gratis) {
  const D = DC_CARTAS[c.id], fx = dcFx(c), vivos = C.rivales.filter(r => r.hp > 0), extra = dcRacha(C, D.tipo) + (dcGancho('bono', C, D) || 0);
  C.tiposTurno[D.tipo] = (C.tiposTurno[D.tipo] || 0) + 1;
  dcGancho('alJugar', C, c, D, fx);
  // un compañero se sienta en la mesa y un protocolo se arma: actúan después (dcFinTurno); la carta va a los descartes
  if (fx.companero) { C.companeros.push({ id: c.id, asc: !!c.asc, niv: dcNiv(c), turnos: fx.turnos + (C.poderes.retro || 0) }); if (C.companeros.length > 3) C.companeros.shift(); C.descartes.push(c); return; }
  if (fx.protocolo) { C.protocolos.push({ id: c.id, asc: !!c.asc, niv: dcNiv(c) }); if (C.protocolos.length > 3) C.protocolos.shift(); C.descartes.push(c); return; }
  let objs = fx.cond === 'atacantes' ? dcAtacantes(C) : fx.obj === 'todos' ? vivos : [C.rivales[obj] && C.rivales[obj].hp > 0 ? C.rivales[obj] : vivos[0]].filter(Boolean);
  if (fx.dano) {
    const veces = fx.cond === 'porTropa' ? C.tropasTurno : (fx.veces || 1);
    for (let k = 0; k < veces; k++) for (const r of objs) {
      if (r.hp <= 0) continue;
      let d = dcDanoA(C, r, fx.dano + extra + (fx.porNivel ? fx.porNivel * (C.nivel || 0) : 0) + (fx.herido && DCP.run.hp * 2 <= DCP.run.hpMax ? fx.herido : 0), D.tipo === 'empleado');
      if (fx.cond === 'primerGolpe' && r.hp === r.hpMax) d *= 3;
      if (fx.cond === 'noMax' && r.hp < Math.max(...vivos.map(v => v.hp))) d *= 2;
      dcGolpea(C, r, d, fx.perfora); C.ataques++;
    }
  }
  for (const r of objs) { if (fx.vulnerable) r.vulnerable += fx.vulnerable; if (fx.debil) r.debil += fx.debil; if (fx.aturde) r.aturdido = Math.max(r.aturdido, fx.aturde); }
  if (fx.bloqueo) { C.bloqueo += fx.bloqueo + extra; C.eventos.push({ t: 'bloqueo', r: -1, n: fx.bloqueo + extra }); }
  if (fx.cura) { dcVida(fx.cura + extra); C.eventos.push({ t: 'cura', r: -1, n: fx.cura + extra }); }
  if (fx.pierde) { dcVida(-fx.pierde); C.eventos.push({ t: 'dano', r: -1, n: fx.pierde }); }
  if (fx.resucita) dcResucita(C);
  if (fx.caos) C.caos += fx.caos;
  if (fx.blindaje) C.blindaje += fx.blindaje;
  if (fx.fuerza) C.fuerza += fx.fuerza;
  if (fx.fuerzaTurno) C.fuerzaTurno += fx.fuerzaTurno;
  if (fx.carga) C.saltoCarga += fx.carga;
  if (fx.poder) C.poderes[fx.poder] = (C.poderes[fx.poder] || 0) + fx.n;
  if (fx.roba) dcRoba(C, fx.roba);
  if (D.tipo === 'empleado') C.tropasTurno++;
  if (fx.despedida && C.poderes.cementerio) { C.bloqueo += C.poderes.cementerio; C.eventos.push({ t: 'bloqueo', r: -1, n: C.poderes.cementerio }); }
  if ((fx.despedida || gratis) && !(fx.despedida && !gratis && dcRenace(C, c))) C.despedidas.push(c); else C.descartes.push(c);
}
function dcUsaSalto(C) {
  if (C.fase !== 'jugador' || C.saltoCarga < C.salto.carga) return false;
  C.saltoCarga -= C.salto.carga;
  if (C.salto.dano) { for (const r of C.rivales) if (r.hp > 0) dcGolpea(C, r, dcDanoA(C, r, C.salto.dano, false)); C.ataques++; }
  const S = C.salto;   // lo que más puede dar la jugada de un líder, además del daño y de invocar
  if (S.bloqueo) { C.bloqueo += S.bloqueo; C.eventos.push({ t: 'bloqueo', r: -1, n: S.bloqueo }); }
  if (S.blindaje) C.blindaje += S.blindaje;
  if (S.fuerzaTurno) C.fuerzaTurno += S.fuerzaTurno;
  if (S.caos) C.caos += S.caos;
  if (S.roba) dcRoba(C, S.roba);
  if (C.salto.invoca) for (let k = 0; k < C.salto.n; k++) { C.companeros.push({ id: C.salto.invoca, asc: false, turnos: dcFx({ id: C.salto.invoca }).turnos + (C.poderes.retro || 0) }); if (C.companeros.length > 3) C.companeros.shift(); } C.log.push(tr('¡{jugada}!', { jugada: tr(C.salto.nombre) }));
  dcGancho('alSalto', C, true);
  dcCompruebaFin(C); return true;
}
function dcUsaMerienda(C, i) {
  const k = DCP.run.meriendas[i], M = DC_MERIENDAS[k]; if (!M || C.fase !== 'jugador') return false;
  if (M.caos) C.caos += M.caos; if (M.roba) dcRoba(C, M.roba); if (M.cura) { dcVida(M.cura); C.eventos.push({ t: 'cura', r: -1, n: M.cura }); }
  DCP.run.meriendas.splice(i, 1); C.log.push(tr('Te tomas {merienda}', { merienda: tr(M.nombre) })); return true;
}

// ---------- fin de turno y turno de los rivales ----------
function dcFinTurno(C) {
  if (C.fase !== 'jugador') return;
  if (dcCierraTurno(C)) return;
  for (const r of C.rivales) { if (r.hp <= 0) continue; dcActuaRival(C, r); if (DCP.run.hp <= 0) break; }
  if (!dcCompruebaFin(C)) dcEmpiezaTurno(C);
}
// Tu parte del fin de turno: la mano se va (menos los indefinidos) y actúan los compañeros. Devuelve true si con eso acaba la reunión.
function dcCierraTurno(C) {
  C.fase = 'rival';
  C.mano = C.mano.filter(c => { const fx = dcFx(c); if (fx.indefinido) return true; if (DC_CARTAS[c.id].tipo === 'spam') C.despedidas.push(c); else C.descartes.push(c); return false; });
  dcActuanCompaneros(C); return dcCompruebaFin(C);
}
// Un rival hace lo que anunciaba contra el líder de C (en equipo, equipo.js elige contra quién).
function dcActuaRival(C, r) {
  if (r.aturdido) { C.eventos.push({ t: 'accion', r: C.rivales.indexOf(r), tipo: 'aturdido' }); r.aturdido--; C.log.push(tr('{rival} está rascándose', { rival: r.nombre })); r.bloqueo = 0; dcAnuncia(C, r); return; }
  const j = r.jug; r.bloqueo = 0; C.eventos.push({ t: 'accion', r: C.rivales.indexOf(r), tipo: dcTipoJugada(j) });
  if (j.d && dcDanoRival(C, r, j) > 0) { const pg = dcProtocolo(C, 'golpe'); if (pg) { C.bloqueo += pg.bloqueo; C.eventos.push({ t: 'bloqueo', r: -1, n: pg.bloqueo }); } }
  if (j.d) for (let k = 0; k < (j.n || 1); k++) {
    let d = dcDanoRival(C, r, j); if (C.vulnerable) d = Math.floor(d * 1.5);
    const b = Math.min(C.bloqueo, d); C.bloqueo -= b; d -= b; if (d > 0) C.golpeado = true; dcVida(-d); C.eventos.push({ t: d > 0 ? 'dano' : 'esquiva', r: -1, n: d });
    if (C.poderes.espinas) dcGolpea(C, r, C.poderes.espinas);
    if (DCP.run.hp <= 0) break;
  }
  if (j.b) r.bloqueo += j.b;
  if (j.c) for (const o of C.rivales) if (o.hp > 0) o.hp = Math.min(o.hpMax, o.hp + j.c);
  if (j.f) r.fuerza += j.f;
  if (j.debil) C.debil += j.debil;
  if (j.spam) { const ps = dcProtocolo(C, 'spam'); if (ps) dcGolpea(C, r, ps.dano); else for (let k = 0; k < j.spam; k++) C.descartes.push(dcCarta('spam')); }
  if (j.ref) { // como mucho DC_MAX_RIVALES en la sala (regla de Arkioner, 18-10-2026): si no cabe nadie más, la invocación falla
    const pe = C.rivales.filter(x => x.hp > 0).length < DC_MAX_RIVALES ? dcProtocolo(C, 'refuerzo') : null;
    for (let k = 0; k < (j.refN || 1); k++) {
      if (C.rivales.filter(x => x.hp > 0).length >= DC_MAX_RIVALES) { C.eventos.push({ t: 'falla', r: C.rivales.indexOf(r) }); C.log.push(tr('{rival} llama a refuerzos, pero la sala está llena', { rival: r.nombre })); break; }
      const n = dcRival(j.ref); if (pe) n.hp = Math.ceil(n.hpMax / 2); dcAnuncia(C, n); C.rivales.push(n);
    }
  }
  if (r.debil) r.debil--; if (r.vulnerable) r.vulnerable--;
  if (DCP.run.hp <= 0) return;
  dcAnuncia(C, r);
}
// Los compañeros actúan al acabar tu turno: pegan al rival con menos vida, te dan bloqueo o te curan; se van cuando se les acaban los turnos.
function dcActuanCompaneros(C) {
  for (const k of C.companeros.slice()) {
    const fx = dcFx({ id: k.id, asc: k.asc, niv: k.niv }), vivos = C.rivales.filter(r => r.hp > 0);
    C.eventos.push({ t: 'accion', r: -1, comp: C.companeros.indexOf(k) });
    if (fx.dano && vivos.length) { const r = vivos.reduce((a, b) => b.hp < a.hp ? b : a); dcGolpea(C, r, dcDanoA(C, r, fx.dano, false)); }
    if (fx.bloqueo) { C.bloqueo += fx.bloqueo; C.eventos.push({ t: 'bloqueo', r: -1, n: fx.bloqueo }); }
    if (fx.cura) { dcVida(fx.cura); C.eventos.push({ t: 'cura', r: -1, n: fx.cura }); }
    k.turnos--; if (k.turnos <= 0) { C.companeros.splice(C.companeros.indexOf(k), 1); C.log.push(tr('{n} se va a casa', { n: tr(DC_CARTAS[k.id].nombre) })); }
  }
}
// Si hay un protocolo armado de ese tipo, salta: se gasta y devuelve sus cifras (null si no hay).
function dcProtocolo(C, tipo) {
  const i = C.protocolos.findIndex(p => dcFx({ id: p.id, asc: p.asc, niv: p.niv }).protocolo === tipo); if (i < 0) return null;
  const p = C.protocolos.splice(i, 1)[0]; C.log.push(tr('Salta {n}', { n: tr(DC_CARTAS[p.id].nombre) })); return dcFx({ id: p.id, asc: p.asc, niv: p.niv });
}
function dcCompruebaFin(C) {
  if (DCP.run.hp <= 0) { C.fase = 'fin'; C.resultado = 'derrota'; return true; }
  if (!C.rivales.some(r => r.hp > 0)) { C.fase = 'fin'; C.resultado = 'victoria'; DCP.run.stats.reuniones++; DCP.meta.reuniones = (DCP.meta.reuniones || 0) + 1; dcLogrosReunion(C); if (dcObjeto('almohada')) dcVida(dcObjeto('almohada').trasReunion); dcVentajaTrasReunion(); return true; }
  return false;
}
