// Fans of Swipe · COMBATE: las reglas puras. Los efectos (daño, escudo, caos, veneno, congelar…), el turno del enemigo con su
// intención visible, los combos de deslizar (las reliquias que miran tus últimos gestos) y la simulación que enseña,
// mientras arrastras la carta, cómo quedarían los números si la soltaras. Nada de dibujo aquí: lo pinta js/pintar.js.
'use strict';
const swTieneR = (P, id) => P.reliquias.includes(id);
const swMejor = (n, mejor) => (mejor ? Math.round(n * SW_CFG.mejora) : n);

/* ---------- el combate ---------- */
function swNuevoCombate(P, enemigo) {
  const E = SW_ENEMIGOS[enemigo];
  const vida = E.tipo === 'jefe' ? E.vida : Math.round(E.vida * (1 + SW_CFG.subePiso * Math.max(0, P.piso - 1)));   // el jefe no crece con el piso
  const robo = shuffle(P.mazo.map((c, i) => i));
  P.C = { en: enemigo, vida, vidaMax: vida, escudo: 0, veneno: swTieneR(P, 'r-calcetin') ? 3 : 0, congelado: swTieneR(P, 'r-reloj') ? 1 : 0, debil: 0, fuerzaE: 0,
    int: 0, turno: 1, hist: '', escudoJ: 0, caos: Math.min(SW_CFG.caosMax, SW_CFG.caosInicio + (swTieneR(P, 'r-pila') ? 1 : 0)), fuerza: 0, robo, descarte: [], racha: 0 };
}
// la siguiente carta de acción del mazo (se baraja el descarte cuando se acaba)
function swRoba(P) {
  const C = P.C;
  if (!C.robo.length) { C.robo = shuffle(C.descarte); C.descarte = []; }
  const i = C.robo.pop();
  C.descarte.push(i);
  const c = P.mazo[i];
  return { tipo: 'accion', id: c.id, mejor: !!c.mejor };
}
function swFuerza(P) { return (P.C ? P.C.fuerza : 0) + P.fuerzaBase + (swTieneR(P, 'r-capa') ? 1 : 0); }
// lo que hará el enemigo este turno, con las cifras ya calculadas (fuerza, debilidad)
function swIntencion(P) {
  const C = P.C, E = SW_ENEMIGOS[C.en], I = E.int[C.int % E.int.length];
  const atq = I.atq ? Math.max(0, Math.round((I.atq + C.fuerzaE) * (C.debil ? 0.75 : 1))) : 0;
  return { ...I, atq, k: I.k || 1, congelado: C.congelado > 0 };
}

/* ---------- los efectos ---------- */
// ctx: { P, pre (lo sorteado al crear la carta), sim (true = solo se calcula), lado ('L'/'R'), fx (función para los efectos visuales) }
function swDanoJugador(P, n, ctx) {
  let d = n + swFuerza(P) + (swTieneR(P, 'r-grapadora') ? 1 : 0);
  if (P.C && P.C.racha >= SW_CFG.frenesi) d = Math.round(d * SW_CFG.frenesiDano);
  if (!ctx.sim && swTieneR(P, 'r-dado') && Math.random() < 0.15) { d *= 2; ctx.fx && ctx.fx('critico'); }
  return Math.max(0, d);
}
function swGolpeaEnemigo(P, d, ctx) {
  const C = P.C; if (!C) return;
  const para = Math.min(C.escudo, d); C.escudo -= para; const real = d - para; C.vida = Math.max(0, C.vida - real);
  ctx.fx && ctx.fx('golpe', { d: real, para });
}
function swHiereJugador(P, d, ctx, directo = false) {
  let real = d;
  if (!directo && P.C) { const para = Math.min(P.C.escudoJ, d); P.C.escudoJ -= para; real = d - para; if (para) ctx.fx && ctx.fx('bloqueo', { para }); }
  P.vida -= real;
  if (P.vida <= 0 && swTieneR(P, 'r-pata') && !P.pataUsada && !ctx.sim) { P.vida = 1; P.pataUsada = true; ctx.fx && ctx.fx('pata'); }
  if (real > 0) ctx.fx && ctx.fx('herida', { d: real });
}
function swAplica(lista, ctx) {
  const P = ctx.P;
  for (const e of lista) {
    const n = e.n;
    switch (e.t) {
      case 'dano': { const k = e.k || 1; for (let i = 0; i < k; i++) swGolpeaEnemigo(P, swDanoJugador(P, n, ctx), ctx); break; }
      case 'danoEscudo': if (P.C) swGolpeaEnemigo(P, P.C.escudoJ + swFuerza(P), ctx); break;
      case 'escudo': if (P.C) { P.C.escudoJ += n; ctx.fx && ctx.fx('escudo', { n }); } break;
      case 'cura': { const antes = P.vida; P.vida = Math.min(P.vidaMax, P.vida + n); if (P.vida > antes) ctx.fx && ctx.fx('cura', { n: P.vida - antes }); break; }
      case 'caos': if (P.C) { P.C.caos = clamp(P.C.caos + n, 0, SW_CFG.caosMax); ctx.fx && ctx.fx('caos', { n }); } break;
      case 'veneno': if (P.C) { P.C.veneno += n; ctx.fx && ctx.fx('veneno', { n }); } break;
      case 'congela': if (P.C) { P.C.congelado = Math.max(P.C.congelado, 1); ctx.fx && ctx.fx('congela'); } break;
      case 'debil': if (P.C) P.C.debil = Math.max(P.C.debil, n); break;
      case 'fuerza': if (P.C) P.C.fuerza += n; break;
      case 'fuerzaBase': P.fuerzaBase += n; break;
      case 'oro': { const g = Math.round(n * (swTieneR(P, 'r-corbata') ? 1.3 : 1)); P.oro += g; ctx.fx && ctx.fx('oro', { n: g }); break; }
      case 'pagar': P.oro -= n; break;
      case 'herida': swHiereJugador(P, n, ctx, true); break;
      case 'vidaMax': P.vidaMax += n; P.vida += n; break;
      case 'reliquia': if (ctx.pre && ctx.pre.reliquia) swGanaReliquia(P, ctx.pre.reliquia, ctx); break;
      case 'carta': if (ctx.pre && ctx.pre.carta) { P.mazo.push({ id: ctx.pre.carta, mejor: false }); ctx.fx && ctx.fx('carta'); } break;
      case 'mejora': if (ctx.pre && ctx.pre.mejora != null && P.mazo[ctx.pre.mejora]) { P.mazo[ctx.pre.mejora].mejor = true; ctx.fx && ctx.fx('mejora'); } break;
      case 'quita': if (ctx.pre && ctx.pre.quita != null && P.mazo.length > 3) { P.mazo.splice(ctx.pre.quita, 1); ctx.fx && ctx.fx('quita'); } break;
      case 'azar': if (!ctx.sim) swAplica(Math.random() < e.p ? e.si : e.no, ctx); break;
    }
  }
}
function swGanaReliquia(P, id, ctx) {
  if (P.reliquias.includes(id)) return;
  P.reliquias.push(id);
  if (id === 'r-zanahoria') { P.vidaMax += 8; P.vida += 8; }
  if (!ctx.sim) { SAVE.vistas[id] = 1; ctx.fx && ctx.fx('reliquia', { id }); }
}
// reliquias que nadie tiene aún (para sortear)
function swReliquiaLibre(P) { const libres = Object.keys(SW_RELIQUIAS).filter(k => !P.reliquias.includes(k)); return libres.length ? pick(libres) : null; }

/* ---------- los lados de una carta de acción ---------- */
function swEfMejor(ef, mejor) { return ef.map(e => (e.n != null && e.t !== 'caos' ? { ...e, n: swMejor(e.n, mejor) } : e)); }
function swLadoAccion(P, carta, lado) {
  const D = SW_CARTAS[carta.id], L = D[lado === 'L' ? 'izq' : 'der'];
  const coste = L.coste || 0, ef = swEfMejor(L.ef, carta.mejor);
  const sinCaos = P.C && P.C.caos < coste;
  return { nombre: L.nombre, mas: !!carta.mejor, coste, ef: coste ? [{ t: 'caos', n: -coste }, ...ef] : ef, icono: D.arte[lado === 'L' ? 0 : 1],
    bloqueado: sinCaos, porque: sinCaos ? tr('Te falta caos') : '' };
}

/* ---------- los combos de deslizar ---------- */
const SW_COMBOS = [
  { r: 'r-hielo', fin: ['LLL'], nombre: 'Congelación', ef: [{ t: 'congela' }] },
  { r: 'r-post', fin: ['RRR'], nombre: 'Pósit salvador', ef: [{ t: 'caos', n: 1 }, { t: 'cura', n: 2 }] },
  { r: 'r-silla', fin: ['LRL', 'RLR'], nombre: 'Giro de silla', ef: [{ t: 'escudo', n: 4 }] },
  { r: 'r-mando', fin: ['LLR'], nombre: 'Código secreto', ef: [{ t: 'dano', n: 8 }] },
];
function swComboQueSale(P, hist) { return SW_COMBOS.find(cb => swTieneR(P, cb.r) && cb.fin.some(f => hist.endsWith(f))) || null; }

/* ---------- un turno entero: tu gesto y lo que hace el enemigo ---------- */
// devuelve { muere: enemigo derrotado, combo }
function swJuegaAccion(P, carta, lado, ctx) {
  const C = P.C, S = swLadoAccion(P, carta, lado);
  swAplica(S.ef, ctx);
  C.hist = (C.hist + lado).slice(-3);
  const combo = swComboQueSale(P, C.hist);
  if (combo) { swAplica(combo.ef, ctx); C.hist = ''; if (!ctx.sim) ctx.fx && ctx.fx('combo', { nombre: combo.nombre }); }
  return { muere: C.vida <= 0, combo };
}
function swTurnoEnemigo(P, ctx) {
  const C = P.C, E = SW_ENEMIGOS[C.en];
  if (C.congelado > 0) { C.congelado--; ctx.fx && ctx.fx('sigueCongelado'); }
  else {
    const I = swIntencion(P);
    if (I.def) { C.escudo += I.def; ctx.fx && ctx.fx('enemigoEscudo', { n: I.def }); }
    if (I.cura) { C.vida = Math.min(C.vidaMax, C.vida + I.cura); ctx.fx && ctx.fx('enemigoCura', { n: I.cura }); }
    if (I.fuerza) C.fuerzaE += I.fuerza;
    if (I.caos) C.caos = Math.max(0, C.caos - I.caos);
    if (I.roba) { const r = Math.min(P.oro, I.roba); P.oro -= r; if (r) ctx.fx && ctx.fx('robaOro', { n: r }); }
    if (I.atq) for (let i = 0; i < I.k; i++) { if (P.vida <= 0) break; swHiereJugador(P, I.atq, ctx); ctx.fx && ctx.fx('ataqueEnemigo', { i }); }
    C.int++;
  }
  if (C.veneno > 0 && C.vida > 0) { C.vida = Math.max(0, C.vida - C.veneno); ctx.fx && ctx.fx('tickVeneno', { n: C.veneno }); C.veneno--; }
  if (C.debil > 0) C.debil--;
  // empieza tu turno: el escudo se gasta y llega el caos
  C.escudo = 0;
  C.escudoJ = 0;
  C.turno++;
  C.caos = Math.min(SW_CFG.caosMax, C.caos + SW_CFG.caosPorTurno + (swTieneR(P, 'r-taza') && C.turno % 3 === 0 ? 1 : 0));
  return { muere: C.vida <= 0, muerto: P.vida <= 0 };
}
function swOroCombate(P) {
  const E = SW_ENEMIGOS[P.C.en];
  let o = Math.round(rand(E.oro[0], E.oro[1] + 1));
  if (E.tipo === 'elite' && swTieneR(P, 'r-trofeo')) o *= 2;
  if (swTieneR(P, 'r-iman')) o += 6;
  if (P.C.racha >= SW_CFG.frenesi) o = Math.round(o * SW_CFG.frenesiOro);
  return o;
}

/* ---------- la previsión (mientras arrastras) ---------- */
// copia la partida, aplica el lado sin azar y devuelve las diferencias que hay que enseñar
function swPrevision(P, carta, lado) {
  const S = swLados(P, carta)[lado === 'L' ? 0 : 1];
  if (S.bloqueado) return null;
  const Q = JSON.parse(JSON.stringify(P)), ctx = { P: Q, pre: carta.pre, sim: true };
  let combo = null;
  if (carta.tipo === 'accion') { combo = swJuegaAccion(Q, carta, lado, ctx).combo; }
  else swAplica(S.ef, ctx);
  const d = { vida: Q.vida - P.vida, oro: Q.oro - P.oro, vidaMax: Q.vidaMax - P.vidaMax, combo: combo && combo.nombre };
  if (P.C && Q.C) { d.enemigo = P.C.vida - Q.C.vida; d.escudoE = Q.C.escudo - P.C.escudo; d.escudo = Q.C.escudoJ - P.C.escudoJ; d.caos = Q.C.caos - P.C.caos; d.veneno = Q.C.veneno - P.C.veneno; d.congela = Q.C.congelado > P.C.congelado; d.mata = Q.C.vida <= 0; }
  return d;
}
