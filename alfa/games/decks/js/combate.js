// Fans Of Decks · La reunión (el combate): reglas puras, sin pantalla. Un estado C con tu líder, tu mano y los rivales; combate-ui.js lo pinta.
// Turno: robas 5 y recibes 3 de CAOS; juegas cartas; fin de turno; los rivales hacen lo que anunciaban; el bloqueo se va. Hora de cierre: a partir del turno
// DC_CIERRE el CAOS es el doble y los rivales pegan un 50 % más. Vulnerable: recibe +50 %. Débil: pega −25 %. Aturdido: pierde el turno.
'use strict';
const DC_MANO = 5, DC_CAOS = 3, DC_CIERRE = 6;
const DC_OBJETIVOS = { ataque: 'uno' };

function dcRival(id) {
  const D = DC_RIVALES[id];
  return { id, nombre: D.nombre ? tr(D.nombre) : tr(CFG.enemyCards[id] ? CFG.enemyCards[id].name : id), hp: D.hp, hpMax: D.hp, bloqueo: 0, fuerza: 0, vulnerable: 0, debil: 0, aturdido: 0, idx: 0, ultimo: -1, jug: null };
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
function dcTipoJugada(j) { return j.d ? 'ataque' : j.ref ? 'refuerzo' : j.spam ? 'spam' : j.b ? 'defensa' : j.c ? 'cura' : j.f ? 'fuerza' : 'debil'; }
// El daño que hará un rival si no cambia nada (para enseñarlo encima).
function dcDanoRival(C, r, j) { j = j || r.jug; if (!j || !j.d) return 0; let d = j.d + r.fuerza; if (r.debil) d = Math.floor(d * 0.75); if (C.turno >= C.cierre) d = Math.floor(d * 1.5); return d; }

// ---------- empezar ----------
function dcCombateNuevo(encuentro, tramo) {
  const r = DCP.run, L = DC_LIDERES[r.lider];
  const C = { tramo, rivales: encuentro.map(dcRival), bloqueo: 0, fuerza: 0, fuerzaTurno: 0, debil: 0, vulnerable: 0, caos: 0, poderes: {}, pila: shuffle(r.mazo.map(c => Object.assign({}, c))), mano: [], descartes: [], despedidas: [],
    turno: 0, tropasTurno: 0, ataques: 0, saltoCd: 0, cierre: DC_CIERRE + (dcObjeto('pausa') ? dcObjeto('pausa').cierre : 0), fase: 'jugador', resultado: null, log: [], objetivo: null, meriendasUsadas: [] };
  C.salto = Object.assign({}, L.jugada); if (dcObjeto('zanahoriaoro')) C.salto.cd = dcObjeto('zanahoriaoro').saltoCd;
  for (const rv of C.rivales) dcAnuncia(C, rv);
  if (dcObjeto('alfombrilla')) C.bloqueo += dcObjeto('alfombrilla').bloqueoInicial;
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
  C.bloqueo = C.turno === 1 ? C.bloqueo : 0; C.fuerzaTurno = 0; C.tropasTurno = 0;
  if (C.debil) C.debil--; if (C.vulnerable) C.vulnerable--;
  if (C.saltoCd > 0) C.saltoCd--;
  C.caos = C.turno >= C.cierre ? DC_CAOS * 2 : DC_CAOS;
  if (C.turno === 1 && dcObjeto('taza')) C.caos += dcObjeto('taza').caosTurno1;
  if (C.poderes.nido) C.bloqueo += C.poderes.nido;
  if (C.turno === C.cierre) C.log.push(tr('¡HORA DE CIERRE! CAOS doble y los rivales pegan más'));
  // la mano: primero las cartas de primera hora, luego hasta llenar
  const inic = C.turno === 1 ? C.pila.filter(c => dcFx(c).primeraHora) : [];
  for (const c of inic) { C.pila.splice(C.pila.indexOf(c), 1); C.mano.push(c); }
  dcRoba(C, DC_MANO + (C.turno === 1 && dcObjeto('mochila') ? dcObjeto('mochila').manoInicial : 0) - C.mano.length);
  C.fase = 'jugador';
}

// ---------- jugar ----------
function dcPuedeJugar(C, c) { const fx = dcFx(c); return C.fase === 'jugador' && !fx.injugable && dcCoste(c) <= C.caos; }
function dcNecesitaObjetivo(C, c) { const fx = dcFx(c); return (fx.dano || fx.vulnerable || fx.debil || fx.aturde) && fx.obj !== 'todos' && C.rivales.filter(r => r.hp > 0).length > 1; }
function dcDanoA(C, r, base, esTropa) {
  let d = base + C.fuerza + (esTropa ? C.fuerzaTurno + Math.min(5, C.tropasTurno) + (dcObjeto('teclado') ? dcObjeto('teclado').tropaDano : 0) : 0);
  if (C.ataques === 0 && dcObjeto('gorra')) d += dcObjeto('gorra').primerAtaque;
  if (C.debil) d = Math.floor(d * 0.75);
  if (r.vulnerable) d = Math.floor(d * 1.5);
  return Math.max(0, d);
}
function dcGolpea(C, r, d) {
  const b = Math.min(r.bloqueo, d); r.bloqueo -= b; d -= b; r.hp = Math.max(0, r.hp - d); r.golpe = (r.golpe || 0) + 1;
  if (r.hp <= 0) C.log.push(tr('{rival} cae', { rival: r.nombre }));
  return d;
}
// Juega la carta i de la mano sobre el rival `obj` (índice) si hace falta.
function dcJugar(C, i, obj) {
  const c = C.mano[i]; if (!c || !dcPuedeJugar(C, c)) return false;
  C.caos -= dcCoste(c); C.mano.splice(i, 1);
  dcResuelve(C, c, obj, false);
  dcCompruebaFin(C);
  return true;
}
function dcResuelve(C, c, obj, gratis) {
  const D = DC_CARTAS[c.id], fx = dcFx(c), vivos = C.rivales.filter(r => r.hp > 0);
  let objs = fx.obj === 'todos' ? vivos : [C.rivales[obj] && C.rivales[obj].hp > 0 ? C.rivales[obj] : vivos[0]].filter(Boolean);
  if (fx.dano) {
    const veces = fx.cond === 'porTropa' ? C.tropasTurno : (fx.veces || 1);
    for (let k = 0; k < veces; k++) for (const r of objs) {
      if (r.hp <= 0) continue;
      let d = dcDanoA(C, r, fx.dano, D.tipo === 'tropa');
      if (fx.cond === 'primerGolpe' && r.hp === r.hpMax) d *= 3;
      if (fx.cond === 'noMax' && r.hp < Math.max(...vivos.map(v => v.hp))) d *= 2;
      dcGolpea(C, r, d); C.ataques++;
    }
  }
  for (const r of objs) { if (fx.vulnerable) r.vulnerable += fx.vulnerable; if (fx.debil) r.debil += fx.debil; if (fx.aturde) r.aturdido = Math.max(r.aturdido, fx.aturde); }
  if (fx.bloqueo) C.bloqueo += fx.bloqueo;
  if (fx.cura) dcVida(fx.cura);
  if (fx.caos) C.caos += fx.caos;
  if (fx.fuerza) C.fuerza += fx.fuerza;
  if (fx.fuerzaTurno) C.fuerzaTurno += fx.fuerzaTurno;
  if (fx.poder) C.poderes[fx.poder] = (C.poderes[fx.poder] || 0) + fx.n;
  if (fx.roba) dcRoba(C, fx.roba);
  if (D.tipo === 'tropa') C.tropasTurno++;
  if (fx.despedida || gratis) C.despedidas.push(c); else C.descartes.push(c);
}
function dcUsaSalto(C) {
  if (C.fase !== 'jugador' || C.saltoCd > 0 || C.caos < C.salto.coste) return false;
  C.caos -= C.salto.coste; C.saltoCd = C.salto.cd;
  for (const r of C.rivales) if (r.hp > 0) dcGolpea(C, r, dcDanoA(C, r, C.salto.dano, false));
  C.ataques++; C.log.push(tr('¡{jugada}!', { jugada: tr(C.salto.nombre) }));
  dcCompruebaFin(C); return true;
}
function dcUsaMerienda(C, i) {
  const k = DCP.run.meriendas[i], M = DC_MERIENDAS[k]; if (!M || C.fase !== 'jugador') return false;
  if (M.caos) C.caos += M.caos; if (M.roba) dcRoba(C, M.roba); if (M.cura) dcVida(M.cura);
  DCP.run.meriendas.splice(i, 1); C.log.push(tr('Te tomas {merienda}', { merienda: tr(M.nombre) })); return true;
}

// ---------- fin de turno y turno de los rivales ----------
function dcFinTurno(C) {
  if (C.fase !== 'jugador') return;
  C.fase = 'rival';
  C.mano = C.mano.filter(c => { const fx = dcFx(c); if (fx.indefinido) return true; if (DC_CARTAS[c.id].tipo === 'spam') C.despedidas.push(c); else C.descartes.push(c); return false; });
  for (const r of C.rivales) {
    if (r.hp <= 0) continue;
    if (r.aturdido) { r.aturdido--; C.log.push(tr('{rival} está rascándose', { rival: r.nombre })); r.bloqueo = 0; dcAnuncia(C, r); continue; }
    const j = r.jug; r.bloqueo = 0;
    if (j.d) for (let k = 0; k < (j.n || 1); k++) {
      let d = dcDanoRival(C, r, j); if (C.vulnerable) d = Math.floor(d * 1.5);
      const b = Math.min(C.bloqueo, d); C.bloqueo -= b; d -= b; dcVida(-d);
      if (C.poderes.espinas) dcGolpea(C, r, C.poderes.espinas);
      if (DCP.run.hp <= 0) break;
    }
    if (j.b) r.bloqueo += j.b;
    if (j.c) for (const o of C.rivales) if (o.hp > 0) o.hp = Math.min(o.hpMax, o.hp + j.c);
    if (j.f) r.fuerza += j.f;
    if (j.debil) C.debil += j.debil;
    if (j.spam) for (let k = 0; k < j.spam; k++) C.descartes.push(dcCarta('spam'));
    if (j.ref && C.rivales.filter(x => x.hp > 0).length < 4) for (let k = 0; k < (j.refN || 1); k++) { const n = dcRival(j.ref); dcAnuncia(C, n); C.rivales.push(n); }
    if (r.debil) r.debil--; if (r.vulnerable) r.vulnerable--;
    if (DCP.run.hp <= 0) break;
    dcAnuncia(C, r);
  }
  if (!dcCompruebaFin(C)) dcEmpiezaTurno(C);
}
function dcCompruebaFin(C) {
  if (DCP.run.hp <= 0) { C.fase = 'fin'; C.resultado = 'derrota'; return true; }
  if (!C.rivales.some(r => r.hp > 0)) { C.fase = 'fin'; C.resultado = 'victoria'; DCP.run.stats.reuniones++; if (dcObjeto('almohada')) dcVida(dcObjeto('almohada').trasReunion); return true; }
  return false;
}
