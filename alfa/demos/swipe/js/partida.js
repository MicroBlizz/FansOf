// Fans of Swipe · PARTIDA: una subida a la Torre de Microblizz de principio a fin. Qué carta toca ahora, qué pasa al
// deslizarla a un lado, el turno del enemigo (con su pequeña espera para que se vea), el botín, subir de piso, caer y ganar.
// La subida se guarda entera después de cada carta (SAVE.run), así se puede cerrar el juego y seguir luego.
'use strict';
let SW_P = null;                      // la subida en curso (null = ninguna)
const SW_COLA = [];                   // pasos con espera: [{ t (segundos que faltan), fn }]
const swEspera = (t, fn) => SW_COLA.push({ t, fn });
function swAvanzaCola(dt) {
  for (const p of SW_COLA.slice()) { p.t -= dt; if (p.t <= 0) { SW_COLA.splice(SW_COLA.indexOf(p), 1); p.fn(); } }
}
// la mecha de la carta de combate que tienes delante (no se guarda: al volver a la partida empieza entera)
const SW_MECHA = { t: 5 };
function swNuevaMecha() { SW_MECHA.t = SW_P && SW_P.nodo === 'jefe' ? SW_CFG.mechaJefe : SW_CFG.mecha; SW_MECHA.ini = performance.now(); }
const swCtx = () => ({ P: SW_P, pre: SW_P.carta && SW_P.carta.pre, sim: false, fx: swFx });

function swNuevaSubida() {
  SW_P = { vida: SW_CFG.vida, vidaMax: SW_CFG.vida, oro: SW_CFG.oroInicio, fuerzaBase: 0, mazo: SW_CFG.mazoInicio.map(id => ({ id, mejor: false })),
    reliquias: [], piso: 1, mapa: swNuevoMapa(), camino: [], eventosVistos: [], elitesVistas: [], pataUsada: false,
    C: null, carta: null, cola: [], fase: 'carta', nodo: null, combates: 0 };
  SAVE.partidas++;
  // al empezar eliges una de dos reliquias deslizando (como el primer cofre de la torre)
  const a = swReliquiaLibre(SW_P); let b = swReliquiaLibre(SW_P); for (let i = 0; i < 8 && b === a; i++) b = swReliquiaLibre(SW_P);
  SW_P.cola = [];
  SW_P.carta = { tipo: 'inicio', pre: { a, b } };
  SW_P.nodo = 'inicio';
  swGuardaSubida();
}
function swGuardaSubida() { SAVE.run = SW_P && SW_P.fase !== 'fin' ? SW_P : null; swGuarda(); }
function swSigueSubida() { SW_P = SAVE.run; SW_P.fase = 'carta'; SW_COLA.length = 0; if (!SW_P.carta) { if (SW_P.C) SW_P.carta = swRoba(SW_P); else swSiguiente(); } swNuevaMecha(); swMusicaPiso(); }

/* ---------- los pisos ---------- */
function swEntraPiso() {
  const op = SW_P.mapa[SW_P.piso - 1];
  play('swPiso');
  if (op.length > 1) { SW_P.nodo = 'cruce'; SW_P.carta = swCartaCruce(SW_P); }
  else swEntraNodo(op[0]);
  swMusicaPiso();
}
function swEntraNodo(tipo) {
  const P = SW_P;
  P.camino[P.piso - 1] = tipo; P.nodo = tipo;
  switch (tipo) {
    case 'combate': case 'elite': case 'jefe': {
      let en;
      if (tipo === 'jefe') en = 'ceo';
      else if (tipo === 'elite') { const libres = SW_ELITES.filter(e => !P.elitesVistas.includes(e)); en = pick(libres.length ? libres : SW_ELITES); P.elitesVistas.push(en); }
      else en = pick(P.piso <= 6 ? SW_NORMALES_1 : SW_NORMALES_2);
      swNuevoCombate(P, en);
      P.carta = swRoba(P); swNuevaMecha();
      swAviso(tr(SW_ENEMIGOS[en].nombre), tipo === 'normal' ? '#ffffff' : '#ff8a2a');
      break;
    }
    case 'evento': P.carta = swCartaEvento(P); break;
    case 'tienda': P.cola = swCartasTienda(P); P.carta = P.cola.shift(); break;
    case 'descanso': P.carta = swCartaDescanso(P); break;
    case 'tesoro': { const r = swReliquiaLibre(P); P.carta = r ? { tipo: 'reliquia', pre: { reliquia: r } } : { tipo: 'botin', oro: 60 }; play('swCofre'); break; }
  }
  swMusicaPiso();
}
function swMusicaPiso() { swMusica(!SW_P ? 'menu' : SW_P.nodo === 'jefe' ? 'boss' : 'animales'); }
// lo que viene después de resolver una carta fuera de combate
function swSiguiente() {
  const P = SW_P;
  if (P.cola.length) { P.carta = P.cola.shift(); return; }
  P.piso++;
  if (P.piso > SW_CFG.pisos) { swVictoria(); return; }
  swEntraPiso();
}

/* ---------- elegir un lado ---------- */
// devuelve false si ese lado no se puede elegir (la carta vuelve a su sitio)
function swElige(lado) {
  const P = SW_P, carta = P.carta; if (!carta || P.fase !== 'carta') return false;
  const L = swLados(P, carta)[lado === 'L' ? 0 : 1];
  if (L.bloqueado) { play('swNoVale'); swAviso(L.porque, '#ff5a4f'); return false; }
  play('swSwipe');
  if (carta.tipo === 'inicio') {   // la reliquia de salida
    swGanaReliquia(P, lado === 'L' ? carta.pre.a : carta.pre.b, swCtx());
    P.carta = null; swEntraPiso(); swGuardaSubida();
    return true;
  }
  if (carta.tipo === 'accion') {
    // la racha: si has deslizado rápido, sube; si has tardado, vuelve a cero
    const tardas = (performance.now() - (SW_MECHA.ini || 0)) / 1000;
    if (tardas <= SW_CFG.rapido) { P.C.racha++; if (P.C.racha === SW_CFG.frenesi) { swAviso(tr('¡FRENESÍ!'), '#ff8a2a'); play('swCombo'); } }
    else P.C.racha = 0;
    const res = swJuegaAccion(P, carta, lado, swCtx());
    P.carta = null;
    if (res.muere) { P.fase = 'espera'; swEspera(0.45, swGanaCombate); return true; }
    swTurnoDelEnemigo();
    return true;
  }
  // el resto de cartas: sus efectos y, si hace falta, ir a otro sitio
  swAplica(L.ef, swCtx());
  P.carta = null;
  if (P.vida <= 0) { P.fase = 'espera'; swEspera(0.6, swCae); return true; }
  if (L.flujo && L.flujo.ir) swEntraNodo(L.flujo.ir);
  else if (carta.tipo === 'evento' || carta.tipo === 'descanso' || carta.tipo === 'tienda' || carta.tipo === 'botin' || carta.tipo === 'premio' || carta.tipo === 'reliquia' || carta.tipo === 'piso') swSiguiente();
  swGuardaSubida();
  return true;
}

// el enemigo actúa (tras tu gesto, o porque se te acabó la mecha) y vuelve a ser tu turno
function swTurnoDelEnemigo() {
  const P = SW_P;
  P.fase = 'enemigo';
  swEspera(SW_CFG.esperaEnemigo, () => {
    const r = swTurnoEnemigo(P, swCtx());
    swEspera(SW_CFG.esperaEnemigo, () => {
      if (P.vida <= 0) { swCae(); return; }
      if (r.muere) { swGanaCombate(); return; }
      P.fase = 'carta'; P.carta = swRoba(P); swNuevaMecha(); swGuardaSubida();
    });
  });
}
// se acabó la mecha: pierdes la carta, la racha y el enemigo te pega
function swMechaAgotada() {
  const P = SW_P; if (!P || !P.C || !P.carta || P.fase !== 'carta') return;
  swAviso(tr('¡Demasiado lento!'), '#ff5a4f'); play('swNoVale');
  P.C.racha = 0; P.C.hist = '';
  SW_G.dir = 0; P.carta = null;
  swTurnoDelEnemigo();
}
function swAvanzaMecha(dt) {
  const P = SW_P; if (!P || !P.C || !P.carta || P.fase !== 'carta' || SW_G.sale) return;
  const antes = SW_MECHA.t; SW_MECHA.t -= dt;
  if (SW_MECHA.t < 1.5 && Math.ceil(antes * 2) !== Math.ceil(SW_MECHA.t * 2)) play('swTic');
  if (SW_MECHA.t <= 0) swMechaAgotada();
}

/* ---------- ganar un combate, caer, llegar arriba ---------- */
function swGanaCombate() {
  const P = SW_P, E = SW_ENEMIGOS[P.C.en];
  play('swMuerte');
  P.combates++;
  if (swTieneR(P, 'r-auriculares')) { P.vida = Math.min(P.vidaMax, P.vida + 4); swFx('cura', { n: 4 }); }
  if (E.tipo === 'jefe') { P.C = null; swEspera(0.8, swVictoria); P.fase = 'espera'; return; }
  const oro = swOroCombate(P);
  P.C = null;
  const premio = swCartaPremio(P);
  P.cola = [{ tipo: 'premio', pre: { carta: premio } }];
  if (E.tipo === 'elite') { const r = swReliquiaLibre(P); if (r) P.cola.push({ tipo: 'reliquia', pre: { reliquia: r } }); }
  P.carta = { tipo: 'botin', oro };
  P.fase = 'carta';
  swGuardaSubida();
}
function swCae() {
  const P = SW_P;
  P.fase = 'fin'; P.carta = null;
  SAVE.record = Math.max(SAVE.record, P.piso);
  SAVE.run = null; swGuarda();
  swSintonia('lose');
  swPantallaFin(false);
}
function swVictoria() {
  const P = SW_P;
  P.fase = 'fin'; P.carta = null;
  SAVE.record = Math.max(SAVE.record, SW_CFG.pisos); SAVE.victorias++;
  SAVE.run = null; swGuarda();
  swSintonia('win');
  swPantallaFin(true);
}
